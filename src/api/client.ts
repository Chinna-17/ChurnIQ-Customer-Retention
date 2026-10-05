import {
  AnalyticsSummary,
  DatasetOverview,
  ModelArtifacts,
  CustomersApiResponse,
  PredictionRequest,
  PredictionResponse
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchSummary(): Promise<DatasetOverview> {
  const res = await fetch(`${BASE_URL}/api/summary`);
  if (!res.ok) throw new Error('Failed to load dataset overview');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${BASE_URL}/api/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics data');
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelArtifacts> {
  const res = await fetch(`${BASE_URL}/api/model-metrics`);
  if (!res.ok) throw new Error('Failed to load model metrics');
  return res.json();
}

export interface CustomerQueryParams {
  search?: string;
  churn?: string;
  contract?: string;
  risk?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function fetchCustomers(params: CustomerQueryParams = {}): Promise<CustomersApiResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.churn) query.set('churn', params.churn);
  if (params.contract) query.set('contract', params.contract);
  if (params.risk) query.set('risk', params.risk);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${BASE_URL}/api/customers?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch customer data');
  return res.json();
}

export async function fetchCustomerById(customerId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/customers/${encodeURIComponent(customerId)}`);
  if (!res.ok) throw new Error(`Customer with ID ${customerId} not found`);
  return res.json();
}

export async function fetchFeatureImportance(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/feature-importance`);
  if (!res.ok) throw new Error('Failed to load feature importance');
  return res.json();
}

export async function predictCustomer(data: PredictionRequest): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMsg = "We couldn't complete the analysis. Please try again.";
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
