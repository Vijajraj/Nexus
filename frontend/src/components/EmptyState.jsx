import { Search } from "lucide-react";

/**
 * EmptyState component for 0 search matches or empty lists
 * @param {{ title?: string, description?: string, onReset?: () => void }} props
 */
export default function EmptyState({
  title = "No subjects available",
  description = "There are currently no investigation records to display.",
  onReset,
}) {
  return (
    <div className="empty-state">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px", color: "var(--text-muted)" }}>
        <Search size={28} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {onReset && (
        <button
          className="btn-secondary"
          onClick={onReset}
          style={{ display: "inline-flex", margin: "0 auto" }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
