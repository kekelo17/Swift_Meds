import { supabase } from '../config/supabase.js';

// Updated table names to match your schema
const TABLES = {
  USERS: 'users',
  CLIENTS: 'clients', 
  PHARMACISTS: 'pharmacists',
  ADMINS: 'admins',
  PHARMACIES: 'pharmacies',
  MEDICATIONS: 'medications',
  INVENTORY: 'inventory',
  RESERVATIONS: 'reservations',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  PREMIUM_SUBSCRIPTIONS: 'premium_subscriptions'
};

export class PharmacyDatabaseService {
  // ==================== RESERVATIONS ====================
  
  static async getReservations(userId = null) {
    try {
      let query = supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            pharmacy_id,
            name,
            address,
            phone
          ),
          client:client_id (
            client_id,
            user:user_id (
              full_name
            )
          ),
          medication:medication_id (
            name,
            generic_name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        // First get client_id from user_id
        const { data: clientData } = await supabase
          .from(TABLES.CLIENTS)
          .select('client_id')
          .eq('user_id', userId)
          .single();
        
        if (clientData) {
          query = query.eq('client_id', clientData.client_id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(reservation => ({
        id: reservation.reservation_id,
        patientName: reservation.patient_name,
        medication: reservation.medication?.name || 'Unknown',
        quantity: reservation.quantity,
        pharmacy: reservation.pharmacy?.name || 'Unknown',
        status: reservation.status,
        totalAmount: reservation.total_amount,
        createdAt: reservation.created_at,
        expiresAt: reservation.expires_at,
        pharmacyAddress: reservation.pharmacy?.address,
        pharmacyPhone: reservation.pharmacy?.phone
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  static async createReservation(reservationData, userId) {
    try {
      // Get client_id from user_id
      const { data: clientData, error: clientError } = await supabase
        .from(TABLES.CLIENTS)
        .select('client_id')
        .eq('user_id', userId)
        .single();

      if (clientError || !clientData) {
        throw new Error('Client not found for this user');
      }

      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .insert([{
          client_id: clientData.client_id,
          pharmacy_id: reservationData.pharmacyId,
          medication_id: reservationData.medicationId,
          patient_name: reservationData.patientName,
          quantity: parseInt(reservationData.quantity),
          status: reservationData.status || 'pending',
          total_amount: reservationData.totalAmount,
          expires_at: reservationData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  static async updateReservation(reservationId, updates) {
    try {
      const updateData = {};

      if (updates.patientName) updateData.patient_name = updates.patientName;
      if (updates.quantity) updateData.quantity = parseInt(updates.quantity);
      if (updates.status) updateData.status = updates.status;
      if (updates.totalAmount) updateData.total_amount = updates.totalAmount;

      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .update(updateData)
        .eq('reservation_id', reservationId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  static async deleteReservation(reservationId) {
    try {
      const { error } = await supabase
        .from(TABLES.RESERVATIONS)
        .delete()
        .eq('reservation_id', reservationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  // ==================== PHARMACIES ====================
  
  static async getPharmacies(approvedOnly = true) {
    try {
      let query = supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .order('name', { ascending: true });

      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(pharmacy => ({
        id: pharmacy.pharmacy_id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        status: pharmacy.status,
        rating: pharmacy.average_rating,
        coordinates: pharmacy.latitude && pharmacy.longitude ? 
          [pharmacy.longitude, pharmacy.latitude] : 
          [null, null],
        operatingHours: pharmacy.operating_hours,
        isApproved: pharmacy.is_approved
      }));
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      throw error;
    }
  }

  static async getPharmacyById(pharmacyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
      throw error;
    }
  }

  // ==================== MEDICATIONS ====================
  
  static async getMedications(pharmacyId = null, searchTerm = null) {
    try {
      let query = supabase
        .from('medication_search_view') // Using the view from your schema
        .select('*')
        .order('name', { ascending: true });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  }

  // ==================== INVENTORY ====================
  
  static async getInventory(pharmacyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .select(`
          *,
          medication:medication_id (
            name,
            generic_name,
            price,
            category:category_id (
              name
            )
          )
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('quantity', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  static async updateInventory(pharmacyId, medicationId, quantity) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .upsert({
          pharmacy_id: pharmacyId,
          medication_id: medicationId,
          quantity: quantity,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'pharmacy_id,medication_id'
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  // ==================== SEARCH FUNCTIONALITY ====================
  
  static async searchMedicationsAndPharmacies(searchTerm, filters = {}) {
    try {
      const promises = [];

      // Search medications using the view
      let medicationQuery = supabase
        .from('medication_search_view')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`);

      if (filters.category) {
        medicationQuery = medicationQuery.eq('category', filters.category);
      }

      promises.push(medicationQuery);

      // Search pharmacies
      let pharmacyQuery = supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .eq('is_approved', true);

      if (filters.status) {
        pharmacyQuery = pharmacyQuery.eq('status', filters.status);
      }

      promises.push(pharmacyQuery);

      const [medicationsResult, pharmaciesResult] = await Promise.all(promises);

      if (medicationsResult.error) throw medicationsResult.error;
      if (pharmaciesResult.error) throw pharmaciesResult.error;

      return {
        medications: medicationsResult.data || [],
        pharmacies: pharmaciesResult.data || []
      };
    } catch (error) {
      console.error('Error searching medications and pharmacies:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS & STATS ====================
  
  static async getReservationStats(userId = null) {
    try {
      let query = supabase
        .from('reservation_details_view') // Using the view
        .select('status, created_at');

      if (userId) {
        query = query.eq('client_name', userId); // This might need adjustment based on how you want to filter
      }

      const { data, error } = await query;
      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      return {
        total: data.length,
        confirmed: data.filter(r => r.status === 'confirmed').length,
        pending: data.filter(r => r.status === 'pending').length,
        cancelled: data.filter(r => r.status === 'cancelled').length,
        fulfilled: data.filter(r => r.status === 'fulfilled').length,
        today: data.filter(r => r.created_at.split('T')[0] === today).length
      };
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }

  // ==================== CATEGORIES ====================
  
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // ==================== REVIEWS ====================
  
  static async getPharmacyReviews(pharmacyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REVIEWS)
        .select(`
          *,
          client:client_id (
            user:user_id (
              full_name
            )
          )
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  static async createReview(userId, pharmacyId, rating, comment) {
    try {
      // Get client_id from user_id
      const { data: clientData, error: clientError } = await supabase
        .from(TABLES.CLIENTS)
        .select('client_id')
        .eq('user_id', userId)
        .single();

      if (clientError || !clientData) {
        throw new Error('Client not found for this user');
      }

      const { data, error } = await supabase
        .from(TABLES.REVIEWS)
        .insert({
          client_id: clientData.client_id,
          pharmacy_id: pharmacyId,
          rating: rating,
          comment: comment
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
}