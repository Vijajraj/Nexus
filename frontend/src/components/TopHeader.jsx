import { Menu, X, RefreshCw, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * TopHeader component for Police Hackathon MVP with quick case switcher & officer context
 * @param {{ isOnline: boolean, onRefresh: () => void, isRefreshing: boolean, isMobileOpen: boolean, onToggleMobile: () => void }} props
 */
export default function TopHeader({
  isOnline,
  onRefresh,
  isRefreshing,
  isMobileOpen,
  onToggleMobile,
}) {
  const navigate = useNavigate();

  const handleQuickJump = (e) => {
    const val = e.target.value;
    if (val) {
      navigate(`/person/${val}`);
      e.target.value = "";
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobile}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="header-title-group">
          <span className="header-title">NEXUS POLICE CONSOLE</span>
          <span className="header-divider">/</span>
          <span className="header-subtitle">Cyber Crime & Financial Intelligence Division</span>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Demo Case Switcher for Judges */}
        <div className="header-demo-switcher">
          <ShieldAlert size={13} color="var(--risk-high)" />
          <span className="header-demo-label">Demo Suspect:</span>
          <select
            className="header-demo-select"
            onChange={handleQuickJump}
            defaultValue=""
            aria-label="Quick jump to suspect dossier"
          >
            <option value="" disabled>Select case...</option>
            <option value="p_001">#01 Aryan Maharaj (95.16% Risk · Intercept)</option>
            <option value="p_002">#02 Adya Tella (95.16% Risk · Luxury Flag)</option>
            <option value="p_003">#03 Raagini Pandya (95.16% Risk · CDR Burst)</option>
            <option value="p_005">#05 Lekha Gupta (0.53% Risk · Baseline)</option>
          </select>
        </div>

        {/* API Status Indicator */}
        <div
          className="api-status-badge"
          title={isOnline ? "Forensic Node connected at 127.0.0.1:8000" : "Forensic Service Offline"}
        >
          <span
            className={`status-dot ${isOnline ? "status-dot--online" : "status-dot--offline"}`}
            aria-hidden="true"
          />
          <span style={{ color: isOnline ? "var(--text-primary)" : "var(--status-offline)" }}>
            {isOnline ? "Forensic Node 8000" : "Node Offline"}
          </span>
        </div>

        {/* Manual Refresh Trigger */}
        {onRefresh && (
          <button
            className="btn-header-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Synchronize forensic telemetry"
            aria-label="Synchronize telemetry"
          >
            <RefreshCw size={12} className={isRefreshing ? "spin" : ""} />
            <span>Sync</span>
          </button>
        )}
      </div>
    </header>
  );
}
