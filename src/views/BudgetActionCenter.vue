<template>
<!-- Auto-Close Loading Indicator -->
<div v-if="budgetStore.isAutoClosing" class="fixed top-0 left-0 right-0 z-50">
<div class="bg-amber-500 h-1 transition-all duration-300" :style="{ width: budgetStore.autoCloseProgress + '%' }"></div>
</div>

<!-- Month Navigation -->
<Card class="mb-3">
<template #content>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <Button icon="pi pi-chevron-left" rounded text :disabled="isLoading" @click="previousMonth" />
      
      <div class="flex items-center space-x-2">
        <Select
          v-model="selectedMonth"
          :options="availableMonths"
          optionLabel="label"
          optionValue="value"
          :disabled="isLoading"
          class="w-50"
          @change="onMonthChange"
          placeholder="Select Month"
        />
        
        <Select
          v-model="selectedYear"
          :options="availableYears"
          :disabled="isLoading"
          class="w-auto"
          @change="onYearChange"
          placeholder="Year"
        />
      </div>
      
      <Button icon="pi pi-chevron-right" rounded text :disabled="isLoading" @click="nextMonth" />
    </div>
    
    <div class="flex items-center space-x-2">
      <!-- Month Closure Status -->
      <Tag v-if="isMonthClosed" value="Month Closed" severity="success" />
      
      <!-- Close Month Button -->
      <Button v-else-if="canCloseMonth" label="Close Month" icon="pi pi-step-forward" severity="info" outlined :disabled="isLoading" @click="handleCloseMonth" />
      
      <Button label="Current Month" link :disabled="isLoading" @click="goToCurrentMonth" />

      <!-- View Mode Toggle -->
      <SelectButton v-model="viewMode" :options="viewOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
    </div>
  </div>
</template>
</Card>

