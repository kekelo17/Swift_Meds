import React from 'react';
import * as icons from 'lucide-react';

const QuickStatsModal = ({ show, onClose, stats }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <icons.BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Quick Stats
          </div>
          <button onClick={onClose} className="modal-close">
            <icons.XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="space-y-4 text-sm text-gray-600">
            <StatItem 
              icon={<icons.Calendar className="h-4 w-4 mr-2 text-blue-500" />}
              label="Total Reservations:"
              value={stats.total}
            />
            <StatItem 
              icon={<icons.CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              label="Confirmed Today:"
              value={stats.confirmed}
              highlight="green"
            />
            <StatItem 
              icon={<icons.Clock className="h-4 w-4 mr-2 text-yellow-500" />}
              label="Pending:"
              value={stats.pending}
              highlight="yellow"
            />
            <StatItem 
              icon={<icons.Building2 className="h-4 w-4 mr-2 text-teal-500" />}
              label="Partner Pharmacies:"
              value={stats.pharmacies}
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, highlight = '' }) => {
  const colorClass = highlight ? `text-${highlight}-600` : 'text-gray-900';
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="flex items-center">
        {icon}
        {label}
      </span>
      <span className={`font-semibold ${colorClass}`}>
        {value}
      </span>
    </div>
  );
};

export default QuickStatsModal;