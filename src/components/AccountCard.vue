<script setup>
import { computed } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionStore } from '../stores/transactions'

const props = defineProps({
  account: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'set-default', 'delete', 'transfer', 'history'])

const accountsStore = useAccountsStore()
const transactionStore = useTransactionStore()

const getAccountIcon = (type) => accountsStore.getAccountIcon(type)
const getAvailableCredit = (accountId) => accountsStore.getAvailableCredit(accountId)

// Get recent transactions for this account
const recentTransactions = computed(() =>
  transactionStore.getRecentTransactionsByAccount(props.account.id, 3)
)

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getBalanceColor = (balance) => {
  if (balance >= 0) return 'text-green-600'
  return 'text-red-600'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="text-2xl">
          {{ getAccountIcon(account.type) }}
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ account.name }}
          </h3>
          <p class="text-sm text-gray-500 capitalize">
            {{ account.type.replace('_', ' ') }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span
          v-if="account.is_default"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Default
        </span>
        <div class="flex items-center space-x-1">
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit account"
            @click="$emit('edit', account)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            v-if="!account.is_default"
            class="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete account"
            @click="$emit('delete', account)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Balance Display -->
      <div class="text-center">
        <div
          v-if="account.type === 'credit_card'"
          class="space-y-1"
        >
          <p class="text-sm text-gray-500">
            Available Credit
          </p>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(getAvailableCredit(account.id)) }}
          </p>
          <p class="text-xs text-gray-400">
            Limit: {{ formatCurrency(account.credit_limit) }}
          </p>
        </div>
        <div v-else>
          <p class="text-sm text-gray-500">
            Balance
          </p>
          <p
            class="text-2xl font-bold"
            :class="getBalanceColor(account.balance)"
          >
            {{ formatCurrency(account.balance) }}
          </p>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div
        v-if="recentTransactions.length > 0"
        class="pt-3 border-t border-gray-100"
      >
        <h4 class="text-sm font-medium text-gray-700 mb-2">
          Recent Transactions
        </h4>
        <div class="space-y-2">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex-1 min-w-0">
              <p class="text-gray-900 truncate">
                {{ transaction.description }}
              </p>
              <p class="text-gray-500 text-xs">
                {{ formatDate(transaction.date) }}
              </p>
            </div>
            <span
              class="font-medium ml-2"
              :class="transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(transaction.amount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex space-x-2 pt-3">
        <button
          class="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          @click="$emit('transfer', account)"
        >
          Transfer
        </button>
        <button
          class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="$emit('history', account)"
        >
          History
        </button>
        <button
          v-if="!account.is_default"
          class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          @click="$emit('set-default', account)"
        >
          Set Default
        </button>
      </div>
    </div>
  </div>
</template>