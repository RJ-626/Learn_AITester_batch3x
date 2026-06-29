import React, { useState } from 'react'

function ConnectionPanel({ config, setConfig, agents, onClose }) {
  const [localConfig, setLocalConfig] = useState(config)

  const handleSave = () => {
    setConfig(localConfig)
    onClose()
  }

  const updateFlow = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      flows: { ...prev.flows, [key]: value }
    }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 32,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🔌 Connection Settings</h2>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 12px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label>LangFlow Base URL</label>
            <input
              type="text"
              value={localConfig.baseUrl}
              onChange={e => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="http://localhost:7860"
            />
          </div>

          <div>
            <label>API Key (x-api-key header)</label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={e => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Agent Flow IDs</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Paste the Flow ID for each agent from the LangFlow UI (found in the flow URL or settings).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {agents.map(agent => (
                <div key={agent.flowKey}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{agent.icon}</span> {agent.name}
                  </label>
                  <input
                    type="text"
                    value={localConfig.flows[agent.flowKey] || ''}
                    onChange={e => updateFlow(agent.flowKey, e.target.value)}
                    placeholder={`e.g. ${agent.flowKey}-abc123`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
            💾 Save Settings
          </button>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionPanel
