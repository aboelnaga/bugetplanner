<template>
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="text-2xl">{{ getAccountIcon(account.type) }}</div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ account.name }}</h3>
          <p class="text-sm text-gray-500 capitalize">{{ account.type.replace('_', ' ') }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span v-if="account.is_default" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Default
        </span>
        <button
          @click="$emit('edit', account)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit account"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Balance Display -->
      <div class="text-center">
        <div v-if="account.type === 'credit_card'" class="space-y-1">
          <p class="text-sm text-gray-500">Available Credit</p>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(getAvailableCredit(account.id)) }}
          </p>
          <p class="text-xs text-gray-400">
            Limit: {{ formatCurrency(account.credit_limit) }}
          </p>
        </div>
        <div v-else>
          <p class="text-sm text-gray-500">Balance</p>
          <p class="text-2xl font-bold" :class="getBalanceColor(account.balance)">
            {{ formatCurrency(account.balance) }}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex space-x-2 pt-2">
        <button
          @click="$emit('add-transaction', account)"
          class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Transaction
        </button>
        <button
          v-if="!account.is_default"
          @click="$emit('set-default', account)"
          class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Set Default
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAccountsStore } from '../stores/accounts'

const props = defineProps({
  account: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'add-transaction', 'set-default'])

const accountsStore = useAccountsStore()

const getAccountIcon = (type) => accountsStore.getAccountIcon(type)
const getAvailableCredit = (accountId) => accountsStore.getAvailableCredit(accountId)

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
</script> 