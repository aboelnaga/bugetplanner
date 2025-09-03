<script setup>
import AddBudgetModal from '@/components/AddBudgetModal.vue'
import CloseMonthModal from '@/components/CloseMonthModal.vue'
import { useAccountsStore } from '@/stores/accounts.js'
import { useAuthStore } from '@/stores/auth.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useTransactionStore } from '@/stores/transactions.js'
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, watch } from 'vue'
// import HistoryModal from '@/components/HistoryModal.vue' // History functionality commented out
import BudgetControlPanel from '@/components/BudgetControlPanel.vue'
import BudgetDataTable from '@/components/BudgetDataTable.vue'
import BudgetTable from '@/components/BudgetTable.vue'

// Import constants and utilities
import { MONTHS } from '@/constants/budgetConstants.js'
import { formatCurrency } from '@/utils/budgetUtils.js'

// Import composables
import { useBudgetCalculations } from '@/composables/useBudgetCalculations.js'
import { useBudgetFilters } from '@/composables/useBudgetFilters.js'
import { useBudgetModals } from '@/composables/useBudgetModals.js'
import { useErrorHandler } from '@/composables/useErrorHandler.js'
import { useSmartRefresh } from '@/composables/useSmartRefresh.js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Stores
const budgetStore = useBudgetStore()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const yearlySummariesStore = useYearlySummariesStore()
const transactionStore = useTransactionStore()
const router = useRouter()

// Toast
const toast = useToast()

// Confirm
const confirm = useConfirm()

// Budget items from store (now includes virtual unlinked item)
const budgetItems = computed(() => budgetStore.budgetItemsWithUnlinked || [])

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
} = useBudgetModals(budgetStore, selectedYear, budgetStore.currentYear, currentMonth, toast, confirm)

// Budget modal mode
const budgetModalMode = ref('add')

// Override openAddBudgetModal to set mode correctly
const openAddBudgetModalUnified = () => {
  budgetModalMode.value = 'add'
  editingBudget.value = null
  openAddBudgetModal()
}

// Override editBudget to use unified modal
const editBudgetUnified = (budget) => {
  if (budget.is_multi_year) {
    // For multi-year items, we need to fetch all linked items first
    const linkedItems = budgetStore.getLinkedBudgetItems(budget.linked_group_id)
    if (linkedItems.length > 0) {
      // Use the master item (first item) for editing
      const masterItem = linkedItems.find(item => item.is_master) || linkedItems[0]
      editingBudget.value = masterItem
    } else {
      // Fallback to single item editing
      editingBudget.value = budget
    }
  } else {
    // Single year budget item
    editingBudget.value = budget
  }

  // Set mode to edit and show unified modal
  budgetModalMode.value = 'edit'
  showAddBudgetModal.value = true
}

// Handle view transactions for unlinked transactions
const handleViewTransactions = () => {
  // Navigate to transactions page with unlinked filter
  router.push('/transactions?filter=unlinked')
}

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
  // Actual-only calculations
  calculateMonthlyActualIncome,
  calculateMonthlyActualExpenses,
  calculateMonthlyActualInvestmentIncoming,
  calculateMonthlyActualInvestmentOutgoing,
  calculateMonthlyActualInvestmentNet,
  calculateMonthlyActualTotal,
  calculateGrandTotalActualIncome,
  calculateGrandTotalActualExpenses,
  calculateGrandTotalActualInvestmentIncoming,
  calculateGrandTotalActualInvestmentOutgoing,
  calculateGrandTotalActualInvestmentNet,
  calculateGrandTotalActual,
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
  calculatePreviousYearInvestmentNetTotal,
  // Previous year dual calculations (both expected and actual)
  calculatePreviousYearIncomeTotalWithDual,
  calculatePreviousYearExpensesTotalWithDual,
  calculatePreviousYearInvestmentIncomingTotalWithDual,
  calculatePreviousYearInvestmentOutgoingTotalWithDual,
  calculatePreviousYearNetTotalWithDual,
  calculatePreviousYearInvestmentNetTotalWithDual,
  calculatePreviousYearSavingsTotalWithDual,
  // Savings calculations
  calculateCumulativeSavings,
  calculateGrandTotalSavings,
  calculatePreviousYearSavings
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

// Dual mode display
const dualMode = ref('both')

const canCopyFromPreviousYear = computed(() => {
  const previousYear = selectedYear.value - 1
  return previousYear >= 2020 && previousYearHasData.value
})

// Smart refresh
const { isRefreshing, refreshProgress, smartRefresh, debouncedRefresh } = useSmartRefresh()

