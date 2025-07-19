import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  },
  global: {
    headers: {
      'X-Client-Info': 'budgrt-vue'
    }
  }
})



// Helper functions for budget operations
export const budgetAPI = {
  // Get all budget items for a user and year
  async getBudgetItems(userId, year) {
    console.log('API: Getting budget items for user:', userId, 'year:', year)
    
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('created_at', { ascending: true })
    
    console.log('API: Supabase response for getBudgetItems:', { data, error })
    if (error) throw error
    return data
  },

  // Create a new budget item
  async createBudgetItem(budgetItem) {
    console.log('API: Creating budget item:', budgetItem)
    const { data, error } = await supabase
      .from('budget_items')
      .insert(budgetItem)
      .select()
      .single()
    
    console.log('API: Supabase response:', { data, error })
    if (error) throw error
    return data
  },

  // Update a budget item
  async updateBudgetItem(id, updates) {
    const { data, error } = await supabase
      .from('budget_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a budget item
  async deleteBudgetItem(id) {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },



  // Get budget history
  // async getBudgetHistory(userId, year) {
  //   const { data, error } = await supabase
  //     .from('budget_history')
  //     .select('*')
  //     .eq('user_id', userId)
  //     .order('changed_at', { ascending: false })
  //   
  //   if (error) throw error
  //   return data
  // },



  // Create budget history entry
  // async createBudgetHistory(userId, historyData) {
  //   const { data, error } = await supabase
  //     .from('budget_history')
  //     .insert(historyData)
  //     .select()
  //     .single()
  //   
  //   if (error) throw error
  //   return data
  // },

  // Copy budget items from one year to another
  async copyBudgetItems(userId, sourceYear, targetYear) {
    // First get all budget items from source year
    const { data: sourceItems, error: fetchError } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .eq('year', sourceYear)
    
    if (fetchError) throw fetchError
    
    if (!sourceItems || sourceItems.length === 0) {
      return []
    }
    
    // Create new budget items for target year
    const newItems = []
    for (const item of sourceItems) {
      const { data: newItem, error: createError } = await supabase
        .from('budget_items')
        .insert({
          user_id: userId,
          year: targetYear,
          name: item.name,
          type: item.type,
          category: item.category,
          recurrence: item.recurrence,
          default_amount: item.default_amount,
          amounts: item.amounts,
          schedule: item.schedule,
          investment_direction: item.investment_direction,
          start_month: item.start_month
        })
        .select()
        .single()
      
      if (createError) throw createError
      newItems.push(newItem)
    }
    
    return newItems
  }
}

// Real-time subscriptions
export const subscribeToBudgetChanges = (userId, year, callback) => {
  return supabase
    .channel('budget_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'budget_items',
        filter: `user_id=eq.${userId} AND year=eq.${year}`
      },
      callback
    )
    .subscribe()
}

// Transaction API
export const transactionAPI = {
  // Get all transactions for a user and year
  async getTransactions(userId, year, month = null) {
    console.log('API: Getting transactions for user:', userId, 'year:', year, 'month:', month)
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        budget_items (
          id,
          name,
          type,
          category,
          payment_schedule,
          due_date,
          is_fixed_expense
        )
      `)
      .eq('user_id', userId)
      .eq('year', year)
      .order('date', { ascending: false })
    
    if (month !== null) {
      query = query.eq('month', month)
    }

    const { data, error } = await query
    
    console.log('API: Supabase response for getTransactions:', { data, error })
    if (error) throw error
    return data
  },

  // Create a new transaction
  async createTransaction(transaction) {
    console.log('API: Creating transaction:', transaction)
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(`
        *,
        budget_items (
          id,
          name,
          type,
          category,
          payment_schedule,
          due_date,
          is_fixed_expense
        )
      `)
      .single()
    
    console.log('API: Supabase response:', { data, error })
    if (error) throw error
    return data
  },

  // Update a transaction
  async updateTransaction(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        budget_items (
          id,
          name,
          type,
          category,
          payment_schedule,
          due_date,
          is_fixed_expense
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a transaction
  async deleteTransaction(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get transaction statistics
  async getTransactionStats(userId, year, month = null) {
    let query = supabase
      .from('transactions')
      .select('type, amount, category')
      .eq('user_id', userId)
      .eq('year', year)
    
    if (month !== null) {
      query = query.eq('month', month)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Calculate statistics
    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransfers: 0,
      netAmount: 0,
      categoryBreakdown: {},
      typeBreakdown: {}
    }
    
    data.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0
      
      // Type breakdown
      if (!stats.typeBreakdown[transaction.type]) {
        stats.typeBreakdown[transaction.type] = 0
      }
      stats.typeBreakdown[transaction.type] += amount
      
      // Category breakdown
      if (!stats.categoryBreakdown[transaction.category]) {
        stats.categoryBreakdown[transaction.category] = 0
      }
      stats.categoryBreakdown[transaction.category] += amount
      
      // Totals
      switch (transaction.type) {
        case 'income':
          stats.totalIncome += amount
          break
        case 'expense':
          stats.totalExpenses += amount
          break
        case 'transfer':
          stats.totalTransfers += amount
          break
      }
    })
    
    stats.netAmount = stats.totalIncome - stats.totalExpenses
    
    return stats
  },

  // Get transactions by budget item
  async getTransactionsByBudgetItem(userId, budgetItemId, year = null) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('budget_item_id', budgetItemId)
      .order('date', { ascending: false })
    
    if (year !== null) {
      query = query.eq('year', year)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions for transactions
export const subscribeToTransactionChanges = (userId, year, callback) => {
  return supabase
    .channel('transaction_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'transactions',
        filter: `user_id=eq.${userId} AND year=eq.${year}`
      },
      callback
    )
    .subscribe()
} 