import "./EvidenceBlock.css";

function fmt(ts) {
  if (!ts || ts === "...") return "—";
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function amt(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function CallAndTransaction({ evidence }) {
  return (
    <div className="ev-grid">
      <dl className="ev-dl">
        <dt>Call</dt>
        <dd>
          <span className="ev-mono">{evidence.call.number}</span>
          <span className="ev-ts">{fmt(evidence.call.timestamp)}</span>
        </dd>
      </dl>
      <dl className="ev-dl">
        <dt>Transaction</dt>
        <dd>
          <span className="ev-mono">{amt(evidence.transaction.amount)}</span>
          <span className="ev-ts">{fmt(evidence.transaction.timestamp)}</span>
        </dd>
      </dl>
    </div>
  );
}

function TransactionList({ evidence }) {
  return (
    <table className="ev-tbl">
      <thead>
        <tr>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {evidence.transactions.map((txn, i) => (
          <tr key={i}>
            <td className="ev-mono">{amt(txn.amount)}</td>
            <td>{fmt(txn.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SocialPost({ evidence }) {
  return (
    <dl className="ev-dl">
      <dt>Tags</dt>
      <dd>
        {evidence.post.content_tags.map((t) => t.replace(/_/g, " ")).join(", ")}
      </dd>
      <dt>Posted</dt>
      <dd>{fmt(evidence.post.timestamp)}</dd>
    </dl>
  );
}

export default function EvidenceBlock({ evidence }) {
  switch (evidence.type) {
    case "call_and_transaction":
      return <CallAndTransaction evidence={evidence} />;
    case "transaction_list":
      return <TransactionList evidence={evidence} />;
    case "social_post":
      return <SocialPost evidence={evidence} />;
    default:
      return (
        <pre className="ev-raw">{JSON.stringify(evidence, null, 2)}</pre>
      );
  }
}
