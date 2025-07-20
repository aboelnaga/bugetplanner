import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountAPI, subscribeToAccountChanges } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useAccountsStore = defineStore('accounts', () => {
  const authStore = useAuthStore()
  
  // State
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const defaultAccount = computed(() => 
    accounts.value.find(account => account.is_default)
  )

  const accountsByType = computed(() => {
    const grouped = {}
    accounts.value.forEach(account => {
      if (!grouped[account.type]) {
        grouped[account.type] = []
      }
      grouped[account.type].push(account)
    })
    return grouped
  })

  const totalBalance = computed(() => 
    accounts.value.reduce((total, account) => {
      if (account.type === 'credit_card') {
        // For credit cards, show available credit (credit_limit - balance)
        return total + (account.credit_limit || 0) - account.balance
      }
      return total + account.balance
    }, 0)
  )

  const getAccountById = computed(() => (id) => 
    accounts.value.find(account => account.id === id)
  )

  const getAccountByName = computed(() => (name) => 
    accounts.value.find(account => account.name === name)
  )

  // Actions
  const fetchAccounts = async () => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      accounts.value = []
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const data = await accountAPI.getAccounts(authStore.userId)
      accounts.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching accounts:', err)
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (accountData) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null
    
    loading.value = true
    error.value = null
    
    try {
      const data = await accountAPI.createAccount({
        ...accountData,
        user_id: authStore.userId
      })
      
      accounts.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      // If we're setting this account as default, unset all other accounts first
      if (updates.is_default === true) {
        for (const account of accounts.value) {
          if (account.is_default && account.id !== id) {
            await accountAPI.updateAccount(account.id, { is_default: false })
            // Update local state
            const index = accounts.value.findIndex(acc => acc.id === account.id)
            if (index !== -1) {
              accounts.value[index] = { ...accounts.value[index], is_default: false }
            }
          }
        }
      }
      
      const data = await accountAPI.updateAccount(id, updates)
      
      const index = accounts.value.findIndex(account => account.id === id)
      if (index !== -1) {
        accounts.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      // Check if account has transactions
      const { data: transactions, error: checkError } = await accountAPI.checkAccountTransactions(id)

      if (checkError) throw checkError
      
      if (transactions && transactions.length > 0) {
        throw new Error('Cannot delete account with existing transactions')
      }

      await accountAPI.deleteAccount(id)
      accounts.value = accounts.value.filter(account => account.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setDefaultAccount = async (id) => {
    try {
      // First, set all accounts to not default
      for (const account of accounts.value) {
        if (account.is_default && account.id !== id) {
          await accountAPI.updateAccount(account.id, { is_default: false })
          // Update local state
          const index = accounts.value.findIndex(acc => acc.id === account.id)
          if (index !== -1) {
            accounts.value[index] = { ...accounts.value[index], is_default: false }
          }
        }
      }
      
      // Then set the selected account as default
      await updateAccount(id, { is_default: true })
    } catch (err) {
      console.error('Error setting default account:', err)
      throw err
    }
  }

  const updateAccountBalance = async (id, newBalance) => {
    try {
      await updateAccount(id, { balance: newBalance })
    } catch (err) {
      console.error('Error updating account balance:', err)
      throw err
    }
  }

  const getAvailableCredit = (accountId) => {
    const account = getAccountById.value(accountId)
    if (!account || account.type !== 'credit_card') return null
    
    return (account.credit_limit || 0) - account.balance
  }

  const formatBalance = (balance, type = 'checking') => {
    if (type === 'credit_card') {
      const available = getAvailableCredit(balance)
      return available !== null ? available : balance
    }
    return balance
  }

  const getAccountIcon = (type) => {
    const icons = {
      checking: '🏦',
      savings: '💰',
      credit_card: '💳',
      cash: '💵'
    }
    return icons[type] || '🏦'
  }

  const getAccountColor = (type) => {
    const colors = {
      checking: 'text-blue-600',
      savings: 'text-green-600',
      credit_card: 'text-purple-600',
      cash: 'text-yellow-600'
    }
    return colors[type] || 'text-gray-600'
  }

  // Initialize store
  const initialize = async () => {
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchAccounts()
    } else {
      accounts.value = []
      error.value = null
    }
  }

  // Watch for authentication changes
  const watchAuth = () => {
    if (authStore.isAuthenticated && authStore.userId) {
      initialize()
    } else {
      accounts.value = []
      error.value = null
    }
  }

  return {
    // State
    accounts,
    loading,
    error,
    
    // Getters
    defaultAccount,
    accountsByType,
    totalBalance,
    getAccountById,
    getAccountByName,
    
    // Actions
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    updateAccountBalance,
    getAvailableCredit,
    formatBalance,
    getAccountIcon,
    getAccountColor,
    initialize,
    watchAuth
  }
}) 