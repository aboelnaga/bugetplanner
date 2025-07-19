<template>
  <BaseModal 
    :modelValue="modelValue" 
    :loading="isLoading"
    @update:modelValue="$emit('update:modelValue', $event)">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
    </template>
    
    <template #title>{{ isEditMode ? 'Edit Transaction' : 'Add Transaction' }}</template>
    <template #subtitle>
      {{ isEditMode 
        ? 'Update transaction details' 
        : props.budgetItem && !props.budgetItem.account_id 
          ? `Add transaction for "${props.budgetItem.name}"` 
          : `Record a new transaction for ${selectedYear}` 
      }}
    </template>
    
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Transaction Details
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Description
            </label>
            <input 
              v-model="formData.description" 
              type="text" 
              required 
              placeholder="e.g., Grocery shopping, Salary payment"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          
          <!-- Transaction Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Transaction Type
            </label>
            <select 
              v-model="formData.type" 
              @change="updateCategoryOnTypeChange"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, type) in TRANSACTION_TYPE_LABELS" :key="type" :value="type">
                {{ TRANSACTION_TYPE_ICONS[type] }} {{ label }}
              </option>
            </select>
          </div>
          
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Category
            </label>
            <select 
              v-model="formData.category"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="category in getCategoriesByType(formData.type)" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Financial Details Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          Financial Details
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Amount
            </label>
            <div class="relative">
              <input 
                :value="formatCurrency(formData.amount)"
                @input="handleAmountInput"
                type="text" 
                required 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Maximum: {{ DATABASE_LIMITS.MAX_AMOUNT_FORMATTED }}
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
        </div>

        <!-- Tax Tracking (optional) -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h5 class="text-md font-medium text-gray-900 flex items-center">
            <svg class="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Tax Information (Optional)
          </h5>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Gross Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Gross Amount
              </label>
              <input 
                :value="formatCurrency(formData.gross_amount)"
                @input="handleGrossAmountInput"
                type="text" 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            
            <!-- Tax Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tax Amount
              </label>
              <input 
                :value="formatCurrency(formData.tax_amount)"
                @input="handleTaxAmountInput"
                type="text" 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            
            <!-- Net Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Net Amount
              </label>
              <input 
                :value="formatCurrency(formData.net_amount)"
                @input="handleNetAmountInput"
                type="text" 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
          </div>
          
          <p class="text-xs text-gray-500">
            💡 Tip: Fill any two fields and the third will be calculated automatically
          </p>
        </div>
      </div>

      <!-- Linking Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
          Linking & Organization
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Budget Item Link -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Link to Budget Item (Optional)
            </label>
            <select 
              v-model="formData.budget_item_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="">No budget item linked</option>
              <option v-for="budgetItem in availableBudgetItems" :key="budgetItem.id" :value="budgetItem.id">
                {{ budgetItem.name }} ({{ budgetItem.type }} - {{ budgetItem.category }})
              </option>
            </select>
          </div>
          
          <!-- Account -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Account
            </label>
            <select 
              v-model="formData.account_id"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="">Select an account</option>
              <option v-for="account in accountsStore.accounts" :key="account.id" :value="account.id">
                {{ getAccountIcon(account.type) }} {{ account.name }} - {{ formatCurrency(account.balance) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Additional Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          Additional Information
        </h4>
        
        <div class="space-y-4">
          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input 
              v-model="tagInput" 
              @keydown.enter.prevent="addTag"
              type="text" 
              placeholder="Type a tag and press Enter"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            
            <!-- Display tags -->
            <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span 
                v-for="(tag, index) in formData.tags" 
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {{ tag }}
                <button 
                  @click="removeTag(index)"
                  type="button"
                  class="ml-2 text-blue-600 hover:text-blue-800">
                  ×
                </button>
              </span>
            </div>
          </div>
          
          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea 
              v-model="formData.notes" 
              rows="3"
              placeholder="Additional notes about this transaction..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"></textarea>
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
          :disabled="isLoading" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isLoading">{{ isEditMode ? 'Updating...' : 'Adding...' }}</span>
          <span v-else>{{ isEditMode ? 'Update Transaction' : 'Add Transaction' }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useAccountsStore } from '@/stores/accounts.js'
import { useTransactionModals } from '@/composables/useTransactionModals.js'
import { 
  TRANSACTION_TYPE_LABELS, 
  TRANSACTION_TYPE_ICONS,
  DATABASE_LIMITS
} from '@/constants/budgetConstants.js'
import { formatCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  budgetItem: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'transaction-added', 'transaction-updated'])

// Stores
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const accountsStore = useAccountsStore()

// Computed
const currentYear = computed(() => transactionStore.currentYear)
const currentMonth = computed(() => transactionStore.currentMonth)
const selectedYear = computed(() => budgetStore.selectedYear)

// Available budget items for linking
const availableBudgetItems = computed(() => {
  return budgetStore.budgetItems.filter(item => item.year === selectedYear.value)
})

// Tag input
const tagInput = ref('')

// Modal composable
const {
  formData,
  isLoading,
  initializeFormData,
  resetFormData,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  handleAmountInput,
  handleTaxAmountInput,
  handleGrossAmountInput,
  handleNetAmountInput,
  handleAddSubmit,
  handleEditSubmit,
  initializeFormDataFromTransaction
} = useTransactionModals(transactionStore, selectedYear, currentYear, currentMonth)

// Tag management
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  formData.value.tags.splice(index, 1)
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Computed for edit mode - check if it's actually a transaction (has account_id)
const isEditMode = computed(() => {
  return !!props.budgetItem && props.budgetItem.id && props.budgetItem.account_id
})

// Handle form submission
const handleSubmit = async () => {
  let result
  if (isEditMode.value) {
    result = await handleEditSubmit(props.budgetItem.id)
    if (result) {
      closeModal()
      emit('transaction-updated', result)
    }
  } else {
    result = await handleAddSubmit()
    if (result) {
      closeModal()
      emit('transaction-added', result)
    }
  }
}

// Helper functions
const getAccountIcon = (type) => accountsStore.getAccountIcon(type)

// Initialize accounts when component mounts
onMounted(async () => {
  await accountsStore.fetchAccounts()
})

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (isEditMode.value) {
      // Initialize form with transaction data for editing
      initializeFormDataFromTransaction(props.budgetItem)
    } else {
      // Initialize form for new transaction
      initializeFormData()
      
      // Pre-fill form if budget item is provided (for new transactions from budget items)
      if (props.budgetItem && !props.budgetItem.account_id) {
        formData.value.budget_item_id = props.budgetItem.id
        formData.value.type = props.budgetItem.type
        formData.value.category = props.budgetItem.category
        formData.value.amount = props.budgetItem.amount
        formData.value.description = props.budgetItem.name
        formData.value.date = new Date().toISOString().split('T')[0] // Today's date
      }
      
      // Set default account if available
      if (accountsStore.defaultAccount && !formData.value.account_id) {
        formData.value.account_id = accountsStore.defaultAccount.id
      }
    }
  }
})
</script> 