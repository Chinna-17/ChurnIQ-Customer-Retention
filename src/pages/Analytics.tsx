import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Clock,
  CreditCard,
  Wifi,
  DollarSign,
  LifeBuoy,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { AnalyticsSummary } from '../types';
import { fetchAnalytics } from '../api/client';

export const Analytics: React.FC = () => {
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
          setError(err.message || 'Failed to load business analytics');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-lg p-5" />
          <div className="h-72 bg-white border border-slate-200 rounded-lg p-5" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {error || 'Unable to retrieve analytics summary.'}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Business Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Multivariate dataset analysis examining observed churn patterns across contracts, tenure, payment channels, and service add-ons.
        </p>
      </div>

      {/* Grid of the 7 specified core business charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Churn by Contract */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Contract</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn rate across commitment terms</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByContract} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Customers on month-to-month contracts show the highest observed churn rate (42.7% vs 11.3% for 1-year and 2.8% for 2-year).</span>
          </div>
        </div>

        {/* 2. Churn by Tenure */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Tenure</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn grouped by months with company</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByTenure} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="tenureGroup" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 60]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Customers with shorter tenure exhibit substantially higher churn rates (47.7% in months 0-12, dropping to 6.6% after 5 years).</span>
          </div>
        </div>

        {/* 3. Churn by Payment Method */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Payment Method</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn by billing payment channel</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByPayment} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="paymentMethod" tick={{ fontSize: 9.5, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Electronic check customers show higher observed churn (45.3%) than customers using automated payment methods (Bank transfer: 16.7%, Credit card: 15.2%).</span>
          </div>
        </div>

        {/* 4. Churn by Internet Service */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Internet Service</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn across internet access technologies</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByInternet} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="service" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Fiber optic accounts experience 41.9% observed churn, compared to 19.0% for DSL and 7.4% for accounts without internet service.</span>
          </div>
        </div>

        {/* 5. Churn by Monthly Charges */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Monthly Charges</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn grouped by monthly spend bands</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByCharges} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="chargesBand" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 45]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Churn rate varies across monthly charge ranges: accounts in the $61-$85 and $86-$118 bands show higher observed churn than lower spend tiers.</span>
          </div>
        </div>

        {/* 6. Churn by Tech Support */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Tech Support</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn with versus without technical assistance</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByTechSupport} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="techSupport" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Customers without technical support churn at 41.6%, compared to 15.2% for customers with active tech support.</span>
          </div>
        </div>

        {/* 7. Churn by Online Security */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Churn by Online Security</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Observed churn with versus without online cybersecurity add-on</p>

            <div className="h-56 w-full max-w-2xl mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.churnByOnlineSecurity} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="onlineSecurity" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 50]} />
                  <Tooltip formatter={(val: any) => [`${val}% Churn Rate`, 'Rate']} />
                  <Bar dataKey="churnRate" name="Churn Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Subscribers without online security experience an observed churn rate of 41.8%, compared to 14.6% when online security is enabled.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
