import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  CreditCard, 
  Wifi, 
  FileText,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { PredictionRequest, PredictionResponse, CustomerRecord } from '../types';
import { predictCustomer } from '../api/client';

interface PredictChurnProps {
  prefillCustomer?: CustomerRecord | null;
  onClearPrefill?: () => void;
}

const DEFAULT_FORM: PredictionRequest = {
  gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 2,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 79.85,
  TotalCharges: 159.70,
};

const SAMPLE_PROFILES = [
  {
    name: 'High Risk (Vulnerable Onboarding)',
    data: {
      gender: 'Male',
      SeniorCitizen: 0,
      Partner: 'No',
      Dependents: 'No',
      tenure: 2,
      PhoneService: 'Yes',
      MultipleLines: 'No',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'No',
      OnlineBackup: 'No',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'No',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 85.50,
      TotalCharges: 171.00,
    }
  },
  {
    name: 'Low Risk (Loyal Two-Year Contract)',
    data: {
      gender: 'Female',
      SeniorCitizen: 0,
      Partner: 'Yes',
      Dependents: 'Yes',
      tenure: 48,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'DSL',
      OnlineSecurity: 'Yes',
      OnlineBackup: 'Yes',
      DeviceProtection: 'Yes',
      TechSupport: 'Yes',
      StreamingTV: 'No',
      StreamingMovies: 'No',
      Contract: 'Two year',
      PaperlessBilling: 'No',
      PaymentMethod: 'Bank transfer (automatic)',
      MonthlyCharges: 54.00,
      TotalCharges: 2592.00,
    }
  },
  {
    name: 'Medium Risk (Borderline Evaluation)',
    data: {
      gender: 'Male',
      SeniorCitizen: 1,
      Partner: 'No',
      Dependents: 'No',
      tenure: 16,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'No',
      OnlineBackup: 'Yes',
      DeviceProtection: 'Yes',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'Yes',
      Contract: 'One year',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Credit card (automatic)',
      MonthlyCharges: 98.20,
      TotalCharges: 1571.20,
    }
  }
];

