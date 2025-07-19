<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Banking</h1>
          <p class="text-gray-600 mt-2">Manage your accounts and track balances</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Account</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="accountsStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="accountsStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading accounts</h3>
          <p class="text-sm text-red-700 mt-1">{{ accountsStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Accounts Grid -->
    <div v-else-if="accountsStore.accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AccountCard
        v-for="account in accountsStore.accounts"
        :key="account.id"
        :account="account"
        @edit="handleEditAccount"
        @add-transaction="handleAddTransaction"
        @set-default="handleSetDefault"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
      <p class="text-gray-600 mb-6">Get started by adding your first bank account</p>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Your First Account
      </button>
    </div>

    <!-- Total Balance Summary -->
    <div v-if="accountsStore.accounts.length > 0" class="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Account Summary</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <p class="text-sm text-gray-500">Total Balance</p>
          <p class="text-2xl font-bold" :class="getTotalBalanceColor(accountsStore.totalBalance)">
            {{ formatCurrency(accountsStore.totalBalance) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500">Number of Accounts</p>
          <p class="text-2xl font-bold text-gray-900">{{ accountsStore.accounts.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500">Default Account</p>
          <p class="text-lg font-semibold text-gray-900">
            {{ accountsStore.defaultAccount?.name || 'None' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <AddAccountModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @account-added="handleAccountAdded"
    />

    <!-- Edit Account Modal (placeholder for future implementation) -->
    <!-- <EditAccountModal
      :is-open="showEditModal"
      :account="selectedAccount"
      @close="showEditModal = false"
      @account-updated="handleAccountUpdated"
    /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import AccountCard from '../components/AccountCard.vue'
import AddAccountModal from '../components/AddAccountModal.vue'

const accountsStore = useAccountsStore()
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedAccount = ref(null)

onMounted(async () => {
  await accountsStore.fetchAccounts()
})

const handleEditAccount = (account) => {
  selectedAccount.value = account
  showEditModal.value = true
}

const handleAddTransaction = (account) => {
  // Navigate to transactions page with account pre-selected
  // This will be implemented when we update the transaction forms
  console.log('Add transaction for account:', account.name)
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
  // The account is already added to the store by the modal
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getTotalBalanceColor = (balance) => {
  if (balance >= 0) return 'text-green-600'
  return 'text-red-600'
}
</script> 