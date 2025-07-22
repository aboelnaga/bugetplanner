<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Auto-Close Loading Indicator -->
    <div v-if="budgetStore.isAutoClosing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-amber-500 h-1 transition-all duration-300" :style="{ width: budgetStore.autoCloseProgress + '%' }"></div>
    </div>
    
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Budget Action Center</h1>
            <div class="text-sm text-gray-500">
              Manage your budget items and track progress
            </div>
            <!-- Auto-close Header Badge -->
            <div v-if="budgetStore.showHeaderBadge" class="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>{{ budgetStore.headerBadgeText }}</span>
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
            <!-- Month Closure Status -->
            <div v-if="isMonthClosed" class="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-md">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium text-green-700">Month Closed</span>
            </div>
            
            <!-- Close Month Button -->
            <button
              v-else-if="canCloseMonth"
              @click="handleCloseMonth"
              class="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              :disabled="isLoading"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium">Close Month</span>
            </button>
            
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
            <div class="flex items-center space-x-3">
              <!-- View Toggle -->
              <div class="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                <button
                  @click="viewMode = 'list'"
                  :class="viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors"
                  title="List View"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                </button>
                <button
                  @click="viewMode = 'grid'"
                  :class="viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors"
                  title="Grid View"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="clearFilters"
                class="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear All
              </button>
            </div>
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
        
        <!-- List View -->
        <div v-if="viewMode === 'list'" class="divide-y divide-gray-200">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <!-- Main Row -->
            <div class="flex items-center space-x-4 p-4">
              <!-- Status -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <div
                  :class="getStatusColor(item).bg"
                  class="w-2 h-2 rounded-full"
                ></div>
                <span
                  :class="getStatusBadgeColor(getItemStatus(item))"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                  :title="getStatusLabel(getItemStatus(item))"
                >
                  {{ getStatusLabel(getItemStatus(item)) }}
                </span>
              </div>
              
              <!-- Name -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ item.name }}
                  </h4>
                  <span
                    :class="getTypeBadgeColor(item.type)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                  >
                    {{ item.type }}
                  </span>
                  <span
                    :class="getCategoryBadgeColor(item.category)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                  >
                    {{ item.category }}
                  </span>
                  <span v-if="item.notes" class="text-gray-400" title="Has Notes">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </span>
                </div>
              </div>
              
              <!-- Actual/Budget with Progress Bar -->
              <div class="text-right flex-shrink-0 w-32">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(getActualAmount(item)) }} / {{ formatCurrency(getBudgetAmount(item)) }}
                </div>
                <!-- Progress Bar -->
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    :class="getProgressBarColor(item)"
                    :style="{ width: getProgressPercentage(item) + '%' }"
                    class="h-1.5 rounded-full transition-all duration-300"
                    :title="`${Math.round(getProgressPercentage(item))}% complete`"
                  ></div>
                </div>
              </div>
              
              <!-- Due -->
              <div class="text-right flex-shrink-0 w-24">
                <div v-if="calculateDueDate(item)" :class="getDueDateColor(item)" class="text-sm font-medium" :title="formatDate(calculateDueDate(item))">
                  {{ getDueDateText(item) }}
                </div>
                <div v-else class="text-sm text-gray-500">
                  No due date
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-1 flex-shrink-0">
                <button
                  v-if="item.is_fixed_expense"
                  @click="markAsPaid(item)"
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                  title="Mark as Paid"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Paid
                </button>
                
                <button
                  @click="addTransaction(item)"
                  class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Add Transaction"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add
                </button>
                
                <button
                  @click="skipItem(item)"
                  class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Skip Item"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Skip
                </button>
                
                <!-- Transaction Count -->
                <span v-if="item.transactions && item.transactions.length > 0" class="text-xs text-gray-500 px-1">
                  {{ item.transactions.length }}
                </span>
                
                <!-- Expand Arrow -->
                <button
                  @click="toggleHistory(item)"
                  class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  :title="expandedItems.includes(item.id) ? 'Hide History' : 'Show History'"
                >
                  <svg 
                    class="w-3 h-3 transition-transform duration-200" 
                    :class="expandedItems.includes(item.id) ? 'rotate-180' : ''"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Transaction History (Collapsible) -->
            <div v-if="expandedItems.includes(item.id)" class="px-4 pb-4">
              <div class="bg-gray-50 rounded p-3 mt-2">
                <h5 class="text-xs font-medium text-gray-900 mb-2">Transaction History</h5>
                
                <div v-if="item.transactions && item.transactions.length > 0" class="space-y-2">
                  <div
                    v-for="transaction in item.transactions"
                    :key="transaction.id"
                    class="flex items-center justify-between p-2 bg-white rounded shadow-sm"
                  >
                    <div class="flex items-center space-x-2">
                      <div
                        :class="getTransactionTypeColor(transaction.type)"
                        class="w-1.5 h-1.5 rounded-full"
                      ></div>
                      <div>
                        <p class="text-xs font-medium text-gray-900">
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
                        class="text-xs font-medium"
                      >
                        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-xs text-gray-500 text-center py-2">
                  No transactions yet for this budget item.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <div
                    :class="getStatusColor(item).bg"
                    class="w-2 h-2 rounded-full flex-shrink-0"
                  ></div>
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ item.name }}
                  </h4>
                </div>
                <div class="flex items-center space-x-1">
                  <span
                    :class="getTypeBadgeColor(item.type)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                  >
                    {{ item.type }}
                  </span>
                  <span
                    :class="getStatusBadgeColor(getItemStatus(item))"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                  >
                    {{ getStatusLabel(getItemStatus(item)) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Amount and Progress -->
            <div class="mb-3">
              <div class="text-lg font-bold text-gray-900 mb-1">
                {{ formatCurrency(getBudgetAmount(item)) }}
              </div>
              <div v-if="getActualAmount(item) > 0" class="text-xs text-gray-500 mb-2">
                {{ formatCurrency(getActualAmount(item)) }} / {{ formatCurrency(getBudgetAmount(item)) }}
              </div>
              <!-- Progress Bar -->
              <div v-if="item.transactions && item.transactions.length > 0" class="mb-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    :class="getProgressBarColor(item)"
                    :style="{ width: getProgressPercentage(item) + '%' }"
                    class="h-1.5 rounded-full transition-all duration-300"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Details -->
            <div class="space-y-1 mb-3 text-xs text-gray-500">
              <div class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                {{ item.category }}
              </div>
              <div class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ item.paymentSchedule }}
              </div>
              <div v-if="item.dueDate" class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ formatDate(calculateDueDate(item)) }}
              </div>
              <div v-if="item.transactions && item.transactions.length > 0" class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                {{ item.transactions.length }} transactions
              </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="mb-3">
              <div class="text-xs text-gray-500">
                <span v-if="getRemainingAmount(item) > 0" class="text-orange-600 font-medium">
                  Remaining: {{ formatCurrency(getRemainingAmount(item)) }}
                </span>
                <span v-else-if="getRemainingAmount(item) < 0" class="text-red-600 font-medium">
                  Over: {{ formatCurrency(Math.abs(getRemainingAmount(item))) }}
                </span>
                <span v-else class="text-green-600 font-medium">
                  Complete
                </span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-wrap gap-1">
              <button
                @click="markAsPaid(item)"
                class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                title="Mark as Paid"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Paid
              </button>
              
              <button
                @click="addTransaction(item)"
                class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Add Transaction"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add
              </button>
              
              <button
                @click="toggleHistory(item)"
                class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="View History"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                History
              </button>
              
              <button
                @click="skipItem(item)"
                class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Skip Item"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Skip
              </button>
            </div>
            
            <!-- Transaction History (Collapsible) -->
            <div v-if="expandedItems.includes(item.id)" class="mt-3 pt-3 border-t border-gray-100">
              <div class="bg-gray-50 rounded p-2">
                <h5 class="text-xs font-medium text-gray-900 mb-2">Transaction History</h5>
                
                <div v-if="item.transactions && item.transactions.length > 0" class="space-y-1">
                  <div
                    v-for="transaction in item.transactions"
                    :key="transaction.id"
                    class="flex items-center justify-between p-1 bg-white rounded text-xs"
                  >
                    <div class="flex items-center space-x-1">
                      <div
                        :class="getTransactionTypeColor(transaction.type)"
                        class="w-1 h-1 rounded-full"
                      ></div>
                      <span class="truncate">{{ transaction.description || 'Transaction' }}</span>
                    </div>
                    <span
                      :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                      class="font-medium ml-1"
                    >
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                    </span>
                  </div>
                </div>
                
                <div v-else class="text-xs text-gray-500 text-center py-1">
                  No transactions yet.
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
import { useAuthStore } from '../stores/auth'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import BaseModal from '../components/BaseModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'

