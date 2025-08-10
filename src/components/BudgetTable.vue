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
      <div :class="getTableScrollClasses()" class="border border-gray-200 rounded-lg">
        <table class="min-w-full">
          <thead class="bg-slate-50 sticky top-0 z-30 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-700 tracking-wider sticky left-0 bg-slate-50 z-40 border-r border-gray-200">
                Budget Item
              </th>
              <th class="px-3 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-r border-gray-200 bg-gray-100">
                <div class="space-y-1">
                  <div>PY {{ selectedYear - 1 }}</div>
                  <div class="text-xs font-medium text-gray-600">
                    Previous Year
                  </div>
                </div>
              </th>

              <th v-for="(month, index) in months" :key="month" 
                  :class="getMonthHeaderClasses(currentYear, currentMonth, index)"
                  class="px-3 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-r border-gray-200">
                <div class="space-y-1">
                  <div>{{ month }}</div>
                  <div v-if="selectedYear === currentYear && index === currentMonth" 
                       class="text-xs font-medium text-sky-600">
                    (Current)
                  </div>
                  <div v-else-if="isMonthClosed(index)" 
                       class="text-xs font-medium text-green-600 flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Closed
                  </div>
                  <div v-else-if="canCloseMonth(index)" 
                    class="text-xs">
                    <button @click="handleCloseMonth(index)" 
                            class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                      </svg>
                      Close Month
                    </button>
                  </div>
                </div>
              </th>
              <th class="px-4 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider bg-slate-50 border-r border-gray-200 sticky right-32">
                Total
              </th>
              <th class="px-4 py-4 text-center text-sm font-semibold text-slate-700 tracking-wider bg-slate-50 sticky right-0 border-l border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
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
                :closed-months="closedMonths"
                :get-actual-amount="getActualAmount"
                @edit-budget="$emit('edit-budget', $event)"
                @duplicate-budget="$emit('duplicate-budget', $event)"
                @delete-budget="$emit('delete-budget', $event)"
                @view-transactions="$emit('view-transactions')" />
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
                :closed-months="closedMonths"
                :get-actual-amount="getActualAmount"
                @edit-budget="$emit('edit-budget', $event)"
                @duplicate-budget="$emit('duplicate-budget', $event)"
                @delete-budget="$emit('delete-budget', $event)"
                @view-transactions="$emit('view-transactions')" />
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
              :format-currency="formatCurrency"
              :calculate-monthly-planned-income="calculateMonthlyPlannedIncome"
              :calculate-monthly-planned-expenses="calculateMonthlyPlannedExpenses"
              :calculate-monthly-planned-investment-incoming="calculateMonthlyPlannedInvestmentIncoming"
              :calculate-monthly-planned-investment-outgoing="calculateMonthlyPlannedInvestmentOutgoing"
              :calculate-monthly-planned-total="calculateMonthlyPlannedTotal"
              :calculate-grand-total-planned-income="calculateGrandTotalPlannedIncome"
              :calculate-grand-total-planned-expenses="calculateGrandTotalPlannedExpenses"
              :calculate-grand-total-planned-investment-incoming="calculateGrandTotalPlannedInvestmentIncoming"
              :calculate-grand-total-planned-investment-outgoing="calculateGrandTotalPlannedInvestmentOutgoing"
              :calculate-grand-total-planned="calculateGrandTotalPlanned"
              :calculate-previous-year-income-total="calculatePreviousYearIncomeTotal"
              :calculate-previous-year-expenses-total="calculatePreviousYearExpensesTotal"
              :calculate-previous-year-investment-incoming-total="calculatePreviousYearInvestmentIncomingTotal"
              :calculate-previous-year-investment-outgoing-total="calculatePreviousYearInvestmentOutgoingTotal"
              :calculate-previous-year-net-total="calculatePreviousYearNetTotal"
              :calculate-previous-year-investment-net-total="calculatePreviousYearInvestmentNetTotal"
              :calculate-cumulative-savings="calculateCumulativeSavings"
              :calculate-grand-total-savings="calculateGrandTotalSavings"
              :calculate-previous-year-savings="calculatePreviousYearSavings" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  
  // Planned calculation props for tooltips
  calculateMonthlyPlannedIncome: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedTotal: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedIncome: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlanned: {
    type: Function,
    default: null
  },
  

  calculatePreviousYearIncomeTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearExpensesTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotal: {
    type: Function,
    default: null
  },
  
  // Savings calculations
  calculateCumulativeSavings: {
    type: Function,
    required: true
  },
  calculateGrandTotalSavings: {
    type: Function,
    required: true
  },
  calculatePreviousYearSavings: {
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

// Month closure logic
const isMonthClosed = (monthIndex) => {
  return props.closedMonths.some(closedMonth => closedMonth.month === monthIndex)
}

const canCloseMonth = (monthIndex) => {
  // Can only close months that are not current or future
  if (props.selectedYear === props.currentYear && monthIndex >= props.currentMonth) {
    return false
  }
  
  // Can only close months that are not already closed
  if (isMonthClosed(monthIndex)) {
    return false
  }
  
  // Can only close months that are at least 7 days old
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const currentDay = currentDate.getDate()
  
  // If we're in the same year and month, check if it's been 7+ days
  if (props.selectedYear === currentYear && monthIndex === currentMonth) {
    return currentDay >= 7
  }
  
  // If it's a previous month, it can be closed
  if (props.selectedYear < currentYear || 
      (props.selectedYear === currentYear && monthIndex < currentMonth)) {
    return true
  }
  
  return false
}

const handleCloseMonth = (monthIndex) => {
  emit('close-month', props.selectedYear, monthIndex)
}

// Emits
const emit = defineEmits([
  'retry',
  'add-first-budget',
  'copy-from-previous-year',
  'clear-filters',
  'add-budget',
  'edit-budget',
  'duplicate-budget',
  'delete-budget',
  'close-month',
  'view-transactions'
])
</script> 