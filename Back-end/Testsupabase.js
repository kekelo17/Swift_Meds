// Test your connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jqjcbhruvqivantgvasn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamNiaHJ1dnFpdmFudGd2YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzQyMDcsImV4cCI6MjA3MDA1MDIwN30.AhSeKOdbLzmZekH2h21tstebf-Wt1h86Zt4zoQZAwYs'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test a simple query
async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // First test the connection itself
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      throw authError
    }
    console.log('✅ Supabase connection successful!')

    // Then test the medications table
    console.log('\nTesting medications table access...')
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Table access error:', error.message)
    } else {
      console.log('✅ Successfully accessed medications table!')
      console.log('Sample data:', data)
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
  }
}

testConnection()