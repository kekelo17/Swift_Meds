// Auth-Route.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RoleSelection, ClientSignUp, PharmacySignUp } from './auth/signup';
import SignIn from './auth/signin';
import OtpVerification from './auth/otp-verification';
import ForgotPassword from './auth/forgot-password';
import { usePharmacyAuth } from '../../../Back-end/hooks/usePharmacyAuth.js';

const AuthRouter = () => {
  const { user, signOut } = usePharmacyAuth();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated but accessing auth routes, they might want to logout
    // Only auto-redirect if they're trying to access root auth route
    if (user && location.pathname === '/auth' || location.pathname === '/auth/') {
      // Redirect authenticated users away from auth root
      window.location.href = `/dashboards/${user.role?.toLowerCase()}`;
    }
  }, [user, location]);

  // If user is authenticated and trying to access signin, ask if they want to logout
  if (user && location.pathname === '/auth/signin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-center mb-4">Already Signed In</h2>
          <p className="text-gray-600 text-center mb-6">
            You're already signed in as <strong>{user.full_name}</strong> ({user.role}).
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = `/dashboards/${user.role?.toLowerCase()}`}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                signOut().then(() => {
                  window.location.reload(); // Force reload to clear state
                });
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out & Login as Different User
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="signup" element={<RoleSelection />} />
      <Route path="signup/client" element={<ClientSignUp />} />
      <Route path="signup/pharmacist" element={<PharmacySignUp />} />
      <Route path="signin" element={<SignIn />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="otp-verification" element={<OtpVerification />} />
      
      {/* Default auth route */}
      <Route path="*" element={<Navigate to="/auth/signin" replace />} />
    </Routes>
  );
}; 

export default AuthRouter;