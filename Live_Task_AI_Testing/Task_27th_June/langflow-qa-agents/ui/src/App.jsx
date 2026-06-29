import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import ConnectionPanel from './components/ConnectionPanel'
import AgentPage from './components/AgentPage'
import BugTriageAgent from './agents/BugTriageAgent'
import FlakyTestAgent from './agents/FlakyTestAgent'
import RCABot from './agents/RCABot'
import TestCaseGenerator from './agents/TestCaseGenerator'
import TestPlanCreator from './agents/TestPlanCreator'
import JSONSchemaValidator from './agents/JSONSchemaValidator'

const defaultConfig = {
  baseUrl: 'http://localhost:7860',
  apiKey: '',
  flows: {
    bugTriage: '',
    flakyTest: '',
    rca: '',
    testCaseGen: '',
    testPlan: '',
    jsonSchema: '',
  }
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('langflow-config')) || defaultConfig
    } catch {
      return defaultConfig
    }
  })
  const [showConnection, setShowConnection] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('langflow-config', JSON.stringify(config))
  }, [config])

  const agents = [
    {
      id: 'bug-triage',
      name: 'Bug Triage Agent',
      description: 'Auto-triage JIRA bugs with priority, severity & categorization recommendations.',
      icon: '🐛',
      color: '#ef4444',
      flowKey: 'bugTriage',
    },
    {
      id: 'flaky-test',
      name: 'Flaky Test Analyzer',
      description: 'Compare two test run logs to identify flaky patterns and remediation strategies.',
      icon: '🔄',
      color: '#f59e0b',
      flowKey: 'flakyTest',
    },
    {
      id: 'rca',
      name: 'RCA Bot',
      description: 'Generate structured Root Cause Analysis documents from JIRA incidents.',
      icon: '🔍',
      color: '#8b5cf6',
      flowKey: 'rca',
    },
    {
      id: 'test-case-gen',
      name: 'Test Case Generator',
      description: 'Generate test cases + full Playwright E2E framework from JIRA or PRD docs.',
      icon: '📝',
      color: '#10b981',
      flowKey: 'testCaseGen',
    },
    {
      id: 'test-plan',
      name: 'Test Plan Creator',
      description: 'Build high-level Test Plans & Strategies from JIRA Epics or spec documents.',
      icon: '📋',
      color: '#3b82f6',
      flowKey: 'testPlan',
    },
    {
      id: 'json-schema',
      name: 'JSON Schema Validator',
      description: 'Validate JSON payloads against schemas with multi-threaded batch support.',
      icon: '📁',
      color: '#06b6d4',
      flowKey: 'jsonSchema',
    },
  ]

  const renderAgent = (Component) => (
    <AgentPage config={config}>
      <Component config={config} setConfig={setConfig} />
    </AgentPage>
  )

  return (
    <BrowserRouter>
      <Layout
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showConnection={showConnection}
        setShowConnection={setShowConnection}
      >
        {showConnection && (
          <ConnectionPanel
            config={config}
            setConfig={setConfig}
            agents={agents}
            onClose={() => setShowConnection(false)}
          />
        )}
        <Routes>
          <Route path="/" element={<Dashboard agents={agents} config={config} />} />
          <Route path="/bug-triage" element={renderAgent(BugTriageAgent)} />
          <Route path="/flaky-test" element={renderAgent(FlakyTestAgent)} />
          <Route path="/rca" element={renderAgent(RCABot)} />
          <Route path="/test-case-gen" element={renderAgent(TestCaseGenerator)} />
          <Route path="/test-plan" element={renderAgent(TestPlanCreator)} />
          <Route path="/json-schema" element={renderAgent(JSONSchemaValidator)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
