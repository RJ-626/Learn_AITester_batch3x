export default function Pipeline({ steps, activeStep }) {
  const stepIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <div className="pipeline">
      {steps.map((step, i) => {
        let state = 'pending';
        if (step.id === activeStep) state = 'active';
        else if (i < stepIndex) state = 'done';

        return (
          <div key={step.id} className={`pipeline-step ${state}`}>
            <div className="step-indicator">
              <div className="step-dot">{state === 'done' ? '✓' : i + 1}</div>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
            <div className="step-body">
              <div className="step-label">{step.label}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
