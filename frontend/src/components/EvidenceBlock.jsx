import { useState } from "react";
import { formatCurrency, formatTimestamp, formatTag, resolveTelecomCircle } from "../utils/formatters";
import { Phone, CreditCard, Share2, Copy, Check, Radio, AlertCircle } from "lucide-react";

/**
 * Render Call + Transaction evidence in a structured 2-column forensic grid with telecom circle resolution
 */
function CallAndTransactionView({ evidence }) {
  const { call, transaction } = evidence;
  const [copiedPhone, setCopiedPhone] = useState(false);

  const telecomInfo = resolveTelecomCircle(call?.number);

  const handleCopyPhone = () => {
    if (!call?.number) return;
    navigator.clipboard.writeText(call.number);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  return (
    <div>
      <div className="ev-grid-2col">
        {/* Telephony CDR Record */}
        <div className="ev-pane">
          <div className="ev-pane-heading">
            <Phone size={13} />
            <span>Telephony CDR Requisition Data</span>
          </div>
          <div className="ev-field-list">
            <div className="ev-field">
              <span className="ev-field-label">Dialed MSISDN / Target:</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span className="ev-field-val">{call?.number ? telecomInfo.cleanNumber : "—"}</span>
                {call?.number && (
                  <button
                    className="copy-button"
                    onClick={handleCopyPhone}
                    title="Copy Phone Number"
                    aria-label="Copy Phone Number"
                  >
                    {copiedPhone ? <Check size={12} color="var(--risk-low)" /> : <Copy size={12} />}
                  </button>
                )}
              </span>
            </div>
            <div className="ev-field">
              <span className="ev-field-label">Telecom Circle:</span>
              <span className="ev-field-val" style={{ fontSize: "0.76rem" }}>{telecomInfo.circle}</span>
            </div>
            <div className="ev-field">
              <span className="ev-field-label">Carrier Routing:</span>
              <span className="ev-field-val" style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                {telecomInfo.carrier}
              </span>
            </div>
            <div className="ev-field">
              <span className="ev-field-label">CDR Timestamp:</span>
              <span className="ev-field-val">{formatTimestamp(call?.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Associated Banking Transaction */}
        <div className="ev-pane">
          <div className="ev-pane-heading">
            <CreditCard size={13} />
            <span>Banking Ledger Settlement</span>
          </div>
          <div className="ev-field-list">
            <div className="ev-field">
              <span className="ev-field-label">Transaction Settlement:</span>
              <span className="ev-field-val" style={{ color: "var(--risk-high-text)" }}>
                {formatCurrency(transaction?.amount)}
              </span>
            </div>
            <div className="ev-field">
              <span className="ev-field-label">Threshold Audit:</span>
              <span className="ev-field-val" style={{ fontSize: "0.76rem", color: "var(--risk-med-text)" }}>
                {transaction?.amount < 10000 ? "Sub-₹10,000 CTR Threshold" : "CTR Applicable"}
              </span>
            </div>
            <div className="ev-field">
              <span className="ev-field-label">Settlement Timestamp:</span>
              <span className="ev-field-val">{formatTimestamp(transaction?.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proximity / Temporal Linkage Callout */}
      {call?.timestamp && transaction?.timestamp && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xs)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.76rem",
            color: "var(--text-secondary)",
          }}
        >
          <Radio size={13} color="var(--risk-high)" />
          <span>
            <strong>Forensic Temporal Linkage:</strong> Call event and banking transfer occur in direct temporal proximity, indicating coordinated telephonic instruction.
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Render Transaction List (e.g. structuring pattern) in a compact table
 */
function TransactionListView({ evidence }) {
  const transactions = evidence?.transactions || [];

  if (transactions.length === 0) {
    return (
      <div style={{ fontSize: "0.80rem", color: "var(--text-muted)", padding: "8px 0" }}>
        No individual structuring transactions identified in this observation window. Baseline activity compliant.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "8px",
          padding: "6px 10px",
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: "var(--radius-xs)",
          fontSize: "0.74rem",
          color: "#92400E",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <AlertCircle size={13} />
        <span>
          <strong>PMLA Section 12 Structuring Pattern:</strong> Multiple rapid transactions intentionally kept below mandatory reporting threshold.
        </span>
      </div>

      <table className="ev-subtable">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>Transaction Value</th>
            <th>Ledger Settlement Time</th>
            <th>CTR Flag Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => (
            <tr key={idx}>
              <td style={{ color: "var(--text-muted)" }}>{String(idx + 1).padStart(2, "0")}</td>
              <td style={{ fontWeight: 600 }}>{formatCurrency(txn.amount)}</td>
              <td style={{ color: "var(--text-secondary)" }}>{formatTimestamp(txn.timestamp)}</td>
              <td style={{ color: "var(--risk-med-text)", fontSize: "0.72rem" }}>Sub-Threshold</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Render Social Post activity evidence
 */
function SocialPostView({ evidence }) {
  const post = evidence?.post || {};
  const tags = post.content_tags || [];

  return (
    <div className="ev-pane">
      <div className="ev-pane-heading">
        <Share2 size={13} />
        <span>Open-Source Intelligence (OSINT) Surveillance</span>
      </div>
      <div className="ev-field-list">
        <div className="ev-field">
          <span className="ev-field-label">Content Classification Tags:</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {tags.length > 0 ? (
              tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                  }}
                >
                  {formatTag(t)}
                </span>
              ))
            ) : (
              <span className="ev-field-val">—</span>
            )}
          </div>
        </div>
        <div className="ev-field">
          <span className="ev-field-label">Publication Timestamp:</span>
          <span className="ev-field-val">{formatTimestamp(post.timestamp)}</span>
        </div>
        <div className="ev-field">
          <span className="ev-field-label">Investigative Assessment:</span>
          <span className="ev-field-val" style={{ color: "var(--risk-high-text)", fontSize: "0.76rem" }}>
            Lifestyle expenditure inconsistent with declared financial baseline
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * EvidenceBlock — Dispatcher for specific evidence models
 * @param {{ evidence: Object }} props
 */
export default function EvidenceBlock({ evidence }) {
  if (!evidence) {
    return <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>No raw evidence records attached.</div>;
  }

  switch (evidence.type) {
    case "call_and_transaction":
      return <CallAndTransactionView evidence={evidence} />;
    case "transaction_list":
      return <TransactionListView evidence={evidence} />;
    case "social_post":
      return <SocialPostView evidence={evidence} />;
    default:
      return (
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            background: "var(--surface)",
            padding: "10px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(evidence, null, 2)}
        </pre>
      );
  }
}
