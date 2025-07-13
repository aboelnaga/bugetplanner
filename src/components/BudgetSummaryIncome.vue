<template>
  <!-- Income Line -->
  <tr v-if="shouldShowSummaryRow('TOTAL_INCOME')" :class="totalIncomeStyling.bgColor">
    <td :class="`px-6 py-3 text-sm font-semibold text-green-700 sticky left-0 ${totalIncomeStyling.stickyBgColor} z-10`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${totalIncomeStyling.textColor} mr-2`">{{ totalIncomeConfig.symbol }}</span>
        {{ totalIncomeConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-income-${month}`" 
        :class="getSummaryCellClasses(calculateMonthlyIncome(index), selectedYear, currentYear, currentMonth, index)">
      {{ formatSummaryValue(calculateMonthlyIncome(index), formatCurrency) }}
    </td>
    <td :class="getSummaryTotalClasses(calculateGrandTotalIncome())">
      {{ formatSummaryValue(calculateGrandTotalIncome(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${totalIncomeStyling.stickyBgColor} z-10`"></td>
  </tr>

  <!-- Investment Returns Line -->
  <tr v-if="shouldShowSummaryRow('INVESTMENT_RETURNS')" :class="investmentReturnsStyling.bgColor">
    <td :class="`px-6 py-3 text-sm font-semibold text-green-700 sticky left-0 ${investmentReturnsStyling.stickyBgColor} z-10`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${investmentReturnsStyling.textColor} mr-2`">{{ investmentReturnsConfig.symbol }}</span>
        {{ investmentReturnsConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-inv-in-${month}`" 
        :class="getSummaryCellClasses(calculateMonthlyInvestmentIncoming(index), selectedYear, currentYear, currentMonth, index)">
      {{ formatSummaryValue(calculateMonthlyInvestmentIncoming(index), formatCurrency) }}
    </td>
    <td :class="getSummaryTotalClasses(calculateGrandTotalInvestmentIncoming())">
      {{ formatSummaryValue(calculateGrandTotalInvestmentIncoming(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${investmentReturnsStyling.stickyBgColor} z-10`"></td>
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
  computed(() => FILTER_OPTIONS.ALL), // selectedTypeFilter not needed for income summaries
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
</script> 