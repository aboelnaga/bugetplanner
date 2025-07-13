<template>
  <tr class="hover:bg-gray-50">
    <!-- Budget Item Info Cell -->
    <td class="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
      <div>
        <div class="flex items-center">
          <div class="font-semibold">{{ budget.name }}</div>
          <span :class="getTypeBadgeClasses()">
            <TrendingUp v-if="isIncomeType" class="w-3 h-3 mr-1" />
            <TrendingDown v-else class="w-3 h-3 mr-1" />
            {{ budgetTypeLabel }}
          </span>
        </div>
        <div class="text-xs text-gray-500">{{ budget.category }}</div>
        <div class="text-xs text-blue-600 flex items-center">
          <Repeat class="w-3 h-3 mr-1" />
          {{ budget.recurrence }}
        </div>
        <div v-if="shouldShowStartMonth(months)" class="text-xs text-orange-600 flex items-center">
          <Calendar class="w-3 h-3 mr-1" />
          Starts: {{ months[budget.startMonth] }}
        </div>
      </div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-2 py-4 text-center',
          selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : ''
        ]">
      <div class="relative">
        <div :class="getMonthlyCellClasses(selectedYear, currentYear, currentMonth, index, isScheduledMonth, getBudgetAmount)">
          <span v-if="getBudgetAmount(budget, index) > 0">
            {{ formatAmountWithSign(getBudgetAmount(budget, index), formatCurrency) }}
          </span>
          <span v-else class="text-gray-400">—</span>
        </div>
        <div v-if="hasChanges(budget.id, index)" 
             title="This amount has been manually modified"
             class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td :class="getYearlyTotalCellClasses(calculateYearlyTotal)">
      <span v-if="calculateYearlyTotal(budget) > 0">
        {{ formatAmountWithSign(calculateYearlyTotal(budget), formatCurrency) }}
      </span>
      <span v-else>—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-4 text-center sticky right-0 bg-white z-10">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('edit-budget', budget)" 
                :title="getActionButtonConfig('EDIT').title"
                :class="`p-2 ${getActionButtonConfig('EDIT').color} ${getActionButtonConfig('EDIT').hoverColor} ${getActionButtonConfig('EDIT').hoverBg} rounded-md transition-colors`">
          <Edit class="w-5 h-5" />
        </button>
        <button @click="$emit('duplicate-budget', budget)" 
                :title="getActionButtonConfig('DUPLICATE').title"
                :class="`p-2 ${getActionButtonConfig('DUPLICATE').color} ${getActionButtonConfig('DUPLICATE').hoverColor} ${getActionButtonConfig('DUPLICATE').hoverBg} rounded-md transition-colors`">
          <Copy class="w-5 h-5" />
        </button>
        <button @click="$emit('delete-budget', budget.id)" 
                :title="getActionButtonConfig('DELETE').title"
                :class="`p-2 ${getActionButtonConfig('DELETE').color} ${getActionButtonConfig('DELETE').hoverColor} ${getActionButtonConfig('DELETE').hoverBg} rounded-md transition-colors`">
          <Trash2 class="w-5 h-5" />
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