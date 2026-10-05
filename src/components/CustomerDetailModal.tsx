import React from 'react';
import { CustomerRecord } from '../types';
import { RiskBadge } from './RiskBadge';
import { X, CreditCard, Shield, User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: CustomerRecord | null;
  onClose: () => void;
  onLoadIntoPredict: (customer: CustomerRecord) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onLoadIntoPredict,
}) => {
  if (!customer) return null;

  // Derive model-grounded factors influencing this customer's prediction
  const factors: string[] = [];
  const retentionActions: string[] = [];

  if (customer.Contract === 'Month-to-month') {
    factors.push('Month-to-month contract (strongest positive association with churn in the model)');
    retentionActions.push('Review contract upgrade incentives to transition customer to an annual agreement.');
  } else if (customer.Contract === 'Two year') {
    factors.push('Two-year contract commitment (strong protective retention factor)');
  } else if (customer.Contract === 'One year') {
    factors.push('One-year contract commitment (moderate protective retention factor)');
  }

  if (customer.tenure <= 12) {
    factors.push(`Short customer tenure (${customer.tenure} months) in the initial onboarding phase`);
    retentionActions.push('Consider personalized onboarding outreach and customer success check-ins for newer accounts.');
  } else if (customer.tenure >= 48) {
    factors.push(`Long customer tenure (${customer.tenure} months) indicating established service history`);
  }

  if (customer.MonthlyCharges >= 70) {
    factors.push(`Higher monthly charges ($${customer.MonthlyCharges.toFixed(2)}/mo) relative to portfolio median`);
    retentionActions.push('Consider support or service-plan assistance, including bundle savings or plan review.');
  }

  if (customer.InternetService === 'Fiber optic') {
    factors.push('Fiber optic internet service tier');
  }

  if (customer.PaymentMethod === 'Electronic check') {
    factors.push('Electronic check payment method');
    retentionActions.push('Review billing/payment experience and encourage automated payment options with a one-time bill credit.');
  }

  if (customer.TechSupport === 'No' && customer.InternetService !== 'No') {
    factors.push('No technical support add-on on active internet connection');
    retentionActions.push('Evaluate whether complimentary trial of priority technical support would improve service experience.');
  }

  if (customer.OnlineSecurity === 'No' && customer.InternetService !== 'No') {
    factors.push('No online security protection add-on');
    retentionActions.push('Evaluate whether additional security and data protection features could increase account stickiness.');
  }

  if (factors.length === 0) {
    factors.push('Standard multi-service account baseline with balanced attributes');
  }

  if (retentionActions.length === 0) {
    retentionActions.push('Maintain regular relationship reviews and account health monitoring.');
  }

  const isHighRisk = customer.riskLevel === 'High' || customer.predictedProbability >= 0.65;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 font-mono">
                {customer.customerID}
              </h3>
              <RiskBadge level={customer.riskLevel} probability={customer.predictedProbability} size="md" />
              <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                customer.Churn === 'Yes' 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Actual Historical Status: {customer.Churn === 'Yes' ? 'Churned' : 'Retained'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer profile and model-predicted risk evaluation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Churn Risk Summary Banner */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block mb-0.5">
                Churn Probability
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {(customer.predictedProbability * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  ML Risk Score
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block mb-0.5">
                Risk Level
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded border ${
                customer.riskLevel === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : customer.riskLevel === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  customer.riskLevel === 'High' ? 'bg-rose-500' : customer.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                {customer.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>

          {/* Section: Why is this customer considered at risk / Features influencing this model prediction */}
          <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              {isHighRisk ? 'Why is this customer considered high risk?' : 'Model Risk Factors'}
            </h4>
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              Features influencing this model prediction:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
              * Features influencing model predictions illustrate statistical association within the decision boundary, not guaranteed causality.
            </p>
          </div>

          {/* Section: Suggested Retention Actions */}
          <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Suggested Retention Actions
            </h4>
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              Potential action for review:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {retentionActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
              * Suggested retention actions are decision-support recommendations and do not guarantee customer retention outcomes.
            </p>
          </div>

          {/* Customer Profile & Demographics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              Customer Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Gender</span>
                <span className="font-semibold text-slate-800">{customer.gender}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Senior Citizen</span>
                <span className="font-semibold text-slate-800">{customer.SeniorCitizen === 1 ? 'Yes (65+)' : 'No'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Partner</span>
                <span className="font-semibold text-slate-800">{customer.Partner}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Dependents</span>
                <span className="font-semibold text-slate-800">{customer.Dependents}</span>
              </div>
            </div>
          </div>

          {/* Account & Billing */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Account & Billing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tenure</span>
                <span className="font-medium text-slate-800">{customer.tenure} months</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contract</span>
                <span className="font-medium text-slate-800">{customer.Contract}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Paperless Billing</span>
                <span className="font-medium text-slate-800">{customer.PaperlessBilling}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-800">{customer.PaymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Monthly Charges</span>
                <span className="font-medium text-slate-800">${customer.MonthlyCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Charges</span>
                <span className="font-medium text-slate-800">${customer.TotalCharges.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Services & Subscriptions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-500" />
              Services & Add-ons
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Phone Service</span>
                <span className="font-semibold text-slate-800">{customer.PhoneService}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Multiple Lines</span>
                <span className="font-semibold text-slate-800">{customer.MultipleLines}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Internet Service</span>
                <span className="font-semibold text-slate-800">{customer.InternetService}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Online Security</span>
                <span className={`font-semibold ${customer.OnlineSecurity === 'Yes' ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {customer.OnlineSecurity}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Online Backup</span>
                <span className="font-semibold text-slate-800">{customer.OnlineBackup}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Device Protection</span>
                <span className="font-semibold text-slate-800">{customer.DeviceProtection}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Tech Support</span>
                <span className={`font-semibold ${customer.TechSupport === 'Yes' ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {customer.TechSupport}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Streaming TV</span>
                <span className="font-semibold text-slate-800">{customer.StreamingTV}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block">Streaming Movies</span>
                <span className="font-semibold text-slate-800">{customer.StreamingMovies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onLoadIntoPredict(customer)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load into Predict Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};
