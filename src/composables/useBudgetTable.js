// Budget table composable
// Table state management, empty state logic, and table utilities

import { computed } from 'vue'
import { EMPTY_STATES } from '@/constants/budgetConstants.js'
import { emptyStateUtils, tableUtils } from '@/utils/budgetUtils.js'

export function useBudgetTable(
  loading,
  error,
  budgetItems,
  filteredBudgetItems,
  selectedYear,
  selectedTypeFilter,
  selectedCategoryFilter,
  canCopyFromPreviousYear
) {
  // Determine current table state
  const tableState = computed(() => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (budgetItems.value.length === 0) return 'no-budget-items'
    if (filteredBudgetItems.value.length === 0) return 'no-filtered-results'
    return 'has-data'
  })

  // Get empty state configuration based on current state
  const emptyStateConfig = computed(() => {
    const state = tableState.value
    
    switch (state) {
      case 'loading':
        return EMPTY_STATES.LOADING
      case 'error':
        return {
          ...EMPTY_STATES.ERROR,
          message: error.value
        }
      case 'no-budget-items':
        return {
          ...EMPTY_STATES.NO_BUDGET_ITEMS,
          title: emptyStateUtils.formatEmptyStateTitle(EMPTY_STATES.NO_BUDGET_ITEMS.title, { year: selectedYear.value })
        }
      case 'no-filtered-results':
        return {
          ...EMPTY_STATES.NO_FILTERED_RESULTS,
          message: emptyStateUtils.generateFilteredResultsMessage(
            selectedTypeFilter.value,
            selectedCategoryFilter.value,
            selectedYear.value
          )
        }
      default:
        return null
    }
  })

  // Check if table should show empty state
  const shouldShowEmptyState = computed(() => {
    return tableState.value !== 'has-data'
  })

  // Check if specific empty state should be shown
  const shouldShowLoadingState = computed(() => tableState.value === 'loading')
  const shouldShowErrorState = computed(() => tableState.value === 'error')
  const shouldShowNoBudgetItemsState = computed(() => tableState.value === 'no-budget-items')
  const shouldShowNoFilteredResultsState = computed(() => tableState.value === 'no-filtered-results')

  // Table utility functions
  const getMonthHeaderClasses = (currentYear, currentMonth, monthIndex) => {
    return tableUtils.getMonthHeaderClasses(selectedYear.value, currentYear, currentMonth, monthIndex)
  }

  const getTableContainerClasses = () => {
    return tableUtils.getTableContainerClasses()
  }

  const getTableScrollClasses = () => {
    return tableUtils.getTableScrollClasses()
  }

  return {
    // State management
    tableState,
    emptyStateConfig,
    
    // Empty state checks
    shouldShowEmptyState,
    shouldShowLoadingState,
    shouldShowErrorState,
    shouldShowNoBudgetItemsState,
    shouldShowNoFilteredResultsState,
    
    // Table utilities
    getMonthHeaderClasses,
    getTableContainerClasses,
    getTableScrollClasses
  }
} 