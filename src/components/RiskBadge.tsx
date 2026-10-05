import React from 'react';

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High' | string;
  probability?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, probability, size = 'sm' }) => {
  const normLevel = (level || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = level || 'Unknown';

  if (normLevel === 'high') {
    styles = 'bg-red-50 text-red-700 border-red-200/80';
    dotColor = 'bg-red-500';
    label = 'High Risk';
  } else if (normLevel === 'medium') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
    label = 'Medium Risk';
  } else if (normLevel === 'low') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
    label = 'Low Risk';
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm font-semibold' 
    : size === 'md' 
    ? 'px-2.5 py-1 text-xs font-medium' 
    : 'px-2 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded ${sizeClasses} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
      {probability !== undefined && (
        <span className="text-slate-500 font-normal">
          · {(probability * 100).toFixed(1)}%
        </span>
      )}
    </span>
  );
};
