import React, { useState } from 'react';
import * as icons from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import QuickStatsModal from './QuickStatsModal';

const Navbar = ({ user, profile, signOut, admin = false }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="text-xl font-bold text-green-600">
            {admin ? 'SwiftMeds Admin' : 'SwiftMeds'}
          </div>
        </div>
        
        {user ? (
          <div className="navbar-profile">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <span>{profile?.full_name || user.email}</span>
              <icons.ChevronDown className="h-4 w-4" />
            </button>
            
            <ProfileDropdown 
              show={showProfileDropdown}
              onClose={() => setShowProfileDropdown(false)}
              user={user}
              profile={profile}
              onQuickStats={() => {
                setShowQuickStats(true);
                setShowProfileDropdown(false);
              }}
              signOut={signOut}
              admin={admin}
            />
          </div>
        ) : null}
      </div>

      <QuickStatsModal 
        show={showQuickStats}
        onClose={() => setShowQuickStats(false)}
        stats={admin ? adminStats : userStats}
      />
    </header>
  );
};

export default Navbar;