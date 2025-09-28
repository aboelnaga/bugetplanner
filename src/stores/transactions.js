import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  transactionAPI,
  budgetAPI,
  subscribeToTransactionChanges
} from '@/lib/supabase.js'
import { useAuthStore } from './auth.js'

export const useTransactionStore = defineStore('transactions', () => {
  const authStore = useAuthStore()

  // State
  const transactions = ref([])
  const transactionStats = ref({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
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
  const fetchTransactions = async (
    year = selectedYear.value,
    month = selectedMonth.value
  ) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      transactions.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      console.log(
        'Store: Fetching transactions for user:',
        authStore.userId,
        'year:',
        year,
        'month:',
        month
      )
      const data = await transactionAPI.getTransactions(
        authStore.userId,
        year,
        month
      )
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
  const fetchTransactionStats = async (
    year = selectedYear.value,
    month = selectedMonth.value
  ) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalInvestments: 0,
        netAmount: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      }
      return
    }

    try {
      statsLoading.value = true
      error.value = null

      console.log(
        'Store: Fetching transaction stats for user:',
        authStore.userId,
        'year:',
        year,
        'month:',
        month
      )
      const data = await transactionAPI.getTransactionStats(
        authStore.userId,
        year,
        month
      )
      console.log('Store: Fetched transaction stats:', data)

      transactionStats.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching transaction stats:', err)
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalInvestments: 0,
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

      // Update budget item actual amounts if linked
      if (data.budget_item_id) {
        await updateBudgetItemActuals(
          data.budget_item_id,
          data.amount,
          'add',
          data.date
        )
      }

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

      // Get the original transaction to calculate the difference
      const originalTransaction = transactions.value.find((t) => t.id === id)
      if (!originalTransaction) return false

      // Update year and month if date changed
      if (updates.date) {
        updates.year = new Date(updates.date).getFullYear()
        updates.month = new Date(updates.date).getMonth()
      }

      const data = await transactionAPI.updateTransaction(id, updates)

      // Update local state immediately
      const index = transactions.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...data }
      }

      // Update budget item actual amounts if linked
      if (data.budget_item_id) {
        // Remove old amount from old month
        if (originalTransaction.budget_item_id === data.budget_item_id) {
          // Same budget item, just update the amount difference
          const amountDiff = data.amount - originalTransaction.amount
          if (amountDiff !== 0) {
            await updateBudgetItemActuals(
              data.budget_item_id,
              Math.abs(amountDiff),
              amountDiff > 0 ? 'add' : 'delete',
              data.date
            )
          }
        } else {
          // Different budget item - remove from old, add to new
          await updateBudgetItemActuals(
            originalTransaction.budget_item_id,
            originalTransaction.amount,
            'delete',
            originalTransaction.date
          )
          await updateBudgetItemActuals(
            data.budget_item_id,
            data.amount,
            'add',
            data.date
          )
        }
      } else if (originalTransaction.budget_item_id) {
        // Transaction unlinked from budget item
        await updateBudgetItemActuals(
          originalTransaction.budget_item_id,
          originalTransaction.amount,
          'delete',
          originalTransaction.date
        )
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

      // Get the transaction before deleting to update budget actuals
      const transaction = transactions.value.find((t) => t.id === id)

      await transactionAPI.deleteTransaction(id)

      // Remove from local state immediately
      transactions.value = transactions.value.filter((item) => item.id !== id)

      // Update budget item actual amounts if linked
      if (transaction && transaction.budget_item_id) {
        await updateBudgetItemActuals(
          transaction.budget_item_id,
          transaction.amount,
          'delete',
          transaction.date
        )
      }

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
      const data = await transactionAPI.getTransactionsByBudgetItem(
        authStore.userId,
        budgetItemId,
        year
      )
      return data || []
    } catch (err) {
      console.error('Error fetching transactions by budget item:', err)
      return []
    }
  }

  // Filter transactions by type
  const getTransactionsByType = (type) => {
    return transactions.value.filter(
      (transaction) => transaction.type === type
    )
  }

  // Filter transactions by category
  const getTransactionsByCategory = (category) => {
    return transactions.value.filter(
      (transaction) => transaction.category === category
    )
  }

  // Get transactions for a specific date range
  const getTransactionsByDateRange = (startDate, endDate) => {
    return transactions.value.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // Get recent transactions by account
  const getRecentTransactionsByAccount = (accountId, limit = 5) => {
    return transactions.value
      .filter((transaction) => transaction.account_id === accountId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
  }

  // Update budget item actual amounts when transactions change
  const updateBudgetItemActuals = async (
    budgetItemId,
    amount,
    operation = 'add',
    date = null
  ) => {
    try {
      // Get current budget item
      const budgetItem = await budgetAPI.getBudgetItem(budgetItemId)
      if (!budgetItem) return

      const month = date ? new Date(date).getMonth() : new Date().getMonth()
      const newAmounts = [
        ...(budgetItem.actual_amounts || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      ]

      // Update the specific month
      switch (operation) {
        case 'add':
          newAmounts[month] = (newAmounts[month] || 0) + amount
          break
        case 'update':
          // For updates, we need the old amount - this will be handled in updateTransaction
          break
        case 'delete':
          newAmounts[month] = Math.max(0, (newAmounts[month] || 0) - amount)
          break
      }

      // Update the budget item
      await budgetAPI.updateActualAmounts(budgetItemId, newAmounts)
    } catch (error) {
      console.error('Error updating budget item actual amounts:', error)
    }
  }

  // Initialize store
  const initialize = async () => {
    console.log(
      'Store: Initializing, auth status:',
      authStore.isAuthenticated,
      'userId:',
      authStore.userId
    )
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchTransactions()
      await fetchTransactionStats()
    } else {
      // Clear data when not authenticated
      transactions.value = []
      transactionStats.value = {
        totalIncome: 0,
        totalExpenses: 0,
        totalInvestments: 0,
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
        totalInvestments: 0,
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
    getRecentTransactionsByAccount,
    initialize,
    watchAuth
  }
})
