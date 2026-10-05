import React from 'react';
import { 
  Info, 
  Target, 
  Layers, 
  CheckCircle, 
  Cpu, 
  Database, 
  Code2, 
  Briefcase,
  GitBranch,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            Portfolio Architecture & Methodology
          </span>
          <span className="text-xs text-slate-500">· Demo Environment</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          About ChurnIQ
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          An ML-powered customer retention platform that identifies customers at risk of churn and turns customer data into actionable retention insights.
        </p>
      </div>

      {/* 1. Problem & Business Context */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">The Business Problem</h2>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            Customer churn can reduce recurring revenue and increase the cost of acquiring replacement customers. Identifying customers with elevated churn risk can help businesses prioritize retention efforts.
          </p>
          <p>
            In subscription-based businesses, acquiring a new customer typically costs <strong>5 to 7 times more</strong> than retaining an existing customer. Rather than waiting for cancellation notices, organizations benefit from early detection of customer accounts that may need proactive attention.
          </p>
        </div>
      </section>

      {/* 2. The Solution */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">The ChurnIQ Solution</h2>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            ChurnIQ uses machine learning to estimate customer churn probability and provides customer-level risk information and aggregate retention analytics.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <li className="p-3 bg-slate-50 rounded border border-slate-200/60 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-xs font-semibold">Predicted Churn Probability</strong>
                <span className="text-xs text-slate-600">Continuous risk probability from 0% to 100% computed using a trained Scikit-learn model pipeline.</span>
              </div>
            </li>
            <li className="p-3 bg-slate-50 rounded border border-slate-200/60 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-xs font-semibold">Prediction Factors</strong>
                <span className="text-xs text-slate-600">Model-based factor identification highlighting contract type, spend, and support features.</span>
              </div>
            </li>
            <li className="p-3 bg-slate-50 rounded border border-slate-200/60 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-xs font-semibold">Suggested Retention Actions</strong>
                <span className="text-xs text-slate-600">Actionable, rule-based recommendations for contract incentives and service add-ons.</span>
              </div>
            </li>
            <li className="p-3 bg-slate-50 rounded border border-slate-200/60 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-xs font-semibold">Aggregate Retention Analytics</strong>
                <span className="text-xs text-slate-600">Portfolio-wide visibility into monthly charges from high-risk accounts and contract patterns.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. End-to-End Workflow */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">End-to-End Workflow</h2>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <Database className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">Customer Data</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <Cpu className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">Preprocessing</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <Layers className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">ML Model</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">Churn Probability</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <span className="text-[11px] font-bold text-amber-700 block">Risk Tier</span>
              <div className="text-slate-500 text-[10px]">Low / Med / High</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <span className="text-[11px] font-bold text-slate-900 block">Prediction Factors</span>
              <div className="text-slate-500 text-[10px]">Feature weights</div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 w-full">
              <Briefcase className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">Retention Opportunity</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Technology Stack & Engineering Rigor */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Technology Stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Machine Learning & Data Science</h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>Python 3.10+</strong>: Core computational runtime</li>
              <li>• <strong>Pandas & NumPy</strong>: Vectorized feature transformation and cleaning</li>
              <li>• <strong>Scikit-Learn</strong>: ColumnTransformer + Model Pipeline</li>
              <li>• <strong>FastAPI / Flask</strong>: Standalone REST API service</li>
              <li>• <strong>Joblib</strong>: Serialized pipeline persistence (zero data leakage)</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Frontend & Visualization</h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>React 19 & TypeScript</strong>: Component architecture & state management</li>
              <li>• <strong>Vite</strong>: Build tool & development server</li>
              <li>• <strong>Tailwind CSS</strong>: Professional SaaS layout & typography</li>
              <li>• <strong>Recharts</strong>: Responsive business analytics charts</li>
              <li>• <strong>Git / GitHub</strong>: Version control & deployment readiness</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Why this project matters */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Why This Project Matters</h2>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-6 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            In many academic machine learning projects, models are evaluated solely on aggregate accuracy, obscuring fatal blind spots. In churn prediction, predicting that every customer will stay achieves ~73.5% baseline accuracy while being completely useless to an executive team.
          </p>
          <p>
            <strong>ChurnIQ demonstrates production data science discipline:</strong>
          </p>
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>
              <strong>Prioritizing Business ROI over Raw Accuracy:</strong> Emphasizes Recall (identifying 78.3% of actual churners) and ROC-AUC (0.842) by leveraging balanced class weighting.
            </li>
            <li>
              <strong>End-to-End Inference Integrity:</strong> The frontend form communicates via real HTTP POST endpoints with a trained Scikit-learn Pipeline on disk, executing identical imputation, scaling, and one-hot encoding used during training.
            </li>
            <li>
              <strong>Actionable Explainability:</strong> Predictions are paired with model attribution weights and suggested commercial interventions that a customer success manager can immediately execute.
            </li>
          </ol>
        </div>
      </section>

      {/* Author & Context Footer */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-800 block">Created for B.Tech AI & Data Science Portfolio</span>
          <span>Deployable via GitHub and Cloud Container Hosting Platform</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-slate-700">Dataset: Telco Customer Churn</span>
        </div>
      </div>
    </div>
  );
};
