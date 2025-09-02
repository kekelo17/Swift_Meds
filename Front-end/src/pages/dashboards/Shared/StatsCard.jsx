import React from 'react';
import * as icons from 'lucide-react';

const StatsCard = ({ iconName, value, label, color = 'green', trend = null }) => {
  const IconComponent = icons[iconName];
  
  return (
    <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`stats-icon p-3 rounded-lg bg-${color}-100 mr-4`}>
          <IconComponent className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="stats-text flex-1">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
          {trend && (
            <div className={`text-xs mt-1 flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <icons.TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <icons.TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trend.value}% from last month
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;