import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';
import { CustomerRecord } from '../types';
import { fetchCustomers, CustomerQueryParams } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';
import { CustomerDetailModal } from '../components/CustomerDetailModal';

interface CustomersProps {
  initialRiskFilter?: string;
  onSelectCustomerForPrediction: (customer: CustomerRecord) => void;
}

export const Customers: React.FC<CustomersProps> = ({
  initialRiskFilter = '',
  onSelectCustomerForPrediction,
}) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [churnFilter, setChurnFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter || 'all');
  const [sortBy, setSortBy] = useState('predictedProbability');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Modal detail
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);

    const params: CustomerQueryParams = {
      search,
      churn: churnFilter,
      contract: contractFilter,
      risk: riskFilter,
      sortBy,
      order,
      page,
      limit,
    };

    fetchCustomers(params)
      .then((res) => {
        setCustomers(res.customers);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch customer records');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [page, limit, churnFilter, contractFilter, riskFilter, sortBy, order]);

  // Debounced search trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setChurnFilter('all');
    setContractFilter('all');
    setRiskFilter('all');
    setSortBy('predictedProbability');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and filter {total ? total.toLocaleString() : '7,043'} customer records with real ML risk scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer ID (e.g. 7590-VHVEG)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 bg-slate-50/50"
            />
          </form>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by ML Risk Tier"
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="high">High Risk (&gt;65%)</option>
              <option value="medium">Medium Risk (35-65%)</option>
              <option value="low">Low Risk (&lt;35%)</option>
            </select>
          </div>

          {/* Contract Filter */}
          <div>
            <select
              value={contractFilter}
              onChange={(e) => {
                setContractFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Contract Type"
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Contracts</option>
              <option value="month-to-month">Month-to-month</option>
              <option value="one year">One year</option>
              <option value="two year">Two year</option>
            </select>
          </div>

          {/* Churn Status Filter */}
          <div>
            <select
              value={churnFilter}
              onChange={(e) => {
                setChurnFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Churn Status"
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Churn Statuses</option>
              <option value="yes">Churned</option>
              <option value="no">Retained</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {customers.length} of {total.toLocaleString()} filtered records</span>
            {(search || churnFilter !== 'all' || contractFilter !== 'all' || riskFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium underline ml-2"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Records per page"
              className="py-1 px-2 text-xs border border-slate-200 rounded bg-white text-slate-700 focus:outline-hidden"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Customers Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('customerID')} 
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-hidden"
                  >
                    Customer ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('predictedProbability')} 
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-hidden text-blue-700"
                  >
                    ML Risk Score
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('tenure')} 
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-hidden"
                  >
                    Tenure
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('MonthlyCharges')} 
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-hidden"
                  >
                    Monthly Charges
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('TotalCharges')} 
                    className="flex items-center gap-1 hover:text-slate-900 focus:outline-hidden"
                  >
                    Total Charges
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Internet Service</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Actual Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: limit }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-12 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-14 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-10 bg-slate-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-sm">
                    No customers match the selected filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr 
                    key={c.customerID}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 group-hover:text-blue-600">
                      {c.customerID}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge 
                        level={c.riskLevel} 
                        probability={c.predictedProbability} 
                        size="sm" 
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.tenure} mos
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.Contract}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      ${c.MonthlyCharges.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      ${c.TotalCharges.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.InternetService}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]" title={c.PaymentMethod}>
                      {c.PaymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        c.Churn === 'Yes' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.Churn === 'Yes' ? 'Churned' : 'Retained'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectCustomerForPrediction(c)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                          title="Simulate Retention What-If in Predict Churn"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail Slideover / Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onLoadIntoPredict={(c) => {
          setSelectedCustomer(null);
          onSelectCustomerForPrediction(c);
        }}
      />
    </div>
  );
};
