import React, { useState, useEffect } from 'react';
import { ClientDatabaseService } from '../../../Back-end/services/client_database_service.js';
import { usePharmacyAuth } from '../../../Back-end/services/pharmacy_auth_service.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import ReservationForm from './Shared/ReservationForm';

const ClientDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Search');
  const [reservations, setReservations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ClientDatabaseService.getClientReservations(user?.id);
        setReservations(data);
      } catch (error) {
        console.error('Error loading client data:', error);
      }
    };
    loadData();
  }, [activeSection, user?.id]);

  return (
    <div className="client-dashboard">
      <Navbar user={user} profile={profile} signOut={signOut} />
      <div className="container">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
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
          <div className="col-span-9">
            {/* Client-specific content */}
            {renderClientContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;