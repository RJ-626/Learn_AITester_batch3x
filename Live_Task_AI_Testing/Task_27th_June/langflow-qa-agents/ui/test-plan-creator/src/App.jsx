import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const STORAGE_KEY = 'test-plan-config'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { baseUrl: 'http://localhost:7860', apiKey: '', flowId: '' } }
    catch { return { baseUrl: 'http://localhost:7860', apiKey: '', flowId: '' } }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [jiraKey, setJiraKey] = useState('')
  const [docContent, setDocContent] = useState('')
  const [source, setSource] = useState('jira')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
  }, [darkMode])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)) }, [config])

  const runFlow = async () => {
    setLoading(true); setResult(null); setError(null)
    try {
      const url = `${config.baseUrl}/api/v1/run/${config.flowId}?stream=false`
      const headers = { 'Content-Type': 'application/json' }
      if (config.apiKey) headers['x-api-key'] = config.apiKey
      const inputValue = source === 'jira' ? jiraKey.trim() : docContent.trim()
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ input_value: inputValue, output_type: 'chat', input_type: 'chat', tweaks: {} }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      setResult(await res.json())
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const resultText = result?.outputs?.[0]?.outputs?.[0]?.results?.message?.text
    || result?.outputs?.[0]?.outputs?.[0]?.artifacts?.message
    || JSON.stringify(result, null, 2)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📋</div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Test Plan Creator</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Build test plans from JIRA Epics or specs</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>⚙️ Settings</button>
            <button onClick={() => setDarkMode(!darkMode)} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{darkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '20px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label>LangFlow Base URL</label><input type="text" value={config.baseUrl} onChange={e => setConfig(p => ({ ...p, baseUrl: e.target.value }))} /></div>
              <div><label>API Key</label><input type="password" value={config.apiKey} onChange={e => setConfig(p => ({ ...p, apiKey: e.target.value }))} /></div>
            </div>
            <div><label>Flow ID</label><input type="text" value={config.flowId} onChange={e => setConfig(p => ({ ...p, flowId: e.target.value }))} placeholder="e.g. test-plan-abc123" /></div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📋</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Test Plan Creator</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>Build high-level Test Plans and Test Strategies from JIRA Epics or local spec documents.</p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label>Source</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button onClick={() => setSource('jira')} className="btn" style={{ flex: 1, backgroundColor: source === 'jira' ? '#3b82f6' : 'var(--bg-secondary)', color: source === 'jira' ? 'white' : 'var(--text-primary)' }}>JIRA Epic</button>
                  <button onClick={() => setSource('doc')} className="btn" style={{ flex: 1, backgroundColor: source === 'doc' ? '#3b82f6' : 'var(--bg-secondary)', color: source === 'doc' ? 'white' : 'var(--text-primary)' }}>PRD / Spec Document</button>
                </div>
              </div>

              {source === 'jira' ? (
                <div><label>JIRA Epic Key</label><input type="text" value={jiraKey} onChange={e => setJiraKey(e.target.value)} placeholder="e.g. PROJ-100" /></div>
              ) : (
                <div><label>Document Content</label><textarea value={docContent} onChange={e => setDocContent(e.target.value)} placeholder="Paste your PRD, spec, or epic description here..." rows={8} /></div>
              )}

              <button onClick={runFlow} disabled={loading || !config.flowId || (source === 'jira' ? !jiraKey.trim() : !docContent.trim())} className="btn btn-primary" style={{ alignSelf: 'flex-start', backgroundColor: '#3b82f6' }}>
                {loading ? <><span className="spinner" /> Creating...</> : '📄 Create Test Plan'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
              <p style={{ color: 'var(--text-muted)' }}>Running agent pipeline...</p>
            </div>
          )}
          {error && (
            <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--danger)' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: 8 }}>❌ Error</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</pre>
            </div>
          )}
          {result && (
            <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--success)' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: 16 }}>✅ Test Plan</h4>
              <div className="markdown-body"><ReactMarkdown>{String(resultText)}</ReactMarkdown></div>
              <details style={{ marginTop: 20 }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Raw JSON</summary>
                <pre style={{ marginTop: 12, fontSize: '0.8rem', overflow: 'auto', maxHeight: 300 }}>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>Made by <strong style={{ color: 'var(--text-secondary)' }}>Rahul Jaiswal</strong> for The Testing Academy</p>
      </footer>
    </div>
  )
}

export default App
