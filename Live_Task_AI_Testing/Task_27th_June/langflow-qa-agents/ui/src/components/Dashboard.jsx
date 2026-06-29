import React from 'react'
import { Link } from 'react-router-dom'

function Dashboard({ agents, config }) {
  const hasAnyFlow = Object.values(config.flows).some(f => f && f.trim().length > 0)

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
          🤖 QA Automation Agents
        </h2>
        <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 24px' }}>
          6 production-grade LangFlow pipelines for test generation, bug triage, flaky analysis, RCA, and contract validation.
        </p>
        {!hasAnyFlow && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: '12px 20px',
            display: 'inline-block',
            fontSize: '0.9rem',
          }}>
            ⚠️ Configure your LangFlow connection to get started
          </div>
        )}
      </div>

      {/* Agents Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {agents.map((agent) => {
            const isConnected = config.flows[agent.flowKey] && config.flows[agent.flowKey].trim().length > 0
            return (
              <Link
                key={agent.id}
                to={`/${agent.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    backgroundColor: agent.color,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: '2.5rem' }}>{agent.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{agent.name}</h3>
                      <span className="badge" style={{
                        backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? '#10b981' : '#ef4444',
                      }}>
                        {isConnected ? '● Connected' : '○ Not Configured'}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {agent.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: agent.color, fontWeight: 600, fontSize: '0.9rem' }}>
                    Launch Agent →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="card" style={{ marginTop: 40, padding: 32 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>🚀 Quick Start</h3>
          <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Click <strong>Connection</strong> in the header to configure your LangFlow URL and API key.</li>
            <li>Paste the <strong>Flow IDs</strong> for each agent you want to use (found in the LangFlow UI).</li>
            <li>Click on any agent card above to open its interactive dashboard.</li>
            <li>Fill in the required inputs and click <strong>Run Agent</strong> to execute the flow.</li>
          </ol>
          <div style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 8,
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}>
            <strong>💡 Pro Tip:</strong> The UI proxies requests through Vite to avoid CORS issues. Make sure LangFlow is running at the configured base URL.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
