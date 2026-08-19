import { useMemo } from "react";
import { formatCurrency, formatTimestamp, formatTag } from "../utils/formatters";
import { Phone, CreditCard, Share2, Clock } from "lucide-react";

/**
 * InvestigationTimeline component deriving chronological events strictly from evidence
 * @param {{ factors: Array }} props
 */
export default function InvestigationTimeline({ factors = [] }) {
  const timelineEvents = useMemo(() => {
    const events = [];

    factors.forEach((factor, fIdx) => {
      const ev = factor.evidence;
      if (!ev) return;

      if (ev.type === "call_and_transaction") {
        if (ev.call?.timestamp) {
          events.push({
            id: `call-${fIdx}`,
            type: "CALL",
            timestamp: new Date(ev.call.timestamp).getTime(),
            rawTimestamp: ev.call.timestamp,
            title: "Telephony CDR Contact",
            description: `Voice call event with ${ev.call.number}`,
            factorLabel: factor.label,
          });
        }
        if (ev.transaction?.timestamp) {
          events.push({
            id: `txn-${fIdx}`,
            type: "TRANSACTION",
            timestamp: new Date(ev.transaction.timestamp).getTime(),
            rawTimestamp: ev.transaction.timestamp,
            title: "Banking Ledger Transaction",
            description: `Settlement amount: ${formatCurrency(ev.transaction.amount)}`,
            factorLabel: factor.label,
          });
        }
      } else if (ev.type === "transaction_list") {
        (ev.transactions || []).forEach((t, tIdx) => {
          if (t.timestamp) {
            events.push({
              id: `txnlist-${fIdx}-${tIdx}`,
              type: "TRANSACTION",
              timestamp: new Date(t.timestamp).getTime(),
              rawTimestamp: t.timestamp,
              title: "Structuring Ledger Transfer",
              description: `Settlement amount: ${formatCurrency(t.amount)}`,
              factorLabel: factor.label,
            });
          }
        });
      } else if (ev.type === "social_post") {
        if (ev.post?.timestamp) {
          const tags = (ev.post.content_tags || []).map(formatTag).join(", ");
          events.push({
            id: `social-${fIdx}`,
            type: "SOCIAL",
            timestamp: new Date(ev.post.timestamp).getTime(),
            rawTimestamp: ev.post.timestamp,
            title: "OSINT Social Publication",
            description: tags ? `Lifestyle indicators: ${tags}` : "Lifestyle publication event",
            factorLabel: factor.label,
          });
        }
      }
    });

    // Sort descending by timestamp
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events;
  }, [factors]);

  if (timelineEvents.length === 0) {
    return null;
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "CALL":
        return <Phone size={12} color="var(--brand-primary)" />;
      case "TRANSACTION":
        return <CreditCard size={12} color="var(--brand-primary)" />;
      case "SOCIAL":
        return <Share2 size={12} color="var(--brand-primary)" />;
      default:
        return <Clock size={12} />;
    }
  };

  return (
    <div className="enterprise-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Chronological Activity Sequence</h2>
          <p className="card-subtitle">Unified temporal audit trail reconstructed from underlying forensic logs</p>
        </div>
        <span className="evidence-badge font-mono">{timelineEvents.length} Events</span>
      </div>

      <div className="card-body">
        <div className="timeline-list">
          {timelineEvents.map((evt) => (
            <div key={evt.id} className="timeline-item">
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="timeline-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {getEventIcon(evt.type)}
                    <span className="timeline-type">{evt.title}</span>
                  </div>
                  <span className="timeline-ts">{formatTimestamp(evt.rawTimestamp)}</span>
                </div>
                <div className="timeline-desc">
                  <strong>{evt.description}</strong>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Associated indicator: {evt.factorLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
