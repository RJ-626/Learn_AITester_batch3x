import React, { useState } from 'react'
import { runLangflowFlow, ResultPanel } from '../components/AgentPage'

function FlakyTestAgent({ config }) {
  const [log1, setLog1] = useState('')
  const [log2, setLog2] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleRun = async () => {
    if (!log1.trim() || !log2.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const tweaks = {
        'File-Run1': { file_path: log1 },
        'File-Run2': { file_path: log2 },
      }
      const res = await runLangflowFlow(
        config.baseUrl,
        config.flows.flakyTest,
        config.apiKey,
        tweaks,
        { input_value: 'Compare these two test runs' }
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>🔄 Flaky Test Analyzer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Paste two test execution logs (Run 1 Pass vs Run 2 Fail) to identify flaky patterns and remediation strategies.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Run 1 Log (Pass)</label>
            <textarea
              value={log1}
              onChange={e => setLog1(e.target.value)}
              placeholder="Paste test log output from the PASSING run..."
              rows={6}
            />
          </div>
          <div>
            <label>Run 2 Log (Fail)</label>
            <textarea
              value={log2}
              onChange={e => setLog2(e.target.value)}
              placeholder="Paste test log output from the FAILING run..."
              rows={6}
            />
          </div>
          <button
            onClick={handleRun}
            disabled={loading || !log1.trim() || !log2.trim() || !config.flows.flakyTest}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? <><span className="spinner" /> Analyzing...</> : '🔍 Analyze Flakiness'}
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} loading={loading} />
    </div>
  )
}

export default FlakyTestAgent
