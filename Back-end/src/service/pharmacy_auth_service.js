// services/pharmacyAuthService.js
import { supabase } from './supabase_config';
import React from 'react';

export class PharmacyAuthService {
  // ==================== AUTHENTICATION ====================
  
  static async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            role: userData.role || 'user'
          }
        }
      })
      
      if (error) throw error

      // Create user profile in public.users table
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: data.user.email,
          full_name: userData.fullName || '',
          role: userData.role || 'user'
        })
      }

      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  }

  static async getCurrentUserProfile() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // ==================== PROFILE MANAGEMENT ====================
  
  static async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: profileData.email,
          full_name: profileData.full_name || '',
          role: profileData.role || 'user'
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // ==================== AUTH STATE MANAGEMENT ====================
  
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }

  // ==================== PASSWORD MANAGEMENT ====================
  
  static async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  static async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  // ==================== OAUTH PROVIDERS ====================
  
  static async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider, // 'google', 'github', 'facebook', etc.
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      throw error
    }
  }

  // ==================== ROLE-BASED ACCESS ====================
  
  static async hasRole(requiredRole) {
    try {
      const userProfile = await this.getCurrentUserProfile()
      if (!userProfile) return false
      
      const roleHierarchy = {
        'user': 1,
        'pharmacy': 2,
        'admin': 3
      }
      
      const userRoleLevel = roleHierarchy[userProfile.role] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0
      
      return userRoleLevel >= requiredRoleLevel
    } catch (error) {
      console.error('Error checking user role:', error)
      return false
    }
  }

  static async isAdmin() {
    return this.hasRole('admin')
  }

  static async isPharmacyStaff() {
    return this.hasRole('pharmacy')
  }

  // ==================== SESSION MANAGEMENT ====================
  
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      throw error
    }
  }

  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }
}

// ==================== HOOKS FOR REACT ====================

// Custom hook for auth state
export const usePharmacyAuth = () => {
  const [user, setUser] = React.useState(null)
  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await PharmacyAuthService.getSession()
        setUser(session?.user || null)
        
        if (session?.user) {
          const userProfile = await PharmacyAuthService.getCurrentUserProfile()
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = PharmacyAuthService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          try {
            const userProfile = await PharmacyAuthService.getCurrentUserProfile()
            setProfile(userProfile)
          } catch (error) {
            console.error('Error fetching user profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

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
  }
}