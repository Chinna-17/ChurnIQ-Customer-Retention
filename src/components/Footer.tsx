import React from 'react';
import { Layers, Database, Cpu, GitBranch, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">ChurnIQ · Portfolio Edition</span>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              An ML-powered customer retention platform that identifies customers at risk of churn and turns customer data into actionable retention insights.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 pt-1">
              <span className="font-medium text-slate-700">
                IBM Telco Customer Churn Dataset · 7,043 records
              </span>
              <span aria-hidden="true">·</span>
              <span>Scikit-learn Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>Stratified Train/Test Split</span>
              <span aria-hidden="true">·</span>
              <span>ROC-AUC · Recall · F1</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-blue-700">Portfolio Project</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('overview')} className="hover:text-blue-600 transition-colors">
                  Overview Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('customers')} className="hover:text-blue-600 transition-colors">
                  Customer Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('predict')} className="hover:text-blue-600 transition-colors">
                  Predict Churn Form
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className="hover:text-blue-600 transition-colors">
                  Business Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('model')} className="hover:text-blue-600 transition-colors">
                  Model Insights & Explainability
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Project Information</h4>
            <p className="text-xs text-slate-500 mb-2">
              Portfolio project built by a B.Tech Artificial Intelligence & Data Science candidate.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Stack: Python, Pandas, Scikit-learn, React, Vite, Express</li>
              <li>• Evaluated with ROC-AUC, Recall & Balanced F1</li>
              <li>• Zero-data-leakage pipeline design</li>
            </ul>
            <div className="mt-3">
              <button
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
              >
                Read Project Architecture & Methodology
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <p>© {new Date().getFullYear()} ChurnIQ — Customer Retention Intelligence Platform. Demo environment.</p>
          <p className="text-slate-600">Predict churn. Understand customers. Retain smarter.</p>
        </div>
      </div>
    </footer>
  );
};
