// services/pharmacyDatabaseService.js
import { supabase, TABLES, REALTIME_CHANNELS } from '../config/supabase.js';

export class PharmacyDatabaseService {
  // ==================== RESERVATIONS ====================
  
  static async getReservations(userId = null) {
    try {
      let query = supabase
        .from(TABLES.RESERVATIONS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            id,
            name,
            address,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      
      return data.map(reservation => ({
        id: reservation.id,
        patientName: reservation.patient_name,
        medication: reservation.medication_name,
        quantity: reservation.quantity,
        pharmacy: reservation.pharmacy_name,
        status: reservation.status,
        date: reservation.reservation_date,
        time: reservation.reservation_time,
        coordinates: reservation.pharmacy?.latitude ? 
          [reservation.pharmacy.longitude, reservation.pharmacy.latitude] : 
          [-74.0060, 40.7128], // Default NYC coordinates
        notes: reservation.notes,
        totalAmount: reservation.total_amount,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at
      }))
    } catch (error) {
      console.error('Error fetching reservations:', error)
      throw error
    }
  }

  static async createReservation(reservationData, userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .insert([{
          user_id: userId,
          patient_name: reservationData.patientName,
          medication_name: reservationData.medication,
          quantity: parseInt(reservationData.quantity),
          pharmacy_name: reservationData.pharmacy,
          status: reservationData.status || 'pending',
          notes: reservationData.notes,
          reservation_date: reservationData.date || new Date().toISOString().split('T')[0],
          reservation_time: reservationData.time || new Date().toTimeString().split(' ')[0]
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  static async updateReservation(id, updates) {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      }

      if (updates.patientName) updateData.patient_name = updates.patientName
      if (updates.medication) updateData.medication_name = updates.medication
      if (updates.quantity) updateData.quantity = parseInt(updates.quantity)
      if (updates.pharmacy) updateData.pharmacy_name = updates.pharmacy
      if (updates.status) updateData.status = updates.status
      if (updates.notes !== undefined) updateData.notes = updates.notes

      const { data, error } = await supabase
        .from(TABLES.RESERVATIONS)
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating reservation:', error)
      throw error
    }
  }

  static async deleteReservation(id) {
    try {
      const { error } = await supabase
        .from(TABLES.RESERVATIONS)
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting reservation:', error)
      throw error
    }
  }

  // ==================== PHARMACIES ====================
  
  static async getPharmacies() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      
      return data.map(pharmacy => ({
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        status: pharmacy.status,
        rating: pharmacy.rating,
        distance: pharmacy.distance || 'N/A',
        coordinates: pharmacy.latitude && pharmacy.longitude ? 
          [pharmacy.longitude, pharmacy.latitude] : 
          [-74.0060, 40.7128]
      }))
    } catch (error) {
      console.error('Error fetching pharmacies:', error)
      throw error
    }
  }

  static async getPharmacyById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching pharmacy:', error)
      throw error
    }
  }

  // ==================== MEDICATIONS ====================
  
  static async getMedications(pharmacyId = null, searchTerm = null) {
    try {
      let query = supabase
        .from(TABLES.MEDICATIONS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            id,
            name,
            address
          )
        `)
        .order('name', { ascending: true })

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId)
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error fetching medications:', error)
      throw error
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  static subscribeToReservations(callback, userId = null) {
    let filter = 'reservation_id=not.is.null' // Subscribe to all changes
    
    if (userId) {
      filter = `user_id=eq.${userId}`
    }

    const subscription = supabase
      .channel(REALTIME_CHANNELS.RESERVATIONS)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.RESERVATIONS,
          filter: filter
        },
        (payload) => {
          console.log('Real-time reservation update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  }

  static subscribeToPharmacies(callback) {
    const subscription = supabase
      .channel(REALTIME_CHANNELS.PHARMACIES)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PHARMACIES
        },
        (payload) => {
          console.log('Real-time pharmacy update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  }

  static subscribeToMedications(callback) {
    const subscription = supabase
      .channel(REALTIME_CHANNELS.MEDICATIONS)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.MEDICATIONS
        },
        (payload) => {
          console.log('Real-time medication update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return subscription
  }

  // ==================== UTILITY METHODS ====================
  
  static unsubscribe(subscription) {
    supabase.removeChannel(subscription)
  }

  static unsubscribeAll() {
    supabase.removeAllChannels()
  }

  // ==================== ANALYTICS & STATS ====================
  
  static async getReservationStats(userId = null) {
    try {
      let query = supabase
        .from(TABLES.RESERVATIONS)
        .select('status, created_at')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error

      const today = new Date().toISOString().split('T')[0]
      
      return {
        total: data.length,
        confirmed: data.filter(r => r.status === 'confirmed').length,
        pending: data.filter(r => r.status === 'pending').length,
        cancelled: data.filter(r => r.status === 'cancelled').length,
        today: data.filter(r => r.created_at.split('T')[0] === today).length
      }
    } catch (error) {
      console.error('Error fetching reservation stats:', error)
      throw error
    }
  }

  // ==================== SEARCH FUNCTIONALITY ====================
  
  static async searchMedicationsAndPharmacies(searchTerm, filters = {}) {
    try {
      const promises = []

      // Search medications
      let medicationQuery = supabase
        .from(TABLES.MEDICATIONS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            id,
            name,
            address,
            status
          )
        `)
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)

      if (filters.category) {
        medicationQuery = medicationQuery.eq('category', filters.category)
      }

      promises.push(medicationQuery)

      // Search pharmacies
      let pharmacyQuery = supabase
        .from(TABLES.PHARMACIES)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)

      if (filters.status) {
        pharmacyQuery = pharmacyQuery.eq('status', filters.status)
      }

      promises.push(pharmacyQuery)

      const [medicationsResult, pharmaciesResult] = await Promise.all(promises)

      if (medicationsResult.error) throw medicationsResult.error
      if (pharmaciesResult.error) throw pharmaciesResult.error

      return {
        medications: medicationsResult.data || [],
        pharmacies: pharmaciesResult.data || []
      }
    } catch (error) {
      console.error('Error searching medications and pharmacies:', error)
      throw error
    }
  }
}