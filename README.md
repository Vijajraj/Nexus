# Nexus Data & ML Pipeline

End-to-end data generation, feature engineering, risk modeling, and evidence dossier generation for investigative anomaly detection.

## Project Structure

```
├── backend/
│   ├── main.py            # FastAPI backend server
│   └── dossier.json       # Generated risk dossier JSON file
├── data/
│   ├── people.csv         # Synthetic people database
│   ├── calls.csv          # Call logs
│   ├── transactions.csv   # Financial transaction logs
│   ├── social_posts.csv   # Social media posts
│   ├── features.csv       # Engineered feature table
│   └── predictions_shap.csv # Predicted risk scores and SHAP values
├── frontend/              # React frontend dashboard (Vite + React)
├── src/
│   ├── generate_data.py   # Step 1: Synthetic data generation
│   ├── feature_engineering.py # Step 2: Feature extraction
│   ├── train_model.py     # Step 3: XGBoost risk classification & SHAP computation
│   └── generate_dossier.py # Step 4: Evidence dossier compilation
├── tests/
│   └── test_pipeline.py   # Unit testing suite
├── run_pipeline.py        # Master pipeline orchestrator
├── run_dev.py             # Unified full-stack development server runner
└── requirements.txt       # Python dependencies
```

## Setup & Execution

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Full Data & ML Pipeline
Generates raw synthetic data, computes features, trains the model, and outputs the final `dossier.json` to both the root directory and `backend/`:
```bash
python run_pipeline.py
```

### 3. Run Unit Tests
Verifies code correctness, feature contrasts, model scores, and schema constraints:
```bash
python tests/test_pipeline.py
```

### 4. Launch the Full-Stack Application (Frontend + Backend)
To launch both the FastAPI backend (`http://localhost:8000`) and the React dashboard (`http://localhost:5173`) with unified log output in a single command:
```bash
python run_dev.py
```
