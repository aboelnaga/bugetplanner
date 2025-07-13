<template>
  <div class="card">
    <!-- Empty States -->
    <div v-if="shouldShowEmptyState" class="text-center py-12">
      <div :class="emptyStateConfig.icon === '⚠️' ? 'text-red-500 mb-4' : 'text-gray-500 mb-4'">
        <div class="text-4xl mb-2">{{ emptyStateConfig.icon }}</div>
        <h3 class="text-lg font-medium" :class="emptyStateConfig.icon === '⚠️' ? '' : 'text-gray-700'">
          {{ emptyStateConfig.title }}
        </h3>
        <p v-if="emptyStateConfig.message" class="text-sm mt-2">{{ emptyStateConfig.message }}</p>
      </div>
      
      <!-- Loading State - No Actions -->
      <div v-if="shouldShowLoadingState"></div>
      
      <!-- Error State Actions -->
      <div v-else-if="shouldShowErrorState" class="flex justify-center space-x-3">
        <button @click="$emit('retry')" class="btn-primary">Retry</button>
      </div>
      
      <!-- No Budget Items Actions -->
      <div v-else-if="shouldShowNoBudgetItemsState" class="flex justify-center space-x-3">
        <button @click="$emit('add-first-budget')" class="btn-primary">Add First Budget Item</button>
        <button v-if="canCopyFromPreviousYear" 
                @click="$emit('copy-from-previous-year')" 
                class="btn-secondary">
          📋 Copy from {{ selectedYear - 1 }}
        </button>
      </div>
      
      <!-- No Filtered Results Actions -->
      <div v-else-if="shouldShowNoFilteredResultsState" class="flex justify-center space-x-3">
        <button @click="$emit('clear-filters')" class="text-sm text-blue-600 hover:text-blue-800 underline">
          Clear filters
        </button>
        <button 
          @click="$emit('add-budget')" 
          :disabled="loading"
          class="text-sm text-green-600 hover:text-green-800 underline disabled:text-gray-400 disabled:cursor-not-allowed">
          Add budget item
        </button>
      </div>
    </div>

    <!-- Budget Table -->
    <div v-else :class="getTableContainerClasses()">
      <div :class="getTableScrollClasses()">
        <table class="min-w-full">
          <thead class="bg-gray-50 sticky top-0 z-30">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-40">
                Budget Item
              </th>
              <th v-for="(month, index) in months" :key="month" 
                  :class="getMonthHeaderClasses(currentYear, currentMonth, index)">
                {{ month }}
                <span v-if="selectedYear === currentYear && index === currentMonth" class="block text-xs font-normal mt-1">
                  (Current)
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Total
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky right-0 z-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Regular table view -->
            <template v-if="!groupByCategory">
              <BudgetTableList
                :filtered-budget-items="filteredBudgetItems"
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

            <!-- Grouped table view -->
            <template v-else>
              <BudgetTableGrouped
                :grouped-budget-items="groupedBudgetItems"
                :months="months"
                :selected-year="selectedYear"
                :current-year="currentYear"
                :current-month="currentMonth"
                :get-category-type="getCategoryType"
                :calculate-category-total="calculateCategoryTotal"
                :calculate-category-monthly-total="calculateCategoryMonthlyTotal"
                :is-scheduled-month="isScheduledMonth"
                :get-budget-amount="getBudgetAmount"
                :has-changes="hasChanges"
                :calculate-yearly-total="calculateYearlyTotal"
                :format-currency="formatCurrency"
                @edit-budget="$emit('edit-budget', $event)"
                @duplicate-budget="$emit('duplicate-budget', $event)"
                @delete-budget="$emit('delete-budget', $event)" />
            </template>

            <!-- Summary Rows -->
            <BudgetTableSummary
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
              :calculate-monthly-total="calculateMonthlyTotal"
              :calculate-monthly-income="calculateMonthlyIncome"
              :calculate-monthly-expenses="calculateMonthlyExpenses"
              :calculate-monthly-investment-incoming="calculateMonthlyInvestmentIncoming"
              :calculate-monthly-investment-outgoing="calculateMonthlyInvestmentOutgoing"
              :calculate-monthly-investment-net="calculateMonthlyInvestmentNet"
              :calculate-grand-total="calculateGrandTotal"
              :calculate-grand-total-income="calculateGrandTotalIncome"
              :calculate-grand-total-expenses="calculateGrandTotalExpenses"
              :calculate-grand-total-investment-incoming="calculateGrandTotalInvestmentIncoming"
              :calculate-grand-total-investment-outgoing="calculateGrandTotalInvestmentOutgoing"
              :calculate-grand-total-investment-net="calculateGrandTotalInvestmentNet"
              :format-currency="formatCurrency" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BudgetTableRow from './BudgetTableRow.vue'
import BudgetTableGrouped from './BudgetTableGrouped.vue'
import BudgetTableList from './BudgetTableList.vue'
import BudgetTableSummary from './BudgetTableSummary.vue'
import { useBudgetTable } from '@/composables/useBudgetTable.js'

// Props
const props = defineProps({
  // State
  loading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    default: null
  },
  budgetItems: {
    type: Array,
    required: true
  },
  selectedCategoryFilter: {
    type: String,
    required: true
  },
  canCopyFromPreviousYear: {
    type: Boolean,
    required: true
  },
  
  // Data
  filteredBudgetItems: {
    type: Array,
    required: true
  },
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
  groupByCategory: {
    type: Boolean,
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
  
  // Functions
  calculateYearlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentOutgoing: {
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
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentNet: {
    type: Function,
    required: true
  },
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
  formatCurrency: {
    type: Function,
    required: true
  }
})

// Use budget table composable
const {
  shouldShowEmptyState,
  shouldShowLoadingState,
  shouldShowErrorState,
  shouldShowNoBudgetItemsState,
  shouldShowNoFilteredResultsState,
  emptyStateConfig,
  getMonthHeaderClasses,
  getTableContainerClasses,
  getTableScrollClasses
} = useBudgetTable(
  computed(() => props.loading),
  computed(() => props.error),
  computed(() => props.budgetItems),
  computed(() => props.filteredBudgetItems),
  computed(() => props.selectedYear),
  computed(() => props.selectedTypeFilter),
  computed(() => props.selectedCategoryFilter),
  computed(() => props.canCopyFromPreviousYear)
)

// Emits
const emit = defineEmits([
  'retry',
  'add-first-budget',
  'copy-from-previous-year',
  'clear-filters',
  'add-budget',
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 