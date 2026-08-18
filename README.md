# Nexus — Risk Intelligence & Anomaly Detection Platform

Nexus is an end-to-end investigative anomaly detection system designed to uncover suspicious financial and behavioral patterns. It combines synthetic data generation, automated feature engineering, explainable machine learning (XGBoost + SHAP), and an interactive investigation dashboard.

---

## Key Features

- **Synthetic Data Generation**: Simulates realistic multi-table relational records (people, phone calls, financial transactions, and social media posts) using Faker.
- **Planted Anomaly Patterns**:
  - *Call-to-Transaction Proximity & Lifestyle Flags*: Unfamiliar calls followed quickly by anomalous transaction spikes and subsequent luxury social posts.
  - *Structuring (Smurfing)*: Multiple repeated transactions just below legal reporting thresholds (₹45,000–₹49,999).
- **Explainable ML (XGBoost + SHAP)**: Computes personalized risk scores (0–100%) and feature attribution values (TreeExplainer) explaining why an individual is high risk.
- **Evidence Dossier System**: Maps each risk factor directly to the raw evidence records (`call_and_transaction`, `transaction_list`, `social_post`).
- **Interactive UI**: Clean, responsive React dashboard with sortable risk rankings, SHAP breakdown charts, and deep-dive evidence views.

---

## Quickstart Guide

### Prerequisites
Make sure you have installed on your computer:
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

---

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/Vijajraj/Nexus.git
cd Nexus

# Install Python requirements
pip install -r requirements.txt
```

---

### Step 2: Start the Full-Stack Application

Launch both the **FastAPI Backend** and the **React Frontend** with a single command:

```bash
python run_dev.py
```

Once running, open your web browser:
- **Web Dashboard**: http://localhost:5173
- **API Documentation (Swagger UI)**: http://127.0.0.1:8000/docs
- **Risk Rankings API Endpoint**: http://127.0.0.1:8000/rankings

*To stop the servers, press `Ctrl + C`.*

---

## Running the Data & ML Pipeline Manually

If you want to generate fresh synthetic data, re-engineer features, retrain the XGBoost model, and compile a new `dossier.json`:

```bash
python run_pipeline.py
```

### Pipeline Workflow:
1. `src/generate_data.py`: Creates `people.csv`, `calls.csv`, `transactions.csv`, and `social_posts.csv` under `data/`.
2. `src/feature_engineering.py`: Computes 6 behavioral risk features saved to `data/features.csv`.
3. `src/train_model.py`: Fits an XGBoost model and calculates SHAP values, saved to `data/predictions_shap.csv`.
4. `src/generate_dossier.py`: Generates the validated `dossier.json` and updates `backend/dossier.json`.

---

## Running Unit Tests

Run the automated test suite to verify data schemas, feature contrast, model accuracy, and API contracts:

```bash
python tests/test_pipeline.py
```

---

## Repository Structure

```
Nexus/
├── backend/
│   ├── main.py              # FastAPI server serving /rankings and /person/{id}
│   ├── dossier.json         # Active dossier dataset served to frontend
│   └── requirements.txt     # Backend web server requirements
├── data/                    # Generated relational datasets and features
│   ├── people.csv
│   ├── calls.csv
│   ├── transactions.csv
│   ├── social_posts.csv
│   ├── features.csv
│   └── predictions_shap.csv
├── frontend/                # React 19 + Vite dashboard application
│   ├── src/
│   │   ├── components/      # UI components (RankedList, ShapChart, EvidenceBlock, etc.)
│   │   ├── api.js           # API client connecting to FastAPI backend
│   │   └── App.jsx          # Main application layout
│   └── package.json
├── src/                     # Core Data & ML Pipeline scripts
│   ├── generate_data.py     # 1. Synthetic dataset generator
│   ├── feature_engineering.py # 2. Feature engineering script
│   ├── train_model.py       # 3. Model training & SHAP analyzer
│   └── generate_dossier.py  # 4. Dossier JSON compiler
├── tests/
│   └── test_pipeline.py     # Automated test suite
├── run_pipeline.py          # Script to run the complete data/ML pipeline
├── run_dev.py               # Single command to launch full-stack dev environment
└── requirements.txt         # Root Python requirements
```

---

## The 6 Risk Features Explained

| Feature | Description |
| :--- | :--- |
| **`call_burst_score`** | Ratio of call volume in the last 7 days vs historical weekly baseline. |
| **`new_contact_ratio`** | Proportion of recent phone calls made to previously unknown numbers. |
| **`txn_spike_score`** | Ratio of the largest recent transaction compared to typical baseline average. |
| **`structuring_flag`** | Count of transactions in the just-under-threshold band (₹45,000–₹49,999) within a rolling week. |
| **`call_txn_proximity`** | Minutes elapsed between an unknown-number call and a subsequent large transaction (smaller = higher risk). |
| **`social_lifestyle_flag`** | Flags luxury or travel social posts that lack matching legitimate transaction history. |