export const PredictChurn: React.FC<PredictChurnProps> = ({
  prefillCustomer,
  onClearPrefill,
}) => {
  const [formData, setFormData] = useState<PredictionRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If incoming customer from table
  useEffect(() => {
    if (prefillCustomer) {
      setFormData({
        gender: prefillCustomer.gender,
        SeniorCitizen: prefillCustomer.SeniorCitizen,
        Partner: prefillCustomer.Partner,
        Dependents: prefillCustomer.Dependents,
        tenure: prefillCustomer.tenure,
        PhoneService: prefillCustomer.PhoneService,
        MultipleLines: prefillCustomer.MultipleLines,
        InternetService: prefillCustomer.InternetService,
        OnlineSecurity: prefillCustomer.OnlineSecurity,
        OnlineBackup: prefillCustomer.OnlineBackup,
        DeviceProtection: prefillCustomer.DeviceProtection,
        TechSupport: prefillCustomer.TechSupport,
        StreamingTV: prefillCustomer.StreamingTV,
        StreamingMovies: prefillCustomer.StreamingMovies,
        Contract: prefillCustomer.Contract,
        PaperlessBilling: prefillCustomer.PaperlessBilling,
        PaymentMethod: prefillCustomer.PaymentMethod,
        MonthlyCharges: prefillCustomer.MonthlyCharges,
        TotalCharges: prefillCustomer.TotalCharges,
      });
      setResult(null);
      setError(null);
    }
  }, [prefillCustomer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      let parsedVal: any = value;
      if (type === 'number') {
        parsedVal = parseFloat(value) || 0;
      } else if (name === 'SeniorCitizen') {
        parsedVal = parseInt(value, 10) || 0;
      }

      const updated = { ...prev, [name]: parsedVal };

      // Automatically recalculate TotalCharges if tenure or MonthlyCharges changed and TotalCharges was close
      if (name === 'tenure' || name === 'MonthlyCharges') {
        const tenureVal = name === 'tenure' ? parsedVal : prev.tenure;
        const monthlyVal = name === 'MonthlyCharges' ? parsedVal : prev.MonthlyCharges;
        updated.TotalCharges = parseFloat((tenureVal * monthlyVal).toFixed(2));
      }

      return updated;
    });
  };

  const handleProfileSelect = (profileData: PredictionRequest) => {
    setFormData({ ...profileData });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.tenure < 0 || formData.tenure > 120) {
      setError('Please check the highlighted fields: Tenure must be between 0 and 120 months.');
      setLoading(false);
      return;
    }
    if (formData.MonthlyCharges < 0) {
      setError('Please check the highlighted fields: Monthly charges cannot be negative.');
      setLoading(false);
      return;
    }

    try {
      const response = await predictCustomer(formData);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Prediction service is currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setResult(null);
    setError(null);
    if (onClearPrefill) onClearPrefill();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Predict Customer Churn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter customer information to estimate their probability of churn.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Preset Customer Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PROFILES.map((prof, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleProfileSelect(prof.data)}
              className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded hover:border-blue-500 hover:text-blue-700 transition-colors shadow-2xs"
            >
              {prof.name}
            </button>
          ))}
        </div>
      </div>

      {prefillCustomer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
          <span>Loaded details for customer ID: <strong>{prefillCustomer.customerID}</strong> ({prefillCustomer.Contract}, {prefillCustomer.tenure} mos)</span>
          <button 
            onClick={onClearPrefill} 
            className="text-blue-600 hover:underline font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Prediction Result Panel */}
      {result && (
        <div className={`border rounded-lg p-6 shadow-sm transition-all ${
          result.risk_level === 'High' 
            ? 'bg-rose-50/40 border-rose-300' 
            : result.risk_level === 'Medium'
            ? 'bg-amber-50/40 border-amber-300'
            : 'bg-emerald-50/40 border-emerald-300'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                Churn Probability
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {result.confidence}%
                </span>
                <span className="text-slate-300 text-2xl font-light">|</span>
                <span className={`text-xl font-bold ${
                  result.risk_level === 'High' ? 'text-rose-700' : result.risk_level === 'Medium' ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {result.risk_level.toUpperCase()} RISK
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-white/80 p-3 rounded-md border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Prediction</div>
                <div className="font-bold text-slate-900 text-sm">{result.prediction}</div>
              </div>
              <div className="bg-white/80 p-3 rounded-md border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Model Probability</div>
                <div className="font-bold text-slate-900 text-sm">{(result.probability * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
              <span>Low Risk (&lt;35%)</span>
              <span>Medium Risk (35-65%)</span>
              <span>High Risk (&gt;65%)</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  result.risk_level === 'High' 
                    ? 'bg-rose-500' 
                    : result.risk_level === 'Medium' 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, result.confidence))}%` }}
              />
            </div>
          </div>

          {/* Factors and Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Key Risk Factors */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Factors Influencing This Prediction
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.risk_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 italic mt-3 pt-2 border-t border-slate-100">
                * Features influencing model predictions illustrate correlation within the decision boundary, not guaranteed causality.
              </p>
            </div>

            {/* Suggested Retention Actions */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Retention Opportunities
              </h4>
              <div className="text-[11px] font-medium text-slate-500 mb-2">Suggested retention actions:</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.retention_actions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 italic mt-3 pt-2 border-t border-slate-100">
                * Suggested retention actions are advisory decision-support recommendations and do not guarantee customer retention outcomes.
              </p>
            </div>
          </div>

          {/* Reset / Run Again Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Analyze Another Customer
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Customer Profile */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold">1. Customer Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label htmlFor="predict-gender" className="block text-slate-600 font-medium mb-1">Gender</label>
              <select
                id="predict-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-senior" className="block text-slate-600 font-medium mb-1">Senior Citizen (65+)</label>
              <select
                id="predict-senior"
                name="SeniorCitizen"
                value={formData.SeniorCitizen}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value={0}>No (Under 65)</option>
                <option value={1}>Yes (65 and older)</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-partner" className="block text-slate-600 font-medium mb-1">Partner</label>
              <select
                id="predict-partner"
                name="Partner"
                value={formData.Partner}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-dependents" className="block text-slate-600 font-medium mb-1">Dependents</label>
              <select
                id="predict-dependents"
                name="Dependents"
                value={formData.Dependents}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Account */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold">2. Account</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label htmlFor="predict-tenure" className="block text-slate-600 font-medium mb-1">
                Tenure (Months)
              </label>
              <input
                id="predict-tenure"
                type="number"
                name="tenure"
                min="0"
                max="72"
                value={formData.tenure}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-600 block mt-1">Months with company (0-72)</span>
            </div>

            <div>
              <label htmlFor="predict-contract" className="block text-slate-600 font-medium mb-1">Contract</label>
              <select
                id="predict-contract"
                name="Contract"
                value={formData.Contract}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-paperless" className="block text-slate-600 font-medium mb-1">Paperless Billing</label>
              <select
                id="predict-paperless"
                name="PaperlessBilling"
                value={formData.PaperlessBilling}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-payment" className="block text-slate-600 font-medium mb-1">Payment Method</label>
              <select
                id="predict-payment"
                name="PaymentMethod"
                value={formData.PaymentMethod}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Services */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <Wifi className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold">3. Services</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label htmlFor="predict-internet" className="block text-slate-600 font-medium mb-1">Internet Service</label>
              <select
                id="predict-internet"
                name="InternetService"
                value={formData.InternetService}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet Service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-tech-support" className="block text-slate-600 font-medium mb-1">Tech Support</label>
              <select
                id="predict-tech-support"
                name="TechSupport"
                value={formData.TechSupport}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No (Increases Churn)</option>
                <option value="Yes">Yes (Protective)</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-online-sec" className="block text-slate-600 font-medium mb-1">Online Security</label>
              <select
                id="predict-online-sec"
                name="OnlineSecurity"
                value={formData.OnlineSecurity}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No (Increases Churn)</option>
                <option value="Yes">Yes (Protective)</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-online-backup" className="block text-slate-600 font-medium mb-1">Online Backup</label>
              <select
                id="predict-online-backup"
                name="OnlineBackup"
                value={formData.OnlineBackup}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-device-prot" className="block text-slate-600 font-medium mb-1">Device Protection</label>
              <select
                id="predict-device-prot"
                name="DeviceProtection"
                value={formData.DeviceProtection}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-phone" className="block text-slate-600 font-medium mb-1">Phone Service</label>
              <select
                id="predict-phone"
                name="PhoneService"
                value={formData.PhoneService}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-multiple-lines" className="block text-slate-600 font-medium mb-1">Multiple Lines</label>
              <select
                id="predict-multiple-lines"
                name="MultipleLines"
                value={formData.MultipleLines}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No phone service">No phone service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-streaming-tv" className="block text-slate-600 font-medium mb-1">Streaming TV</label>
              <select
                id="predict-streaming-tv"
                name="StreamingTV"
                value={formData.StreamingTV}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>

            <div>
              <label htmlFor="predict-streaming-movies" className="block text-slate-600 font-medium mb-1">Streaming Movies</label>
              <select
                id="predict-streaming-movies"
                name="StreamingMovies"
                value={formData.StreamingMovies}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Billing */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold">4. Billing</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="predict-monthly" className="block text-slate-600 font-medium mb-1">Monthly Charges ($)</label>
              <input
                id="predict-monthly"
                type="number"
                step="0.05"
                name="MonthlyCharges"
                value={formData.MonthlyCharges}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Observed range in dataset: $18.25 - $118.75</span>
            </div>

            <div>
              <label htmlFor="predict-total" className="block text-slate-600 font-medium mb-1">Total Charges ($)</label>
              <input
                id="predict-total"
                type="number"
                step="0.5"
                name="TotalCharges"
                value={formData.TotalCharges}
                onChange={handleChange}
                className="w-full py-1.5 px-2.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Cumulative billed amount across customer tenure</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing customer...' : 'Analyze Customer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
