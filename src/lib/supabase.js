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
    
    // Check and auto-close months if needed
    const autoCloseResult = await this.checkAndAutoCloseMonths(userId)
    
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('created_at', { ascending: true })
    
    console.log('API: Supabase response for getBudgetItems:', { data, error })
    if (error) throw error
    
    // Return both budget items and auto-close result
    return {
      budgetItems: data,
      autoCloseResult: autoCloseResult
    }
  },

  // Get a single budget item by ID
  async getBudgetItem(budgetItemId) {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('id', budgetItemId)
      .single()
    
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

  // Update actual amounts for a budget item
  async updateActualAmounts(budgetItemId, amounts) {
    const { data, error } = await supabase
      .from('budget_items')
      .update({ actual_amounts: amounts })
      .eq('id', budgetItemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Month closure functions
  async closeMonth(userId, year, month) {
    const { data, error } = await supabase
      .from('closed_months')
      .insert({
        user_id: userId,
        year: year,
        month: month,
        closed_by: userId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getClosedMonths(userId, year) {
    const { data, error } = await supabase
      .from('closed_months')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true })
    
    if (error) throw error
    return data
  },

  async isMonthClosed(userId, year, month) {
    const { data, error } = await supabase
      .from('closed_months')
      .select('id')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return !!data
  },

  async autoCloseMonth(userId, year, month) {
    // Check if month is already closed
    const isClosed = await this.isMonthClosed(userId, year, month)
    if (isClosed) return null
    
    // Close the month
    return await this.closeMonth(userId, year, month)
  },

  // Check and auto-close months that should be closed
  async checkAndAutoCloseMonths(userId) {
    try {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const currentDay = currentDate.getDate()
      
      // Only auto-close if we're 7+ days into the new month
      if (currentDay >= 7) {
        // Calculate the previous month that should be auto-closed
        let previousMonth, previousYear
        
        if (currentMonth === 0) {
          // January -> December of previous year
          previousMonth = 11
          previousYear = currentYear - 1
        } else {
          // Other months -> previous month of same year
          previousMonth = currentMonth - 1
          previousYear = currentYear
        }
        
        // Check if the previous month should be auto-closed
        const isClosed = await this.isMonthClosed(userId, previousYear, previousMonth)
        if (!isClosed) {
          console.log(`API: Auto-closing month ${previousMonth}/${previousYear} for user ${userId}`)
          await this.autoCloseMonth(userId, previousYear, previousMonth)
          
          // Return info about the auto-closed month for notification
          return {
            year: previousYear,
            month: previousMonth,
            autoClosed: true
          }
        }
      }
      
      return { autoClosed: false }
    } catch (error) {
      console.error('Error in checkAndAutoCloseMonths:', error)
      // Don't throw error to prevent blocking the main request
      return { autoClosed: false, error: error.message }
    }
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
        ),
        accounts (
          id,
          name,
          type,
          balance,
          credit_limit,
          is_default
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
        ),
        accounts (
          id,
          name,
          type,
          balance,
          credit_limit,
          is_default
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
        ),
        accounts (
          id,
          name,
          type,
          balance,
          credit_limit,
          is_default
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
      totalInvestments: 0,
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
        case 'investment':
          stats.totalInvestments += amount
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

// Account API
export const accountAPI = {
  // Get all accounts for a user
  async getAccounts(userId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('name')
    
    if (error) throw error
    return data
  },

  // Create a new account
  async createAccount(account) {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update an account
  async updateAccount(id, updates) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete an account
  async deleteAccount(id) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get account by ID
  async getAccountById(id) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Check if account has transactions (for deletion validation)
  async checkAccountTransactions(accountId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', accountId)
      .limit(1)
    
    return { data, error }
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

// Real-time subscriptions for accounts
export const subscribeToAccountChanges = (userId, callback) => {
  return supabase
    .channel('account_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'accounts',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
} 