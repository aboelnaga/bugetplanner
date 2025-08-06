<template>
      <BudgetTableRow
      v-for="budget in filteredBudgetItems"
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
      :closed-months="closedMonths"
      :get-actual-amount="getActualAmount"

      @edit-budget="$emit('edit-budget', $event)"
      @duplicate-budget="$emit('duplicate-budget', $event)"
      @delete-budget="$emit('delete-budget', $event)" />

      <!-- Unlinked Transactions Row -->
      <BudgetTableUnlinkedRow
        v-if="hasUnlinkedTransactions"
        :months="months"
        :selected-year="selectedYear"
        :current-year="currentYear"
        :current-month="currentMonth"
        :calculate-unlinked-transactions-by-month="calculateUnlinkedTransactionsByMonth"
        :calculate-unlinked-transactions-total="calculateUnlinkedTransactionsTotal"
        :format-currency="formatCurrency"
        :unlinked-transactions="unlinkedTransactions"
        @view-transactions="$emit('view-transactions')" />
</template>

<script setup>
import BudgetTableRow from './BudgetTableRow.vue'
import BudgetTableUnlinkedRow from './BudgetTableUnlinkedRow.vue'

// Props
const props = defineProps({
  filteredBudgetItems: {
    type: Array,
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
  
  // Month closure props
  closedMonths: {
    type: Array,
    default: () => []
  },
  getActualAmount: {
    type: Function,
    default: null
  },
  
  // Unlinked transactions props
  hasUnlinkedTransactions: {
    type: Boolean,
    default: false
  },
  calculateUnlinkedTransactionsByMonth: {
    type: Function,
    default: () => 0
  },
  calculateUnlinkedTransactionsTotal: {
    type: Function,
    default: () => 0
  },
  unlinkedTransactions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget',
  'view-transactions'
])
</script> 