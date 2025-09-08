/*import { supabase } from '../config/supabase.js';

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

  static async getPharmacyReservations(pharmacyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          client:client_id (
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
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(reservation => ({
        id: reservation.reservation_id,
        patientName: reservation.client?.user?.full_name || 'Unknown',
        medication: reservation.medication?.name || 'Unknown',
        quantity: reservation.quantity,
        status: reservation.status,
        totalAmount: reservation.total_amount,
        createdAt: reservation.created_at,
        expiresAt: reservation.expires_at
      }));
    } catch (error) {
      console.error('Error fetching pharmacy reservations:', error);
      throw error;
    }
  }

  static async getPharmacyStats(pharmacyId) {
    try {
      const { data: reservations, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .select('status, created_at')
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const todaysReservations = reservations.filter(r => r.created_at && r.created_at.split('T')[0] === today);

      return {
        total: reservations.length,
        confirmed: todaysReservations.filter(r => r.status === 'confirmed').length,
        pending: reservations.filter(r => r.status === 'pending').length
      };
    } catch (error) {
      console.error('Error fetching pharmacy stats:', error);
      throw error;
    }
  }

  static async getAdminStats() {
    try {
      const [users, pharmacies, reservations, pending] = await Promise.all([
        supabase.from(TABLES.USERS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.PHARMACIES).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.RESERVATIONS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.PHARMACIES).select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: users.count,
        totalPharmacies: pharmacies.count,
        totalReservations: reservations.count,
        pendingApprovals: pending.count
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const { data, error } = await supabase.from(TABLES.USERS).select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  static async getAllPharmacies() {
    try {
      const { data, error } = await supabase.from(TABLES.PHARMACIES).select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all pharmacies:', error);
      throw error;
    }
  }

  static async getAllReservations() {
    return this.getReservations();
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
          { lat: pharmacy.latitude, lng: pharmacy.longitude } : null
      }));
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
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

  // ==================== ENHANCED SEARCH WITH COORDINATES ====================
  
  static async searchMedicationsAndPharmacies(searchTerm, filters = {}) {
    try {
      const promises = [];

      // Enhanced medication search with pharmacy coordinates
      let medicationQuery = supabase
        .from('medication_search_view')
        .select(`
          *,
          pharmacy:pharmacy_id (
            pharmacy_id,
            name,
            address,
            phone,
            latitude,
            longitude,
            status,
            average_rating
          )
        `)
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`);

      if (filters.category) {
        medicationQuery = medicationQuery.eq('category', filters.category);
      }

      promises.push(medicationQuery);

      // Enhanced pharmacy search with coordinates
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

      // Transform medication data to include coordinates
      const medicationsWithCoords = (medicationsResult.data || []).map(med => ({
        ...med,
        pharmacy: med.pharmacy?.name || 'Unknown',
        pharmacy_id: med.pharmacy?.pharmacy_id,
        pharmacy_address: med.pharmacy?.address,
        pharmacy_phone: med.pharmacy?.phone,
        coordinates: med.pharmacy?.latitude && med.pharmacy?.longitude ? {
          lat: parseFloat(med.pharmacy.latitude),
          lng: parseFloat(med.pharmacy.longitude)
        } : null
      }));

      // Transform pharmacy data to include coordinates
      const pharmaciesWithCoords = (pharmaciesResult.data || []).map(pharmacy => ({
        ...pharmacy,
        coordinates: pharmacy.latitude && pharmacy.longitude ? {
          lat: parseFloat(pharmacy.latitude),
          lng: parseFloat(pharmacy.longitude)
        } : null
      }));

      return {
        medications: medicationsWithCoords,
        pharmacies: pharmaciesWithCoords
      };
    } catch (error) {
      console.error('Error searching medications and pharmacies:', error);
      throw error;
    }
  }

  // ==================== PHARMACY LOCATION SERVICES ====================

  static async getPharmaciesWithCoordinates(approvedOnly = true) {
    try {
      let query = supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
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
        operatingHours: pharmacy.operating_hours,
        coordinates: {
          lat: parseFloat(pharmacy.latitude),
          lng: parseFloat(pharmacy.longitude)
        }
      }));
    } catch (error) {
      console.error('Error fetching pharmacies with coordinates:', error);
      throw error;
    }
  }

  static async getPharmaciesNearLocation(latitude, longitude, radiusKm = 10) {
    try {
      // Using PostGIS ST_DWithin function for geographic proximity
      // Note: This requires PostGIS extension and proper geographic columns
      const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm
      });

      if (error) {
        // Fallback to client-side distance calculation if RPC not available
        console.warn('RPC not available, using fallback method');
        return this.getPharmaciesWithCoordinatesFallback(latitude, longitude, radiusKm);
      }

      return data.map(pharmacy => ({
        id: pharmacy.pharmacy_id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        status: pharmacy.status,
        rating: pharmacy.average_rating,
        coordinates: {
          lat: parseFloat(pharmacy.latitude),
          lng: parseFloat(pharmacy.longitude)
        },
        distance: pharmacy.distance_km
      }));
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      // Fallback method
      return this.getPharmaciesWithCoordinatesFallback(latitude, longitude, radiusKm);
    }
  }

  // Fallback method for distance calculation
  static async getPharmaciesWithCoordinatesFallback(userLat, userLng, radiusKm) {
    try {
      const pharmacies = await this.getPharmaciesWithCoordinates();
      
      return pharmacies
        .map(pharmacy => ({
          ...pharmacy,
          distance: this.calculateDistance(
            { lat: userLat, lng: userLng },
            pharmacy.coordinates
          )
        }))
        .filter(pharmacy => pharmacy.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error in fallback pharmacy search:', error);
      throw error;
    }
  }

  // ==================== MEDICATION AVAILABILITY BY LOCATION ====================

  static async findMedicationNearLocation(medicationName, latitude, longitude, radiusKm = 20) {
    try {
      const { data, error } = await supabase
        .from('medication_availability_view')
        .select(`
          *,
          pharmacy:pharmacy_id (
            pharmacy_id,
            name,
            address,
            phone,
            latitude,
            longitude,
            status,
            average_rating
          )
        `)
        .ilike('medication_name', `%${medicationName}%`)
        .not('pharmacy.latitude', 'is', null)
        .not('pharmacy.longitude', 'is', null);

      if (error) throw error;

      // Calculate distances and filter by radius
      const medicationsWithDistance = data
        .map(item => {
          const distance = this.calculateDistance(
            { lat: latitude, lng: longitude },
            { 
              lat: parseFloat(item.pharmacy.latitude), 
              lng: parseFloat(item.pharmacy.longitude) 
            }
          );

          return {
            ...item,
            distance,
            coordinates: {
              lat: parseFloat(item.pharmacy.latitude),
              lng: parseFloat(item.pharmacy.longitude)
            }
          };
        })
        .filter(item => item.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      return medicationsWithDistance;
    } catch (error) {
      console.error('Error finding medication near location:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  static calculateDistance(coord1, coord2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static async geocodeAddress(address) {
    try {
      // This would typically use a geocoding service like Google Maps Geocoding API
      // For now, return null and handle manually
      console.warn('Geocoding not implemented, please add coordinates manually');
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // ==================== PHARMACY UPDATES ====================

  static async updatePharmacyCoordinates(pharmacyId, latitude, longitude) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PHARMACIES)
        .update({
          latitude: latitude,
          longitude: longitude,
          updated_at: new Date().toISOString()
        })
        .eq('pharmacy_id', pharmacyId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating pharmacy coordinates:', error);
      throw error;
    }
  }

  // ==================== ENHANCED RESERVATIONS WITH LOCATION ====================

  static async createReservationWithDistance(reservationData, userId, userLocation = null) {
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

      // Calculate distance to pharmacy if user location is provided
      let distanceToPharmacy = null;
      if (userLocation && reservationData.pharmacyId) {
        const { data: pharmacyData } = await supabase
          .from(TABLES.PHARMACIES)
          .select('latitude, longitude')
          .eq('pharmacy_id', reservationData.pharmacyId)
          .single();

        if (pharmacyData && pharmacyData.latitude && pharmacyData.longitude) {
          distanceToPharmacy = this.calculateDistance(
            userLocation,
            { 
              lat: parseFloat(pharmacyData.latitude), 
              lng: parseFloat(pharmacyData.longitude) 
            }
          );
        }
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
          distance_km: distanceToPharmacy,
          expires_at: reservationData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating reservation with distance:', error);
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

  static async approvePharmacy(pharmacyId) {
    try {
      const { error } = await supabase
        .from(TABLES.PHARMACIES)
        .update({ is_approved: true, status: 'approved' })
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error approving pharmacy:', error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}*/
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

  static async createReservation(data) {
    try {
      const { data: newReservation, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .insert([{
          client_id: data.client_id,
          pharmacy_id: data.pharmacy_id,
          medication_id: data.medication_id,
          quantity: data.quantity,
          status: 'pending',
          total_amount: data.total_amount,
          expires_at: data.expires_at,
          patient_name: data.patient_name
        }])
        .select()
        .single();

      if (error) throw error;
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  static async updateReservation(reservationId, data) {
    try {
      const { data: updatedReservation, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .update({
          status: data.status,
          total_amount: data.total_amount,
          expires_at: data.expires_at
        })
        .eq('reservation_id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return updatedReservation;
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

  static async getReservationById(reservationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          pharmacy:pharmacy_id (*),
          client:client_id (*),
          medication:medication_id (*)
        `)
        .eq('reservation_id', reservationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reservation by ID:', error);
      throw error;
    }
  }

  static async getReservationStats(userId) {
    try {
      // Get client_id first
      const { data: clientData } = await supabase
        .from(TABLES.CLIENTS)
        .select('client_id')
        .eq('user_id', userId)
        .single();

      if (!clientData) return { total: 0, confirmed: 0, pending: 0 };

      const { count: total, error: totalError } = await supabase
        .from(TABLES.RESERVATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientData.client_id);

      if (totalError) throw totalError;

      const { count: confirmed, error: confirmedError } = await supabase
        .from(TABLES.RESERVATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientData.client_id)
        .eq('status', 'confirmed');

      if (confirmedError) throw confirmedError;

      const { count: pending, error: pendingError } = await supabase
        .from(TABLES.RESERVATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientData.client_id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      return { total, confirmed, pending };
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }

  static async getPharmacyReservations(pharmacyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          client:client_id (
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
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(reservation => ({
        id: reservation.reservation_id,
        patientName: reservation.client?.user?.full_name || 'Unknown',
        medication: reservation.medication?.name || 'Unknown',
        quantity: reservation.quantity,
        status: reservation.status,
        totalAmount: reservation.total_amount,
        createdAt: reservation.created_at,
        expiresAt: reservation.expires_at
      }));
    } catch (error) {
      console.error('Error fetching pharmacy reservations:', error);
      throw error;
    }
  }

  static async getPharmacyStats(pharmacyId) {
    try {
      const [totalRes, confirmedRes, pendingRes, inventoryCount] = await Promise.all([
        supabase.from(TABLES.RESERVATIONS).select('*', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId),
        supabase.from(TABLES.RESERVATIONS).select('*', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId).eq('status', 'confirmed'),
        supabase.from(TABLES.RESERVATIONS).select('*', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId).eq('status', 'pending'),
        supabase.from(TABLES.INVENTORY).select('*', { count: 'exact', head: true }).eq('pharmacy_id', pharmacyId)
      ]);

      if (totalRes.error) throw totalRes.error;
      if (confirmedRes.error) throw confirmedRes.error;
      if (pendingRes.error) throw pendingRes.error;
      if (inventoryCount.error) throw inventoryCount.error;

      return {
        total: totalRes.count,
        confirmed: confirmedRes.count,
        pending: pendingRes.count,
        inventory: inventoryCount.count
      };
    } catch (error) {
      console.error('Error fetching pharmacy stats:', error);
      throw error;
    }
  }

  // ==================== PHARMACIES ====================

  static async getPharmacies() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      throw error;
    }
  }

  static async createPharmacy(data) {
    try {
      const { data: newPharmacy, error } = await supabase
        .from(TABLES.PHARMACIES)
        .insert([{
          name: data.pharmacyName,
          address: data.address,
          phone: data.phone,
          operating_hours: data.operatingHours,
          license_number: data.licenseNumber,
          status: 'pending',
          is_approved: false
        }])
        .select()
        .single();

      if (error) throw error;
      return newPharmacy;
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  }

  static async updatePharmacy(pharmacyId, data) {
    try {
      const { data: updatedPharmacy, error } = await supabase
        .from(TABLES.PHARMACIES)
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          operating_hours: data.operatingHours
        })
        .eq('pharmacy_id', pharmacyId)
        .select()
        .single();

      if (error) throw error;
      return updatedPharmacy;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      throw error;
    }
  }

  static async deletePharmacy(pharmacyId) {
    try {
      const { error } = await supabase
        .from(TABLES.PHARMACIES)
        .delete()
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      throw error;
    }
  }

  static async getNearbyPharmacies(lat, lng, radius = 10) {
    try {
      // Assuming pharmacies have lat/lng columns; use raw SQL for distance if PostGIS extension is enabled
      // For simple Euclidean distance (approximate), or use Supabase RPC for haversine
      const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
        input_lat: lat,
        input_lng: lng,
        input_radius: radius
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      // Fallback to all if RPC not set up
      return this.getPharmacies();
    }
  }

  static async getAllPharmacies() {
    try {
      const { data, error } = await supabase.from(TABLES.PHARMACIES).select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all pharmacies:', error);
      throw error;
    }
  }

  static async approvePharmacy(pharmacyId) {
    try {
      const { error } = await supabase
        .from(TABLES.PHARMACIES)
        .update({ is_approved: true, status: 'approved' })
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error approving pharmacy:', error);
      throw error;
    }
  }

  // ==================== USERS ====================

  static async getAllUsers() {
    try {
      const { data, error } = await supabase.from(TABLES.USERS).select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async updateUser(userId, data) {
    try {
      const { data: updatedUser, error } = await supabase
        .from(TABLES.USERS)
        .update({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ==================== MEDICATIONS / INVENTORY ====================

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
      return data.map(item => ({
        id: item.inventory_id,
        name: item.medication?.name || 'Unknown',
        description: item.medication?.generic_name || '',
        stock: item.quantity,
        price: item.medication?.price || 0,
        category: item.medication?.category?.name || ''
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  static async createMedication(pharmacyId, data) {
    try {
      // First, check if medication exists, or create new
      let medicationId;
      const { data: existingMed } = await supabase
        .from(TABLES.MEDICATIONS)
        .select('medication_id')
        .eq('name', data.name)
        .eq('generic_name', data.generic_name)
        .single();

      if (existingMed) {
        medicationId = existingMed.medication_id;
      } else {
        const { data: newMed, error: medError } = await supabase
          .from(TABLES.MEDICATIONS)
          .insert([{
            name: data.name,
            generic_name: data.generic_name,
            price: data.price,
            category_id: data.category ? (await this.getCategoryIdByName(data.category)) : null
          }])
          .select('medication_id')
          .single();

        if (medError) throw medError;
        medicationId = newMed.medication_id;
      }

      const { data: newInventory, error } = await supabase
        .from(TABLES.INVENTORY)
        .insert([{
          pharmacy_id: pharmacyId,
          medication_id: medicationId,
          quantity: data.quantity
        }])
        .select()
        .single();

      if (error) throw error;
      return newInventory;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  }

  static async updateMedication(inventoryId, data) {
    try {
      // Update medication first if needed
      const { data: inventory, error: invError } = await supabase
        .from(TABLES.INVENTORY)
        .select('medication_id')
        .eq('inventory_id', inventoryId)
        .single();

      if (invError) throw invError;

      const { error: medError } = await supabase
        .from(TABLES.MEDICATIONS)
        .update({
          name: data.name,
          generic_name: data.generic_name,
          price: data.price,
          category_id: data.category ? (await this.getCategoryIdByName(data.category)) : null
        })
        .eq('medication_id', inventory.medication_id);

      if (medError) throw medError;

      // Update inventory quantity
      const { error } = await supabase
        .from(TABLES.INVENTORY)
        .update({ quantity: data.quantity })
        .eq('inventory_id', inventoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  static async deleteMedication(inventoryId) {
    try {
      const { error } = await supabase
        .from(TABLES.INVENTORY)
        .delete()
        .eq('inventory_id', inventoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
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
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async createCategory(data) {
    try {
      const { data: newCategory, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert([{ name: data.name }])
        .select()
        .single();

      if (error) throw error;
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async updateCategory(categoryId, data) {
    try {
      const { data: updatedCategory, error } = await supabase
        .from(TABLES.CATEGORIES)
        .update({ name: data.name })
        .eq('category_id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .delete()
        .eq('category_id', categoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Helper to get category ID by name
  static async getCategoryIdByName(name) {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('category_id')
      .eq('name', name)
      .single();

    if (error || !data) return null;
    return data.category_id;
  }

  // ==================== SEARCH ====================

  static async searchMedicationsAndPharmacies(filters) {
    try {
      const searchTerm = filters.searchTerm?.toLowerCase() || '';
      const category = filters.category;
      const minPrice = filters.priceRange?.min || 0;
      const maxPrice = filters.priceRange?.max || Infinity;
      const lat = filters.userLocation?.lat;
      const lng = filters.userLocation?.lng;
      const distance = filters.distance || 10;

      // Search medications (join with inventory and pharmacies)
      let medsQuery = supabase
        .from(TABLES.MEDICATIONS)
        .select(`
          *,
          inventory:inventory_id (
            pharmacy:pharmacy_id (
              name,
              address,
              latitude,
              longitude
            ),
            quantity
          ),
          category:category_id (name)
        `)
        .ilike('name', `%${searchTerm}%`)
        .gte('price', minPrice)
        .lte('price', maxPrice);

      if (category) {
        medsQuery = medsQuery.eq('category_id', await this.getCategoryIdByName(category));
      }

      // Filter by distance if location provided (simple haversine via RPC or approx)
      if (lat && lng) {
        medsQuery = supabase.rpc('filter_by_distance', { input_lat: lat, input_lng: lng, input_radius: distance / 2 });
      }

      const { data: medsData, error: medsError } = await medsQuery;

      if (medsError) throw medsError;

      // Search pharmacies
      let pharmaciesQuery = supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .eq('status', 'approved');

      if (lat && lng) {
        pharmaciesQuery = supabase.rpc('filter_pharmacies_by_distance', { input_lat: lat, input_lng: lng, input_radius: distance / 2 });
      }

      const { data: pharmaciesData, error: pharmError } = await pharmaciesQuery;

      if (pharmError) throw pharmError;

      // Combine and filter available stock
      const searchResults = medsData
        .filter(med => med.inventory && med.inventory.quantity > 0)
        .map(med => ({
          type: 'medication',
          id: med.medication_id,
          name: med.name,
          genericName: med.generic_name,
          price: med.price,
          category: med.category?.name,
          pharmacy: med.inventory.pharmacy,
          stock: med.inventory.quantity,
          distance: lat && lng ? this.calculateDistance(lat, lng, med.inventory.pharmacy.lat, med.inventory.pharmacy.lng) : null
        }))
        .concat(
          pharmaciesData.map(pharm => ({
            type: 'pharmacy',
            id: pharm.pharmacy_id,
            name: pharm.name,
            address: pharm.address,
            phone: pharm.phone,
            distance: lat && lng ? this.calculateDistance(lat, lng, pharm.lat, pharm.lng) : null
          }))
        );

      return searchResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error searching medications and pharmacies:', error);
      throw error;
    }
  }

  // Simple haversine distance helper (in km)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ==================== ADMIN ====================

  static async getAdminStats() {
    try {
      const [users, pharmacies, reservations, pending] = await Promise.all([
        supabase.from(TABLES.USERS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.PHARMACIES).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.RESERVATIONS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.PHARMACIES).select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: users.count,
        totalPharmacies: pharmacies.count,
        totalReservations: reservations.count,
        pendingApprovals: pending.count
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  static async getAllReservations() {
    return this.getReservations();
  }

  // ==================== NOTIFICATIONS ====================

  static async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(notif => ({
        id: notif.notification_id,
        message: notif.message,
        time: notif.created_at,
        read: notif.is_read
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async sendNotification(userId, message) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert([{
          user_id: userId,
          message: message,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // ==================== OTHER METHODS ====================

  // Add any other utility methods as needed
}