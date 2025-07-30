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
  async getBudgetItems(userId, year, includePreviousYear = false) {
    console.log('API: Getting budget items for user:', userId, 'year:', year, 'includePreviousYear:', includePreviousYear)
    
    // Check and auto-close months if needed
    const autoCloseResult = await this.checkAndAutoCloseMonths(userId)
    
    // Get current year budget items
    const { data: currentYearData, error: currentYearError } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('created_at', { ascending: true })
    
    if (currentYearError) throw currentYearError
    
    let previousYearData = null
    
    // Only fetch previous year items if requested
    if (includePreviousYear) {
      const previousYear = year - 1
      const { data: prevYearData, error: previousYearError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', userId)
        .eq('year', previousYear)
        .order('created_at', { ascending: true })
      
      if (previousYearError) throw previousYearError
      previousYearData = prevYearData
    }
    
    // For now, just return current year items to avoid confusion
    // Multi-year items will be shown when viewing their specific years
    const allBudgetItems = currentYearData || []
    
    console.log('API: Supabase response for getBudgetItems:', { 
      currentYearData, 
      previousYearData, 
      allBudgetItems,
      includePreviousYear
    })
    
    // Return current year items, previous year items (if requested), and auto-close result
    return {
      budgetItems: allBudgetItems,
      previousYearItems: previousYearData || [],
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
  async getTransactions(userId, year, month = null, investmentId = null) {
    console.log('API: Getting transactions for user:', userId, 'year:', year, 'month:', month, 'investmentId:', investmentId)
    
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
        )
      `)
      .eq('user_id', userId)
      .eq('year', year)
      .order('date', { ascending: false })
    
    if (month !== null) {
      query = query.eq('month', month)
    }

    if (investmentId !== null) {
      query = query.eq('linked_investment_id', investmentId)
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
        )
      `)
      .eq('user_id', userId)
      .eq('budget_item_id', budgetItemId)
      .order('date', { ascending: false })
    
    if (year !== null) {
      query = query.eq('year', year)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Get transactions by investment
  async getTransactionsByInvestment(userId, investmentId, year = null) {
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
        )
      `)
      .eq('user_id', userId)
      .eq('linked_investment_id', investmentId)
      .order('date', { ascending: false })
    
    if (year !== null) {
      query = query.eq('year', year)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Link transaction to investment
  async linkTransactionToInvestment(transactionId, investmentId) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ linked_investment_id: investmentId })
      .eq('id', transactionId)
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Unlink transaction from investment
  async unlinkTransactionFromInvestment(transactionId) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ linked_investment_id: null })
      .eq('id', transactionId)
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
        ),
        investment_assets!linked_investment_id (
          id,
          name,
          investment_type,
          purchase_amount,
          current_value
        )
      `)
      .single()
    
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

// Yearly Summaries API
export const yearlySummaryAPI = {
  // Get yearly summary for a specific user and year
  async getYearlySummary(userId, year) {
    const { data, error } = await supabase
      .from('yearly_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Get yearly summaries for a user across multiple years
  async getYearlySummaries(userId, startYear = null, endYear = null) {
    let query = supabase
      .from('yearly_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
    
    if (startYear !== null) {
      query = query.gte('year', startYear)
    }
    
    if (endYear !== null) {
      query = query.lte('year', endYear)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  // Manually recalculate and update yearly summary for a specific year
  async recalculateYearlySummary(userId, year) {
    const { data, error } = await supabase
      .rpc('update_yearly_summary', { user_uuid: userId, target_year: year })
    
    if (error) throw error
    return data
  },

  // Get yearly summary statistics
  async getYearlySummaryStats(userId) {
    const { data, error } = await supabase
      .from('yearly_summaries')
      .select(`
        year, 
        total_income_actual, total_expenses_actual, 
        total_investment_incoming_actual, total_investment_outgoing_actual,
        total_income_planned, total_expenses_planned,
        total_investment_incoming_planned, total_investment_outgoing_planned
      `)
      .eq('user_id', userId)
      .order('year', { ascending: false })
    
    if (error) throw error
    return data || []
  }
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

// Real-time subscriptions for yearly summaries
export const subscribeToYearlySummaryChanges = (userId, callback) => {
  return supabase
    .channel('yearly_summary_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'yearly_summaries',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Investment Assets API
export const investmentAssetsAPI = {
  // Get all investment assets for a user
  async getInvestmentAssets(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        budget_items (
          id,
          name,
          category,
          type,
          investment_direction,
          amounts,
          actual_amounts
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get a single investment asset by ID
  async getInvestmentAsset(assetId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        budget_items!linked_investment_id (
          id,
          name,
          category,
          type,
          investment_direction,
          amounts,
          actual_amounts,
          schedule,
          recurrence,
          default_amount,
          start_month,
          custom_months,
          one_time_month,
          payment_schedule,
          due_date,
          is_fixed_expense,
          reminder_enabled,
          reminder_days_before,
          linked_investment_id,
          year,
          transactions (
            id,
            amount,
            description,
            date,
            month,
            year,
            type,
            budget_item_id,
            account_id
          )
        )
      `)
      .eq('id', assetId)
      .single()
    
    if (error) throw error
    return data
  },

  // Create a new investment asset
  async createInvestmentAsset(asset) {
    // Handle both old 'type' and new 'investment_type' columns during transition
    const assetData = { ...asset }
    
    // If we have investment_type, also set type for backward compatibility
    if (assetData.investment_type && !assetData.type) {
      assetData.type = assetData.investment_type
    }
    
    const { data, error } = await supabase
      .from('investment_assets')
      .insert(assetData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update an investment asset
  async updateInvestmentAsset(id, updates) {
    // Handle both old 'type' and new 'investment_type' columns during transition
    const updateData = { ...updates }
    
    // If we have investment_type, also set type for backward compatibility
    if (updateData.investment_type && !updateData.type) {
      updateData.type = updateData.investment_type
    }
    
    const { data, error } = await supabase
      .from('investment_assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete an investment asset
  async deleteInvestmentAsset(id) {
    const { error } = await supabase
      .from('investment_assets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Link investment asset to budget item
  async linkToBudgetItem(assetId, budgetItemId) {
    const { data, error } = await supabase
      .from('budget_items')
      .update({ linked_investment_id: assetId })
      .eq('id', budgetItemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Unlink investment asset from budget item
  async unlinkFromBudgetItem(assetId) {
    const { data, error } = await supabase
      .from('budget_items')
      .update({ linked_investment_id: null })
      .eq('linked_investment_id', assetId)
      .select()
    
    if (error) throw error
    return data
  },

  // Unlink specific budget item from investment
  async unlinkBudgetItemFromInvestment(budgetItemId) {
    const { data, error } = await supabase
      .from('budget_items')
      .update({ linked_investment_id: null })
      .eq('id', budgetItemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get investment assets by type
  async getInvestmentAssetsByType(userId, investmentType) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('investment_type', investmentType)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get investment assets by status
  async getInvestmentAssetsByStatus(userId, status) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('real_estate_status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Calculate total portfolio value
  async getPortfolioValue(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select('current_value, purchase_amount, status')
      .eq('user_id', userId)
      .in('status', ['active', 'owned', 'finished_installments'])
    
    if (error) throw error
    
    const totalCurrentValue = data.reduce((sum, asset) => sum + (parseFloat(asset.current_value) || 0), 0)
    const totalPurchaseValue = data.reduce((sum, asset) => sum + (parseFloat(asset.purchase_amount) || 0), 0)
    
    return {
      totalCurrentValue,
      totalPurchaseValue,
      totalROI: totalCurrentValue - totalPurchaseValue,
      totalROIPercentage: totalPurchaseValue > 0 ? ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100 : 0
    }
  },

  // Get investment assets with type-specific data
  async getInvestmentAssetsWithDetails(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        budget_items!linked_investment_id (
          id,
          name,
          category,
          type,
          investment_direction,
          amounts,
          actual_amounts,
          schedule,
          recurrence,
          default_amount,
          start_month,
          custom_months,
          one_time_month,
          payment_schedule,
          due_date,
          is_fixed_expense,
          reminder_enabled,
          reminder_days_before,
          linked_investment_id,
          year
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get real estate investments
  async getRealEstateInvestments(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        budget_items!linked_investment_id (
          id,
          name,
          category,
          type,
          investment_direction,
          amounts,
          actual_amounts,
          schedule,
          recurrence,
          default_amount,
          start_month,
          custom_months,
          one_time_month,
          payment_schedule,
          due_date,
          is_fixed_expense,
          reminder_enabled,
          reminder_days_before,
          linked_investment_id,
          year
        )
      `)
      .eq('user_id', userId)
      .eq('investment_type', 'real_estate')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get precious metals investments
  async getPreciousMetalsInvestments(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        budget_items!linked_investment_id (
          id,
          name,
          category,
          type,
          investment_direction,
          amounts,
          actual_amounts,
          schedule,
          recurrence,
          default_amount,
          start_month,
          custom_months,
          one_time_month,
          payment_schedule,
          due_date,
          is_fixed_expense,
          reminder_enabled,
          reminder_days_before,
          linked_investment_id,
          year
        )
      `)
      .eq('user_id', userId)
      .eq('investment_type', 'precious_metals')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get precious metals portfolio summary
  async getPreciousMetalsPortfolio(userId) {
    const { data, error } = await supabase
      .from('investment_assets')
      .select('metal_type, karat, amount, amount_unit, purchase_amount, current_value, status')
      .eq('user_id', userId)
      .eq('investment_type', 'precious_metals')
      .in('status', ['active', 'owned'])
    
    if (error) throw error
    
    // Group by metal type and karat
    const portfolio = {}
    data.forEach(asset => {
      const key = `${asset.metal_type}_${asset.karat}`
      if (!portfolio[key]) {
        portfolio[key] = {
          metal_type: asset.metal_type,
          karat: asset.karat,
          total_amount: 0,
          total_purchase_value: 0,
          total_current_value: 0,
          unit: asset.amount_unit
        }
      }
      
      portfolio[key].total_amount += parseFloat(asset.amount) || 0
      portfolio[key].total_purchase_value += parseFloat(asset.purchase_amount) || 0
      portfolio[key].total_current_value += parseFloat(asset.current_value) || 0
    })
    
    return Object.values(portfolio)
  },

  // Update investment status
  async updateInvestmentStatus(assetId, status) {
    const { data, error } = await supabase
      .from('investment_assets')
      .update({ real_estate_status: status })
      .eq('id', assetId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Add document link to investment
  async addDocumentLink(assetId, documentLink) {
    const { data: asset, error: fetchError } = await supabase
      .from('investment_assets')
      .select('document_links')
      .eq('id', assetId)
      .single()
    
    if (fetchError) throw fetchError
    
    const currentLinks = asset.document_links || []
    const updatedLinks = [...currentLinks, documentLink]
    
    const { data, error } = await supabase
      .from('investment_assets')
      .update({ document_links: updatedLinks })
      .eq('id', assetId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Remove document link from investment
  async removeDocumentLink(assetId, linkIndex) {
    const { data: asset, error: fetchError } = await supabase
      .from('investment_assets')
      .select('document_links')
      .eq('id', assetId)
      .single()
    
    if (fetchError) throw fetchError
    
    const currentLinks = asset.document_links || []
    const updatedLinks = currentLinks.filter((_, index) => index !== linkIndex)
    
    const { data, error } = await supabase
      .from('investment_assets')
      .update({ document_links: updatedLinks })
      .eq('id', assetId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get investment types for dropdown
  async getInvestmentTypes() {
    return [
      { value: 'real_estate', label: 'Real Estate' },
      { value: 'precious_metals', label: 'Precious Metals' },
      { value: 'foreign_currency', label: 'Foreign Currency' },
      { value: 'stocks', label: 'Stocks' },
      { value: 'bonds', label: 'Bonds' },
      { value: 'cryptocurrency', label: 'Cryptocurrency' },
      { value: 'business', label: 'Business' },
      { value: 'other', label: 'Other' }
    ]
  },

  // Get real estate statuses for dropdown
  async getRealEstateStatuses() {
    return [
      { value: 'planned', label: 'Planned' },
      { value: 'paying', label: 'Paying' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'finished_installments', label: 'Finished Installments' },
      { value: 'owned', label: 'Owned' }
    ]
  },

  // Get metal types for dropdown
  async getMetalTypes() {
    return [
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'platinum', label: 'Platinum' },
      { value: 'palladium', label: 'Palladium' },
      { value: 'rhodium', label: 'Rhodium' }
    ]
  },

  // Get karat options for dropdown
  async getKaratOptions() {
    return [
      { value: '24K', label: '24 Karat' },
      { value: '22K', label: '22 Karat' },
      { value: '21K', label: '21 Karat' },
      { value: '18K', label: '18 Karat' },
      { value: '14K', label: '14 Karat' },
      { value: '10K', label: '10 Karat' },
      { value: '9K', label: '9 Karat' }
    ]
  },

  // Get condition options for dropdown
  async getConditionOptions() {
    return [
      { value: 'new', label: 'New' },
      { value: 'used', label: 'Used' }
    ]
  },

  // Get form options for dropdown
  async getFormOptions() {
    return [
      { value: 'bars', label: 'Bars' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'coins', label: 'Coins' },
      { value: 'other', label: 'Other' }
    ]
  },

  // Get purpose options for dropdown
  async getPurposeOptions() {
    return [
      { value: 'investment', label: 'Investment' },
      { value: 'personal_use_for_zakat', label: 'Personal Use (Zakat Calculation)' }
    ]
  },

  // Get amount unit options for dropdown
  async getAmountUnitOptions() {
    return [
      { value: 'grams', label: 'Grams' },
      { value: 'kilograms', label: 'Kilograms' },
      { value: 'ounces', label: 'Ounces' },
      { value: 'pounds', label: 'Pounds' }
    ]
  }
}

export const subscribeToInvestmentAssetChanges = (userId, callback) => {
  return supabase
    .channel('investment_assets_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'investment_assets',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
} 