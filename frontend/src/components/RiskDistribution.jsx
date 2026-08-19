import { getRiskLevel } from "../utils/formatters";

/**
 * RiskDistribution component showing calibrated horizontal bar distribution of population risk
 * @param {{ rankings: Array }} props
 */
export default function RiskDistribution({ rankings = [] }) {
  const total = rankings.length || 1;

  const counts = {
    high: 0,
    medium: 0,
    low: 0,
  };

  rankings.forEach((person) => {
    const level = getRiskLevel(person.risk_score);
    if (level === "HIGH") counts.high += 1;
    else if (level === "MEDIUM") counts.medium += 1;
    else counts.low += 1;
  });

  const highPct = Math.round((counts.high / total) * 100);
  const medPct = Math.round((counts.medium / total) * 100);
  const lowPct = Math.round((counts.low / total) * 100);

  return (
    <div className="enterprise-card risk-dist-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Population Risk Distribution</h2>
          <p className="card-subtitle">Distribution across calibrated risk threshold bands</p>
        </div>
        <span className="evidence-badge font-mono">{rankings.length} Monitored</span>
      </div>
      <div className="risk-dist-list">
        {/* High Risk */}
        <div className="risk-dist-row">
          <span className="risk-dist-label">Critical (≥ 70%)</span>
          <div className="risk-dist-bar-track" title={`Critical Risk: ${counts.high} subjects (${highPct}%)`}>
            <div
              className="risk-dist-bar-fill risk-dist-bar-fill--high"
              style={{ width: `${highPct}%` }}
            />
          </div>
          <span className="risk-dist-count">{counts.high}</span>
          <span className="risk-dist-pct">{highPct}%</span>
        </div>

        {/* Medium Risk */}
        <div className="risk-dist-row">
          <span className="risk-dist-label">Elevated (40–69%)</span>
          <div className="risk-dist-bar-track" title={`Elevated Risk: ${counts.medium} subjects (${medPct}%)`}>
            <div
              className="risk-dist-bar-fill risk-dist-bar-fill--med"
              style={{ width: `${medPct}%` }}
            />
          </div>
          <span className="risk-dist-count">{counts.medium}</span>
          <span className="risk-dist-pct">{medPct}%</span>
        </div>

        {/* Low Risk */}
        <div className="risk-dist-row">
          <span className="risk-dist-label">Baseline (&lt; 40%)</span>
          <div className="risk-dist-bar-track" title={`Baseline Risk: ${counts.low} subjects (${lowPct}%)`}>
            <div
              className="risk-dist-bar-fill risk-dist-bar-fill--low"
              style={{ width: `${lowPct}%` }}
            />
          </div>
          <span className="risk-dist-count">{counts.low}</span>
          <span className="risk-dist-pct">{lowPct}%</span>
        </div>
      </div>
    </div>
  );
}
