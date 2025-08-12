import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jqjcbhruvqivantgvasn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamNiaHJ1dnFpdmFudGd2YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzQyMDcsImV4cCI6MjA3MDA1MDIwN30.AhSeKOdbLzmZekH2h21tstebf-Wt1h86Zt4zoQZAwYs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
      heartbeatInterval: 10000
    }
  }
})

export const TABLES = {
  RESERVATIONS: 'reservations',
  PHARMACIES: 'pharmacies',
  USERS: 'users',
  MEDICATIONS: 'medications'
}

export const REALTIME_CHANNELS = {
  RESERVATIONS: 'reservations-changes',
  PHARMACIES: 'pharmacies-changes',
  MEDICATIONS: 'medications-changes'
}