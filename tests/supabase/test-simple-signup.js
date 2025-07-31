const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSimpleSignup() {
  try {
    console.log('🧪 Testing simple signup (no metadata)...')
    
    // Test signup without any metadata
    const { data, error } = await supabase.auth.signUp({
      email: 'simple-test-' + Date.now() + '@example.com',
      password: '12345678'
    })
    
    if (error) {
      console.log('❌ Simple signup error:', error.message)
      console.log('Error details:', error)
    } else {
      console.log('✅ Simple signup successful!')
      console.log('User data:', data)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testSimpleSignup() 