import os
import json
import pandas as pd
from datetime import datetime, timedelta

def run_generate_dossier():
    # Load raw tables
    df_people = pd.read_csv('data/people.csv')
    df_calls = pd.read_csv('data/calls.csv')
    df_txns = pd.read_csv('data/transactions.csv')
    df_posts = pd.read_csv('data/social_posts.csv')

    # Load risk predictions and SHAP values
    df_shap = pd.read_csv('data/predictions_shap.csv')

    # Convert timestamps to strings for safety (or keep as is if already string)
    df_calls['timestamp'] = df_calls['timestamp'].astype(str)
    df_txns['timestamp'] = df_txns['timestamp'].astype(str)
    df_posts['timestamp'] = df_posts['timestamp'].astype(str)

    # Feature labels map
    feature_labels = {
        "call_burst_score": "High frequency of recent calls compared to baseline",
        "new_contact_ratio": "High proportion of recent calls to unknown numbers",
        "txn_spike_score": "Transaction amount spike compared to average",
        "structuring_flag": "Multiple transactions just under reporting threshold",
        "call_txn_proximity": "Call followed by large transaction",
        "social_lifestyle_flag": "Lifestyle post inconsistent with declared income"
    }

    dossier = []

    for _, row in df_shap.iterrows():
        pid = row['person_id']
        risk_score = float(row['risk_score'])
        
        # Get person details
        p_info = df_people[df_people['person_id'] == pid].iloc[0]
        name = p_info['name']
        
        # Filter raw data for this person
        p_calls = df_calls[df_calls['person_id'] == pid].sort_values('timestamp', ascending=False)
        p_txns = df_txns[df_txns['person_id'] == pid].sort_values('timestamp', ascending=False)
        p_posts = df_posts[df_posts['person_id'] == pid].sort_values('timestamp', ascending=False)

        # Get SHAP values for all 6 features
        shap_vals = {}
        for feat in feature_labels.keys():
            shap_vals[feat] = float(row[f"shap_{feat}"])

        # Sort features by SHAP value descending, take top 3
        sorted_features = sorted(shap_vals.items(), key=lambda x: x[1], reverse=True)
        top_3 = sorted_features[:3]

        top_factors = []
        for feat_name, shap_val in top_3:
            evidence = {}
            
            # Retrieve evidence based on feature type
            if feat_name == "call_txn_proximity":
                # Find the closest call -> txn spike sequence
                unknown_calls = p_calls[p_calls['is_known_contact'] == 0]
                # A transaction is large if >= 5000 (which fits the ₹8000-10000 spike)
                large_txns = p_txns[p_txns['amount'] >= 5000]
                
                found_pair = False
                if len(unknown_calls) > 0 and len(large_txns) > 0:
                    min_diff = timedelta(days=999)
                    best_call = None
                    best_txn = None
                    
                    for _, c in unknown_calls.iterrows():
                        c_time = datetime.fromisoformat(c['timestamp'])
                        for _, tx in large_txns.iterrows():
                            tx_time = datetime.fromisoformat(tx['timestamp'])
                            if tx_time > c_time:
                                diff = tx_time - c_time
                                if diff < min_diff:
                                    min_diff = diff
                                    best_call = c
                                    best_txn = tx
                                    found_pair = True
                                    
                    if found_pair:
                        evidence = {
                            "type": "call_and_transaction",
                            "call": { "number": str(best_call['called_number']), "timestamp": str(best_call['timestamp']) },
                            "transaction": { "amount": float(best_txn['amount']), "timestamp": str(best_txn['timestamp']) }
                        }
                
                # Fallback if no pair was found
                if not found_pair:
                    call_number = str(p_calls['called_number'].iloc[0]) if len(p_calls) > 0 else "Unknown"
                    call_time = str(p_calls['timestamp'].iloc[0]) if len(p_calls) > 0 else "..."
                    txn_amount = float(p_txns['amount'].iloc[0]) if len(p_txns) > 0 else 0.0
                    txn_time = str(p_txns['timestamp'].iloc[0]) if len(p_txns) > 0 else "..."
                    evidence = {
                        "type": "call_and_transaction",
                        "call": { "number": call_number, "timestamp": call_time },
                        "transaction": { "amount": txn_amount, "timestamp": txn_time }
                    }

            elif feat_name == "structuring_flag":
                # Find transactions in the structuring band ₹45000 - 49999
                struct_tx = p_txns[(p_txns['amount'] >= 45000) & (p_txns['amount'] <= 49999)]
                tx_list = []
                for _, tx in struct_tx.iterrows():
                    tx_list.append({
                        "amount": float(tx['amount']),
                        "timestamp": str(tx['timestamp'])
                    })
                # Sort ascending by timestamp for display
                tx_list = sorted(tx_list, key=lambda x: x['timestamp'])
                evidence = {
                    "type": "transaction_list",
                    "transactions": tx_list
                }

            elif feat_name == "social_lifestyle_flag":
                # Find luxury/travel tagged post
                lux_posts = p_posts[p_posts['content_tags'].str.contains('luxury_item|travel', na=False)]
                if len(lux_posts) > 0:
                    best_post = lux_posts.iloc[0]
                    tags_list = best_post['content_tags'].split(',')
                    evidence = {
                        "type": "social_post",
                        "post": {
                            "content_tags": tags_list,
                            "timestamp": str(best_post['timestamp'])
                        }
                    }
                else:
                    # Fallback
                    tags_list = p_posts['content_tags'].iloc[0].split(',') if len(p_posts) > 0 else ["none"]
                    post_time = str(p_posts['timestamp'].iloc[0]) if len(p_posts) > 0 else "..."
                    evidence = {
                        "type": "social_post",
                        "post": {
                            "content_tags": tags_list,
                            "timestamp": post_time
                        }
                    }

            elif feat_name == "new_contact_ratio" or feat_name == "call_burst_score":
                # Map to call_and_transaction as fallback/permitted type
                unknown_calls = p_calls[p_calls['is_known_contact'] == 0]
                call_rec = unknown_calls.iloc[0] if len(unknown_calls) > 0 else (p_calls.iloc[0] if len(p_calls) > 0 else None)
                txn_rec = p_txns.iloc[0] if len(p_txns) > 0 else None
                
                call_num = str(call_rec['called_number']) if call_rec is not None else "Unknown"
                call_time = str(call_rec['timestamp']) if call_rec is not None else "..."
                txn_amt = float(txn_rec['amount']) if txn_rec is not None else 0.0
                txn_time = str(txn_rec['timestamp']) if txn_rec is not None else "..."
                
                evidence = {
                    "type": "call_and_transaction",
                    "call": { "number": call_num, "timestamp": call_time },
                    "transaction": { "amount": txn_amt, "timestamp": txn_time }
                }

            elif feat_name == "txn_spike_score":
                # Map to transaction_list showing the spike transaction
                # Find the maximum transaction amount
                if len(p_txns) > 0:
                    max_tx = p_txns.sort_values('amount', ascending=False).iloc[0]
                    transactions_list = [{
                        "amount": float(max_tx['amount']),
                        "timestamp": str(max_tx['timestamp'])
                    }]
                else:
                    transactions_list = []
                    
                evidence = {
                    "type": "transaction_list",
                    "transactions": transactions_list
                }

            top_factors.append({
                "feature": feat_name,
                "label": feature_labels[feat_name],
                "shap_value": round(shap_val, 4),
                "evidence": evidence
            })

        dossier.append({
            "person_id": pid,
            "name": name,
            "risk_score": round(risk_score, 4),
            "rank": 0, # assigned later after sorting
            "top_factors": top_factors
        })

    # Sort dossier by risk score descending
    dossier = sorted(dossier, key=lambda x: x['risk_score'], reverse=True)

    # Assign ranks
    for i, entry in enumerate(dossier, start=1):
        entry['rank'] = i

    # Write final dossier JSON to both backend and project root
    os.makedirs('backend', exist_ok=True)
    with open('backend/dossier.json', 'w', encoding='utf-8') as f:
        json.dump(dossier, f, indent=2)
        
    with open('dossier.json', 'w', encoding='utf-8') as f:
        json.dump(dossier, f, indent=2)

    print("Evidence dossier JSON generated successfully. Written to 'backend/dossier.json' and 'dossier.json'.")

if __name__ == "__main__":
    run_generate_dossier()
