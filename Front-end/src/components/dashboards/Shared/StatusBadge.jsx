import React from 'react';
import * as icons from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'Clock' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle' },
    open: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle' },
    closed: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = icons[config.icon];
  
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {status}
    </span>
  );
};

export default StatusBadge;