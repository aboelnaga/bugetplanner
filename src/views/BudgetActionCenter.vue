<template>
    <!-- Auto-Close Loading Indicator -->
    <div v-if="budgetStore.isAutoClosing" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-amber-500 h-1 transition-all duration-300" :style="{ width: budgetStore.autoCloseProgress + '%' }"></div>
    </div>

    <!-- Month Navigation -->
<Card class="mb-3">
<template #content>
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <!-- Month Navigation Controls -->
    <div class="flex flex-col sm:flex-row items-center gap-4">
      <div class="flex items-center gap-2">
        <Button icon="pi pi-chevron-left" rounded text :disabled="isLoading" @click="previousMonth" />
        
        <DatePicker
          v-model="selectedDate"
          view="month"
          dateFormat="MM yy"
                :disabled="isLoading"
          showIcon
          iconDisplay="input"
          :manualInput="false"
          inputClass="text-center w-32 sm:w-40"
        />
        
        <Button icon="pi pi-chevron-right" rounded text :disabled="isLoading" @click="nextMonth" />
            </div>
          </div>
          
    <!-- Month Actions -->
    <div class="flex flex-col sm:flex-row items-center gap-2">
            <!-- Month Closure Status -->
      <Tag v-if="isMonthClosed" value="Month Closed" severity="success" />
            
            <!-- Close Month Button -->
      <Button v-else-if="canCloseMonth" label="Close Month" icon="pi pi-step-forward" severity="info" outlined :disabled="isLoading" @click="handleCloseMonth" />
      
      <Button v-if="!isCurrentMonthSelected" label="Current Month" link :disabled="isLoading" @click="goToCurrentMonth" />
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
      <div v-if="budgetItems.length === 0" class="px-6 py-12 text-center">
        <i class="pi pi-box text-6xl text-gray-400 mb-4"></i>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No budget items found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ budgetItems.length === 0 ? 'No budget items for this month. Add some in the Budget Planner.' : 'No items match your current filters.' }}
          </p>
        </div>
        
      <!-- Grid View (Mobile) -->
      <div v-if="budgetItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 relative">
        <!-- Loading Overlay for Grid -->
        <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center rounded-lg">
          <div class="flex flex-col items-center gap-2">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              </div>
              
        <Panel 
          v-for="item in budgetItems" 
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
              <Tag :value="item.type" :severity="getTypeSeverity(item)" />
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
                  class="h-1.5"
                  :showValue="false"
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
            <div v-if="getExpandedRows.includes(item.id)" class="pt-4">
              <div class="rounded p-3">
                <h5 class="text-xs font-medium mb-3">Transaction History</h5>
                
                <div v-if="item.transactions && item.transactions.length > 0" class="space-y-2">
                  <div
                    v-for="transaction in item.transactions"
                    :key="transaction.id"
                    class="flex items-center gap-2 p-2 rounded text-xs"
                  >
                    <div class="flex items-center gap-2">
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

      <!-- Table View (Desktop) -->
      <div v-if="budgetItems.length > 0" class="hidden lg:block">
        <DataTable 
          :value="tableItems" 
          removableSort 
          responsiveLayout="scroll"
          v-model:expandedRows="expandedRows"
          dataKey="id"
        >
          <template #expansion="{ data }">
            <div v-if="!data.transactions || data.transactions.length === 0" class="p-4">
                <p class="text-sm">No transactions yet</p>
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
              <Tag :value="data.type" :severity="getTypeSeverity(data)" rounded />
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
              <div class="space-y-2">
                <div class="font-medium text-center">
                  {{ formatCurrency(getActualAmount(data)) }} / {{ formatCurrency(getBudgetAmount(data)) }}
                </div>
                <ProgressBar 
                  :value="getProgressPercentage(data)" 
                  :class="getProgressBarColor(data).replace('bg-', '')"
                  style="height: 4px;"
                  :showValue="false"
                />
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
import { useToast } from 'primevue/usetoast'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import BaseModal from '../components/BaseModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'
// PrimeVue components via auto-import: Button, Dropdown, Tag, SelectButton, DataTable, Column, ProgressBar, Panel, DatePicker

// Stores
const budgetStore = useBudgetStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

// Toast
const toast = useToast()