<!-- Budget Items List -->
<Card>  
  <template #content>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Loading budget items...</span>
    </div>
    
    <!-- Content -->
    <div v-else>
      <div v-if="filteredItems.length === 0" class="px-6 py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No budget items found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ budgetItems.length === 0 ? 'No budget items for this month. Add some in the Budget Planner.' : 'No items match your current filters.' }}
        </p>
      </div>
      
      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Panel 
          v-for="item in filteredItems" 
          :key="item.id" 
          class="hover:shadow-lg transition-shadow duration-200"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <div
                :class="getStatusColor(item).bg"
                class="w-2 h-2 rounded-full flex-shrink-0"
              ></div>
              <span class="font-medium truncate">{{ item.name }}</span>
            </div>
          </template>
            <!-- Type and Status Tags -->
            <div class="flex items-center gap-2 mb-3">
              <Tag :value="item.type" :severity="getTypeSeverity(item.type)" />
              <Tag :value="getStatusLabel(getItemStatus(item))" :severity="getStatusSeverity(getItemStatus(item))" />
            </div>
            
            <!-- Amount and Progress -->
            <div class="mb-4">
              <div class="text-lg font-bold mb-2">
                {{ formatCurrency(getBudgetAmount(item)) }}
              </div>
              <div v-if="getActualAmount(item) > 0" class="text-xs mb-3">
                {{ formatCurrency(getActualAmount(item)) }} / {{ formatCurrency(getBudgetAmount(item)) }}
              </div>
              <!-- Progress Bar -->
              <div v-if="item.transactions && item.transactions.length > 0" class="mb-3">
                <ProgressBar 
                  :value="getProgressPercentage(item)" 
                  :class="getProgressBarColor(item).replace('bg-', '')"
                  class="h-2"
                />
              </div>
            </div>
            
            <!-- Details -->
            <div class="space-y-2 mb-4 text-xs">
              <div class="flex items-center">
                <i class="pi pi-tag mr-2"></i>
                {{ item.category }}
              </div>
              <div class="flex items-center">
                <i class="pi pi-clock mr-2"></i>
                {{ item.paymentSchedule }}
              </div>
              <div v-if="item.dueDate" class="flex items-center">
                <i class="pi pi-calendar mr-2"></i>
                {{ formatDate(calculateDueDate(item)) }}
              </div>
              <div v-if="item.transactions && item.transactions.length > 0" class="flex items-center">
                <i class="pi pi-credit-card mr-2"></i>
                {{ item.transactions.length }} transactions
              </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="mb-4">
              <div class="text-xs">
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
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="getItemStatus(item) !== 'completed'"
                label="Paid"
                icon="pi pi-check"
                size="small"
                severity="success"
                @click="markAsPaid(item)"
              />
              
              <Button
                label="Add"
                icon="pi pi-plus"
                size="small"
                outlined
                @click="addTransaction(item)"
              />
              
              <Button
                label="History"
                icon="pi pi-clock"
                size="small"
                text
                @click="toggleHistory(item)"
              />
              
              <Button
                label="Skip"
                icon="pi pi-times"
                size="small"
                outlined
                severity="secondary"
                @click="skipItem(item)"
              />
            </div>
            
            <!-- Transaction History (Collapsible) -->
            <div v-if="expandedItems.includes(item.id)" class="pt-4">
              <div class="rounded p-3">
                <h5 class="text-xs font-medium mb-3">Transaction History</h5>
                
                <div v-if="item.transactions && item.transactions.length > 0" class="space-y-2">
                  <div
                    v-for="transaction in item.transactions"
                    :key="transaction.id"
                    class="flex items-center justify-between p-2 rounded text-xs"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        :class="getTransactionTypeColor(transaction.type)"
                        class="w-2 h-2 rounded-full"
                      ></div>
                      <span class="truncate">{{ transaction.description || 'Transaction' }}</span>
                    </div>
                    <span
                      :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                      class="font-medium"
                    >
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                    </span>
                  </div>
                </div>
                
                <div v-else class="text-xs text-center py-2">
                  No transactions yet.
                </div>
              </div>
            </div>
        </Panel>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'">
        <div class="flex justify-between items-center mb-3">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="globalFilter" placeholder="Search" @input="dtFilters.global.value = globalFilter" />
          </IconField>
        </div>
        <DataTable 
          :value="tableItems" 
          :filters="dtFilters" 
          filterDisplay="menu" 
          removableSort 
          responsiveLayout="scroll"
          v-model:expandedRows="expandedRows"
          dataKey="id"
        >
          <template #expansion="{ data }">
            <div v-if="!data.transactions || data.transactions.length === 0" class="text-center py-6">
                <i class="pi pi-credit-card text-3xl mb-3"></i>
                <p class="text-sm">No transactions yet</p>
                <p class="text-xs text-gray-500 mt-1">Add a transaction to see it here</p>
              </div>
            <div v-else class="p-4">
              <h5 class="text-sm font-medium mb-3">Transaction History</h5>
              
              <DataTable 
                :value="data.transactions || []" 
                responsiveLayout="scroll"
                class="nested-datatable"
              >
              <Column field="date" header="Date" sortable>
                  <template #body="{ data: transaction }">
                    <span>{{ formatDate(transaction.date) }}</span>
                  </template>
                </Column>

                <Column field="amount" header="Amount" sortable>
                  <template #body="{ data: transaction }">
                    <span
                      :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                      class="font-medium"
                    >
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                    </span>
                  </template>
                </Column>
                
                <Column field="type" header="Type" sortable>
                  <template #body="{ data: transaction }">
                    <Tag :value="transaction.type" :severity="transaction.type === 'income' ? 'success' : 'danger'" />
                  </template>
                </Column>
                
                <Column field="account" header="Account" sortable>
                  <template #body="{ data: transaction }">
                    <span v-if="transaction.accounts?.name">{{ transaction.accounts?.name }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </template>
                </Column>
                
                <Column field="category" header="Category" sortable>
                  <template #body="{ data: transaction }">
                    <span v-if="transaction.category">{{ transaction.category }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </template>
                </Column>

                <Column field="description" header="Description" sortable>
                  <template #body="{ data: transaction }">
                    <div class="flex items-center gap-2">
                      <div
                        :class="getTransactionTypeColor(transaction.type)"
                        class="w-2 h-2 rounded-full"
                      ></div>
                      <span class="font-medium">{{ transaction.description || 'Transaction' }}</span>
                    </div>
                  </template>
                </Column>
                
                <Column field="notes" header="Notes" sortable>
                  <template #body="{ data: transaction }">
                    <span v-if="transaction.notes" class="truncate max-w-xs">{{ transaction.notes }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </template>
                </Column>
                
                <Column header="Actions" style="width: 120px">
                  <template #body="{ data: transaction }">
                    <div class="flex gap-1">
                      <Button
                        icon="pi pi-pencil"
                        size="small"
                        text
                        severity="info"
                        @click="editTransaction(transaction)"
                        v-tooltip.top="'Edit Transaction'"
                      />
                      <Button
                        icon="pi pi-trash"
                        size="small"
                        text
                        severity="danger"
                        @click="deleteTransaction(transaction)"
                        v-tooltip.top="'Delete Transaction'"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
          
          <Column expander style="width: 3rem"/>
          <Column field="type" header="Type" sortable>
            <template #body="{ data }">
              <Tag :value="data.type" :severity="getTypeSeverity(data.type)" rounded />
            </template>
          </Column>
          <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name">
            <template #body="{ data }">
              <div>
                <div class="font-medium">{{ data.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ (data.transactions || []).length }} paid
                </div>
              </div>
            </template>
          </Column>
          <Column header="Progress">
            <template #body="{ data }">
              <div class="space-y-1">
                <ProgressBar 
                  :value="getProgressPercentage(data)" 
                  :class="getProgressBarColor(data).replace('bg-', '')"
                  class="h-2"
                />
                <div class="text-xs text-center">
                  {{ formatCurrency(getActualAmount(data)) }} / {{ formatCurrency(getBudgetAmount(data)) }}
                </div>
              </div>
            </template>
          </Column>
          <Column field="statusLabel" header="Status" sortable>
            <template #body="{ data }">
              <Tag :value="getStatusLabel(getItemStatus(data))" :severity="getStatusSeverity(getItemStatus(data))" rounded />
            </template>
          </Column>
          <Column field="due" header="Due"">
            <template #body="{ data }">
              <span 
                :class="getDueDateColor(data)" 
                v-tooltip.top="getDueDateTooltip(data)"
              >
                {{ getDueDateText(data) }}
              </span>
            </template>
          </Column>
          <Column field="category" header="Category">
            <template #body="{ data }">
              <Tag :value="data.category" severity="info" rounded />
            </template>
          </Column>
          <Column header="Actions" style="width: 180px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button 
                  v-if="getItemStatus(data) !== 'completed'"
                  label="Pay" 
                  icon="pi pi-check" 
                  size="small" 
                  severity="success"
                  @click="markAsPaid(data)" 
                />
                <Button label="Add" icon="pi pi-plus" size="small" outlined @click="addTransaction(data)" />
                <Button label="Skip" icon="pi pi-times" size="small" outlined @click="skipItem(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </template>
</Card>

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
  <p>
    Are you sure you want to skip "{{ selectedBudgetItem?.name }}"? This will mark it as skipped for this month.
  </p>
  
  <div>
    <label class="block text-sm font-medium mb-2">
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
      class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useTransactionStore } from '../stores/transactions'
import { useAuthStore } from '../stores/auth'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import BaseModal from '../components/BaseModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'
// PrimeVue components via auto-import: Button, Dropdown, Tag, SelectButton, DataTable, Column, ProgressBar, Panel

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
const viewMode = ref('table')
const viewOptions = [
  { label: 'Table', value: 'table' },
  { label: 'Grid', value: 'grid' }
]

// Filters (kept for existing computed filtering – no selects rendered)
const filters = ref({ status: '', type: '', category: '', paymentSchedule: '' })

// DataTable filtering
const dtFilters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
  type: { value: null, matchMode: 'equals' },
  statusLabel: { value: null, matchMode: 'equals' },
  category: { value: null, matchMode: 'contains' }
})
const globalFilter = ref('')

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

// Table data including derived status field
const tableItems = computed(() =>
  filteredItems.value.map((item) => ({ ...item, statusLabel: getItemStatus(item) }))
)

const expandedRows = ref([])

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

const getStatusSeverity = (status) => {
  const map = {
    pending: 'warning',
    completed: 'success',
    overdue: 'danger',
    skipped: 'secondary',
    partial: 'info',
    full: 'success',
    exceeds: 'danger'
  }
  return map[status] || 'secondary'
}

const getTypeSeverity = (type) => (type === 'income' ? 'success' : 'danger')

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

const getDueDateTooltip = (item) => {
  return formatDate(calculateDueDate(item));
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

const editTransaction = (transaction) => {
  // TODO: Implement transaction editing
  console.log('Edit transaction:', transaction)
  // This could open a modal or navigate to transaction edit page
}

const deleteTransaction = (transaction) => {
  // TODO: Implement transaction deletion with confirmation
  console.log('Delete transaction:', transaction)
  // This should show a confirmation dialog before deleting
}

const getPaidTransactionCount = (item) => {
  const transactions = item.transactions || []
  return transactions.filter(t => t.type === 'income').length
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