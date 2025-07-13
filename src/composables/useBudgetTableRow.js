// Budget table row composable
// Row styling, type logic, and cell formatting

import { computed } from 'vue'
import { BUDGET_TYPE_STYLES, TABLE_CELL_STYLES, ACTION_BUTTONS } from '@/constants/budgetConstants.js'
import { tableUtils } from '@/utils/budgetUtils.js'

export function useBudgetTableRow(budget) {
  // Get budget type label
  const budgetTypeLabel = computed(() => {
    return tableUtils.getBudgetTypeLabel(budget.value)
  })

  // Check if budget is income type (including investment incoming)
  const isIncomeType = computed(() => {
    return budget.value.type === 'income' || 
           (budget.value.type === 'investment' && budget.value.investment_direction === 'incoming')
  })

  // Get type badge classes
  const getTypeBadgeClasses = () => {
    const baseClasses = 'ml-2 px-2 py-1 text-xs rounded-full flex items-center'
    return isIncomeType.value 
      ? `${baseClasses} ${BUDGET_TYPE_STYLES.INCOME.bgColor} ${BUDGET_TYPE_STYLES.INCOME.textColor}`
      : `${baseClasses} ${BUDGET_TYPE_STYLES.EXPENSE.bgColor} ${BUDGET_TYPE_STYLES.EXPENSE.textColor}`
  }

  // Get monthly cell classes
  const getMonthlyCellClasses = (selectedYear, currentYear, currentMonth, monthIndex, isScheduledMonth, getBudgetAmount) => {
    return tableUtils.getMonthlyAmountCellClasses(
      budget.value,
      selectedYear,
      currentYear,
      currentMonth,
      monthIndex,
      isScheduledMonth,
      getBudgetAmount
    )
  }

  // Get yearly total cell classes
  const getYearlyTotalCellClasses = (calculateYearlyTotal) => {
    return tableUtils.getYearlyTotalCellClasses(budget.value, calculateYearlyTotal)
  }

  // Format amount with sign
  const formatAmountWithSign = (amount, formatCurrency) => {
    return tableUtils.formatAmountWithSign(amount, budget.value, formatCurrency)
  }

  // Get action button configuration
  const getActionButtonConfig = (actionType) => {
    return ACTION_BUTTONS[actionType] || {}
  }

  // Check if start month should be shown
  const shouldShowStartMonth = (months) => {
    return budget.value.startMonth && 
           budget.value.startMonth > 0 && 
           budget.value.startMonth < months.length
  }

  return {
    // Budget type information
    budgetTypeLabel,
    isIncomeType,
    
    // Styling functions
    getTypeBadgeClasses,
    getMonthlyCellClasses,
    getYearlyTotalCellClasses,
    formatAmountWithSign,
    getActionButtonConfig,
    
    // Utility functions
    shouldShowStartMonth
  }
} 