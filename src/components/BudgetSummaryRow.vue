<template>
  <!-- Summary Row -->
  <tr v-if="shouldShowSummaryRow(rowType)" :class="`${rowStyling.bgColor} ${borderTopClass}`">
    <td :class="`px-6 py-3 ${rowConfig.fontSize} ${rowConfig.fontWeight} ${rowStyling.textColor} sticky left-0 ${rowStyling.stickyBgColor} z-20 border-r ${borderTopClass} border-gray-200`">
      <div class="flex items-center truncate">
        <span :class="`text-lg font-bold ${rowStyling.textColor} mr-2`">{{ rowConfig.symbol }}</span>
        {{ rowConfig.label }}
      </div>
      <div v-if="rowConfig.subtitle" class="text-xs text-gray-500 mt-1">
        {{ rowConfig.subtitle }}
      </div>
    </td>
    
    <!-- Previous Year Column -->
    <td :class="`${getSummaryCellClasses(previousYearValue, selectedYear, currentYear, currentMonth, -1, rowType)} ${borderTopClass} border-gray-200`">
      <BaseTooltip :content="previousYearTooltip" position="top">
        <div v-if="previousYearValue !== 0" class="cursor-help">
          {{ formatSummaryValue(previousYearValue, formatCurrency) }}
        </div>
        <div v-else class="text-gray-400 font-normal cursor-help">—</div>
      </BaseTooltip>
    </td>
    
    <!-- Monthly Columns -->
    <td v-for="(month, index) in months" :key="`${rowType}-${month}`" 
        :class="`${getSummaryCellClasses(monthlyValues[index], selectedYear, currentYear, currentMonth, index, rowType)} ${borderTopClass} border-gray-200`">
      <BaseTooltip :content="monthlyTooltips[index]" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(monthlyValues[index], formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    
    <!-- Total Column -->
    <td :class="`${getSummaryTotalClasses(grandTotalValue)} ${borderTopClass} border-l-2 border-gray-200 sticky right-32 ${rowStyling.stickyBgColor} z-20`">
      <BaseTooltip :content="grandTotalTooltip" position="top">
        <div class="cursor-help">
          {{ formatSummaryValue(grandTotalValue, formatCurrency) }}
        </div>
      </BaseTooltip>
    </td>
    
    <!-- Action Column -->
    <td :class="`px-4 py-3 sticky right-0 ${rowStyling.stickyBgColor} z-30 border-l border-gray-200 ${borderTopClass}`"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetSummaries } from '@/composables/useBudgetSummaries.js'
import BaseTooltip from '@/components/BaseTooltip.vue'

// Props
const props = defineProps({
  // Row configuration
  rowType: {
    type: String,
    required: true,
    validator: (value) => [
      'TOTAL_INCOME', 'INVESTMENT_RETURNS', 
      'TOTAL_EXPENSES', 'INVESTMENT_PURCHASES',
      'NET_BALANCE', 'NET_INVESTMENT', 'SAVINGS'
    ].includes(value)
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
  
  // Values
  previousYearValue: {
    type: Number,
    required: true
  },
  monthlyValues: {
    type: Array,
    required: true
  },
  grandTotalValue: {
    type: Number,
    required: true
  },
  
  // Tooltips
  previousYearTooltip: {
    type: String,
    required: true
  },
  monthlyTooltips: {
    type: Array,
    required: true
  },
  grandTotalTooltip: {
    type: String,
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
  computed(() => props.hasExpenseData),
  computed(() => props.hasInvestmentData),
  computed(() => props.hasInvestmentIncomingData),
  computed(() => props.hasInvestmentOutgoingData),
  computed(() => props.hasAnyData)
)

// Get row configuration and styling
const rowConfig = computed(() => getSummaryRowConfig(props.rowType))
const rowStyling = computed(() => getSummaryRowStyling(props.rowType))
</script> 