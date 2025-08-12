<template>
  <!-- Expenses Line -->
  <BudgetSummaryRowHelper
    row-type="TOTAL_EXPENSES"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="hasExpenseData"
    :has-investment-data="false"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="hasInvestmentOutgoingData"
    :has-any-data="false"
    :calculate-monthly="calculateMonthlyExpenses"
    :calculate-grand-total="calculateGrandTotalExpenses"
    :calculate-previous-year="calculatePreviousYearExpensesTotal"
    :get-monthly-tooltip="getExpensesTooltip"
    :get-grand-total-tooltip="getExpensesYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearExpensesTooltip"
    :format-currency="formatCurrency" />

  <!-- Investment Purchases Line -->
  <BudgetSummaryRowHelper
    row-type="INVESTMENT_PURCHASES"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="hasExpenseData"
    :has-investment-data="false"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="hasInvestmentOutgoingData"
    :has-any-data="false"
    :calculate-monthly="calculateMonthlyInvestmentOutgoing"
    :calculate-grand-total="calculateGrandTotalInvestmentOutgoing"
    :calculate-previous-year="calculatePreviousYearInvestmentOutgoingTotal"
    :get-monthly-tooltip="getInvestmentOutgoingTooltip"
    :get-grand-total-tooltip="getInvestmentOutgoingYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearInvestmentOutgoingTooltip"
    :format-currency="formatCurrency" />
</template>

<script setup>
import { computed } from 'vue'
import { FILTER_OPTIONS } from '@/constants/budgetConstants.js'
import { useTooltipBuilder } from '@/composables/useTooltipBuilder.js'
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
import BudgetSummaryRowHelper from './BudgetSummaryRowHelper.vue'

// Props
const props = defineProps({
  months: {
    type: Array,
    required: true
  },
  selectedYear: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  currentMonth: {
    type: Number,
    required: true
  },
  selectedTypeFilter: {
    type: String,
    required: true
  },
  
  // Computed properties
  hasExpenseData: {
    type: Boolean,
    required: true
  },
  hasInvestmentOutgoingData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyActualExpenses: {
    type: Function,
    required: false,
    default: null
  },
  calculateMonthlyInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateMonthlyActualInvestmentOutgoing: {
    type: Function,
    required: false,
    default: null
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualExpenses: {
    type: Function,
    required: false,
    default: null
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualInvestmentOutgoing: {
    type: Function,
    required: false,
    default: null
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Planned calculation props for tooltips
  calculateMonthlyPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  
  // Previous year calculations
  calculatePreviousYearExpensesTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotal: {
    type: Function,
    default: null
  }
})



// Tooltip functions via shared builder
const { buildTooltip, actualColorFor } = useTooltipBuilder(props.formatCurrency)

const getExpensesTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedExpenses) return ''
  const plannedAmount = props.calculateMonthlyPlannedExpenses(monthIndex)
  const actualAmount = props.calculateMonthlyActualExpenses ? props.calculateMonthlyActualExpenses(monthIndex) : 0
  return buildTooltip(plannedAmount, actualAmount, 'expense', actualColorFor(actualAmount, 'expense'))
}

const getInvestmentOutgoingTooltip = (monthIndex) => {
  const planned = props.calculateMonthlyPlannedInvestmentOutgoing ? props.calculateMonthlyPlannedInvestmentOutgoing(monthIndex) : 0
  const actual = props.calculateMonthlyActualInvestmentOutgoing ? props.calculateMonthlyActualInvestmentOutgoing(monthIndex) : 0
  return buildTooltip(planned, actual, 'expense', actualColorFor(actual, 'expense'))
}

const getExpensesYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedExpenses) return ''
  const plannedAmount = props.calculateGrandTotalPlannedExpenses()
  const actualAmount = props.calculateGrandTotalActualExpenses ? props.calculateGrandTotalActualExpenses() : 0
  return buildTooltip(plannedAmount, actualAmount, 'expense', actualColorFor(actualAmount, 'expense'))
}

const getInvestmentOutgoingYearlyTooltip = () => {
  const planned = props.calculateGrandTotalPlannedInvestmentOutgoing ? props.calculateGrandTotalPlannedInvestmentOutgoing() : 0
  const actual = props.calculateGrandTotalActualInvestmentOutgoing ? props.calculateGrandTotalActualInvestmentOutgoing() : 0
  return buildTooltip(planned, actual, 'expense', actualColorFor(actual, 'expense'))
}

// Previous year functions
const getPreviousYearExpensesTotal = () => {
  if (!props.calculatePreviousYearExpensesTotal) return 0
  return props.calculatePreviousYearExpensesTotal()
}

const getPreviousYearInvestmentOutgoingTotal = () => {
  if (!props.calculatePreviousYearInvestmentOutgoingTotal) return 0
  return props.calculatePreviousYearInvestmentOutgoingTotal()
}

const getPreviousYearExpensesTooltip = () => {
  const total = getPreviousYearExpensesTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const expensesPlanned = detailedValues.expenses.planned
    const expensesActual = detailedValues.expenses.actual
    const variance = expensesActual - expensesPlanned
    const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Expenses<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(expensesPlanned)}</span><br>` +
           `Actual: <span class="text-red-300">${props.formatCurrency(expensesActual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Expenses (Actual): <span class="text-red-300">${props.formatCurrency(total)}</span>`
}

const getPreviousYearInvestmentOutgoingTooltip = () => {
  const total = getPreviousYearInvestmentOutgoingTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const outgoingPlanned = detailedValues.investmentOutgoing.planned
    const outgoingActual = detailedValues.investmentOutgoing.actual
    const variance = outgoingActual - outgoingPlanned
    const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Investment Purchases<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(outgoingPlanned)}</span><br>` +
           `Actual: <span class="text-red-300">${props.formatCurrency(outgoingActual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Investment Purchases (Actual): <span class="text-red-300">${props.formatCurrency(total)}</span>`
}
</script> 