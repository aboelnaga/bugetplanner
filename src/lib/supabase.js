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
    const { data, error } = await supabase
      .from('budget_items')
      .select(`
        *,
        budget_amounts (*)
      `)
      .eq('user_id', userId)
      .eq('year', year)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Create a new budget item
  async createBudgetItem(budgetItem) {
    const { data, error } = await supabase
      .from('budget_items')
      .insert(budgetItem)
      .select()
      .single()
    
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
  async updateMonthlyAmount(budgetItemId, monthIndex, amount) {
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
  async getBudgetHistory(budgetItemId) {
    const { data, error } = await supabase
      .from('budget_history')
      .select('*')
      .eq('budget_item_id', budgetItemId)
      .order('changed_at', { ascending: false })
    
    if (error) throw error
    return data
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