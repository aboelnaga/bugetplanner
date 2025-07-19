<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
            <div class="text-sm text-gray-500">
              Track all your income, expenses, and transfers
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showAddTransactionModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Loading transactions...</span>
    </div>

    <!-- Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Transactions</p>
              <p class="text-2xl font-semibold text-gray-900">{{ transactions.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Income</p>
              <p class="text-2xl font-semibold text-green-600">{{ formatCurrency(totalIncome) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Expenses</p>
              <p class="text-2xl font-semibold text-red-600">{{ formatCurrency(totalExpenses) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Net Balance</p>
              <p class="text-2xl font-semibold" :class="netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(netBalance) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Filters</h3>
            <button
              @click="clearFilters"
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear All
            </button>
          </div>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                v-model="filters.type"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="filters.category"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                v-model="filters.dateRange"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Account</label>
              <select
                v-model="filters.account"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Accounts</option>
                <option v-for="account in availableAccounts" :key="account" :value="account">
                  {{ account }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Transactions ({{ filteredTransactions.length }})
          </h3>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="px-6 py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ transactions.length === 0 ? 'Get started by adding your first transaction.' : 'No transactions match your current filters.' }}
          </p>
          <div class="mt-6">
            <button
              @click="showAddTransactionModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Transaction
            </button>
          </div>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <!-- Transaction Info -->
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div
                    :class="getTransactionTypeColor(transaction.type)"
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <h4 class="text-lg font-medium text-gray-900 truncate">
                      {{ transaction.description || 'Transaction' }}
                    </h4>
                    <span
                      :class="getTypeBadgeColor(transaction.type)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ transaction.type }}
                    </span>
                  </div>
                  
                  <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      {{ transaction.category }}
                    </span>
                    
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ formatDate(transaction.date) }}
                    </span>
                    
                    <span v-if="transaction.accounts" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      {{ transaction.accounts.name }}
                    </span>
                  </div>
                  
                  <!-- Budget Item Link -->
                  <div v-if="transaction.budget_item_name" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                      {{ transaction.budget_item_name }}
                    </span>
                  </div>
                  
                  <!-- Tags -->
                  <div v-if="transaction.tags && transaction.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="tag in transaction.tags"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Amount and Actions -->
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p
                    :class="transaction.type === 'income' ? 'text-green-600' : transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'"
                    class="text-lg font-semibold"
                  >
                    {{ transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '' }}{{ formatCurrency(transaction.amount) }}
                  </p>
                  
                  <!-- Tax Information -->
                  <div v-if="transaction.gross_amount || transaction.tax_amount || transaction.net_amount" class="text-xs text-gray-500 mt-1">
                    <div v-if="transaction.gross_amount">Gross: {{ formatCurrency(transaction.gross_amount) }}</div>
                    <div v-if="transaction.tax_amount">Tax: {{ formatCurrency(transaction.tax_amount) }}</div>
                    <div v-if="transaction.net_amount">Net: {{ formatCurrency(transaction.net_amount) }}</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button
                    @click="editTransaction(transaction)"
                    class="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit transaction"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  
                  <button
                    @click="deleteTransaction(transaction)"
                    class="p-2 text-gray-400 hover:text-red-600"
                    title="Delete transaction"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div v-if="transaction.notes" class="mt-4 pl-14">
              <p class="text-sm text-gray-600 italic">"{{ transaction.notes }}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <AddTransactionModal
      v-model="showAddTransactionModal"
      :budget-item="editingTransaction"
      @transaction-added="onTransactionAdded"
      @transaction-updated="onTransactionUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'

// Store
const transactionStore = useTransactionStore()

// Reactive data
const isLoading = ref(false)
const showAddTransactionModal = ref(false)
const editingTransaction = ref(null)

// Filters
const filters = ref({
  type: '',
  category: '',
  dateRange: '',
  account: ''
})

// Computed properties
const transactions = computed(() => transactionStore.transactions)

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpenses = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const netBalance = computed(() => {
  return totalIncome.value - totalExpenses.value
})

const availableCategories = computed(() => {
  const categories = new Set()
  transactions.value.forEach(t => {
    if (t.category) {
      categories.add(t.category)
    }
  })
  return Array.from(categories).sort()
})

const availableAccounts = computed(() => {
  const accounts = new Set()
  transactions.value.forEach(t => {
    if (t.accounts && t.accounts.name) {
      accounts.add(t.accounts.name)
    }
  })
  return Array.from(accounts).sort()
})

const filteredTransactions = computed(() => {
  let items = transactions.value

  if (filters.value.type) {
    items = items.filter(t => t.type === filters.value.type)
  }

  if (filters.value.category) {
    items = items.filter(t => t.category === filters.value.category)
  }

  if (filters.value.account) {
    items = items.filter(t => t.accounts && t.accounts.name === filters.value.account)
  }

  if (filters.value.dateRange) {
    const now = new Date()
    const startDate = new Date()
    
    switch (filters.value.dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    items = items.filter(t => new Date(t.date) >= startDate)
  }

  return items.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    type: '',
    category: '',
    dateRange: '',
    account: ''
  }
}

const getTransactionTypeColor = (type) => {
  const colors = {
    income: 'bg-green-500',
    expense: 'bg-red-500',
    transfer: 'bg-blue-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getTypeBadgeColor = (type) => {
  const colors = {
    income: 'bg-green-100 text-green-800',
    expense: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  showAddTransactionModal.value = true
}

const deleteTransaction = async (transaction) => {
  if (confirm(`Are you sure you want to delete this transaction?`)) {
    try {
      await transactionStore.deleteTransaction(transaction.id)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }
}

const onTransactionAdded = async () => {
  await loadData()
}

const onTransactionUpdated = async () => {
  editingTransaction.value = null
  await loadData()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script> 