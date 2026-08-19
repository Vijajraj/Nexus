import { useState, useEffect, useCallback } from "react";
import { fetchRankings } from "../api";
import RiskRankingTable from "../components/RiskRankingTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

/**
 * Rankings Page — Dedicated Risk Ranking view consuming real /rankings API
 */
export default function Rankings() {
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
      setError(err.message || "Failed to load risk rankings");
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
          <h1 className="page-title">Risk Ranking</h1>
          <p className="page-subtitle">Ranked population indexed by calibrated behavioral anomaly probability.</p>
        </header>
        <LoadingState variant="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="page-header">
          <h1 className="page-title">Risk Ranking</h1>
          <p className="page-subtitle">Ranked population indexed by calibrated behavioral anomaly probability.</p>
        </header>
        <ErrorState
          title="Unable to connect to Nexus API"
          message="The investigation service could not be reached. Ensure the FastAPI backend is running at: 127.0.0.1:8000"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Risk Ranking</h1>
        <p className="page-subtitle">Comprehensive registry of monitored subjects sorted by composite risk probability and primary indicators.</p>
      </header>

      <RiskRankingTable rankings={rankings} />
    </div>
  );
}
