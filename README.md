# ChurnIQ — Customer Retention Intelligence Platform

> **Predict churn. Understand customers. Retain smarter.**  
> An ML-powered customer retention platform that identifies customers at risk of churn and turns customer data into actionable retention insights.

---

## 📌 Executive Summary

Acquiring a new customer costs **5x to 7x more** than retaining an existing subscriber in subscription businesses. **ChurnIQ** is an end-to-end Machine Learning intelligence platform designed to replace reactive cancellation tracking with proactive, data-driven customer retention decision support.

Built on the **Telco Customer Churn** benchmark dataset (7,043 accounts), ChurnIQ preprocesses raw account attributes, evaluates multiple candidate models, generates calibrated continuous risk probabilities (0%–100%), attributes decision drivers, and delivers prescriptive retention actions.

---

## 🚀 Key Features

1. **Executive Overview Dashboard**: Real-time KPI telemetry monitoring total customers (7,043), baseline churn rate (26.5%), high-risk accounts (2,088), and monthly revenue at risk ($164.7K/mo).
2. **Interactive Customer Explorer**: Searchable, multi-filterable (by Contract, Churn status, and ML Risk Tier), sortable customer table with deep-dive modal analysis.
3. **Real-Time ML Inference Form**: Interactive customer risk simulator evaluating live Scikit-Learn pipelines via REST API to output risk scores, individual risk drivers, and retention playbooks.
4. **Multivariate Business Analytics**: Cross-tabulated retention charts dissecting the impact of contract commitments, fiber optic vs. DSL connections, tech support, online security addons, and billing methods.
5. **Model Insights & Explainability**: True test-set ROC curves, confusion matrices, multi-model benchmarking, and feature importance attribution.
6. **Zero-Data-Leakage Architecture**: Model preprocessing, scaling, and encoding enclosed strictly inside a Scikit-Learn `Pipeline` and evaluated on an 80/20 stratified holdout test set.

---

## 🧠 Machine Learning Approach

### 1. Data Cleaning & Preprocessing
- **Handling Missing Values**: `TotalCharges` contained 11 whitespace strings corresponding to customers with `tenure == 0`. These values were sanitized and imputed to `0.0`.
- **Feature Engineering & Transformation**:
  - **Numerical Features** (`tenure`, `MonthlyCharges`, `TotalCharges`): Median imputation followed by standard variance scaling (`StandardScaler`).
  - **Categorical Features** (16 categorical fields): Imputed and transformed via `OneHotEncoder(drop='first', handle_unknown='ignore')`.
  - Encapsulated into a single reusable Scikit-Learn `ColumnTransformer`.

### 2. Handling Class Imbalance
The dataset exhibits natural subscription imbalance:
- **Retained**: 5,174 customers (73.5%)
- **Churned**: 1,869 customers (26.5%)

Rather than artificially synthesizing synthetic records (SMOTE), class weighting (`class_weight='balanced'`) was implemented within the loss functions of candidate estimators. This penalizes false negatives proportionally to class frequency, ensuring high recall for churn detection without distorting probability calibration.

### 3. Model Benchmark Comparison (1,409 Holdout Test Samples)

| Model Architecture | Accuracy | Precision | Recall (Churners Found) | F1-Score | ROC-AUC | Production Role |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Balanced)** | **73.9%** | **50.5%** | **78.3%** | **0.614** | **0.842** | **Selected Model** |
| **Random Forest Classifier** | 74.7% | 51.5% | 80.5% | 0.628 | 0.844 | Candidate |
| **Gradient Boosting** | 80.3% | 65.9% | 53.2% | 0.589 | 0.843 | Candidate |

### 4. Selection Rationale: Business ROI over Aggregate Accuracy
While Gradient Boosting attained the highest aggregate accuracy (80.3%), its Recall was only **53.2%** — failing to detect nearly half of all churned accounts. In subscription economics, missing a churner costs $500–$1,200 in lifetime value, whereas outreach costs negligible sums. 

**Logistic Regression with balanced weights** and **Random Forest** captured ~80% of churners while preserving strong discriminative power (**0.842 ROC-AUC**), delivering superior commercial retention ROI.

---

## 🔍 Top Predictive Drivers

