export interface CustomerRecord {
  customerID: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: string;
  predictedProbability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface DatasetOverview {
  totalCustomers: number;
  churnedCustomers: number;
  retainedCustomers: number;
  churnRate: number;
  highRiskCustomers: number;
  mediumRiskCustomers: number;
  lowRiskCustomers: number;
  highRiskMRR: number;
  totalMRR: number;
  highRiskMRRPercent: number;
  avgTenureMonths: number;
  avgMonthlyCharge: number;
}

export interface ChurnDistributionItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface RiskDistributionItem {
  name: string;
  count: number;
  color: string;
}

export interface ContractChurnItem {
  contract: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface TenureChurnItem {
  tenureGroup: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface InternetChurnItem {
  service: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface PaymentChurnItem {
  paymentMethod: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface TechSupportChurnItem {
  techSupport: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface OnlineSecurityChurnItem {
  onlineSecurity: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface SeniorChurnItem {
  seniorCitizen: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface ChargesChurnItem {
  chargesBand: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface AnalyticsSummary {
  datasetOverview: DatasetOverview;
  churnDistribution: ChurnDistributionItem[];
  riskDistribution: RiskDistributionItem[];
  churnByContract: ContractChurnItem[];
  churnByTenure: TenureChurnItem[];
  churnByInternet: InternetChurnItem[];
  churnByPayment: PaymentChurnItem[];
  churnByTechSupport: TechSupportChurnItem[];
  churnByOnlineSecurity: OnlineSecurityChurnItem[];
  churnBySenior: SeniorChurnItem[];
  churnByCharges: ChargesChurnItem[];
}

export interface ModelComparisonItem {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
  roc_curve: Array<{ fpr: number; tpr: number }>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  coefficient?: number;
  direction?: string;
}

export interface ModelArtifacts {
  selected_model: string;
  selection_rationale: string;
  models_comparison: Record<string, ModelComparisonItem>;
  feature_importance: FeatureImportanceItem[];
  test_set_size: number;
  train_set_size: number;
  total_features: number;
  feature_names: string[];
}

export interface PredictionRequest {
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
}

export interface PredictionResponse {
  prediction: string;
  probability: number;
  confidence: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_factors: string[];
  retention_actions: string[];
  customer_summary: {
    tenure: number;
    contract: string;
    monthlyCharges: number;
    paymentMethod: string;
  };
  error?: string;
}

export interface CustomersApiResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  customers: CustomerRecord[];
}
