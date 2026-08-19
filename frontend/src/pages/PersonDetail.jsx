import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPerson } from "../api";
import InvestigationHeader from "../components/InvestigationHeader";
import InvestigationSummary from "../components/InvestigationSummary";
import RiskFactorChart from "../components/RiskFactorChart";
import EvidencePanel from "../components/EvidencePanel";
import InvestigationTimeline from "../components/InvestigationTimeline";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { ArrowLeft } from "lucide-react";

/**
 * PersonDetail Page — Investigation Dossier consuming real /person/{id} API
 */
export default function PersonDetail() {
  const { personId } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadSubject = useCallback(async () => {
    if (!personId) return;
    try {
      setError(null);
      const data = await fetchPerson(personId);
      setPerson(data);
    } catch (err) {
      setError(err.message || `Failed to load dossier for ${personId}`);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [personId]);

  useEffect(() => {
    loadSubject();
  }, [loadSubject]);

  const handleRetry = () => {
    setIsRetrying(true);
    loadSubject();
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "14px" }}>
          <Link to="/rankings" className="back-link">
            <ArrowLeft size={15} />
            <span>Back to Risk Ranking</span>
          </Link>
        </div>
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div>
        <div style={{ marginBottom: "14px" }}>
          <Link to="/rankings" className="back-link">
            <ArrowLeft size={15} />
            <span>Back to Risk Ranking</span>
          </Link>
        </div>
        <ErrorState
          title={error?.includes("not found") ? "Subject Not Found in Registry" : "Unable to load dossier"}
          message={error || `No investigation dossier records found for subject ID '${personId}'. Ensure the subject exists in the registry.`}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Key Metrics */}
      <InvestigationHeader person={person} />

      <div className="dossier-grid">
        {/* Left Column: Summary Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <InvestigationSummary person={person} />
        </div>

        {/* Right Column: SHAP Factor Analysis, Supporting Evidence, Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* SHAP Feature Contribution Chart */}
          <RiskFactorChart factors={person.top_factors} />

          {/* Supporting Evidence Drilldown Cards */}
          <EvidencePanel factors={person.top_factors} />

          {/* Chronological Activity Timeline */}
          <InvestigationTimeline factors={person.top_factors} />
        </div>
      </div>
    </div>
  );
}
