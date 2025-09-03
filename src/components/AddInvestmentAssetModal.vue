<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useAuthStore } from '@/stores/auth.js'
import BaseModal from './BaseModal.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'

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
  details: {},
  budget_item_id: null
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

// Options for Select components
const assetTypeOptions = [
  { label: 'Select type', value: '' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Precious Metals', value: 'precious_metals' },
  { label: 'Stocks', value: 'stocks' },
  { label: 'Other', value: 'other' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Planned', value: 'planned' },
  { label: 'Sold', value: 'sold' }
]

const budgetItemOptions = computed(() => [
  { label: 'Select budget item', value: '' },
  ...availableBudgetItems.value.map(item => ({
    label: `${item.name} (${item.category})`,
    value: item.id
  }))
])

const budgetCategoryOptions = [
  { label: 'Select category', value: '' },
  { label: 'Housing', value: 'Housing' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Food', value: 'Food' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Investment', value: 'Investment' },
  { label: 'Other', value: 'Other' }
]

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

<template>
  <BaseModal :model-value="true" @update:model-value="$emit('close')" :title="asset ? 'Edit Investment Asset' : 'Add Investment Asset'">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Alert -->
      <Message v-if="error" severity="error" :closable="false">
        <template #messageicon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        <template #message>
          {{ error }}
        </template>
      </Message>

      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium">
            Asset Name *
            <span v-if="errors.name" class="text-red-500 ml-1">*</span>
          </label>
          <InputText
            id="name"
            v-model="form.name"
            required
            :class="{ 'p-invalid': errors.name }"
            placeholder="e.g., Downtown Apartment, Gold Portfolio"
            @blur="validateField('name')"
            class="w-full" />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <div>
          <label for="type" class="block text-sm font-medium">
            Asset Type *
            <span v-if="errors.type" class="text-red-500 ml-1">*</span>
          </label>
          <Select
            id="type"
            v-model="form.type"
            :options="assetTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            required
            :class="{ 'p-invalid': errors.type }"
            @change="validateField('type')"
            class="w-full" />
          <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
        </div>
      </div>

      <div>
        <label for="status" class="block text-sm font-medium">Status *</label>
        <Select
          id="status"
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
          required
          class="w-full" />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium">Description</label>
        <Textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Optional description of the investment"
          class="w-full" />
      </div>

      <!-- Purchase Details -->
      <div class="border-t border-surface-200 pt-6">
        <h4 class="text-md font-medium mb-4">Purchase Details</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label for="purchase_amount" class="block text-sm font-medium">Purchase Amount</label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
              <CurrencyInput
                id="purchase_amount"
                v-model="form.purchase_amount"
                :options="currencyOptions"
                inputmode="decimal"
                class="pl-7 w-full"
                placeholder="0.00" />
            </div>
          </div>

          <div>
            <label for="down_payment" class="block text-sm font-medium">Down Payment</label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
              <CurrencyInput
                id="down_payment"
                v-model="form.down_payment"
                :options="currencyOptions"
                inputmode="decimal"
                class="pl-7 w-full"
                placeholder="0.00" />
            </div>
          </div>

          <div>
            <label for="monthly_payment" class="block text-sm font-medium">Monthly Payment</label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
              <CurrencyInput
                id="monthly_payment"
                v-model="form.monthly_payment"
                :options="currencyOptions"
                inputmode="decimal"
                class="pl-7 w-full"
                placeholder="0.00" />
            </div>
          </div>
        </div>

        <div class="mt-6">
          <label for="purchase_date" class="block text-sm font-medium">Purchase Date</label>
          <DatePicker
            id="purchase_date"
            v-model="form.purchase_date"
            dateFormat="yy-mm-dd"
            class="w-full" />
        </div>
      </div>

      <!-- Current Status -->
      <div class="border-t border-surface-200 pt-6">
        <h4 class="text-md font-medium mb-4">Current Status</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="current_value" class="block text-sm font-medium">Current Value</label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
              <CurrencyInput
                id="current_value"
                v-model="form.current_value"
                :options="currencyOptions"
                inputmode="decimal"
                class="pl-7 w-full"
                placeholder="0.00" />
            </div>
          </div>

          <div>
            <label for="last_valuation_date" class="block text-sm font-medium">Last Valuation Date</label>
            <DatePicker
              id="last_valuation_date"
              v-model="form.last_valuation_date"
              dateFormat="yy-mm-dd"
              class="w-full" />
          </div>
        </div>
      </div>

      <!-- Location (for real estate) -->
      <div v-if="form.type === 'real_estate'" class="border-t border-surface-200 pt-6">
        <h4 class="text-md font-medium mb-4">Property Details</h4>
        
        <div>
          <label for="location" class="block text-sm font-medium">Property Address</label>
          <InputText
            id="location"
            v-model="form.location"
            placeholder="e.g., 123 Main St, City, State"
            class="w-full" />
        </div>
      </div>

      <!-- Additional Details -->
      <div class="border-t border-surface-200 pt-6">
        <h4 class="text-md font-medium mb-4">Additional Details</h4>
        
        <div>
          <label for="details" class="block text-sm font-medium">Additional Information</label>
          <Textarea
            id="details"
            v-model="detailsText"
            rows="3"
            placeholder="Any additional details about the investment"
            class="w-full" />
          <p class="mt-1 text-sm text-surface-500">This will be stored as JSON for flexible data storage.</p>
        </div>
      </div>

      <!-- Budget Item Integration -->
      <div class="border-t border-surface-200 pt-6">
        <h4 class="text-md font-medium mb-4">Budget Integration</h4>
        
        <div v-if="!form.budget_item_id && !createBudgetItem">
          <p class="text-sm text-surface-600 mb-4">
            Link this investment to a budget item to track payments and income.
          </p>
          
          <div class="space-y-4">
            <!-- Link to Existing Budget Item -->
            <div v-if="availableBudgetItems.length > 0">
              <label class="block text-sm font-medium mb-2">Link to Existing Budget Item</label>
              <Select
                v-model="selectedBudgetItemId"
                :options="budgetItemOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select budget item"
                class="w-full" />
              <p class="mt-1 text-xs text-surface-500">Available investment-type budget items</p>
            </div>

            <!-- Divider -->
            <div v-if="availableBudgetItems.length > 0" class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-surface-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-surface-500">or</span>
              </div>
            </div>

            <!-- Create New Budget Item Button -->
            <Button
              type="button"
              @click="createBudgetItem = true"
              icon="pi pi-plus"
              label="Create New Budget Item"
              outlined
              class="w-full" />

            <!-- Skip Option -->
            <div class="text-center">
              <Button
                type="button"
                @click="skipBudgetItem = true"
                label="Skip for now"
                text
                class="text-sm" />
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
            <Button
              type="button"
              @click="unlinkBudgetItem"
              label="Unlink"
              text
              severity="secondary" />
          </div>
        </div>

        <!-- Skip Confirmation -->
        <div v-else-if="skipBudgetItem" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-yellow-800">No Budget Item Linked</p>
              <p class="text-sm text-yellow-600">You can link a budget item later from the investment details.</p>
            </div>
            <Button
              type="button"
              @click="skipBudgetItem = false"
              label="Change"
              text
              severity="secondary" />
          </div>
        </div>
      </div>

      <!-- Create Budget Item Form -->
      <div v-if="createBudgetItem" class="border-t border-surface-200 pt-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-md font-medium">Create Budget Item</h4>
          <Button
            type="button"
            @click="createBudgetItem = false"
            icon="pi pi-times"
            text
            severity="secondary" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="budget_name" class="block text-sm font-medium">
              Budget Item Name *
              <span v-if="budgetItemErrors.name" class="text-red-500 ml-1">*</span>
            </label>
            <InputText
              id="budget_name"
              v-model="budgetItemForm.name"
              :class="{ 'p-invalid': budgetItemErrors.name }"
              placeholder="e.g., Apartment Payment"
              @blur="validateBudgetItemField('name')"
              class="w-full" />
            <small v-if="budgetItemErrors.name" class="p-error">{{ budgetItemErrors.name }}</small>
          </div>

          <div>
            <label for="budget_category" class="block text-sm font-medium">
              Category *
              <span v-if="budgetItemErrors.category" class="text-red-500 ml-1">*</span>
            </label>
            <Select
              id="budget_category"
              v-model="budgetItemForm.category"
              :options="budgetCategoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select category"
              :class="{ 'p-invalid': budgetItemErrors.category }"
              @change="validateBudgetItemField('category')"
              class="w-full" />
            <small v-if="budgetItemErrors.category" class="p-error">{{ budgetItemErrors.category }}</small>
          </div>
        </div>

        <!-- Budget Item Preview -->
        <div v-if="budgetItemForm.name && budgetItemForm.category" class="mt-4 p-3 bg-surface-50 rounded-md">
          <p class="text-sm text-surface-600">This will create a budget item:</p>
          <p class="text-sm font-medium">{{ budgetItemForm.name }}</p>
          <p class="text-xs text-surface-500">{{ budgetItemForm.category }} • Investment • Outgoing</p>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-sm text-surface-500">
          <span v-if="Object.keys(errors).length > 0 || Object.keys(budgetItemErrors).length > 0" class="text-red-500">
            Please fix the errors above
          </span>
          <span v-else>
            All fields are valid
          </span>
        </div>
        <div class="flex gap-3">
          <Button
            type="button"
            @click="$emit('close')"
            label="Cancel"
            outlined
            severity="secondary" />
          <Button
            type="submit"
            @click="handleSubmit"
            :disabled="loading || Object.keys(errors).length > 0 || Object.keys(budgetItemErrors).length > 0"
            :loading="loading"
            icon="pi pi-check"
            :label="asset ? 'Update' : 'Create' + ' Investment'"
            severity="primary" />
        </div>
      </div>
    </template>
  </BaseModal>
</template> 