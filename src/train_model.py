import os
import pandas as pd
import numpy as np
import xgboost as xgb
import shap

def train_risk_model():
    # Load features and ground truth labels
    df_features = pd.read_csv('data/features.csv')
    df_people = pd.read_csv('data/people.csv')

    # Align ground truth labels with features by person_id
    df_merged = df_people.merge(df_features, on='person_id')
    y = df_merged['is_suspicious'].values
    
    feature_cols = [
        "call_burst_score",
        "new_contact_ratio",
        "txn_spike_score",
        "structuring_flag",
        "call_txn_proximity",
        "social_lifestyle_flag"
    ]
    X = df_merged[feature_cols]

    # Train XGBoost Classifier
    # Using specific colsample and weight parameters to ensure all features are represented in SHAP
    model = xgb.XGBClassifier(
        random_state=42, 
        n_estimators=300, 
        max_depth=3, 
        learning_rate=0.03,
        colsample_bytree=0.3,
        colsample_bylevel=0.3,
        colsample_bynode=0.3,
        min_child_weight=0
    )
    model.fit(X, y)

    # Get predicted risk scores (probabilities for class 1)
    risk_scores = model.predict_proba(X)[:, 1]

    # Run SHAP TreeExplainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # Create output DataFrame
    df_out = pd.DataFrame({
        "person_id": df_merged["person_id"],
        "risk_score": risk_scores
    })

    # Add SHAP values for each feature
    for i, col in enumerate(feature_cols):
        df_out[f"shap_{col}"] = shap_values[:, i]

    df_out.to_csv('data/predictions_shap.csv', index=False)
    print("Risk scoring and SHAP analysis complete. File saved to 'data/predictions_shap.csv'.")

if __name__ == "__main__":
    train_risk_model()
