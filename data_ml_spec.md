# Data & ML Spec

## Scope

Own everything from raw synthetic data to the final evidence dossier JSON. Nothing you build touches a UI — your deliverable is a clean, correct dossier.json file (or live-generating script) that Person B's API serves as-is. Match the schema exactly; that JSON is the contract between you two.

## Part 1: Synthetic Data Generator (hours 0–4)

Use Python + Faker. Generate 4 flat tables:

- **people**: `person_id`, `name`, `phone`, `bank_account`, `social_handle`
- **calls**: `call_id`, `person_id`, `called_number`, `timestamp`, `duration`, `is_known_contact`
- **transactions**: `txn_id`, `person_id`, `amount`, `timestamp`, `counterparty`, `type`
- **social_posts**: `post_id`, `person_id`, `timestamp`, `content_tags`, `mentioned_accounts`

Generate ~30-40 people total.
Plant 3-5 "suspicious" people deliberately — for each, hand-craft the correlated pattern:
- A call to an unknown/new number
- Followed within ~5-20 minutes by a large transaction (much bigger than their typical transaction size)
- Followed within ~1-2 days by a social post tagged `luxury_item` or `travel` with no matching income event
- Optionally add a `structuring_flag` pattern too: 3-5 transactions just under a round threshold (e.g. ₹48,000-49,000) within a short window

The remaining ~25-35 people should have random, uncorrelated, "boring" activity — normal call patterns, no unusual transactions, ordinary posts. This contrast is what makes your top-ranked results look legitimate rather than arbitrary — don't skip this step or the demo won't visually separate suspicious from normal.

**Checkpoint before moving on**: manually eyeball the raw CSVs — can you, a human, spot the 3-5 planted people just by scanning the data? If not, the patterns aren't strong enough yet. Fix before Part 2.

## Part 2: Feature Engineering (hours 4–8)

Write a script that computes 6 features per person from the raw tables:

| Feature | How to compute |
| :--- | :--- |
| `call_burst_score` | (calls in last 7 days) / (historical average calls per 7-day window) |
| `new_contact_ratio` | % of recent calls where `is_known_contact` is false |
| `txn_spike_score` | (largest recent transaction amount) / (that person's average transaction amount) |
| `structuring_flag` | count of transactions with amount in a "just under threshold" band (e.g. ₹45,000–49,999) within a rolling week |
| `call_txn_proximity` | minutes between a call to an unknown number and the nearest large transaction after it (smaller = more suspicious; cap/normalize it) |
| `social_lifestyle_flag` | 1 if a luxury_item/travel-tagged post exists with no matching transaction pattern justifying it, else 0 |

**Output**: one row per person, 6 numeric columns + `person_id`.

**Checkpoint**: print the feature table — do your planted suspicious people show visibly higher values across multiple features compared to the rest? If only 1 feature stands out, strengthen the synthetic data, not the model.

## Part 3: XGBoost Model + SHAP (hours 8–12)

- Label your planted-suspicious people as 1, everyone else as 0 (you control the ground truth — this is a supervised toy problem, that's fine for MVP).
- Train a simple XGBoost classifier on the 6 features.
- Get predicted risk scores (probability output, 0–1) for every person.
- Run SHAP (TreeExplainer) on the trained model to get per-person, per-feature contribution values.

**Checkpoint**: for each planted-suspicious person, do their top 2-3 SHAP-weighted features match what you actually planted for them? If SHAP says something irrelevant drove the score, revisit feature engineering — the story has to hold up under a judge's question.

## Part 4: Evidence Dossier Generator (hours 12–14)

This is the critical deliverable — write a script that merges the SHAP output with the raw evidence records and outputs one JSON file matching exactly this schema (confirm this with Person B before hour 0):

```json
[
  {
    "person_id": "p_014",
    "name": "Person 14",
    "risk_score": 0.87,
    "rank": 1,
    "top_factors": [
      {
        "feature": "call_txn_proximity",
        "label": "Call followed by large transaction",
        "shap_value": 0.45,
        "evidence": {
          "type": "call_and_transaction",
          "call": { "number": "98xxxxxxx", "timestamp": "2026-03-03T14:02:00" },
          "transaction": { "amount": 300000, "timestamp": "2026-03-03T14:10:00" }
        }
      }
    ]
  }
]
```

- Sort the array by `risk_score` descending, assign rank.
- For each person, take their top 3 SHAP features, generate a human-readable label per feature type (hardcode a label template per feature name), and attach the actual raw record(s) that caused that feature's value — not just the number.
- `evidence.type` must be one of: `call_and_transaction`, `transaction_list`, `social_post` — Person B's UI switches rendering based on this field, so don't introduce new types without telling them.

This is your hour-12–14 deliverable — hand this file to Person B and don't move on until they confirm it loads correctly in their UI.

## Part 5: Support & Refinement (hours 14–24)

- **14–18**: Stay available for schema mismatches Person B hits during integration. Fastest fixes usually beat re-explaining — just adjust your JSON output.
- **18–22**: If the dashboard is working, revisit weak spots — e.g., if a planted person's evidence doesn't read well in the UI, tweak the synthetic data or labels, regenerate the dossier.
- **22–24**: Prep to explain the ML/scoring logic confidently during judge Q&A — you'll likely field any "how does the model actually work" or "how do you avoid false positives" questions.

## Non-negotiables

- Lock the JSON schema with Person B in the first 30 minutes — do not change field names or evidence types once integration starts.
- Don't chase model accuracy metrics (precision/recall) — this is a toy supervised problem on data you made up. Time is better spent making sure the SHAP explanations tell a clean, believable story.
- If behind schedule, cut `structuring_flag` complexity before cutting the evidence-linking step — the dossier's traceability is the actual differentiator, not feature count.
