import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, budgetAPI } from '@/lib/supabase.js'
import { useAuthStore } from './auth.js'
import { useTransactionStore } from './transactions.js'

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useAuthStore()
  const transactionStore = useTransactionStore()
  
  // State
  const budgetItems = ref([])
  const monthlyAmounts = ref([])
  const budgetHistory = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear())
  
  // Separate loading states for different operations
  const addLoading = ref(false)
  const editLoading = ref(false)
  const deleteLoading = ref(false)

  // Computed properties
  const currentYear = computed(() => new Date().getFullYear())
  const currentMonth = computed(() => new Date().getMonth())

  // Get budget items for selected year
  const fetchBudgetItems = async (year = selectedYear.value) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      budgetItems.value = []
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('Store: Fetching budget items for user:', authStore.userId, 'year:', year)
      const data = await budgetAPI.getBudgetItems(authStore.userId, year)
      console.log('Store: Fetched budget items:', data)
      
      budgetItems.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching budget items:', err)
      budgetItems.value = []
    } finally {
      loading.value = false
    }
  }

  // Get monthly amounts for selected year (no longer needed since amounts are in budget_items)
  const fetchMonthlyAmounts = async (year = selectedYear.value) => {
    // This function is kept for compatibility but no longer needed
    monthlyAmounts.value = []
  }

  // Add new budget item
  const addBudgetItem = async (budgetData) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null
    
    try {
      addLoading.value = true
      error.value = null
      
      console.log('Store: Creating budget item with data:', { ...budgetData, user_id: authStore.userId, year: selectedYear.value })
      const data = await budgetAPI.createBudgetItem({
        ...budgetData,
        user_id: authStore.userId,
        year: selectedYear.value
      })
      console.log('Store: API returned data:', data)
      
      // Add to local state immediately - no need for general loading state
      budgetItems.value.push(data)
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error adding budget item:', err)
      return null
    } finally {
      addLoading.value = false
    }
  }

  // Update budget item
  const updateBudgetItem = async (id, updates) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      editLoading.value = true
      error.value = null
      
      // Get the current budget item to compare amounts
      const currentBudget = budgetItems.value.find(item => item.id === id)
      if (!currentBudget) return false
      
      const data = await budgetAPI.updateBudgetItem(id, updates)
      
      // Update local state immediately - no need for general loading state
      const index = budgetItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        budgetItems.value[index] = { ...budgetItems.value[index], ...data }
      }
      
      // Create history entries for any amount changes
      if (updates.amounts && Array.isArray(updates.amounts)) {
        for (let monthIndex = 0; monthIndex < updates.amounts.length; monthIndex++) {
          const oldAmount = currentBudget.amounts[monthIndex] || 0
          const newAmount = updates.amounts[monthIndex] || 0
          
          if (oldAmount !== newAmount) {
            await addBudgetHistory(id, monthIndex, newAmount, oldAmount)
          }
        }
      }
      
      // Refresh history to show the new entries
      await fetchBudgetHistory()
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating budget item:', err)
      return false
    } finally {
      editLoading.value = false
    }
  }

  // Delete budget item
  const deleteBudgetItem = async (id) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      deleteLoading.value = true
      error.value = null
      
      await budgetAPI.deleteBudgetItem(id)
      
      // Remove from local state immediately - no need for general loading state
      budgetItems.value = budgetItems.value.filter(item => item.id !== id)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting budget item:', err)
      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // Update monthly amount
  const updateMonthlyAmount = async (budgetId, monthIndex, amount) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      // Update local state first
      const budget = budgetItems.value.find(b => b.id === budgetId)
      if (!budget) return false
      
      const oldAmount = budget.amounts[monthIndex] || 0
      const numericOldValue = parseFloat(oldAmount) || 0
      const numericNewValue = parseFloat(amount) || 0
      
      // Only proceed if the values are actually different
      if (numericOldValue !== numericNewValue) {
        // Update the amounts array
        const newAmounts = [...budget.amounts]
        newAmounts[monthIndex] = numericNewValue
        
        // Update in database
        await budgetAPI.updateBudgetItem(budgetId, {
          amounts: newAmounts
        })
        
        // Update local state
        budget.amounts[monthIndex] = numericNewValue
        
        // Add to history
        await addBudgetHistory(budgetId, monthIndex, numericNewValue)
      }
      
      return true
    } catch (err) {
      console.error('Error updating monthly amount:', err)
      return false
    }
  }

  // These functions are no longer needed since amounts are stored directly in budget_items

  // Add budget history entry
  const addBudgetHistory = async (budgetId, monthIndex, newAmount, oldAmount = null) => {
    if (!authStore.isAuthenticated || !authStore.userId) return
    
    try {
      // If oldAmount is not provided, get it from the current budget
      if (oldAmount === null) {
        const budget = budgetItems.value.find(b => b.id === budgetId)
        if (!budget) return
        oldAmount = budget.amounts[monthIndex] || 0
      }
      
      if (oldAmount !== newAmount) {
        await budgetAPI.createBudgetHistory(authStore.userId, {
          budget_item_id: budgetId,
          month_index: monthIndex,
          old_amount: oldAmount,
          new_amount: newAmount,
          user_id: authStore.userId
        })
      }
    } catch (err) {
      console.error('Error adding budget history:', err)
    }
  }

  // Fetch budget history
  const fetchBudgetHistory = async () => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      budgetHistory.value = []
      return
    }
    
    try {
      const data = await budgetAPI.getBudgetHistory(authStore.userId, selectedYear.value)
      
      budgetHistory.value = data || []
    } catch (err) {
      console.error('Error fetching budget history:', err)
      budgetHistory.value = []
    }
  }

  // Copy budget items from previous year
  const copyFromPreviousYear = async (sourceYear, targetYear) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      loading.value = true
      error.value = null
      
      const data = await budgetAPI.copyBudgetItems(authStore.userId, sourceYear, targetYear)
      
      // Refresh current year data
      await fetchBudgetItems(targetYear)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error copying budget items:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Check if a specific year has budget items
  const hasBudgetItemsForYear = async (year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      const data = await budgetAPI.getBudgetItems(authStore.userId, year)
      return data && data.length > 0
    } catch (err) {
      console.error('Error checking budget items for year:', err)
      return false
    }
  }

  // Get budget items for a specific month with transactions
  const getBudgetItemsForMonth = (month, year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return []
    
    // Filter budget items for the specified year
    const yearItems = budgetItems.value.filter(item => item.year === year)
    
    // For now, return all items for the year since we don't have month-specific filtering
    // In the future, we could add month-specific logic based on payment schedules
    return yearItems.map(item => {
      // Get transactions for this budget item
      const itemTransactions = transactionStore?.transactions?.value?.filter(t => 
        t.budget_item_id === item.id
      ) || []
      
      return {
        ...item,
        transactions: itemTransactions
      }
    })
  }

  // Initialize store
  const initialize = async () => {
    console.log('Store: Initializing, auth status:', authStore.isAuthenticated, 'userId:', authStore.userId)
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchBudgetItems()
      await fetchBudgetHistory()
    } else {
      // Clear data when not authenticated
      budgetItems.value = []
      monthlyAmounts.value = []
      budgetHistory.value = []
      error.value = null
    }
  }

  // Watch for authentication changes
  const watchAuth = () => {
    if (authStore.isAuthenticated && authStore.userId) {
      initialize()
    } else {
      // Clear data when user logs out
      budgetItems.value = []
      monthlyAmounts.value = []
      budgetHistory.value = []
      error.value = null
    }
  }

  return {
    // State
    budgetItems,
    monthlyAmounts,
    budgetHistory,
    loading,
    error,
    selectedYear,
    
    // Loading states
    addLoading,
    editLoading,
    deleteLoading,
    
    // Computed
    currentYear,
    currentMonth,
    
    // Actions
    fetchBudgetItems,
    fetchMonthlyAmounts,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateMonthlyAmount,
    addBudgetHistory,
    fetchBudgetHistory,
    copyFromPreviousYear,
    hasBudgetItemsForYear,
    getBudgetItemsForMonth,
    initialize,
    watchAuth,
    addLoading,
    editLoading,
    deleteLoading
  }
}) 