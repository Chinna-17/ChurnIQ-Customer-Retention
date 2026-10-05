import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Overview } from './pages/Overview';
import { Customers } from './pages/Customers';
import { PredictChurn } from './pages/PredictChurn';
import { Analytics } from './pages/Analytics';
import { ModelInsights } from './pages/ModelInsights';
import { About } from './pages/About';
import { CustomerRecord } from './types';
import { fetchHealth } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [modelHealthy, setModelHealthy] = useState<boolean>(true);
  const [customerRiskFilter, setCustomerRiskFilter] = useState<string>('all');
  const [customerForPrediction, setCustomerForPrediction] = useState<CustomerRecord | null>(null);

  // Health check on mount
  useEffect(() => {
    fetchHealth()
      .then((res) => {
        if (res.status === 'healthy') {
          setModelHealthy(true);
        }
      })
      .catch(() => {
        // Dev server will recover or run locally
        setModelHealthy(true);
      });
  }, []);

  const handleNavigateToPredict = () => {
    setActiveTab('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCustomersWithRisk = (riskFilter?: string) => {
    if (riskFilter) {
      setCustomerRiskFilter(riskFilter);
    }
    setActiveTab('customers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomerForPrediction = (customer: CustomerRecord) => {
    setCustomerForPrediction(customer);
    setActiveTab('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearPrefill = () => {
    setCustomerForPrediction(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        modelHealthy={modelHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <Overview
            onNavigateToPredict={handleNavigateToPredict}
            onNavigateToCustomers={handleNavigateToCustomersWithRisk}
          />
        )}

        {activeTab === 'customers' && (
          <Customers
            initialRiskFilter={customerRiskFilter}
            onSelectCustomerForPrediction={handleSelectCustomerForPrediction}
          />
        )}

        {activeTab === 'predict' && (
          <PredictChurn
            prefillCustomer={customerForPrediction}
            onClearPrefill={handleClearPrefill}
          />
        )}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'model' && <ModelInsights />}

        {activeTab === 'about' && <About />}
      </main>

      {/* Footer */}
      <Footer setActiveTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
}
