import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { parsePdf } from './lib/pdf.js';
import { chunkText } from './lib/chunk.js';
import { embedChunks, embedQuery } from './lib/embed.js';
import { initChroma, storeChunks, retrieve } from './lib/chroma.js';
import { askGroq } from './lib/groq.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, 'uploads') });

// Ingestion state for demo
let ingestionState = {
  status: 'idle', // idle | parsing | chunking | embedding | storing | done
  filename: null,
  totalChunks: 0,
  collectionName: 'rag-collection',
};

// ── INGESTION ─────────────────────────────────────────────────────

// Ingest the built-in VWO PRD
app.post('/api/ingest-default', async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, '..', '..', 'data', 'vwo-prd.pdf');
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'Default PDF not found at data/vwo-prd.pdf' });
    }

    ingestionState = { status: 'parsing', filename: 'vwo-prd.pdf', totalChunks: 0, collectionName: 'rag-collection' };

    // 1. Parse PDF
    const text = await parsePdf(pdfPath);

    // 2. Chunk
    ingestionState.status = 'chunking';
    const chunks = chunkText(text, 1200, 200);
    ingestionState.totalChunks = chunks.length;

    // 3. Embed
    ingestionState.status = 'embedding';
    const embeddings = await embedChunks(chunks);

    // 4. Store in ChromaDB
    ingestionState.status = 'storing';
    const collection = await initChroma(ingestionState.collectionName);
    await storeChunks(collection, chunks, embeddings);

    ingestionState.status = 'done';

    res.json({
      success: true,
      filename: 'vwo-prd.pdf',
      totalChunks: chunks.length,
      chunkSize: 1200,
      overlap: 200,
      embeddingModel: 'nomic-embed-text (Ollama)',
      vectorStore: 'ChromaDB (local)',
    });
  } catch (err) {
    ingestionState.status = 'error';
    console.error('Ingestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload + ingest any PDF
app.post('/api/ingest', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    const pdfPath = req.file.path;
    ingestionState = { status: 'parsing', filename: req.file.originalname, totalChunks: 0, collectionName: 'rag-collection' };

    const text = await parsePdf(pdfPath);
    ingestionState.status = 'chunking';
    const chunks = chunkText(text, 1200, 200);
    ingestionState.totalChunks = chunks.length;

    ingestionState.status = 'embedding';
    const embeddings = await embedChunks(chunks);

    ingestionState.status = 'storing';
    const collection = await initChroma(ingestionState.collectionName);
    await storeChunks(collection, chunks, embeddings);

    ingestionState.status = 'done';

    // cleanup upload
    fs.unlinkSync(pdfPath);

    res.json({
      success: true,
      filename: req.file.originalname,
      totalChunks: chunks.length,
      chunkSize: 1200,
      overlap: 200,
      embeddingModel: 'nomic-embed-text (Ollama)',
      vectorStore: 'ChromaDB (local)',
    });
  } catch (err) {
    ingestionState.status = 'error';
    console.error('Ingestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get ingestion status
app.get('/api/ingest-status', (req, res) => {
  res.json(ingestionState);
});

// ── QUERY ─────────────────────────────────────────────────────────

app.post('/api/query', async (req, res) => {
  try {
    const { question, topK = 4 } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const collection = await initChroma(ingestionState.collectionName);

    // 1. Embed query
    const queryEmbedding = await embedQuery(question);

    // 2. Retrieve top-k chunks
    const results = await retrieve(collection, queryEmbedding, topK);

    // 3. Build augmented prompt
    const context = results.map((r, i) => `[Chunk ${i + 1}]\n${r.text}`).join('\n\n---\n\n');
    const prompt = `You are a helpful assistant. Use ONLY the following retrieved document chunks to answer the user's question. If the answer is not in the chunks, say "I don't have enough information from the document."\n\n--- DOCUMENT CHUNKS ---\n\n${context}\n\n--- USER QUESTION ---\n\n${question}`;

    // 4. Ask Groq
    const answer = await askGroq(prompt);

    res.json({
      question,
      answer,
      topK,
      chunks: results,
      model: 'openai/gpt-oss-120b (Groq)',
      embeddingModel: 'nomic-embed-text (Ollama)',
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── START ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`RAG Explorer server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/ingest-default  - ingest the built-in VWO PRD`);
  console.log(`  POST /api/ingest          - upload and ingest any PDF`);
  console.log(`  GET  /api/ingest-status   - check ingestion state`);
  console.log(`  POST /api/query           - ask a question`);
});
