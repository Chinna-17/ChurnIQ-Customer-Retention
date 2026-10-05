import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Sparkles, 
  LineChart, 
  Cpu, 
  Info, 
  Menu, 
  X, 
  Activity,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelHealthy?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, modelHealthy = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'predict', label: 'Predict Churn', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'model', label: 'Model Insights', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleNavClick('overview')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  ChurnIQ
                </span>
                <span className="hidden sm:block text-[11px] text-slate-600 font-medium leading-none">
                  Customer Retention Intelligence
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Top Right Controls & Model Status */}
          <div className="flex items-center gap-3">
            {/* Live Model Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md text-xs text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${modelHealthy ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${modelHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="font-medium text-slate-700">Live Model</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-600">Logistic Reg + RF</span>
            </div>

            {/* Portfolio Environment Notice */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Portfolio Project</span>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Model Service Active
            </span>
            <span>Telco Churn Dataset</span>
          </div>
        </div>
      )}
    </header>
  );
};
