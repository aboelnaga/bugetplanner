const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://shnnbuquwnzzzudwvcdp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobm5idXF1d256enp1ZHd2Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjA5NDIsImV4cCI6MjA2Nzg5Njk0Mn0.HatlZRm-6lLZaPnk_JaJqua8wNA2MO_FoN1dXyAVaDQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  try {
    console.log('🔍 Checking remote database schema...')
    
    // Check if profiles table exists
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (profilesError) {
        console.log('❌ Profiles table error:', profilesError.message)
      } else {
        console.log('✅ Profiles table exists')
      }
    } catch (e) {
      console.log('❌ Profiles table does not exist')
    }

    // Check if budget_items table exists
    try {
      const { data: budgetItems, error: budgetError } = await supabase
        .from('budget_items')
        .select('*')
        .limit(1)
      
      if (budgetError) {
        console.log('❌ Budget items table error:', budgetError.message)
      } else {
        console.log('✅ Budget items table exists')
      }
    } catch (e) {
      console.log('❌ Budget items table does not exist')
    }

    // Check if transactions table exists
    try {
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1)
      
      if (transError) {
        console.log('❌ Transactions table error:', transError.message)
      } else {
        console.log('✅ Transactions table exists')
      }
    } catch (e) {
      console.log('❌ Transactions table does not exist')
    }

    // Check if accounts table exists
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .limit(1)
      
      if (accountsError) {
        console.log('❌ Accounts table error:', accountsError.message)
      } else {
        console.log('✅ Accounts table exists')
      }
    } catch (e) {
      console.log('❌ Accounts table does not exist')
    }

    // Check if investment_assets table exists
    try {
      const { data: investments, error: invError } = await supabase
        .from('investment_assets')
        .select('*')
        .limit(1)
      
      if (invError) {
        console.log('❌ Investment assets table error:', invError.message)
      } else {
        console.log('✅ Investment assets table exists')
      }
    } catch (e) {
      console.log('❌ Investment assets table does not exist')
    }

    // Check if yearly_summaries table exists
    try {
      const { data: summaries, error: sumError } = await supabase
        .from('yearly_summaries')
        .select('*')
        .limit(1)
      
      if (sumError) {
        console.log('❌ Yearly summaries table error:', sumError.message)
      } else {
        console.log('✅ Yearly summaries table exists')
      }
    } catch (e) {
      console.log('❌ Yearly summaries table does not exist')
    }

    // Check if closed_months table exists
    try {
      const { data: closedMonths, error: closedError } = await supabase
        .from('closed_months')
        .select('*')
        .limit(1)
      
      if (closedError) {
        console.log('❌ Closed months table error:', closedError.message)
      } else {
        console.log('✅ Closed months table exists')
      }
    } catch (e) {
      console.log('❌ Closed months table does not exist')
    }

    console.log('\n📋 Schema check complete!')
    
  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkSchema() 