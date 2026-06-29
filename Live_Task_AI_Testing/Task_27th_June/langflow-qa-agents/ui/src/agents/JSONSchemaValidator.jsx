import React, { useState } from 'react'
import { runLangflowFlow, ResultPanel } from '../components/AgentPage'

function JSONSchemaValidator({ config }) {
  const [payload, setPayload] = useState('')
  const [schema, setSchema] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleRun = async () => {
    if (!payload.trim() || !schema.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const tweaks = {
        'JSON-Schema-Validator': {
          json_schema: schema.trim(),
          json_payload: payload.trim(),
        },
      }
      const res = await runLangflowFlow(
        config.baseUrl,
        config.flows.jsonSchema,
        config.apiKey,
        tweaks,
        { input_value: 'Validate JSON against schema' }
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>📁 JSON Schema Validator</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Validate JSON payloads against a JSON Schema. Supports raw JSON strings, JSONL, directory batches, and URL endpoints.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>JSON Payload</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder={`Paste your JSON payload here...\n\nExample:\n{\n  "id": 1,\n  "name": "Test",\n  "email": "test@example.com"\n}`}
              rows={8}
              style={{ fontFamily: 'SF Mono, Monaco, monospace', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label>JSON Schema</label>
            <textarea
              value={schema}
              onChange={e => setSchema(e.target.value)}
              placeholder={`Paste your JSON Schema here...\n\nExample:\n{\n  "type": "object",\n  "properties": {\n    "id": { "type": "integer" },\n    "name": { "type": "string" }\n  },\n  "required": ["id", "name"]\n}`}
              rows={8}
              style={{ fontFamily: 'SF Mono, Monaco, monospace', fontSize: '0.85rem' }}
            />
          </div>

          <button
            onClick={handleRun}
            disabled={loading || !payload.trim() || !schema.trim() || !config.flows.jsonSchema}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? <><span className="spinner" /> Validating...</> : '✅ Validate JSON'}
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} loading={loading} />
    </div>
  )
}

export default JSONSchemaValidator
