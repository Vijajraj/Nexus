import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRiskScore, getSubjectCaseStatus } from "../utils/formatters";
import RiskBadge from "./RiskBadge";
import { ArrowRight, Copy, Check } from "lucide-react";

/**
 * PriorityInvestigations component showing top 5 highest risk suspects with police case status
 * @param {{ rankings: Array }} props
 */
export default function PriorityInvestigations({ rankings = [] }) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const topFive = rankings.slice(0, 5);

  if (!topFive.length) {
    return null;
  }

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="enterprise-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Priority Police Triage Queue</h2>
          <p className="card-subtitle">Prime suspects exhibiting synchronized telephony and financial anomalies</p>
        </div>
        <span className="evidence-badge font-mono">Top {topFive.length} Critical Targets</span>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>#</th>
              <th>Suspect Name</th>
              <th style={{ width: "130px" }}>Entity ID</th>
              <th className="text-right" style={{ width: "110px" }}>Risk Score</th>
              <th style={{ width: "100px" }}>Risk Band</th>
              <th style={{ width: "160px" }}>Police Case Status</th>
              <th>Primary Anomaly Vector</th>
              <th className="text-right" style={{ width: "130px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {topFive.map((subject, idx) => {
              const primaryFactor = subject.top_factors?.[0]?.label || "Multi-factor anomaly pattern";
              const rankFormatted = String(subject.rank || idx + 1).padStart(2, "0");
              const isCopied = copiedId === subject.person_id;
              const caseStatus = getSubjectCaseStatus(subject.person_id, subject.risk_score);

              return (
                <tr
                  key={subject.person_id}
                  className="clickable"
                  onClick={() => navigate(`/person/${subject.person_id}`)}
                >
                  <td className="font-mono" style={{ color: "var(--text-muted)" }}>{rankFormatted}</td>
                  <td>
                    <span className="subject-name">{subject.name}</span>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span className="subject-id">{subject.person_id}</span>
                      <button
                        className="copy-button"
                        onClick={(e) => handleCopyId(e, subject.person_id)}
                        title="Copy Subject ID"
                        aria-label="Copy Subject ID"
                      >
                        {isCopied ? <Check size={12} color="var(--risk-low)" /> : <Copy size={12} />}
                      </button>
                    </span>
                  </td>
                  <td className="text-right score-cell">
                    {formatRiskScore(subject.risk_score)}
                  </td>
                  <td>
                    <RiskBadge score={subject.risk_score} />
                  </td>
                  <td>
                    <span className={`case-status-tag ${caseStatus.badgeClass}`}>
                      {caseStatus.label}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {primaryFactor}
                  </td>
                  <td className="text-right">
                    <span
                      style={{
                        color: "var(--interactive-blue)",
                        fontWeight: 600,
                        fontSize: "0.80rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>Open Dossier</span>
                      <ArrowRight size={13} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
