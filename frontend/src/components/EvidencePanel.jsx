import { useState } from "react";
import { formatShapValue } from "../utils/formatters";
import EvidenceBlock from "./EvidenceBlock";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * EvidencePanel component displaying expandable forensic evidence cards for each top factor
 * @param {{ factors: Array }} props
 */
export default function EvidencePanel({ factors = [] }) {
  // Default first evidence card expanded
  const [expandedIndices, setExpandedIndices] = useState([0]);

  const toggleIndex = (idx) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const getSourceLabel = (type) => {
    switch (type) {
      case "call_and_transaction":
        return "Telephony + Ledger";
      case "transaction_list":
        return "Ledger Structuring";
      case "social_post":
        return "OSINT Social Post";
      default:
        return "Telemetry Artifact";
    }
  };

  if (!factors || factors.length === 0) {
    return (
      <div className="enterprise-card">
        <div className="card-header">
          <h2 className="card-title">Forensic Evidence Artifacts</h2>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            No forensic evidence artifacts linked to this dossier.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="enterprise-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Forensic Evidence Artifacts</h2>
          <p className="card-subtitle">Raw underlying telemetry records directly supporting model factor attribution</p>
        </div>
        <span className="evidence-badge font-mono">{factors.length} Artifacts</span>
      </div>

      <div className="card-body">
        <div className="evidence-list">
          {factors.map((factor, idx) => {
            const isExpanded = expandedIndices.includes(idx);
            const rawShap = factor.shap_value || 0;
            const evidenceNum = String(idx + 1).padStart(2, "0");
            const source = getSourceLabel(factor.evidence?.type);

            return (
              <div key={idx} className="evidence-card">
                <button
                  className="evidence-header-btn"
                  onClick={() => toggleIndex(idx)}
                  aria-expanded={isExpanded}
                >
                  <div className="evidence-header-left">
                    <span className="evidence-badge font-mono">#{evidenceNum}</span>
                    <span className="evidence-title">{factor.label}</span>
                  </div>

                  <div className="evidence-header-right">
                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      Source: <strong style={{ color: "var(--text-secondary)" }}>{source}</strong>
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: rawShap >= 0 ? "var(--risk-high)" : "var(--risk-low)",
                      }}
                    >
                      {formatShapValue(rawShap)}
                    </span>
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="evidence-body">
                    <EvidenceBlock evidence={factor.evidence} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
