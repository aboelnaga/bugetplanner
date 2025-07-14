<template>
  <tr class="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100">
    <!-- Budget Item Info Cell -->
    <td class="px-6 py-3 sticky left-0 bg-white z-20 border-r border-gray-200">
      <div>
        <!-- Budget Name and Type Badge -->
        <div class="flex items-center justify-between">
          <div class="font-semibold text-gray-900 text-base leading-tight">{{ budget.name }}</div>
          <span :class="getTypeBadgeClasses()">
            <TrendingUp v-if="isIncomeType" class="w-3 h-3 mr-1" />
            <TrendingDown v-else class="w-3 h-3 mr-1" />
            {{ budgetTypeLabel }}
          </span>
        </div>
        
        <!-- Category -->
        <div class="text-sm text-gray-600 font-medium">{{ budget.category }}</div>
        
        <!-- Recurrence and Schedule Info -->
        <div class="space-y-0.5">
          <div class="text-xs text-blue-600 flex items-center font-medium">
            <Repeat class="w-3 h-3 mr-1" />
            {{ budget.recurrence }}
          </div>
          <div v-if="shouldShowStartMonth(months)" class="text-xs text-orange-600 flex items-center font-medium">
            <Calendar class="w-3 h-3 mr-1" />
            Starts: {{ months[budget.startMonth] }}
          </div>
        </div>
      </div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-3 py-3 text-center border-r border-gray-100',
          selectedYear === currentYear && index === currentMonth ? 'bg-sky-100' : ''
        ]">
      <div class="relative">
        <div :class="getMonthlyCellClasses(selectedYear, currentYear, currentMonth, index, isScheduledMonth, getBudgetAmount)">
          <span v-if="getBudgetAmount(budget, index) > 0" class="font-medium">
            {{ formatAmountWithSign(getBudgetAmount(budget, index), formatCurrency) }}
          </span>
          <span v-else class="text-gray-400 font-normal">—</span>
        </div>
        <div v-if="hasChanges(budget.id, index)" 
             title="This amount has been manually modified"
             class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div>
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td :class="getYearlyTotalCellClasses(calculateYearlyTotal)" class="px-3 py-3 text-center border-r border-gray-100">
      <span v-if="calculateYearlyTotal(budget) > 0" class="font-semibold">
        {{ formatAmountWithSign(calculateYearlyTotal(budget), formatCurrency) }}
      </span>
      <span v-else class="text-gray-400 font-normal">—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-3 text-center sticky right-0 bg-white z-20 border-l border-gray-200">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('edit-budget', budget)" 
                :title="getActionButtonConfig('EDIT').title"
                :class="`${getActionButtonConfig('EDIT').padding} ${getActionButtonConfig('EDIT').color} ${getActionButtonConfig('EDIT').hoverColor} ${getActionButtonConfig('EDIT').hoverBg} ${getActionButtonConfig('EDIT').borderRadius} ${getActionButtonConfig('EDIT').transition}`">
          <Edit :class="getActionButtonConfig('EDIT').size" />
        </button>
        <button @click="$emit('duplicate-budget', budget)" 
                :title="getActionButtonConfig('DUPLICATE').title"
                :class="`${getActionButtonConfig('DUPLICATE').padding} ${getActionButtonConfig('DUPLICATE').color} ${getActionButtonConfig('DUPLICATE').hoverColor} ${getActionButtonConfig('DUPLICATE').hoverBg} ${getActionButtonConfig('DUPLICATE').borderRadius} ${getActionButtonConfig('DUPLICATE').transition}`">
          <Copy :class="getActionButtonConfig('DUPLICATE').size" />
        </button>
        <button @click="$emit('delete-budget', budget.id)" 
                :title="getActionButtonConfig('DELETE').title"
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

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 