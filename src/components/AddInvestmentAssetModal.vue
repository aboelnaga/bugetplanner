<template>
  <BaseModal :model-value="true" @update:model-value="$emit('close')">
    <template #title>
      {{ asset ? 'Edit Investment Asset' : 'Add Investment Asset' }}
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Asset Name *
              <span v-if="errors.name" class="text-red-500 ml-1">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              :class="[
                'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                errors.name 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              ]"
              placeholder="e.g., Downtown Apartment, Gold Portfolio"
              @blur="validateField('name')"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">
              Asset Type *
              <span v-if="errors.type" class="text-red-500 ml-1">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              :class="[
                'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                errors.type 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              ]"
              @change="validateField('type')"
            >
              <option value="">Select type</option>
              <option value="real_estate">Real Estate</option>
              <option value="precious_metals">Precious Metals</option>
              <option value="stocks">Stocks</option>
              <option value="other">Other</option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
          </div>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
          <select
            id="status"
            v-model="form.status"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Optional description of the investment"
          />
        </div>

        <!-- Purchase Details -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Purchase Details</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="purchase_amount" class="block text-sm font-medium text-gray-700">Purchase Amount</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                 <CurrencyInput
                   id="purchase_amount"
                   v-model="form.purchase_amount"
                   :options="currencyOptions"
                   inputmode="decimal"
                   class="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="0.00"
                 />
              </div>
            </div>

            <div>
              <label for="down_payment" class="block text-sm font-medium text-gray-700">Down Payment</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                 <CurrencyInput
                   id="down_payment"
                   v-model="form.down_payment"
                   :options="currencyOptions"
                   inputmode="decimal"
                   class="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="0.00"
                 />
              </div>
            </div>

            <div>
              <label for="monthly_payment" class="block text-sm font-medium text-gray-700">Monthly Payment</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                 <CurrencyInput
                   id="monthly_payment"
                   v-model="form.monthly_payment"
                   :options="currencyOptions"
                   inputmode="decimal"
                   class="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="0.00"
                 />
              </div>
            </div>
          </div>

          <div class="mt-6">
            <label for="purchase_date" class="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              id="purchase_date"
              v-model="form.purchase_date"
              type="date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Current Status -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Current Status</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="current_value" class="block text-sm font-medium text-gray-700">Current Value</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                 <CurrencyInput
                   id="current_value"
                   v-model="form.current_value"
                   :options="currencyOptions"
                   inputmode="decimal"
                   class="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   placeholder="0.00"
                 />
              </div>
            </div>

            <div>
              <label for="last_valuation_date" class="block text-sm font-medium text-gray-700">Last Valuation Date</label>
              <input
                id="last_valuation_date"
                v-model="form.last_valuation_date"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Location (for real estate) -->
        <div v-if="form.type === 'real_estate'" class="border-t border-gray-200 pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Property Details</h4>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700">Property Address</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 123 Main St, City, State"
            />
          </div>
        </div>

        <!-- Additional Details -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Additional Details</h4>
          
          <div>
            <label for="details" class="block text-sm font-medium text-gray-700">Additional Information</label>
            <textarea
              id="details"
              v-model="detailsText"
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Any additional details about the investment"
            />
            <p class="mt-1 text-sm text-gray-500">This will be stored as JSON for flexible data storage.</p>
          </div>
        </div>

        <!-- Budget Item Integration -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-4">Budget Integration</h4>
          
          <div v-if="!form.budget_item_id && !createBudgetItem">
            <p class="text-sm text-gray-600 mb-4">
              Link this investment to a budget item to track payments and income.
            </p>
            
            <div class="space-y-4">
              <!-- Link to Existing Budget Item -->
              <div v-if="availableBudgetItems.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-2">Link to Existing Budget Item</label>
                <select
                  v-model="selectedBudgetItemId"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select budget item</option>
                  <option
                    v-for="item in availableBudgetItems"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }} ({{ item.category }})
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500">Available investment-type budget items</p>
              </div>

              <!-- Divider -->
              <div v-if="availableBudgetItems.length > 0" class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <!-- Create New Budget Item Button -->
              <button
                type="button"
                @click="createBudgetItem = true"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Budget Item
              </button>

              <!-- Skip Option -->
              <div class="text-center">
                <button
                  type="button"
                  @click="skipBudgetItem = true"
                  class="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>

          <!-- Linked Budget Item Display -->
          <div v-else-if="form.budget_item_id && !createBudgetItem" class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-800">Linked to Budget Item</p>
                <p class="text-sm text-blue-600">{{ linkedBudgetItem?.name }}</p>
                <p class="text-xs text-blue-500">{{ linkedBudgetItem?.category }}</p>
              </div>
              <button
                type="button"
                @click="unlinkBudgetItem"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Unlink
              </button>
            </div>
          </div>

          <!-- Skip Confirmation -->
          <div v-else-if="skipBudgetItem" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-yellow-800">No Budget Item Linked</p>
                <p class="text-sm text-yellow-600">You can link a budget item later from the investment details.</p>
              </div>
              <button
                type="button"
                @click="skipBudgetItem = false"
                class="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <!-- Create Budget Item Form -->
        <div v-if="createBudgetItem" class="border-t border-gray-200 pt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-md font-medium text-gray-900">Create Budget Item</h4>
            <button
              type="button"
              @click="createBudgetItem = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="budget_name" class="block text-sm font-medium text-gray-700">
                Budget Item Name *
                <span v-if="budgetItemErrors.name" class="text-red-500 ml-1">*</span>
              </label>
              <input
                id="budget_name"
                v-model="budgetItemForm.name"
                type="text"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                  budgetItemErrors.name 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                ]"
                placeholder="e.g., Apartment Payment"
                @blur="validateBudgetItemField('name')"
              />
              <p v-if="budgetItemErrors.name" class="mt-1 text-sm text-red-600">{{ budgetItemErrors.name }}</p>
            </div>

            <div>
              <label for="budget_category" class="block text-sm font-medium text-gray-700">
                Category *
                <span v-if="budgetItemErrors.category" class="text-red-500 ml-1">*</span>
              </label>
              <select
                id="budget_category"
                v-model="budgetItemForm.category"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                  budgetItemErrors.category 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                ]"
                @change="validateBudgetItemField('category')"
              >
                <option value="">Select category</option>
                <option value="Housing">Housing</option>
                <option value="Transportation">Transportation</option>
                <option value="Food">Food</option>
                <option value="Utilities">Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
              <p v-if="budgetItemErrors.category" class="mt-1 text-sm text-red-600">{{ budgetItemErrors.category }}</p>
            </div>
          </div>

          <!-- Budget Item Preview -->
          <div v-if="budgetItemForm.name && budgetItemForm.category" class="mt-4 p-3 bg-gray-50 rounded-md">
            <p class="text-sm text-gray-600">This will create a budget item:</p>
            <p class="text-sm font-medium text-gray-900">{{ budgetItemForm.name }}</p>
            <p class="text-xs text-gray-500">{{ budgetItemForm.category }} • Investment • Outgoing</p>
          </div>
        </div>
      </form>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          <span v-if="Object.keys(errors).length > 0 || Object.keys(budgetItemErrors).length > 0" class="text-red-500">
            Please fix the errors above
          </span>
          <span v-else>
            All fields are valid
          </span>
        </div>
        <div class="flex space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            @click="handleSubmit"
            :disabled="loading || Object.keys(errors).length > 0 || Object.keys(budgetItemErrors).length > 0"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ asset ? 'Update' : 'Create' }} Investment
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useAuthStore } from '@/stores/auth.js'
import BaseModal from './BaseModal.vue'

