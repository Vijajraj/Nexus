/**
 * Compact enterprise KPI Metric Card
 * @param {{ label: string, value: string|number, footerText?: string, variant?: string, icon?: React.ReactNode }} props
 */
export default function MetricCard({ label, value, footerText, variant, icon }) {
  const valueClass =
    variant === "high"
      ? "metric-value--high"
      : variant === "med"
      ? "metric-value--med"
      : "";

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-label">{label}</span>
        {icon && <span className="metric-icon-wrap" aria-hidden="true">{icon}</span>}
      </div>
      <div className={`metric-value ${valueClass}`}>{value}</div>
      {footerText && (
        <div className="metric-footer">
          <span>{footerText}</span>
        </div>
      )}
    </div>
  );
}
