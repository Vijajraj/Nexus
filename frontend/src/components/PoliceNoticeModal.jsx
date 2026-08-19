import { useState } from "react";
import { generateSection91Notice, generateEvidenceHash } from "../utils/formatters";
import { X, Copy, Check, Printer, FileText, ShieldCheck } from "lucide-react";

/**
 * PoliceNoticeModal — Generates formal Section 91 CrPC / Section 94 BNSS Requisition Notice for Hackathon MVP
 * @param {{ person: Object, isOpen: boolean, onClose: () => void }} props
 */
export default function PoliceNoticeModal({ person, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [officerName, setOfficerName] = useState("Insp. V. Raj, CCFIU");

  if (!isOpen || !person) return null;

  const noticeText = generateSection91Notice(person, officerName);
  const hashDigest = generateEvidenceHash(person);

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="notice-modal-title">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="modal-icon-wrap" aria-hidden="true">
              <FileText size={18} />
            </div>
            <div>
              <h3 id="notice-modal-title" className="modal-title">
                Section 91 Cr.P.C. / BNSS 94 Requisition Notice
              </h3>
              <p className="modal-subtitle">
                Official statutory demand to Telecom Service Providers & Banking Intermediaries
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="notice-controls-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Investigating Officer (IO):
            </span>
            <input
              type="text"
              className="notice-io-input"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="Officer Name & Designation"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn-secondary" onClick={handleCopy}>
              {copied ? <Check size={13} color="var(--risk-low)" /> : <Copy size={13} />}
              <span>{copied ? "Copied to Clipboard" : "Copy Notice Text"}</span>
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={13} />
              <span>Print Official Requisition</span>
            </button>
          </div>
        </div>

        {/* Notice Preview Body */}
        <div className="notice-preview-container">
          <div className="notice-stamp-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} color="var(--risk-low)" />
              <span className="font-mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                Digital Hash Digest: {hashDigest.slice(0, 36)}...
              </span>
            </div>
            <span className="notice-legal-tag">COURT ADMISSIBLE (SEC 65B IEA / BSA 63)</span>
          </div>

          <pre className="notice-preformatted-text font-mono">
            {noticeText}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            Case Ref: <strong>CCFIU/PE-2026/NX-{person.person_id.toUpperCase()}</strong> · Monitored Entity: {person.name}
          </span>
          <button className="btn-primary-dark" onClick={onClose}>
            Done / Return to Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
