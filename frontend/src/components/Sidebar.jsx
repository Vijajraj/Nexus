import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListOrdered, Shield, Database, Activity } from "lucide-react";

/**
 * Sidebar component with police department insignia, investigation links, and system telemetry
 * @param {{ isMobileOpen: boolean, onCloseMobile: () => void, isOnline: boolean }} props
 */
export default function Sidebar({ isMobileOpen, onCloseMobile, isOnline }) {
  return (
    <aside className={`app-sidebar ${isMobileOpen ? "open" : ""}`} aria-label="Police Navigation">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-mark" aria-hidden="true">
          <Shield size={16} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">NEXUS · POLICE</span>
          <span className="sidebar-brand-subtitle">Forensic Crime Intelligence</span>
        </div>
      </div>

      {/* Unit Identification Badge */}
      <div className="sidebar-unit-badge">
        <span className="sidebar-unit-title">CCFIU Node 01</span>
        <span className="sidebar-unit-desc">Jurisdiction: Financial Crime Zone</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-nav-heading">Investigation Console</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <LayoutDashboard className="nav-icon" />
          <span>Triage Overview</span>
        </NavLink>

        <NavLink
          to="/rankings"
          className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <ListOrdered className="nav-icon" />
          <span>Suspect Registry</span>
        </NavLink>
      </nav>

      {/* System Status / Engine Metadata */}
      <div className="sidebar-system">
        <span className="sidebar-nav-heading" style={{ padding: "0 0 6px 0" }}>Forensic Core</span>
        <div className="sidebar-system-item">
          <span className="sidebar-system-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Database size={12} />
            <span>Telemetry Pipeline</span>
          </span>
          <span className="sidebar-system-val font-mono">FastAPI</span>
        </div>
        <div className="sidebar-system-item">
          <span className="sidebar-system-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={12} />
            <span>Interception Feed</span>
          </span>
          <span className="sidebar-system-val font-mono" style={{ color: isOnline ? "var(--status-online)" : "var(--status-offline)" }}>
            {isOnline ? "Active" : "Offline"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span>Police Hackathon MVP</span>
        <span className="font-mono">v1.2</span>
      </div>
    </aside>
  );
}
