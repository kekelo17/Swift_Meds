import React from 'react';
import * as icons from 'lucide-react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    confirmed: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', icon: 'CheckCircle', label: 'Confirmed' },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300', icon: 'Clock', label: 'Pending' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', icon: 'XCircle', label: 'Cancelled' },
    open: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', icon: 'CheckCircle', label: 'Open' },
    closed: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', icon: 'XCircle', label: 'Closed' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', icon: 'CheckCircle', label: 'Approved' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', icon: 'XCircle', label: 'Rejected' },
    active: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-300', icon: 'Circle', label: 'Active' },
    inactive: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-800 dark:text-gray-200', icon: 'Circle', label: 'Inactive' },
    available: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', icon: 'CheckCircle', label: 'Available' },
    low: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300', icon: 'AlertTriangle', label: 'Low Stock' },
    out: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', icon: 'XCircle', label: 'Out of Stock' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = icons[config.icon];
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses[size]} shadow-sm`}>
      <IconComponent className={`${iconSizes[size]} mr-1 flex-shrink-0`} />
      <span className="truncate">{config.label}</span>
    </span>
  );
};

export default StatusBadge;