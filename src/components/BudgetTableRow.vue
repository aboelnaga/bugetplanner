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
          
          <!-- Multi-Year Indicator -->
          <div v-if="budget.is_multi_year" class="flex items-center text-purple-600">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">{{ budget.start_year }}-{{ budget.end_year }}</span>
          </div>
          
          <!-- Linked Investment Indicator -->
          <div v-if="budget.linked_investment_id" class="flex items-center text-blue-600">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span class="text-xs">Linked</span>
          </div>
        </div>
      </div>
    </td>


    <!-- Previous Year Column -->
    <td class="px-3 py-4 text-center border-r border-gray-200 bg-gray-50">
      <div v-if="getPreviousYearAmount(budget) > 0">
        <BaseTooltip :content="getPreviousYearTooltip(budget)" position="top">
          <div class="text-sm text-gray-600 cursor-help">
            {{ formatCurrency(getPreviousYearAmount(budget)) }}
          </div>
        </BaseTooltip>
      </div>
      <div v-else class="text-gray-400 font-normal">—</div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-3 py-4 text-center border-r border-gray-100',
          selectedYear === currentYear && index === currentMonth ? 'bg-sky-100' : ''
        ]">
      <div class="relative">
        <div :class="getMonthlyCellClasses(selectedYear, currentYear, currentMonth, index, isScheduledMonth, getBudgetAmount)">
          <div v-if="getSmartDefaultAmount(budget, index) > 0">
            <BaseTooltip :content="getSmartDefaultTooltip(budget, index)" position="top">
              <div class="font-medium cursor-help">
                {{ formatAmountWithSign(getSmartDefaultAmount(budget, index), formatCurrency) }}
              </div>
            </BaseTooltip>
          </div>
          <div v-else class="text-gray-400 font-normal">—</div>
        </div>
        <!-- <div v-if="hasChanges(budget.id, index)" 
             title="This amount has been manually modified"
             class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div> -->
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td :class="getYearlyTotalCellClasses(calculateYearlyTotal)" class="border-l-2 border-gray-150 text-sm sticky right-32 bg-white z-20">
      <div v-if="calculateYearlyTotal(budget) > 0">
        <BaseTooltip :content="getYearlyTotalTooltip(budget)" position="top">
          <div class="font-medium cursor-help">
            {{ formatAmountWithSign(calculateYearlyTotal(budget), formatCurrency) }}
          </div>
        </BaseTooltip>
      </div>
      <span v-else class="text-gray-400 font-normal">—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-4 text-center sticky right-0 bg-white z-20 border-l border-gray-100">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('edit-budget', budget)" 
                :title="getActionButtonConfig('EDIT').title"
                :aria-label="getActionButtonConfig('EDIT').ariaLabel"
                :class="`${getActionButtonConfig('EDIT').padding} ${getActionButtonConfig('EDIT').color} ${getActionButtonConfig('EDIT').hoverColor} ${getActionButtonConfig('EDIT').hoverBg} ${getActionButtonConfig('EDIT').borderRadius} ${getActionButtonConfig('EDIT').transition}`"
                data-testid="edit-budget-btn">
          <Edit :class="getActionButtonConfig('EDIT').size" />
        </button>
        <button @click="$emit('duplicate-budget', budget)" 
                :title="getActionButtonConfig('DUPLICATE').title"
                :aria-label="getActionButtonConfig('DUPLICATE').ariaLabel"
                :class="`${getActionButtonConfig('DUPLICATE').padding} ${getActionButtonConfig('DUPLICATE').color} ${getActionButtonConfig('DUPLICATE').hoverColor} ${getActionButtonConfig('DUPLICATE').hoverBg} ${getActionButtonConfig('DUPLICATE').borderRadius} ${getActionButtonConfig('DUPLICATE').transition}`"
                data-testid="duplicate-budget-btn">
          <Copy :class="getActionButtonConfig('DUPLICATE').size" />
        </button>
        <button @click="$emit('delete-budget', budget.id)" 
                :title="getActionButtonConfig('DELETE').title"
                :aria-label="getActionButtonConfig('DELETE').ariaLabel"
                :class="`${getActionButtonConfig('DELETE').padding} ${getActionButtonConfig('DELETE').color} ${getActionButtonConfig('DELETE').hoverColor} ${getActionButtonConfig('DELETE').hoverBg} ${getActionButtonConfig('DELETE').borderRadius} ${getActionButtonConfig('DELETE').transition}`"
                data-testid="delete-budget-btn">
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
import BaseTooltip from '@/components/BaseTooltip.vue'
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
import { useBudgetStore } from '@/stores/budget.js'

