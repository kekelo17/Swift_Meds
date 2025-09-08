import React, { useState } from 'react';
import * as icons from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import QuickStatsModal from './QuickStatsModal';


const Navbar = ({ user, profile, signOut, admin = false }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [statsData, setStatsData] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    pharmacies: 0
  });

  // Load stats when quick stats is opened
  const handleShowQuickStats = async () => {
    try {
      // This would be different for each user type
      let stats;
      if (admin) {
        stats = await PharmacyDatabaseService.getAdminStats();
      } else if (user?.role === 'pharmacist') {
        stats = await PharmacyDatabaseService.getPharmacyStats(profile?.pharmacy_id);
      } else {
        stats = await PharmacyDatabaseService.getReservationStats(user.id);
      }
      setStatsData(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setShowQuickStats(true);
    setShowProfileDropdown(false);
  };

  return (
    <>
      <header className="navbar bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="navbar-content max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="navbar-brand flex items-center">
              <icons.Pill className="h-8 w-8 text-green-600 mr-2" />
              <div className="text-xl font-bold text-green-600">
                {admin ? 'SwiftMeds Admin' : 'SwiftMeds'}
              </div>
              {admin && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                  ADMIN
                </span>
              )}
            </div>
            
            {user ? (
              <div className="navbar-profile relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md px-3 py-2"
                >
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <icons.User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.full_name || user.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</div>
                  </div>
                  <icons.ChevronDown className="h-4 w-4" />
                </button>
                
                {showProfileDropdown && (
                  <ProfileDropdown 
                    show={showProfileDropdown}
                    onClose={() => setShowProfileDropdown(false)}
                    user={user}
                    profile={profile}
                    onQuickStats={handleShowQuickStats}
                    signOut={signOut}
                    admin={admin}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <QuickStatsModal 
        show={showQuickStats}
        onClose={() => setShowQuickStats(false)}
        stats={statsData}
      />
    </>
  );
};


export default Navbar;