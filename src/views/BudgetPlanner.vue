<template>
  <div>
    <!-- Smart Refresh Loading Indicator -->
    <div v-if="isRefreshing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-blue-600 h-1 transition-all duration-300" :style="{ width: refreshProgress + '%' }"></div>
    </div>
    
    <!-- Auto-Close Loading Indicator -->
    <div v-if="budgetStore.isAutoClosing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-amber-500 h-1 transition-all duration-300" :style="{ width: budgetStore.autoCloseProgress + '%' }"></div>
    </div>
    
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <h1 class="text-3xl font-bold text-gray-900">Budget Planner</h1>
          <!-- Auto-close Header Badge -->
          <div v-if="budgetStore.showHeaderBadge" class="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span>{{ budgetStore.headerBadgeText }}</span>
          </div>
        </div>
        <div class="flex space-x-3">
          <button @click="openAddBudgetModal" class="btn-primary">Add Budget Item</button>
          <!-- <button @click="openHistoryModal" class="btn-secondary">View History</button> -->
        </div>
      </div>

      <!-- Account Balances Summary -->
      <div v-if="accountsStore.accounts.length > 0" class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Account Balances</h2>
          <router-link 
            to="/banking" 
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Accounts →
          </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="account in accountsStore.accounts" 
            :key="account.id"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-lg">{{ getAccountIcon(account.type) }}</span>
                <div>
                  <h3 class="font-medium text-gray-900">{{ account.name }}</h3>
                  <p class="text-sm text-gray-500 capitalize">{{ account.type.replace('_', ' ') }}</p>
                </div>
              </div>
              <div class="text-right">
                <div v-if="account.type === 'credit_card'" class="space-y-1">
                  <p class="text-sm text-gray-500">Available</p>
                  <p class="text-lg font-semibold text-green-600">
                    {{ formatCurrency(getAvailableCredit(account.id)) }}
                  </p>
                </div>
                <div v-else>
                  <p class="text-lg font-semibold" :class="getBalanceColor(account.balance)">
                    {{ formatCurrency(account.balance) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Total Balance -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium text-gray-900">Total Balance</span>
            <span class="text-xl font-bold" :class="getTotalBalanceColor(accountsStore.totalBalance)">
              {{ formatCurrency(accountsStore.totalBalance) }}
            </span>
          </div>
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
        :closed-months="closedMonths"
        :get-actual-amount="getActualAmount"
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
        @retry="budgetStore.fetchBudgetItems()"
        @add-first-budget="openAddBudgetModal"
        @copy-from-previous-year="copyFromPreviousYear"
        @clear-filters="clearAllFilters"
        @add-budget="openAddBudgetModal"
        @edit-budget="editBudget"
        @duplicate-budget="duplicateBudget"
        @delete-budget="deleteBudget"
        @close-month="handleCloseMonth" />
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

    <!-- Close Month Modal -->
    <CloseMonthModal
      v-model="showCloseMonthModal"
      :year="closingMonthYear"
      :month="closingMonthIndex"
      :budget-items-count="budgetItems.length"
      :transactions-count="transactionsCount"
      @confirm="confirmCloseMonth" />

    <!-- History Modal -->
          <!-- <HistoryModal v-model="showHistoryModal" /> -->
  </div>
</template>

<script setup>
  import { computed, onMounted, watch } from 'vue'
  import { useBudgetStore } from '@/stores/budget.js'
  import { useAuthStore } from '@/stores/auth.js'
  import { useAccountsStore } from '@/stores/accounts.js'
  import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
  import AddBudgetModal from '@/components/AddBudgetModal.vue'
  import EditBudgetModal from '@/components/EditBudgetModal.vue'
  import CloseMonthModal from '@/components/CloseMonthModal.vue'
  // import HistoryModal from '@/components/HistoryModal.vue' // History functionality commented out
  import BudgetTable from '@/components/BudgetTable.vue'
  import BudgetControlPanel from '@/components/BudgetControlPanel.vue'
  
  // Import constants and utilities
  import { MONTHS } from '@/constants/budgetConstants.js'
  import { formatCurrency } from '@/utils/budgetUtils.js'
  
  // Import composables
  import { useBudgetFilters } from '@/composables/useBudgetFilters.js'
  import { useBudgetModals } from '@/composables/useBudgetModals.js'
  import { useBudgetCalculations } from '@/composables/useBudgetCalculations.js'
  import { useSmartRefresh } from '@/composables/useSmartRefresh.js'
  import { useErrorHandler } from '@/composables/useErrorHandler.js'
  import { ref } from 'vue'

  // Stores
  const budgetStore = useBudgetStore()
  const authStore = useAuthStore()
  const accountsStore = useAccountsStore()
  const yearlySummariesStore = useYearlySummariesStore()

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
    // showHistoryModal, // History functionality commented out
    editingBudget,
    openAddBudgetModal,
    // openHistoryModal, // History functionality commented out
    handleBudgetAdded,
    handleBudgetUpdated,
    editBudget,
    duplicateBudget,
    deleteBudget,
    addNewYear,
    copyFromPreviousYear
  } = useBudgetModals(budgetStore, selectedYear, budgetStore.currentYear, currentMonth)

  // Month closure state
  const closedMonths = ref([])
  const loadingClosedMonths = ref(false)
  const showCloseMonthModal = ref(false)
  const closingMonthYear = ref(0)
  const closingMonthIndex = ref(0)

  const {
    isScheduledMonth,
    getBudgetAmount,
    getActualAmount,
    isMonthClosed,
    getSmartDefaultAmount,
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
    // Planned calculations for tooltips
    calculateMonthlyPlannedIncome,
    calculateMonthlyPlannedExpenses,
    calculateMonthlyPlannedInvestmentIncoming,
    calculateMonthlyPlannedInvestmentOutgoing,
    calculateMonthlyPlannedTotal,
    calculateGrandTotalPlannedIncome,
    calculateGrandTotalPlannedExpenses,
    calculateGrandTotalPlannedInvestmentIncoming,
    calculateGrandTotalPlannedInvestmentOutgoing,
    calculateGrandTotalPlanned,
    calculateCategoryTotal,
    calculateCategoryMonthlyTotal,
    // Previous year calculations
    calculatePreviousYearIncomeTotal,
    calculatePreviousYearExpensesTotal,
    calculatePreviousYearInvestmentIncomingTotal,
    calculatePreviousYearInvestmentOutgoingTotal,
    calculatePreviousYearNetTotal,
    calculatePreviousYearInvestmentNetTotal
  } = useBudgetCalculations(
    budgetItems, 
    budgetStore, 
    closedMonths, 
    budgetStore.currentYear, 
    budgetStore.currentMonth, 
    selectedYear
  )

  // Year management
  const previousYearHasData = ref(false)
  
  const canCopyFromPreviousYear = computed(() => {
    const previousYear = selectedYear.value - 1
    return previousYear >= 2020 && previousYearHasData.value
  })

  // Smart refresh
  const { isRefreshing, refreshProgress, smartRefresh, debouncedRefresh } = useSmartRefresh()

  // Error handling
  const { handleError, retryWithBackoff, clearErrors } = useErrorHandler()

  // Check if previous year has data
  const checkPreviousYearData = async () => {
    const previousYear = selectedYear.value - 1
    if (previousYear >= 2020) {
      previousYearHasData.value = await budgetStore.hasBudgetItemsForYear(previousYear)
    } else {
      previousYearHasData.value = false
    }
  }

  // Month closure functions
  const fetchClosedMonths = async () => {
    if (!authStore.isAuthenticated || !authStore.userId) return
    
    try {
      loadingClosedMonths.value = true
      const data = await retryWithBackoff(() => budgetStore.getClosedMonths(selectedYear.value))
      closedMonths.value = data || []
    } catch (error) {
      await handleError(error, 'fetching closed months', {
        showNotification: true,
        onRecovery: async (errorEntry) => {
          if (errorEntry.recovery.action === 'retry') {
            await fetchClosedMonths()
          }
        }
      })
      closedMonths.value = []
    } finally {
      loadingClosedMonths.value = false
    }
  }

  const handleCloseMonth = async (year, month) => {
    if (!authStore.isAuthenticated || !authStore.userId) return
    
    // Show confirmation dialog
    closingMonthYear.value = year
    closingMonthIndex.value = month
    showCloseMonthModal.value = true
  }

  const confirmCloseMonth = async (year, month) => {
    if (!authStore.isAuthenticated || !authStore.userId) return
    
    try {
      const success = await retryWithBackoff(() => budgetStore.closeMonth(year, month))
      if (success) {
        // Refresh closed months
        await fetchClosedMonths()
        
        // Show success notification
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
        const monthName = monthNames[month]
        
        if (window.$toaster) {
          window.$toaster.success(
            'Month Closed Successfully',
            `${monthName} ${year} has been closed and actual amounts are now displayed.`
          )
        }
      }
    } catch (error) {
      await handleError(error, 'closing month', {
        showNotification: true,
        onRecovery: async (errorEntry) => {
          if (errorEntry.recovery.action === 'retry') {
            await confirmCloseMonth(year, month)
          }
        }
      })
    }
  }

  // getActualAmount is now imported from useBudgetCalculations composable

  // Get total transactions count for the selected year
  const transactionsCount = computed(() => {
    // This would need to be implemented based on your transaction store
    // For now, returning a placeholder
    return 0
  })

  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      budgetStore.initialize()
      accountsStore.fetchAccounts()
      yearlySummariesStore.initialize()
      checkPreviousYearData()
      fetchClosedMonths()
    } else {
      // Clear data when not authenticated
      budgetStore.budgetItems = []
      accountsStore.accounts = []
      yearlySummariesStore.yearlySummaries = []
  
      // budgetStore.budgetHistory = [] // History functionality commented out
      budgetStore.error = null
      accountsStore.error = null
      yearlySummariesStore.error = null
      previousYearHasData.value = false
      closedMonths.value = []
    }
  })

  // Watch for selected year changes
  watch(() => selectedYear.value, () => {
    if (authStore.isAuthenticated) {
      checkPreviousYearData()
      fetchClosedMonths()
    }
  })

  // Watch for auto-close completion to refresh closed months
  watch(() => budgetStore.showHeaderBadge, (showBadge) => {
    if (!showBadge && authStore.isAuthenticated) {
      // When badge disappears (auto-close completed), refresh closed months
      fetchClosedMonths()
    }
  })

  // Account helper functions
  const getAccountIcon = (type) => accountsStore.getAccountIcon(type)
  const getAvailableCredit = (accountId) => accountsStore.getAvailableCredit(accountId)
  
  const getBalanceColor = (balance) => {
    if (balance >= 0) return 'text-green-600'
    return 'text-red-600'
  }
  
  const getTotalBalanceColor = (balance) => {
    if (balance >= 0) return 'text-green-600'
    return 'text-red-600'
  }

  // Initialize on mount
  onMounted(async () => {
    // Wait for auth to initialize
    if (!authStore.user) {
      await authStore.initAuth()
    }
    
    if (authStore.isAuthenticated) {
      budgetStore.initialize()
      accountsStore.fetchAccounts()
      yearlySummariesStore.initialize()
      checkPreviousYearData()
      fetchClosedMonths()
    }
  })
</script>

 