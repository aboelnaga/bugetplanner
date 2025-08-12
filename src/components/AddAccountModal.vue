<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="$emit('close')"
    title="Add New Account"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Account Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Account Name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Chase Checking, Wells Fargo Savings"
        />
      </div>

      <!-- Account Type -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <select
          id="type"
          v-model="form.type"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select account type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit_card">Credit Card</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <!-- Starting Balance -->
      <div>
        <label for="balance" class="block text-sm font-medium text-gray-700 mb-2">
          Starting Balance
        </label>
        <CurrencyInput
          id="balance"
          v-model="form.balance"
          :options="currencyOptions"
          inputmode="decimal"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <!-- Credit Limit (for credit cards) -->
      <div v-if="form.type === 'credit_card'">
        <label for="credit_limit" class="block text-sm font-medium text-gray-700 mb-2">
          Credit Limit
        </label>
        <CurrencyInput
          id="credit_limit"
          v-model="form.credit_limit"
          :options="currencyOptions"
          inputmode="decimal"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <!-- Set as Default -->
      <div class="flex items-center">
        <input
          id="is_default"
          v-model="form.is_default"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="is_default" class="ml-2 block text-sm text-gray-700">
          Set as default account
        </label>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Adding...</span>
          <span v-else>Add Account</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useAccountsStore } from '../stores/accounts'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'account-added'])

const accountsStore = useAccountsStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  type: '',
  balance: 0,
  credit_limit: null,
  is_default: false
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

const resetForm = () => {
  form.name = ''
  form.type = ''
  form.balance = 0
  form.credit_limit = null
  form.is_default = false
  error.value = ''
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Prepare account data
    const accountData = {
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      is_default: form.is_default
    }

    // Add credit limit for credit cards
    if (form.type === 'credit_card' && form.credit_limit) {
      accountData.credit_limit = parseFloat(form.credit_limit)
    }

    // Create account
    const newAccount = await accountsStore.createAccount(accountData)
    
    emit('account-added', newAccount)
    emit('close')
    resetForm()
  } catch (err) {
    error.value = err.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}
</script> 