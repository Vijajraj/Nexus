import "./ShapChart.css";

export default function ShapChart({ factors }) {
  const max = Math.max(...factors.map((f) => f.shap_value), 0.01);

  return (
    <div className="shap" role="img" aria-label="Risk factor contributions">
      {factors.map((factor) => {
        const pct = (factor.shap_value / max) * 100;
        return (
          <div key={factor.feature} className="shap__row">
            <div className="shap__meta">
              <span className="shap__label">{factor.label}</span>
              <span className="shap__val">{factor.shap_value.toFixed(2)}</span>
            </div>
            <div className="shap__track">
              <div className="shap__fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
