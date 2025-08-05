<template>
  <!-- Divider Line -->
  <tr v-if="shouldShowSummaryRow('NET_BALANCE')" class="bg-gray-100">
    <td class="p-0 border-t-2 border-gray-200"></td>
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
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearNetTotal(), selectedYear, currentYear, currentMonth, -1)}`">
      <BaseTooltip :content="getPreviousYearNetTooltip()" position="top">
        <div v-if="getPreviousYearNetTotal() !== 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearNetTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    <td v-for="(month, index) in months" :key="`eq-net-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyTotal(index), selectedYear, currentYear, currentMonth, index)}`">
      <BaseTooltip :content="getNetBalanceTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyTotal(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotal(), true)} sticky right-32 ${netBalanceStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="getNetBalanceYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotal(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-4 sticky right-0 ${netBalanceStyling.stickyBgColor} z-30 border-l border-gray-200`"></td>
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
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(getPreviousYearInvestmentNetTotal(), selectedYear, currentYear, currentMonth, -1)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getPreviousYearInvestmentNetTooltip()" position="top">
        <div v-if="getPreviousYearInvestmentNetTotal() !== 0" class="cursor-help">
          {{ formatSummaryValue(getPreviousYearInvestmentNetTotal(), formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    <td v-for="(month, index) in months" :key="`net-inv-${month}`" 
        :class="`${getSummaryCellClasses(calculateMonthlyInvestmentNet(index), selectedYear, currentYear, currentMonth, index)} border-t-2 border-gray-200`">
      <BaseTooltip :content="getNetInvestmentTooltip(index)" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateMonthlyInvestmentNet(index), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`${getSummaryTotalClasses(calculateGrandTotalInvestmentNet())} border-t-2 border-l-2 border-gray-200 sticky right-32 ${netInvestmentStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="getNetInvestmentYearlyTooltip()" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(calculateGrandTotalInvestmentNet(), formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${netInvestmentStyling.stickyBgColor} z-30 border-l border-gray-200 border-t-2`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
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
  

  calculatePreviousYearNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotal: {
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
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues()
  
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
  const detailedValues = yearlySummariesStore.getDetailedPreviousYearValues()
  
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
</script> 