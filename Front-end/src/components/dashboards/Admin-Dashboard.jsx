import React, { useState, useEffect } from 'react';
import { AdminDatabaseService } from '../../../Back-end/services/admin_database_service.js';
import { usePharmacyAuth } from '../../../Back-end/services/pharmacy_auth_service.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';

const AdminDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AdminDatabaseService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };
    loadData();
  }, [activeSection]);

  return (
    <div className="admin-dashboard">
      <Navbar user={user} profile={profile} signOut={signOut} admin={true} />
      <div className="container">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
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
          <div className="col-span-9">
            {/* Admin-specific content */}
            {renderAdminContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;