<template>
  <div>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Budget Planner</h1>
        </div>
        <div class="flex space-x-3">
          <button @click="openAddBudgetModal" class="btn-primary">Add Budget Item</button>
          <button @click="openHistoryModal" class="btn-secondary">View History</button>
        </div>
      </div>

      <!-- Budget Control Panel -->
      <BudgetControlPanel
        :selected-year="selectedYear"
        :available-years="availableYears"
        :selected-type-filter="selectedTypeFilter"
        :selected-category-filter="selectedCategoryFilter"
        :unique-categories="uniqueCategories"
        :can-copy-from-previous-year="canCopyFromPreviousYear"
        :group-by-category="groupByCategory"
        :budget-items="budgetItems"
        @update:selected-year="(year) => selectedYear = year"
        @update:selected-type-filter="(filter) => selectedTypeFilter = filter"
        @update:selected-category-filter="(filter) => selectedCategoryFilter = filter"
        @update:group-by-category="(grouped) => groupByCategory = grouped"
        @add-year="addNewYear"
        @copy-from-previous-year="copyFromPreviousYear"
        @clear-filters="clearAllFilters"
      />

      <!-- Budget Table -->
      <BudgetTable
        :loading="budgetStore.loading"
        :error="budgetStore.error"
        :budget-items="budgetItems"
        :selected-category-filter="selectedCategoryFilter"
        :can-copy-from-previous-year="canCopyFromPreviousYear"
        :filtered-budget-items="filteredBudgetItems"
        :grouped-budget-items="groupedBudgetItems"
        :months="MONTHS"
        :selected-year="selectedYear"
        :current-year="budgetStore.currentYear"
        :current-month="currentMonth"
        :group-by-category="groupByCategory"
        :selected-type-filter="selectedTypeFilter"
        :has-income-data="hasIncomeData"
        :has-expense-data="hasExpenseData"
        :has-investment-data="hasInvestmentData"
        :has-investment-incoming-data="hasInvestmentIncomingData"
        :has-investment-outgoing-data="hasInvestmentOutgoingData"
        :has-any-data="hasAnyData"
        :calculate-yearly-total="calculateYearlyTotal"
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
        :get-category-type="getCategoryType"
        :calculate-category-total="calculateCategoryTotal"
        :calculate-category-monthly-total="calculateCategoryMonthlyTotal"
        :is-scheduled-month="isScheduledMonth"
        :get-budget-amount="getBudgetAmount"
        :has-changes="hasChanges"
        :format-currency="formatCurrency"
        @retry="budgetStore.fetchBudgetItems()"
        @add-first-budget="openAddBudgetModal"
        @copy-from-previous-year="copyFromPreviousYear"
        @clear-filters="clearAllFilters"
        @add-budget="openAddBudgetModal"
        @edit-budget="editBudget"
        @duplicate-budget="duplicateBudget"
        @delete-budget="deleteBudget" />
    </div>

    <!-- Add Budget Modal -->
    <AddBudgetModal 
      v-model="showAddBudgetModal"
      :selected-year="selectedYear"
      @budget-added="handleBudgetAdded" />

    <!-- Edit Budget Modal -->
    <EditBudgetModal 
      v-model="showEditBudgetModal"
      :budget="editingBudget"
      :selected-year="selectedYear"
      @budget-updated="handleBudgetUpdated" />

    <!-- History Modal -->
    <HistoryModal v-model="showHistoryModal" />
  </div>
</template>

