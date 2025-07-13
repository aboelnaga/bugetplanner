<template>
  <!-- Divider Line -->
  <tr v-if="shouldShowSummaryRow('NET_BALANCE')" class="bg-gray-100">
    <td class="p-0 border-t-2 border-gray-400"></td>
    <td v-for="(month, index) in months" :key="`divider-${month}`" class="p-0 border-t-2 border-gray-400"></td>
    <td class="p-0 border-t-2 border-gray-400"></td>
    <td class="p-0"></td>
  </tr>

  <!-- Net Balance Line -->
  <tr v-if="shouldShowSummaryRow('NET_BALANCE')" :class="netBalanceStyling.bgColor + ' font-bold'">
    <td :class="`px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 ${netBalanceStyling.stickyBgColor} z-10`">
      <div class="flex items-center">
        <span :class="`text-xl font-bold ${netBalanceStyling.textColor} mr-2`">{{ netBalanceConfig.symbol }}</span>
        {{ netBalanceConfig.label }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`eq-net-${month}`" 
        :class="getSummaryCellClasses(calculateMonthlyTotal(index), selectedYear, currentYear, currentMonth, index)">
      {{ formatSummaryValue(calculateMonthlyTotal(index), formatCurrency) }}
    </td>
    <td :class="getSummaryTotalClasses(calculateGrandTotal(), true)">
      {{ formatSummaryValue(calculateGrandTotal(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-4 sticky right-0 ${netBalanceStyling.stickyBgColor} z-10`"></td>
  </tr>

  <!-- Net Investment Row -->
  <tr v-if="shouldShowSummaryRow('NET_INVESTMENT')" :class="netInvestmentStyling.bgColor">
    <td :class="`px-6 py-3 text-sm font-semibold text-indigo-700 sticky left-0 ${netInvestmentStyling.stickyBgColor} z-10`">
      <div class="flex items-center">
        <span :class="`text-lg font-bold ${netInvestmentStyling.textColor} mr-2`">{{ netInvestmentConfig.symbol }}</span>
        {{ netInvestmentConfig.label }}
      </div>
      <div class="text-xs text-gray-500 mt-1">
        {{ netInvestmentConfig.subtitle }}
      </div>
    </td>
    <td v-for="(month, index) in months" :key="`net-inv-${month}`" 
        :class="getSummaryCellClasses(calculateMonthlyInvestmentNet(index), selectedYear, currentYear, currentMonth, index)">
      {{ formatSummaryValue(calculateMonthlyInvestmentNet(index), formatCurrency) }}
    </td>
    <td :class="getSummaryTotalClasses(calculateGrandTotalInvestmentNet())">
      {{ formatSummaryValue(calculateGrandTotalInvestmentNet(), formatCurrency) }}
    </td>
    <td :class="`px-4 py-3 sticky right-0 ${netInvestmentStyling.stickyBgColor} z-10`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { SUMMARY_ROWS } from '@/constants/budgetConstants.js'
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
</script> 