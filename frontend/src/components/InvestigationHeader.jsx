import { useState } from "react";
import { Link } from "react-router-dom";
import { formatRiskScore, getRiskLevel, getSubjectCaseStatus, setSubjectCaseStatus, POLICE_CASE_STATUSES } from "../utils/formatters";
import RiskBadge from "./RiskBadge";
import PoliceNoticeModal from "./PoliceNoticeModal";
import { ArrowLeft, Copy, Check, Printer, FileText } from "lucide-react";

/**
 * InvestigationHeader component for suspect dossier detail with Police Notice Generator
 * @param {{ person: Object }} props
 */
export default function InvestigationHeader({ person }) {
  const [copiedId, setCopiedId] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(() =>
    person ? getSubjectCaseStatus(person.person_id, person.risk_score) : POLICE_CASE_STATUSES[0]
  );

  if (!person) return null;

  const level = getRiskLevel(person.risk_score);
  const scoreClass =
    level === "HIGH"
      ? "hero-stat-value--high"
      : level === "MEDIUM"
      ? "hero-stat-value--med"
      : "hero-stat-value--low";

  const handleCopyId = () => {
    navigator.clipboard.writeText(person.person_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleStatusChange = (e) => {
    const newStatusId = e.target.value;
    const found = POLICE_CASE_STATUSES.find((s) => s.id === newStatusId);
    if (found) {
      setCurrentStatus(found);
      setSubjectCaseStatus(person.person_id, newStatusId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Breadcrumb & Actions Bar */}
      <div className="investigation-header-nav">
        <Link to="/rankings" className="back-link">
          <ArrowLeft size={15} />
          <span>Back to Suspect Registry</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Section 91 CrPC Notice Generator Button */}
          <button
            className="btn-primary-dark"
            onClick={() => setIsNoticeOpen(true)}
            title="Generate official Section 91 Cr.P.C. requisition notice"
          >
            <FileText size={13} />
            <span>Generate Sec 91 Notice</span>
          </button>

          <button className="btn-secondary" onClick={handlePrint} title="Print judicial dossier brief">
            <Printer size={13} />
            <span>Print Police Dossier</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="investigation-hero">
        <div className="investigation-hero-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="investigation-tag">Police Case File</span>
            <span className={`case-status-tag ${currentStatus.badgeClass}`}>
              {currentStatus.label}
            </span>
          </div>

          <h1 className="investigation-name">
            <span>{person.name}</span>
          </h1>

          <div className="investigation-id-line">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span className="subject-id">{person.person_id}</span>
              <button
                className="copy-button"
                onClick={handleCopyId}
                title="Copy Subject ID"
                aria-label="Copy Subject ID"
              >
                {copiedId ? <Check size={12} color="var(--risk-low)" /> : <Copy size={12} />}
              </button>
            </span>
            <span>·</span>
            <span>Rank #{person.rank} of monitored suspect registry</span>
          </div>
        </div>

        <div className="investigation-hero-stats">
          <div className="hero-stat-block">
            <span className="hero-stat-label">Model Anomaly Probability</span>
            <span className={`hero-stat-value ${scoreClass}`}>
              {formatRiskScore(person.risk_score)}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
            <RiskBadge score={person.risk_score} />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Action:</span>
              <select
                className="case-status-select"
                value={currentStatus.id}
                onChange={handleStatusChange}
                aria-label="Update Police Case Status"
              >
                {POLICE_CASE_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Police Notice Generator Modal */}
      <PoliceNoticeModal
        person={person}
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </div>
  );
}
