const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseSignupIssue() {
  try {
    console.log('🔍 Comprehensive diagnosis of signup issue...')
    
    // Test 1: Check if we can access all required tables
    console.log('\n📋 Test 1: Checking table access...')
    
    const tables = ['profiles', 'accounts', 'budget_items', 'transactions']
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table} table error:`, error.message)
        } else {
          console.log(`✅ ${table} table accessible`)
        }
      } catch (e) {
        console.log(`❌ ${table} table does not exist`)
      }
    }

    // Test 2: Check if we can insert into profiles manually
    console.log('\n📋 Test 2: Testing manual profile insertion...')
    const testUserId = '00000000-0000-0000-0000-000000000002'
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'test-diagnosis@example.com',
          full_name: 'Test Diagnosis User'
        })
        .select()
      
      if (error) {
        console.log('❌ Manual profile insertion failed:', error.message)
      } else {
        console.log('✅ Manual profile insertion works')
        
        // Clean up
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testUserId)
      }
    } catch (e) {
      console.log('❌ Manual profile insertion error:', e.message)
    }

    // Test 3: Check if we can insert into accounts manually
    console.log('\n📋 Test 3: Testing manual account insertion...')
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: testUserId,
          name: 'Test Account',
          type: 'checking',
          balance: 0,
          is_default: false
        })
        .select()
      
      if (error) {
        console.log('❌ Manual account insertion failed:', error.message)
      } else {
        console.log('✅ Manual account insertion works')
        
        // Clean up
        await supabase
          .from('accounts')
          .delete()
          .eq('user_id', testUserId)
      }
    } catch (e) {
      console.log('❌ Manual account insertion error:', e.message)
    }

    // Test 4: Check if there are any other triggers on auth.users
    console.log('\n📋 Test 4: The issue might be that there are multiple triggers')
    console.log('📋 on auth.users that are conflicting with each other')
    console.log('📋 We need to check if there are other triggers besides the ones we created')

    // Test 5: Try a simpler signup without the full_name
    console.log('\n📋 Test 5: Testing simpler signup...')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'simple-test@example.com',
        password: '12345678'
      })
      
      if (error) {
        console.log('❌ Simple signup error:', error.message)
      } else {
        console.log('✅ Simple signup works!')
        console.log('This suggests the issue is with the user metadata handling')
      }
    } catch (error) {
      console.log('❌ Simple signup failed:', error.message)
    }

    console.log('\n📋 Diagnosis complete!')
    console.log('📋 If simple signup works but full signup doesn\'t,')
    console.log('📋 the issue is likely with how we handle the full_name metadata')
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error)
  }
}

diagnoseSignupIssue() 