1. **Two-Year & One-Year Contracts** (`-0.78` / `-0.41` weight): Strongest protective factor against customer attrition (2.8% churn on 2-yr vs 42.7% on month-to-month).
2. **Tenure** (`-0.54` weight): Accounts past the 12-month onboarding threshold demonstrate stabilizing retention.
3. **Fiber Optic Service** (`+0.46` weight): Elevates churn risk unless bundled with technical assistance.
4. **No Tech Support & No Online Security** (`+0.29` / `+0.27` weight): Subscribers lacking support addons churn at 41.6% vs 15.2% with active support.
5. **Electronic Check Payment** (`+0.21` weight): Associated with manual bill friction and higher delinquency.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       React 19 Frontend                     │
│  (Overview Dashboard, Customer Explorer, Predict Form, EDA) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js Express / Python Flask              │
│       (/api/health, /api/summary, /api/predict, etc.)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Serialized Pipeline Call
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Scikit-Learn Inference Pipeline              │
│      ColumnTransformer (StandardScaler + OneHotEncoder)     │
│             + Balanced Logistic Regression / RF             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

- **Machine Learning**: Python 3.10+, Scikit-Learn, Pandas, NumPy, Joblib
- **Exploratory Data Analysis**: Jupyter Notebook, Matplotlib, Seaborn
- **Backend Service Layer**: Node.js Express & Python Flask REST APIs
- **Frontend Application**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Visualization**: Recharts (Donut, Grouped Bar, Line, ROC curve)
- **Icons & Design**: Lucide React, Inter typography, Zero-Pill design system

---

## 📁 Repository Structure

```text
ChurnIQ/
├── data/
│   ├── telco_customer_churn.csv    # 7,043 record dataset
│   └── README.md                   # Dataset schema documentation
├── notebooks/
│   └── exploratory_analysis.ipynb  # Interactive EDA & experiment notebook
├── ml/
│   ├── preprocessing.py            # Feature transformation & cleaning
│   ├── train_model.py              # Model training & test evaluation
│   ├── evaluate_model.py           # Model diagnostics & reports
│   └── predict_single.py           # Real-time inference engine
├── model/
│   ├── churn_model.pkl             # Serialized Scikit-Learn pipeline
│   ├── model_artifacts.json        # Test metrics, ROC points, coefficients
│   ├── analytics_summary.json      # Dataset aggregate analytics
│   └── customers_sample.json       # Scored customer population
├── backend/
│   ├── app.py                      # Standalone Flask REST API
│   └── requirements.txt            # Python dependencies
├── src/
│   ├── api/client.ts               # API fetch handlers
│   ├── components/                 # Navbar, Footer, KpiCard, Badges, Modals
│   ├── pages/                      # Overview, Customers, Predict, Analytics, Model, About
│   ├── types/                      # TypeScript data interfaces
│   ├── App.tsx                     # Main layout & router
│   ├── index.css                   # Tailwind styles
│   └── main.tsx                    # React DOM entry
├── server.ts                       # Full-stack Express server
├── package.json
└── README.md
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+) with `pip`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ChurnIQ.git
cd ChurnIQ

# Install Node dependencies
npm install

# Install Python ML dependencies
pip install -r backend/requirements.txt
```

### 2. Train the Machine Learning Pipeline
```bash
python3 ml/train_model.py
```
This trains the models on the holdout split, evaluates metrics, and generates `model/churn_model.pkl` and `model/model_artifacts.json`.

### 3. Run the Full-Stack Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and model loading status |
| `GET` | `/api/summary` | Portfolio KPI metrics (Total, Churn Rate, MRR at Risk) |
| `GET` | `/api/customers` | Paginated customer table with search, filters, and sort |
| `GET` | `/api/analytics` | Aggregated churn distributions across services and contracts |
| `GET` | `/api/model-metrics` | Test metrics, confusion matrix, ROC points, feature weights |
| `POST` | `/api/predict` | Computes churn probability, risk tier, and retention actions |

#### Sample Prediction Request
```json
POST /api/predict
{
  "tenure": 2,
  "MonthlyCharges": 85.50,
  "TotalCharges": 171.00,
  "Contract": "Month-to-month",
  "PaymentMethod": "Electronic check",
  "InternetService": "Fiber optic",
  "TechSupport": "No",
  "OnlineSecurity": "No"
}
```

