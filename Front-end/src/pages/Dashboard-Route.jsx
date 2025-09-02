import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelection, ClientSignUp, PharmacySignUp } from './auth/signup';
import SignIn from './auth/signin';
import OtpVerification from './auth/otp-verification';
import ProtectedRoute from './Protected-Route';
import AdminDashboard from './dashboards/Admin-Dashboard';
import ClientDashboard from './dashboards/Client-Dashboard';
import PharmacyDashboard from './dashboards/Pharmacy-Dashboard';


const DashboardRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/auth/signup" element={<RoleSelection />} />
        <Route path="/auth/signup/client" element={<ClientSignUp />} />
        <Route path="/auth/signup/pharmacy" element={<PharmacySignUp />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/otp-verification" element={<OtpVerification />} />
        
        {/* Dashboard Routes - Protected */}
        <Route 
          path="/dashboards/Admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboards/Pharmacy-dashboard" 
          element={
            <ProtectedRoute requiredRole="pharmacy">
              <PharmacyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboards/Client-dashboard" 
          element={
            <ProtectedRoute requiredRole={["client", "customer"]}>
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </Router>
  );
}
;

export default DashboardRouter;