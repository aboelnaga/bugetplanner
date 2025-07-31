const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkFixStatus() {
  try {
    console.log('🔍 Checking if the fix has been applied...')
    
    // Check if the handle_new_user function exists
    try {
      const { data: functionCheck, error: funcError } = await supabase
        .rpc('handle_new_user')
      
      if (funcError) {
        console.log('❌ handle_new_user function not found or not accessible')
        console.log('Error:', funcError.message)
      } else {
        console.log('✅ handle_new_user function exists')
      }
    } catch (e) {
      console.log('❌ handle_new_user function does not exist')
    }

    // Check profiles table structure
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (profilesError) {
        console.log('❌ Error accessing profiles:', profilesError.message)
      } else {
        console.log('✅ Profiles table is accessible')
      }
    } catch (e) {
      console.log('❌ Profiles table error:', e.message)
    }

    // Check if we can insert into profiles (this should work now)
    const testUserId = '00000000-0000-0000-0000-000000000001'
    try {
      const { data: insertTest, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'test-fix@example.com',
          full_name: 'Test Fix User'
        })
        .select()
      
      if (insertError) {
        console.log('❌ Still cannot insert into profiles:', insertError.message)
        console.log('This means the RLS policies are still blocking inserts')
      } else {
        console.log('✅ Can now insert into profiles table')
        
        // Clean up test data
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId)
      }
    } catch (e) {
      console.log('❌ Insert test failed:', e.message)
    }

    console.log('\n📋 If you still see errors, the SQL fix has not been applied yet.')
    console.log('📋 Please make sure to run the SQL script in your Supabase dashboard.')
    
  } catch (error) {
    console.error('❌ Error checking fix status:', error)
  }
}

checkFixStatus() 