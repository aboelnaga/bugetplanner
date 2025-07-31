const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFinalSignup() {
  try {
    console.log('🧪 Testing final signup (without triggers)...')
    
    // Test signup with a real email domain
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@gmail.com',
      password: '12345678'
    })
    
    if (error) {
      console.log('❌ Signup error:', error.message)
      console.log('Error details:', error)
    } else {
      console.log('✅ Signup successful!')
      console.log('User data:', data)
      
      // Test if we can manually create profile and accounts
      if (data.user) {
        console.log('📋 Testing manual profile and account creation...')
        try {
          const { data: funcResult, error: funcError } = await supabase
            .rpc('create_user_profile_and_accounts', { user_id: data.user.id })
          
          if (funcError) {
            console.log('❌ Manual creation error:', funcError.message)
          } else {
            console.log('✅ Manual profile and account creation successful!')
          }
        } catch (e) {
          console.log('❌ Manual creation failed:', e.message)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testFinalSignup() 