// hooks/usePharmacyAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { authAPI } from '../../Front-end/src/api/apiClient.js';
import { useNavigate } from "react-router-dom";

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
    
    const userRoleLevel = roleHierarchy[user.role?.toLowerCase()] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole?.toLowerCase()] || 0;
    
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
  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  
  const navigate = useNavigate();
  
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  
      clearAuthData();
      navigate('/auth/signin');
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  

  useEffect(() => {
    // Check for existing user in localStorage first
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }
      return false;
    };

    // If we found a stored session, don't need to check Supabase
    if (checkExistingSession()) {
      return;
    }

    // Get initial session from Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const customUser = await getCustomUserProfile(session.user.id);
          if (customUser) {
            setUser(customUser);
            localStorage.setItem('user', JSON.stringify(customUser));
            localStorage.setItem('authToken', session.access_token);
          }
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
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          try {
            const customUser = await getCustomUserProfile(session.user.id);
            if (customUser) {
              setUser(customUser);
              localStorage.setItem('user', JSON.stringify(customUser));
              localStorage.setItem('authToken', session.access_token);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
            setError(error.message);
            clearAuthData();
          }
        } else {
          setUser(null);
          clearAuthData();
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