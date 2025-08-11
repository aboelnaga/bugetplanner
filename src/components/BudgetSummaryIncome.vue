<template>
  <!-- Income Line -->
  <BudgetSummaryRowHelper
    row-type="TOTAL_INCOME"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="hasIncomeData"
    :has-expense-data="false"
    :has-investment-data="false"
    :has-investment-incoming-data="hasInvestmentIncomingData"
    :has-investment-outgoing-data="false"
    :has-any-data="false"
    :calculate-monthly="calculateMonthlyIncome"
    :calculate-grand-total="calculateGrandTotalIncome"
    :calculate-previous-year="calculatePreviousYearIncomeTotal"
    :get-monthly-tooltip="getIncomeTooltip"
    :get-grand-total-tooltip="getIncomeYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearIncomeTooltip"
    :format-currency="formatCurrency" />

  <!-- Investment Returns Line -->
  <BudgetSummaryRowHelper
    row-type="INVESTMENT_RETURNS"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="hasIncomeData"
    :has-expense-data="false"
    :has-investment-data="false"
    :has-investment-incoming-data="hasInvestmentIncomingData"
    :has-investment-outgoing-data="false"
    :has-any-data="false"
    :calculate-monthly="calculateMonthlyInvestmentIncoming"
    :calculate-grand-total="calculateGrandTotalInvestmentIncoming"
    :calculate-previous-year="calculatePreviousYearInvestmentIncomingTotal"
    :get-monthly-tooltip="getInvestmentIncomingTooltip"
    :get-grand-total-tooltip="getInvestmentIncomingYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearInvestmentIncomingTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200" />
</template>

<script setup>
import { computed } from 'vue'
import { FILTER_OPTIONS } from '@/constants/budgetConstants.js'
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
  hasIncomeData: {
    type: Boolean,
    required: true
  },
  hasInvestmentIncomingData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyActualIncome: {
    type: Function,
    required: false,
    default: null
  },
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateMonthlyActualInvestmentIncoming: {
    type: Function,
    required: false,
    default: null
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualIncome: {
    type: Function,
    required: false,
    default: null
  },
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualInvestmentIncoming: {
    type: Function,
    required: false,
    default: null
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Planned calculation props for tooltips
  calculateMonthlyPlannedIncome: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedIncome: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  
  // Previous year calculations
  calculatePreviousYearIncomeTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotal: {
    type: Function,
    default: null
  }
})



// Tooltip functions
const getIncomeTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedIncome) return ''
  const plannedAmount = props.calculateMonthlyPlannedIncome(monthIndex)
  const actualAmount = props.calculateMonthlyActualIncome ? props.calculateMonthlyActualIncome(monthIndex) : 0
  const variance = actualAmount - plannedAmount
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentIncomingTooltip = (monthIndex) => {
  const displayedAmount = props.calculateMonthlyInvestmentIncoming(monthIndex)
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `Returns: <span class="text-green-300">${displayedFormatted}</span>`
}

const getIncomeYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedIncome) return ''
  const plannedAmount = props.calculateGrandTotalPlannedIncome()
  const actualAmount = props.calculateGrandTotalActualIncome ? props.calculateGrandTotalActualIncome() : 0
  const variance = actualAmount - plannedAmount
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentIncomingYearlyTooltip = () => {
  const displayedAmount = props.calculateGrandTotalInvestmentIncoming()
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `Returns: <span class="text-green-300">${displayedFormatted}</span>`
}

// Previous year functions
const getPreviousYearIncomeTotal = () => {
  if (!props.calculatePreviousYearIncomeTotal) return 0
  return props.calculatePreviousYearIncomeTotal()
}

const getPreviousYearInvestmentIncomingTotal = () => {
  if (!props.calculatePreviousYearInvestmentIncomingTotal) return 0
  return props.calculatePreviousYearInvestmentIncomingTotal()
}

const getPreviousYearIncomeTooltip = () => {
  const total = getPreviousYearIncomeTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const incomePlanned = detailedValues.income.planned
    const incomeActual = detailedValues.income.actual
    const variance = incomeActual - incomePlanned
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Income<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(incomePlanned)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(incomeActual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Income (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}

const getPreviousYearInvestmentIncomingTooltip = () => {
  const total = getPreviousYearInvestmentIncomingTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const incomingPlanned = detailedValues.investmentIncoming.planned
    const incomingActual = detailedValues.investmentIncoming.actual
    const variance = incomingActual - incomingPlanned
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Investment Returns<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(incomingPlanned)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(incomingActual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Investment Returns (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}
</script> 