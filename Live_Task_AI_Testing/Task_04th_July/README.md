# Task 04th July — RAG Explorer (v1.1.0)

This folder contains the **RAG Explorer** application: an end-to-end Retrieval-Augmented Generation pipeline demo.

## What's inside

- **`data/vwo-prd.pdf`** — Product Requirements Document for VWO.com (source document)
- **`rag-explorer/`** — Full React + Express application
  - **Multi-source ingestion**: PDF, text files (TXT, MD, CSV, JSON, code files), and **webpage URLs**
  - PDF ingestion, chunking, embedding (Nomic Embed via Ollama), ChromaDB storage
  - Query interface with top-4 chunk retrieval
  - Groq LLM (`openai/gpt-oss-120b`) for answer generation
  - Visual pipeline showing every step
  - **24/7 production-ready** with Windows service / autostart scripts

## Quick Start

```bash
cd rag-explorer
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm run build
npm start
```

Open **http://localhost:3001**

For development (hot-reload):
```bash
npm run dev   # opens http://localhost:5173
```

## 24/7 Hosting Options

1. **Background (no console window)**: double-click `rag-explorer/start-silent.vbs`
2. **Auto-start on login**: run `rag-explorer/setup-autostart.ps1`
3. **Windows Service (runs even without login)**: run `npm run install-service` inside `rag-explorer/`

See `rag-explorer/README.md` for full setup instructions, prerequisites, and troubleshooting.

## Prerequisites

- Node.js 20+
- Ollama running with `nomic-embed-text` (optional — fallback available)
- ChromaDB running on port 8000 (optional — fallback available)
- Groq API key

## RAG Flow

```
Document (PDF / Text File / URL)
  → Parse text
  → Chunk (1200 chars / 200 overlap)
  → Embed with Nomic Embed (Ollama)
  → Store in ChromaDB
  → Query → Embed question
  → Retrieve top-4 chunks by cosine similarity
  → Groq (openai/gpt-oss-120b) generates answer
```

Built for **Learn_AITester_batch3x**.
