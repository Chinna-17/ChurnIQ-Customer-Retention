"""
ChurnIQ — Single Customer Inference Engine
Loads the trained pipeline and predicts churn probability, risk level,
and dynamically computes individual customer risk factors and retention recommendations.
"""

import sys
import os
import json
import warnings
warnings.filterwarnings("ignore")
import joblib
import pandas as pd

from preprocessing import clean_dataset, ALL_FEATURE_COLUMNS

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model/churn_model.pkl')
ARTIFACTS_PATH = os.path.join(os.path.dirname(__file__), '../model/model_artifacts.json')

_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline

def analyze_customer(customer_data: dict) -> dict:
    pipeline = get_pipeline()
    
    # Prepare single row DataFrame
    row = {}
    for col in ALL_FEATURE_COLUMNS:
        row[col] = [customer_data.get(col, "No")]

    # Numeric formatting
    row['tenure'] = [int(customer_data.get('tenure', 1))]
    row['MonthlyCharges'] = [float(customer_data.get('MonthlyCharges', 50.0))]
    row['TotalCharges'] = [float(customer_data.get('TotalCharges', row['MonthlyCharges'][0] * row['tenure'][0]))]
    row['SeniorCitizen'] = [int(customer_data.get('SeniorCitizen', 0))]

    df = pd.DataFrame(row)
    df = clean_dataset(df)

    prob = float(pipeline.predict_proba(df[ALL_FEATURE_COLUMNS])[0, 1])
    prob_percent = round(prob * 100, 1)

    if prob >= 0.65:
        risk_level = "High"
        prediction = "Likely to Churn"
    elif prob >= 0.35:
        risk_level = "Medium"
        prediction = "Moderate Risk"
    else:
        risk_level = "Low"
        prediction = "Likely to Retain"

    # Identify customer-specific risk factors based on feature weights & values
    risk_factors = []
    retention_actions = []

    contract = str(customer_data.get('Contract', ''))
    tenure = int(customer_data.get('tenure', 0))
    monthly_charges = float(customer_data.get('MonthlyCharges', 0))
    payment_method = str(customer_data.get('PaymentMethod', ''))
    tech_support = str(customer_data.get('TechSupport', ''))
    online_sec = str(customer_data.get('OnlineSecurity', ''))
    internet_svc = str(customer_data.get('InternetService', ''))

    if contract == 'Month-to-month':
        risk_factors.append("Month-to-month contract (highest correlation with churn)")
        retention_actions.append("Offer promotional discounts for converting to a 1-year or 2-year contract")

    if tenure <= 12:
        risk_factors.append(f"Short tenure ({tenure} months) in high-vulnerability onboarding window")
        retention_actions.append("Initiate dedicated customer-success onboarding check-in call and usage review")

    if monthly_charges > 70.0:
        risk_factors.append(f"Elevated monthly spend (${monthly_charges:.2f}/mo) above portfolio median")
        retention_actions.append("Review plan value, offer selective bill credits or bundling optimizations")

    if payment_method == 'Electronic check':
        risk_factors.append("Electronic check payment method (associated with higher payment friction & churn)")
        retention_actions.append("Encourage automated bank transfer or credit card autopay with a one-time bill credit")

    if tech_support == 'No' and internet_svc != 'No':
        risk_factors.append("No technical support addon on active internet connection")
        retention_actions.append("Provide a complimentary 90-day trial of Priority Tech Support")

    if online_sec == 'No' and internet_svc != 'No':
        risk_factors.append("No online cybersecurity protection addon enabled")
        retention_actions.append("Offer complimentary Online Security suite bundle to increase service stickiness")

    if internet_svc == 'Fiber optic' and (tech_support == 'No' or online_sec == 'No'):
        risk_factors.append("High-speed Fiber Optic subscriber without bundled support services")

    if not risk_factors:
        risk_factors.append("Favorable account stability profile with standard baseline risk")
        retention_actions.append("Maintain quarterly relationship health checks and standard loyalty engagement")

    return {
        "prediction": prediction,
        "probability": round(prob, 4),
        "confidence": prob_percent,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "retention_actions": retention_actions,
        "customer_summary": {
            "tenure": tenure,
            "contract": contract,
            "monthlyCharges": monthly_charges,
            "paymentMethod": payment_method
        }
    }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        payload = json.loads(sys.argv[1])
        res = analyze_customer(payload)
        print(json.dumps(res))
    else:
        # Read from stdin
        raw = sys.stdin.read()
        if raw.strip():
            payload = json.loads(raw)
            res = analyze_customer(payload)
            print(json.dumps(res))