// Stores
const budgetStore = useBudgetStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(false)
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const expandedItems = ref([])
const showAddTransactionModal = ref(false)
const showSkipModal = ref(false)
const selectedBudgetItem = ref(null)
const skipReason = ref('')
const viewMode = ref('list')

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
      transactionStore.fetchTransactions(selectedYear.value),
      fetchClosedMonths()
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
  const actualAmount = getActualAmount(item)
  const budgetAmount = getBudgetAmount(item)
  
  // Check if completed (amount matches exactly)
  if (actualAmount === budgetAmount) {
    return 'completed'
  }
  
  // Check if exceeds budget
  if (actualAmount > budgetAmount) {
    return 'exceeds'
  }
  
  // Check if partial
  if (actualAmount > 0 && actualAmount < budgetAmount) {
    return 'partial'
  }
  
  // Check if overdue
  const dueDate = calculateDueDate(item)
  if (dueDate) {
    const today = new Date()
    if (dueDate < today && actualAmount === 0) {
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

const getActualAmount = (item) => {
  if (!item.actual_amounts || !Array.isArray(item.actual_amounts)) return 0
  return parseFloat(item.actual_amounts[selectedMonth.value]) || 0
}

const getBudgetAmount = (item) => {
  if (!item || !item.amounts || !Array.isArray(item.amounts)) return 0
  return parseFloat(item.amounts[selectedMonth.value]) || 0
}

// Month closure logic
const closedMonths = ref([])
const loadingClosedMonths = ref(false)

const isMonthClosed = computed(() => {
  return closedMonths.value.some(closedMonth => 
    closedMonth.month === selectedMonth.value && closedMonth.year === selectedYear.value
  )
})

const canCloseMonth = computed(() => {
  // Can only close months that are not current or future
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  if (selectedYear.value === currentYear && selectedMonth.value >= currentMonth) {
    return false
  }
  
  // Can only close months that are not already closed
  if (isMonthClosed.value) {
    return false
  }
  
  // Can only close months that are at least 7 days old
  const currentDay = currentDate.getDate()
  
  // If we're in the same year and month, check if it's been 7+ days
  if (selectedYear.value === currentYear && selectedMonth.value === currentMonth) {
    return currentDay >= 7
  }
  
  // If it's a previous month, it can be closed
  if (selectedYear.value < currentYear || 
      (selectedYear.value === currentYear && selectedMonth.value < currentMonth)) {
    return true
  }
  
  return false
})

const fetchClosedMonths = async () => {
  if (!authStore.isAuthenticated || !authStore.userId) return
  
  try {
    loadingClosedMonths.value = true
    const data = await budgetStore.getClosedMonths(selectedYear.value)
    closedMonths.value = data || []
  } catch (error) {
    console.error('Error fetching closed months:', error)
    closedMonths.value = []
  } finally {
    loadingClosedMonths.value = false
  }
}

const handleCloseMonth = async () => {
  if (!authStore.isAuthenticated || !authStore.userId) return
  
  try {
    const success = await budgetStore.closeMonth(selectedYear.value, selectedMonth.value)
    if (success) {
      // Refresh closed months
      await fetchClosedMonths()
      
      // Show success notification
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December']
      const monthName = monthNames[selectedMonth.value]
      
      if (window.$toaster) {
        window.$toaster.success(
          'Month Closed Successfully',
          `${monthName} ${selectedYear.value} has been closed and actual amounts are now displayed.`
        )
      }
    }
  } catch (error) {
    console.error('Error closing month:', error)
    
    // Show error notification
    if (window.$toaster) {
      window.$toaster.error(
        'Error Closing Month',
        'There was an error closing the month. Please try again.'
      )
    }
  }
}

const getProgressPercentage = (item) => {
  const actual = getActualAmount(item)
  const budgetAmount = getBudgetAmount(item)
  if (budgetAmount === 0) return 0
  const percentage = (actual / budgetAmount) * 100
  return Math.min(percentage, 100)
}

const getProgressBarColor = (item) => {
  const percentage = getProgressPercentage(item)
  
  if (percentage >= 100) {
    return 'bg-green-500' // Complete
  } else if (percentage >= 90) {
    return 'bg-orange-500' // Approaching limit
  } else if (percentage > 0) {
    return 'bg-blue-500' // On track
  } else {
    return 'bg-gray-300' // No progress
  }
}

const getRemainingAmount = (item) => {
  const actualAmount = getActualAmount(item)
  const budgetAmount = getBudgetAmount(item)
  return budgetAmount - actualAmount
}

const getCategoryBadgeColor = (category) => {
  const colors = {
    'Essential': 'bg-red-100 text-red-800',
    'Housing': 'bg-blue-100 text-blue-800',
    'Transportation': 'bg-green-100 text-green-800',
    'Food': 'bg-yellow-100 text-yellow-800',
    'Utilities': 'bg-purple-100 text-purple-800',
    'Healthcare': 'bg-pink-100 text-pink-800',
    'Entertainment': 'bg-indigo-100 text-indigo-800',
    'Education': 'bg-teal-100 text-teal-800',
    'Savings': 'bg-emerald-100 text-emerald-800',
    'Investment': 'bg-cyan-100 text-cyan-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

const getDueDateText = (item) => {
  const dueDate = calculateDueDate(item)
  if (!dueDate) return 'No due date'
  
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `Overdue ${Math.abs(diffDays)} days`
  } else if (diffDays === 0) {
    return 'Due today'
  } else if (diffDays === 1) {
    return 'Due tomorrow'
  } else {
    return `Due in ${diffDays} days`
  }
}

const getDueDateColor = (item) => {
  const dueDate = calculateDueDate(item)
  if (!dueDate) return 'text-gray-500'
  
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'text-red-600' // Overdue
  } else if (diffDays <= 7) {
    return 'text-orange-600' // Due soon
  } else {
    return 'text-gray-900' // Future
  }
}

const calculateDueDate = (item) => {
  if (!item.payment_schedule) return null
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Check if this budget item is active for the current month
  const budgetAmount = getBudgetAmount(item)
  if (budgetAmount === 0) return null
  
  switch (item.payment_schedule) {
    case 'start_of_month':
      // Due on the 1st of the current month
      return new Date(currentYear, currentMonth, 1)
      
    case 'end_of_month':
      // Due on the last day of the current month
      return new Date(currentYear, currentMonth + 1, 0)
      
    case 'custom_dates':
      // Due on the specific day of the current month
      if (item.due_date && item.due_date >= 1 && item.due_date <= 31) {
        // Get the last day of the current month
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        // Use the minimum of due_date or last day of month
        const dueDay = Math.min(item.due_date, lastDayOfMonth)
        return new Date(currentYear, currentMonth, dueDay)
      }
      return null
      
    case 'throughout_month':
    default:
      // No specific due date for throughout_month
      return null
  }
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