import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorState component for API outages and request failures
 * @param {{ title?: string, message?: string, onRetry?: () => void, isRetrying?: boolean }} props
 */
export default function ErrorState({
  title = "Unable to connect to Nexus API",
  message = "The investigation service could not be reached. Ensure the FastAPI backend is running at: 127.0.0.1:8000",
  onRetry,
  isRetrying = false,
}) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-header">
        <AlertTriangle size={18} color="var(--risk-high)" />
        <h2 className="error-title">{title}</h2>
      </div>
      <p className="error-desc">{message}</p>
      {onRetry && (
        <div className="error-actions">
          <button className="btn-retry" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw size={13} className={isRetrying ? "spin" : ""} />
            <span>{isRetrying ? "Reconnecting..." : "Retry Connection"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
