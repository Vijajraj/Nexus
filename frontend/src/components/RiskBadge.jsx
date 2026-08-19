import { getRiskLevel } from "../utils/formatters";

/**
 * RiskBadge component displaying CRITICAL / ELEVATED / BASELINE with accessible text & color
 * @param {{ score: number, label?: string }} props
 */
export default function RiskBadge({ score, label }) {
  const level = label ? label.toUpperCase() : getRiskLevel(score);
  const badgeClass =
    level === "HIGH"
      ? "risk-badge--high"
      : level === "MEDIUM" || level === "MED"
      ? "risk-badge--medium"
      : "risk-badge--low";

  const displayText =
    level === "HIGH"
      ? "High"
      : level === "MEDIUM" || level === "MED"
      ? "Medium"
      : "Low";

  return (
    <span className={`risk-badge ${badgeClass}`} role="status" aria-label={`Risk Level: ${displayText}`}>
      <span className="risk-badge-dot" aria-hidden="true" />
      <span>{displayText}</span>
    </span>
  );
}