<script setup>
  import { computed, onMounted, watch } from 'vue'
  import { useBudgetStore } from '@/stores/budget.js'
  import { useAuthStore } from '@/stores/auth.js'
  import AddBudgetModal from '@/components/AddBudgetModal.vue'
  import EditBudgetModal from '@/components/EditBudgetModal.vue'
  import HistoryModal from '@/components/HistoryModal.vue'
  import BudgetTable from '@/components/BudgetTable.vue'
  import BudgetControlPanel from '@/components/BudgetControlPanel.vue'
  
  // Import constants and utilities
  import { MONTHS } from '@/constants/budgetConstants.js'
  import { formatCurrency } from '@/utils/budgetUtils.js'
  
  // Import composables
  import { useBudgetFilters } from '@/composables/useBudgetFilters.js'
  import { useBudgetModals } from '@/composables/useBudgetModals.js'
  import { useBudgetCalculations } from '@/composables/useBudgetCalculations.js'
  import { ref } from 'vue'

  // Stores
  const budgetStore = useBudgetStore()
  const authStore = useAuthStore()

  // Budget items from store
  const budgetItems = computed(() => budgetStore.budgetItems || [])

  // Selected year (from store)
  const selectedYear = computed({
    get: () => budgetStore.selectedYear,
    set: (value) => {
      budgetStore.selectedYear = value
      budgetStore.fetchBudgetItems(value)
    }
  })

  // Current month from store
  const currentMonth = computed(() => budgetStore.currentMonth)

  // Available years (computed from store)
  const availableYears = computed(() => {
    const currentYear = budgetStore.currentYear
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3]
  })



  // Use composables
  const {
    selectedTypeFilter,
    selectedCategoryFilter,
    groupByCategory,
    uniqueCategories,
    filteredBudgetItems,
    groupedBudgetItems,
    hasIncomeData,
    hasExpenseData,
    hasInvestmentIncomingData,
    hasInvestmentOutgoingData,
    hasInvestmentData,
    hasAnyData,
    clearAllFilters,
    getCategoryType
  } = useBudgetFilters(budgetItems, budgetStore)

  const {
    showAddBudgetModal,
    showEditBudgetModal,
    showHistoryModal,
    editingBudget,
    openAddBudgetModal,
    openHistoryModal,
    handleBudgetAdded,
    handleBudgetUpdated,
    editBudget,
    duplicateBudget,
    deleteBudget,
    addNewYear,
    copyFromPreviousYear
  } = useBudgetModals(budgetStore, selectedYear, budgetStore.currentYear, currentMonth)

  const {
    isScheduledMonth,
    getBudgetAmount,
    hasChanges,
    calculateYearlyTotal,
    calculateMonthlyTotal,
    calculateMonthlyIncome,
    calculateMonthlyExpenses,
    calculateMonthlyInvestmentIncoming,
    calculateMonthlyInvestmentOutgoing,
    calculateMonthlyInvestmentNet,
    calculateGrandTotal,
    calculateGrandTotalIncome,
    calculateGrandTotalExpenses,
    calculateGrandTotalInvestmentIncoming,
    calculateGrandTotalInvestmentOutgoing,
    calculateGrandTotalInvestmentNet,
    calculateCategoryTotal,
    calculateCategoryMonthlyTotal
  } = useBudgetCalculations(budgetItems, budgetStore)

  // Year management
  const previousYearHasData = ref(false)
  
  const canCopyFromPreviousYear = computed(() => {
    const previousYear = selectedYear.value - 1
    return previousYear >= 2020 && previousYearHasData.value
  })

  // Check if previous year has data
  const checkPreviousYearData = async () => {
    const previousYear = selectedYear.value - 1
    if (previousYear >= 2020) {
      previousYearHasData.value = await budgetStore.hasBudgetItemsForYear(previousYear)
    } else {
      previousYearHasData.value = false
    }
  }

  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      budgetStore.initialize()
      checkPreviousYearData()
    } else {
      // Clear data when not authenticated
      budgetStore.budgetItems = []
      budgetStore.monthlyAmounts = []
      budgetStore.budgetHistory = []
      budgetStore.error = null
      previousYearHasData.value = false
    }
  })

  // Watch for selected year changes
  watch(() => selectedYear.value, () => {
    if (authStore.isAuthenticated) {
      checkPreviousYearData()
    }
  })

  // Initialize on mount
  onMounted(async () => {
    // Wait for auth to initialize
    if (!authStore.user) {
      await authStore.initAuth()
    }
    
    if (authStore.isAuthenticated) {
      budgetStore.initialize()
      checkPreviousYearData()
    }
  })
</script>

 