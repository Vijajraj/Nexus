/**
 * Dimension-matched skeleton loading states for Overview, Table, and Person Detail views
 * @param {{ variant?: 'overview' | 'table' | 'detail' }} props
 */
export default function LoadingState({ variant = "overview" }) {
  if (variant === "table") {
    return (
      <div className="table-container" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div className="skeleton" style={{ height: "32px", width: "260px" }} />
          <div className="skeleton" style={{ height: "32px", width: "120px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "42px", width: "100%" }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="skeleton" style={{ height: "94px", width: "100%" }} />
        <div className="dossier-grid">
          <div className="skeleton" style={{ height: "320px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="skeleton" style={{ height: "220px" }} />
            <div className="skeleton" style={{ height: "260px" }} />
          </div>
        </div>
      </div>
    );
  }

  // Default: Overview Dashboard Skeleton
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="metrics-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: "94px" }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: "160px" }} />
      <div className="skeleton" style={{ height: "260px" }} />
    </div>
  );
}
