# RAG Explorer — Task 04th July

An end-to-end **Retrieval-Augmented Generation (RAG)** demo built with:

- **React + Vite** frontend
- **Express** backend
- **pdf-parse** for PDF ingestion
- **Simple text splitter** for chunking (1200 chars / 200 overlap)
- **Ollama + nomic-embed-text** for embeddings (768-dim)
- **ChromaDB** for local vector storage
- **Groq** (`openai/gpt-oss-120b`) for answer generation

The app visualises the full pipeline: **PDF → Chunks → Embeddings → Vector Store → Query → Retrieve Top-4 → LLM Answer**.

---

## Prerequisites

1. **Node.js 20+** and npm
2. **Ollama** installed and running with `nomic-embed-text` pulled:
   ```bash
   ollama pull nomic-embed-text
   ollama serve
   ```
3. **ChromaDB** running locally on port **8000**:
   ```bash
   pip install chromadb
   chroma run --path ./chroma-data
   ```
   Or via Docker:
   ```bash
   docker run -d -p 8000:8000 chromadb/chroma:latest
   ```
4. **Groq API key** from [https://console.groq.com](https://console.groq.com)

---

## Setup

```bash
cd Live_Task_AI_Testing/Task_04th_July/rag-explorer
npm install
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

---

## Run

Starts the Express API (`:3001`) and the Vite React dev server (`:5173`) together:

```bash
npm run dev
```

Open the UI at **http://localhost:5173**

---

## How to use

1. Click **Ingest VWO PRD** — this reads `../data/vwo-prd.pdf`, chunks it, embeds it via Ollama, and stores in ChromaDB.
2. Watch the pipeline visualiser light up step by step.
3. Once ingestion is complete, type a question in the query box, e.g.:
   - *"What is the goal of VWO?"*
   - *"List the key features mentioned in the PRD."*
   - *"What are the acceptance criteria?"*
4. The app will:
   - Embed your question using the **same** Nomic Embed model
   - Retrieve the **top 4** most similar chunks from ChromaDB
   - Send them + your question to **Groq (openai/gpt-oss-120b)**
   - Display the final answer and the retrieved chunks with similarity scores

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ingest-default` | Ingest the built-in `data/vwo-prd.pdf` |
| `POST` | `/api/ingest` | Upload any PDF (multipart) |
| `GET`  | `/api/ingest-status` | Poll current ingestion state |
| `POST` | `/api/query` | Ask a question — returns answer + top-4 chunks |

---

## Data Source

`../data/vwo-prd.pdf` — Product Requirements Document for **VWO.com** (copied from `chapter_07_RAG/Basic_RAG/data/`).

---

## Project Structure

```
rag-explorer/
├── server/
│   ├── index.js           # Express app
│   └── lib/
│       ├── pdf.js         # PDF parser
│       ├── chunk.js       # Text splitter
│       ├── embed.js       # Ollama embedding client
│       ├── chroma.js      # ChromaDB wrapper
│       └── groq.js        # Groq LLM client
├── src/
│   ├── App.jsx            # Main React app
│   ├── main.jsx           # Entry point
│   ├── styles.css         # Dark theme UI
│   └── components/
│       ├── Pipeline.jsx   # Step visualiser
│       └── ChunkList.jsx  # Retrieved chunks display
├── data/
│   └── vwo-prd.pdf        # Source document
├── .env.example
├── package.json
├── vite.config.js
└── index.html
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Ollama embed error` | Make sure Ollama is running: `ollama serve` and `ollama pull nomic-embed-text` |
| `ChromaDB connection failed` | Start ChromaDB: `chroma run --path ./chroma-data` or Docker |
| `Groq API error` | Check your `GROQ_API_KEY` in `.env` |

---

## Tech Stack Summary

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | Express 4 |
| PDF Parsing | pdf-parse |
| Chunking | Simple overlap splitter |
| Embeddings | Ollama (`nomic-embed-text`) |
| Vector DB | ChromaDB |
| LLM | Groq (`openai/gpt-oss-120b`) |

---

Built for **Learn_AITester_batch3x** — Task 04th July.
