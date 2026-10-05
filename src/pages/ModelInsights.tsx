import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle, 
  BarChart2, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  Info, 
  Award,
  GitCompare,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { ModelArtifacts, ModelComparisonItem } from '../types';
import { fetchModelMetrics } from '../api/client';

export const ModelInsights: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ModelArtifacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelTab, setSelectedModelTab] = useState<string>('Logistic Regression');

  useEffect(() => {
    let mounted = true;
    fetchModelMetrics()
      .then((data) => {
        if (mounted) {
          setArtifacts(data);
          if (data.selected_model) {
            setSelectedModelTab(data.selected_model);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load model metrics');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-48 bg-white border border-slate-200 rounded-lg" />
        <div className="h-80 bg-white border border-slate-200 rounded-lg" />
      </div>
    );
  }

  if (error || !artifacts) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {error || 'Unable to load model metrics.'}
      </div>
    );
  }

  const currentModelData = artifacts.models_comparison[selectedModelTab];
  const confMatrix = currentModelData?.confusion_matrix || [[0, 0], [0, 0]];
  const [tn, fp] = confMatrix[0] || [0, 0];
  const [fn, tp] = confMatrix[1] || [0, 0];

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Model Insights & Explainability
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Rigorous test-set evaluation across candidate architectures, decision boundary explainability, and feature attribution.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded text-xs text-slate-600 font-mono self-start sm:self-auto">
            <span>Holdout Test: {artifacts.test_set_size?.toLocaleString() || '1,409'} samples</span>
            <span>·</span>
            <span>Stratified 20%</span>
          </div>
        </div>
      </div>

      {/* Model Selection Banner */}
      <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Selected Production Model
              </span>
              <span className="text-xs text-slate-500">Pipeline: Preprocessor + Balanced Classifier</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {artifacts.selected_model} (with Balanced Class Weights)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {artifacts.selection_rationale}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">ROC-AUC</span>
              <span className="text-xl font-extrabold text-blue-700">
                {artifacts.models_comparison[artifacts.selected_model]?.roc_auc.toFixed(3)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Recall</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {(artifacts.models_comparison[artifacts.selected_model]?.recall * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">F1 Score</span>
              <span className="text-xl font-extrabold text-slate-900">
                {artifacts.models_comparison[artifacts.selected_model]?.f1.toFixed(3)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Accuracy</span>
              <span className="text-xl font-extrabold text-slate-700">
                {(artifacts.models_comparison[artifacts.selected_model]?.accuracy * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Candidate Model Benchmarking (Holdout Test Set)</h3>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Model Architecture</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall (Churners Found)</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.values(artifacts.models_comparison).map((model) => {
                  const isSelected = model.name === artifacts.selected_model;
                  return (
                    <tr
                      key={model.name}
                      onClick={() => setSelectedModelTab(model.name)}
                      className={`cursor-pointer transition-colors ${
                        selectedModelTab === model.name ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        {isSelected && (
                          <Award className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span>{model.name}</span>
                      </td>
                      <td className="py-3 px-4">{(model.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4">{(model.precision * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {(model.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">{model.f1.toFixed(3)}</td>
                      <td className="py-3 px-4 font-bold text-blue-700">{model.roc_auc.toFixed(3)}</td>
                      <td className="py-3 px-4 text-center">
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                            Active in API
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] text-slate-500 bg-slate-100">
                            Evaluated
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
          <div className="font-semibold text-slate-800">Understanding Metric Selection in Churn Economics:</div>
          <p>
            Notice that <strong>Gradient Boosting</strong> achieved the highest raw Accuracy (80.3%), but its Recall was only 53.2% — meaning it missed nearly half of all churned customers. In contrast, <strong>Logistic Regression with balanced weights</strong> captures <strong>78.3% of churners</strong> while preserving an outstanding <strong>0.842 ROC-AUC</strong>.
          </p>
        </div>
      </section>

      {/* Model Diagnostic Deep-Dive (Confusion Matrix + ROC Curve) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Diagnostic Evaluation: {selectedModelTab}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
            {Object.keys(artifacts.models_comparison).map((name) => (
              <button
                key={name}
                onClick={() => setSelectedModelTab(name)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedModelTab === name ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confusion Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Confusion Matrix (1,409 Holdout Test Set)</h4>
              <p className="text-xs text-slate-500">True Retained vs True Churned breakdown</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto my-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[11px] uppercase tracking-wider text-emerald-700 block font-semibold">
                  True Negative (TN)
                </span>
                <span className="text-2xl font-bold text-slate-900">{tn}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Correctly Retained</span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[11px] uppercase tracking-wider text-amber-700 block font-semibold">
                  False Positive (FP)
                </span>
                <span className="text-2xl font-bold text-slate-900">{fp}</span>
                <span className="text-[11px] text-slate-500 block mt-1">False Alarm</span>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-[11px] uppercase tracking-wider text-rose-700 block font-semibold">
                  False Negative (FN)
                </span>
                <span className="text-2xl font-bold text-slate-900">{fn}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Missed Churners</span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[11px] uppercase tracking-wider text-blue-700 block font-semibold">
                  True Positive (TP)
                </span>
                <span className="text-2xl font-bold text-slate-900">{tp}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Correctly Flagged</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Total Actual Churners in Test Set: {fn + tp} | Correctly Identified: {tp} ({(tp / (fn + tp) * 100).toFixed(1)}% Recall)
            </div>
          </div>

          {/* ROC Curve */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Receiver Operating Characteristic (ROC)</h4>
                <p className="text-xs text-slate-500">True Positive Rate vs. False Positive Rate curve</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded border border-blue-100">
                AUC = {currentModelData?.roc_auc.toFixed(3)}
              </span>
            </div>

            <div className="h-56">
              {currentModelData?.roc_curve ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentModelData.roc_curve} margin={{ top: 10, right: 15, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fpr" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 1]} unit="" label={{ value: 'FPR', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                    <YAxis dataKey="tpr" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 1]} unit="" label={{ value: 'TPR', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [val, 'Rate']} />
                    <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <p className="text-xs text-slate-500 text-center">
              The model curve hugs the upper-left boundary, demonstrating strong discriminative ability.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Importance & Attribution */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Feature Importance & Model Attribution
          </h3>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Features Influencing Model Predictions</h4>
            <p className="text-xs text-slate-500">
              Normalized feature influence magnitude in the selected model decision pipeline
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={artifacts.feature_importance}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={120} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} (${item.payload.direction || 'Influence'})`,
                    'Weight'
                  ]}
                />
                <Bar dataKey="importance" name="Model Weight" radius={[0, 4, 4, 0]}>
                  {artifacts.feature_importance.map((entry, index) => {
                    const isProtective = entry.direction?.includes('Protect');
                    return (
                      <Cell
                        key={`feat-${index}`}
                        fill={isProtective ? '#10b981' : '#f43f5e'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              Increases Churn Propensity (e.g. Month-to-month, Fiber Optic, Paperless)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              Protects Customer Retention (e.g. Two-Year Contract, High Tenure, Tech Support)
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-md text-xs text-slate-500 italic">
            * Note on Explainability: These features have a strong influence on the model's predictions. Feature importance illustrates statistical association within the decision boundary, not guaranteed causal relationships.
          </div>
        </div>
      </section>
    </div>
  );
};
