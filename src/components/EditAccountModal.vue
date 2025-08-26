<script setup>
import { ref, watch, computed } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useAccountsStore } from '@/stores/accounts'
import BaseModal from './BaseModal.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Button from 'primevue/button'

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

// Computed options for form fields
const accountTypeOptions = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Cash', value: 'cash' }
]

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

<template>
  <BaseModal :modelValue="isOpen" @update:modelValue="$emit('close')" title="Edit Account">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Account Name -->
      <div>
        <label for="name" class="block text-sm font-medium mb-2">
          Account Name
        </label>
        <InputText
          id="name"
          v-model="formData.name"
          required
          placeholder="Enter account name"
          class="w-full" />
      </div>

      <!-- Account Type -->
      <div>
        <label for="type" class="block text-sm font-medium mb-2">
          Account Type
        </label>
        <Select
          id="type"
          v-model="formData.type"
          :options="accountTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select account type"
          required
          class="w-full" />
      </div>

      <!-- Credit Limit (only for credit cards) -->
      <div v-if="formData.type === 'credit_card'">
        <label for="credit_limit" class="block text-sm font-medium mb-2">
          Credit Limit
        </label>
        <CurrencyInput
          id="credit_limit"
          v-model="formData.credit_limit"
          :options="currencyOptions"
          inputmode="decimal"
          required
          placeholder="Enter credit limit"
          class="w-full" />
      </div>

      <!-- Current Balance (read-only for reference) -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Current Balance
        </label>
        <div class="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-md text-surface-700">
          {{ formatCurrency(account.balance) }}
        </div>
        <p class="text-sm text-surface-500 mt-1">
          Balance is calculated from transactions and cannot be edited directly
        </p>
      </div>

      <!-- Is Default Account -->
      <div class="flex items-center">
        <Checkbox
          id="is_default"
          v-model="formData.is_default"
          :binary="true" />
        <label for="is_default" class="ml-2 block text-sm">
          Set as default account
        </label>
      </div>

      <!-- Error Message -->
      <Message v-if="error" severity="error" :closable="false">
        <template #messageicon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        <template #message>
          {{ error }}
        </template>
      </Message>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          @click="$emit('close')"
          label="Cancel"
          outlined
          severity="secondary" />
        <Button
          type="submit"
          :disabled="loading"
          :loading="loading"
          icon="pi pi-check"
          :label="loading ? 'Updating...' : 'Update Account'"
          severity="primary" />
      </div>
    </form>
  </BaseModal>
</template> 