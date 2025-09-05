/*import React from 'react';
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
};*/
// hooks/usePharmacyAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { authAPI } from '../../Front-end/src/api/apiClient.js';

export const usePharmacyAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user profile from your custom users table
  const getCustomUserProfile = async (userId) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'client': 1,
      'pharmacist': 2,
      'admin': 3
    };
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      // Get user from your custom users table
      const customUser = await getCustomUserProfile(authData.user.id);
      
      if (!customUser) {
        throw new Error('User not found in database');
      }
      
      setUser(customUser);
      localStorage.setItem('authToken', authData.session.access_token);
      localStorage.setItem('user', JSON.stringify(customUser));
      
      return customUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function - matches your users table schema
  const signUp = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.signup({
        full_name: userData.fullName,
        phone_number: userData.phoneNumber,
        date_of_birth: userData.dateOfBirth,
        address: userData.address,
        password: userData.password,
        role: userData.role || 'client',
        // Pharmacy-specific fields
        pharmacy_name: userData.pharmacyName,
        license_number: userData.licenseNumber,
        operating_hours: userData.operatingHours
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const customUser = await getCustomUserProfile(session.user.id);
          setUser(customUser);
          localStorage.setItem('user', JSON.stringify(customUser));
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const customUser = await getCustomUserProfile(session.user.id);
            setUser(customUser);
            localStorage.setItem('user', JSON.stringify(customUser));
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
            setError(error.message);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Role checking functions
  const isAdmin = () => hasRole('admin');
  const isPharmacist = () => hasRole('pharmacist');
  const isClient = () => hasRole('client');

  return {
    user,           // Your custom user from users table
    loading,
    error,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isPharmacist,
    isClient,
    clearError: () => setError(null)
  };
};