import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import StatsCard from './Shared/StatsCard';
import StatusBadge from './Shared/StatusBadge';
import ReservationForm from './Shared/ReservationForm';
import * as icons from 'lucide-react';

const ClientDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Search');
  const [reservations, setReservations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state for reservation form
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeSection, user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, pharmaciesData] = await Promise.all([
        PharmacyDatabaseService.getClientReservations(user?.id),
        PharmacyDatabaseService.getAllPharmacies()
      ]);
      
      setReservations(reservationsData || []);
      setPharmacies(pharmaciesData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await PharmacyDatabaseService.searchMedications(term);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching medications:', error);
    }
  };

  // New handler for creating reservations
  const handleReservationSubmit = async (formData) => {
    try {
      if (editingReservation) {
        // Update existing reservation
        await PharmacyDatabaseService.updateReservation(editingReservation.id, formData);
      } else {
        // Create new reservation
        await PharmacyDatabaseService.createReservation({
          ...formData,
          clientId: user.id,
          patientName: formData.name
        });
      }
      
      setShowReservationForm(false);
      setSelectedMedication(null);
      setEditingReservation(null);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };

  // Handler for opening reservation form
  const handleReserveClick = (medication) => {
    setSelectedMedication({
      medication: medication.name,
      pharmacy: medication.pharmacy,
      patientName: profile?.fullName || '',
      quantity: 1,
      status: 'pending'
    });
    setEditingReservation(null);
    setShowReservationForm(true);
  };

  // Handler for editing existing reservation
  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setSelectedMedication(reservation);
    setShowReservationForm(true);
  };

  // Handler for canceling form
  const handleFormCancel = () => {
    setShowReservationForm(false);
    setSelectedMedication(null);
    setEditingReservation(null);
  };

  const renderSearch = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Search Medications</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search for medications..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((medication) => (
            <div key={medication.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">{medication.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{medication.description}</p>
              <p className="text-lg font-semibold text-green-600 mt-2">${medication.price}</p>
              <p className="text-sm text-gray-500">Available at: {medication.pharmacy}</p>
              
              <button 
                onClick={() => handleReserveClick(medication)}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Reserve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        <button
          onClick={() => {
            setSelectedMedication(null);
            setEditingReservation(null);
            setShowReservationForm(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          New Reservation
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
                Pharmacy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{reservation.medication}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reservation.pharmacy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reservation.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(reservation.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEditReservation(reservation)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPharmaciesList = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nearby Pharmacies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.filter(p => p.status === 'approved').map((pharmacy) => (
          <div key={pharmacy.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{pharmacy.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pharmacy.address}</p>
                <p className="text-sm text-gray-500">{pharmacy.phone}</p>
              </div>
              <StatusBadge status="open" />
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">Hours: {pharmacy.operatingHours}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                View Inventory
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={profile?.fullName || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={profile?.address || ''}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="pt-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
              Update Profile
            </button>
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
      case 'Search':
        return renderSearch();
      case 'My Reservations':
        return renderReservations();
      case 'Pharmacies':
        return renderPharmaciesList();
      case 'Profile':
        return renderProfile();
      default:
        return renderSearch();
    }
  };

  return (
    <div className="client-dashboard min-h-screen bg-gray-50">
      <Navbar user={user} profile={profile} signOut={signOut} />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            items={[
              { name: 'Search', icon: 'Search' },
              { name: 'My Reservations', icon: 'Calendar' },
              { name: 'Pharmacies', icon: 'Building2' },
              { name: 'Profile', icon: 'User' }
            ]}
          />
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <ReservationForm
              selectedItem={selectedMedication}
              onSubmit={handleReservationSubmit}
              onCancel={handleFormCancel}
              pharmacies={pharmacies}
              isAdmin={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;