// Reactive data
const isLoading = ref(false)
const selectedDate = ref(new Date())
const showAddTransactionModal = ref(false)
const showSkipModal = ref(false)
const selectedBudgetItem = ref(null)
const skipReason = ref('')

// Computed properties for month/year from selectedDate
const selectedMonth = computed(() => selectedDate.value.getMonth())
const selectedYear = computed(() => selectedDate.value.getFullYear())

const isCurrentMonthSelected = computed(() => {
  const now = new Date()
  return selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth()
})

const budgetItems = ref([])

// Remove filteredItems and compute tableItems from budgetItems directly
const tableItems = computed(() =>
  budgetItems.value.map((item) => ({ ...item, statusLabel: getItemStatus(item) }))
)

const expandedRows = ref([])

// Ensure expandedRows is always an array
const getExpandedRows = computed(() => {
  return Array.isArray(expandedRows.value) ? expandedRows.value : []
})

// Methods
const loadData = async () => {
  console.log('loadData called')
  await loadDataForYear()
}

const loadDataForYear = async () => {
  console.log('Loading data for year:', selectedYear.value)
  isLoading.value = true
  try {
    // Fetch budget items for the year (they're stored per year)
    await budgetStore.fetchBudgetItems(selectedYear.value)
    
    // Fetch transactions for the current month of the year
    await transactionStore.fetchTransactions(selectedYear.value, selectedMonth.value)
    
    // Load budget items with transactions for the current month
    budgetItems.value = await budgetStore.getBudgetItemsForMonth(selectedMonth.value, selectedYear.value)
    
    // Fetch closed months
    await fetchClosedMonths()
  } catch (error) {
    console.error('Error loading data for year:', error)
    budgetItems.value = []
  } finally {
    isLoading.value = false
  }
}

const loadDataForMonth = async () => {
  console.log('Loading data for month:', selectedMonth.value, 'year:', selectedYear.value)
  isLoading.value = true
  try {
    // Only fetch transactions for the specific month (budget items are already loaded for the year)
    await transactionStore.fetchTransactions(selectedYear.value, selectedMonth.value)
    
    // Reload budget items to get updated transactions for the current month
    budgetItems.value = await budgetStore.getBudgetItemsForMonth(selectedMonth.value, selectedYear.value)
  } catch (error) {
    console.error('Error loading data for month:', error)
    budgetItems.value = []
  } finally {
    isLoading.value = false
  }
}

const previousMonth = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  selectedDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  selectedDate.value = newDate
}

const goToCurrentMonth = () => {
  selectedDate.value = new Date()
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

const getTypeSeverity = (item) => ((item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) ? 'success' : 'danger')



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
    const data = await budgetStore.getClosedMonths(selectedYear.value)
    closedMonths.value = data || []
  } catch (error) {
    console.error('Error fetching closed months:', error)
    closedMonths.value = []
  } finally {
    // loadingClosedMonths.value = false // This line is removed
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
      toast.add({ 
        severity: 'success', 
        summary: 'Month Closed Successfully', 
        detail: `Month ${selectedMonth.value + 1} ${selectedYear.value} has been closed and actual amounts are now displayed.`, 
        life: 5000 
      })
    }
  } catch (error) {
    console.error('Error closing month:', error)
    
    // Show error notification
    toast.add({ 
      severity: 'error', 
      summary: 'Error Closing Month', 
      detail: 'There was an error closing the month. Please try again.', 
      life: 7000 
    })
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
  const index = expandedRows.value.indexOf(item.id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(item.id)
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
  // Ensure expandedRows is properly initialized
  if (!Array.isArray(expandedRows.value)) {
    expandedRows.value = []
  }
  loadData()
})

watch(selectedDate, async (newDate, oldDate) => {
  if (!oldDate) return // Skip on initial mount
  
  const newYear = newDate.getFullYear()
  const newMonth = newDate.getMonth()
  const oldYear = oldDate.getFullYear()
  const oldMonth = oldDate.getMonth()
  
  // If year changed, fetch budget items for the new year
  if (newYear !== oldYear) {
    await loadDataForYear()
  } else {
    // If only month changed, just fetch transactions for the new month
    await loadDataForMonth()
  }
})


</script> 