import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePharmacyAuth } from '../../../Back-end/hooks/usePharmacyAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = usePharmacyAuth();
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

      // Get user role from multiple possible sources
      const userRole = user?.user_metadata?.role || 
                      user?.role || 
                      user?.app_metadata?.role ||
                      profile?.role ||
                      'client'; // Default role

      // Check if user has required role
      if (requiredRole) {
        const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRequiredRole = rolesArray.some(role => 
          userRole.toLowerCase() === role.toLowerCase()
        );
        
        setIsAuthorized(hasRequiredRole);
      } else {
        // No specific role required, just need to be authenticated
        setIsAuthorized(true);
      }
      
      setAuthLoading(false);
    };

    checkAuthorization();
  }, [user, profile, loading, requiredRole]);

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
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Redirect to appropriate dashboard if user doesn't have required role
  if (!isAuthorized) {
    const userRole = user?.user_metadata?.role || 
                    user?.role || 
                    user?.app_metadata?.role ||
                    'client';
    
    let redirectPath = '/dashboards/Client-dashboard'; // Default
    
    switch (userRole.toLowerCase()) {
      case 'admin':
        redirectPath = '/dashboards/Admin-dashboard';
        break;
      case 'pharmacy':
        redirectPath = '/dashboards/Pharmacy-dashboard';
        break;
      case 'client':
      case 'customer':
        redirectPath = '/dashboards/Client-dashboard';
        break;
    }
    
    return (
      <Navigate 
        to={redirectPath} 
        replace 
      />
    );
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;