// Error handling
const { handleError, retryWithBackoff, clearErrors } = useErrorHandler(toast.add)

// Check if previous year has data (only when needed)
const checkPreviousYearData = async () => {
  // Only check previous year if current year has no budget items
  if (budgetStore.budgetItems.length === 0) {
    const previousYear = selectedYear.value - 1
    if (previousYear >= 2020) {
      previousYearHasData.value = await budgetStore.hasBudgetItemsForYear(previousYear)
    } else {
      previousYearHasData.value = false
    }
  } else {
    // Current year has data, no need to check previous year
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

      toast.add({
        severity: 'success',
        summary: 'Month Closed Successfully',
        detail: `${monthName} ${year} has been closed and actual amounts are now displayed.`,
        life: 5000
      })
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
    // budgetStore.initialize() - removed to avoid duplicate calls, handled in onMounted
    accountsStore.fetchAccounts()
    yearlySummariesStore.initialize() // Essential for balance calculations
    // checkPreviousYearData() - moved to budget items watcher
    // fetchClosedMonths() - moved to onMounted to avoid duplicate calls
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
watch(() => selectedYear.value, (newYear) => {
  if (authStore.isAuthenticated) {
    // Fetch budget items for the new year
    budgetStore.fetchBudgetItems(newYear)
    // checkPreviousYearData() - moved to budget items watcher
    // fetchClosedMonths() - removed to avoid duplicate calls on year change
  }
})

// Watch for auto-close completion to refresh closed months
watch(() => budgetStore.showHeaderBadge, (showBadge) => {
  if (!showBadge && authStore.isAuthenticated) {
    // When badge disappears (auto-close completed), refresh closed months
    fetchClosedMonths()
  }
})

// Watch for budget items changes to check previous year data
watch(() => budgetStore.budgetItems, () => {
  if (authStore.isAuthenticated) {
    checkPreviousYearData()
  }
}, { immediate: false })



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



// Lifecycle
onMounted(async () => {
  try {
    // Initialize stores
    await budgetStore.initialize()
    await accountsStore.initialize()
    await yearlySummariesStore.initialize()
    await transactionStore.fetchTransactions(selectedYear.value)

    // Check previous year data
    await checkPreviousYearData()

    // Fetch closed months
    await fetchClosedMonths()

  } catch (error) {
    console.error('Error initializing BudgetPlanner:', error)
    handleError(error)
  }
})

// Watch for selected year changes to fetch transactions
watch(selectedYear, async (newYear) => {
  if (newYear) {
    await transactionStore.fetchTransactions(newYear)
  }
})
</script>

<template>
  <div>
    <!-- Smart Refresh Loading Indicator -->
    <div v-if="isRefreshing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-blue-600 h-1 transition-all duration-300" :style="{ width: refreshProgress + '%' }"></div>
    </div>

    <!-- Auto-Close Loading Indicator -->
    <div v-if="budgetStore.isAutoClosing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-amber-500 h-1 transition-all duration-300" :style="{ width: budgetStore.autoCloseProgress + '%' }">
      </div>
    </div>

    <div class="space-y-6">
      <!-- Actions Header (without page title) -->
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <!-- Auto-close Header Badge -->
          <div v-if="budgetStore.showHeaderBadge"
            class="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
            <span>{{ budgetStore.headerBadgeText }}</span>
          </div>
        </div>
        <!-- <Button label="View History" icon="pi pi-history" severity="secondary" @click="openHistoryModal" /> -->
      </div>

      <!-- Account Balances Summary -->
      <Card v-if="accountsStore.accounts.length > 0" class="mb-4">
        <template #header>
          <div class="flex items-center justify-between p-6 pb-0">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-color m-0">Account Balances</h3>
              <Tag :value="formatCurrency(accountsStore.totalBalance)"
                :severity="accountsStore.totalBalance >= 0 ? 'success' : 'danger'" size="small" />
            </div>
            <Button label="Manage" icon="pi pi-cog" size="small" severity="secondary" text
              @click="$router.push('/banking')" />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="account in accountsStore.accounts" :key="account.id"
              class="surface-50 border surface-border rounded p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ getAccountIcon(account.type) }}</span>
                  <div>
                    <span class="font-bold text-color mr-2">{{ account.name }}</span>
                    <Tag :value="account.type.replace('_', ' ')" severity="secondary" size="small" />
                  </div>
                </div>
                <div class="text-right">
                  <div v-if="account.type === 'credit_card'">
                    <p class="text-xs text-color-secondary">Available</p>
                    <p class="text-sm font-semibold text-green-500">
                      {{ formatCurrency(getAvailableCredit(account.id)) }}
                    </p>
                  </div>
                  <div v-else>
                    <p class="text-sm font-semibold" :class="getBalanceColor(account.balance)">
                      {{ formatCurrency(account.balance) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Budget Control Panel -->
      <BudgetControlPanel :selected-year="selectedYear" :available-years="availableYears"
        :can-copy-from-previous-year="canCopyFromPreviousYear" :budget-items="budgetItems"
        @update:selected-year="(year) => selectedYear = year" @add-year="addNewYear"
        @copy-from-previous-year="copyFromPreviousYear" @add-budget="openAddBudgetModalUnified" />

      <!-- New DataTable Implementation (for comparison/testing) -->
      <div class="mt-8">
        <BudgetDataTable :loading="budgetStore.loading" :error="budgetStore.error" :budget-items="budgetItems"
          :selected-year="selectedYear" :current-year="budgetStore.currentYear" :current-month="currentMonth"
          :format-currency="formatCurrency" :calculate-monthly-income="calculateMonthlyIncome"
          :calculate-monthly-expenses="calculateMonthlyExpenses" :calculate-monthly-total="calculateMonthlyTotal"
          :calculate-grand-total-income="calculateGrandTotalIncome"
          :calculate-grand-total-expenses="calculateGrandTotalExpenses" :calculate-grand-total="calculateGrandTotal"
          :calculate-previous-year-income-total="calculatePreviousYearIncomeTotal"
          :calculate-previous-year-expenses-total="calculatePreviousYearExpensesTotal"
          :calculate-previous-year-investment-incoming-total="calculatePreviousYearInvestmentIncomingTotal"
          :calculate-previous-year-investment-outgoing-total="calculatePreviousYearInvestmentOutgoingTotal"
          :calculate-previous-year-net-total="calculatePreviousYearNetTotal"
          :calculate-previous-year-investment-net-total="calculatePreviousYearInvestmentNetTotal"
          :calculate-previous-year-savings="calculatePreviousYearSavings" :closed-months="closedMonths"
          :get-actual-amount="getActualAmount" :dual-mode="dualMode"
          :calculate-monthly-actual-income="calculateMonthlyActualIncome"
          :calculate-monthly-actual-expenses="calculateMonthlyActualExpenses"
          :calculate-monthly-actual-total="calculateMonthlyActualTotal"
          :calculate-monthly-actual-investment-incoming="calculateMonthlyActualInvestmentIncoming"
          :calculate-monthly-actual-investment-outgoing="calculateMonthlyActualInvestmentOutgoing"
          :calculate-monthly-actual-investment-net="calculateMonthlyActualInvestmentNet"
          :calculate-grand-total-actual-investment-incoming="calculateGrandTotalActualInvestmentIncoming"
          :calculate-grand-total-actual-investment-outgoing="calculateGrandTotalActualInvestmentOutgoing"
          :calculate-grand-total-actual-investment-net="calculateGrandTotalActualInvestmentNet"
          :calculate-previous-year-income-total-with-dual="calculatePreviousYearIncomeTotalWithDual"
          :calculate-previous-year-expenses-total-with-dual="calculatePreviousYearExpensesTotalWithDual"
          :calculate-previous-year-investment-incoming-total-with-dual="calculatePreviousYearInvestmentIncomingTotalWithDual"
          :calculate-previous-year-investment-outgoing-total-with-dual="calculatePreviousYearInvestmentOutgoingTotalWithDual"
          :calculate-previous-year-net-total-with-dual="calculatePreviousYearNetTotalWithDual"
          :calculate-previous-year-investment-net-total-with-dual="calculatePreviousYearInvestmentNetTotalWithDual"
          :calculate-previous-year-savings-total-with-dual="calculatePreviousYearSavingsTotalWithDual"
          :can-copy-from-previous-year="canCopyFromPreviousYear" @edit-budget="editBudgetUnified"
          @duplicate-budget="duplicateBudget" @delete-budget="deleteBudget" @view-transactions="handleViewTransactions"
          @update:dual-mode="(mode) => dualMode = mode" @add-budget="openAddBudgetModalUnified"
          @copy-from-previous-year="copyFromPreviousYear" @close-month="handleCloseMonth"
          @retry="budgetStore.fetchBudgetItems()" />
      </div>

      <!-- Budget Table -->
      <BudgetTable data-testid="budget-table" :loading="budgetStore.loading" :error="budgetStore.error"
        :budget-items="budgetItems" :selected-category-filter="selectedCategoryFilter"
        :can-copy-from-previous-year="canCopyFromPreviousYear" :filtered-budget-items="filteredBudgetItems"
        :grouped-budget-items="groupedBudgetItems" :months="MONTHS" :selected-year="selectedYear"
        :current-year="budgetStore.currentYear" :current-month="currentMonth" :group-by-category="groupByCategory"
        :selected-type-filter="selectedTypeFilter" :has-income-data="hasIncomeData" :has-expense-data="hasExpenseData"
        :has-investment-data="hasInvestmentData" :has-investment-incoming-data="hasInvestmentIncomingData"
        :has-investment-outgoing-data="hasInvestmentOutgoingData" :has-any-data="hasAnyData"
        :calculate-yearly-total="calculateYearlyTotal" :calculate-monthly-total="calculateMonthlyTotal"
        :calculate-monthly-income="calculateMonthlyIncome" :calculate-monthly-expenses="calculateMonthlyExpenses"
        :calculate-monthly-investment-incoming="calculateMonthlyInvestmentIncoming"
        :calculate-monthly-investment-outgoing="calculateMonthlyInvestmentOutgoing"
        :calculate-monthly-investment-net="calculateMonthlyInvestmentNet" :calculate-grand-total="calculateGrandTotal"
        :calculate-grand-total-income="calculateGrandTotalIncome"
        :calculate-grand-total-expenses="calculateGrandTotalExpenses"
        :calculate-grand-total-investment-incoming="calculateGrandTotalInvestmentIncoming"
        :calculate-grand-total-investment-outgoing="calculateGrandTotalInvestmentOutgoing"
        :calculate-grand-total-investment-net="calculateGrandTotalInvestmentNet"
        :calculate-monthly-actual-income="calculateMonthlyActualIncome"
        :calculate-grand-total-actual-income="calculateGrandTotalActualIncome"
        :calculate-monthly-actual-expenses="calculateMonthlyActualExpenses"
        :calculate-grand-total-actual-expenses="calculateGrandTotalActualExpenses"
        :calculate-monthly-actual-investment-incoming="calculateMonthlyActualInvestmentIncoming"
        :calculate-grand-total-actual-investment-incoming="calculateGrandTotalActualInvestmentIncoming"
        :calculate-monthly-actual-investment-outgoing="calculateMonthlyActualInvestmentOutgoing"
        :calculate-grand-total-actual-investment-outgoing="calculateGrandTotalActualInvestmentOutgoing"
        :calculate-monthly-actual-total="calculateMonthlyActualTotal"
        :calculate-grand-total-actual="calculateGrandTotalActual"
        :calculate-monthly-actual-investment-net="calculateMonthlyActualInvestmentNet"
        :calculate-grand-total-actual-investment-net="calculateGrandTotalActualInvestmentNet"
        :get-category-type="getCategoryType" :calculate-category-total="calculateCategoryTotal"
        :calculate-category-monthly-total="calculateCategoryMonthlyTotal" :is-scheduled-month="isScheduledMonth"
        :get-budget-amount="getBudgetAmount" :has-changes="hasChanges" :format-currency="formatCurrency"
        :closed-months="closedMonths" :get-actual-amount="getActualAmount"
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
        :calculate-previous-year-savings="calculatePreviousYearSavings" @retry="budgetStore.fetchBudgetItems()"
        @add-first-budget="openAddBudgetModalUnified" @copy-from-previous-year="copyFromPreviousYear"
        @clear-filters="clearAllFilters" @add-budget="openAddBudgetModalUnified" @edit-budget="editBudgetUnified"
        @duplicate-budget="duplicateBudget" @delete-budget="deleteBudget" @close-month="handleCloseMonth"
        @view-transactions="handleViewTransactions" />
    </div>

    <!-- Unified Budget Modal -->
    <AddBudgetModal v-model="showAddBudgetModal" :mode="budgetModalMode" :budget="editingBudget"
      :selected-year="selectedYear" @budget-added="handleBudgetAdded" @budget-updated="handleBudgetUpdated" />

    <!-- Close Month Modal -->
    <CloseMonthModal v-model="showCloseMonthModal" :year="closingMonthYear" :month="closingMonthIndex"
      :budget-items-count="budgetItems.length" :transactions-count="transactionsCount" @confirm="confirmCloseMonth" />

    <!-- History Modal -->
    <!-- <HistoryModal v-model="showHistoryModal" /> -->
  </div>
</template>
