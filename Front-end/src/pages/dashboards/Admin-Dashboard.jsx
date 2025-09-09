import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import StatsCard from './Shared/StatsCard';
import StatusBadge from './Shared/StatusBadge';
import * as icons from 'lucide-react';

const AdminDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    pendingApprovals: 0,
    totalReservations: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminStats, usersData, pharmaciesData, reservationsData] = await Promise.all([
        PharmacyDatabaseService.getAdminStats(),
        PharmacyDatabaseService.getAllUsers(),
        PharmacyDatabaseService.getAllPharmacies(),
        PharmacyDatabaseService.getAllReservations()
      ]);
      
      setStats(adminStats || {});
      setUsers(usersData || []);
      setPharmacies(pharmaciesData || []);
      setReservations(reservationsData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprovePharmacy = async (pharmacyId) => {
    try {
      await PharmacyDatabaseService.approvePharmacy(pharmacyId);
      loadData();
    } catch (error) {
      console.error('Error approving pharmacy:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <button
          onClick={loadData}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <icons.RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard iconName="Users" value={stats.totalUsers} label="Total Users" color="blue" />
        <StatsCard iconName="Building2" value={stats.totalPharmacies} label="Pharmacies" color="green" />
        <StatsCard iconName="Clock" value={stats.pendingApprovals} label="Pending Approvals" color="yellow" />
        <StatsCard iconName="Calendar" value={stats.totalReservations} label="Total Reservations" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Pharmacies</h3>
          <div className="space-y-3">
            {pharmacies.filter(p => p.status === 'pending').slice(0, 5).map((pharmacy) => (
              <div key={pharmacy.pharmacy_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{pharmacy.name}</p>
                  <p className="text-xs text-gray-500">{pharmacy.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={pharmacy.status} size="sm" />
                  <button
                    onClick={() => handleApprovePharmacy(pharmacy.pharmacy_id)}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{userItem.full_name}</p>
                  <p className="text-xs text-gray-500">{userItem.email}</p>
                </div>
                <StatusBadge status={userItem.role || 'client'} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
            />
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((userItem) => (
              <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{userItem.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={userItem.role || 'client'} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={userItem.status || 'active'} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <icons.Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );

  const renderPharmacies = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pharmacies Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pharmacies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
            />
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Add Pharmacy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPharmacies.map((pharmacy) => (
          <div key={pharmacy.pharmacy_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{pharmacy.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pharmacy.address}</p>
                <p className="text-sm text-gray-500">{pharmacy.phone}</p>
              </div>
              <StatusBadge status={pharmacy.status} size="md" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>License: {pharmacy.license_number}</p>
              <p>Hours: {pharmacy.operating_hours}</p>
            </div>

            {pharmacy.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprovePharmacy(pharmacy.pharmacy_id)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredPharmacies.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <icons.Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pharmacies found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">User Growth</h3>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - User growth over time</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Reservation Trends</h3>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Reservation analytics</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">98.5%</div>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-sm text-gray-600">Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">SSL</div>
            <p className="text-sm text-gray-600">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Auto-approve pharmacies</label>
                <p className="text-sm text-gray-500">Automatically approve new pharmacy registrations</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email notifications</label>
                <p className="text-sm text-gray-500">Send email notifications for new registrations</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Require 2FA</label>
                <p className="text-sm text-gray-500">Enable two-factor authentication for all users</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Session timeout</label>
                <p className="text-sm text-gray-500">Automatic logout after inactivity</p>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <icons.Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      );
    }

    switch (activeSection) {
      case 'Overview': return renderOverview();
      case 'Users': return renderUsers();
      case 'Pharmacies': return renderPharmacies();
      case 'Analytics': return renderAnalytics();
      case 'Settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar user={user} profile={profile} signOut={signOut} admin={true} />
      <div className="flex">
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            items={[
              { name: 'Overview', icon: 'Home' },
              { name: 'Users', icon: 'Users' },
              { name: 'Pharmacies', icon: 'Building2' },
              { name: 'Analytics', icon: 'BarChart3' },
              { name: 'Settings', icon: 'Settings' }
            ]}
          />
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;