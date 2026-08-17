import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPerson } from "../api";
import RiskBadge from "./RiskBadge";
import ShapChart from "./ShapChart";
import EvidenceBlock from "./EvidenceBlock";
import "./PersonDetail.css";

export default function PersonDetail() {
  const { personId } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPerson(personId)
      .then(setPerson)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [personId]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!person) return null;

  return (
    <article className="detail">
      <Link to="/" className="detail__back" aria-label="Back to rankings">
        ← Rankings
      </Link>

      <header className="detail__header">
        <div>
          <h1 className="detail__name">{person.name}</h1>
          <p className="detail__meta">
            <span className="detail__id">{person.person_id}</span>
            <span className="detail__dot">·</span>
            <span>Rank {person.rank}</span>
          </p>
        </div>
        <div className="detail__score-block">
          <span className="detail__score">{person.risk_score.toFixed(2)}</span>
          <RiskBadge score={person.risk_score} />
        </div>
      </header>

      <section className="detail__section">
        <h2 className="detail__heading">Contributing factors</h2>
        <ShapChart factors={person.top_factors} />
      </section>

      <section className="detail__section">
        <h2 className="detail__heading">Evidence</h2>
        <div className="ev-list">
          {person.top_factors.map((factor, idx) => (
            <div
              key={factor.feature}
              className={`ev-item ${expanded === idx ? "ev-item--open" : ""}`}
            >
              <button
                className="ev-item__toggle"
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                aria-expanded={expanded === idx}
              >
                <span className="ev-item__label">{factor.label}</span>
                <span className="ev-item__shap">
                  {factor.shap_value.toFixed(2)}
                </span>
                <span className="ev-item__caret" aria-hidden="true">
                  {expanded === idx ? "−" : "+"}
                </span>
              </button>
              {expanded === idx && (
                <div className="ev-item__body">
                  <EvidenceBlock evidence={factor.evidence} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
