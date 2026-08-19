/**
 * Nexus Police Risk Intelligence & Forensic Console — Formatting & Legal Utilities
 * Police Hackathon MVP Edition
 */

export const FEATURE_NAMES = {
  call_burst_score: "Call Burst Velocity (CDR)",
  new_contact_ratio: "Unknown Contact Communication",
  txn_spike_score: "Banking Ledger Spike Magnitude",
  structuring_flag: "Sub-Threshold Structuring (PMLA Sec 12)",
  call_txn_proximity: "CDR-to-Banking Temporal Proximity",
  social_lifestyle_flag: "OSINT Lifestyle / Income Discrepancy",
};

/**
 * Police Case Status Options
 */
export const POLICE_CASE_STATUSES = [
  { id: "INTERCEPT_FLAGGED", label: "Flagged for Interception", variant: "high", badgeClass: "status-tag--intercept" },
  { id: "PE_INITIATED", label: "Preliminary Inquiry (PE)", variant: "med", badgeClass: "status-tag--pe" },
  { id: "FIR_REGISTERED", label: "FIR Registered", variant: "high", badgeClass: "status-tag--fir" },
  { id: "ACTIVE_SURVEILLANCE", label: "Active Surveillance", variant: "med", badgeClass: "status-tag--surveillance" },
  { id: "BASELINE_MONITOR", label: "Baseline Monitoring", variant: "low", badgeClass: "status-tag--baseline" },
];

/**
 * Retrieve case status from localStorage or compute default based on risk score
 */
export function getSubjectCaseStatus(personId, riskScore) {
  if (!personId) return POLICE_CASE_STATUSES[4];
  const saved = localStorage.getItem(`nexus_case_status_${personId}`);
  if (saved) {
    const found = POLICE_CASE_STATUSES.find((s) => s.id === saved);
    if (found) return found;
  }
  const score = Number(riskScore) || 0;
  if (score >= 0.90) return POLICE_CASE_STATUSES[0]; // Intercept Flagged
  if (score >= 0.70) return POLICE_CASE_STATUSES[1]; // PE Initiated
  if (score >= 0.40) return POLICE_CASE_STATUSES[3]; // Active Surveillance
  return POLICE_CASE_STATUSES[4]; // Baseline Monitor
}

/**
 * Save case status to localStorage
 */
export function setSubjectCaseStatus(personId, statusId) {
  if (!personId || !statusId) return;
  localStorage.setItem(`nexus_case_status_${personId}`, statusId);
}

/**
 * Determine risk level category ('HIGH', 'MEDIUM', 'LOW')
 */
export function getRiskLevel(score) {
  const num = Number(score) || 0;
  if (num >= 0.70) return "HIGH";
  if (num >= 0.40) return "MEDIUM";
  return "LOW";
}

/**
 * Format score as percentage with 2 decimal places (e.g. 0.9516 -> "95.16%")
 */
export function formatRiskScore(score) {
  if (score === null || score === undefined || isNaN(score)) return "0.00%";
  return `${(Number(score) * 100).toFixed(2)}%`;
}

/**
 * Format SHAP contribution value with explicit positive sign (e.g. 0.8975 -> "+0.90", -0.5218 -> "-0.52")
 */
export function formatShapValue(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  const num = Number(val);
  const formatted = num.toFixed(2);
  return num > 0 ? `+${formatted}` : formatted;
}

/**
 * Format Indian currency with rupee symbol (e.g. 9525.02 -> "₹9,525.02", 45000 -> "₹45,000")
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  const num = Number(amount);
  const isFractional = num % 1 !== 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: isFractional ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format ISO timestamp to standard police investigative format: "27 Aug 2026, 05:12:00 IST"
 */
export function formatTimestamp(ts) {
  if (!ts || ts === "...") return "—";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " IST";
  } catch {
    return String(ts);
  }
}

/**
 * Format date-only part: "27 Aug 2026"
 */
export function formatDateOnly(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(ts);
  }
}

/**
 * Convert snake_case tag to Capitalized Words (e.g. "luxury_item" -> "Luxury Item")
 */
