import React, { useState } from 'react'
import { runLangflowFlow, ResultPanel } from '../components/AgentPage'

function TestPlanCreator({ config }) {
  const [jiraKey, setJiraKey] = useState('')
  const [docContent, setDocContent] = useState('')
  const [source, setSource] = useState('jira')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleRun = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const inputValue = source === 'jira' ? jiraKey.trim() : docContent.trim()
      const res = await runLangflowFlow(
        config.baseUrl,
        config.flows.testPlan,
        config.apiKey,
        {},
        { input_value: inputValue }
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>📋 Test Plan Creator</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Build high-level Test Plans and Test Strategies from JIRA Epics or local spec documents.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Source</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button
                onClick={() => setSource('jira')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: source === 'jira' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: source === 'jira' ? 'white' : 'var(--text-primary)',
                }}
              >
                JIRA Epic
              </button>
              <button
                onClick={() => setSource('doc')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: source === 'doc' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: source === 'doc' ? 'white' : 'var(--text-primary)',
                }}
              >
                PRD / Spec Document
              </button>
            </div>
          </div>

          {source === 'jira' ? (
            <div>
              <label>JIRA Epic Key</label>
              <input
                type="text"
                value={jiraKey}
                onChange={e => setJiraKey(e.target.value)}
                placeholder="e.g. PROJ-100"
              />
            </div>
          ) : (
            <div>
              <label>Document Content</label>
              <textarea
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                placeholder="Paste your PRD, spec, or epic description here..."
                rows={8}
              />
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={
              loading ||
              !config.flows.testPlan ||
              (source === 'jira' ? !jiraKey.trim() : !docContent.trim())
            }
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? <><span className="spinner" /> Creating...</> : '📄 Create Test Plan'}
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} loading={loading} />
    </div>
  )
}

export default TestPlanCreator
