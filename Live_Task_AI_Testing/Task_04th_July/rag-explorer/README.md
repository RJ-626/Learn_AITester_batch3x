# RAG Explorer — Task 04th July (v1.1.0)

An end-to-end **Retrieval-Augmented Generation (RAG)** demo built with:

- **React + Vite** frontend
- **Express** backend
- **Multi-source ingestion**: PDF, text files (TXT, MD, CSV, JSON, code files), and **webpage URLs**
- **Simple text splitter** for chunking (1200 chars / 200 overlap)
- **Ollama + nomic-embed-text** for embeddings (768-dim) — with hash-based fallback for environments without Ollama
- **ChromaDB** for local vector storage — with in-memory fallback for environments without ChromaDB
- **Groq** (`openai/gpt-oss-120b`) for answer generation
- **24/7 Production-ready** — single-command start, Windows service support, autostart scripts

The app visualises the full pipeline: **Document → Chunks → Embeddings → Vector Store → Query → Retrieve Top-4 → LLM Answer**.

---

## What's new in v1.1.0

1. **Multi-source ingestion**
   - Upload **any file**: PDF, TXT, MD, CSV, JSON, HTML, and 30+ code file extensions
   - Paste a **webpage URL** — the server fetches the page, strips HTML tags via Cheerio, and indexes the text
2. **Production mode**
   - `npm start` runs a single Express server that serves both the API and the built React frontend
   - No need to run Vite dev server for daily use
3. **24/7 hosting scripts for Windows**
   - `start-production.bat` — builds and starts the server
   - `start-silent.vbs` — starts the server with **no console window** (background)
   - `setup-autostart.ps1` — adds the silent starter to your **Windows Startup folder**
   - `install-windows-service.cjs` / `uninstall-windows-service.cjs` — registers the server as a **Windows Service** that runs even when no user is logged in
4. **Health check endpoint** (`GET /api/health`) for uptime monitoring

---

## Prerequisites

1. **Node.js 20+** and npm
2. **Groq API key** from [https://console.groq.com](https://console.groq.com) (required)
3. *(Optional for better quality)* **Ollama** installed and running with `nomic-embed-text` pulled:
   ```bash
   ollama pull nomic-embed-text
   ollama serve
   ```
4. *(Optional for persistence)* **ChromaDB** running locally on port **8000**:
   ```bash
   pip install chromadb
   chroma run --path ./chroma-data
   ```
   Or via Docker:
   ```bash
   docker run -d -p 8000:8000 chromadb/chroma:latest
   ```

> **Note:** The app has **built-in fallbacks**. If Ollama or ChromaDB are not available, it uses hash-based embeddings and an in-memory vector store. This means the app **works out of the box** even without them — just with slightly lower embedding quality and no persistence across restarts.

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

## Run (Development)

Starts the Express API (`:3001`) and the Vite React dev server (`:5173`) together:

```bash
npm run dev
```

Open the UI at **http://localhost:5173**

---

## Run (Production / 24x7)

Build the frontend once, then start the production server:

```bash
npm run build
npm start
```

Open the UI at **http://localhost:3001**

The Express server now serves the built React app automatically. Only **one** process needs to run.

---

### Option A: Run silently in background (no console window)

Double-click or run:
```powershell
.\start-silent.vbs
```

### Option B: Add to Windows Startup (auto-start on login)

```powershell
.\setup-autostart.ps1
```

### Option C: Install as a Windows Service (runs 24/7, even without login)

```bash
npm run install-service
```

To remove the service later:
```bash
npm run uninstall-service
```

> **Note:** Installing a Windows service requires Administrator privileges.

---

## How to use

1. **Choose a source** in the left panel:
   - Click **Ingest VWO PRD** — reads the built-in `data/vwo-prd.pdf`
   - **Upload File** — select any PDF, TXT, MD, CSV, JSON, code file, etc., then click **Upload & Ingest**
   - **Webpage URL** — paste any URL (e.g., `https://example.com/article`), then click **Ingest URL**
2. Watch the pipeline visualiser light up step by step.
3. Once ingestion is complete, type a question in the query box, e.g.:
   - *"What is the goal of VWO?"*
   - *"List the key features mentioned in the PRD."*
   - *"Summarize the main points from this article."*
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
| `POST` | `/api/ingest` | Upload and ingest **any file** (multipart) |
| `POST` | `/api/ingest-url` | Ingest a webpage by URL (JSON body: `{ url }`) |
| `GET`  | `/api/ingest-status` | Poll current ingestion state |
| `POST` | `/api/reset` | Reset ingestion state |
| `POST` | `/api/query` | Ask a question — returns answer + top-4 chunks |
| `GET`  | `/api/health` | Health check — returns `{ status: 'ok', uptime }` |

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
│       ├── parser.js      # Unified parser (PDF, text files, URLs)
│       ├── chunk.js       # Text splitter
│       ├── embed.js       # Ollama embedding client (with hash fallback)
│       ├── chroma.js      # ChromaDB wrapper (with in-memory fallback)
│       └── groq.js        # Groq LLM client
├── src/
│   ├── App.jsx            # Main React app
│   ├── main.jsx           # Entry point
│   ├── styles.css         # Dark theme UI
│   └── components/
│       ├── Pipeline.jsx   # Step visualiser
│       └── ChunkList.jsx  # Retrieved chunks display
├── dist/                  # Production build (generated by `npm run build`)
├── data/
│   └── vwo-prd.pdf        # Source document
├── .env.example
├── package.json
├── vite.config.js
├── index.html
├── start-production.bat   # Production start script
├── start-silent.vbs       # Silent background starter
├── setup-autostart.ps1    # Add to Windows Startup
├── install-windows-service.cjs
└── uninstall-windows-service.cjs
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Ollama embed error` | Make sure Ollama is running: `ollama serve` and `ollama pull nomic-embed-text`. The app **falls back** to hash-based embeddings if Ollama is offline. |
| `ChromaDB connection failed` | Start ChromaDB: `chroma run --path ./chroma-data` or Docker. The app **falls back** to an in-memory store if ChromaDB is offline. |
| `Groq API error` | Check your `GROQ_API_KEY` in `.env` |
| Port 3001 already in use | Kill the existing process or change `PORT` in `.env` |
| Windows Service install fails | Run PowerShell / CMD as **Administrator** |

---

## Tech Stack Summary

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | Express 4 |
| PDF Parsing | pdf-parse |
| URL Parsing | fetch + cheerio |
| Chunking | Simple overlap splitter |
| Embeddings | Ollama (`nomic-embed-text`) with hash fallback |
| Vector DB | ChromaDB with in-memory fallback |
| LLM | Groq (`openai/gpt-oss-120b`) |
| Hosting | Windows Service / Startup / Background scripts |

---

Built for **Learn_AITester_batch3x** — Task 04th July.
