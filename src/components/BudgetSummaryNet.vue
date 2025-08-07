<template>
  <!-- Divider Line -->
  <tr class="bg-gray-100">
    <td class="p-0 border-t-2 border-gray-200"></td>
    <td class="p-0 border-t-2 border-gray-200"></td>
    <td v-for="(month, index) in months" :key="`divider-${month}`" class="p-0 border-t-2 border-gray-200"></td>
    <td class="p-0 border-t-2 border-gray-200"></td>
    <td class="p-0"></td>
  </tr>

  <!-- Net Balance Line -->
  <BudgetSummaryRowHelper
    row-type="NET_BALANCE"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateMonthlyTotal"
    :calculate-grand-total="calculateGrandTotal"
    :calculate-previous-year="calculatePreviousYearNetTotal"
    :get-monthly-tooltip="getNetBalanceTooltip"
    :get-grand-total-tooltip="getNetBalanceYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearNetTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200 font-bold" />

  <!-- Savings Row -->
  <BudgetSummaryRowHelper
    row-type="SAVINGS"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateCumulativeSavings"
    :calculate-grand-total="calculateGrandTotalSavings"
    :calculate-previous-year="calculatePreviousYearSavings"
    :get-monthly-tooltip="getSavingsTooltip"
    :get-grand-total-tooltip="getGrandTotalSavingsTooltip"
    :get-previous-year-tooltip="getPreviousYearSavingsTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200 font-bold" />

  <!-- Net Investment Row -->
  <BudgetSummaryRowHelper
    row-type="NET_INVESTMENT"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateMonthlyInvestmentNet"
    :calculate-grand-total="calculateGrandTotalInvestmentNet"
    :calculate-previous-year="calculatePreviousYearInvestmentNetTotal"
    :get-monthly-tooltip="getNetInvestmentTooltip"
    :get-grand-total-tooltip="getNetInvestmentYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearInvestmentNetTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200" />
</template>

<script setup>
import { computed } from 'vue'
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
  hasInvestmentData: {
    type: Boolean,
    required: true
  },
  hasAnyData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentNet: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentNet: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Planned calculation props for tooltips
  calculateMonthlyPlannedTotal: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlanned: {
    type: Function,
    default: null
  },
  
  // Previous year calculations
  calculatePreviousYearNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotal: {
    type: Function,
    default: null
  },
  
  // Savings calculations
  calculateCumulativeSavings: {
    type: Function,
    required: true
  },
  calculateGrandTotalSavings: {
    type: Function,
    required: true
  },
  calculatePreviousYearSavings: {
    type: Function,
    required: true
  }
})



// Tooltip functions
const getNetBalanceTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedTotal) return ''
  
  const displayedAmount = props.calculateMonthlyTotal(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedTotal(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getNetInvestmentTooltip = (monthIndex) => {
  const displayedAmount = props.calculateMonthlyInvestmentNet(monthIndex)
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `Net: <span class="text-green-300">${displayedFormatted}</span><br>(Returns - Purchases)`
}

const getNetBalanceYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlanned) return ''
  
  const displayedAmount = props.calculateGrandTotal()
  const plannedAmount = props.calculateGrandTotalPlanned()
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getNetInvestmentYearlyTooltip = () => {
  const displayedAmount = props.calculateGrandTotalInvestmentNet()
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `Net: <span class="text-green-300">${displayedFormatted}</span><br>(Returns - Purchases)`
}

// Previous year functions
const getPreviousYearNetTotal = () => {
  if (!props.calculatePreviousYearNetTotal) return 0
  return props.calculatePreviousYearNetTotal()
}

const getPreviousYearInvestmentNetTotal = () => {
  if (!props.calculatePreviousYearInvestmentNetTotal) return 0
  return props.calculatePreviousYearInvestmentNetTotal()
}

const getPreviousYearNetTooltip = () => {
  const total = getPreviousYearNetTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const incomePlanned = detailedValues.income.planned
    const incomeActual = detailedValues.income.actual
    const expensesPlanned = detailedValues.expenses.planned
    const expensesActual = detailedValues.expenses.actual
    const investmentIncomingPlanned = detailedValues.investmentIncoming.planned
    const investmentIncomingActual = detailedValues.investmentIncoming.actual
    const investmentOutgoingPlanned = detailedValues.investmentOutgoing.planned
    const investmentOutgoingActual = detailedValues.investmentOutgoing.actual
    
    const plannedNet = (incomePlanned + investmentIncomingPlanned) - (expensesPlanned + investmentOutgoingPlanned)
    const actualNet = (incomeActual + investmentIncomingActual) - (expensesActual + investmentOutgoingActual)
    const variance = actualNet - plannedNet
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Net Balance<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(plannedNet)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(actualNet)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Net Balance (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}

const getPreviousYearInvestmentNetTooltip = () => {
  const total = getPreviousYearInvestmentNetTotal()
  const previousYear = props.selectedYear - 1
  
  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues(previousYear)
  
  if (detailedValues) {
    const incomingPlanned = detailedValues.investmentIncoming.planned
    const incomingActual = detailedValues.investmentIncoming.actual
    const outgoingPlanned = detailedValues.investmentOutgoing.planned
    const outgoingActual = detailedValues.investmentOutgoing.actual
    
    const plannedNet = incomingPlanned - outgoingPlanned
    const actualNet = incomingActual - outgoingActual
    const variance = actualNet - plannedNet
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Net Investment<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(plannedNet)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(actualNet)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Net Investment (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}

// Savings tooltip functions
const getSavingsTooltip = (monthIndex) => {
  const savings = props.calculateCumulativeSavings(monthIndex)
  const monthName = props.months[monthIndex]

  return `Cumulative Savings for ${monthName} ${props.selectedYear}: ${props.formatCurrency(savings)}`
}

const getGrandTotalSavingsTooltip = () => {
  const totalSavings = props.calculateGrandTotalSavings()
  return `Total Cumulative Savings for ${props.selectedYear}: ${props.formatCurrency(totalSavings)}`
}

const getPreviousYearSavingsTooltip = () => {
  const previousYearSavings = props.calculatePreviousYearSavings()
  const previousYear = props.selectedYear - 1

  if (previousYearSavings === 0) {
    return `No savings data available for ${previousYear}`
  }

  return `Cumulative Savings for ${previousYear}: ${props.formatCurrency(previousYearSavings)}`
}
</script> 