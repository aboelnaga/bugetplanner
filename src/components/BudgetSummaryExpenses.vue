<template>
  <!-- Expenses Line -->
  <tr v-if="shouldShowSummaryRow('TOTAL_EXPENSES')" :class="`${totalExpensesStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${totalExpensesStyling.textColor} sticky left-0 ${totalExpensesStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${totalExpensesStyling.textColor} mr-2`">{{ totalExpensesConfig.symbol }}</span>
        {{ totalExpensesConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-expense-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyExpenses(index), selectedYear, currentYear, currentMonth, index, 'TOTAL_EXPENSES')} border-t-2 border-gray-200`">
      <BaseTooltip :content="getExpensesTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyExpenses(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(-1 * calculateGrandTotalExpenses())} border-t-2 border-l-2 border-gray-200`">
      <BaseTooltip :content="getExpensesYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalExpenses(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${totalExpensesStyling.stickyBgColor} z-20 border-l border-gray-200`"></td>
  </tr>

  <!-- Investment Purchases Line -->
  <tr v-if="shouldShowSummaryRow('INVESTMENT_PURCHASES')" :class="`${investmentPurchasesStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${investmentPurchasesStyling.textColor} sticky left-0 ${investmentPurchasesStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${investmentPurchasesStyling.textColor} mr-2`">{{ investmentPurchasesConfig.symbol }}</span>
        {{ investmentPurchasesConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-inv-out-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyInvestmentOutgoing(index), selectedYear, currentYear, currentMonth, index, 'INVESTMENT_PURCHASES')} border-t-2 border-gray-200`">
      <BaseTooltip :content="getInvestmentOutgoingTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyInvestmentOutgoing(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(-1 * calculateGrandTotalInvestmentOutgoing())} border-t-2 border-l-2 border-gray-200`">
      <BaseTooltip :content="getInvestmentOutgoingYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalInvestmentOutgoing(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${investmentPurchasesStyling.stickyBgColor} z-20 border-l border-gray-200 border-t-2`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { FILTER_OPTIONS } from '@/constants/budgetConstants.js'
import { useBudgetSummaries } from '@/composables/useBudgetSummaries.js'
import BaseTooltip from '@/components/BaseTooltip.vue'

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
  calculateMonthlyInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
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
  computed(() => props.hasExpenseData),
  computed(() => false), // hasInvestmentData not needed
  computed(() => false), // hasInvestmentIncomingData not needed
  computed(() => props.hasInvestmentOutgoingData),
  computed(() => false) // hasAnyData not needed
)

// Get row configurations
const totalExpensesConfig = computed(() => getSummaryRowConfig('TOTAL_EXPENSES'))
const investmentPurchasesConfig = computed(() => getSummaryRowConfig('INVESTMENT_PURCHASES'))

// Get row styling
const totalExpensesStyling = computed(() => getSummaryRowStyling('TOTAL_EXPENSES'))
const investmentPurchasesStyling = computed(() => getSummaryRowStyling('INVESTMENT_PURCHASES'))

// Tooltip functions
const getExpensesTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedExpenses) return ''
  
  const displayedAmount = props.calculateMonthlyExpenses(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedExpenses(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  
  const monthName = props.months[monthIndex]
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `${monthName} Expenses Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getInvestmentOutgoingTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedInvestmentOutgoing) return ''
  
  const displayedAmount = props.calculateMonthlyInvestmentOutgoing(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  
  const monthName = props.months[monthIndex]
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `${monthName} Investment Purchases Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getExpensesYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedExpenses) return ''
  
  const displayedAmount = props.calculateGrandTotalExpenses()
  const plannedAmount = props.calculateGrandTotalPlannedExpenses()
  const actualAmount = displayedAmount - plannedAmount
  
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `Yearly Expenses Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}

const getInvestmentOutgoingYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedInvestmentOutgoing) return ''
  
  const displayedAmount = props.calculateGrandTotalInvestmentOutgoing()
  const plannedAmount = props.calculateGrandTotalPlannedInvestmentOutgoing()
  const actualAmount = displayedAmount - plannedAmount
  
  const displayedFormatted = props.formatCurrency(displayedAmount)
  const plannedFormatted = props.formatCurrency(plannedAmount)
  const actualFormatted = props.formatCurrency(actualAmount)
  
  return `Yearly Investment Purchases Summary:
Displayed: ${displayedFormatted}
Planned: ${plannedFormatted}
Actual: ${actualFormatted}`
}
</script> 