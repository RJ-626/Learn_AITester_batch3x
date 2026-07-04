import { useState, useEffect } from 'react';
import Pipeline from './components/Pipeline';
import ChunkList from './components/ChunkList';

const STEPS = [
  { id: 'pdf', label: 'PDF Ingestion', desc: 'Read the Product Requirements Document from the data folder' },
  { id: 'chunk', label: 'Chunking', desc: 'Split the document into overlapping text chunks (1200 chars, 200 overlap)' },
  { id: 'embed', label: 'Embedding', desc: 'Generate 768-dim vectors using Nomic Embed via Ollama' },
  { id: 'store', label: 'Vector Store', desc: 'Store embeddings in local ChromaDB collection' },
  { id: 'query', label: 'Query & Retrieve', desc: 'Embed the question, find top-4 similar chunks by cosine distance' },
  { id: 'answer', label: 'Answer Generation', desc: 'Groq (openai/gpt-oss-120b) generates the final grounded answer' },
];

export default function App() {
  const [status, setStatus] = useState('idle');
  const [ingesting, setIngesting] = useState(false);
  const [query, setQuery] = useState('');
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Poll ingestion status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/ingest-status');
        const data = await res.json();
        setStatus(data.status);
      } catch {
        // ignore polling errors
      }
    }, 800);
    return () => clearInterval(poll);
  }, []);

  async function handleIngestDefault() {
    setIngesting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ingest-default', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ingestion failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setIngesting(false);
    }
  }

  async function handleQuery(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setQuerying(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, topK: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuerying(false);
    }
  }

  const isIngested = status === 'done';

  return (
    <div className="app">
      <header className="app-header">
        <h1>RAG Explorer</h1>
        <p className="subtitle">Task 04th July — End-to-end RAG pipeline demo</p>
      </header>

      <main className="container">
        {/* Pipeline Visualizer */}
        <section className="card pipeline-card">
          <h2>RAG Pipeline</h2>
          <Pipeline steps={STEPS} activeStep={status} />
        </section>

        {/* Ingestion */}
        <section className="card">
          <h2>1. Document Ingestion</h2>
          <p className="hint">
            Source: <code>data/vwo-prd.pdf</code> — Product Requirements Document for VWO.com
          </p>
          <button
            className="btn primary"
            onClick={handleIngestDefault}
            disabled={ingesting || isIngested}
          >
            {ingesting ? 'Ingesting…' : isIngested ? 'Ingested ✓' : 'Ingest VWO PRD'}
          </button>
          {status === 'error' && <div className="badge error">Ingestion failed</div>}
          {isIngested && (
            <div className="badge success">
              Document ingested — {status.totalChunks || 'N/A'} chunks stored in ChromaDB
            </div>
          )}
        </section>

        {/* Query */}
        <section className="card">
          <h2>2. Ask a Question</h2>
          <form onSubmit={handleQuery} className="query-form">
            <input
              type="text"
              className="query-input"
              placeholder="e.g. What is the goal of VWO?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={querying || !isIngested}
            />
            <button
              type="submit"
              className="btn primary"
              disabled={querying || !isIngested}
            >
              {querying ? 'Asking Groq…' : 'Ask'}
            </button>
          </form>
          {!isIngested && (
            <p className="hint warn">Ingest the document first to enable querying.</p>
          )}
        </section>

        {/* Error */}
        {error && (
          <section className="card error-card">
            <h3>Error</h3>
            <pre>{error}</pre>
          </section>
        )}

        {/* Results */}
        {result && (
          <section className="card result-card">
            <h2>Answer</h2>
            <div className="answer-box">
              <div className="meta">
                <span className="badge">Model: {result.model}</span>
                <span className="badge">Embedding: {result.embeddingModel}</span>
                <span className="badge">Chunks used: {result.topK}</span>
              </div>
              <div className="answer-text">{result.answer}</div>
            </div>

            <h3>Top {result.topK} Retrieved Chunks</h3>
            <ChunkList chunks={result.chunks} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for Learn_AITester_batch3x — Task 04th July</p>
      </footer>
    </div>
  );
}
