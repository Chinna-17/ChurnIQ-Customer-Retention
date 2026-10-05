import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50',
  loading = false,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded my-1" />
          ) : (
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          )}
        </div>
        <div className={`p-2.5 rounded-md ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        {trend && (
          <span
            className={`font-medium ${
              trendPositive ? 'text-emerald-600' : 'text-slate-600'
            }`}
          >
            {trend}
          </span>
        )}
        {trend && subtitle && <span aria-hidden="true">·</span>}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};
