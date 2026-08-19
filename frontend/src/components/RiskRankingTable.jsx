import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatRiskScore, getRiskLevel, getSubjectCaseStatus } from "../utils/formatters";
import RiskBadge from "./RiskBadge";
import EmptyState from "./EmptyState";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Copy, Check, X } from "lucide-react";

/**
 * RiskRankingTable component with police sorting, searching, filtering, case statuses, and CSV export
 * @param {{ rankings: Array }} props
 */
export default function RiskRankingTable({ rankings = [] }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all"); // 'all' | 'high' | 'medium' | 'low'
  const [sortField, setSortField] = useState("risk_score"); // 'rank' | 'name' | 'person_id' | 'risk_score' | 'risk_level'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [copiedId, setCopiedId] = useState(null);

  // Keyboard shortcut: Pressing '/' focuses search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute counts for filter pills
  const counts = useMemo(() => {
    const res = { all: rankings.length, high: 0, medium: 0, low: 0 };
    rankings.forEach((p) => {
      const lvl = getRiskLevel(p.risk_score).toLowerCase();
      if (lvl === "high") res.high += 1;
      else if (lvl === "medium") res.medium += 1;
      else res.low += 1;
    });
    return res;
  }, [rankings]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "name" || field === "rank" ? "asc" : "desc");
    }
  };

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...rankings];

    // 1. Search filter (Name, Person ID, or primary factor/phone)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const idMatch = p.person_id && p.person_id.toLowerCase().includes(q);
        const factorMatch = (p.top_factors || []).some(
          (f) =>
            (f.label && f.label.toLowerCase().includes(q)) ||
            (f.feature && f.feature.toLowerCase().includes(q)) ||
            (f.evidence?.call?.number && String(f.evidence.call.number).includes(q))
        );
        return nameMatch || idMatch || factorMatch;
      });
    }

    // 2. Risk level filter
    if (riskFilter !== "all") {
      list = list.filter((p) => {
        const lvl = getRiskLevel(p.risk_score).toLowerCase();
        return lvl === riskFilter;
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "risk_score") {
        comparison = (a.risk_score || 0) - (b.risk_score || 0);
      } else if (sortField === "rank") {
        comparison = (a.rank || 0) - (b.rank || 0);
      } else if (sortField === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else if (sortField === "person_id") {
        comparison = (a.person_id || "").localeCompare(b.person_id || "");
      } else if (sortField === "risk_level") {
        comparison = (a.risk_score || 0) - (b.risk_score || 0);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [rankings, searchTerm, riskFilter, sortField, sortOrder]);

  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) return;

    const headers = [
      "Police Rank",
      "Suspect Name",
      "Entity ID",
      "Anomaly Score (%)",
      "Risk Band",
      "Police Case Status",
      "Primary Anomaly Vector",
    ];
    const rows = filteredAndSorted.map((p, idx) => {
      const caseStatus = getSubjectCaseStatus(p.person_id, p.risk_score);
      return [
        p.rank || idx + 1,
        `"${(p.name || "").replace(/"/g, '""')}"`,
        p.person_id,
        (Number(p.risk_score) * 100).toFixed(2),
        getRiskLevel(p.risk_score),
        `"${caseStatus.label}"`,
        `"${(p.top_factors?.[0]?.label || "Multi-factor anomaly").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus_police_suspect_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} style={{ opacity: 0.3, marginLeft: 4 }} />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={11} style={{ marginLeft: 4, color: "var(--brand-primary)" }} />
    ) : (
      <ArrowDown size={11} style={{ marginLeft: 4, color: "var(--brand-primary)" }} />
    );
  };

  return (
    <div className="table-container">
      {/* Controls Bar: Search, Filters, Export, Count */}
      <div className="table-controls">
        <div className="table-controls-left">
          {/* Search Box */}
          <div className="table-search-box">
            <Search size={14} color="var(--text-muted)" />
            <input
              ref={searchInputRef}
              type="text"
              className="table-search-input"
              placeholder="Search suspect, MSISDN, ID, or factor ('/' to focus)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{ padding: "2px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Risk Level Filter Tabs */}
          <div className="table-filter-group" role="tablist" aria-label="Risk Level Filters">
            <button
              className={`table-filter-btn ${riskFilter === "all" ? "active" : ""}`}
              onClick={() => setRiskFilter("all")}
              role="tab"
              aria-selected={riskFilter === "all"}
            >
              <span>All Suspects</span>
              <span className="table-filter-count">{counts.all}</span>
            </button>
            <button
              className={`table-filter-btn ${riskFilter === "high" ? "active" : ""}`}
              onClick={() => setRiskFilter("high")}
              role="tab"
              aria-selected={riskFilter === "high"}
            >
              <span>Critical (≥70%)</span>
              <span className="table-filter-count">{counts.high}</span>
            </button>
            <button
              className={`table-filter-btn ${riskFilter === "medium" ? "active" : ""}`}
              onClick={() => setRiskFilter("medium")}
              role="tab"
              aria-selected={riskFilter === "medium"}
            >
              <span>Elevated</span>
              <span className="table-filter-count">{counts.medium}</span>
            </button>
            <button
              className={`table-filter-btn ${riskFilter === "low" ? "active" : ""}`}
              onClick={() => setRiskFilter("low")}
              role="tab"
              aria-selected={riskFilter === "low"}
            >
              <span>Baseline</span>
              <span className="table-filter-count">{counts.low}</span>
            </button>
          </div>
        </div>

        <div className="table-controls-right">
          <button
            className="btn-secondary"
            onClick={handleExportCSV}
            title="Download active suspect registry as CSV"
            disabled={filteredAndSorted.length === 0}
          >
            <Download size={13} />
            <span>Export Police Brief (CSV)</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No matching suspects in registry"
          description="Try searching by name, phone MSISDN, or reset active risk level filters."
          onReset={() => {
            setSearchTerm("");
            setRiskFilter("all");
          }}
        />
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table" role="table" aria-label="Police Suspect Registry Table">
            <thead>
              <tr>
                <th
                  className="sortable"
                  style={{ width: "60px" }}
                  onClick={() => handleSort("rank")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    # {renderSortIcon("rank")}
                  </span>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort("name")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    Suspect Name {renderSortIcon("name")}
                  </span>
                </th>
                <th
                  className="sortable"
                  style={{ width: "130px" }}
                  onClick={() => handleSort("person_id")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    Entity ID {renderSortIcon("person_id")}
                  </span>
                </th>
                <th
                  className="sortable text-right"
                  style={{ width: "130px" }}
                  onClick={() => handleSort("risk_score")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end" }}>
                    Anomaly Score {renderSortIcon("risk_score")}
                  </span>
                </th>
                <th
                  className="sortable"
                  style={{ width: "100px" }}
                  onClick={() => handleSort("risk_level")}
                >
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    Risk Band {renderSortIcon("risk_level")}
                  </span>
                </th>
                <th style={{ width: "160px" }}>Police Case Status</th>
                <th>Primary Identified Factor</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((person, idx) => {
                const primaryFactor = person.top_factors?.[0]?.label || "Multi-factor anomaly pattern";
                const rankDisplay = String(person.rank || idx + 1).padStart(2, "0");
                const isCopied = copiedId === person.person_id;
                const caseStatus = getSubjectCaseStatus(person.person_id, person.risk_score);

                return (
                  <tr
                    key={person.person_id}
                    className="clickable"
                    onClick={() => navigate(`/person/${person.person_id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/person/${person.person_id}`);
                    }}
                  >
                    <td className="font-mono" style={{ color: "var(--text-muted)" }}>{rankDisplay}</td>
                    <td>
                      <span className="subject-name">{person.name}</span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span className="subject-id">{person.person_id}</span>
                        <button
                          className="copy-button"
                          onClick={(e) => handleCopyId(e, person.person_id)}
                          title="Copy ID to clipboard"
                          aria-label="Copy Subject ID"
                        >
                          {isCopied ? <Check size={12} color="var(--risk-low)" /> : <Copy size={12} />}
                        </button>
                      </span>
                    </td>
                    <td className="text-right score-cell">
                      {formatRiskScore(person.risk_score)}
                    </td>
                    <td>
                      <RiskBadge score={person.risk_score} />
                    </td>
                    <td>
                      <span className={`case-status-tag ${caseStatus.badgeClass}`}>
                        {caseStatus.label}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {primaryFactor}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
