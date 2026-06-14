import React, { useState } from 'react';

export default function StrategyView({ result }) {
  const [showMarkdown, setShowMarkdown] = useState(false);

  const { issue, strategy, markdown } = result;

  function download() {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-strategy-${issue.key}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <section className="card">
        <h2>Test Strategy: {issue.key}</h2>
        <p className="muted">
          <strong>Summary:</strong> {issue.summary}
          <br />
          <strong>Type:</strong> {issue.issueType}
        </p>

        <div className="row">
          <button className="secondary" onClick={() => setShowMarkdown(!showMarkdown)}>
            {showMarkdown ? 'Hide Markdown' : 'Show Markdown'}
          </button>
          <button className="primary" onClick={download}>
            Download .md
          </button>
        </div>
      </section>

      {showMarkdown && (
        <section className="card">
          <h3>Raw Markdown</h3>
          <div className="strategy-output">
            <pre>{markdown}</pre>
          </div>
        </section>
      )}

      <section className="card">
        <h3>Test Strategy Details</h3>

        <div style={{ marginTop: '20px' }}>
          <h4>Objective</h4>
          <p>{strategy.objective || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Scope</h4>
          <h5>In Scope:</h5>
          <p>{strategy.inScope || 'TBD'}</p>
          <h5>Out of Scope:</h5>
          <p>{strategy.outOfScope || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Focus Areas</h4>
          <p>{strategy.focusAreas || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Approach</h4>
          <p>{strategy.approach || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Deliverables</h4>
          <p>{strategy.deliverables || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Team & Schedule</h4>
          <p>{strategy.teamAndSchedule || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Entry & Exit Criteria</h4>
          <p>{strategy.entryExitCriteria || 'TBD'}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Risks</h4>
          <p>{strategy.risks || 'TBD'}</p>
        </div>
      </section>
    </div>
  );
}
