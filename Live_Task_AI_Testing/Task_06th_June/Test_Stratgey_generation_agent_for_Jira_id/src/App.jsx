import React, { useState, useEffect } from 'react';
import Settings from './components/Settings';
import Generator from './components/Generator';
import StrategyView from './components/StrategyView';

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem('strategy-config') || '{}');
  } catch {
    return {};
  }
}

function saveConfig(config) {
  localStorage.setItem('strategy-config', JSON.stringify(config));
}

function getTheme() {
  try {
    return localStorage.getItem('theme') || 'light';
  } catch {
    return 'light';
  }
}

function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}

export default function App() {
  const [tab, setTab] = useState('generate');
  const [config, setConfig] = useState(loadConfig);
  const [envStatus, setEnvStatus] = useState(null);
  const [strategyResult, setStrategyResult] = useState(null);
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => setEnvStatus(d))
      .catch(() => setEnvStatus({}));
  }, []);

  function handleSave(newConfig) {
    setConfig(newConfig);
    saveConfig(newConfig);
    setTab('generate');
  }

  function handleStrategy(result) {
    setStrategyResult(result);
    setTab('view');
  }

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  }

  return (
    <div>
      <header>
        <div className="container">
          <h1>Test Strategy Generator</h1>
          <p>Turn any Jira ID into a comprehensive Test Strategy</p>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>

      <div className="container">
        <nav>
          <button className={tab === 'generate' ? 'active' : ''} onClick={() => setTab('generate')}>
            Generate
          </button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            Settings
          </button>
          {strategyResult && (
            <button className={tab === 'view' ? 'active' : ''} onClick={() => setTab('view')}>
              View Strategy
            </button>
          )}
        </nav>

        {tab === 'settings' && (
          <Settings config={config} onSave={handleSave} envStatus={envStatus} />
        )}

        {tab === 'generate' && (
          <Generator config={config} onStrategy={handleStrategy} />
        )}

        {tab === 'view' && strategyResult && (
          <StrategyView result={strategyResult} />
        )}
      </div>
    </div>
  );
}
