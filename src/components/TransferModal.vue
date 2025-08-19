<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue')" title="Transfer Funds"> 
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Transfer Type -->
      <div>
        <label class="block text-sm font-medium mb-2">
          <span class="text-red-500">*</span> Transfer Type
        </label>
        <Select
          v-model="formData.transferType" 
          :options="transferTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select transfer type"
          @change="updateFormBasedOnType"
          class="w-full" />
      </div>

      <!-- From Account -->
      <div v-if="formData.transferType !== 'cash_to_account'">
        <label class="block text-sm font-medium mb-2">
          <span class="text-red-500">*</span> From Account
        </label>
        <Select
          v-model="formData.fromAccountId"
          :options="fromAccountOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select account"
          @change="updateAvailableBalance"
          class="w-full" />
        <p v-if="selectedFromAccount" class="text-sm text-surface-500 mt-1">
          Available: {{ formatCurrency(getAvailableBalance(selectedFromAccount)) }}
        </p>
      </div>

      <!-- To Account -->
      <div v-if="formData.transferType !== 'account_to_cash'">
        <label class="block text-sm font-medium mb-2">
          <span class="text-red-500">*</span> To Account
        </label>
        <Select
          v-model="formData.toAccountId"
          :options="toAccountOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select account"
          @change="updateAvailableBalance"
          class="w-full" />
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium mb-2">
          <span class="text-red-500">*</span> Amount
        </label>
        <div class="relative">
          <CurrencyInput
            v-model="formData.amount"
            :options="currencyOptions"
            inputmode="decimal"
            required
            placeholder="EGP 0"
            class="w-full"
          />
        </div>
        <p class="text-xs text-surface-500 mt-1">
          Maximum: {{ formatCurrency(maxTransferAmount) }}
        </p>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium mb-2">
          <span class="text-red-500">*</span> Date
        </label>
        <DatePicker
          v-model="formData.date" 
          required 
          dateFormat="yy-mm-dd"
          class="w-full" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium mb-2">Description</label>
        <InputText
          v-model="formData.description" 
          placeholder="e.g., Transfer to savings, ATM withdrawal"
          class="w-full" />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          v-model="formData.notes" 
          rows="3"
          placeholder="Additional notes about this transfer..."
          class="w-full" />
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
    </form>
    
    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button
          type="button" 
          @click="closeModal" 
          :disabled="isLoading" 
          label="Cancel"
          outlined
          severity="secondary" />
        <Button
          type="submit" 
          @click="handleSubmit"
          :disabled="isLoading || !isFormValid" 
          :loading="isLoading"
          icon="pi pi-check"
          :label="isLoading ? 'Processing...' : 'Complete Transfer'"
          severity="primary" />
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions.js'
import { useAccountsStore } from '@/stores/accounts.js'
import { formatCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fromAccount: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'transfer-completed'])

// Stores
const transactionStore = useTransactionStore()
const accountsStore = useAccountsStore()

// Reactive data
const isLoading = ref(false)
const error = ref('')

// Form data
const formData = ref({
  transferType: 'account_to_account',
  fromAccountId: '',
  toAccountId: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
  notes: ''
})

// Computed properties
const availableFromAccounts = computed(() => {
  return accountsStore.accounts.filter(account => 
    account.type !== 'credit_card' || account.balance < 0
  )
})

const availableToAccounts = computed(() => {
  return accountsStore.accounts
})

const selectedFromAccount = computed(() => {
  return accountsStore.getAccountById(formData.value.fromAccountId)
})

const selectedToAccount = computed(() => {
  return accountsStore.getAccountById(formData.value.toAccountId)
})

const maxTransferAmount = computed(() => {
  if (!selectedFromAccount.value) return 0
  
  if (selectedFromAccount.value.type === 'credit_card') {
    return accountsStore.getAvailableCredit(selectedFromAccount.value.id) || 0
  }
  
  return selectedFromAccount.value.balance
})

const isFormValid = computed(() => {
  if (!formData.value.amount || formData.value.amount <= 0) return false
  
  if (formData.value.transferType === 'account_to_account') {
    return formData.value.fromAccountId && formData.value.toAccountId && 
           formData.value.fromAccountId !== formData.value.toAccountId
  }
  
  if (formData.value.transferType === 'account_to_cash') {
    return formData.value.fromAccountId
  }
  
  if (formData.value.transferType === 'cash_to_account') {
    return formData.value.toAccountId
  }
  
  return false
})

