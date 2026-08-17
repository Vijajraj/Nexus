import "./RiskBadge.css";

export default function RiskBadge({ score }) {
  let level, text;
  if (score >= 0.7) {
    level = "high";
    text = "High";
  } else if (score >= 0.4) {
    level = "medium";
    text = "Med";
  } else {
    level = "low";
    text = "Low";
  }

  return <span className={`badge badge--${level}`}>{text}</span>;
}
