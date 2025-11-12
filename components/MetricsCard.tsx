import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subValue, trend, icon: Icon }) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {subValue && (
            <p className={`flex items-center mt-1 text-sm font-medium ${trendColor}`}>
              {trend && <TrendIcon size={14} className="mr-1" />}
              {subValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-gray-700/50 rounded-lg text-gray-300">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};