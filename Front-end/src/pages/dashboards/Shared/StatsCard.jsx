import React from 'react';
import * as icons from 'lucide-react';

const StatsCard = ({ iconName, value, label, color = 'green', trend = null }) => {
  const IconComponent = icons[iconName];
  
  return (
    <div className="stats-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 mr-4`}>
          <IconComponent className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
          {trend && (
            <div className={`text-xs mt-2 flex items-center ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
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