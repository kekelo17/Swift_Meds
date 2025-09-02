import React from 'react';
import * as icons from 'lucide-react';

const ProfileDropdown = ({ show, onClose, user, profile, onQuickStats, signOut, admin }) => {
  if (!show) return null;

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      <div className="profile-dropdown absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
        <div className="profile-header px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <icons.User className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.fullName || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {admin && <p className="text-xs text-red-500 mt-1">Administrator</p>}
            </div>
          </div>
        </div>
        
        <div className="py-1">
          <button 
            onClick={onQuickStats} 
            className="profile-item w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <icons.BarChart3 className="h-4 w-4 mr-3 text-green-600" />
            Quick Stats
          </button>
          
          <button className="profile-item w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <icons.Settings className="h-4 w-4 mr-3 text-gray-500" />
            Account Settings
          </button>
          
          <button className="profile-item w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <icons.User className="h-4 w-4 mr-3 text-gray-500" />
            Profile
          </button>
          
          <button className="profile-item w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <icons.HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
            Help & Support
          </button>
        </div>
        
        <div className="profile-separator border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className="profile-item logout w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <icons.LogOut className="h-4 w-4 mr-3 text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;