#### Sample Prediction Response
```json
{
  "prediction": "Likely to Churn",
  "probability": 0.8281,
  "confidence": 82.8,
  "risk_level": "High",
  "risk_factors": [
    "Month-to-month contract (highest correlation with churn)",
    "Short tenure (2 months) in high-vulnerability onboarding window",
    "Elevated monthly spend ($85.50/mo) above portfolio median",
    "Electronic check payment method (associated with payment friction)",
    "No technical support addon on active internet connection"
  ],
  "retention_actions": [
    "Offer promotional discounts for converting to a 1-year or 2-year contract",
    "Initiate dedicated customer-success onboarding check-in call and usage review",
    "Review plan value, offer selective bill credits or bundling optimizations",
    "Encourage automated bank transfer or credit card autopay with a one-time bill credit",
    "Provide a complimentary 90-day trial of Priority Tech Support"
  ]
}
```

---

---

## 🎯 Interview & Technical Defense Guide

This project is built to answer core technical questions during Machine Learning and Data Science interviews:

### 1. Why is churn prediction valuable to business economics?
Acquiring new customers in subscription services costs 5x–7x more than retaining existing accounts. Churn prediction shifts organizations from reactive fire-fighting (when a customer files a cancellation notice) to proactive intervention, preserving monthly recurring charges and improving Customer Lifetime Value (CLV).

### 2. Why was Logistic Regression selected over tree ensembles?
While Gradient Boosting attained 80.3% overall accuracy, its test-set recall was only 53.2% (missing nearly half of all churners). Logistic Regression with `class_weight='balanced'` achieved 78.3% recall with an ROC-AUC of 0.842. In addition, Logistic Regression provides direct, well-calibrated linear log-odds coefficients, enabling transparent feature explainability without needing heavy post-hoc approximations.

### 3. Why is accuracy alone insufficient for churn classification?
Because the dataset is imbalanced (73.5% retained vs. 26.5% churned), a naive model that predicts every single customer will retain would achieve a deceptive 73.5% accuracy while identifying zero at-risk customers. Precision, Recall, F1-Score, and ROC-AUC are mandatory metrics to measure real business utility.

### 4. How was data leakage prevented?
All transformations (median imputation, `StandardScaler`, and `OneHotEncoder`) are encapsulated inside a Scikit-Learn `ColumnTransformer` within an overall `Pipeline`. The split was performed **before** fitting the pipeline. Means, standard deviations, and category encodings were learned strictly from the 5,634 training samples and never saw the holdout test partition.

### 5. Why was a stratified split used?
A standard random split risks sampling disproportionate positive/negative ratios in the holdout set. Stratified splitting guarantees the exact 26.5% positive churn rate is preserved across both training and test sets.

### 6. How is the real-time inference executed?
The React frontend transmits customer attributes via a JSON payload (`POST /api/predict`). The server invokes the serialized Scikit-learn pipeline (`churn_model.pkl`), executes `predict_proba()`, maps the probability to a risk tier (Low: <35%, Medium: 35–65%, High: >65%), extracts customer-specific risk drivers from model weights, and returns structured retention recommendations.

---

## 🔮 Future Improvements

- **Survival Analysis**: Implement Kaplan-Meier and Cox Proportional Hazards models to predict *when* a customer is likely to churn in addition to probability.
- **SHAP / TreeSHAP Integration**: Compute exact Shapley values for non-linear models.
- **Uplift Modeling**: Measure the incremental retention impact of specific interventions to target only customers whose churn can be reversed by an offer.
- **Automated Webhook Integration**: Trigger automated email campaigns in HubSpot or Salesforce when an account enters the High-Risk tier.

---

## 🎓 Academic & Resume Value

Designed as a showcase portfolio project for a **B.Tech Artificial Intelligence & Data Science** candidate demonstrating:
- Real-world classification problem formulation & pipeline design
- Elimination of data leakage via Scikit-Learn `Pipeline` & `ColumnTransformer`
- Empirical mitigation of class imbalance with business-aligned evaluation metrics (Recall & ROC-AUC)
- Model interpretability and coefficient attribution
- Production full-stack deployment coupling Python inference engines with React frontend applications.

---

## 📄 License
This project is open-source and available under the Apache 2.0 License.