// Computed options for form fields
const transferTypeOptions = [
  { label: 'Account to Account', value: 'account_to_account' },
  { label: 'Withdraw Cash', value: 'account_to_cash' },
  { label: 'Deposit Cash', value: 'cash_to_account' }
]

const fromAccountOptions = computed(() => [
  { label: 'Select account', value: '' },
  ...availableFromAccounts.value.map(account => ({
    label: `${account.name} (${formatCurrency(account.balance)})`,
    value: account.id,
    disabled: account.id === formData.value.toAccountId
  }))
])

const toAccountOptions = computed(() => [
  { label: 'Select account', value: '' },
  ...availableToAccounts.value.map(account => ({
    label: `${account.name} (${formatCurrency(account.balance)})`,
    value: account.id,
    disabled: account.id === formData.value.fromAccountId
  }))
])

// Methods
const updateFormBasedOnType = () => {
  // Reset account selections when type changes
  formData.value.fromAccountId = ''
  formData.value.toAccountId = ''
  
  // Pre-fill description based on type
  switch (formData.value.transferType) {
    case 'account_to_account':
      formData.value.description = 'Transfer between accounts'
      break
    case 'account_to_cash':
      formData.value.description = 'Cash withdrawal'
      break
    case 'cash_to_account':
      formData.value.description = 'Cash deposit'
      break
  }
}

const updateAvailableBalance = () => {
  // This will trigger reactive updates
}

const getAvailableBalance = (account) => {
  if (!account) return 0
  
  if (account.type === 'credit_card') {
    return accountsStore.getAvailableCredit(account.id) || 0
  }
  
  return account.balance
}

const handleAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9.]/g, '')
  const numValue = parseFloat(value) || 0
  
  if (numValue > maxTransferAmount.value) {
    formData.value.amount = maxTransferAmount.value
  } else {
    formData.value.amount = numValue
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    transferType: 'account_to_account',
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  }
  error.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all required fields correctly'
    return
  }
  
  if (formData.value.amount > maxTransferAmount.value) {
    error.value = `Amount exceeds available balance (${formatCurrency(maxTransferAmount.value)})`
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Create transfer transactions based on type
    const transactions = []
    
    switch (formData.value.transferType) {
      case 'account_to_account':
        // Create two transactions: one negative, one positive
        transactions.push({
          account_id: formData.value.fromAccountId,
          type: 'expense',
          category: 'Transfer',
          amount: -formData.value.amount,
          date: formData.value.date,
          description: `Transfer to ${selectedToAccount.value?.name}`,
          notes: formData.value.notes
        })
        
        transactions.push({
          account_id: formData.value.toAccountId,
          type: 'income',
          category: 'Transfer',
          amount: formData.value.amount,
          date: formData.value.date,
          description: `Transfer from ${selectedFromAccount.value?.name}`,
          notes: formData.value.notes
        })
        break
        
      case 'account_to_cash':
        // Create one negative transaction
        transactions.push({
          account_id: formData.value.fromAccountId,
          type: 'expense',
          category: 'Cash Withdrawal',
          amount: -formData.value.amount,
          date: formData.value.date,
          description: formData.value.description || 'Cash withdrawal',
          notes: formData.value.notes
        })
        break
        
      case 'cash_to_account':
        // Create one positive transaction
        transactions.push({
          account_id: formData.value.toAccountId,
          type: 'income',
          category: 'Cash Deposit',
          amount: formData.value.amount,
          date: formData.value.date,
          description: formData.value.description || 'Cash deposit',
          notes: formData.value.notes
        })
        break
    }
    
    // Add all transactions
    for (const transaction of transactions) {
      await transactionStore.addTransaction(transaction)
    }
    
    emit('transfer-completed', transactions)
    closeModal()
    
  } catch (err) {
    error.value = err.message || 'Failed to complete transfer'
  } finally {
    isLoading.value = false
  }
}

// Initialize accounts when component mounts
onMounted(async () => {
  await accountsStore.fetchAccounts()
})

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetForm()
    
    // Pre-fill from account if provided
    if (props.fromAccount) {
      formData.value.fromAccountId = props.fromAccount.id
      formData.value.transferType = 'account_to_account'
    }
  }
})
</script> 