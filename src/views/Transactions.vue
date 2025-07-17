<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
            <p class="mt-1 text-sm text-gray-500">
              Track your income, expenses, and transfers for {{ selectedYear }}
            </p>
          </div>
          
          <!-- Add Transaction Button -->
          <button 
            @click="openAddTransactionModal"
            :disabled="addLoading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span v-if="addLoading">Adding...</span>
            <span v-else>Add Transaction</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Income -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span class="text-emerald-600 text-lg">💰</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                  <dd class="text-lg font-medium text-emerald-600">
                    {{ formatCurrency(transactionStats.totalIncome) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Expenses -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                  <span class="text-rose-600 text-lg">💸</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd class="text-lg font-medium text-rose-600">
                    {{ formatCurrency(transactionStats.totalExpenses) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Net Amount -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Net Amount</dt>
                  <dd class="text-lg font-medium" :class="transactionStats.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ formatCurrency(transactionStats.netAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Count -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-gray-600 text-lg">📝</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ filteredStats.count }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Filters & Search</h3>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Search Bar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Transactions</label>
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search by description, category, account, notes, or tags..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Filter Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                v-model="selectedTypeFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="all">All Types</option>
                <option v-for="type in availableTypes" :key="type" :value="type">
                  {{ TRANSACTION_TYPE_LABELS[type] }}
                </option>
              </select>
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                v-model="selectedCategoryFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="all">All Categories</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Date Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select 
                v-model="selectedDateRange"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="option in dateRangeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Budget Item Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Budget Item</label>
              <select 
                v-model="selectedBudgetItemFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="all">All Budget Items</option>
                <option v-for="budgetItem in availableBudgetItems" :key="budgetItem" :value="budgetItem">
                  {{ budgetItem }}
                </option>
              </select>
            </div>
          </div>

          <!-- Custom Date Range (if selected) -->
          <div v-if="selectedDateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                v-model="customDateStart"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                v-model="customDateEnd"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-2">
            <button 
              @click="setQuickFilter('linked')"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
              🔗 Linked to Budget
            </button>
            <button 
              @click="setQuickFilter('unlinked')"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
              🔓 Unlinked
            </button>
            <button 
              @click="resetFilters"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
              🗑️ Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Debug Info (temporary) -->
      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
        <h4 class="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
        <div class="text-xs text-yellow-700 space-y-1">
          <div>Total transactions in store: {{ transactions.length }}</div>
          <div>Filtered transactions: {{ filteredTransactions.length }}</div>
          <div>Loading: {{ loading }}</div>
          <div>Error: {{ error }}</div>
          <div>Selected year: {{ selectedYear }}</div>
          <div>Search query: "{{ searchQuery }}"</div>
          <div>Type filter: {{ selectedTypeFilter }}</div>
          <div>Category filter: {{ selectedCategoryFilter }}</div>
          <div>Date range: {{ selectedDateRange }}</div>
          <div>Budget item filter: {{ selectedBudgetItemFilter }}</div>
          <div>Show linked only: {{ showLinkedOnly }}</div>
          <div>Show unlinked only: {{ showUnlinkedOnly }}</div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              Transactions ({{ filteredStats.count }})
            </h3>
            <div class="text-sm text-gray-500">
              Showing {{ filteredStats.count }} of {{ transactions.length }} transactions
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover::bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading transactions...
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8 text-center">
          <div class="text-red-600">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Error loading transactions</h3>
            <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
            <div class="mt-6">
              <button 
                @click="fetchTransactions"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Try again
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTransactions.length === 0" class="p-8 text-center">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">
              {{ transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ transactions.length === 0 ? 'Get started by adding your first transaction.' : 'Try adjusting your filters or search terms.' }}
            </p>
            <div class="mt-6">
              <button 
                v-if="transactions.length === 0"
                @click="openAddTransactionModal"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Add your first transaction
              </button>
              <button 
                v-else
                @click="resetFilters"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Clear filters
              </button>
            </div>
          </div>
        </div>

        <!-- Transactions List -->
        <div v-else class="overflow-hidden">
          <ul class="divide-y divide-gray-200">
            <li 
              v-for="transaction in filteredTransactions" 
              :key="transaction.id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <!-- Transaction Icon -->
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                         :class="getTransactionTypeClasses(transaction.type)">
                      <span class="text-lg">{{ TRANSACTION_TYPE_ICONS[transaction.type] }}</span>
                    </div>
                  </div>

                  <!-- Transaction Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ transaction.description }}
                      </p>
                      <span v-if="transaction.budget_items" 
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        🔗 {{ transaction.budget_items.name }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{{ transaction.category }}</span>
                      <span v-if="transaction.account_name">• {{ transaction.account_name }}</span>
                      <span>• {{ formatDate(transaction.date) }}</span>
                    </div>
                    <div v-if="transaction.tags && transaction.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                      <span 
                        v-for="tag in transaction.tags" 
                        :key="tag"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        #{{ tag }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Amount and Actions -->
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-sm font-medium" :class="getAmountClasses(transaction)">
                      {{ formatCurrency(transaction.amount) }}
                    </p>
                    <p v-if="transaction.tax_amount" class="text-xs text-gray-500">
                      Tax: {{ formatCurrency(transaction.tax_amount) }}
                    </p>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editTransaction(transaction)"
                      class="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button 
                      @click="deleteTransaction(transaction.id)"
                      class="text-gray-400 hover:text-red-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <AddTransactionModal
      v-model="showAddTransactionModal"
      @transaction-added="handleTransactionAdded" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactions.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useAuthStore } from '@/stores/auth.js'
import { useTransactionFilters } from '@/composables/useTransactionFilters.js'
import { useTransactionModals } from '@/composables/useTransactionModals.js'
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_ICONS } from '@/constants/budgetConstants.js'
import { formatCurrency, formatDate } from '@/utils/budgetUtils.js'
import AddTransactionModal from '@/components/AddTransactionModal.vue'

