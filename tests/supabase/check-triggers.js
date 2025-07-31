const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTriggers() {
  try {
    console.log('🔍 Checking database triggers and functions...')
    
    // Check if there are any triggers on auth.users
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers_on_table', { table_name: 'auth.users' })
    
    if (triggersError) {
      console.log('❌ Error checking triggers:', triggersError.message)
    } else {
      console.log('✅ Triggers on auth.users:', triggers)
    }

    // Check if the profiles table has the correct structure
    const { data: profilesStructure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'profiles' })
    
    if (structureError) {
      console.log('❌ Error checking profiles structure:', structureError.message)
    } else {
      console.log('✅ Profiles table structure:', profilesStructure)
    }

    // Test if we can insert into profiles table directly
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting into profiles:', insertError.message)
    } else {
      console.log('✅ Can insert into profiles table')
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
    }

    // Check RLS policies on profiles
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_on_table', { table_name: 'profiles' })
    
    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message)
    } else {
      console.log('✅ RLS policies on profiles:', policies)
    }
    
  } catch (error) {
    console.error('❌ Error checking triggers:', error)
  }
}

checkTriggers() 