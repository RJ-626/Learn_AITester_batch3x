import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

export async function runLangflowFlow(baseUrl, flowId, apiKey, tweaks = {}, inputs = {}) {
  const url = `${baseUrl}/api/v1/run/${flowId}?stream=false`
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  const body = {
    input_value: inputs.input_value || '',
    output_type: 'chat',
    input_type: 'chat',
    tweaks: tweaks,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`HTTP ${res.status}: ${errText}`)
  }

  return await res.json()
}

export function ResultPanel({ result, error, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
        <p style={{ color: 'var(--text-muted)' }}>Running agent pipeline...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--danger)' }}>
        <h4 style={{ color: 'var(--danger)', marginBottom: 8 }}>❌ Error</h4>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {error}
        </pre>
      </div>
    )
  }

  if (!result) return null

  const text = result.outputs?.[0]?.outputs?.[0]?.results?.message?.text
    || result.outputs?.[0]?.outputs?.[0]?.artifacts?.message
    || JSON.stringify(result, null, 2)

  return (
    <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--success)' }}>
      <h4 style={{ color: 'var(--success)', marginBottom: 16 }}>✅ Agent Output</h4>
      <div className="markdown-body" style={{ color: 'var(--text-primary)' }}>
        <ReactMarkdown>{String(text)}</ReactMarkdown>
      </div>
      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Raw JSON Response
        </summary>
        <pre style={{ marginTop: 12, fontSize: '0.8rem', overflow: 'auto', maxHeight: 300 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function AgentPage({ config, children }) {
  const location = useLocation()
  const isConnected = config.baseUrl && config.baseUrl.trim().length > 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {!isConnected && (
        <div style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          marginBottom: 24,
          fontSize: '0.9rem',
        }}>
          ⚠️ LangFlow connection not configured. Please set your base URL in the Connection panel.
        </div>
      )}

      {children}
    </div>
  )
}

export default AgentPage
