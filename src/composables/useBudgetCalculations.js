// Budget calculations composable
// All calculation functions: monthly totals, yearly totals, investment calculations, grand totals

import { BUDGET_TYPES } from '@/constants/budgetConstants.js'

export function useBudgetCalculations(budgetItems, budgetStore) {
  // Basic budget amount calculations
  const isScheduledMonth = (budget, monthIndex) => {
    if (!budget || !budget.schedule) return false
    return budget.schedule.includes(monthIndex) || false
  }

  const getBudgetAmount = (budget, monthIndex) => {
    if (!budget || !budget.amounts || !Array.isArray(budget.amounts)) return 0
    return parseFloat(budget.amounts[monthIndex]) || 0
  }

  const hasChanges = (budgetId, monthIndex) => {
    // History functionality commented out
    return false
    // if (!budgetId) return false
    // // Check if this month/budget combination has been modified
    // return budgetStore.budgetHistory?.some(change => 
    //   change.budgetId === budgetId && 
    //   change.monthIndex === monthIndex
    // ) || false
  }

  // Yearly total calculations
  const calculateYearlyTotal = (budget) => {
    if (!budget || !budget.amounts) return 0
    const total = budget.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    return budget.type === BUDGET_TYPES.INCOME ? total : total
  }

  // Monthly total calculations - these now work with the reactive budgetItems
  const calculateMonthlyTotal = (monthIndex) => {
    const income = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
    
    const expenses = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
    
    return income - expenses
  }

  const calculateMonthlyIncome = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyExpenses = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentIncoming = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentOutgoing = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentNet = (monthIndex) => {
    return calculateMonthlyInvestmentIncoming(monthIndex) - calculateMonthlyInvestmentOutgoing(monthIndex)
  }

  // Grand total calculations - these now work with the reactive budgetItems
  const calculateGrandTotal = () => {
    return calculateGrandTotalIncome() + calculateGrandTotalInvestmentIncoming() - calculateGrandTotalExpenses() - calculateGrandTotalInvestmentOutgoing()
  }

  const calculateGrandTotalIncome = () => {
    return budgetItems.value.reduce((total, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalExpenses = () => {
    return budgetItems.value.reduce((total, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentIncoming = () => {
    return budgetItems.value.reduce((total, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentOutgoing = () => {
    return budgetItems.value.reduce((total, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentNet = () => {
    return calculateGrandTotalInvestmentIncoming() - calculateGrandTotalInvestmentOutgoing()
  }

  // Category calculations
  const calculateCategoryTotal = (categoryItems) => {
    return categoryItems.reduce((total, item) => {
      return total + calculateYearlyTotal(item)
    }, 0)
  }

  const calculateCategoryMonthlyTotal = (categoryItems, monthIndex) => {
    return categoryItems.reduce((total, item) => {
      return total + (parseFloat(item.amounts[monthIndex]) || 0)
    }, 0)
  }

  // Budget amount updates
  const updateBudgetAmount = async (budgetId, monthIndex, newValue) => {
    const budget = budgetItems.value.find(b => b.id === budgetId)
    if (!budget) return
    
    const oldValue = budget.amounts[monthIndex]
    const numericOldValue = parseFloat(oldValue) || 0
    const numericNewValue = parseFloat(newValue) || 0
    
    // Only proceed if the values are actually different
    if (numericOldValue !== numericNewValue) {
      // Update via store
      await budgetStore.updateMonthlyAmount(budgetId, monthIndex, numericNewValue)
    }
  }

  return {
    // Basic calculations
    isScheduledMonth,
    getBudgetAmount,
    hasChanges,
    calculateYearlyTotal,
    
    // Monthly calculations
    calculateMonthlyTotal,
    calculateMonthlyIncome,
    calculateMonthlyExpenses,
    calculateMonthlyInvestmentIncoming,
    calculateMonthlyInvestmentOutgoing,
    calculateMonthlyInvestmentNet,
    
    // Grand total calculations
    calculateGrandTotal,
    calculateGrandTotalIncome,
    calculateGrandTotalExpenses,
    calculateGrandTotalInvestmentIncoming,
    calculateGrandTotalInvestmentOutgoing,
    calculateGrandTotalInvestmentNet,
    
    // Category calculations
    calculateCategoryTotal,
    calculateCategoryMonthlyTotal,
    
    // Budget updates
    updateBudgetAmount
  }
} 