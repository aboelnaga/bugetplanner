import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionAPI, subscribeToTransactionChanges } from '@/lib/supabase.js'
import { useAuthStore } from './auth.js'

export const useTransactionStore = defineStore('transactions', () => {
  const authStore = useAuthStore()
  
  // State
  const transactions = ref([])
  const transactionStats = ref({
    totalIncome: 0,
    totalExpenses: 0,
    totalTransfers: 0,
    netAmount: 0,
    categoryBreakdown: {},
    typeBreakdown: {}
  })
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear())
  const selectedMonth = ref(null) // null means all months
  
  // Separate loading states for different operations
  const addLoading = ref(false)
  const editLoading = ref(false)
  const deleteLoading = ref(false)
  const statsLoading = ref(false)

  // Computed properties
  const currentYear = computed(() => new Date().getFullYear())
  const currentMonth = computed(() => new Date().getMonth())

  // Get transactions for selected year and month
  const fetchTransactions = async (year = selectedYear.value, month = selectedMonth.value) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      transactions.value = []
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('Store: Fetching transactions for user:', authStore.userId, 'year:', year, 'month:', month)
      const data = await transactionAPI.getTransactions(authStore.userId, year, month)
      console.log('Store: Fetched transactions:', data)
      
      transactions.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching transactions:', err)
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  // Get transaction statistics
  const fetchTransactionStats = async (year = selectedYear.value, month = selectedMonth.value) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netAmount: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      }
      return
    }
    
    try {
      statsLoading.value = true
      error.value = null
      
      console.log('Store: Fetching transaction stats for user:', authStore.userId, 'year:', year, 'month:', month)
      const data = await transactionAPI.getTransactionStats(authStore.userId, year, month)
      console.log('Store: Fetched transaction stats:', data)
      
      transactionStats.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching transaction stats:', err)
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netAmount: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      }
    } finally {
      statsLoading.value = false
    }
  }

  // Add new transaction
  const addTransaction = async (transactionData) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null
    
    try {
      addLoading.value = true
      error.value = null
      
      // Prepare transaction data
      const transaction = {
        ...transactionData,
        user_id: authStore.userId,
        year: new Date(transactionData.date).getFullYear(),
        month: new Date(transactionData.date).getMonth()
      }
      
      console.log('Store: Creating transaction with data:', transaction)
      const data = await transactionAPI.createTransaction(transaction)
      console.log('Store: API returned data:', data)
      
      // Add to local state immediately
      transactions.value.unshift(data)
      
      // Refresh stats
      await fetchTransactionStats()
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error adding transaction:', err)
      return null
    } finally {
      addLoading.value = false
    }
  }

  // Update transaction
  const updateTransaction = async (id, updates) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      editLoading.value = true
      error.value = null
      
      // Update year and month if date changed
      if (updates.date) {
        updates.year = new Date(updates.date).getFullYear()
        updates.month = new Date(updates.date).getMonth()
      }
      
      const data = await transactionAPI.updateTransaction(id, updates)
      
      // Update local state immediately
      const index = transactions.value.findIndex(item => item.id === id)
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...data }
      }
      
      // Refresh stats
      await fetchTransactionStats()
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating transaction:', err)
      return false
    } finally {
      editLoading.value = false
    }
  }

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      deleteLoading.value = true
      error.value = null
      
      await transactionAPI.deleteTransaction(id)
      
      // Remove from local state immediately
      transactions.value = transactions.value.filter(item => item.id !== id)
      
      // Refresh stats
      await fetchTransactionStats()
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting transaction:', err)
      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // Get transactions by budget item
  const getTransactionsByBudgetItem = async (budgetItemId, year = null) => {
    if (!authStore.isAuthenticated || !authStore.userId) return []
    
    try {
      const data = await transactionAPI.getTransactionsByBudgetItem(authStore.userId, budgetItemId, year)
      return data || []
    } catch (err) {
      console.error('Error fetching transactions by budget item:', err)
      return []
    }
  }

  // Filter transactions by type
  const getTransactionsByType = (type) => {
    return transactions.value.filter(transaction => transaction.type === type)
  }

  // Filter transactions by category
  const getTransactionsByCategory = (category) => {
    return transactions.value.filter(transaction => transaction.category === category)
  }

  // Get transactions for a specific date range
  const getTransactionsByDateRange = (startDate, endDate) => {
    return transactions.value.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // Initialize store
  const initialize = async () => {
    console.log('Store: Initializing, auth status:', authStore.isAuthenticated, 'userId:', authStore.userId)
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchTransactions()
      await fetchTransactionStats()
    } else {
      // Clear data when not authenticated
      transactions.value = []
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netAmount: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      }
      error.value = null
    }
  }

  // Watch for authentication changes
  const watchAuth = () => {
    if (authStore.isAuthenticated && authStore.userId) {
      initialize()
    } else {
      // Clear data when user logs out
      transactions.value = []
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netAmount: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      }
      error.value = null
    }
  }

  return {
    // State
    transactions,
    transactionStats,
    loading,
    error,
    selectedYear,
    selectedMonth,
    
    // Loading states
    addLoading,
    editLoading,
    deleteLoading,
    statsLoading,
    
    // Computed
    currentYear,
    currentMonth,
    
    // Actions
    fetchTransactions,
    fetchTransactionStats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByBudgetItem,
    getTransactionsByType,
    getTransactionsByCategory,
    getTransactionsByDateRange,
    initialize,
    watchAuth
  }
}) 