<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue')" title="Transfer Funds">
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </template>
    
    <template #title>Transfer Funds</template>
    <template #subtitle>Move money between your accounts or cash operations</template>
    
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Transfer Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <span class="text-red-500">*</span> Transfer Type
        </label>
        <select 
          v-model="formData.transferType" 
          @change="updateFormBasedOnType"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
          <option value="account_to_account">Account to Account</option>
          <option value="account_to_cash">Withdraw Cash</option>
          <option value="cash_to_account">Deposit Cash</option>
        </select>
      </div>

      <!-- From Account -->
      <div v-if="formData.transferType !== 'cash_to_account'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <span class="text-red-500">*</span> From Account
        </label>
        <select 
          v-model="formData.fromAccountId"
          @change="updateAvailableBalance"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
          <option value="">Select account</option>
          <option 
            v-for="account in availableFromAccounts" 
            :key="account.id" 
            :value="account.id"
            :disabled="account.id === formData.toAccountId">
            {{ account.name }} ({{ formatCurrency(account.balance) }})
          </option>
        </select>
        <p v-if="selectedFromAccount" class="text-sm text-gray-500 mt-1">
          Available: {{ formatCurrency(getAvailableBalance(selectedFromAccount)) }}
        </p>
      </div>

      <!-- To Account -->
      <div v-if="formData.transferType !== 'account_to_cash'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <span class="text-red-500">*</span> To Account
        </label>
        <select 
          v-model="formData.toAccountId"
          @change="updateAvailableBalance"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
          <option value="">Select account</option>
          <option 
            v-for="account in availableToAccounts" 
            :key="account.id" 
            :value="account.id"
            :disabled="account.id === formData.fromAccountId">
            {{ account.name }} ({{ formatCurrency(account.balance) }})
          </option>
        </select>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <span class="text-red-500">*</span> Amount
        </label>
        <div class="relative">
          <CurrencyInput
            v-model="formData.amount"
            :options="currencyOptions"
            inputmode="decimal"
            required
            placeholder="EGP 0"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Maximum: {{ formatCurrency(maxTransferAmount) }}
        </p>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <span class="text-red-500">*</span> Date
        </label>
        <input 
          v-model="formData.date" 
          type="date" 
          required 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input 
          v-model="formData.description" 
          type="text" 
          placeholder="e.g., Transfer to savings, ATM withdrawal"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea 
          v-model="formData.notes" 
          rows="3"
          placeholder="Additional notes about this transfer..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"></textarea>
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
    </form>
    
    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end space-x-3 w-full">
        <button 
          type="button" 
          @click="closeModal" 
          :disabled="isLoading" 
          class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Cancel
        </button>
        <button 
          type="submit" 
          @click="handleSubmit"
          :disabled="isLoading || !isFormValid" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isLoading">Processing...</span>
          <span v-else>Complete Transfer</span>
        </button>
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