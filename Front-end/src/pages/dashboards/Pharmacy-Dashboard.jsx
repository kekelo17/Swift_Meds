import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import StatsCard from './Shared/StatsCard';
import StatusBadge from './Shared/StatusBadge';
import ReservationForm from './Shared/ReservationForm';
import * as icons from 'lucide-react';

const PharmacyDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [reservations, setReservations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSection, user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, statsData, inventoryData] = await Promise.all([
        PharmacyDatabaseService.getPharmacyReservations(user?.id),
        PharmacyDatabaseService.getPharmacyStats(user?.id),
        PharmacyDatabaseService.getPharmacyInventory(user?.id)
      ]);
      
      setReservations(reservationsData || []);
      setStats(statsData || { total: 0, confirmed: 0, pending: 0 });
      setInventory(inventoryData || []);
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservationUpdate = async (reservationData) => {
    try {
      if (selectedReservation) {
        await PharmacyDatabaseService.updateReservation(selectedReservation.id, reservationData);
      } else {
        await PharmacyDatabaseService.createReservation(reservationData);
      }
      setShowForm(false);
      setSelectedReservation(null);
      loadData();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          New Reservation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          iconName="Calendar"
          value={stats.total}
          label="Total Reservations"
          color="blue"
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
          <h3 className="text-lg font-medium text-gray-900">Recent Reservations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reservations.slice(0, 5).map((reservation) => (
            <div key={reservation.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{reservation.patientName}</p>
                <p className="text-sm text-gray-500">{reservation.medication} - {reservation.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={reservation.status} />
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
          Add Medication
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medication
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.stock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${item.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.stock > 10 ? 'available' : 'low'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      default:
        return renderDashboard();
    }
  };

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
          
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <ReservationForm
                  selectedItem={selectedReservation}
                  onSubmit={handleReservationUpdate}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedReservation(null);
                  }}
                  pharmacies={[]}
                  isAdmin={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;