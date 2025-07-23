// Budget calculations composable
// All calculation functions: monthly totals, yearly totals, investment calculations, grand totals

import { BUDGET_TYPES } from '@/constants/budgetConstants.js'

export function useBudgetCalculations(budgetItems, budgetStore, closedMonths = [], currentYear = null, currentMonth = null, selectedYear = null) {
  // Basic budget amount calculations
  const isScheduledMonth = (budget, monthIndex) => {
    if (!budget || !budget.schedule) return false
    return budget.schedule.includes(monthIndex) || false
  }

  const getBudgetAmount = (budget, monthIndex) => {
    if (!budget || !budget.amounts || !Array.isArray(budget.amounts)) return 0
    return parseFloat(budget.amounts[monthIndex]) || 0
  }

  const getActualAmount = (budget, monthIndex) => {
    if (!budget || !budget.actual_amounts || !Array.isArray(budget.actual_amounts)) return 0
    return parseFloat(budget.actual_amounts[monthIndex]) || 0
  }

  // Smart defaults logic - same as BudgetTableRow
  const isMonthClosed = (monthIndex) => {
    // Handle both ref and direct array
    const monthsArray = closedMonths?.value || closedMonths || []
    return monthsArray.some(closedMonth => closedMonth.month === monthIndex)
  }

  const getSmartDefaultAmount = (budget, monthIndex) => {
    const plannedAmount = getBudgetAmount(budget, monthIndex)
    const actualAmount = getActualAmount(budget, monthIndex)
    
    // Previous year: Show actual amounts (for comparison)
    if (selectedYear < currentYear) {
      return actualAmount
    }
    
    // Closed months: Show actual amounts
    if (isMonthClosed(monthIndex)) {
      return actualAmount
    }
    
    // Current month: Show max(actual, planned)
    if (selectedYear === currentYear && monthIndex === currentMonth) {
      return Math.max(actualAmount, plannedAmount)
    }
    
    // Future months: Show planned amounts (not max)
    if (selectedYear > currentYear || 
        (selectedYear === currentYear && monthIndex > currentMonth)) {
      return plannedAmount
    }
    
    // Past months (not closed): Show max(actual, planned) - in case there are actuals entered
    return Math.max(actualAmount, plannedAmount)
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

  // Monthly total calculations - these now work with the reactive budgetItems and use smart defaults
  const calculateMonthlyTotal = (monthIndex) => {
    const income = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
    
    const expenses = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
    
    return income - expenses
  }

  const calculateMonthlyIncome = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyExpenses = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentIncoming = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentOutgoing = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + getSmartDefaultAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentNet = (monthIndex) => {
    return calculateMonthlyInvestmentIncoming(monthIndex) - calculateMonthlyInvestmentOutgoing(monthIndex)
  }

  // Grand total calculations - these now work with the reactive budgetItems and use smart defaults
  const calculateGrandTotal = () => {
    return calculateGrandTotalIncome() + calculateGrandTotalInvestmentIncoming() - calculateGrandTotalExpenses() - calculateGrandTotalInvestmentOutgoing()
  }

  const calculateGrandTotalIncome = () => {
    // Sum all monthly smart default amounts for income items
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyIncome(monthIndex)
    }
    return total
  }

  const calculateGrandTotalExpenses = () => {
    // Sum all monthly smart default amounts for expense items
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyExpenses(monthIndex)
    }
    return total
  }

  const calculateGrandTotalInvestmentIncoming = () => {
    // Sum all monthly smart default amounts for incoming investment items
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyInvestmentIncoming(monthIndex)
    }
    return total
  }

  const calculateGrandTotalInvestmentOutgoing = () => {
    // Sum all monthly smart default amounts for outgoing investment items
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyInvestmentOutgoing(monthIndex)
    }
    return total
  }

  const calculateGrandTotalInvestmentNet = () => {
    return calculateGrandTotalInvestmentIncoming() - calculateGrandTotalInvestmentOutgoing()
  }

  // Planned amount calculations for tooltips
  const calculateMonthlyPlannedIncome = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + getBudgetAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyPlannedExpenses = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + getBudgetAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyPlannedInvestmentIncoming = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + getBudgetAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyPlannedInvestmentOutgoing = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + getBudgetAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyPlannedTotal = (monthIndex) => {
    const plannedIncome = calculateMonthlyPlannedIncome(monthIndex)
    const plannedInvestmentIncoming = calculateMonthlyPlannedInvestmentIncoming(monthIndex)
    const plannedExpenses = calculateMonthlyPlannedExpenses(monthIndex)
    const plannedInvestmentOutgoing = calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
    
    return (plannedIncome + plannedInvestmentIncoming) - (plannedExpenses + plannedInvestmentOutgoing)
  }

  // Grand total planned calculations for tooltips
  const calculateGrandTotalPlannedIncome = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyPlannedIncome(monthIndex)
    }
    return total
  }

  const calculateGrandTotalPlannedExpenses = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyPlannedExpenses(monthIndex)
    }
    return total
  }

  const calculateGrandTotalPlannedInvestmentIncoming = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyPlannedInvestmentIncoming(monthIndex)
    }
    return total
  }

  const calculateGrandTotalPlannedInvestmentOutgoing = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
    }
    return total
  }

  const calculateGrandTotalPlanned = () => {
    return calculateGrandTotalPlannedIncome() + calculateGrandTotalPlannedInvestmentIncoming() - calculateGrandTotalPlannedExpenses() - calculateGrandTotalPlannedInvestmentOutgoing()
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

  // Previous year calculations - show actuals for previous year
  const calculatePreviousYearIncomeTotal = () => {
    if (!budgetStore.previousYearItems || !budgetStore.previousYearItems.value) return 0
    
    return budgetStore.previousYearItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        // Sum all actual amounts for the previous year (not planned)
        const yearlyTotal = budget.actual_amounts ? 
          budget.actual_amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) :
          budget.amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) // fallback to planned if no actuals
        return sum + yearlyTotal
      }
      return sum
    }, 0)
  }

  const calculatePreviousYearExpensesTotal = () => {
    if (!budgetStore.previousYearItems || !budgetStore.previousYearItems.value) return 0
    
    return budgetStore.previousYearItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        // Sum all actual amounts for the previous year (not planned)
        const yearlyTotal = budget.actual_amounts ? 
          budget.actual_amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) :
          budget.amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) // fallback to planned if no actuals
        return sum + yearlyTotal
      }
      return sum
    }, 0)
  }

  const calculatePreviousYearInvestmentIncomingTotal = () => {
    if (!budgetStore.previousYearItems || !budgetStore.previousYearItems.value) return 0
    
    return budgetStore.previousYearItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        // Sum all actual amounts for the previous year (not planned)
        const yearlyTotal = budget.actual_amounts ? 
          budget.actual_amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) :
          budget.amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) // fallback to planned if no actuals
        return sum + yearlyTotal
      }
      return sum
    }, 0)
  }

  const calculatePreviousYearInvestmentOutgoingTotal = () => {
    if (!budgetStore.previousYearItems || !budgetStore.previousYearItems.value) return 0
    
    return budgetStore.previousYearItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        // Sum all actual amounts for the previous year (not planned)
        const yearlyTotal = budget.actual_amounts ? 
          budget.actual_amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) :
          budget.amounts.reduce((monthSum, amount) => monthSum + (parseFloat(amount) || 0), 0) // fallback to planned if no actuals
        return sum + yearlyTotal
      }
      return sum
    }, 0)
  }

  const calculatePreviousYearNetTotal = () => {
    const income = calculatePreviousYearIncomeTotal()
    const expenses = calculatePreviousYearExpensesTotal()
    const investmentIncoming = calculatePreviousYearInvestmentIncomingTotal()
    const investmentOutgoing = calculatePreviousYearInvestmentOutgoingTotal()
    
    return (income + investmentIncoming) - (expenses + investmentOutgoing)
  }

  const calculatePreviousYearInvestmentNetTotal = () => {
    const incoming = calculatePreviousYearInvestmentIncomingTotal()
    const outgoing = calculatePreviousYearInvestmentOutgoingTotal()
    
    return incoming - outgoing
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
    getActualAmount,
    isMonthClosed,
    getSmartDefaultAmount,
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
    
    // Planned calculations for tooltips
    calculateMonthlyPlannedIncome,
    calculateMonthlyPlannedExpenses,
    calculateMonthlyPlannedInvestmentIncoming,
    calculateMonthlyPlannedInvestmentOutgoing,
    calculateMonthlyPlannedTotal,
    calculateGrandTotalPlannedIncome,
    calculateGrandTotalPlannedExpenses,
    calculateGrandTotalPlannedInvestmentIncoming,
    calculateGrandTotalPlannedInvestmentOutgoing,
    calculateGrandTotalPlanned,
    
    // Category calculations
    calculateCategoryTotal,
    calculateCategoryMonthlyTotal,
    
    // Previous year calculations
    calculatePreviousYearIncomeTotal,
    calculatePreviousYearExpensesTotal,
    calculatePreviousYearInvestmentIncomingTotal,
    calculatePreviousYearInvestmentOutgoingTotal,
    calculatePreviousYearNetTotal,
    calculatePreviousYearInvestmentNetTotal,
    
    // Budget updates
    updateBudgetAmount
  }
} 