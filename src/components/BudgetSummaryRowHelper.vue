<template>
  <BudgetSummaryRow
    :row-type="rowType"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="hasIncomeData"
    :has-expense-data="hasExpenseData"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="hasInvestmentIncomingData"
    :has-investment-outgoing-data="hasInvestmentOutgoingData"
    :has-any-data="hasAnyData"
    :previous-year-value="previousYearValue"
    :monthly-values="monthlyValues"
    :grand-total-value="grandTotalValue"
    :previous-year-tooltip="previousYearTooltip"
    :monthly-tooltips="monthlyTooltips"
    :grand-total-tooltip="grandTotalTooltip"
    :format-currency="formatCurrency"
    :border-top-class="borderTopClass" />
</template>

<script setup>
import { computed } from 'vue'
import BudgetSummaryRow from './BudgetSummaryRow.vue'

// Props
const props = defineProps({
  // Row configuration
  rowType: {
    type: String,
    required: true
  },
  
  // Data
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
  hasExpenseData: {
    type: Boolean,
    required: true
  },
  hasInvestmentData: {
    type: Boolean,
    required: true
  },
  hasInvestmentIncomingData: {
    type: Boolean,
    required: true
  },
  hasInvestmentOutgoingData: {
    type: Boolean,
    required: true
  },
  hasAnyData: {
    type: Boolean,
    required: true
  },
  
  // Calculation functions
  calculateMonthly: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
    type: Function,
    required: true
  },
  calculatePreviousYear: {
    type: Function,
    required: true
  },
  
  // Tooltip functions
  getMonthlyTooltip: {
    type: Function,
    required: true
  },
  getGrandTotalTooltip: {
    type: Function,
    required: true
  },
  getPreviousYearTooltip: {
    type: Function,
    required: true
  },
  
  // Functions
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Styling
  borderTopClass: {
    type: String,
    default: 'border-t-2'
  }
})

// Computed values
const previousYearValue = computed(() => props.calculatePreviousYear())
const grandTotalValue = computed(() => props.calculateGrandTotal())

const monthlyValues = computed(() => {
  return props.months.map((_, index) => props.calculateMonthly(index))
})

const monthlyTooltips = computed(() => {
  return props.months.map((_, index) => props.getMonthlyTooltip(index))
})

const previousYearTooltip = computed(() => props.getPreviousYearTooltip())
const grandTotalTooltip = computed(() => props.getGrandTotalTooltip())
</script> 