export function formatTag(tag) {
  if (!tag) return "";
  return String(tag)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Telecom Circle & MSISDN resolver helper for Indian law enforcement
 */
export function resolveTelecomCircle(phone) {
  if (!phone) return { cleanNumber: "—", circle: "Unknown Telecom Circle", carrier: "TSP Unassigned" };
  const clean = String(phone).replace(/\D/g, "");
  let circle = "National Wireless Grid";
  let carrier = "TSP / Telecom Intermediary";

  if (clean.startsWith("91")) {
    const prefix = clean.slice(2, 4);
    if (["98", "99", "97"].includes(prefix)) {
      circle = "Delhi NCR Circle";
      carrier = "Airtel / Jio Core";
    } else if (["91", "92", "93"].includes(prefix)) {
      circle = "Mumbai / Maharashtra Circle";
      carrier = "Vodafone Idea / Jio Core";
    } else if (["70", "72", "73"].includes(prefix)) {
      circle = "Karnataka / Bangalore Circle";
      carrier = "Airtel Digital";
    } else {
      circle = "North India Telecom Zone";
      carrier = "Standard Licensed TSP";
    }
  } else {
    circle = "Inter-State / Roaming Grid";
    carrier = "National Cellular Carrier";
  }

  return { cleanNumber: `+${clean}`, circle, carrier };
}

/**
 * Deterministic Forensic Evidence SHA-256 Digest Simulation (Section 65B IEA / BSA 63)
 */
export function generateEvidenceHash(person) {
  if (!person) return "0x00000000000000000000000000000000";
  const seed = `${person.person_id}_${person.name}_${person.risk_score}_${(person.top_factors || []).length}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, "0");
  return `SHA256:7f8e${hexPart}9b2c4a1e0f3d6c8b9a2e4f5a6b7c8d9e0f1a2b3c4d5e6f7`;
}

/**
 * Generate Section 91 CrPC / Section 94 BNSS Formal Requisition Notice Text
 */
export function generateSection91Notice(person, targetOfficer = "Inspector V. Raj") {
  if (!person) return "";

  const timestamp = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const cdrEvidence = person.top_factors?.find((f) => f.evidence?.call)?.evidence?.call;
  const txnEvidence = person.top_factors?.find((f) => f.evidence?.transaction)?.evidence?.transaction;

  return `FORM OF REQUISITION / NOTICE UNDER SECTION 91 Cr.P.C. / SECTION 94 BNSS
OFFICE OF THE ASSISTANT COMMISSIONER OF POLICE / INVESTIGATING OFFICER
CYBER CRIME & FINANCIAL INTELLIGENCE UNIT (CCFIU)
================================================================================
Case Reference   : CCFIU/PE-2026/NX-${person.person_id.toUpperCase()}
Date of Issuance : ${timestamp}
Subject Entity   : ${person.name} (Entity ID: ${person.person_id})
Assigned IO      : ${targetOfficer}, CCFIU Forensic Cell

TO,
1. THE NODAL OFFICER, TELECOM SERVICE PROVIDER (TSP)
2. THE COMPLIANCE & NODAL OFFICER, DESIGNATED BANKING INTERMEDIARY

WHEREAS an active preliminary investigation is ongoing into suspected financial
structuring, coordinated telephony bursts, and digital crime syndicates involving
the aforementioned subject entity (Calculated Anomaly Probability: ${(Number(person.risk_score) * 100).toFixed(2)}%).

YOU ARE HEREBY REQUIRED under Section 91 of the Code of Criminal Procedure, 1973
(read with Section 94 of Bharatiya Nagarik Suraksha Sanhita, 2023) to produce and
furnish the following authenticated electronic evidence:

1. TELEPHONY / CDR REQUISITION:
   - Complete Call Detail Records (CDR) with Tower Cell ID locations.
   - Subscriber Identity Module (SIM) Customer Acquisition Form (CAF) & Aadhaar e-KYC.
   - Flagged Target MSISDN: ${cdrEvidence?.number ? `+${cdrEvidence.number}` : "All associated MSISDN linkages"}.
   - Observed Anomaly Timestamp: ${formatTimestamp(cdrEvidence?.timestamp)}.

2. BANKING & TRANSACTION LEDGER REQUISITION:
   - Certified Bank Account Statement with counterpart beneficiary details.
   - IPDR Logs & Geo-coordinates for Netbanking / UPI sessions.
   - Flagged Transaction Reference: ${txnEvidence?.amount ? formatCurrency(txnEvidence.amount) : "All ledger debits/credits"} at ${formatTimestamp(txnEvidence?.timestamp)}.

This requisition is legally binding. Failure to comply shall attract penal proceedings
under Section 175/176 of the Indian Penal Code / Section 210/211 BNS.

Issued under the Seal of the Investigating Authority,
Cyber Crime & Financial Intelligence Division.
Digital Hash Digest: ${generateEvidenceHash(person)}`;
}
