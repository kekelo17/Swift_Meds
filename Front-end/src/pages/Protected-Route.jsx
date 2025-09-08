// Protected-Route.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePharmacyAuth } from '../../../Back-end/hooks/usePharmacyAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = usePharmacyAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      if (loading) {
        return; // Still loading auth state
      }

      if (!user) {
        setIsAuthorized(false);
        setAuthLoading(false);
        return;
      }

      // Get user role from the user object
      const userRole = user?.role ; // Default role

      console.log('ProtectedRoute - User role:', userRole, 'Required role:', requiredRole);

      // Check if user has required role
      if (requiredRole) {
        const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRequiredRole = rolesArray.some(role => 
          userRole.toLowerCase() === role.toLowerCase()
        );
        
        setIsAuthorized(hasRequiredRole);
        console.log('ProtectedRoute - Has required role:', hasRequiredRole);
      } else {
        // No specific role required, just need to be authenticated
        setIsAuthorized(true);
      }
      
      setAuthLoading(false);
    };

    checkAuthorization();
  }, [user, loading, requiredRole]);

  // Show loading spinner while checking auth
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/auth/signin" 
        state={{ 
          from: location,
          message: 'Please sign in to access this page',
          type: 'info'
        }} 
        replace 
      />
    );
  }

  // Redirect to appropriate dashboard if user doesn't have required role
  if (!isAuthorized) {
    const userRole = user?.role || 'client';
    
    let redirectPath = '/dashboards/client'; // Default
    
    switch (userRole.toLowerCase()) {
      case 'admin':
        redirectPath = '/dashboards/Admin-Dashboard';
        break;
      case 'pharmacist':
        redirectPath = '/dashboards/Pharmacy-Dashboard';
        break;
      case 'client':
      default:
        redirectPath = '/dashboards/Client-Dashboard';
        break;
    }
    
    return (
      <Navigate 
        to={redirectPath}
        state={{
          message: `Access denied. You don't have permission to access this page.`,
          type: 'error'
        }}
        replace 
      />
    );
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;