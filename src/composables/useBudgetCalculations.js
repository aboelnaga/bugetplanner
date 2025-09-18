// Budget calculations composable
// All calculation functions: monthly totals, yearly totals, investment calculations, grand totals

import { BUDGET_TYPES } from '@/constants/budgetConstants.js'
import { useTransactionStore } from '@/stores/transactions.js'
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'

export function useBudgetCalculations (budgetItems, budgetStore, closedMonths = [], currentYear = null, currentMonth = null, selectedYear = null) {
  const yearlySummariesStore = useYearlySummariesStore()
  const transactionStore = useTransactionStore()
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

  // Smart defaults logic for budget calculations
  const isMonthClosed = (monthIndex) => {
    // Handle both ref and direct array
    const monthsArray = closedMonths?.value || closedMonths || []
    return monthsArray.some(closedMonth => closedMonth.month === monthIndex)
  }

  console.log('selectedYear', selectedYear.value)
  console.log('currentYear', currentYear)
  console.log('currentMonth', currentMonth)

  const getSmartDefaultAmount = (budget, monthIndex) => {
    const plannedAmount = getBudgetAmount(budget, monthIndex)
    const actualAmount = getActualAmount(budget, monthIndex)

    // Previous year: Show actual amounts (for comparison)
    if (selectedYear.value < currentYear) {
      return actualAmount
    }

    // Closed months: Show actual amounts
    if (isMonthClosed(monthIndex)) {
      return actualAmount
    }

    // Current month: Show max(actual, planned)
    if (selectedYear.value === currentYear && monthIndex === currentMonth) {
      return Math.max(actualAmount, plannedAmount)
    }

    // Future months: Show planned amounts (not max)
    if (selectedYear.value > currentYear ||
        (selectedYear.value === currentYear && monthIndex > currentMonth)) {
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

  // Actual-only monthly calculations
  const calculateMonthlyActualIncome = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INCOME) {
        return sum + getActualAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyActualExpenses = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.EXPENSE) {
        return sum + getActualAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyActualInvestmentIncoming = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'incoming') {
        return sum + getActualAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyActualInvestmentOutgoing = (monthIndex) => {
    return budgetItems.value.reduce((sum, budget) => {
      if (budget.type === BUDGET_TYPES.INVESTMENT && budget.investment_direction === 'outgoing') {
        return sum + getActualAmount(budget, monthIndex)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyActualInvestmentNet = (monthIndex) => {
    return calculateMonthlyActualInvestmentIncoming(monthIndex) - calculateMonthlyActualInvestmentOutgoing(monthIndex)
  }

  const calculateMonthlyActualTotal = (monthIndex) => {
    const income = calculateMonthlyActualIncome(monthIndex) + calculateMonthlyActualInvestmentIncoming(monthIndex)
    const expenses = calculateMonthlyActualExpenses(monthIndex) + calculateMonthlyActualInvestmentOutgoing(monthIndex)
    return income - expenses
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

  // Actual-only grand total calculations
  const calculateGrandTotalActualIncome = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyActualIncome(monthIndex)
    }
    return total
  }

  const calculateGrandTotalActualExpenses = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyActualExpenses(monthIndex)
    }
    return total
  }

  const calculateGrandTotalActualInvestmentIncoming = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyActualInvestmentIncoming(monthIndex)
    }
    return total
  }

  const calculateGrandTotalActualInvestmentOutgoing = () => {
    let total = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      total += calculateMonthlyActualInvestmentOutgoing(monthIndex)
    }
    return total
  }

  const calculateGrandTotalActualInvestmentNet = () => {
    return calculateGrandTotalActualInvestmentIncoming() - calculateGrandTotalActualInvestmentOutgoing()
  }

  const calculateGrandTotalActual = () => {
    return calculateGrandTotalActualIncome() + calculateGrandTotalActualInvestmentIncoming() - calculateGrandTotalActualExpenses() - calculateGrandTotalActualInvestmentOutgoing()
  }

  // Savings calculations
  const calculateCumulativeSavings = (monthIndex) => {
    let cumulativeSavings = 0

    // Calculate cumulative savings from start of year to the specified month
    for (let month = 0; month <= monthIndex; month++) {
      cumulativeSavings += calculateMonthlyTotal(month)
    }

    return cumulativeSavings
  }

  const calculateGrandTotalSavings = () => {
    // Total cumulative savings for the year (end of year savings)
    return calculateCumulativeSavings(11)
  }

  const calculatePreviousYearSavings = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.net : 0
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

  // Previous year calculations - use yearly summaries with smart defaults
  const calculatePreviousYearIncomeTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.income : 0
  }

  const calculatePreviousYearExpensesTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.expenses : 0
  }

  const calculatePreviousYearInvestmentIncomingTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.investmentIncoming : 0
  }

  const calculatePreviousYearInvestmentOutgoingTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.investmentOutgoing : 0
  }

  const calculatePreviousYearNetTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.net : 0
  }

  const calculatePreviousYearInvestmentNetTotal = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const smartValues = yearlySummariesStore.getSmartPreviousYearValues(previousYear)
    return smartValues ? smartValues.investmentIncoming - smartValues.investmentOutgoing : 0
  }

  // Previous year dual calculations - return both expected and actual values
  const calculatePreviousYearIncomeTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    return {
      expected: parseFloat(summary.total_income_planned) || 0,
      actual: parseFloat(summary.total_income_actual) || 0
    }
  }

  // All previous years calculations - sum of all years before selected year
  const calculateAllPreviousYearsIncomeTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        totalExpected += parseFloat(summary.total_income_planned) || 0
        totalActual += parseFloat(summary.total_income_actual) || 0
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearExpensesTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    return {
      expected: parseFloat(summary.total_expenses_planned) || 0,
      actual: parseFloat(summary.total_expenses_actual) || 0
    }
  }

  const calculateAllPreviousYearsExpensesTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        totalExpected += parseFloat(summary.total_expenses_planned) || 0
        totalActual += parseFloat(summary.total_expenses_actual) || 0
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearInvestmentIncomingTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    return {
      expected: parseFloat(summary.total_investment_incoming_planned) || 0,
      actual: parseFloat(summary.total_investment_incoming_actual) || 0
    }
  }

  const calculateAllPreviousYearsInvestmentIncomingTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        totalExpected += parseFloat(summary.total_investment_incoming_planned) || 0
        totalActual += parseFloat(summary.total_investment_incoming_actual) || 0
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearInvestmentOutgoingTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    return {
      expected: parseFloat(summary.total_investment_outgoing_planned) || 0,
      actual: parseFloat(summary.total_investment_outgoing_actual) || 0
    }
  }

  const calculateAllPreviousYearsInvestmentOutgoingTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        totalExpected += parseFloat(summary.total_investment_outgoing_planned) || 0
        totalActual += parseFloat(summary.total_investment_outgoing_actual) || 0
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearNetTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    const expectedNet = (parseFloat(summary.total_income_planned) || 0) +
                       (parseFloat(summary.total_investment_incoming_planned) || 0) -
                       (parseFloat(summary.total_expenses_planned) || 0) -
                       (parseFloat(summary.total_investment_outgoing_planned) || 0)

    const actualNet = (parseFloat(summary.total_income_actual) || 0) +
                     (parseFloat(summary.total_investment_incoming_actual) || 0) -
                     (parseFloat(summary.total_expenses_actual) || 0) -
                     (parseFloat(summary.total_investment_outgoing_actual) || 0)

    return { expected: expectedNet, actual: actualNet }
  }

  const calculateAllPreviousYearsNetTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        const expectedNet = (parseFloat(summary.total_income_planned) || 0) +
                           (parseFloat(summary.total_investment_incoming_planned) || 0) -
                           (parseFloat(summary.total_expenses_planned) || 0) -
                           (parseFloat(summary.total_investment_outgoing_planned) || 0)

        const actualNet = (parseFloat(summary.total_income_actual) || 0) +
                         (parseFloat(summary.total_investment_incoming_actual) || 0) -
                         (parseFloat(summary.total_expenses_actual) || 0) -
                         (parseFloat(summary.total_investment_outgoing_actual) || 0)

        totalExpected += expectedNet
        totalActual += actualNet
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearInvestmentNetTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    const expectedNet = (parseFloat(summary.total_investment_incoming_planned) || 0) -
                       (parseFloat(summary.total_investment_outgoing_planned) || 0)

    const actualNet = (parseFloat(summary.total_investment_incoming_actual) || 0) -
                     (parseFloat(summary.total_investment_outgoing_actual) || 0)

    return { expected: expectedNet, actual: actualNet }
  }

  const calculateAllPreviousYearsInvestmentNetTotalWithDual = () => {
    const currentYear = selectedYear.value
    if (!currentYear) return { expected: 0, actual: 0 }

    let totalExpected = 0
    let totalActual = 0

    // Sum all years from 2020 to currentYear - 1
    for (let year = 2020; year < currentYear; year++) {
      const summary = yearlySummariesStore.getYearlySummary(year)
      if (summary) {
        const expectedNet = (parseFloat(summary.total_investment_incoming_planned) || 0) -
                           (parseFloat(summary.total_investment_outgoing_planned) || 0)

        const actualNet = (parseFloat(summary.total_investment_incoming_actual) || 0) -
                         (parseFloat(summary.total_investment_outgoing_actual) || 0)

        totalExpected += expectedNet
        totalActual += actualNet
      }
    }

    return {
      expected: totalExpected,
      actual: totalActual
    }
  }

  const calculatePreviousYearSavingsTotalWithDual = () => {
    const previousYear = selectedYear.value ? selectedYear.value - 1 : null
    const summary = yearlySummariesStore.getYearlySummary(previousYear)
    if (!summary) return { expected: 0, actual: 0 }

    return {
      expected: parseFloat(summary.total_savings_planned) || 0,
      actual: parseFloat(summary.total_savings_actual) || 0
    }
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
    calculateMonthlyActualIncome,
    calculateMonthlyActualExpenses,
    calculateMonthlyActualInvestmentIncoming,
    calculateMonthlyActualInvestmentOutgoing,
    calculateMonthlyActualInvestmentNet,
    calculateMonthlyActualTotal,


    // Grand total calculations
    calculateGrandTotal,
    calculateGrandTotalIncome,
    calculateGrandTotalExpenses,
    calculateGrandTotalInvestmentIncoming,
    calculateGrandTotalInvestmentOutgoing,
    calculateGrandTotalInvestmentNet,
    calculateGrandTotalActualIncome,
    calculateGrandTotalActualExpenses,
    calculateGrandTotalActualInvestmentIncoming,
    calculateGrandTotalActualInvestmentOutgoing,
    calculateGrandTotalActualInvestmentNet,
    calculateGrandTotalActual,

    // Savings calculations
    calculateCumulativeSavings,
    calculateGrandTotalSavings,
    calculatePreviousYearSavings,

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

    // Previous year dual calculations (both expected and actual)
    calculatePreviousYearIncomeTotalWithDual,
    calculatePreviousYearExpensesTotalWithDual,
    calculatePreviousYearInvestmentIncomingTotalWithDual,
    calculatePreviousYearInvestmentOutgoingTotalWithDual,
    calculatePreviousYearNetTotalWithDual,
    calculatePreviousYearInvestmentNetTotalWithDual,
    calculatePreviousYearSavingsTotalWithDual,

    // All previous years calculations (sum of all years before selected year)
    calculateAllPreviousYearsIncomeTotalWithDual,
    calculateAllPreviousYearsExpensesTotalWithDual,
    calculateAllPreviousYearsInvestmentIncomingTotalWithDual,
    calculateAllPreviousYearsInvestmentOutgoingTotalWithDual,
    calculateAllPreviousYearsNetTotalWithDual,
    calculateAllPreviousYearsInvestmentNetTotalWithDual,

    // Budget updates
    updateBudgetAmount
  }
}
