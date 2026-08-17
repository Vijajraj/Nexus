import os
import random
import pandas as pd
from datetime import datetime, timedelta
from faker import Faker

def generate_synthetic_data(seed=42):
    random.seed(seed)
    Faker.seed(seed)
    fake = Faker('en_IN') # Using Indian locale for realistic names and currency context

    os.makedirs('data', exist_ok=True)

    # 1. Generate People
    num_people = 35
    suspicious_ids = [f"p_{i:03d}" for i in range(1, 5)] # p_001, p_002, p_003, p_004
    
    people_data = []
    known_contacts = {} # person_id -> set of phone numbers

    for i in range(1, num_people + 1):
        pid = f"p_{i:03d}"
        is_susp = pid in suspicious_ids
        
        name = fake.name()
        phone = fake.phone_number()
        bank_acc = fake.bank_country() + fake.iban()[:15]
        social = "@" + name.lower().replace(" ", "_")
        
        people_data.append({
            "person_id": pid,
            "name": name,
            "phone": phone,
            "bank_account": bank_acc,
            "social_handle": social,
            "is_suspicious": 1 if is_susp else 0
        })
        
        # Generate 5-10 known contacts for each person
        contacts = {fake.phone_number() for _ in range(random.randint(5, 10))}
        known_contacts[pid] = list(contacts)

    df_people = pd.DataFrame(people_data)
    df_people.to_csv('data/people.csv', index=False)

    # Simulation timeline: 2026-08-01 to 2026-08-30 (30 days)
    start_date = datetime(2026, 8, 1, 0, 0, 0)
    end_date = datetime(2026, 8, 30, 23, 59, 59)
    total_days = 30

    calls_data = []
    txns_data = []
    posts_data = []

    call_id_counter = 1
    txn_id_counter = 1
    post_id_counter = 1

    for person in people_data:
        pid = person["person_id"]
        is_susp = person["is_suspicious"] == 1
        contacts = known_contacts[pid]

        if not is_susp:
            # --- NORMAL PERSON ACTIVITY ---
            # 1. Normal Calls
            num_calls = random.randint(15, 40)
            for _ in range(num_calls):
                # Distribute calls over the 30 days
                days_offset = random.uniform(0, total_days)
                call_time = start_date + timedelta(days=days_offset)
                
                # 95% calls to known contacts
                known = random.random() < 0.95
                number = random.choice(contacts) if known else fake.phone_number()
                
                calls_data.append({
                    "call_id": f"c_{call_id_counter:05d}",
                    "person_id": pid,
                    "called_number": number,
                    "timestamp": call_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "duration": random.randint(30, 600),
                    "is_known_contact": int(known)
                })
                call_id_counter += 1

            # 2. Normal Transactions
            num_txns = random.randint(10, 30)
            for _ in range(num_txns):
                days_offset = random.uniform(0, total_days)
                txn_time = start_date + timedelta(days=days_offset)
                
                # Low amounts: ₹100 - ₹5,000
                amount = round(random.uniform(100, 5000), 2)
                txn_type = random.choice(["transfer", "payment", "withdrawal"])
                counterparty = fake.name()
                
                txns_data.append({
                    "txn_id": f"t_{txn_id_counter:05d}",
                    "person_id": pid,
                    "amount": amount,
                    "timestamp": txn_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "counterparty": counterparty,
                    "type": txn_type
                })
                txn_id_counter += 1

            # 3. Normal Social Posts
            num_posts = random.randint(3, 10)
            for _ in range(num_posts):
                days_offset = random.uniform(0, total_days)
                post_time = start_date + timedelta(days=days_offset)
                
                tags = random.choice([["food", "cooking"], ["work", "monday"], ["family", "weekend"], ["movie"]])
                mentioned = [fake.name() for _ in range(random.randint(0, 2))]
                
                posts_data.append({
                    "post_id": f"p_{post_id_counter:05d}",
                    "person_id": pid,
                    "timestamp": post_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "content_tags": ",".join(tags),
                    "mentioned_accounts": ",".join(mentioned)
                })
                post_id_counter += 1

        else:
            # --- SUSPICIOUS PERSON ACTIVITY ---
            # Normal baseline activity first, so they have "average" behavior
            num_calls = random.randint(15, 30)
            for _ in range(num_calls):
                days_offset = random.uniform(0, total_days)
                call_time = start_date + timedelta(days=days_offset)
                known = random.random() < 0.95
                number = random.choice(contacts) if known else fake.phone_number()
                calls_data.append({
                    "call_id": f"c_{call_id_counter:05d}",
                    "person_id": pid,
                    "called_number": number,
                    "timestamp": call_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "duration": random.randint(30, 400),
                    "is_known_contact": int(known)
                })
                call_id_counter += 1

            # Baseline transactions (normal/small)
            num_txns = random.randint(10, 20)
            for _ in range(num_txns):
                days_offset = random.uniform(0, total_days)
                txn_time = start_date + timedelta(days=days_offset)
                amount = round(random.uniform(100, 3000), 2) # normal average is ~₹1,500
                txn_type = random.choice(["transfer", "payment", "withdrawal"])
                txns_data.append({
                    "txn_id": f"t_{txn_id_counter:05d}",
                    "person_id": pid,
                    "amount": amount,
                    "timestamp": txn_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "counterparty": fake.name(),
                    "type": txn_type
                })
                txn_id_counter += 1

            # Baseline posts
            num_posts = random.randint(3, 8)
            for _ in range(num_posts):
                days_offset = random.uniform(0, total_days)
                post_time = start_date + timedelta(days=days_offset)
                tags = random.choice([["nature", "photography"], ["fitness", "gym"]])
                posts_data.append({
                    "post_id": f"p_{post_id_counter:05d}",
                    "person_id": pid,
                    "timestamp": post_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "content_tags": ",".join(tags),
                    "mentioned_accounts": ""
                })
                post_id_counter += 1

            # PLANTING PATTERN 1: Call -> Txn Spike -> Luxury Post
            # Choose a specific point late in the month: August 20, 2026
            p1_call_time = datetime(2026, 8, 20, 10, 0, 0) + timedelta(hours=random.randint(0, 12))
            unknown_num = fake.phone_number()
            
            # 1. Call to unknown number
            calls_data.append({
                "call_id": f"c_{call_id_counter:05d}",
                "person_id": pid,
                "called_number": unknown_num,
                "timestamp": p1_call_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "duration": random.randint(120, 300),
                "is_known_contact": 0
            })
            call_id_counter += 1

            # 2. Spike Transaction: 5-10x their normal amount
            # If normal range is 100-3000 (avg 1500), let's make spike ₹15,000 (10x normal average)
            p1_txn_time = p1_call_time + timedelta(minutes=random.randint(5, 20))
            spike_amount = round(random.uniform(12000, 15000), 2)
            txns_data.append({
                "txn_id": f"t_{txn_id_counter:05d}",
                "person_id": pid,
                "amount": spike_amount,
                "timestamp": p1_txn_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "counterparty": "Unknown Entity X",
                "type": "transfer"
            })
            txn_id_counter += 1

            # 3. Social post: 1-2 days later tagged "luxury_item" or "travel"
            p1_post_time = p1_txn_time + timedelta(days=random.uniform(1.1, 1.9))
            post_tag = random.choice(["luxury_item", "travel"])
            posts_data.append({
                "post_id": f"p_{post_id_counter:05d}",
                "person_id": pid,
                "timestamp": p1_post_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "content_tags": post_tag,
                "mentioned_accounts": "@luxury_broker"
            })
            post_id_counter += 1

            # PLANTING PATTERN 2: Structuring
            # 3-5 transactions in the ₹45,000-49,999 band within a single week
            # Let's place them in the second week: August 8 to August 12
            structuring_start = datetime(2026, 8, 8, 9, 0, 0)
            num_structuring_txns = random.randint(3, 5)
            for j in range(num_structuring_txns):
                structuring_time = structuring_start + timedelta(days=j, hours=random.randint(0, 4))
                amount = round(random.uniform(45000, 49999), 2)
                txns_data.append({
                    "txn_id": f"t_{txn_id_counter:05d}",
                    "person_id": pid,
                    "amount": amount,
                    "timestamp": structuring_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "counterparty": "Cash Deposit",
                    "type": "deposit"
                })
                txn_id_counter += 1

    # Save to CSV
    pd.DataFrame(calls_data).to_csv('data/calls.csv', index=False)
    pd.DataFrame(txns_data).to_csv('data/transactions.csv', index=False)
    pd.DataFrame(posts_data).to_csv('data/social_posts.csv', index=False)

    print("Data generation complete. Datasets written to the 'data' directory.")

if __name__ == "__main__":
    generate_synthetic_data()
