<template>
  <!-- Income Line -->
  <tr v-if="shouldShowSummaryRow('TOTAL_INCOME')" :class="`${totalIncomeStyling.bgColor}`">
    <td :class="`px-6 py-3 text-sm font-semibold ${totalIncomeStyling.textColor} sticky left-0 ${totalIncomeStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${totalIncomeStyling.textColor} mr-2`">{{ totalIncomeConfig.symbol }}</span>
        {{ totalIncomeConfig.label }}
      </div>
    </td>
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearIncomeTotal(), selectedYear, currentYear, currentMonth, -1)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getPreviousYearIncomeTooltip()" position="top">
        <div v-if="getPreviousYearIncomeTotal() > 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearIncomeTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    <td v-for="(month, index) in months" :key="`eq-income-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyIncome(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getIncomeTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyIncome(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalIncome())} border-t-2 border-l-2 border-gray-200 sticky right-32 ${totalIncomeStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="getIncomeYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalIncome(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${totalIncomeStyling.stickyBgColor} z-30 border-l border-gray-200`"></td>
  </tr>

  <!-- Investment Returns Line -->
  <tr v-if="shouldShowSummaryRow('INVESTMENT_RETURNS')" :class="`${investmentReturnsStyling.bgColor} border-t-2 border-gray-200`">
    <td :class="`px-6 py-3 text-sm font-semibold ${investmentReturnsStyling.textColor} sticky left-0 ${investmentReturnsStyling.stickyBgColor} z-20 border-r border-t-2 border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${investmentReturnsStyling.textColor} mr-2`">{{ investmentReturnsConfig.symbol }}</span>
        {{ investmentReturnsConfig.label }}
      </div>
    </td>
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearInvestmentIncomingTotal(), selectedYear, currentYear, currentMonth, -1)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getPreviousYearInvestmentIncomingTooltip()" position="top">
        <div v-if="getPreviousYearInvestmentIncomingTotal() > 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearInvestmentIncomingTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    <td v-for="(month, index) in months" :key="`eq-inv-in-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyInvestmentIncoming(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getInvestmentIncomingTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyInvestmentIncoming(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalInvestmentIncoming())} border-t-2 border-l-2 border-gray-200 sticky right-32 ${investmentReturnsStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="getInvestmentIncomingYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalInvestmentIncoming(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${investmentReturnsStyling.stickyBgColor} z-30 border-l border-gray-200`"></td>
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
  },
  

  calculatePreviousYearIncomeTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotal: {
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
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentIncomingTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedInvestmentIncoming) return ''
  
  const displayedAmount = props.calculateMonthlyInvestmentIncoming(monthIndex)
  const plannedAmount = props.calculateMonthlyPlannedInvestmentIncoming(monthIndex)
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getIncomeYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedIncome) return ''
  
  const displayedAmount = props.calculateGrandTotalIncome()
  const plannedAmount = props.calculateGrandTotalPlannedIncome()
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getInvestmentIncomingYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlannedInvestmentIncoming) return ''
  
  const displayedAmount = props.calculateGrandTotalInvestmentIncoming()
  const plannedAmount = props.calculateGrandTotalPlannedInvestmentIncoming()
  const actualAmount = displayedAmount - plannedAmount
  const variance = actualAmount
  
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
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
  
  if (detailedValues && detailedValues.income) {
    const planned = detailedValues.income.planned
    const actual = detailedValues.income.actual
    const variance = actual - planned
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Income<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(planned)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(actual)}</span><br>` +
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
  
  if (detailedValues && detailedValues.investmentIncoming) {
    const planned = detailedValues.investmentIncoming.planned
    const actual = detailedValues.investmentIncoming.actual
    const variance = actual - planned
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    
    return `PY ${previousYear} Investment Returns<br>` +
           `Planned: <span class="text-blue-300">${props.formatCurrency(planned)}</span><br>` +
           `Actual: <span class="text-green-300">${props.formatCurrency(actual)}</span><br>` +
           `Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Fallback to simple display
  return `PY ${previousYear} Investment Returns (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}
</script> 