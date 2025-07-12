import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

  // Update monthly amounts
  async updateMonthlyAmount(userId, budgetItemId, monthIndex, amount) {
    const { data, error } = await supabase
      .from('budget_amounts')
      .upsert({
        budget_item_id: budgetItemId,
        month_index: monthIndex,
        amount: amount,
        is_modified: true
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get budget history
  async getBudgetHistory(userId, year) {
    const { data, error } = await supabase
      .from('budget_history')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('changed_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get monthly amounts for a budget item
  async getMonthlyAmounts(userId, year) {
    const { data, error } = await supabase
      .from('budget_amounts')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month_index', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Create monthly amounts for a budget item
  async createMonthlyAmounts(userId, monthlyData) {
    const { data, error } = await supabase
      .from('budget_amounts')
      .insert(monthlyData)
      .select()
    
    if (error) throw error
    return data
  },

  // Delete monthly amounts for a budget item
  async deleteMonthlyAmounts(userId, budgetId) {
    const { error } = await supabase
      .from('budget_amounts')
      .delete()
      .eq('budget_item_id', budgetId)
    
    if (error) throw error
  },

  // Create budget history entry
  async createBudgetHistory(userId, historyData) {
    const { data, error } = await supabase
      .from('budget_history')
      .insert(historyData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

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