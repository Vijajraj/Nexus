import { formatRiskScore, generateEvidenceHash } from "../utils/formatters";
import RiskBadge from "./RiskBadge";
import { ShieldCheck, Lock } from "lucide-react";

/**
 * InvestigationSummary component providing police case parameters and digital chain of custody
 * @param {{ person: Object }} props
 */
export default function InvestigationSummary({ person }) {
  if (!person) return null;

  const hashDigest = generateEvidenceHash(person);

  return (
    <div>
      <div className="enterprise-card summary-panel">
        <div className="card-header">
          <div>
            <h2 className="card-title">Police Case File Parameters</h2>
            <p className="card-subtitle">Official entity registry & investigative metadata</p>
          </div>
        </div>
        <div className="card-body">
          <dl className="summary-dl">
            <div className="summary-row">
              <dt className="summary-dt">Case Reference ID</dt>
              <dd className="summary-dd font-mono" style={{ color: "var(--brand-primary)", fontWeight: 700 }}>
                CCFIU/PE-2026/NX-{person.person_id.toUpperCase()}
              </dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Suspect Name</dt>
              <dd className="summary-dd">{person.name}</dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Entity Identification Code</dt>
              <dd className="summary-dd font-mono">{person.person_id}</dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Population Threat Rank</dt>
              <dd className="summary-dd font-mono">#{person.rank} of 35 monitored targets</dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Calculated Anomaly Probability</dt>
              <dd className="summary-dd font-mono">{formatRiskScore(person.risk_score)}</dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Threat Band Classification</dt>
              <dd className="summary-dd" style={{ marginTop: "4px" }}>
                <RiskBadge score={person.risk_score} />
              </dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Active Anomaly Vectors</dt>
              <dd className="summary-dd font-mono">{person.top_factors?.length || 0} forensic indicators</dd>
            </div>

            <div className="summary-row">
              <dt className="summary-dt">Attribution Engine</dt>
              <dd className="summary-dd font-mono" style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                XGBoost + TreeSHAP (v0.42)
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Digital Chain of Custody & Evidence Seal Card */}
      <div className="chain-of-custody-card">
        <div className="chain-header">
          <ShieldCheck size={14} color="var(--risk-low)" />
          <span>Evidence Chain of Custody</span>
        </div>
        <div className="chain-hash-box">
          {hashDigest}
        </div>
        <p className="chain-meta-text">
          <Lock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
          Digitally authenticated by CCFIU Forensic Node. Legally admissible under Section 65B of Indian Evidence Act (Sec 63 Bharatiya Sakshya Adhiniyam).
        </p>
      </div>
    </div>
  );
}
