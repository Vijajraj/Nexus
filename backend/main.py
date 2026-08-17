import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Nexus Risk Dashboard API")

# CORS — allow React dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "dossier.json"


def load_dossier() -> list[dict]:
    """Load dossier data from JSON file, sort by risk_score desc, assign ranks."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    data.sort(key=lambda x: x["risk_score"], reverse=True)
    for i, entry in enumerate(data, start=1):
        entry["rank"] = i
    return data


@app.get("/rankings")
def get_rankings():
    """Return all dossier entries sorted by risk_score descending."""
    return load_dossier()


@app.get("/person/{person_id}")
def get_person(person_id: str):
    """Return a single dossier entry by person_id."""
    data = load_dossier()
    for entry in data:
        if entry["person_id"] == person_id:
            return entry
    raise HTTPException(status_code=404, detail=f"Person '{person_id}' not found")
