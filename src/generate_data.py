import os
import random
import pandas as pd
from datetime import datetime, timedelta
from faker import Faker

def generate_synthetic_data(seed=42):
    random.seed(seed)
    Faker.seed(seed)
    fake = Faker('en_IN')

    os.makedirs('data', exist_ok=True)

    # 1. Generate People
    num_people = 35
    suspicious_ids = [f"p_{i:03d}" for i in range(1, 5)] # p_001, p_002, p_003, p_004
    
    people_data = []
    known_contacts = {}

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
        
        contacts = {fake.phone_number() for _ in range(random.randint(5, 10))}
        known_contacts[pid] = list(contacts)

    df_people = pd.DataFrame(people_data)
    df_people.to_csv('data/people.csv', index=False)

    # Simulation timeline: 2026-08-01 to 2026-08-30 (30 days)
    start_date = datetime(2026, 8, 1, 0, 0, 0)
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

        # Generate standard baseline activity for everyone
        # 1. Calls
        num_calls = random.randint(20, 35)
        for _ in range(num_calls):
            days_offset = random.uniform(0, total_days - 7) # Keep baseline in first 23 days mostly
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

        # 2. Transactions
        num_txns = random.randint(15, 25)
        for _ in range(num_txns):
            days_offset = random.uniform(0, total_days - 7)
            txn_time = start_date + timedelta(days=days_offset)
            amount = round(random.uniform(100, 2000), 2) # average txn is around ₹1,000
            txn_type = random.choice(["payment", "withdrawal"])
            txns_data.append({
                "txn_id": f"t_{txn_id_counter:05d}",
                "person_id": pid,
                "amount": amount,
                "timestamp": txn_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "counterparty": fake.name(),
                "type": txn_type
            })
            txn_id_counter += 1

        # 3. Social Posts
        num_posts = random.randint(3, 8)
        for _ in range(num_posts):
            days_offset = random.uniform(0, total_days - 7)
            post_time = start_date + timedelta(days=days_offset)
            tags = ["daily", "life"]
            posts_data.append({
                "post_id": f"p_{post_id_counter:05d}",
                "person_id": pid,
                "timestamp": post_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "content_tags": ",".join(tags),
                "mentioned_accounts": ""
            })
            post_id_counter += 1

        if is_susp:
            # PLANTING PATTERN 1: Call -> Txn Spike -> Luxury Post (MUST fall within the last 7 days, i.e., Aug 24 - Aug 30)
            # Let's plant it around August 26
            p1_call_time = datetime(2026, 8, 26, 14, 0, 0)
            unknown_num = fake.phone_number()
            
            # Call to unknown number
            calls_data.append({
                "call_id": f"c_{call_id_counter:05d}",
                "person_id": pid,
                "called_number": unknown_num,
                "timestamp": p1_call_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "duration": random.randint(150, 300),
                "is_known_contact": 0
            })
            call_id_counter += 1

            # Transaction Spike (5-10x their normal amount of ~₹1,000, i.e. ₹8,000 - ₹10,000)
            # Must follow 5-20 min later
            p1_txn_time = p1_call_time + timedelta(minutes=random.randint(5, 20))
            spike_amount = round(random.uniform(8000, 10000), 2)
            txns_data.append({
                "txn_id": f"t_{txn_id_counter:05d}",
                "person_id": pid,
                "amount": spike_amount,
                "timestamp": p1_txn_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "counterparty": "Offshore Entity Ltd",
                "type": "transfer" # Using 'transfer' type so it doesn't count as a justifying 'payment' or 'withdrawal'
            })
            txn_id_counter += 1

            # Social Post (1-2 days later tagged "luxury_item" or "travel")
            p1_post_time = p1_txn_time + timedelta(days=random.uniform(1.1, 1.8))
            post_tag = random.choice(["luxury_item", "travel"])
            posts_data.append({
                "post_id": f"p_{post_id_counter:05d}",
                "person_id": pid,
                "timestamp": p1_post_time.strftime("%Y-%m-%dT%H:%M:%S"),
                "content_tags": post_tag,
                "mentioned_accounts": "@yacht_club"
            })
            post_id_counter += 1

            # PLANTING PATTERN 2: Structuring
            # 3-5 transactions in the ₹45,000-49,999 band within a single week
            # Let's place them around August 10 to August 14
            structuring_start = datetime(2026, 8, 10, 10, 0, 0)
            num_structuring_txns = random.randint(3, 5)
            for j in range(num_structuring_txns):
                structuring_time = structuring_start + timedelta(days=j, hours=random.randint(0, 3))
                amount = round(random.uniform(45000, 49999), 2)
                txns_data.append({
                    "txn_id": f"t_{txn_id_counter:05d}",
                    "person_id": pid,
                    "amount": amount,
                    "timestamp": structuring_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "counterparty": "Self Deposit ATM",
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
