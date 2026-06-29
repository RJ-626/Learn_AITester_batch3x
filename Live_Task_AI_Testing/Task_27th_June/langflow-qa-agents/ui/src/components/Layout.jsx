import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Layout({ children, darkMode, setDarkMode, showConnection, setShowConnection }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}>
              🤖
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>LangFlow QA Agents</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.2 }}>Production-Grade Agent Dashboard</p>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowConnection(!showConnection)}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              🔌 Connection
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: isHome ? 0 : '24px' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        <p>Made by <strong style={{ color: 'var(--text-secondary)' }}>Rahul Jaiswal</strong> for The Testing Academy</p>
      </footer>
    </div>
  )
}

export default Layout
