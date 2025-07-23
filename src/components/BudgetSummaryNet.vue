<template>
  <!-- Divider Line -->
  <tr v-if="shouldShowSummaryRow('NET_BALANCE')" class="bg-gray-100">
    <td class="p-0 border-t-2 border-gray-200"></td>
    <td v-for="(month, index) in months" :key="`divider-${month}`" class="p-0 border-t-2 border-gray-200"></td>
    <td class="p-0 border-t-2 border-gray-200"></td>
    <td class="p-0"></td>
  </tr>

  <!-- Net Balance Line -->
  <tr v-if="shouldShowSummaryRow('NET_BALANCE')" :class="`${netBalanceStyling.bgColor} border-t-2 border-gray-200 font-bold`">
    <td :class="`px-6 py-4 text-sm font-bold ${netBalanceStyling.textColor} sticky left-0 ${netBalanceStyling.stickyBgColor} z-20 border-r border-gray-200`">
      <div class="flex items-center">
        <span :class="`text-xl font-bold ${netBalanceStyling.textColor} mr-2`">{{ netBalanceConfig.symbol }}</span>
        {{ netBalanceConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-net-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyTotal(index), selectedYear, currentYear, currentMonth, index)} relative group cursor-help`"
        :title="getNetBalanceTooltip(index)">
      {{ formatSummaryValue(calculateMonthlyTotal(index), formatCurrency) }}
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotal(), true)} relative group cursor-help`"
        :title="getNetBalanceYearlyTooltip()">
      {{ formatSummaryValue(calculateGrandTotal(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-4 sticky right-0 ${netBalanceStyling.stickyBgColor} z-20 border-l border-gray-200`"></td>
  </tr>

  <!-- Net Investment Row -->
  <tr v-if="shouldShowSummaryRow('NET_INVESTMENT')" :class="`${netInvestmentStyling.bgColor} text-sm`">
    <td :class="`px-6 py-3 text-sm font-semibold ${netInvestmentStyling.textColor} sticky left-0 ${netInvestmentStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${netInvestmentStyling.textColor} mr-2`">{{ netInvestmentConfig.symbol }}</span>
        {{ netInvestmentConfig.label }}
      </div>
      <div class="text-xs text-gray-500 mt-1">
        {{ netInvestmentConfig.subtitle }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`net-inv-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyInvestmentNet(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200 relative group cursor-help`"
        :title="getNetInvestmentTooltip(index)">
      {{ formatSummaryValue(calculateMonthlyInvestmentNet(index), formatCurrency) }}
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalInvestmentNet())} border-t-2 border-l-2 border-gray-200 relative group cursor-help`"
        :title="getNetInvestmentYearlyTooltip()">
      {{ formatSummaryValue(calculateGrandTotalInvestmentNet(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${netInvestmentStyling.stickyBgColor} z-20 border-l border-gray-200 border-t-2`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
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
  computed(() => false), // hasIncomeData not needed
  computed(() => false), // hasExpenseData not needed
  computed(() => props.hasInvestmentData),
  computed(() => false), // hasInvestmentIncomingData not needed
  computed(() => false), // hasInvestmentOutgoingData not needed
  computed(() => props.hasAnyData)
)

// Get row configurations
const netBalanceConfig = computed(() => getSummaryRowConfig('NET_BALANCE'))
const netInvestmentConfig = computed(() => getSummaryRowConfig('NET_INVESTMENT'))

// Get row styling
const netBalanceStyling = computed(() => getSummaryRowStyling('NET_BALANCE'))
const netInvestmentStyling = computed(() => getSummaryRowStyling('NET_INVESTMENT'))

// Tooltip functions
const getNetBalanceTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedTotal) return ''
  
  const displayedAmount = props.calculateMonthlyTotal(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedTotal(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  
  const monthName = props.months[monthIndex]
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `${monthName} Net Balance Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getNetInvestmentTooltip = (monthIndex) => {
  // For investment net, we need to calculate from the individual components
  // since we don't have a direct planned calculation for net investment
  const monthName = props.months[monthIndex]
  const displayedAmount = props.calculateMonthlyInvestmentNet(monthIndex)
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `${monthName} Net Investment Summary:
Displayed: ${displayedFormatted}
(Investment Returns - Investment Purchases)`
}

const getNetBalanceYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlanned) return ''
  
  const displayedAmount = props.calculateGrandTotal()
  const plannedAmount = props.calculateGrandTotalPlanned()
  const actualAmount = displayedAmount - plannedAmount
  
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `Yearly Net Balance Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getNetInvestmentYearlyTooltip = () => {
  const displayedAmount = props.calculateGrandTotalInvestmentNet()
  const displayedFormatted = props.formatCurrency(displayedAmount)
  
  return `Yearly Net Investment Summary:
Displayed: ${displayedFormatted}
(Investment Returns - Investment Purchases)`
}
</script> 