// Stores
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()

// Computed
const currentYear = computed(() => transactionStore.currentYear)
const currentMonth = computed(() => transactionStore.currentMonth)

// Selected year (from budget store to keep in sync)
const selectedYear = computed({
  get: () => budgetStore.selectedYear,
  set: (value) => {
    budgetStore.selectedYear = value
    transactionStore.selectedYear = value
    transactionStore.fetchTransactions(value)
    transactionStore.fetchTransactionStats(value)
  }
})

// Computed properties from store
const transactions = computed(() => transactionStore.transactions)
const transactionStats = computed(() => transactionStore.transactionStats)
const loading = computed(() => transactionStore.loading)
const addLoading = computed(() => transactionStore.addLoading)
const error = computed(() => transactionStore.error)

// Transaction filters composable
const {
  searchQuery,
  selectedTypeFilter,
  selectedCategoryFilter,
  selectedDateRange,
  customDateStart,
  customDateEnd,
  selectedBudgetItemFilter,
  selectedAccountFilter,
  showLinkedOnly,
  showUnlinkedOnly,
  availableTypes,
  availableCategories,
  availableBudgetItems,
  availableAccounts,
  dateRangeOptions,
  filteredTransactions,
  filteredStats,
  resetFilters,
  clearSearch,
  setQuickFilter
} = useTransactionFilters(
  transactions,
  selectedYear,
  transactionStore.selectedMonth
)

// Transaction modals composable
const {
  showAddTransactionModal,
  openAddTransactionModal,
  closeAddTransactionModal,
  editTransaction,
  deleteTransaction
} = useTransactionModals(
  transactionStore,
  selectedYear,
  currentYear,
  currentMonth
)

// Methods
const fetchTransactions = () => {
  transactionStore.fetchTransactions(selectedYear.value)
  transactionStore.fetchTransactionStats(selectedYear.value)
}

const handleTransactionAdded = (transaction) => {
  console.log('Transaction added:', transaction)
  // The store will automatically update the list
}

const getTransactionTypeClasses = (type) => {
  switch (type) {
    case 'income':
      return 'bg-emerald-100 text-emerald-600'
    case 'expense':
      return 'bg-rose-100 text-rose-600'
    case 'transfer':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getAmountClasses = (transaction) => {
  if (transaction.type === 'income') {
    return 'text-emerald-600'
  } else if (transaction.type === 'expense') {
    return 'text-rose-600'
  } else {
    return 'text-blue-600'
  }
}

// Lifecycle
onMounted(async () => {
  await transactionStore.initialize()
  fetchTransactions()
})

// Watch for year changes
watch(selectedYear, (newYear) => {
  fetchTransactions()
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    transactionStore.initialize()
  }
})
</script> 