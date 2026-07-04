import { useState, useEffect } from 'react';
import Pipeline from './components/Pipeline';
import ChunkList from './components/ChunkList';

const STEPS = [
  { id: 'idle', label: 'Ready', desc: 'Click Ingest to start the pipeline' },
  { id: 'parsing', label: 'PDF Ingestion', desc: 'Reading the Product Requirements Document' },
  { id: 'chunking', label: 'Chunking', desc: 'Splitting into overlapping text chunks (1200 chars, 200 overlap)' },
  { id: 'embedding', label: 'Embedding', desc: 'Generating 768-dim vectors via Nomic Embed (Ollama)' },
  { id: 'storing', label: 'Vector Store', desc: 'Saving embeddings to local ChromaDB collection' },
  { id: 'done', label: 'Ready to Query', desc: 'Document indexed — ask a question' },
];

export default function App() {
  const [status, setStatus] = useState('idle');
  const [totalChunks, setTotalChunks] = useState(0);
  const [ingesting, setIngesting] = useState(false);
  const [query, setQuery] = useState('');
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/ingest-status');
        const data = await res.json();
        setStatus(data.status);
        setTotalChunks(data.totalChunks || 0);
        setServerReady(true);
      } catch {
        setServerReady(false);
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
      setTotalChunks(data.totalChunks);
    } catch (err) {
      setError(err.message);
    } finally {
      setIngesting(false);
    }
  }

  async function handleReset() {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setResult(null);
      setError(null);
      setQuery('');
    } catch (err) {
      setError(err.message);
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
        body: JSON.stringify({ question: query.trim(), topK: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Query failed (${res.status})`);
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

      {!serverReady && (
        <div className="banner error">
          <strong>⚠ Server Offline</strong> — Cannot reach Express API at <code>localhost:3001</code>. Run <code>npm run server</code>.
        </div>
      )}

      <main className="layout">
        {/* LEFT PANEL — Ingestion + Pipeline */}
        <aside className="panel left">
          <section className="card">
            <h2>📄 Document Ingestion</h2>
            <p className="hint">
              Source: <code>data/vwo-prd.pdf</code> — VWO Product Requirements Document
            </p>

            <Pipeline steps={STEPS} activeStep={status} />

            <div className="btn-row" style={{ marginTop: '1rem' }}>
              <button
                className="btn primary"
                onClick={handleIngestDefault}
                disabled={ingesting || isIngested}
              >
                {ingesting ? 'Ingesting…' : isIngested ? 'Ingested ✓' : 'Ingest VWO PRD'}
              </button>
              {isIngested && (
                <button className="btn secondary" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>

            {status === 'error' && (
              <div className="badge error" style={{ marginTop: '0.75rem' }}>
                Ingestion failed — check server logs
              </div>
            )}
            {isIngested && (
              <div className="badge success" style={{ marginTop: '0.75rem' }}>
                {totalChunks} chunks indexed in ChromaDB
              </div>
            )}
          </section>
        </aside>

        {/* RIGHT PANEL — Query + Results */}
        <section className="panel right">
          <div className="card">
            <h2>❓ Ask a Question</h2>
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
                {querying ? 'Asking…' : 'Ask'}
              </button>
            </form>
            {!isIngested && (
              <p className="hint warn">Ingest the document first to enable querying.</p>
            )}
          </div>

          {error && (
            <div className="card error-card">
              <h3>Error</h3>
              <pre>{error}</pre>
            </div>
          )}

          {querying && !result && !error && (
            <div className="card">
              <div className="spinner-wrap">
                <div className="spinner"></div>
                <p>Embedding query → Retrieving top-4 chunks → Generating answer…</p>
              </div>
            </div>
          )}

          {result && (
            <div className="card result-card">
              <h2>💡 Answer</h2>
              <div className="answer-box">
                <div className="meta">
                  <span className="badge">{result.model}</span>
                  <span className="badge">{result.embeddingModel}</span>
                  <span className="badge">{result.topK} chunks</span>
                </div>
                <div className="answer-text">{result.answer}</div>
              </div>

              <h3>📑 Top {result.topK} Retrieved Chunks</h3>
              <ChunkList chunks={result.chunks} />
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Built for Learn_AITester_batch3x — Task 04th July</p>
      </footer>
    </div>
  );
}
