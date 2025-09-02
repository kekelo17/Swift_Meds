import React from 'react';
import * as icons from 'lucide-react';

const QuickStatsModal = ({ show, onClose, stats }) => {
  if (!show) return null;

  const getStatsForUser = (userType) => {
    switch (userType) {
      case 'admin':
        return [
          { icon: icons.Users, label: "Total Users:", value: stats.totalUsers || 0, color: "blue" },
          { icon: icons.Building2, label: "Pharmacies:", value: stats.totalPharmacies || 0, color: "green" },
          { icon: icons.Clock, label: "Pending Approvals:", value: stats.pendingApprovals || 0, color: "yellow" },
          { icon: icons.Calendar, label: "Total Reservations:", value: stats.totalReservations || 0, color: "purple" }
        ];
      case 'pharmacy':
        return [
          { icon: icons.Calendar, label: "Total Reservations:", value: stats.total || 0, color: "blue" },
          { icon: icons.CheckCircle, label: "Confirmed Today:", value: stats.confirmed || 0, color: "green" },
          { icon: icons.Clock, label: "Pending:", value: stats.pending || 0, color: "yellow" },
          { icon: icons.Package, label: "Inventory Items:", value: stats.inventory || 0, color: "teal" }
        ];
      default: // client
        return [
          { icon: icons.Calendar, label: "My Reservations:", value: stats.total || 0, color: "blue" },
          { icon: icons.CheckCircle, label: "Confirmed:", value: stats.confirmed || 0, color: "green" },
          { icon: icons.Clock, label: "Pending:", value: stats.pending || 0, color: "yellow" },
          { icon: icons.Building2, label: "Favorite Pharmacies:", value: stats.favorites || 0, color: "teal" }
        ];
    }
  };

  // Determine user type from stats or context
  const userType = stats.totalUsers !== undefined ? 'admin' : 
                   stats.inventory !== undefined ? 'pharmacy' : 'client';
  
  const statsToShow = getStatsForUser(userType);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50" 
        onClick={onClose}
      />
      
      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          <div className="modal-header px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="modal-title flex items-center">
              <icons.BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
            </div>
            <button 
              onClick={onClose} 
              className="modal-close text-gray-400 hover:text-gray-600 transition-colors"
            >
              <icons.X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="modal-body px-6 py-4">
            <div className="space-y-4">
              {statsToShow.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <StatItem 
                    key={index}
                    icon={<IconComponent className={`h-4 w-4 mr-2 text-${stat.color}-500`} />}
                    label={stat.label}
                    value={stat.value}
                    highlight={stat.color}
                  />
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex items-center">
                <icons.Clock className="h-3 w-3 mr-1" />
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatItem = ({ icon, label, value, highlight = '' }) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="flex items-center text-sm text-gray-600">
        {icon}
        {label}
      </span>
      <span className={`font-semibold text-lg text-${highlight}-600`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
};

export default QuickStatsModal;