// Props
const props = defineProps({
  asset: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Stores
const investmentAssetsStore = useInvestmentAssetsStore()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref('')
const createBudgetItem = ref(false)
const skipBudgetItem = ref(false)
const selectedBudgetItemId = ref('')
const errors = ref({})
const budgetItemErrors = ref({})

// Form data
const form = ref({
  name: '',
  type: '',
  status: 'active',
  description: '',
  purchase_amount: null,
  down_payment: null,
  monthly_payment: null,
  purchase_date: '',
  current_value: null,
  last_valuation_date: '',
  location: '',
  details: {}
})

// Budget item form
const budgetItemForm = ref({
  name: '',
  category: 'Investment',
  type: 'investment',
  investment_direction: 'outgoing',
  amounts: new Array(12).fill(0)
})

// Computed
const availableBudgetItems = computed(() => {
  if (!budgetStore.budgetItems) return []
  return budgetStore.budgetItems.filter(item => 
    item.type === 'investment' && !item.investment_asset_id
  )
})

const linkedBudgetItem = computed(() => {
  if (!form.value.budget_item_id) return null
  return budgetStore.budgetItems?.find(item => item.id === form.value.budget_item_id)
})

const detailsText = computed({
  get() {
    return form.value.details ? JSON.stringify(form.value.details, null, 2) : ''
  },
  set(value) {
    try {
      form.value.details = value ? JSON.parse(value) : {}
    } catch (e) {
      // Keep as string if invalid JSON
      form.value.details = { raw: value }
    }
  }
})

// Validation methods
const validateField = (fieldName) => {
  errors.value[fieldName] = ''
  
  switch (fieldName) {
    case 'name':
      if (!form.value.name || form.value.name.trim() === '') {
        errors.value.name = 'Asset name is required'
      } else if (form.value.name.length < 2) {
        errors.value.name = 'Asset name must be at least 2 characters'
      }
      break
    case 'type':
      if (!form.value.type) {
        errors.value.type = 'Asset type is required'
      }
      break
    case 'purchase_amount':
      if (form.value.purchase_amount && form.value.purchase_amount < 0) {
        errors.value.purchase_amount = 'Purchase amount cannot be negative'
      }
      break
    case 'current_value':
      if (form.value.current_value && form.value.current_value < 0) {
        errors.value.current_value = 'Current value cannot be negative'
      }
      break
  }
}

const validateBudgetItemField = (fieldName) => {
  budgetItemErrors.value[fieldName] = ''
  
  switch (fieldName) {
    case 'name':
      if (!budgetItemForm.value.name || budgetItemForm.value.name.trim() === '') {
        budgetItemErrors.value.name = 'Budget item name is required'
      } else if (budgetItemForm.value.name.length < 2) {
        budgetItemErrors.value.name = 'Budget item name must be at least 2 characters'
      }
      break
    case 'category':
      if (!budgetItemForm.value.category) {
        budgetItemErrors.value.category = 'Category is required'
      }
      break
  }
}

const validateForm = () => {
  // Clear all errors
  errors.value = {}
  budgetItemErrors.value = {}
  
  // Validate main form
  validateField('name')
  validateField('type')
  validateField('purchase_amount')
  validateField('current_value')
  
  // Validate budget item form if creating one
  if (createBudgetItem.value) {
    validateBudgetItemField('name')
    validateBudgetItemField('category')
  }
  
  // Check if there are any errors
  const hasMainErrors = Object.keys(errors.value).some(key => errors.value[key])
  const hasBudgetItemErrors = Object.keys(budgetItemErrors.value).some(key => budgetItemErrors.value[key])
  
  return !hasMainErrors && !hasBudgetItemErrors
}

// Methods
const initializeForm = () => {
  if (props.asset) {
    // Edit mode
    form.value = {
      name: props.asset.name || '',
      type: props.asset.type || '',
      status: props.asset.status || 'active',
      description: props.asset.description || '',
      purchase_amount: props.asset.purchase_amount || null,
      down_payment: props.asset.down_payment || null,
      monthly_payment: props.asset.monthly_payment || null,
      purchase_date: props.asset.purchase_date || '',
      current_value: props.asset.current_value || null,
      last_valuation_date: props.asset.last_valuation_date || '',
      location: props.asset.location || '',
      details: props.asset.details || {},
      budget_item_id: props.asset.budget_item_id || null
    }
    
    // Set budget item form if creating new budget item
    if (props.asset.budget_items) {
      budgetItemForm.value.name = props.asset.budget_items.name
      budgetItemForm.value.category = props.asset.budget_items.category
    }
  } else {
    // Create mode
    form.value = {
      name: '',
      type: '',
      status: 'active',
      description: '',
      purchase_amount: null,
      down_payment: null,
      monthly_payment: null,
      purchase_date: '',
      current_value: null,
      last_valuation_date: '',
      location: '',
      details: {},
      budget_item_id: null
    }
  }
}

const handleSubmit = async () => {
  // Clear previous errors
  error.value = ''
  
  // Validate form
  if (!validateForm()) {
    error.value = 'Please fix the errors above before submitting.'
    return
  }
  
  loading.value = true
  
  try {
    let budgetItemId = form.value.budget_item_id

    // Create budget item if needed
    if (createBudgetItem.value && budgetItemForm.value.name) {
      const budgetItem = {
        ...budgetItemForm.value,
        user_id: authStore.user.id,
        year: new Date().getFullYear()
      }
      
      const createdBudgetItem = await budgetStore.createBudgetItem(budgetItem)
      budgetItemId = createdBudgetItem.id
    } else if (selectedBudgetItemId.value) {
      budgetItemId = selectedBudgetItemId.value
    }

    // Prepare asset data
    const assetData = {
      ...form.value,
      budget_item_id: budgetItemId
    }

    // Create or update asset
    let result
    if (props.asset) {
      result = await investmentAssetsStore.updateInvestmentAsset(props.asset.id, assetData)
    } else {
      result = await investmentAssetsStore.createInvestmentAsset(assetData)
    }

    if (result) {
      emit('saved', result)
    }
  } catch (err) {
    console.error('Error saving investment asset:', err)
    error.value = err.message || 'Failed to save investment asset. Please try again.'
  } finally {
    loading.value = false
  }
}

const unlinkBudgetItem = async () => {
  if (props.asset) {
    await investmentAssetsStore.unlinkFromBudgetItem(props.asset.id)
    form.value.budget_item_id = null
  }
}

// Lifecycle
onMounted(() => {
  initializeForm()
})

// Watch for budget item selection
watch(selectedBudgetItemId, (newId) => {
  if (newId) {
    form.value.budget_item_id = newId
    createBudgetItem.value = false
  }
})
</script> 