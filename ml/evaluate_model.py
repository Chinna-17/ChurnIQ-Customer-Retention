"""
ChurnIQ — Model Evaluation and Diagnostic Utility
Loads the saved pipeline and evaluates on fresh or test data.
"""

import os
import joblib
import pandas as pd
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from preprocessing import clean_dataset, ALL_FEATURE_COLUMNS

def evaluate():
    model_path = os.path.join(os.path.dirname(__file__), '../model/churn_model.pkl')
    data_path = os.path.join(os.path.dirname(__file__), '../data/telco_customer_churn.csv')

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Run train_model.py first.")

    pipeline = joblib.load(model_path)
    df = clean_dataset(pd.read_csv(data_path))

    X = df[ALL_FEATURE_COLUMNS]
    y = df['ChurnBinary']

    y_pred = pipeline.predict(X)
    y_prob = pipeline.predict_proba(X)[:, 1]

    print("=" * 60)
    print("ChurnIQ Model Evaluation Diagnostics (Full Population)")
    print("=" * 60)
    print(f"ROC-AUC Score: {roc_auc_score(y, y_prob):.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y, y_pred))
    print("\nClassification Report:")
    print(classification_report(y, y_pred, target_names=["Retained", "Churned"]))

if __name__ == '__main__':
    evaluate()
