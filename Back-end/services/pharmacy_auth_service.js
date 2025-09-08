import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs'; // You'll need to install this: npm install bcryptjs

const TABLES = {
  USERS: 'users',
  CLIENTS: 'clients', 
  PHARMACISTS: 'pharmacists',
  ADMINS: 'admins',
  PHARMACIES: 'pharmacies'
};

export class PharmacyAuthService {
  // ==================== AUTHENTICATION ====================
  
  static async signUp(userData) {
    try {
      // Step 1: Create a user in Supabase Authentication.
      // Supabase handles the password hashing and user session management.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email, 
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role
          }
        }
      });
      
      if (authError) {
        throw authError;
      }

      // Supabase will automatically create a user in auth.users and return the user object.
      const userId = authData.user.id;
      const userEmail = authData.user.email;

      // Step 2: Use the newly created user's ID to create a profile in your 'users' table.
      const { data: userRecord, error: userError } = await supabase
        .from(TABLES.USERS)
        .insert({
          id: userId, // CRITICAL: Use the user ID from Supabase Auth
          full_name: userData.fullName,
          email: userEmail,
          address: userData.address || null,
          date_of_birth: userData.dateOfBirth || null,
          phone_number: userData.phone || null,
          role: userData.role || 'client'
        })
        .select()
        .single();
      
      if (userError) {
        throw userError;
      }

      // Step 3: Create role-specific records (pharmacist/client) using the same user ID.
      if (userData.role === 'client') {
        const { error: clientError } = await supabase
          .from(TABLES.CLIENTS)
          .insert({
            user_id: userRecord.id,
            is_premium: false
          });
        if (clientError) throw clientError;

      } else if (userData.role === 'pharmacist') {
        let pharmacyId = null;
        if (userData.pharmacyName) {
          const { data: pharmacyData, error: pharmacyError } = await supabase
            .from(TABLES.PHARMACIES)
            .insert({
              name: userData.pharmacyName,
              address: userData.address,
              contact_info: userData.phone,
              phone: userData.phone,
              operating_hours: userData.operatingHours || 'Mon-Fri: 8AM-6PM',
              is_approved: false,
              status: 'pending'
            })
            .select()
            .single();
          
          if (pharmacyError) throw pharmacyError;
          pharmacyId = pharmacyData.pharmacy_id;
        }

        const { error: pharmacistError } = await supabase
          .from(TABLES.PHARMACISTS)
          .insert({
            user_id: userRecord.id,
            license_number: userData.licenseNumber,
            pharmacy_id: pharmacyId
          });
        if (pharmacistError) throw pharmacistError;
      }

      return {
        success: true,
        user: userRecord,
        message: userData.role === 'pharmacist' 
          ? 'Pharmacy account created successfully. Awaiting admin approval.' 
          : 'Account created successfully!'
      };

    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signIn(identifier, password) {
    try {
      // Find user by phone number (since we're not using email in your schema)
      // You might need to adjust this based on how you want users to sign in
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('email', identifier) // or you could use full_name or another unique identifier
        .single();

      if (userError || !userData) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, userData.password_hash);
      if (!passwordMatch) {
        throw new Error('Invalid credentials');
      }

      // Get additional role-specific data
      let roleData = null;
      
      if (userData.role === 'client') {
        const { data: clientData } = await supabase
          .from(TABLES.CLIENTS)
          .select('*')
          .eq('user_id', userData.user_id)
          .single();
        roleData = clientData;
      } else if (userData.role === 'pharmacist') {
        const { data: pharmacistData } = await supabase
          .from(TABLES.PHARMACISTS)
          .select(`
            *,
            pharmacy:pharmacy_id (
              name,
              address,
              is_approved,
              status
            )
          `)
          .eq('user_id', userData.user_id)
          .single();
        roleData = pharmacistData;
      } else if (userData.role === 'admin') {
        const { data: adminData } = await supabase
          .from(TABLES.ADMINS)
          .select('*')
          .eq('user_id', userData.user_id)
          .single();
        roleData = adminData;
      }

      return {
        success: true,
        user: {
          ...userData,
          roleData: roleData
        }
      };

    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async getCurrentUser(userId) {
    try {
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  static async getCurrentUserProfile(userId) {
    try {
      const userData = await this.getCurrentUser(userId);
      if (!userData) return null;

      // Get role-specific data
      let roleData = null;
      
      if (userData.role === 'client') {
        const { data: clientData } = await supabase
          .from(TABLES.CLIENTS)
          .select('*')
          .eq('user_id', userData.user_id)
          .single();
        roleData = clientData;
      } else if (userData.role === 'pharmacist') {
        const { data: pharmacistData } = await supabase
          .from(TABLES.PHARMACISTS)
          .select(`
            *,
            pharmacy:pharmacy_id (
              name,
              address,
              is_approved,
              status
            )
          `)
          .eq('user_id', userData.user_id)
          .single();
        roleData = pharmacistData;
      }

      return {
        ...userData,
        roleData: roleData
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // ==================== PROFILE MANAGEMENT ====================
  
  static async updateUserProfile(userId, updates) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (updates.fullName) updateData.full_name = updates.fullName;
      if (updates.address) updateData.address = updates.address;
      if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updateData)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // ==================== PASSWORD MANAGEMENT ====================
  
  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      // First verify current password
      const { data: userData } = await supabase
        .from(TABLES.USERS)
        .select('password_hash')
        .eq('user_id', userId)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      const passwordMatch = await bcrypt.compare(currentPassword, userData.password_hash);
      if (!passwordMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ 
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // ==================== ROLE-BASED ACCESS ====================
  
  static async hasRole(userId, requiredRole) {
    try {
      const userProfile = await this.getCurrentUser(userId);
      if (!userProfile) return false;
      
      const roleHierarchy = {
        'client': 1,
        'pharmacist': 2,
        'admin': 3
      };
      
      const userRoleLevel = roleHierarchy[userProfile.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      
      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  static async isAdmin(userId) {
    return this.hasRole(userId, 'admin');
  }

  static async isPharmacyStaff(userId) {
    return this.hasRole(userId, 'pharmacist');
  }

  static async isClient(userId) {
    return this.hasRole(userId, 'client');
  }

  // ==================== UTILITY METHODS ====================
  
  static generateSessionToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  static async createSession(userId) {
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // You might want to create a sessions table for this
    // For now, we'll return the token and let the frontend handle it
    return {
      token,
      userId,
      expiresAt: expiresAt.toISOString()
    };
  }
}