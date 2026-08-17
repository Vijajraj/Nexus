import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRankings } from "../api";
import RiskBadge from "./RiskBadge";
import "./RankedList.css";

export default function RankedList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRankings()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) =>
    sortAsc ? a.risk_score - b.risk_score : b.risk_score - a.risk_score
  );

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="rankings">
      <h1 className="rankings__title">Ranked subjects</h1>

      <table className="tbl" role="grid">
        <thead>
          <tr>
            <th className="tbl__th tbl__th--rank">#</th>
            <th className="tbl__th tbl__th--name">Subject</th>
            <th
              className="tbl__th tbl__th--score"
              role="button"
              tabIndex={0}
              aria-label={`Sort by score ${sortAsc ? "descending" : "ascending"}`}
              onClick={() => setSortAsc((s) => !s)}
              onKeyDown={(e) => e.key === "Enter" && setSortAsc((s) => !s)}
            >
              Score {sortAsc ? "↑" : "↓"}
            </th>
            <th className="tbl__th tbl__th--level">Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, idx) => (
            <tr
              key={p.person_id}
              className="tbl__row"
              tabIndex={0}
              onClick={() => navigate(`/person/${p.person_id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/person/${p.person_id}`)
              }
            >
              <td className="tbl__td tbl__td--rank">{idx + 1}</td>
              <td className="tbl__td">
                <div className="tbl__name-cell">
                  <span className="tbl__primary">{p.name}</span>
                  <span className="tbl__secondary">{p.person_id}</span>
                </div>
              </td>
              <td className="tbl__td tbl__td--score">
                {p.risk_score.toFixed(2)}
              </td>
              <td className="tbl__td tbl__td--level">
                <RiskBadge score={p.risk_score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
