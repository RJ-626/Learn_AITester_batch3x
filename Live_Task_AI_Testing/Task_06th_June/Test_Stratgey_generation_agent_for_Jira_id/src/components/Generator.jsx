import React, { useState } from 'react';

export default function Generator({ config, onStrategy }) {
  const [jiraId, setJiraId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!jiraId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jiraId: jiraId.trim(),
          config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate strategy');

      onStrategy(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Generate Test Strategy</h2>
      <p className="muted">
        Enter a Jira ID and we'll fetch the ticket + generate a comprehensive Test Strategy.
      </p>

      <form onSubmit={handleGenerate} className="form">
        <label className="field">
          <span>Jira ID</span>
          <input
            type="text"
            value={jiraId}
            placeholder="e.g., KAN-5"
            onChange={(e) => setJiraId(e.target.value)}
            disabled={loading}
          />
        </label>
        <div className="row">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Strategy'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching Jira ticket and generating strategy...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </section>
  );
}
