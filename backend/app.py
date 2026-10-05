"""
ChurnIQ — Python Flask REST API
Customer Retention Intelligence Platform
"""

import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ChurnIQ-API")

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '../model')
ML_DIR = os.path.join(BASE_DIR, '../ml')

import sys
sys.path.append(ML_DIR)
from predict_single import analyze_customer

def load_json_file(filename):
    file_path = os.path.join(MODEL_DIR, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    return None

_cached_customers = None

def get_all_customers():
    global _cached_customers
    if _cached_customers is None:
        _cached_customers = load_json_file('customers_data.json')
        if not _cached_customers:
            _cached_customers = load_json_file('customers_sample.json') or []
    return _cached_customers

@app.route('/api/health', methods=['GET'])
def health():
    model_exists = os.path.exists(os.path.join(MODEL_DIR, 'churn_model.pkl'))
    return jsonify({
        "status": "healthy",
        "service": "ChurnIQ Analytics Engine",
        "model_loaded": model_exists,
        "total_customers": len(get_all_customers()),
        "version": "1.0.0"
    })

@app.route('/api/summary', methods=['GET'])
def get_summary():
    data = load_json_file('analytics_summary.json')
    if data and "datasetOverview" in data:
        return jsonify(data["datasetOverview"])
    return jsonify({"error": "Summary analytics not available"}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    data = load_json_file('analytics_summary.json')
    if data:
        return jsonify(data)
    return jsonify({"error": "Analytics data not found"}), 500

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    artifacts = load_json_file('model_artifacts.json')
    if artifacts:
        return jsonify(artifacts)
    return jsonify({"error": "Model artifacts not found"}), 500

@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    artifacts = load_json_file('model_artifacts.json')
    if artifacts and "feature_importance" in artifacts:
        return jsonify(artifacts["feature_importance"])
    return jsonify({"error": "Feature importance data not found"}), 500

@app.route('/api/customers/<customer_id>', methods=['GET'])
def get_customer_by_id(customer_id):
    customers = get_all_customers()
    for c in customers:
        if c.get('customerID', '').lower() == customer_id.lower():
            return jsonify(c)
    return jsonify({"error": f"Customer with ID {customer_id} not found"}), 404

@app.route('/api/customers', methods=['GET'])
def get_customers():
    customers = get_all_customers()
    
    # Query parameters
    search = request.args.get('search', '').strip().lower()
    churn_filter = request.args.get('churn', '').strip()
    contract_filter = request.args.get('contract', '').strip()
    risk_filter = request.args.get('risk', '').strip()
    sort_by = request.args.get('sortBy', 'predictedProbability')
    sort_order = request.args.get('order', 'desc')
    
    try:
        page = max(1, int(request.args.get('page', 1)))
        limit = max(1, min(100, int(request.args.get('limit', 20))))
    except ValueError:
        page = 1
        limit = 20

    filtered = customers

    if search:
        filtered = [c for c in filtered if search in c.get('customerID', '').lower()]

    if churn_filter and churn_filter != 'all':
        filtered = [c for c in filtered if c.get('Churn', '').lower() == churn_filter.lower()]

    if contract_filter and contract_filter != 'all':
        filtered = [c for c in filtered if c.get('Contract', '').lower() == contract_filter.lower()]

    if risk_filter and risk_filter != 'all':
        filtered = [c for c in filtered if c.get('riskLevel', '').lower() == risk_filter.lower()]

    # Sorting
    reverse = (sort_order == 'desc')
    if sort_by in ['tenure', 'MonthlyCharges', 'TotalCharges', 'predictedProbability']:
        filtered.sort(key=lambda x: float(x.get(sort_by, 0)), reverse=reverse)
    elif sort_by in ['customerID', 'Contract', 'Churn', 'riskLevel']:
        filtered.sort(key=lambda x: str(x.get(sort_by, '')), reverse=reverse)

    total_records = len(filtered)
    total_pages = max(1, (total_records + limit - 1) // limit)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_records = filtered[start_idx:end_idx]

    return jsonify({
        "total": total_records,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
        "customers": paginated_records
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Missing JSON request payload"}), 400

        result = analyze_customer(payload)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Inference error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to complete prediction analysis. Please verify input fields."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting ChurnIQ Flask Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
