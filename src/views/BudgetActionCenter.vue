<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Budget Action Center</h1>
            <div class="text-sm text-gray-500">
              Manage your budget items and track progress
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <router-link
              to="/budget-planner"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Budget Planner
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Month Navigation -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="previousMonth"
              class="p-2 rounded-md hover:bg-gray-100"
              :disabled="isLoading"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex items-center space-x-2">
              <select
                v-model="selectedMonth"
                @change="onMonthChange"
                class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                :disabled="isLoading"
              >
                <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
              
              <select
                v-model="selectedYear"
                @change="onYearChange"
                class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                :disabled="isLoading"
              >
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            
            <button
              @click="nextMonth"
              class="p-2 rounded-md hover:bg-gray-100"
              :disabled="isLoading"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="goToCurrentMonth"
              class="text-sm text-indigo-600 hover:text-indigo-800"
              :disabled="isLoading"
            >
              Current Month
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Loading budget items...</span>
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
              <p class="text-sm font-medium text-gray-500">Total Items</p>
              <p class="text-2xl font-semibold text-gray-900">{{ budgetItems.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Completed</p>
              <p class="text-2xl font-semibold text-gray-900">{{ completedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Overdue</p>
              <p class="text-2xl font-semibold text-gray-900">{{ overdueCount }}</p>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="filters.status"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="skipped">Skipped</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
                <option value="exceeds">Exceeds Budget</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                v-model="filters.type"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Schedule</label>
              <select
                v-model="filters.paymentSchedule"
                class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Schedules</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Items List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Budget Items for {{ monthYearLabel }}
          </h3>
        </div>
        
        <div v-if="filteredItems.length === 0" class="px-6 py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No budget items found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ budgetItems.length === 0 ? 'No budget items for this month. Add some in the Budget Planner.' : 'No items match your current filters.' }}
          </p>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <!-- Item Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div
                      :class="getStatusColor(item).bg"
                      class="w-3 h-3 rounded-full"
                    ></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-lg font-medium text-gray-900 truncate">
                        {{ item.name }}
                      </h4>
                      <span
                        :class="getTypeBadgeColor(item.type)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ item.type }}
                      </span>
                    </div>
                    
                    <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        {{ formatCurrency(item.amount) }}
                      </span>
                      
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        {{ item.category }}
                      </span>
                      
                      <span v-if="item.dueDate" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {{ formatDate(item.dueDate) }}
                      </span>
                      
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {{ item.paymentSchedule }}
                      </span>
                    </div>
                    
                    <!-- Status and Progress -->
                    <div class="mt-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                          <span
                            :class="getStatusBadgeColor(getItemStatus(item))"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          >
                            {{ getStatusLabel(getItemStatus(item)) }}
                          </span>
                          
                          <span v-if="item.transactions && item.transactions.length > 0" class="text-sm text-gray-500">
                            {{ item.transactions.length }} transaction{{ item.transactions.length !== 1 ? 's' : '' }}
                          </span>
                        </div>
                        
                        <div v-if="item.transactions && item.transactions.length > 0" class="text-sm text-gray-500">
                                                  <span class="font-medium">{{ formatCurrency(getTotalTransactions(item)) }}</span>
                        <span class="mx-1">/</span>
                        <span>{{ formatCurrency(item.amount) }}</span>
                        </div>
                      </div>
                      
                      <!-- Progress Bar -->
                      <div v-if="item.transactions && item.transactions.length > 0" class="mt-2">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            :class="getProgressBarColor(item)"
                            :style="{ width: getProgressPercentage(item) + '%' }"
                            class="h-2 rounded-full transition-all duration-300"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="markAsPaid(item)"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Mark Paid
                </button>
                
                <button
                  @click="addTransaction(item)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Transaction
                </button>
                
                <button
                  @click="skipItem(item)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Skip
                </button>
                
                <button
                  @click="toggleHistory(item)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  History
                </button>
              </div>
            </div>
            
            <!-- Transaction History (Collapsible) -->
            <div v-if="expandedItems.includes(item.id)" class="mt-4 pl-6 border-l-2 border-gray-200">
              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-medium text-gray-900 mb-3">Transaction History</h5>
                
                <div v-if="item.transactions && item.transactions.length > 0" class="space-y-3">
                  <div
                    v-for="transaction in item.transactions"
                    :key="transaction.id"
                    class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        :class="getTransactionTypeColor(transaction.type)"
                        class="w-2 h-2 rounded-full"
                      ></div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{ transaction.description || 'Transaction' }}
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ formatDate(transaction.date) }}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p
                        :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                        class="text-sm font-medium"
                      >
                        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-sm text-gray-500 text-center py-4">
                  No transactions yet for this budget item.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <AddTransactionModal
      v-model="showAddTransactionModal"
      :budget-item="selectedBudgetItem"
      @transaction-added="onTransactionAdded"
      @transaction-updated="onTransactionUpdated"
    />

    <!-- Skip Item Modal -->
    <BaseModal
      v-if="showSkipModal"
      @close="closeSkipModal"
      title="Skip Budget Item"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          Are you sure you want to skip "{{ selectedBudgetItem?.name }}"? This will mark it as skipped for this month.
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reason (optional)
          </label>
          <textarea
            v-model="skipReason"
            rows="3"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Why are you skipping this item?"
          ></textarea>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeSkipModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="confirmSkip"
            class="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
          >
            Skip Item
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useTransactionStore } from '../stores/transactions'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import BaseModal from '../components/BaseModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'

