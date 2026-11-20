// StatusTimeline — shared progress indicator used by Request Details page (Student 2)
// Maps a request's current status to the 6-step repair pipeline and renders it visually.

const STEPS = [
  'Submitted',
  'Received',
  'Under Inspection',
  'In Repair',
  'Ready for Collection',
  'Completed',
];

// Normalize various status strings from the backend/mock into one of the 6 step labels
function resolveStep(status = '') {
  const s = status.toLowerCase().trim();
  if (s === 'new' || s === 'submitted') return 'Submitted';
  if (s === 'received') return 'Received';
  if (s === 'inspection' || s === 'under inspection' || s === 'under-inspection') return 'Under Inspection';
  if (s === 'in repair' || s === 'in-repair') return 'In Repair';
  if (s === 'ready' || s === 'ready for collection' || s === 'ready-for-collection') return 'Ready for Collection';
  if (s === 'completed') return 'Completed';
  return 'Submitted';
}

function StatusTimeline({ status }) {
  const currentStep = resolveStep(status);
  const currentIdx = STEPS.indexOf(currentStep);

  return (
    <div className="status-timeline">
      <p className="status-timeline__label">Repair Progress</p>
      <div className="status-timeline__track">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div
              key={step}
              className={`status-timeline__step${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
            >
              <div className="status-timeline__dot">
                {done && <span aria-hidden="true">✓</span>}
                {active && <span aria-hidden="true">●</span>}
              </div>
              <span className="status-timeline__name">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusTimeline;
