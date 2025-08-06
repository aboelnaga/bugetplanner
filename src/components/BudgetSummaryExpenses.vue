<template>
  <!-- Expenses Line -->
  <tr v-if="shouldShowSummaryRow('TOTAL_EXPENSES')" :class="`${totalExpensesStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${totalExpensesStyling.textColor} sticky left-0 ${totalExpensesStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${totalExpensesStyling.textColor} mr-2`">{{ totalExpensesConfig.symbol }}</span>
        {{ totalExpensesConfig.label }}
      </div>
    </td>
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearExpensesTotal(), selectedYear, currentYear, currentMonth, -1, 'TOTAL_EXPENSES')} border-t-2 border-gray-200`">
      <BaseTooltip :content="getPreviousYearExpensesTooltip()" position="top">
        <div v-if="getPreviousYearExpensesTotal() > 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearExpensesTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    <td v-for="(month, index) in months" :key="`eq-expense-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyExpenses(index), selectedYear, currentYear, currentMonth, index, 'TOTAL_EXPENSES')} border-t-2 border-gray-200`">
      <BaseTooltip :content="getExpensesTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyExpenses(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(-1 * calculateGrandTotalExpenses())} border-t-2 border-l-2 border-gray-200 sticky right-32 ${totalExpensesStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="getExpensesYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalExpenses(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${totalExpensesStyling.stickyBgColor} z-30 border-l border-gray-200`"></td>
  </tr>

  <!-- Investment Purchases Line -->
  <tr v-if="shouldShowSummaryRow('INVESTMENT_PURCHASES')" :class="`${investmentPurchasesStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${investmentPurchasesStyling.textColor} sticky left-0 ${investmentPurchasesStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${investmentPurchasesStyling.textColor} mr-2`">{{ investmentPurchasesConfig.symbol }}</span>
        {{ investmentPurchasesConfig.label }}
      </div>
    </td>
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearInvestmentOutgoingTotal(), selectedYear, currentYear, currentMonth, -1, 'INVESTMENT_PURCHASES')} border-t-2 border-gray-200`">
      <BaseTooltip :content="getPreviousYearInvestmentOutgoingTooltip()" position="top">
        <div v-if="getPreviousYearInvestmentOutgoingTotal() > 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearInvestmentOutgoingTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
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
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
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
  },
  

  calculatePreviousYearExpensesTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotal: {
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
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentOutgoingTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedInvestmentOutgoing) return ''
  
  const displayedAmount = props.calculateMonthlyInvestmentOutgoing(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getExpensesYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedExpenses) return ''
  
  const displayedAmount = props.calculateGrandTotalExpenses()
  const plannedAmount = props.calculateGrandTotalPlannedExpenses()
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentOutgoingYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedInvestmentOutgoing) return ''
  
  const displayedAmount = props.calculateGrandTotalInvestmentOutgoing()
  const plannedAmount = props.calculateGrandTotalPlannedInvestmentOutgoing()
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
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
  
  if (detailedValues && detailedValues.expenses) {
    const planned = detailedValues.expenses.planned
    const actual = detailedValues.expenses.actual
    const variance = actual - planned
    const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Expenses<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(planned)}</span><br>` +
           `Actual: <span class="text-red-300">${props.formatCurrency(actual)}</span><br>` +
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
  
  if (detailedValues && detailedValues.investmentOutgoing) {
    const planned = detailedValues.investmentOutgoing.planned
    const actual = detailedValues.investmentOutgoing.actual
    const variance = actual - planned
    const varianceColor = variance >= 0 ? 'text-red-300' : 'text-green-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Investment Purchases<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(planned)}</span><br>` +
           `Actual: <span class="text-red-300">${props.formatCurrency(actual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Investment Purchases (Actual): <span class="text-red-300">${props.formatCurrency(total)}</span>`
}
</script> 