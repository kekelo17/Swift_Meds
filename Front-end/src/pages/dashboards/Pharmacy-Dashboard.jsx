import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar.jsx';
import Navbar from './Shared/Navbar.jsx';
import StatsCard from './Shared/StatsCard.jsx';
import StatusBadge from './Shared/StatusBadge.jsx';
import AddMedicationForm from './Shared/AddMedicationForm.jsx';
import ReservationForm from './Shared/ReservationForm.jsx';
import * as icons from 'lucide-react';

const PharmacyDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [reservations, setReservations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);

  useEffect(() => {
    if (profile?.pharmacy_id) {
      loadData();
    }
  }, [activeSection, profile?.pharmacy_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, statsData, inventoryData] = await Promise.all([
        PharmacyDatabaseService.getPharmacyReservations(profile.pharmacy_id),
        PharmacyDatabaseService.getPharmacyStats(profile.pharmacy_id),
        PharmacyDatabaseService.getInventory(profile.pharmacy_id)
      ]);
      
      setReservations(reservationsData || []);
      setStats(statsData || { total: 0, confirmed: 0, pending: 0 });
      setInventory(inventoryData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        stock: item.stock,
        price: item.price
      })) || []);
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (data) => {
    try {
      await PharmacyDatabaseService.createMedication(profile.pharmacy_id, data);
      loadData();
      setShowAddMedicationModal(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          iconName="Calendar"
          value={stats.total}
          label="Total Reservations"
          color="green"
        />
        <StatsCard
          iconName="CheckCircle"
          value={stats.confirmed}
          label="Confirmed Today"
          color="green"
        />
        <StatsCard
          iconName="Clock"
          value={stats.pending}
          label="Pending"
          color="yellow"
        />
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {/* Recent reservations or activity list */}
          {reservations.slice(0, 5).map((reservation) => (
            <div key={reservation.id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span>{reservation.patientName} - {reservation.medication}</span>
              <StatusBadge status={reservation.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setShowAddMedicationModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Medication
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.stock > 10 ? 'available' : 'low'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{reservation.patientName}</p>
                <p className="text-sm text-gray-500">{reservation.medication} - {reservation.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={reservation.status} />
              </div>
            </div>
          ))}
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
      case 'Dashboard':
        return renderDashboard();
      case 'Inventory':
        return renderInventory();
      case 'Reservations':
        return renderReservations();
      case 'Analytics':
        return <div>Analytics section coming soon...</div>;
      default:
        return renderDashboard();
    }
  };

  // Add Medication Modal
  const renderAddMedicationModal = () => (
    showAddMedicationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <AddMedicationForm
            onSubmit={handleAddMedication}
            onCancel={() => setShowAddMedicationModal(false)}
            selectedItem={null}
          />
        </div>
      </div>
    )
  );

  return (
    <div className="pharmacy-dashboard min-h-screen bg-gray-50">
      <Navbar user={user} profile={profile} signOut={signOut} />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            items={[
              { name: 'Dashboard', icon: 'Home' },
              { name: 'Reservations', icon: 'Calendar' },
              { name: 'Inventory', icon: 'Package' },
              { name: 'Analytics', icon: 'BarChart3' }
            ]}
          />
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
      {renderAddMedicationModal()}
    </div>
  );
};

export default PharmacyDashboard;