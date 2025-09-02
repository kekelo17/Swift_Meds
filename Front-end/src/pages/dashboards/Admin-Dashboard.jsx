import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import StatsCard from './Shared/StatsCard';
import StatusBadge from './Shared/StatusBadge';
import ReservationForm from './Shared/ReservationForm';
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

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
      
      setStats(adminStats);
      setUsers(usersData || []);
      setPharmacies(pharmaciesData || []);
      setReservations(reservationsData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePharmacy = async (pharmacyId) => {
    try {
      await PharmacyDatabaseService.approvePharmacy(pharmacyId);
      loadData(); // Reload data after approval
    } catch (error) {
      console.error('Error approving pharmacy:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await PharmacyDatabaseService.deleteUser(userId);
        loadData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <button
          onClick={loadData}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <icons.RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          iconName="Users"
          value={stats.totalUsers}
          label="Total Users"
          color="blue"
        />
        <StatsCard
          iconName="Building2"
          value={stats.totalPharmacies}
          label="Pharmacies"
          color="green"
        />
        <StatsCard
          iconName="Clock"
          value={stats.pendingApprovals}
          label="Pending Approvals"
          color="yellow"
        />
        <StatsCard
          iconName="Calendar"
          value={stats.totalReservations}
          label="Total Reservations"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Pharmacy Applications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pharmacies.filter(p => p.status === 'pending').slice(0, 5).map((pharmacy) => (
            <div key={pharmacy.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{pharmacy.name}</p>
                <p className="text-sm text-gray-500">{pharmacy.address}</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={pharmacy.status} />
                <button
                  onClick={() => handleApprovePharmacy(pharmacy.id)}
                  className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            Export Users
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="relative px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <icons.User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user.status || 'active'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPharmacies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <div key={pharmacy.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{pharmacy.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pharmacy.address}</p>
                <p className="text-sm text-gray-500">{pharmacy.phone}</p>
              </div>
              <StatusBadge status={pharmacy.status} />
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">License: {pharmacy.licenseNumber}</p>
              <p className="text-sm text-gray-600">Hours: {pharmacy.operatingHours}</p>
            </div>

            {pharmacy.status === 'pending' && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleApprovePharmacy(pharmacy.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                >
                  Approve
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Implement with recharts
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Implement with recharts
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Application Settings</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Auto-approve pharmacies</label>
              <p className="text-sm text-gray-500">Automatically approve new pharmacy registrations</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email notifications</label>
              <p className="text-sm text-gray-500">Send email notifications for new registrations</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <icons.Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    switch (activeSection) {
      case 'Overview':
        return renderOverview();
      case 'Users':
        return renderUsers();
      case 'Pharmacies':
        return renderPharmacies();
      case 'Analytics':
        return renderAnalytics();
      case 'Settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50">
      <Navbar user={user} profile={profile} signOut={signOut} admin={true} />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm">
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