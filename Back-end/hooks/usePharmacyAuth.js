import React from 'react';
import { PharmacyAuthService } from '../services/pharmacy_auth_service.js';

export const usePharmacyAuth = () => {
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await PharmacyAuthService.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          const userProfile = await PharmacyAuthService.getCurrentUserProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = PharmacyAuthService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          try {
            const userProfile = await PharmacyAuthService.getCurrentUserProfile();
            setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    signIn: PharmacyAuthService.signIn,
    signUp: PharmacyAuthService.signUp,
    signOut: PharmacyAuthService.signOut,
    hasRole: PharmacyAuthService.hasRole,
    isAdmin: PharmacyAuthService.isAdmin,
    isPharmacyStaff: PharmacyAuthService.isPharmacyStaff
  };
};