import os
import json
import unittest
import pandas as pd
import numpy as np

class TestNexusPipeline(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Ensure the directories and data files exist
        cls.data_dir = 'data'
        cls.backend_dir = 'backend'
        cls.people_path = os.path.join(cls.data_dir, 'people.csv')
        cls.calls_path = os.path.join(cls.data_dir, 'calls.csv')
        cls.txns_path = os.path.join(cls.data_dir, 'transactions.csv')
        cls.posts_path = os.path.join(cls.data_dir, 'social_posts.csv')
        cls.features_path = os.path.join(cls.data_dir, 'features.csv')
        cls.preds_path = os.path.join(cls.data_dir, 'predictions_shap.csv')
        cls.dossier_path = 'dossier.json'
        cls.backend_dossier_path = os.path.join(cls.backend_dir, 'dossier.json')

    def test_1_data_generator_outputs(self):
        """Test that synthetic data tables are correctly generated."""
        self.assertTrue(os.path.exists(self.people_path))
        self.assertTrue(os.path.exists(self.calls_path))
        self.assertTrue(os.path.exists(self.txns_path))
        self.assertTrue(os.path.exists(self.posts_path))
        
        df_people = pd.read_csv(self.people_path)
        self.assertEqual(len(df_people), 35)
        self.assertEqual(df_people['is_suspicious'].sum(), 4)
        
        expected_people_cols = {'person_id', 'name', 'phone', 'bank_account', 'social_handle', 'is_suspicious'}
        self.assertTrue(expected_people_cols.issubset(df_people.columns))

    def test_2_feature_engineering_outputs(self):
        """Test that features are correctly computed and structured."""
        self.assertTrue(os.path.exists(self.features_path))
        df_features = pd.read_csv(self.features_path)
        
        self.assertEqual(len(df_features), 35)
        expected_feature_cols = {
            'person_id', 'call_burst_score', 'new_contact_ratio', 
            'txn_spike_score', 'structuring_flag', 'call_txn_proximity', 
            'social_lifestyle_flag'
        }
        self.assertEqual(set(df_features.columns), expected_feature_cols)

    def test_3_feature_contrasts(self):
        """Test that suspicious features differ significantly from normal ones."""
        df_features = pd.read_csv(self.features_path)
        df_people = pd.read_csv(self.people_path)
        df_m = df_people.merge(df_features, on='person_id')
        
        susp = df_m[df_m['is_suspicious'] == 1]
        norm = df_m[df_m['is_suspicious'] == 0]
        
        # Structuring check: suspicious must have >= 3 structuring txns; normal must have 0
        self.assertTrue((susp['structuring_flag'] >= 3).all())
        self.assertTrue((norm['structuring_flag'] == 0).all())
        
        # Proximity check: suspicious must have proximity < 60 mins; normal must have 1440 mins
        self.assertTrue((susp['call_txn_proximity'] <= 60.0).all())
        self.assertTrue((norm['call_txn_proximity'] == 1440.0).all())
        
        # Lifestyle post check: suspicious must have flag 1; normal must have 0
        self.assertTrue((susp['social_lifestyle_flag'] == 1).all())
        self.assertTrue((norm['social_lifestyle_flag'] == 0).all())

    def test_4_risk_scores_and_shap(self):
        """Test that predictions and SHAP values are valid and show contrast."""
        self.assertTrue(os.path.exists(self.preds_path))
        df_preds = pd.read_csv(self.preds_path)
        df_people = pd.read_csv(self.people_path)
        df_m = df_people.merge(df_preds, on='person_id')
        
        susp = df_m[df_m['is_suspicious'] == 1]
        norm = df_m[df_m['is_suspicious'] == 0]
        
        # Check risk scores
        self.assertTrue((susp['risk_score'] >= 0.8).all())
        self.assertTrue((norm['risk_score'] <= 0.1).all())
        
        # Check that SHAP values are non-zero for all features of suspicious people
        shap_cols = [c for c in df_preds.columns if c.startswith('shap_')]
        self.assertEqual(len(shap_cols), 6)
        for col in shap_cols:
            self.assertTrue((susp[col] > 0.05).all(), f"SHAP value for {col} should be positive for suspicious cases")

    def test_5_dossier_json_schema(self):
        """Test that the output dossier.json matches the exact expected schema."""
        self.assertTrue(os.path.exists(self.dossier_path))
        self.assertTrue(os.path.exists(self.backend_dossier_path))
        
        with open(self.dossier_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        self.assertEqual(len(data), 35)
        
        # Check sorting by risk_score desc
        scores = [entry['risk_score'] for entry in data]
        self.assertEqual(scores, sorted(scores, reverse=True))
        
        # Check ranks
        ranks = [entry['rank'] for entry in data]
        self.assertEqual(ranks, list(range(1, 36)))
        
        allowed_evidence_types = {'call_and_transaction', 'transaction_list', 'social_post'}
        
        for entry in data:
            self.assertIn('person_id', entry)
            self.assertIn('name', entry)
            self.assertIn('risk_score', entry)
            self.assertIn('rank', entry)
            self.assertIn('top_factors', entry)
            
            top_factors = entry['top_factors']
            self.assertEqual(len(top_factors), 3)
            
            for factor in top_factors:
                self.assertIn('feature', factor)
                self.assertIn('label', factor)
                self.assertIn('shap_value', factor)
                self.assertIn('evidence', factor)
                
                evidence = factor['evidence']
                self.assertIn('type', evidence)
                self.assertIn(evidence['type'], allowed_evidence_types)
                
                # Check structure of evidence types
                ev_type = evidence['type']
                if ev_type == 'call_and_transaction':
                    self.assertIn('call', evidence)
                    self.assertIn('transaction', evidence)
                    self.assertIn('number', evidence['call'])
                    self.assertIn('timestamp', evidence['call'])
                    self.assertIn('amount', evidence['transaction'])
                    self.assertIn('timestamp', evidence['transaction'])
                elif ev_type == 'transaction_list':
                    self.assertIn('transactions', evidence)
                    self.assertTrue(isinstance(evidence['transactions'], list))
                    for tx in evidence['transactions']:
                        self.assertIn('amount', tx)
                        self.assertIn('timestamp', tx)
                elif ev_type == 'social_post':
                    self.assertIn('post', evidence)
                    self.assertIn('content_tags', evidence['post'])
                    self.assertTrue(isinstance(evidence['post']['content_tags'], list))
                    self.assertIn('timestamp', evidence['post'])

if __name__ == '__main__':
    unittest.main()
