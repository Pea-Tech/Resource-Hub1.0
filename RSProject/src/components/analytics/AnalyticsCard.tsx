import React from 'react';
import { TrendingUp } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
}

export function AnalyticsCard({ title, value, icon, trend }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          <TrendingUp className={`h-4 w-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`ml-2 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend}% from last month
          </span>
        </div>
      )}
    </div>
  );
}