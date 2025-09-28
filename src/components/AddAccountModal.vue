<script setup>
import { ref, reactive, watch } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useAccountsStore } from '../stores/accounts'
import BaseModal from './BaseModal.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Button from 'primevue/button'

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

// Computed options for form fields
const accountTypeOptions = [
    { label: 'Select account type', value: '' },
    { label: 'Checking', value: 'checking' },
    { label: 'Savings', value: 'savings' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Cash', value: 'cash' }
  ]

  // Reset form when modal opens
  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        resetForm()
      }
    }
  )

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

<template>
  <BaseModal
    :model-value="isOpen"
    title="Add New Account"
    @update:model-value="$emit('close')"
  >
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Account Name -->
      <div>
        <label
          for="name"
          class="block text-sm font-medium mb-2"
        >
          Account Name
        </label>
        <InputText
          id="name"
          v-model="form.name"
          required
          placeholder="e.g., Chase Checking, Wells Fargo Savings"
          class="w-full"
        />
      </div>

      <!-- Account Type -->
      <div>
        <label
          for="type"
          class="block text-sm font-medium mb-2"
        >
          Account Type
        </label>
        <Select
          id="type"
          v-model="form.type"
          :options="accountTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="Select account type"
          required
          class="w-full"
        />
      </div>

      <!-- Starting Balance -->
      <div>
        <label
          for="balance"
          class="block text-sm font-medium mb-2"
        >
          Starting Balance
        </label>
        <CurrencyInput
          id="balance"
          v-model="form.balance"
          :options="currencyOptions"
          inputmode="decimal"
          required
          placeholder="0.00"
          class="w-full"
        />
      </div>

      <!-- Credit Limit (for credit cards) -->
      <div v-if="form.type === 'credit_card'">
        <label
          for="credit_limit"
          class="block text-sm font-medium mb-2"
        >
          Credit Limit
        </label>
        <CurrencyInput
          id="credit_limit"
          v-model="form.credit_limit"
          :options="currencyOptions"
          inputmode="decimal"
          required
          placeholder="0.00"
          class="w-full"
        />
      </div>

      <!-- Set as Default -->
      <div class="flex items-center">
        <Checkbox
          id="is_default"
          v-model="form.is_default"
          :binary="true"
        />
        <label
          for="is_default"
          class="ml-2 block text-sm"
        >
          Set as default account
        </label>
      </div>

      <!-- Error Message -->
      <Message
        v-if="error"
        severity="error"
        :closable="false"
      >
        <template #messageicon>
          <i class="pi pi-exclamation-triangle" />
        </template>
        <template #message>
          {{ error }}
        </template>
      </Message>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          label="Cancel"
          outlined
          severity="secondary"
          @click="$emit('close')"
        />
        <Button
          type="submit"
          :disabled="loading"
          :loading="loading"
          icon="pi pi-check"
          :label="loading ? 'Adding...' : 'Add Account'"
          severity="primary"
        />
      </div>
    </form>
  </BaseModal>
</template>
