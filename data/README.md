# Telco Customer Churn Dataset

## Overview
This repository uses the widely recognized Telco Customer Churn benchmark dataset (originally sourced from IBM Business Analytics Community / Kaggle).

- **Total records:** 7,043 customers
- **Total attributes:** 21 columns (20 predictive features + 1 target variable `Churn`)
- **Churn distribution:**
  - Retained: 5,174 customers (73.5%)
  - Churned: 1,869 customers (26.5%)

## Feature Schema

| Column | Type | Description |
| :--- | :--- | :--- |
| `customerID` | Categorical | Unique customer identifier |
| `gender` | Categorical | Male / Female |
| `SeniorCitizen` | Binary | 1 if customer is senior (65+), 0 otherwise |
| `Partner` | Categorical | Yes / No (whether customer has a partner) |
| `Dependents` | Categorical | Yes / No (whether customer has dependents) |
| `tenure` | Numeric | Number of months the customer has stayed with the company |
| `PhoneService` | Categorical | Yes / No |
| `MultipleLines` | Categorical | Yes, No, No phone service |
| `InternetService` | Categorical | DSL, Fiber optic, No |
| `OnlineSecurity` | Categorical | Yes, No, No internet service |
| `OnlineBackup` | Categorical | Yes, No, No internet service |
| `DeviceProtection` | Categorical | Yes, No, No internet service |
| `TechSupport` | Categorical | Yes, No, No internet service |
| `StreamingTV` | Categorical | Yes, No, No internet service |
| `StreamingMovies` | Categorical | Yes, No, No internet service |
| `Contract` | Categorical | Month-to-month, One year, Two year |
| `PaperlessBilling` | Categorical | Yes / No |
| `PaymentMethod` | Categorical | Electronic check, Mailed check, Bank transfer (automatic), Credit card (automatic) |
| `MonthlyCharges` | Numeric | The amount charged to the customer monthly (USD) |
| `TotalCharges` | Numeric | The total amount charged to the customer over their tenure (USD) |
| `Churn` | Categorical | Yes / No (target variable) |

## Data Cleaning Considerations
- `TotalCharges` contained 11 whitespace strings for new customers where `tenure == 0`. In `preprocessing.py`, these values are sanitized and imputed to `0.0`.
- Categorical features are encoded using `OneHotEncoder(drop='first', handle_unknown='ignore')` inside a `ColumnTransformer` pipeline.
- Continuous features (`tenure`, `MonthlyCharges`, `TotalCharges`) are standardized using `StandardScaler`.
- Imbalance is handled using stratified splitting and balanced class weighting.
