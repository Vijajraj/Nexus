import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchRankings } from "../api";
import { getRiskLevel, formatRiskScore } from "../utils/formatters";
import MetricCard from "../components/MetricCard";
import RiskDistribution from "../components/RiskDistribution";
import PriorityInvestigations from "../components/PriorityInvestigations";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { Shield, AlertTriangle, Radio, TrendingUp, ArrowRight } from "lucide-react";

/**
 * Overview Page — Police Hackathon MVP Crime Triage Dashboard
 */
export default function Overview() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRankings();
      setRankings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load suspect registry");
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetry = () => {
    setIsRetrying(true);
    loadData();
  };

  if (loading) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Police Crime & Anomaly Triage</h1>
          <p className="page-subtitle">Continuous CDR burst analysis, financial structuring detection, and OSINT behavioral signals.</p>
        </header>
        <LoadingState variant="overview" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Police Crime & Anomaly Triage</h1>
          <p className="page-subtitle">Continuous CDR burst analysis, financial structuring detection, and OSINT behavioral signals.</p>
        </header>
        <ErrorState
          title="Unable to connect to Nexus Police Forensic Core"
          message="The local forensic telemetry node could not be reached. Ensure the FastAPI backend is running on: 127.0.0.1:8000"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

  // Calculate dynamic summary metrics from real API response
  const totalSubjects = rankings.length;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let scoreSum = 0;

  rankings.forEach((person) => {
    const level = getRiskLevel(person.risk_score);
    if (level === "HIGH") highRiskCount += 1;
    else if (level === "MEDIUM") mediumRiskCount += 1;
    scoreSum += person.risk_score || 0;
  });

  const avgRisk = totalSubjects > 0 ? scoreSum / totalSubjects : 0;
  const highRiskPct = totalSubjects > 0 ? Math.round((highRiskCount / totalSubjects) * 100) : 0;

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Forensic Crime Triage & Surveillance Overview</h1>
        <p className="page-subtitle">Automated multi-modal detection of financial structuring, coordinated burner calls, and lifestyle discrepancy vectors.</p>
      </header>

      {/* Critical Triage Callout Banner (when high risk entities are flagged) */}
      {highRiskCount > 0 && (
        <div className="operational-banner" role="alert">
          <div className="operational-banner-left">
            <AlertTriangle size={18} color="var(--risk-high)" />
            <div>
              <div className="operational-banner-title">
                ACTION REQUIRED: {highRiskCount} Prime Suspects Flagged for Interception & Section 91 Cr.P.C. Requisition (Score ≥ 70%)
              </div>
              <div className="operational-banner-desc">
                High-confidence multi-vector anomalies detected: Rapid telephony bursts immediately preceding large banking settlements and declared income mismatches.
              </div>
            </div>
          </div>
          <Link to="/rankings" className="operational-banner-btn">
            <span>Open Interception Queue</span>
            <ArrowRight size={12} style={{ display: "inline", marginLeft: "4px" }} />
          </Link>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <section className="metrics-grid" aria-label="Population Risk KPI Metrics">
        <MetricCard
          label="Registered Suspects"
          value={totalSubjects}
          footerText="Monitored entity population"
          icon={<Shield size={15} />}
        />
        <MetricCard
          label="Flagged for Interception"
          value={highRiskCount}
          variant="high"
          footerText={`${highRiskPct}% of suspect registry`}
          icon={<AlertTriangle size={15} color="var(--risk-high)" />}
        />
        <MetricCard
          label="Active Surveillance"
          value={mediumRiskCount}
          variant="med"
          footerText="Score 40% – 69%"
          icon={<Radio size={15} color="var(--risk-med)" />}
        />
        <MetricCard
          label="Mean Anomaly Probability"
          value={formatRiskScore(avgRisk)}
          footerText="Calibrated baseline probability"
          icon={<TrendingUp size={15} />}
        />
      </section>

      {/* Risk Distribution Breakdown */}
      <section style={{ marginBottom: "20px" }}>
        <RiskDistribution rankings={rankings} />
      </section>

      {/* Priority Investigations Triage Queue */}
      <section>
        <PriorityInvestigations rankings={rankings} />
      </section>
    </div>
  );
}
