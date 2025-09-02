import React from 'react';
import * as icons from 'lucide-react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle', label: 'Confirmed' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'Clock', label: 'Pending' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle', label: 'Cancelled' },
    open: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle', label: 'Open' },
    closed: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle', label: 'Closed' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle', label: 'Rejected' },
    active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'Circle', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'Circle', label: 'Inactive' },
    available: { bg: 'bg-green-100', text: 'text-green-800', icon: 'CheckCircle', label: 'Available' },
    low: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'AlertTriangle', label: 'Low Stock' },
    out: { bg: 'bg-red-100', text: 'text-red-800', icon: 'XCircle', label: 'Out of Stock' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = icons[config.icon];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      <IconComponent className={`${iconSizes[size]} mr-1`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;