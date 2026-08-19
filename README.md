# NEXUS · Police Forensic Intelligence Console
### Cyber Crime & Financial Investigation Division (CCFID) — Police Hackathon MVP

Nexus is an advanced behavioral anomaly detection and financial crime investigation platform designed for law enforcement agencies, cyber crime cells, and forensic intelligence units.

---

## 🌟 Key Capabilities

1. **Behavioral & Financial Risk Triage:**
   - Detects synchronized telephony bursts preceding high-value financial transfers.
   - Identifies sub-threshold structuring patterns under Section 12 of the Prevention of Money Laundering Act (PMLA).
   - Flags lifestyle expenditure discrepancies against declared baselines using Open-Source Intelligence (OSINT) tags.

2. **Statutory Requisition Generator (Section 91 Cr.P.C. / Section 94 BNSS):**
   - Automated modal generating court-ready legal notices to Telecom Service Providers (TSPs) and Banking Intermediaries.
   - Prepopulates dialed MSISDNs, CDR timestamps, settlement amounts, and case references.
   - Includes deterministic SHA-256 digital custody digests compliant with Section 65B of the Indian Evidence Act / Section 63 BSA.

3. **Multi-Vector Suspect Registry & Police Briefs:**
   - Multi-field search by suspect name, entity ID, MSISDN, or anomaly keywords (e.g., `structuring`, `burst`).
   - One-click CSV export of active suspect registries.
   - Dynamic case status management (`Flagged for Interception`, `Preliminary Inquiry`, `FIR Registered`, `Active Surveillance`, `Baseline Monitoring`).

4. **Anti-AI-Slop White Theme Design:**
   - Professional, high-contrast, institutional white/light theme.
   - Clear typography (Inter + JetBrains Mono), precision tabular metrics, and surgical 1px borders.

---

## 🛠️ Tech Stack

- **Backend:** Python 3, FastAPI, Uvicorn, TreeSHAP / XGBoost Attribution
- **Frontend:** React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS Design System

---

## 🚀 Quick Start Guide

### 1. Backend Service (FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
*The backend server will start on `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Console (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 📋 API Endpoints

- `GET /rankings` — Retrieve all monitored suspects sorted by composite anomaly risk score.
- `GET /person/{person_id}` — Retrieve detailed forensic dossier, TreeSHAP factors, and evidence logs for a single entity.

---

## ⚖️ Legal & Compliance Framework

- **Section 91 Cr.P.C. / Section 94 BNSS:** Statutory production of electronic records.
- **Section 65B Indian Evidence Act / Section 63 BSA:** Admissibility of electronic records and chain of custody.
- **Section 12 PMLA:** Cash transaction reporting and anti-structuring compliance.