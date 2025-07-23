<template>
  <!-- Income Line -->
  <tr v-if="shouldShowSummaryRow('TOTAL_INCOME')" :class="`${totalIncomeStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${totalIncomeStyling.textColor} sticky left-0 ${totalIncomeStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${totalIncomeStyling.textColor} mr-2`">{{ totalIncomeConfig.symbol }}</span>
        {{ totalIncomeConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-income-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyIncome(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200 relative group cursor-help`"
        :title="getIncomeTooltip(index)">
      {{ formatSummaryValue(calculateMonthlyIncome(index), formatCurrency) }}
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalIncome())} border-t-2 border-l-2 border-gray-200 relative group cursor-help`"
        :title="getIncomeYearlyTooltip()">
      {{ formatSummaryValue(calculateGrandTotalIncome(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${totalIncomeStyling.stickyBgColor} z-20 border-l border-gray-200`"></td>
  </tr>

  <!-- Investment Returns Line -->
  <tr v-if="shouldShowSummaryRow('INVESTMENT_RETURNS')" :class="`${investmentReturnsStyling.bgColor} border-t-2 border-gray-200`">
    <td :class="`px-6 py-3 text-sm font-semibold ${investmentReturnsStyling.textColor} sticky left-0 ${investmentReturnsStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${investmentReturnsStyling.textColor} mr-2`">{{ investmentReturnsConfig.symbol }}</span>
        {{ investmentReturnsConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-inv-in-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyInvestmentIncoming(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200 relative group cursor-help`"
        :title="getInvestmentIncomingTooltip(index)">
      {{ formatSummaryValue(calculateMonthlyInvestmentIncoming(index), formatCurrency) }}
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalInvestmentIncoming())} border-t-2 border-l-2 border-gray-200 relative group cursor-help`"
        :title="getInvestmentIncomingYearlyTooltip()">
      {{ formatSummaryValue(calculateGrandTotalInvestmentIncoming(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${investmentReturnsStyling.stickyBgColor} z-20 border-l border-gray-200`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { FILTER_OPTIONS } from '@/constants/budgetConstants.js'
import { useBudgetSummaries } from '@/composables/useBudgetSummaries.js'

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
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
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
  }
})

// Use budget summaries composable
const {
  shouldShowSummaryRow,
  getSummaryRowConfig,
  getSummaryRowStyling,
  getSummaryCellClasses,
  getSummaryTotalClasses,
  formatSummaryValue
} = useBudgetSummaries(
  null, // budgetItems not needed for this component
  computed(() => props.selectedTypeFilter),
  computed(() => props.hasIncomeData),
  computed(() => false), // hasExpenseData not needed
  computed(() => false), // hasInvestmentData not needed
  computed(() => props.hasInvestmentIncomingData),
  computed(() => false), // hasInvestmentOutgoingData not needed
  computed(() => false) // hasAnyData not needed
)

// Get row configurations
const totalIncomeConfig = computed(() => getSummaryRowConfig('TOTAL_INCOME'))
const investmentReturnsConfig = computed(() => getSummaryRowConfig('INVESTMENT_RETURNS'))

// Get row styling
const totalIncomeStyling = computed(() => getSummaryRowStyling('TOTAL_INCOME'))
const investmentReturnsStyling = computed(() => getSummaryRowStyling('INVESTMENT_RETURNS'))

// Tooltip functions
const getIncomeTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedIncome) return ''
  
  const displayedAmount = props.calculateMonthlyIncome(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedIncome(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  
  const monthName = props.months[monthIndex]
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `${monthName} Income Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getInvestmentIncomingTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedInvestmentIncoming) return ''
  
  const displayedAmount = props.calculateMonthlyInvestmentIncoming(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedInvestmentIncoming(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  
  const monthName = props.months[monthIndex]
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `${monthName} Investment Returns Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getIncomeYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedIncome) return ''
  
  const displayedAmount = props.calculateGrandTotalIncome()
  const plannedAmount = props.calculateGrandTotalPlannedIncome()
  const actualAmount = displayedAmount - plannedAmount
  
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `Yearly Income Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getInvestmentIncomingYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedInvestmentIncoming) return ''
  
  const displayedAmount = props.calculateGrandTotalInvestmentIncoming()
  const plannedAmount = props.calculateGrandTotalPlannedInvestmentIncoming()
  const actualAmount = displayedAmount - plannedAmount
  
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
    return `Yearly Investment Returns Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}
</script> 