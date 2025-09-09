import React from 'react';
import * as icons from 'lucide-react';
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ show, onClose, user, profile, onQuickStats, signOut, admin }) => {
  const navigate = useNavigate();
  if (!show) return null;

  const handleSignOut = () => {
    onClose();
    signOut();
    navigate('/auth/signin');
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div className="profile-dropdown absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 dark:border-gray-700">
        <div className="profile-header px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <icons.User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {admin && <p className="text-xs text-red-500 dark:text-red-400 mt-1">Administrator</p>}
            </div>
          </div>
        </div>
        
        <div className="py-1">
          <button 
            onClick={onQuickStats} 
            className="profile-item w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
          >
            <icons.BarChart3 className="h-4 w-4 mr-3 text-green-600" />
            Quick Stats
          </button>
          
          <button className="profile-item w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors">
            <icons.Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
            Account Settings
          </button>
          
          <button className="profile-item w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors">
            <icons.User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
            Profile
          </button>
          
          <button className="profile-item w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors">
            <icons.HelpCircle className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
            Help & Support
          </button>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleSignOut}
            className="profile-item logout w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
          >
            <icons.LogOut className="h-4 w-4 mr-3 text-red-500 dark:text-red-400" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;