<template>
  <BaseModal :modelValue="isOpen" @update:modelValue="$emit('close')" title="Edit Account">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Account Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Account Name
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter account name"
        />
      </div>

      <!-- Account Type -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <select
          id="type"
          v-model="formData.type"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit_card">Credit Card</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <!-- Credit Limit (only for credit cards) -->
      <div v-if="formData.type === 'credit_card'">
        <label for="credit_limit" class="block text-sm font-medium text-gray-700 mb-2">
          Credit Limit
        </label>
        <CurrencyInput
          id="credit_limit"
          v-model="formData.credit_limit"
          :options="currencyOptions"
          inputmode="decimal"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter credit limit"
        />
      </div>

      <!-- Current Balance (read-only for reference) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Current Balance
        </label>
        <div class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
          {{ formatCurrency(account.balance) }}
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Balance is calculated from transactions and cannot be edited directly
        </p>
      </div>

      <!-- Is Default Account -->
      <div class="flex items-center">
        <input
          id="is_default"
          v-model="formData.is_default"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="is_default" class="ml-2 block text-sm text-gray-700">
          Set as default account
        </label>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
          <span v-else>Update Account</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useAccountsStore } from '@/stores/accounts'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  account: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'account-updated'])

const accountsStore = useAccountsStore()
const loading = ref(false)
const error = ref('')

// Form data
const formData = ref({
  name: '',
  type: 'checking',
  credit_limit: 0,
  is_default: false
})

// Initialize form data when account changes
watch(() => props.account, (newAccount) => {
  if (newAccount) {
    formData.value = {
      name: newAccount.name || '',
      type: newAccount.type || 'checking',
      credit_limit: newAccount.credit_limit || 0,
      is_default: newAccount.is_default || false
    }
  }
}, { immediate: true })

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.account) {
    formData.value = {
      name: props.account.name || '',
      type: props.account.type || 'checking',
      credit_limit: props.account.credit_limit || 0,
      is_default: props.account.is_default || false
    }
    error.value = ''
  }
})

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    error.value = 'Account name is required'
    return
  }

  if (formData.value.type === 'credit_card' && (!formData.value.credit_limit || formData.value.credit_limit <= 0)) {
    error.value = 'Credit limit must be greater than 0 for credit cards'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('Updating account:', props.account.id, 'with data:', {
      name: formData.value.name.trim(),
      type: formData.value.type,
      credit_limit: formData.value.type === 'credit_card' ? formData.value.credit_limit : null,
      is_default: formData.value.is_default
    })

    const updatedAccount = await accountsStore.updateAccount(props.account.id, {
      name: formData.value.name.trim(),
      type: formData.value.type,
      credit_limit: formData.value.type === 'credit_card' ? formData.value.credit_limit : null,
      is_default: formData.value.is_default
    })

    console.log('Account updated successfully:', updatedAccount)
    emit('account-updated', updatedAccount)
    emit('close')
  } catch (err) {
    console.error('Error updating account:', err)
    error.value = err.message || 'Failed to update account'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script> 