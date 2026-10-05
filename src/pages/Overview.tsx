import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CreditCard,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { KpiCard } from '../components/KpiCard';
import { AnalyticsSummary } from '../types';
import { fetchAnalytics } from '../api/client';

interface OverviewProps {
  onNavigateToPredict: () => void;
  onNavigateToCustomers: (riskFilter?: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigateToPredict,
  onNavigateToCustomers,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAnalytics()
      .then((data) => {
        if (mounted) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load retention metrics');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const overview = analytics?.datasetOverview;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Retention Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor churn patterns and identify customers that may need attention.
          </p>
        </div>

        {/* Dataset Context and Quick Segment Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
            Portfolio Dataset · {overview ? overview.totalCustomers.toLocaleString() : '...'} Customer Records
          </div>
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => onNavigateToCustomers('all')}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded hover:bg-white transition-colors"
            >
              All
            </button>
            <button
              onClick={() => onNavigateToCustomers('high')}
              className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:text-rose-900 rounded hover:bg-rose-50 transition-colors"
            >
              High Risk
            </button>
            <button
              onClick={() => onNavigateToCustomers('medium')}
              className="px-2.5 py-1 text-xs font-medium text-amber-700 hover:text-amber-900 rounded hover:bg-amber-50 transition-colors"
            >
              Medium Risk
            </button>
            <button
              onClick={() => onNavigateToCustomers('low')}
              className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-50 transition-colors"
            >
              Low Risk
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={overview ? overview.totalCustomers.toLocaleString() : '...'}
          subtitle="Customer records"
          trend="Total in dataset"
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
          loading={loading}
        />
        <KpiCard
          title="Churn Rate"
          value={overview ? `${overview.churnRate}%` : '...'}
          subtitle={overview ? `${overview.churnedCustomers.toLocaleString()} customers churned` : 'Observed churn'}
          trend="Observed rate"
          icon={TrendingDown}
          iconColor="text-rose-600 bg-rose-50"
          loading={loading}
        />
        <KpiCard
          title="High-Risk Customers"
          value={overview ? overview.highRiskCustomers.toLocaleString() : '...'}
          subtitle="Predicted churn probability >65%"
          trend="Model calculated"
          icon={AlertTriangle}
          iconColor="text-amber-600 bg-amber-50"
          loading={loading}
        />
        <KpiCard
          title="Monthly Charges from High-Risk Customers"
          value={overview ? `$${(overview.highRiskMRR / 1000).toFixed(1)}K` : '...'}
          subtitle={overview ? `${overview.highRiskMRRPercent}% of total monthly charges` : 'Monthly charges from high-risk customers'}
          trend="Predicted churn probability >65%"
          icon={DollarSign}
          iconColor="text-emerald-600 bg-emerald-50"
          loading={loading}
        />
      </div>

      {/* Active Retention Decision Support Section */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Active Retention Decision Support
          </h2>
          <p className="text-xs text-blue-800/80">
            Identify customers with elevated churn risk and review the factors contributing to their risk. Currently {overview ? overview.highRiskCustomers.toLocaleString() : '2,088'} customers predicted to have elevated churn risk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToCustomers('high')}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors shadow-2xs"
          >
            View High-Risk Customers
          </button>
          <button
            onClick={onNavigateToPredict}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs"
          >
            <span>Predict Customer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Churn Distribution */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Churn Distribution</h3>
            <p className="text-xs text-slate-500">Customer retention versus observed attrition in the dataset.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.churnDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.churnDistribution}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent}%`}
                    labelLine={false}
                  >
                    {analytics.churnDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${Number(val).toLocaleString()} customers (${item.payload.percent}%)`,
                      name
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Retained: {overview ? `${overview.retainedCustomers.toLocaleString()} (${(100 - overview.churnRate).toFixed(1)}%)` : '...'}</span>
            <span>Churned: {overview ? `${overview.churnedCustomers.toLocaleString()} (${overview.churnRate}%)` : '...'}</span>
          </div>
        </div>

        {/* Chart B: Churn by Contract Type */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Churn Rate by Contract Term</h3>
            <p className="text-xs text-slate-500">Churn varies significantly across customer contract types.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.churnByContract ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByContract} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']}
                    labelFormatter={(label) => `Contract: ${label}`}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            Month-to-month customers show substantially higher churn than customers on longer contracts (42.7% vs 11.3% for one-year and 2.8% for two-year).
          </div>
        </div>

        {/* Chart C: Churn Across Tenure Groups */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Churn Rate Across Customer Tenure</h3>
            <p className="text-xs text-slate-500">Analyze how customer tenure relates to observed churn.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.churnByTenure ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByTenure} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="tenureGroup" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 60]} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']}
                    labelFormatter={(label) => `Tenure Group: ${label}`}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            Churn is highest among customers with shorter tenure (47.7% in the first 12 months, stabilizing to 6.6% in months 61-72).
          </div>
        </div>

        {/* Chart D: Customer Risk Level Distribution */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Model-Predicted Risk Segmentation</h3>
            <p className="text-xs text-slate-500">Distribution of customers based on predicted churn probability.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.riskDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.riskDistribution}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={140} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} Customers`, 'Count']}
                  />
                  <Bar dataKey="count" name="Customers" radius={[0, 4, 4, 0]}>
                    {analytics.riskDistribution.map((entry, index) => (
                      <Cell key={`risk-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Low Risk (&lt;35%): {overview?.lowRiskCustomers.toLocaleString()}</span>
            <span>Medium Risk (35-65%): {overview?.mediumRiskCustomers.toLocaleString()}</span>
            <span>High Risk (&gt;65%): {overview?.highRiskCustomers.toLocaleString()}</span>
          </div>
        </div>

        {/* Chart E: Churn by Payment Method */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Churn Rate by Payment Method</h3>
            <p className="text-xs text-slate-500">Compare observed churn across different payment methods.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.churnByPayment ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByPayment} margin={{ top: 10, right: 15, left: -10, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="paymentMethod" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    angle={-15} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']}
                    labelFormatter={(label) => `Method: ${label}`}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            Electronic check customers show higher observed churn (45.3%) than customers using automated payment methods (Bank transfer: 16.7%, Credit card: 15.2%).
          </div>
        </div>

        {/* Chart F: Monthly Charges vs Churn */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Churn Rate by Monthly Spend Band</h3>
            <p className="text-xs text-slate-500">Compare observed churn across monthly billing tiers.</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.churnByCharges ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByCharges} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="chargesBand" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 45]} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']}
                    labelFormatter={(label) => `Monthly Spend: ${label}`}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            Churn rate varies across monthly charge ranges: customers billed in the $61-$85 and $86-$118 bands show higher observed churn than lower spend tiers.
          </div>
        </div>
      </div>
    </div>
  );
};
