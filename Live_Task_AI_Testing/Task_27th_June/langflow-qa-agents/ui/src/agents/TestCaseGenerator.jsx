import React, { useState } from 'react'
import { runLangflowFlow, ResultPanel } from '../components/AgentPage'

function TestCaseGenerator({ config }) {
  const [jiraKey, setJiraKey] = useState('')
  const [projectName, setProjectName] = useState('MyProject')
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
      const tweaks = {
        'Multi-File-Writer': { project_name: projectName },
      }
      if (source === 'doc' && docContent.trim()) {
        tweaks['Local-Document-Reader'] = { file_path: docContent }
      }
      const inputValue = source === 'jira' ? jiraKey.trim() : docContent.trim()
      const res = await runLangflowFlow(
        config.baseUrl,
        config.flows.testCaseGen,
        config.apiKey,
        tweaks,
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>📝 Test Case Generator</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate test cases + a complete Playwright E2E framework from JIRA tickets or PRD documents.
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
                JIRA Ticket
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
              <label>JIRA Story / Ticket Key</label>
              <input
                type="text"
                value={jiraKey}
                onChange={e => setJiraKey(e.target.value)}
                placeholder="e.g. PROJ-789"
              />
            </div>
          ) : (
            <div>
              <label>Document Content</label>
              <textarea
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                placeholder="Paste your PRD, spec, or user story text here..."
                rows={8}
              />
            </div>
          )}

          <div>
            <label>Project Name (for file output)</label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="MyProject"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={
              loading ||
              !config.flows.testCaseGen ||
              (source === 'jira' ? !jiraKey.trim() : !docContent.trim())
            }
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? <><span className="spinner" /> Generating...</> : '⚡ Generate Test Framework'}
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} loading={loading} />
    </div>
  )
}

export default TestCaseGenerator
