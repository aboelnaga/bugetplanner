<template>
  <template v-for="(group, categoryName) in groupedBudgetItems" :key="categoryName">
    <!-- Category Header -->
    <tr class="bg-gray-200">
      <td class="px-6 py-3 text-sm font-bold text-gray-800 sticky left-0 bg-gray-200 z-10">
        <div>
          <div>{{ categoryName }} ({{ group.length }} items)</div>
          <div :class="[
            'text-xs font-normal',
            getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700'
          ]">
            <span v-if="calculateCategoryTotal(group) > 0">
              {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryTotal(group)) }} total
            </span>
            <span v-else class="text-gray-400">— total</span>
          </div>
        </div>
      </td>
      <td v-for="(month, index) in months" :key="`header-${categoryName}-${month}`" 
          :class="[
            'px-4 py-3 bg-gray-200 text-center font-semibold',
            selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : '',
            calculateCategoryMonthlyTotal(group, index) > 0 ? 
              (getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700') 
              : 'text-gray-400'
          ]">
        <span v-if="calculateCategoryMonthlyTotal(group, index) > 0">
          {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryMonthlyTotal(group, index)) }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </td>
      <td :class="[
        'px-4 py-3 bg-gray-200 text-center font-bold',
        calculateCategoryTotal(group) > 0 ? 
          (getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700') 
          : 'text-gray-400'
      ]">
        <span v-if="calculateCategoryTotal(group) > 0">
          {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryTotal(group)) }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </td>
      <td class="px-4 py-3 bg-gray-200 sticky right-0 z-10"></td>
    </tr>
    
    <!-- Category Items -->
    <BudgetTableRow
      v-for="budget in group"
      :key="budget.id"
      :budget="budget"
      :months="months"
      :selected-year="selectedYear"
      :current-year="currentYear"
      :current-month="currentMonth"
      :is-scheduled-month="isScheduledMonth"
      :get-budget-amount="getBudgetAmount"
      :has-changes="hasChanges"
      :calculate-yearly-total="calculateYearlyTotal"
      :format-currency="formatCurrency"
      @edit-budget="$emit('edit-budget', $event)"
      @duplicate-budget="$emit('duplicate-budget', $event)"
      @delete-budget="$emit('delete-budget', $event)" />
  </template>
</template>

<script setup>
import BudgetTableRow from './BudgetTableRow.vue'

// Props
const props = defineProps({
  groupedBudgetItems: {
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
  getCategoryType: {
    type: Function,
    required: true
  },
  calculateCategoryTotal: {
    type: Function,
    required: true
  },
  calculateCategoryMonthlyTotal: {
    type: Function,
    required: true
  },
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

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 