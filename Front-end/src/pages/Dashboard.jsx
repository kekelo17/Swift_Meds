import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { usePharmacyAuth } from '../../../Back-end/services/pharmacy_auth_service.js';
import AdminDashboard from './dashboards/AdminDashboard';
import ClientDashboard from './dashboards/ClientDashboard';
import PharmacyDashboard from './dashboards/PharmacyDashboard';
import AuthScreen from './AuthScreen';

const DashboardRouter = () => {
  const { user, loading, userType } = usePharmacyAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/client/*" element={<ClientDashboard />} />
      <Route path="/pharmacy/*" element={<PharmacyDashboard />} />
      <Route path="*" element={
        navigate(userType === 'admin' ? '/admin' : 
               userType === 'client' ? '/client' : '/pharmacy')
      } />
    </Routes>
  );
};

export default DashboardRouter;