# Task 04th July — RAG Explorer

This folder contains the **RAG Explorer** application: an end-to-end Retrieval-Augmented Generation pipeline demo.

## What's inside

- **`data/vwo-prd.pdf`** — Product Requirements Document for VWO.com (source document)
- **`rag-explorer/`** — Full React + Express application
  - PDF ingestion, chunking, embedding (Nomic Embed via Ollama), ChromaDB storage
  - Query interface with top-4 chunk retrieval
  - Groq LLM (`openai/gpt-oss-120b`) for answer generation
  - Visual pipeline showing every step

## Quick Start

```bash
cd rag-explorer
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm run dev
```

Open **http://localhost:5173**

See `rag-explorer/README.md` for full setup instructions, prerequisites, and troubleshooting.

## Prerequisites

- Node.js 20+
- Ollama running with `nomic-embed-text`
- ChromaDB running on port 8000
- Groq API key

## RAG Flow

```
PDF (data/vwo-prd.pdf)
  → Parse text
  → Chunk (1200 chars / 200 overlap)
  → Embed with Nomic Embed (Ollama)
  → Store in ChromaDB
  → Query → Embed question
  → Retrieve top-4 chunks by cosine similarity
  → Groq (openai/gpt-oss-120b) generates answer
```

Built for **Learn_AITester_batch3x**.
