// Dashboard-Route.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Protected-Route';
import AdminDashboard from './dashboards/Admin-Dashboard';
import ClientDashboard from './dashboards/Client-Dashboard';
import PharmacyDashboard from './dashboards/Pharmacy-Dashboard';

const DashboardRouter = ({ userRole }) => {
  // Helper function to get the default route based on user role
  const getDefaultRoute = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return '/dashboards/Admin-Dashboard';
      case 'pharmacist':
        return '/dashboards/Pharmacy-Dashboard  ';
      case 'client':
      default:
        return '/dashboards/Client-Dashboard';
    }
  };

  return (
    <Routes>
      {/* Admin Dashboard */}
      <Route path="admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Pharmacist Dashboard */}
      <Route path="pharmacist" element={
        <ProtectedRoute requiredRole="pharmacist">
          <PharmacyDashboard />
        </ProtectedRoute>
      } />
      
      {/* Client Dashboard */}
      <Route path="client" element={
        <ProtectedRoute requiredRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      } />
      
      {/* Default route - redirect to user's appropriate dashboard */}
      <Route path="" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}; 

export default DashboardRouter;