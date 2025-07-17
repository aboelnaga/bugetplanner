// Transaction filters composable
// Filter state management, search functionality, date range filtering

import { ref, computed, watch } from 'vue'
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from '@/constants/budgetConstants.js'

export function useTransactionFilters(transactions, selectedYear, selectedMonth) {
  // Filter state
  const searchQuery = ref('')
  const selectedTypeFilter = ref('all')
  const selectedCategoryFilter = ref('all')
  const selectedDateRange = ref('all') // all, this-month, last-month, this-year, custom
  const customDateStart = ref('')
  const customDateEnd = ref('')
  const selectedBudgetItemFilter = ref('all')
  const selectedAccountFilter = ref('all')
  const showLinkedOnly = ref(false)
  const showUnlinkedOnly = ref(false)

  // Available filter options
  const availableTypes = computed(() => {
    const types = new Set((transactions.value || []).map(t => t.type))
    return Array.from(types).sort()
  })

  const availableCategories = computed(() => {
    const categories = new Set((transactions.value || []).map(t => t.category))
    return Array.from(categories).sort()
  })

  const availableBudgetItems = computed(() => {
    const budgetItems = new Set()
    ;(transactions.value || []).forEach(t => {
      if (t.budget_items) {
        budgetItems.add(t.budget_items.name)
      }
    })
    return Array.from(budgetItems).sort()
  })

  const availableAccounts = computed(() => {
    const accounts = new Set((transactions.value || []).map(t => t.account_name).filter(Boolean))
    return Array.from(accounts).sort()
  })

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  // Filter transactions based on current filters
  const filteredTransactions = computed(() => {
    let filtered = [...(transactions.value || [])]

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.account_name?.toLowerCase().includes(query) ||
        transaction.notes?.toLowerCase().includes(query) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (selectedTypeFilter.value !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedTypeFilter.value)
    }

    // Category filter
    if (selectedCategoryFilter.value !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategoryFilter.value)
    }

    // Date range filter
    if (selectedDateRange.value !== 'all') {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      
      switch (selectedDateRange.value) {
        case 'this-month':
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.date)
            return transactionDate.getFullYear() === currentYear && 
                   transactionDate.getMonth() === currentMonth
          })
          break
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.date)
            return transactionDate.getFullYear() === lastMonthYear && 
                   transactionDate.getMonth() === lastMonth
          })
          break
        case 'this-year':
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.date)
            return transactionDate.getFullYear() === currentYear
          })
          break
        case 'last-year':
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.date)
            return transactionDate.getFullYear() === currentYear - 1
          })
          break
        case 'custom':
          if (customDateStart.value && customDateEnd.value) {
            const startDate = new Date(customDateStart.value)
            const endDate = new Date(customDateEnd.value)
            filtered = filtered.filter(transaction => {
              const transactionDate = new Date(transaction.date)
              return transactionDate >= startDate && transactionDate <= endDate
            })
          }
          break
      }
    }

    // Budget item filter
    if (selectedBudgetItemFilter.value !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.budget_items?.name === selectedBudgetItemFilter.value
      )
    }

    // Account filter
    if (selectedAccountFilter.value !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.account_name === selectedAccountFilter.value
      )
    }

    // Linked/Unlinked filter
    if (showLinkedOnly.value) {
      filtered = filtered.filter(transaction => transaction.budget_item_id !== null)
    } else if (showUnlinkedOnly.value) {
      filtered = filtered.filter(transaction => transaction.budget_item_id === null)
    }

    return filtered
  })

  // Statistics for filtered transactions
  const filteredStats = computed(() => {
    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransfers: 0,
      netAmount: 0,
      count: filteredTransactions.value.length,
      categoryBreakdown: {},
      typeBreakdown: {}
    }

    filteredTransactions.value.forEach(transaction => {
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
  })

  // Reset all filters
  const resetFilters = () => {
    searchQuery.value = ''
    selectedTypeFilter.value = 'all'
    selectedCategoryFilter.value = 'all'
    selectedDateRange.value = 'all'
    customDateStart.value = ''
    customDateEnd.value = ''
    selectedBudgetItemFilter.value = 'all'
    selectedAccountFilter.value = 'all'
    showLinkedOnly.value = false
    showUnlinkedOnly.value = false
  }

  // Clear search
  const clearSearch = () => {
    searchQuery.value = ''
  }

  // Set filters for quick views
  const setQuickFilter = (filterType, value) => {
    resetFilters()
    
    switch (filterType) {
      case 'type':
        selectedTypeFilter.value = value
        break
      case 'category':
        selectedCategoryFilter.value = value
        break
      case 'dateRange':
        selectedDateRange.value = value
        break
      case 'budgetItem':
        selectedBudgetItemFilter.value = value
        break
      case 'account':
        selectedAccountFilter.value = value
        break
      case 'linked':
        showLinkedOnly.value = true
        break
      case 'unlinked':
        showUnlinkedOnly.value = true
        break
    }
  }

  // Watch for year/month changes and adjust date filters
  watch([selectedYear, selectedMonth], ([year, month]) => {
    if (selectedDateRange.value === 'this-month' || selectedDateRange.value === 'last-month') {
      // Keep the filter but it will now apply to the new year/month context
    }
  })

  return {
    // Filter state
    searchQuery,
    selectedTypeFilter,
    selectedCategoryFilter,
    selectedDateRange,
    customDateStart,
    customDateEnd,
    selectedBudgetItemFilter,
    selectedAccountFilter,
    showLinkedOnly,
    showUnlinkedOnly,
    
    // Available options
    availableTypes,
    availableCategories,
    availableBudgetItems,
    availableAccounts,
    dateRangeOptions,
    
    // Computed results
    filteredTransactions,
    filteredStats,
    
    // Actions
    resetFilters,
    clearSearch,
    setQuickFilter
  }
} 