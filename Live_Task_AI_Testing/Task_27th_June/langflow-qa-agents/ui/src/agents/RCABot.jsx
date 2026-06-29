import React, { useState } from 'react'
import { runLangflowFlow, ResultPanel } from '../components/AgentPage'

function RCABot({ config }) {
  const [jiraKey, setJiraKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleRun = async () => {
    if (!jiraKey.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runLangflowFlow(
        config.baseUrl,
        config.flows.rca,
        config.apiKey,
        {},
        { input_value: jiraKey.trim() }
      )
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>🔍 RCA Bot</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate a structured Root Cause Analysis document from a JIRA incident key.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>JIRA Incident Key</label>
            <input
              type="text"
              value={jiraKey}
              onChange={e => setJiraKey(e.target.value)}
              placeholder="e.g. INC-456"
              onKeyDown={e => e.key === 'Enter' && handleRun()}
            />
          </div>
          <button
            onClick={handleRun}
            disabled={loading || !jiraKey.trim() || !config.flows.rca}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? <><span className="spinner" /> Generating...</> : '📄 Generate RCA'}
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} loading={loading} />
    </div>
  )
}

export default RCABot
