"""
ChurnIQ — Data Preprocessing Pipeline
Customer Retention Intelligence Platform
"""

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

NUMERICAL_FEATURES = ['tenure', 'MonthlyCharges', 'TotalCharges']

CATEGORICAL_FEATURES = [
    'gender',
    'SeniorCitizen',
    'Partner',
    'Dependents',
    'PhoneService',
    'MultipleLines',
    'InternetService',
    'OnlineSecurity',
    'OnlineBackup',
    'DeviceProtection',
    'TechSupport',
    'StreamingTV',
    'StreamingMovies',
    'Contract',
    'PaperlessBilling',
    'PaymentMethod'
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw Telco Customer Churn dataset:
    - Converts TotalCharges from string with potential spaces to numeric float.
    - Imputes missing TotalCharges (tenure == 0 customers) with 0.0.
    - Encodes Churn (Yes -> 1, No -> 0).
    """
    df = df.copy()
    
    # Handle TotalCharges missing/blank strings
    if 'TotalCharges' in df.columns:
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'].astype(str).str.strip(), errors='coerce')
        # Missing total charges occur when tenure is 0
        df['TotalCharges'] = df['TotalCharges'].fillna(0.0)
        
    # Standardize SeniorCitizen to string category or int
    if 'SeniorCitizen' in df.columns:
        df['SeniorCitizen'] = df['SeniorCitizen'].astype(int)
        
    # Map Churn target if present
    if 'Churn' in df.columns:
        df['ChurnBinary'] = df['Churn'].map({'Yes': 1, 'No': 0})
        
    return df

def build_preprocessor() -> ColumnTransformer:
    """
    Constructs a ColumnTransformer that scales numerical features and
    one-hot encodes categorical features with handle_unknown='ignore'.
    """
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor
