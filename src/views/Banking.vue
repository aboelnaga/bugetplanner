<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Card class="mb-6">
      <template #content>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">Banking</h1>
            <p class="mt-2">Manage your accounts and track balances</p>
          </div>
          
          <Button
            @click="showAddModal = true"
            icon="pi pi-plus"
            label="Add Account"
            severity="primary"
          />
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="accountsStore.loading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-3">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <span>Loading accounts...</span>
      </div>
    </div>

    <!-- Error State -->
    <Card v-else-if="accountsStore.error" class="mb-6" severity="danger">
      <template #content>
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-xl"></i>
          <div>
            <h3 class="font-medium">Error loading accounts</h3>
            <p class="mt-1">{{ accountsStore.error }}</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Accounts Grid -->
    <div v-else-if="accountsStore.accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card
        v-for="account in accountsStore.accounts"
        :key="account.id"
        class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        @click="handleAccountClick(account)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i :class="getAccountIcon(account.type)" class="text-blue-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-semibold">{{ account.name }}</h3>
                <p class="text-sm capitalize">{{ account.type.replace('_', ' ') }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-1">
              <Button
                v-if="account.is_default"
                icon="pi pi-star-fill"
                size="small"
                text
                severity="warning"
                v-tooltip.top="'Default Account'"
              />
              <Button
                icon="pi pi-ellipsis-v"
                size="small"
                text
                @click.stop="showAccountMenu($event, account)"
                v-tooltip.top="'More Options'"
              />
            </div>
          </div>
        </template>
        
        <template #content>
          <div class="space-y-4">
            <!-- Balance -->
            <div class="text-center">
              <p class="text-sm mb-1">Current Balance</p>
              <p class="text-2xl font-bold" :class="getBalanceColor(account.balance)">
                {{ formatCurrency(account.balance) }}
              </p>
            </div>
            
            <!-- Account Details -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Account Number:</span>
                <span class="font-medium">{{ account.account_number || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Routing Number:</span>
                <span class="font-medium">{{ account.routing_number || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Interest Rate:</span>
                <span class="font-medium">{{ account.interest_rate ? `${account.interest_rate}%` : 'N/A' }}</span>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex gap-2 pt-2">
              <Button
                icon="pi pi-history"
                label="History"
                size="small"
                outlined
                @click.stop="handleAccountHistory(account)"
                class="flex-1"
              />
              <Button
                icon="pi pi-exchange"
                label="Transfer"
                size="small"
                outlined
                @click.stop="handleTransfer(account)"
                class="flex-1"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="text-center py-12">
      <template #content>
        <div class="mb-4">
          <i class="pi pi-wallet text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium mb-2">No accounts yet</h3>
        <p class="mb-6">Get started by adding your first bank account</p>
        <Button
          @click="showAddModal = true"
          icon="pi pi-plus"
          label="Add Your First Account"
          severity="primary"
        />
      </template>
    </Card>

    <!-- Account Summary -->
    <Card v-if="accountsStore.accounts.length > 0" class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold">Account Summary</h2>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <p class="text-sm mb-2">Total Balance</p>
            <p class="text-3xl font-bold" :class="getTotalBalanceColor(accountsStore.totalBalance)">
              {{ formatCurrency(accountsStore.totalBalance) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-2">Number of Accounts</p>
            <p class="text-3xl font-bold">{{ accountsStore.accounts.length }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm mb-2">Default Account</p>
            <p class="text-xl font-semibold">
              {{ accountsStore.defaultAccount?.name || 'None' }}
            </p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Recent Transactions -->
    <Card v-if="accountsStore.accounts.length > 0" class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Recent Transactions</h2>
          <Button
            label="View All"
            text
            size="small"
            @click="router.push('/transactions')"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="recentTransactions"
          :rows="5"
          :showGridlines="true"
          stripedRows
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl mb-3"></i>
              <p>No recent transactions</p>
            </div>
          </template>

          <Column field="date" header="Date" style="width: 120px">
            <template #body="{ data }">
              <span class="font-medium">{{ formatDate(data.date) }}</span>
            </template>
          </Column>

          <Column field="description" header="Description" style="min-width: 200px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  :class="getTransactionTypeColor(data.type)"
                  class="w-3 h-3 rounded-full flex-shrink-0"
                ></div>
                <span class="font-medium">{{ data.description || 'Transaction' }}</span>
              </div>
            </template>
          </Column>

          <Column field="type" header="Type" style="width: 100px">
            <template #body="{ data }">
              <Tag :value="data.type" :severity="getTypeSeverity(data.type)" rounded />
            </template>
          </Column>

          <Column field="amount" header="Amount" style="width: 120px">
            <template #body="{ data }">
              <span
                :class="data.type === 'income' ? 'text-green-600' : data.type === 'expense' ? 'text-red-600' : 'text-blue-600'"
                class="font-semibold"
              >
                {{ data.type === 'income' ? '+' : data.type === 'expense' ? '-' : '' }}{{ formatCurrency(data.amount) }}
              </span>
            </template>
          </Column>

          <Column field="account" header="Account" style="width: 120px">
            <template #body="{ data }">
              <span v-if="data.accounts?.name" class="font-medium">{{ data.accounts.name }}</span>
              <span v-else>-</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Account Menu Overlay -->
    <OverlayPanel ref="accountMenu" class="w-48">
      <div class="p-2">
        <Button
          icon="pi pi-pencil"
          label="Edit Account"
          text
          class="w-full justify-start mb-2"
          @click="handleEditAccount(selectedAccountForMenu)"
        />
        <Button
          icon="pi pi-star"
          :label="selectedAccountForMenu?.is_default ? 'Remove Default' : 'Set as Default'"
          text
          class="w-full justify-start mb-2"
          @click="handleSetDefault(selectedAccountForMenu)"
        />
        <Button
          icon="pi pi-trash"
          label="Delete Account"
          text
          severity="danger"
          class="w-full justify-start"
          @click="handleDeleteAccount(selectedAccountForMenu)"
        />
      </div>
    </OverlayPanel>

    <!-- Add Account Modal -->
    <AddAccountModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @account-added="handleAccountAdded"
    />

    <!-- Edit Account Modal -->
    <EditAccountModal
      v-if="selectedAccount"
      :is-open="showEditModal"
      :account="selectedAccount"
      @close="handleCloseEditModal"
      @account-updated="handleAccountUpdated"
    />

    <!-- Transfer Modal -->
    <TransferModal
      v-model="showTransferModal"
      :from-account="transferFromAccount"
      @transfer-completed="handleTransferCompleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionStore } from '../stores/transactions'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AddAccountModal from '../components/AddAccountModal.vue'
import EditAccountModal from '../components/EditAccountModal.vue'
import TransferModal from '../components/TransferModal.vue'
import { formatCurrency, formatDate } from '../utils/budgetUtils'

const router = useRouter()
const accountsStore = useAccountsStore()
const transactionStore = useTransactionStore()
const toast = useToast()
const confirm = useConfirm()

// Reactive data
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTransferModal = ref(false)
const selectedAccount = ref(null)
const transferFromAccount = ref(null)
const selectedAccountForMenu = ref(null)
const accountMenu = ref()

// Computed properties
const recentTransactions = computed(() => {
  return transactionStore.transactions
    .slice(0, 5)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Methods
const getAccountIcon = (type) => {
  const icons = {
    checking: 'pi pi-credit-card',
    savings: 'pi pi-wallet',
    credit_card: 'pi pi-credit-card',
    cash: 'pi pi-money-bill'
  }
  return icons[type] || 'pi pi-bank'
}

const getBalanceColor = (balance) => {
  if (balance >= 0) return 'text-green-600'
  return 'text-red-600'
}

const getTotalBalanceColor = (balance) => {
  if (balance >= 0) return 'text-green-600'
  return 'text-red-600'
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

const handleAccountClick = (account) => {
  // Navigate to account details or transactions filtered by account
  router.push({
    name: 'Transactions',
    query: { 
      account: account.id,
      action: 'history'
    }
  })
}

const showAccountMenu = (event, account) => {
  selectedAccountForMenu.value = account
  accountMenu.value.toggle(event)
}

const handleEditAccount = (account) => {
  selectedAccount.value = account
  showEditModal.value = true
}

const handleCloseEditModal = () => {
  showEditModal.value = false
  selectedAccount.value = null
}

const handleTransfer = (account) => {
  transferFromAccount.value = account
  showTransferModal.value = true
}

const handleAccountHistory = (account) => {
  router.push({
    name: 'Transactions',
    query: { 
      account: account.id,
      action: 'history'
    }
  })
}

const handleSetDefault = async (account) => {
  try {
    await accountsStore.setDefaultAccount(account.id)
  } catch (error) {
    console.error('Error setting default account:', error)
  }
}

const handleAccountAdded = (account) => {
  console.log('Account added:', account)
}

const handleAccountUpdated = (account) => {
  console.log('Account updated:', account)
  handleCloseEditModal()
}

const handleTransferCompleted = (transactions) => {
  console.log('Transfer completed:', transactions)
  accountsStore.fetchAccounts()
}

const handleDeleteAccount = async (account) => {
  confirm.require({
    message: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await accountsStore.deleteAccount(account.id)
        console.log('Account deleted:', account.name)
      } catch (error) {
        console.error('Error deleting account:', error)
        toast.add({ severity: 'error', summary: 'Error deleting account', detail: error.message, life: 3000 })
      }
    },
    reject: () => {
      // User cancelled
    }
  })
}

// Lifecycle
onMounted(async () => {
  await accountsStore.fetchAccounts()
  await transactionStore.fetchTransactions()
})
</script> 