// Stores
const budgetStore = useBudgetStore()
const transactionStore = useTransactionStore()

// Reactive data
const isLoading = ref(false)
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const expandedItems = ref([])
const showAddTransactionModal = ref(false)
const showSkipModal = ref(false)
const selectedBudgetItem = ref(null)
const skipReason = ref('')

// Filters
const filters = ref({
  status: '',
  type: '',
  category: '',
  paymentSchedule: ''
})

// Computed properties
const monthYearLabel = computed(() => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[selectedMonth.value]} ${selectedYear.value}`
})

const availableMonths = computed(() => {
  return [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ]
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i)
  }
  return years
})

const budgetItems = ref([])

const loadBudgetItems = async () => {
  console.log('Loading budget items for month:', selectedMonth.value, 'year:', selectedYear.value)
  try {
    budgetItems.value = await budgetStore.getBudgetItemsForMonth(selectedMonth.value, selectedYear.value)
    console.log('Loaded budget items:', budgetItems.value.length)
  } catch (error) {
    console.error('Error loading budget items:', error)
    budgetItems.value = []
  }
}

const availableCategories = computed(() => {
  const categories = new Set()
  budgetItems.value.forEach(item => {
    if (item.category) {
      categories.add(item.category)
    }
  })
  return Array.from(categories).sort()
})

const filteredItems = computed(() => {
  let items = budgetItems.value

  if (filters.value.status) {
    items = items.filter(item => getItemStatus(item) === filters.value.status)
  }

  if (filters.value.type) {
    items = items.filter(item => item.type === filters.value.type)
  }

  if (filters.value.category) {
    items = items.filter(item => item.category === filters.value.category)
  }

  if (filters.value.paymentSchedule) {
    items = items.filter(item => item.paymentSchedule === filters.value.paymentSchedule)
  }

  return items
})

const completedCount = computed(() => {
  return filteredItems.value.filter(item => getItemStatus(item) === 'completed').length
})

const pendingCount = computed(() => {
  return filteredItems.value.filter(item => getItemStatus(item) === 'pending').length
})

const overdueCount = computed(() => {
  return filteredItems.value.filter(item => getItemStatus(item) === 'overdue').length
})

// Methods
const loadData = async () => {
  console.log('loadData called')
  isLoading.value = true
  try {
    console.log('Loading transactions...')
    await Promise.all([
      transactionStore.fetchTransactions(selectedYear.value)
    ])
    console.log('Loading budget items...')
    await loadBudgetItems()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const previousMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
}

const nextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
}

const goToCurrentMonth = () => {
  const now = new Date()
  selectedMonth.value = now.getMonth()
  selectedYear.value = now.getFullYear()
}

const onMonthChange = async () => {
  await loadBudgetItems()
}

const onYearChange = async () => {
  await loadBudgetItems()
}

const clearFilters = () => {
  filters.value = {
    status: '',
    type: '',
    category: '',
    paymentSchedule: ''
  }
}

const getItemStatus = (item) => {
  const transactions = item.transactions || []
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  // Check if completed (amount matches exactly)
  if (totalAmount === item.amount) {
    return 'completed'
  }
  
  // Check if exceeds budget
  if (totalAmount > item.amount) {
    return 'exceeds'
  }
  
  // Check if partial
  if (totalAmount > 0 && totalAmount < item.amount) {
    return 'partial'
  }
  
  // Check if overdue
  if (item.dueDate) {
    const dueDate = new Date(item.dueDate)
    const today = new Date()
    if (dueDate < today && totalAmount === 0) {
      return 'overdue'
    }
  }
  
  // Check if skipped (we'll implement this later)
  if (item.skipped) {
    return 'skipped'
  }
  
  return 'pending'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    completed: 'Completed',
    overdue: 'Overdue',
    skipped: 'Skipped',
    partial: 'Partial',
    full: 'Full',
    exceeds: 'Exceeds Budget'
  }
  return labels[status] || 'Unknown'
}

const getStatusColor = (item) => {
  const status = getItemStatus(item)
  const colors = {
    pending: { bg: 'bg-yellow-400' },
    completed: { bg: 'bg-green-400' },
    overdue: { bg: 'bg-red-400' },
    skipped: { bg: 'bg-gray-400' },
    partial: { bg: 'bg-blue-400' },
    full: { bg: 'bg-green-400' },
    exceeds: { bg: 'bg-red-500' }
  }
  return colors[status] || { bg: 'bg-gray-400' }
}

const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    skipped: 'bg-gray-100 text-gray-800',
    partial: 'bg-blue-100 text-blue-800',
    full: 'bg-green-100 text-green-800',
    exceeds: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getTypeBadgeColor = (type) => {
  return type === 'income' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}

const getTransactionTypeColor = (type) => {
  return type === 'income' ? 'bg-green-400' : 'bg-red-400'
}

const getTotalTransactions = (item) => {
  const transactions = item.transactions || []
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

const getProgressPercentage = (item) => {
  const total = getTotalTransactions(item)
  const percentage = (total / item.amount) * 100
  return Math.min(percentage, 100)
}

const getProgressBarColor = (item) => {
  const status = getItemStatus(item)
  const colors = {
    completed: 'bg-green-500',
    exceeds: 'bg-red-500',
    partial: 'bg-blue-500',
    pending: 'bg-yellow-500',
    overdue: 'bg-red-400'
  }
  return colors[status] || 'bg-gray-500'
}

const toggleHistory = (item) => {
  const index = expandedItems.value.indexOf(item.id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(item.id)
  }
}

const markAsPaid = (item) => {
  selectedBudgetItem.value = item
  showAddTransactionModal.value = true
}

const addTransaction = (item) => {
  selectedBudgetItem.value = item
  showAddTransactionModal.value = true
}

const skipItem = (item) => {
  selectedBudgetItem.value = item
  skipReason.value = ''
  showSkipModal.value = true
}



const closeSkipModal = () => {
  showSkipModal.value = false
  selectedBudgetItem.value = null
  skipReason.value = ''
}

const confirmSkip = async () => {
  if (!selectedBudgetItem.value) return
  
  try {
    // For now, we'll just close the modal
    // TODO: Implement skip functionality
    console.log('Skipping item:', selectedBudgetItem.value.name, 'Reason:', skipReason.value)
    closeSkipModal()
  } catch (error) {
    console.error('Error skipping item:', error)
  }
}

const onTransactionAdded = async () => {
  await loadBudgetItems()
  selectedBudgetItem.value = null
}

const onTransactionUpdated = async () => {
  await loadBudgetItems()
  selectedBudgetItem.value = null
}

// Lifecycle
onMounted(() => {
  loadData()
})


</script> 