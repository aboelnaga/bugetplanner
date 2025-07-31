const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAccountsTrigger() {
  try {
    console.log('🔍 Checking for triggers or functions that reference accounts table...')
    
    // Check if there's a trigger on auth.users that tries to create accounts
    console.log('📋 The error suggests there\'s a trigger or function that tries to access the accounts table')
    console.log('📋 during user signup, but the table doesn\'t exist in the expected schema')
    
    // Check if there's a function that creates default accounts
    try {
      const { data: funcCheck, error: funcError } = await supabase
        .rpc('create_default_accounts_for_existing_users')
      
      if (funcError) {
        console.log('❌ create_default_accounts_for_existing_users function error:', funcError.message)
      } else {
        console.log('✅ create_default_accounts_for_existing_users function exists')
      }
    } catch (e) {
      console.log('❌ create_default_accounts_for_existing_users function does not exist')
    }

    // Check if there's a trigger that calls this function
    console.log('\n📋 The issue is likely that there\'s a trigger on auth.users that calls')
    console.log('📋 a function to create default accounts, but that function is failing')
    console.log('📋 because it can\'t find the accounts table in the right context')
    
    // Let's check if there's a trigger on auth.users
    console.log('\n📋 We need to find and fix the trigger that\'s causing this issue')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkAccountsTrigger() 