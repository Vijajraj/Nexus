import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def run_feature_engineering():
    # Load raw data
    df_people = pd.read_csv('data/people.csv')
    df_calls = pd.read_csv('data/calls.csv')
    df_txns = pd.read_csv('data/transactions.csv')
    df_posts = pd.read_csv('data/social_posts.csv')

    # Convert timestamps to datetime objects
    df_calls['timestamp'] = pd.to_datetime(df_calls['timestamp'])
    df_txns['timestamp'] = pd.to_datetime(df_txns['timestamp'])
    df_posts['timestamp'] = pd.to_datetime(df_posts['timestamp'])

    # Determine simulation timeline limits
    max_time = max(df_calls['timestamp'].max(), df_txns['timestamp'].max(), df_posts['timestamp'].max())
    min_time = min(df_calls['timestamp'].min(), df_txns['timestamp'].min(), df_posts['timestamp'].min())

    recent_window_days = 7
    recent_start = max_time - timedelta(days=recent_window_days)

    features = []

    for _, row in df_people.iterrows():
        pid = row['person_id']
        
        # Filter raw data for this person
        p_calls = df_calls[df_calls['person_id'] == pid].sort_values('timestamp')
        p_txns = df_txns[df_txns['person_id'] == pid].sort_values('timestamp')
        p_posts = df_posts[df_posts['person_id'] == pid].sort_values('timestamp')

        # Baseline stats
        total_txns = len(p_txns)
        avg_txn_amount = p_txns['amount'].mean() if total_txns > 0 else 0.0

        # --- 1. call_burst_score ---
        # (calls in last 7 days) / (historical average calls per 7-day window)
        recent_calls_cnt = len(p_calls[p_calls['timestamp'] >= recent_start])
        hist_calls = p_calls[p_calls['timestamp'] < recent_start]
        hist_days = (recent_start - min_time).total_seconds() / (24 * 3600)
        
        if hist_days > 0:
            hist_weekly_avg = (len(hist_calls) / hist_days) * 7
        else:
            hist_weekly_avg = 0.0
            
        if hist_weekly_avg > 0:
            call_burst_score = recent_calls_cnt / hist_weekly_avg
        else:
            call_burst_score = 0.0 if recent_calls_cnt == 0 else 1.0

        # --- 2. new_contact_ratio ---
        # % of recent calls where is_known_contact is false
        recent_calls = p_calls[p_calls['timestamp'] >= recent_start]
        if len(recent_calls) > 0:
            new_contact_ratio = (len(recent_calls[recent_calls['is_known_contact'] == 0]) / len(recent_calls))
        else:
            new_contact_ratio = 0.0

        # --- 3. txn_spike_score ---
        # (largest recent transaction amount) / (that person's average transaction amount)
        recent_txns = p_txns[p_txns['timestamp'] >= recent_start]
        if len(recent_txns) > 0 and avg_txn_amount > 0:
            txn_spike_score = recent_txns['amount'].max() / avg_txn_amount
        else:
            txn_spike_score = 0.0

        # --- 4. structuring_flag ---
        # count of transactions with amount in a "just under threshold" band (₹45,000–49,999) within a rolling week
        structuring_txns = p_txns[(p_txns['amount'] >= 45000) & (p_txns['amount'] <= 49999)]
        max_structuring_count = 0
        if len(structuring_txns) > 0:
            # Sort structuring txns by timestamp and find max in any 7-day window
            times = structuring_txns['timestamp'].tolist()
            for t in times:
                window_end = t + timedelta(days=7)
                cnt = sum(1 for tx_t in times if t <= tx_t <= window_end)
                if cnt > max_structuring_count:
                    max_structuring_count = cnt
        structuring_flag = float(max_structuring_count)

        # --- 5. call_txn_proximity ---
        # minutes between a call to an unknown number and the nearest large transaction after it
        # (smaller = more suspicious; cap at 1440 if none found)
        unknown_calls = p_calls[p_calls['is_known_contact'] == 0]
        # A transaction is "large" if it's 5x the average transaction amount OR greater than ₹10,000
        large_txns = p_txns[(p_txns['amount'] > 5 * avg_txn_amount) | (p_txns['amount'] >= 10000)]
        
        min_proximity = 1440.0
        
        for _, call in unknown_calls.iterrows():
            call_t = call['timestamp']
            # Find transactions after the call
            after_txns = large_txns[large_txns['timestamp'] > call_t]
            if len(after_txns) > 0:
                nearest_txn_t = after_txns['timestamp'].min()
                diff_mins = (nearest_txn_t - call_t).total_seconds() / 60.0
                if diff_mins < min_proximity:
                    min_proximity = diff_mins
                    
        call_txn_proximity = min_proximity

        # --- 6. social_lifestyle_flag ---
        # 1 if a luxury_item/travel-tagged post exists with no matching transaction pattern justifying it, else 0
        # Justification is a large transaction (amount >= 10000) in the 7 days prior to the post
        lifestyle_flag = 0
        suspicious_posts = p_posts[p_posts['content_tags'].str.contains('luxury_item|travel', na=False)]
        
        for _, post in suspicious_posts.iterrows():
            post_t = post['timestamp']
            # Check for justifying large transaction in preceding 7 days (must be a purchase/payment or withdrawal, not a transfer)
            justifying_txns = p_txns[
                (p_txns['timestamp'] >= post_t - timedelta(days=7)) & 
                (p_txns['timestamp'] <= post_t) & 
                ((p_txns['amount'] > 5 * avg_txn_amount) | (p_txns['amount'] >= 10000)) &
                (p_txns['type'].isin(['payment', 'withdrawal']))
            ]
            if len(justifying_txns) == 0:
                lifestyle_flag = 1
                break # Flag as suspicious if even one post has no justification
                
        social_lifestyle_flag = float(lifestyle_flag)

        features.append({
            "person_id": pid,
            "call_burst_score": round(call_burst_score, 4),
            "new_contact_ratio": round(new_contact_ratio, 4),
            "txn_spike_score": round(txn_spike_score, 4),
            "structuring_flag": structuring_flag,
            "call_txn_proximity": round(call_txn_proximity, 4),
            "social_lifestyle_flag": social_lifestyle_flag
        })

    df_features = pd.DataFrame(features)
    df_features.to_csv('data/features.csv', index=False)
    print("Feature engineering complete. File saved to 'data/features.csv'.")

if __name__ == "__main__":
    run_feature_engineering()
