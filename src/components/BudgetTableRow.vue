<template>
  <tr class="hover:bg-gray-50 transition-colors duration-200">
    <!-- Budget Item Info Cell -->
    <td class="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray-100">
      <div class="space-y-1">
        <!-- Budget Name -->
        <div class="font-semibold text-gray-900 text-sm leading-tight truncate">{{ budget.name }}</div>
        
        <!-- Category -->
        <div class="text-xs text-gray-600 truncate">{{ budget.category }}</div>
        
        <!-- Secondary Info: Recurrence and Schedule -->
        <div class="flex items-center space-x-4 text-xs">
          <!-- Type Badge -->
          <span :class="getTypeBadgeClasses()">
            <TrendingUp v-if="isIncomeType" class="w-3 h-3 mr-1" />
            <TrendingDown v-else class="w-3 h-3 mr-1" />
            {{ budgetTypeLabel }}
          </span>
        </div>
      </div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-3 py-4 text-center border-r border-gray-100',
          selectedYear === currentYear && index === currentMonth ? 'bg-sky-100' : ''
        ]">
      <div class="relative">
        <div :class="getMonthlyCellClasses(selectedYear, currentYear, currentMonth, index, isScheduledMonth, getBudgetAmount)">
          <div v-if="getSmartDefaultAmount(budget, index) > 0" 
               :title="getSmartDefaultTooltip(budget, index)"
               class="font-medium cursor-help">
            {{ formatAmountWithSign(getSmartDefaultAmount(budget, index), formatCurrency) }}
          </div>
          <div v-else class="text-gray-400 font-normal">—</div>
        </div>
        <!-- <div v-if="hasChanges(budget.id, index)" 
             title="This amount has been manually modified"
             class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div> -->
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td :class="getYearlyTotalCellClasses(calculateYearlyTotal)" class="border-l-2 border-gray-150 text-sm">
      <span v-if="calculateYearlyTotal(budget) > 0" class="font-medium">
        {{ formatAmountWithSign(calculateYearlyTotal(budget), formatCurrency) }}
      </span>
      <span v-else class="text-gray-400 font-normal">—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-4 text-center sticky right-0 bg-white z-10 border-l border-gray-100">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('edit-budget', budget)" 
                :title="getActionButtonConfig('EDIT').title"
                :aria-label="getActionButtonConfig('EDIT').ariaLabel"
                :class="`${getActionButtonConfig('EDIT').padding} ${getActionButtonConfig('EDIT').color} ${getActionButtonConfig('EDIT').hoverColor} ${getActionButtonConfig('EDIT').hoverBg} ${getActionButtonConfig('EDIT').borderRadius} ${getActionButtonConfig('EDIT').transition}`">
          <Edit :class="getActionButtonConfig('EDIT').size" />
        </button>
        <button @click="$emit('duplicate-budget', budget)" 
                :title="getActionButtonConfig('DUPLICATE').title"
                :aria-label="getActionButtonConfig('DUPLICATE').ariaLabel"
                :class="`${getActionButtonConfig('DUPLICATE').padding} ${getActionButtonConfig('DUPLICATE').color} ${getActionButtonConfig('DUPLICATE').hoverColor} ${getActionButtonConfig('DUPLICATE').hoverBg} ${getActionButtonConfig('DUPLICATE').borderRadius} ${getActionButtonConfig('DUPLICATE').transition}`">
          <Copy :class="getActionButtonConfig('DUPLICATE').size" />
        </button>
        <button @click="$emit('delete-budget', budget.id)" 
                :title="getActionButtonConfig('DELETE').title"
                :aria-label="getActionButtonConfig('DELETE').ariaLabel"
                :class="`${getActionButtonConfig('DELETE').padding} ${getActionButtonConfig('DELETE').color} ${getActionButtonConfig('DELETE').hoverColor} ${getActionButtonConfig('DELETE').hoverBg} ${getActionButtonConfig('DELETE').borderRadius} ${getActionButtonConfig('DELETE').transition}`">
          <Trash2 :class="getActionButtonConfig('DELETE').size" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Copy, Trash2, TrendingDown, TrendingUp, Calendar, Repeat } from 'lucide-vue-next'
import { useBudgetTableRow } from '@/composables/useBudgetTableRow.js'

// Props
const props = defineProps({
  budget: {
    type: Object,
    required: true
  },
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
  
  // Functions
  isScheduledMonth: {
    type: Function,
    required: true
  },
  getBudgetAmount: {
    type: Function,
    required: true
  },
  hasChanges: {
    type: Function,
    required: true
  },
  calculateYearlyTotal: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Month closure props for smart defaults
  closedMonths: {
    type: Array,
    default: () => []
  },
  getActualAmount: {
    type: Function,
    default: null
  }
})

// Use budget table row composable
const {
  budgetTypeLabel,
  isIncomeType,
  getTypeBadgeClasses,
  getMonthlyCellClasses,
  getYearlyTotalCellClasses,
  formatAmountWithSign,
  getActionButtonConfig,
  shouldShowStartMonth
} = useBudgetTableRow(computed(() => props.budget))

// Smart defaults logic
const isMonthClosed = (monthIndex) => {
  return props.closedMonths.some(closedMonth => closedMonth.month === monthIndex)
}

const getSmartDefaultAmount = (budget, monthIndex) => {
  const plannedAmount = props.getBudgetAmount(budget, monthIndex)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0
  
  // Closed months: Show actual amounts
  if (isMonthClosed(monthIndex)) {
    return actualAmount
  }
  
  // Current month: Show planned unless actual exceeds planned
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    return actualAmount > plannedAmount ? actualAmount : plannedAmount
  }
  
  // Future months: Show planned amounts
  if (props.selectedYear > props.currentYear || 
      (props.selectedYear === props.currentYear && monthIndex > props.currentMonth)) {
    return plannedAmount
  }
  
  // Past months (not closed): Show planned amounts
  return plannedAmount
}

const getSmartDefaultTooltip = (budget, monthIndex) => {
  const plannedAmount = props.getBudgetAmount(budget, monthIndex)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[monthIndex]
  
  // Closed months
  if (isMonthClosed(monthIndex)) {
    const variance = actualAmount - plannedAmount
    const variancePercent = plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0
    const varianceText = variance >= 0 ? `+${variancePercent.toFixed(1)}%` : `${variancePercent.toFixed(1)}%`
    return `Actual: ${props.formatCurrency(actualAmount)} | Planned: ${props.formatCurrency(plannedAmount)} | Variance: ${varianceText}`
  }
  
  // Current month
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    const remaining = plannedAmount - actualAmount
    if (actualAmount > plannedAmount) {
      return `Actual: ${props.formatCurrency(actualAmount)} | Planned: ${props.formatCurrency(plannedAmount)} | Overspent: ${props.formatCurrency(actualAmount - plannedAmount)}`
    } else {
      return `Planned: ${props.formatCurrency(plannedAmount)} | Actual so far: ${props.formatCurrency(actualAmount)} | Remaining: ${props.formatCurrency(remaining)}`
    }
  }
  
  // Future months
  if (props.selectedYear > props.currentYear || 
      (props.selectedYear === props.currentYear && monthIndex > props.currentMonth)) {
    return `Planned: ${props.formatCurrency(plannedAmount)} | Based on: Previous month average`
  }
  
  // Past months (not closed)
  return `Planned: ${props.formatCurrency(plannedAmount)} | Month not yet closed`
}

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 