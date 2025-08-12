import React from 'react';
import * as icons from 'lucide-react';

const ProfileDropdown = ({ show, onClose, user, profile, onQuickStats, signOut, admin }) => {
  if (!show) return null;

  return (
    <div className="profile-dropdown">
      <div className="profile-header">
        <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
        {admin && <p className="text-xs text-blue-500 mt-1">Administrator</p>}
      </div>
      
      <button onClick={onQuickStats} className="profile-item">
        <icons.BarChart3 className="h-4 w-4 mr-3 text-green-600" />
        Quick Stats
      </button>
      
      <button className="profile-item">
        <icons.Settings className="h-4 w-4 mr-3 text-gray-500" />
        Account Settings
      </button>
      
      <button className="profile-item">
        <icons.User className="h-4 w-4 mr-3 text-gray-500" />
        Profile
      </button>
      
      <div className="profile-separator">
        <button onClick={signOut} className="profile-item logout">
          <icons.LogOut className="h-4 w-4 mr-3 text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;