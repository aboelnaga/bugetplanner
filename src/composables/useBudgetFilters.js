// Budget filters composable
// Filter logic and computed properties, category and type filtering, search functionality

import { computed, ref } from 'vue'
import { BUDGET_TYPES, FILTER_OPTIONS } from '@/constants/budgetConstants.js'

export function useBudgetFilters (budgetItems, budgetStore) {
  // Filter state
  const selectedTypeFilter = ref(FILTER_OPTIONS.ALL)
  const selectedCategoryFilter = ref(FILTER_OPTIONS.ALL)
  const groupByCategory = ref(false)

  // Computed properties for quick stats
  const incomeCount = computed(() => {
    return (budgetItems.value || []).filter(b => b && b.type === BUDGET_TYPES.INCOME).length
  })

  const expenseCount = computed(() => {
    return (budgetItems.value || []).filter(b => b && b.type === BUDGET_TYPES.EXPENSE).length
  })

  const investmentCount = computed(() => {
    return (budgetItems.value || []).filter(b => b && b.type === BUDGET_TYPES.INVESTMENT).length
  })

  const totalCount = computed(() => {
    return (budgetItems.value || []).filter(b => b).length
  })

  // Category management
  const uniqueCategories = computed(() => {
    const categories = new Set()
    ;(budgetItems.value || []).forEach(item => {
      if (item && item.category) {
        categories.add(item.category)
      }
    })
    return Array.from(categories).sort()
  })

  // Filtered budget items
  const filteredBudgetItems = computed(() => {
    return budgetItems.value.filter(item => {
      if (!item) return false
      const typeMatches = selectedTypeFilter.value === FILTER_OPTIONS.ALL || item.type === selectedTypeFilter.value
      const categoryMatches = selectedCategoryFilter.value === FILTER_OPTIONS.ALL || item.category === selectedCategoryFilter.value
      return typeMatches && categoryMatches
    })
  })

  // Grouped budget items
  const groupedBudgetItems = computed(() => {
    if (!groupByCategory.value) return {}

    const grouped = {}
    filteredBudgetItems.value.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })

    // Sort categories alphabetically
    const sortedGrouped = {}
    Object.keys(grouped).sort().forEach(key => {
      sortedGrouped[key] = grouped[key]
    })

    return sortedGrouped
  })

  // Data availability checks
  const hasIncomeData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === BUDGET_TYPES.INCOME)
  })

  const hasExpenseData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === BUDGET_TYPES.EXPENSE)
  })

  const hasInvestmentIncomingData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === BUDGET_TYPES.INVESTMENT && item.investment_direction === 'incoming')
  })

  const hasInvestmentOutgoingData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === BUDGET_TYPES.INVESTMENT && item.investment_direction === 'outgoing')
  })

  const hasInvestmentData = computed(() => {
    return hasInvestmentIncomingData.value || hasInvestmentOutgoingData.value
  })

  const hasAnyData = computed(() => {
    return hasIncomeData.value || hasExpenseData.value || hasInvestmentData.value
  })

  // Filter actions
  const clearAllFilters = () => {
    selectedTypeFilter.value = FILTER_OPTIONS.ALL
    selectedCategoryFilter.value = FILTER_OPTIONS.ALL
  }

  const toggleGroupByCategory = () => {
    groupByCategory.value = !groupByCategory.value
  }

  // Category type determination
  const getCategoryType = (categoryItems) => {
    // Determine the predominant type in the category
    if (categoryItems.length === 0) return BUDGET_TYPES.EXPENSE

    const typeCounts = categoryItems.reduce((counts, item) => {
      const key = item.type === BUDGET_TYPES.INVESTMENT
        ? `${item.type}-${item.investment_direction}`
        : item.type
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})

    // Return the most common type
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    )

    return mostCommonType
  }

  return {
    // State
    selectedTypeFilter,
    selectedCategoryFilter,
    groupByCategory,

    // Computed properties
    incomeCount,
    expenseCount,
    investmentCount,
    totalCount,
    uniqueCategories,
    filteredBudgetItems,
    groupedBudgetItems,
    hasIncomeData,
    hasExpenseData,
    hasInvestmentIncomingData,
    hasInvestmentOutgoingData,
    hasInvestmentData,
    hasAnyData,

    // Actions
    clearAllFilters,
    toggleGroupByCategory,
    getCategoryType
  }
}