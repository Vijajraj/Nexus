import { formatShapValue } from "../utils/formatters";

/**
 * RiskFactorChart — Horizontal TreeSHAP feature contribution chart
 * @param {{ factors: Array }} props
 */
export default function RiskFactorChart({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="enterprise-card">
        <div className="card-header">
          <h2 className="card-title">Feature Attribution (SHAP)</h2>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            No individual factor attributions recorded for this subject baseline.
          </p>
        </div>
      </div>
    );
  }

  // Calculate maximum absolute SHAP value for proportional scaling
  const maxAbsShap = Math.max(...factors.map((f) => Math.abs(f.shap_value || 0)), 0.01);

  return (
    <div className="enterprise-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Feature Attribution (TreeSHAP)</h2>
          <p className="card-subtitle">Quantified marginal impact of each behavioral feature on the anomaly probability</p>
        </div>
        <span className="evidence-badge font-mono">TreeSHAP v0.42</span>
      </div>
      <div className="card-body">
        <div className="shap-chart-container">
          {factors.map((factor) => {
            const rawVal = factor.shap_value || 0;
            const pct = Math.min(Math.round((Math.abs(rawVal) / maxAbsShap) * 100), 100);
            const isPos = rawVal >= 0;

            const barFillClass = isPos
              ? rawVal > 0.6
                ? "shap-bar-fill--high"
                : "shap-bar-fill--med"
              : "shap-bar-fill--low";

            return (
              <div key={factor.feature} className="shap-row">
                <div className="shap-row-header">
                  <div className="shap-label-group">
                    <span className="shap-label">{factor.label}</span>
                    <span className="shap-feature-code">{factor.feature}</span>
                  </div>
                  <span
                    className={`shap-value ${isPos ? "shap-value--pos" : "shap-value--neg"}`}
                  >
                    {formatShapValue(rawVal)}
                  </span>
                </div>
                <div
                  className="shap-bar-track"
                  title={`Feature: ${factor.feature}, SHAP Contribution: ${rawVal.toFixed(4)}`}
                >
                  <div
                    className={`shap-bar-fill ${barFillClass}`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="shap-explain-box">
          <strong>Interpretation Guide:</strong> Positive SHAP values (red) denote risk-elevating behavioral anomalies. Negative SHAP values (green) denote mitigating factors aligning with baseline compliance expectations.
        </div>
      </div>
    </div>
  );
}
