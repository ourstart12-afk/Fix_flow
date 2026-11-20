import { timelineSteps, statusToStep } from "../pages/mock";

export default function StatusTimeline({ status }) {
  const current = statusToStep[status] || "Submitted";
  const idx = timelineSteps.indexOf(current);

  return (
    <div>
      <h3>Status Timeline - Current: {status}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {timelineSteps.map((step, i) => {
          let bg = "#eee", color = "#777";
          if (i < idx) { bg = "green"; color = "white"; }
          if (i === idx) { bg = "#2a6cff"; color = "white"; }
          return (
            <div key={step} style={{ background: bg, color, padding: "10px 14px", borderRadius: 20 }}>
              {i < idx ? "✓ " : ""}{step}
            </div>
          );
        })}
      </div>
      <p>Green = Done, Blue = Current, Grey = Aane wala</p>
    </div>
  );
}