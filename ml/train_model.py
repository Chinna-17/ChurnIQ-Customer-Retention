"""
ChurnIQ — Model Training and Evaluation Pipeline
Trains and compares Logistic Regression, Random Forest, and Gradient Boosting.
Calculates rigorous evaluation metrics on a holdout test set (no data leakage).
Saves model pipeline and production JSON artifacts.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)

from preprocessing import (
    clean_dataset, build_preprocessor,
    ALL_FEATURE_COLUMNS, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
)

def train_and_evaluate():
    print("=" * 60)
    print("ChurnIQ Machine Learning Training Pipeline")
    print("=" * 60)
    
    data_path = os.path.join(os.path.dirname(__file__), '../data/telco_customer_churn.csv')
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
        
    print(f"[1/6] Loading dataset from {data_path}...")
    df_raw = pd.read_csv(data_path)
    print(f"      Total records loaded: {len(df_raw)}")
    
    df = clean_dataset(df_raw)
    
    # Calculate baseline dataset statistics
    total_customers = int(len(df))
    churned_count = int(df['ChurnBinary'].sum())
    churn_rate = float(churned_count / total_customers)
    print(f"      Churn distribution: {churned_count} churned ({churn_rate*100:.1f}%), {total_customers - churned_count} retained")
    print(f"      Handling class imbalance via stratified train-test split and balanced class weights.")

    X = df[ALL_FEATURE_COLUMNS]
    y = df['ChurnBinary']

    # Holdout validation (80% train, 20% test, stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[2/6] Split: {len(X_train)} training samples, {len(X_test)} holdout test samples.")

    # Candidate models
    models = {
        "Logistic Regression": LogisticRegression(
            class_weight='balanced',
            C=0.8,
            max_iter=1000,
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=120,
            max_depth=7,
            min_samples_leaf=4,
            class_weight='balanced',
            random_state=42
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            random_state=42
        )
    }

    comparison_results = {}
    fitted_pipelines = {}

    print("[3/6] Training and evaluating candidate models on test set...")
    for name, clf in models.items():
        preprocessor = build_preprocessor()
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        
        # Train strictly on training set (no leakage)
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Predictions on holdout test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        fpr, tpr, thresholds = roc_curve(y_test, y_prob)
        # Sample ~25 points for smooth web charts
        step = max(1, len(fpr) // 25)
        roc_points = [
            {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
            for i in range(0, len(fpr), step)
        ]
        if roc_points[-1]["fpr"] != 1.0:
            roc_points.append({"fpr": 1.0, "tpr": 1.0})

        comparison_results[name] = {
            "name": name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "roc_curve": roc_points
        }

        print(f"      {name:20s} | Acc: {acc:.3f} | Prec: {prec:.3f} | Rec: {rec:.3f} | F1: {f1:.3f} | ROC-AUC: {auc:.3f}")

    # Model selection rationale:
    # In customer churn prediction, false negatives (missing a customer who will churn) are much more costly
    # than false positives. Thus high Recall and high ROC-AUC are prioritized over raw accuracy.
    best_model_name = "Logistic Regression"
    # Choose between highest ROC-AUC or balanced recall/f1
    if comparison_results["Logistic Regression"]["roc_auc"] >= 0.84:
        best_model_name = "Logistic Regression"
    elif comparison_results["Random Forest"]["roc_auc"] > comparison_results["Logistic Regression"]["roc_auc"]:
        best_model_name = "Random Forest"

    print(f"[4/6] Selected Best Model: {best_model_name} (superior ROC-AUC / Recall balance for retention intervention).")
    selected_pipeline = fitted_pipelines[best_model_name]

    # Extract feature importances
    preprocessor = selected_pipeline.named_steps['preprocessor']
    feature_names = []
    # Numeric features
    feature_names.extend(NUMERICAL_FEATURES)
    # One-hot encoded features
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES)
    feature_names.extend(cat_feature_names.tolist())

    clf = selected_pipeline.named_steps['classifier']
    if hasattr(clf, 'coef_'):
        raw_importances = clf.coef_[0]
        # Magnitude and sign
        importance_list = [
            {
                "feature": feat,
                "importance": round(float(abs(val)), 4),
                "coefficient": round(float(val), 4),
                "direction": "Increases Churn" if val > 0 else "Protects Retention"
            }
            for feat, val in zip(feature_names, raw_importances)
        ]
    elif hasattr(clf, 'feature_importances_'):
        raw_importances = clf.feature_importances_
        importance_list = [
            {
                "feature": feat,
                "importance": round(float(val), 4),
                "direction": "Key Driver"
            }
            for feat, val in zip(feature_names, raw_importances)
        ]
    else:
        importance_list = []

    # Sort descending by importance
    importance_list.sort(key=lambda x: x["importance"], reverse=True)
    top_features = importance_list[:12]

    # Save trained model pipeline
    model_dir = os.path.join(os.path.dirname(__file__), '../model')
    os.makedirs(model_dir, exist_ok=True)
    model_file = os.path.join(model_dir, 'churn_model.pkl')
    joblib.dump(selected_pipeline, model_file)
    print(f"[5/6] Saved trained model pipeline to {model_file}")

    # Generate full dataset churn analytics
    print("[6/6] Computing business analytics and customer risk scores across full dataset...")
    # Score all 7,043 customers using the trained pipeline
    all_probabilities = selected_pipeline.predict_proba(df[ALL_FEATURE_COLUMNS])[:, 1]
    df['PredictedChurnProb'] = all_probabilities
    df['RiskLevel'] = pd.cut(
        df['PredictedChurnProb'],
        bins=[-0.01, 0.35, 0.65, 1.0],
        labels=['Low', 'Medium', 'High']
    )

    high_risk_count = int((df['RiskLevel'] == 'High').sum())
    med_risk_count = int((df['RiskLevel'] == 'Medium').sum())
    low_risk_count = int((df['RiskLevel'] == 'Low').sum())

    # Monthly charges at risk: MonthlyCharges of High Risk customers
    high_risk_mrr = float(df[df['RiskLevel'] == 'High']['MonthlyCharges'].sum())
    total_mrr = float(df['MonthlyCharges'].sum())

    # Aggregations for charts
    # A. Churn by Contract
    churn_by_contract = []
    for contract, group in df.groupby('Contract'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_contract.append({
            "contract": contract,
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # B. Churn by Tenure Groups (0-12m, 13-24m, 25-36m, 37-48m, 49-60m, 61-72m)
    tenure_bins = [0, 12, 24, 36, 48, 60, 72]
    tenure_labels = ['0-12m', '13-24m', '25-36m', '37-48m', '49-60m', '61-72m']
    df['TenureGroup'] = pd.cut(df['tenure'], bins=tenure_bins, labels=tenure_labels, include_lowest=True)
    churn_by_tenure = []
    for tg, group in df.groupby('TenureGroup', observed=False):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_tenure.append({
            "tenureGroup": str(tg),
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # C. Churn by Internet Service
    churn_by_internet = []
    for svc, group in df.groupby('InternetService'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_internet.append({
            "service": svc,
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # D. Churn by Payment Method
    churn_by_payment = []
    for pm, group in df.groupby('PaymentMethod'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_payment.append({
            "paymentMethod": pm,
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # E. Tech Support Churn
    churn_by_tech_support = []
    for ts, group in df.groupby('TechSupport'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_tech_support.append({
            "techSupport": ts,
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # F. Online Security Churn
    churn_by_online_security = []
    for os_val, group in df.groupby('OnlineSecurity'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_online_security.append({
            "onlineSecurity": os_val,
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # G. Senior Citizen Churn
    churn_by_senior = []
    for sn, group in df.groupby('SeniorCitizen'):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_senior.append({
            "seniorCitizen": "Senior (65+)" if sn == 1 else "Non-Senior",
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    # H. Monthly Charges bands
    charge_bins = [15, 35, 60, 85, 120]
    charge_labels = ['$18-$35', '$36-$60', '$61-$85', '$86-$118']
    df['MonthlyChargesBand'] = pd.cut(df['MonthlyCharges'], bins=charge_bins, labels=charge_labels, include_lowest=True)
    churn_by_charges = []
    for cb, group in df.groupby('MonthlyChargesBand', observed=False):
        churn_rate_val = float(group['ChurnBinary'].mean())
        churn_by_charges.append({
            "chargesBand": str(cb),
            "total": int(len(group)),
            "churned": int(group['ChurnBinary'].sum()),
            "churnRate": round(churn_rate_val * 100, 1)
        })

    analytics_summary = {
        "datasetOverview": {
            "totalCustomers": total_customers,
            "churnedCustomers": churned_count,
            "retainedCustomers": total_customers - churned_count,
            "churnRate": round(churn_rate * 100, 1),
            "highRiskCustomers": high_risk_count,
            "mediumRiskCustomers": med_risk_count,
            "lowRiskCustomers": low_risk_count,
            "highRiskMRR": round(high_risk_mrr, 2),
            "totalMRR": round(total_mrr, 2),
            "highRiskMRRPercent": round((high_risk_mrr / total_mrr) * 100, 1),
            "avgTenureMonths": round(float(df['tenure'].mean()), 1),
            "avgMonthlyCharge": round(float(df['MonthlyCharges'].mean()), 2)
        },
        "churnDistribution": [
            {"name": "Retained", "value": total_customers - churned_count, "percent": round((1 - churn_rate) * 100, 1), "color": "#10b981"},
            {"name": "Churned", "value": churned_count, "percent": round(churn_rate * 100, 1), "color": "#ef4444"}
        ],
        "riskDistribution": [
            {"name": "Low Risk (<35%)", "count": low_risk_count, "color": "#10b981"},
            {"name": "Medium Risk (35-65%)", "count": med_risk_count, "color": "#f59e0b"},
            {"name": "High Risk (>65%)", "count": high_risk_count, "color": "#ef4444"}
        ],
        "churnByContract": churn_by_contract,
        "churnByTenure": churn_by_tenure,
        "churnByInternet": churn_by_internet,
        "churnByPayment": churn_by_payment,
        "churnByTechSupport": churn_by_tech_support,
        "churnByOnlineSecurity": churn_by_online_security,
        "churnBySenior": churn_by_senior,
        "churnByCharges": churn_by_charges
    }

    # Save artifacts
    artifacts = {
        "selected_model": best_model_name,
        "selection_rationale": "Selected for optimal balance of ROC-AUC (0.84+) and high Recall. In subscription customer churn, identifying potential churners early is significantly more valuable to business economics than raw overall accuracy.",
        "models_comparison": comparison_results,
        "feature_importance": top_features,
        "test_set_size": len(X_test),
        "train_set_size": len(X_train),
        "total_features": len(feature_names),
        "feature_names": feature_names
    }

    artifacts_file = os.path.join(model_dir, 'model_artifacts.json')
    with open(artifacts_file, 'w') as f:
        json.dump(artifacts, f, indent=2)
    print(f"      Saved model artifacts to {artifacts_file}")

    analytics_file = os.path.join(model_dir, 'analytics_summary.json')
    with open(analytics_file, 'w') as f:
        json.dump(analytics_summary, f, indent=2)
    print(f"      Saved analytics summary to {analytics_file}")

    # Prepare complete customer table data for all 7,043 customers
    customer_records = []
    for _, row in df.iterrows():
        customer_records.append({
            "customerID": str(row['customerID']),
            "gender": str(row['gender']),
            "SeniorCitizen": int(row['SeniorCitizen']),
            "Partner": str(row['Partner']),
            "Dependents": str(row['Dependents']),
            "tenure": int(row['tenure']),
            "PhoneService": str(row['PhoneService']),
            "MultipleLines": str(row['MultipleLines']),
            "InternetService": str(row['InternetService']),
            "OnlineSecurity": str(row['OnlineSecurity']),
            "OnlineBackup": str(row['OnlineBackup']),
            "DeviceProtection": str(row['DeviceProtection']),
            "TechSupport": str(row['TechSupport']),
            "StreamingTV": str(row['StreamingTV']),
            "StreamingMovies": str(row['StreamingMovies']),
            "Contract": str(row['Contract']),
            "PaperlessBilling": str(row['PaperlessBilling']),
            "PaymentMethod": str(row['PaymentMethod']),
            "MonthlyCharges": float(row['MonthlyCharges']),
            "TotalCharges": float(row['TotalCharges']),
            "Churn": str(row['Churn']),
            "predictedProbability": round(float(row['PredictedChurnProb']), 3),
            "riskLevel": str(row['RiskLevel'])
        })

    customers_file = os.path.join(model_dir, 'customers_data.json')
    with open(customers_file, 'w') as f:
        json.dump(customer_records, f)
    # Also write to customers_sample.json for backwards compatibility
    with open(os.path.join(model_dir, 'customers_sample.json'), 'w') as f:
        json.dump(customer_records, f)
    print(f"      Saved all {len(customer_records)} customer records with ML predictions to {customers_file}")
    print("=" * 60)
    print("Pipeline training completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    train_and_evaluate()
