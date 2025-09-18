<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransactionStore } from '../stores/transactions'
import { useAccountsStore } from '../stores/accounts'
import { useConfirm } from 'primevue/useconfirm'
import AddTransactionModal from '../components/AddTransactionModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'

// Store
const transactionStore = useTransactionStore()
const accountsStore = useAccountsStore()
const route = useRoute()
const router = useRouter()
const confirm = useConfirm()

// Reactive data
const isLoading = ref(false)
const showAddTransactionModal = ref(false)
const editingTransaction = ref(null)
const selectedAccount = ref(null)
const globalFilter = ref('')

// Filters
const filters = ref({
  type: '',
  category: '',
  dateRange: '',
  account: ''
})

// DataTable filters
const dtFilters = ref({
  global: { value: null, matchMode: 'contains' }
})

// Filter options
const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Investment', value: 'investment' }
]

const dateRangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' }
]

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

const selectedAccountName = computed(() => {
  if (filters.value.account) {
    const account = accountsStore.getAccountById(filters.value.account)
    return account ? account.name : null
  }
  return null
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

const categoryOptions = computed(() => {
  return availableCategories.value.map(cat => ({ label: cat, value: cat }))
})

const accountOptions = computed(() => {
  return [
    { label: 'All Accounts', value: '' },
    ...accountsStore.accounts.map(acc => ({
      label: `${acc.name} - ${formatCurrency(acc.balance)}`,
      value: acc.id
    }))
  ]
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
    items = items.filter(t => t.account_id === filters.value.account)
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

// Watch global filter
watch(globalFilter, (newValue) => {
  dtFilters.value.global.value = newValue
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
  globalFilter.value = ''
}

const clearAccountFilter = () => {
  filters.value.account = ''
  router.push({ name: 'Transactions' })
}

const getTransactionTypeColor = (type) => {
  const colors = {
    income: 'bg-green-500',
    expense: 'bg-red-500',
    investment: 'bg-blue-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getTypeSeverity = (type) => {
  const severity = {
    income: 'success',
    expense: 'danger',
    investment: 'info'
  }
  return severity[type] || 'secondary'
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  showAddTransactionModal.value = true
}

const deleteTransaction = async (transaction) => {
  confirm.require({
    message: 'Are you sure you want to delete this transaction?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      try {
        transactionStore.deleteTransaction(transaction.id)
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    },
    reject: () => {
      // User cancelled
    }
  })
}

const onTransactionAdded = async () => {
  selectedAccount.value = null
  await loadData()
}

const onTransactionUpdated = async () => {
  editingTransaction.value = null
  selectedAccount.value = null
  await loadData()
}

// Watch for route changes to handle query parameters
watch(() => route.query, (query) => {
  if (query.action === 'add' && query.account) {
    const accountId = query.account
    const account = accountsStore.getAccountById(accountId)
    if (account) {
      selectedAccount.value = account
      filters.value.account = account.id
      showAddTransactionModal.value = true
    }
  } else if (query.action === 'history' && query.account) {
    const accountId = query.account
    const account = accountsStore.getAccountById(accountId)
    if (account) {
      filters.value.account = account.id
      document.title = `Transactions - ${account.name}`
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await loadData()
  await accountsStore.fetchAccounts()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Card class="mb-6">
      <template #content>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold">
                {{ selectedAccountName ? `${selectedAccountName} Transactions` : 'Transactions' }}
              </h1>
              <p class="text-sm mt-1">
                {{ selectedAccountName ? `Transaction history for ${selectedAccountName}` : 'Track all your income, expenses, and transfers' }}
              </p>
            </div>

            <Button
              v-if="selectedAccountName"
              icon="pi pi-arrow-left"
              label="Back to All"
              outlined
              size="small"
              @click="clearAccountFilter"
            />
          </div>

          <Button
            icon="pi pi-plus"
            label="Add Transaction"
            severity="primary"
            @click="showAddTransactionModal = true"
          />
        </div>
      </template>
    </Card>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-list text-blue-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total Transactions
              </p>
              <p class="text-2xl font-semibold">
                {{ transactions.length }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-arrow-up text-green-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total Income
              </p>
              <p class="text-2xl font-semibold text-green-600">
                {{ formatCurrency(totalIncome) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <i class="pi pi-arrow-down text-red-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total Expenses
              </p>
              <p class="text-2xl font-semibold text-red-600">
                {{ formatCurrency(totalExpenses) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-line text-purple-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Net Balance
              </p>
              <p
                class="text-2xl font-semibold"
                :class="netBalance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(netBalance) }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">
            Filters
          </h3>
          <Button
            label="Clear All"
            text
            size="small"
            @click="clearFilters"
          />
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Type</label>
            <Select
              v-model="filters.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Types"
              class="w-full"
              :show-clear="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <Select
              v-model="filters.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="All Categories"
              class="w-full"
              :show-clear="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Date Range</label>
            <Select
              v-model="filters.dateRange"
              :options="dateRangeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Time"
              class="w-full"
              :show-clear="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Account</label>
            <Select
              v-model="filters.account"
              :options="accountOptions"
              option-label="label"
              option-value="value"
              placeholder="All Accounts"
              class="w-full"
              :show-clear="true"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Transactions DataTable -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">
            Transactions ({{ filteredTransactions.length }})
          </h3>

          <div class="flex items-center gap-2">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="globalFilter"
                placeholder="Search transactions..."
                class="w-64"
              />
            </IconField>
          </div>
        </div>
      </template>

      <template #content>
        <div
          v-if="filteredTransactions.length === 0"
          class="text-center py-12"
        >
          <i class="pi pi-inbox text-6xl mb-4" />
          <h3 class="text-lg font-medium mb-2">
            No transactions found
          </h3>
          <p class="mb-6">
            {{ transactions.length === 0 ? 'Get started by adding your first transaction.' : 'No transactions match your current filters.' }}
          </p>
          <Button
            icon="pi pi-plus"
            label="Add Transaction"
            severity="primary"
            @click="showAddTransactionModal = true"
          />
        </div>

        <DataTable
          v-else
          :value="filteredTransactions"
          :filters="dtFilters"
          filter-display="menu"
          :global-filter-fields="['description', 'category', 'notes']"
          removable-sort
          responsive-layout="scroll"
          class="p-datatable-sm"
          striped-rows
          show-gridlines
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50, 100]"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords} transactions"
        >
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl mb-3" />
              <p>No transactions found</p>
            </div>
          </template>

          <Column
            field="date"
            header="Date"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <span class="font-medium">{{ formatDate(data.date) }}</span>
            </template>
          </Column>

          <Column
            field="description"
            header="Description"
            sortable
            style="min-width: 200px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  :class="getTransactionTypeColor(data.type)"
                  class="w-3 h-3 rounded-full flex-shrink-0"
                />
                <span class="font-medium">{{ data.description || 'Transaction' }}</span>
              </div>
            </template>
          </Column>

          <Column
            field="type"
            header="Type"
            sortable
            style="width: 100px"
          >
            <template #body="{ data }">
              <Tag
                :value="data.type"
                :severity="getTypeSeverity(data.type)"
                rounded
              />
            </template>
          </Column>

          <Column
            field="category"
            header="Category"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <span
                v-if="data.category"
                class="font-medium"
              >{{ data.category }}</span>
              <span v-else>-</span>
            </template>
          </Column>

          <Column
            field="amount"
            header="Amount"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <span
                :class="data.type === 'income' ? 'text-green-600' : data.type === 'expense' ? 'text-red-600' : 'text-blue-600'"
                class="font-semibold text-lg"
              >
                {{ data.type === 'income' ? '+' : data.type === 'expense' ? '-' : '' }}{{ formatCurrency(data.amount) }}
              </span>
            </template>
          </Column>

          <Column
            field="account"
            header="Account"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <span
                v-if="data.accounts?.name"
                class="font-medium"
              >{{ data.accounts.name }}</span>
              <span v-else>-</span>
            </template>
          </Column>

          <Column
            field="budget_item"
            header="Budget Item"
            sortable
            style="width: 140px"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.budget_item_name"
                :value="data.budget_item_name"
                severity="info"
                rounded
                size="small"
              />
              <span v-else>-</span>
            </template>
          </Column>

          <Column
            header="Actions"
            style="width: 120px"
          >
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  v-tooltip.top="'Edit Transaction'"
                  icon="pi pi-pencil"
                  size="small"
                  text
                  severity="info"
                  @click="editTransaction(data)"
                />
                <Button
                  v-tooltip.top="'Delete Transaction'"
                  icon="pi pi-trash"
                  size="small"
                  text
                  severity="danger"
                  @click="deleteTransaction(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Add/Edit Transaction Modal -->
    <AddTransactionModal
      v-model="showAddTransactionModal"
      :budget-item="editingTransaction"
      :selected-account="selectedAccount"
      @transaction-added="onTransactionAdded"
      @transaction-updated="onTransactionUpdated"
    />
  </div>
</template>