// Stores
const yearlySummariesStore = useYearlySummariesStore()
const budgetStore = useBudgetStore()

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
  },
  

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
  const variance = actualAmount - plannedAmount
  
  // Closed months
  if (isMonthClosed(monthIndex)) {
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
    return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Variance: <span class="${varianceColor}">${varianceText}</span>`
  }
  
  // Current month
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    if (actualAmount > plannedAmount) {
      const overspent = actualAmount - plannedAmount
      return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Overspent: <span class="text-red-300">${props.formatCurrency(overspent)}</span>`
    } else {
      const remaining = plannedAmount - actualAmount
      return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span><br>Actual: <span class="text-green-300">${props.formatCurrency(actualAmount)}</span><br>Remaining: <span class="text-yellow-300">${props.formatCurrency(remaining)}</span>`
    }
  }
  
  // Future months
  if (props.selectedYear > props.currentYear || 
      (props.selectedYear === props.currentYear && monthIndex > props.currentMonth)) {
    return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span>`
  }
  
  // Past months (not closed)
  return `Planned: <span class="text-blue-300">${props.formatCurrency(plannedAmount)}</span>`
}

const getPreviousYearAmount = (budget) => {
  // Get previous year budget items from the budget store
  const previousYearItems = budgetStore.previousYearItems || []
  
  // If no previous year items loaded, return 0
  if (previousYearItems.length === 0) return 0
  
  // Find matching budget item by name and category
  const matchingItem = previousYearItems.find(item => 
    item.name === budget.name && 
    item.category === budget.category &&
    item.type === budget.type
  )
  
  if (!matchingItem) return 0
  
  // Use smart defaults logic for previous year amounts
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const previousYear = currentYear - 1
  
  // For previous years, always show actual amounts
  if (previousYear < currentYear) {
    if (matchingItem.actual_amounts && Array.isArray(matchingItem.actual_amounts)) {
      return matchingItem.actual_amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    }
    // Fallback to planned amounts if no actuals
    if (matchingItem.amounts && Array.isArray(matchingItem.amounts)) {
      return matchingItem.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    }
  }
  
  return 0
}

const getPreviousYearTooltip = (budget) => {
  // Get previous year budget items from the budget store
  const previousYearItems = budgetStore.previousYearItems || []
  
  // If no previous year items loaded, return message
  if (previousYearItems.length === 0) return 'No previous year data available'
  
  // Find matching budget item by name and category
  const matchingItem = previousYearItems.find(item => 
    item.name === budget.name && 
    item.category === budget.category &&
    item.type === budget.type
  )
  
  if (!matchingItem) return 'No previous year data available'
  
  // Calculate planned and actual totals
  const plannedTotal = matchingItem.amounts && Array.isArray(matchingItem.amounts) 
    ? matchingItem.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    : 0
  
  const actualTotal = matchingItem.actual_amounts && Array.isArray(matchingItem.actual_amounts)
    ? matchingItem.actual_amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    : 0
  
  const variance = actualTotal - plannedTotal
  const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
  const varianceText = variance >= 0 ? `+${props.formatCurrency(variance)}` : props.formatCurrency(variance)
  
  return `Previous Year (${props.selectedYear - 1})<br>` +
         `Planned: <span class="text-blue-300">${props.formatCurrency(plannedTotal)}</span><br>` +
         `Actual: <span class="text-green-300">${props.formatCurrency(actualTotal)}</span><br>` +
         `Variance: <span class="${varianceColor}">${varianceText}</span>`
}

const getYearlyTotalTooltip = (budget) => {
  const yearlyTotal = props.calculateYearlyTotal(budget)
  const formattedTotal = props.formatCurrency(yearlyTotal)
  
  return `Total: <span class="text-green-300">${formattedTotal}</span><br>Category: <span class="text-blue-300">${budget.category}</span>`
}

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 