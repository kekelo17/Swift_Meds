import React from 'react';
import * as icons from 'lucide-react';

const StatsCard = ({ iconName, value, label, color = 'green' }) => {
  const IconComponent = icons[iconName];
  const bgColor = `bg-${color}-100`;
  const textColor = `text-${color}-600`;
  
  return (
    <div className="stats-card">
      <div className={`stats-icon ${bgColor}`}>
        <IconComponent className={`h-6 w-6 ${textColor}`} />
      </div>
      <div className="stats-text">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard;