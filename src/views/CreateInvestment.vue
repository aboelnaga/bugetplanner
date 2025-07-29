<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Create Investment</h1>
            <p class="mt-2 text-gray-600">Add a new investment to your portfolio</p>
          </div>
          <router-link
            to="/investments"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Investments
          </router-link>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white shadow rounded-lg">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">{{ error }}</div>
              </div>
            </div>
          </div>

          <!-- Investment Type Selection -->
          <div>
            <label for="investment_type" class="block text-sm font-medium text-gray-700 mb-2">
              Investment Type *
            </label>
            <select
              id="investment_type"
              v-model="form.investment_type"
              @change="onInvestmentTypeChange"
              :class="[
                'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                errors.investment_type ? 'border-red-300' : 'border-gray-300'
              ]"
            >
              <option value="">Select investment type</option>
              <option v-for="type in investmentTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <p v-if="errors.investment_type" class="mt-1 text-sm text-red-600">
              {{ errors.investment_type }}
            </p>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Name/Title *
              </label>
              <input
                id="name"
                v-model="form.name"
                @blur="validateField('name')"
                type="text"
                :class="[
                  'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  errors.name ? 'border-red-300' : 'border-gray-300'
                ]"
                placeholder="Enter investment name"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label for="purchase_amount" class="block text-sm font-medium text-gray-700 mb-2">
                Purchase Amount *
              </label>
              <input
                id="purchase_amount"
                v-model="form.purchase_amount"
                @blur="validateField('purchase_amount')"
                type="number"
                step="0.01"
                :class="[
                  'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  errors.purchase_amount ? 'border-red-300' : 'border-gray-300'
                ]"
                placeholder="0.00"
              />
              <p v-if="errors.purchase_amount" class="mt-1 text-sm text-red-600">
                {{ errors.purchase_amount }}
              </p>
            </div>
          </div>

          <!-- Real Estate Specific Fields -->
          <div v-if="form.investment_type === 'real_estate'" class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Real Estate Details
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="delivery_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  id="delivery_date"
                  v-model="form.delivery_date"
                  @blur="validateField('delivery_date')"
                  type="date"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.delivery_date ? 'border-red-300' : 'border-gray-300'
                  ]"
                />
                <p v-if="errors.delivery_date" class="mt-1 text-sm text-red-600">
                  {{ errors.delivery_date }}
                </p>
              </div>

              <div>
                <label for="construction_status" class="block text-sm font-medium text-gray-700 mb-2">
                  Construction Status
                </label>
                <select
                  id="construction_status"
                  v-model="form.construction_status"
                  @blur="validateField('construction_status')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.construction_status ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select status</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="finished">Finished</option>
                </select>
                <p v-if="errors.construction_status" class="mt-1 text-sm text-red-600">
                  {{ errors.construction_status }}
                </p>
              </div>

              <div>
                <label for="completion_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date
                </label>
                <input
                  id="completion_date"
                  v-model="form.completion_date"
                  @blur="validateField('completion_date')"
                  type="date"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.completion_date ? 'border-red-300' : 'border-gray-300'
                  ]"
                />
                <p v-if="errors.completion_date" class="mt-1 text-sm text-red-600">
                  {{ errors.completion_date }}
                </p>
              </div>

              <div>
                <label for="developer_owner" class="block text-sm font-medium text-gray-700 mb-2">
                  Developer/Owner *
                </label>
                <input
                  id="developer_owner"
                  v-model="form.developer_owner"
                  @blur="validateField('developer_owner')"
                  type="text"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.developer_owner ? 'border-red-300' : 'border-gray-300'
                  ]"
                  placeholder="Enter developer or owner name"
                />
                <p v-if="errors.developer_owner" class="mt-1 text-sm text-red-600">
                  {{ errors.developer_owner }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  id="location"
                  v-model="form.location"
                  @blur="validateField('location')"
                  type="text"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  ]"
                  placeholder="Enter property location"
                />
                <p v-if="errors.location" class="mt-1 text-sm text-red-600">
                  {{ errors.location }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label for="real_estate_status" class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="real_estate_status"
                  v-model="form.real_estate_status"
                  @blur="validateField('real_estate_status')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.real_estate_status ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option v-for="status in realEstateStatuses" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </select>
                <p v-if="errors.real_estate_status" class="mt-1 text-sm text-red-600">
                  {{ errors.real_estate_status }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  General Information
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  @blur="validateField('description')"
                  rows="4"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  ]"
                  placeholder="Enter any additional information about the property"
                />
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">
                  {{ errors.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Precious Metals Specific Fields -->
          <div v-if="form.investment_type === 'precious_metals'" class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Precious Metals Details
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="metal_type" class="block text-sm font-medium text-gray-700 mb-2">
                  Metal Type *
                </label>
                <select
                  id="metal_type"
                  v-model="form.metal_type"
                  @blur="validateField('metal_type')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.metal_type ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select metal type</option>
                  <option v-for="metal in metalTypes" :key="metal.value" :value="metal.value">
                    {{ metal.label }}
                  </option>
                </select>
                <p v-if="errors.metal_type" class="mt-1 text-sm text-red-600">
                  {{ errors.metal_type }}
                </p>
              </div>

              <div>
                <label for="karat" class="block text-sm font-medium text-gray-700 mb-2">
                  Karat/Purity
                </label>
                <select
                  id="karat"
                  v-model="form.karat"
                  @blur="validateField('karat')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.karat ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select karat</option>
                  <option v-for="karat in karatOptions" :key="karat.value" :value="karat.value">
                    {{ karat.label }}
                  </option>
                </select>
                <p v-if="errors.karat" class="mt-1 text-sm text-red-600">
                  {{ errors.karat }}
                </p>
              </div>

              <div>
                <label for="condition" class="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  v-model="form.condition"
                  @blur="validateField('condition')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.condition ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select condition</option>
                  <option v-for="condition in conditionOptions" :key="condition.value" :value="condition.value">
                    {{ condition.label }}
                  </option>
                </select>
                <p v-if="errors.condition" class="mt-1 text-sm text-red-600">
                  {{ errors.condition }}
                </p>
              </div>

              <div>
                <label for="form" class="block text-sm font-medium text-gray-700 mb-2">
                  Form
                </label>
                <select
                  id="form"
                  v-model="form.form"
                  @blur="validateField('form')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.form ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select form</option>
                  <option v-for="formOption in formOptions" :key="formOption.value" :value="formOption.value">
                    {{ formOption.label }}
                  </option>
                </select>
                <p v-if="errors.form" class="mt-1 text-sm text-red-600">
                  {{ errors.form }}
                </p>
              </div>

              <div>
                <label for="purpose" class="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  id="purpose"
                  v-model="form.purpose"
                  @blur="validateField('purpose')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.purpose ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select purpose</option>
                  <option v-for="purpose in purposeOptions" :key="purpose.value" :value="purpose.value">
                    {{ purpose.label }}
                  </option>
                </select>
                <p v-if="errors.purpose" class="mt-1 text-sm text-red-600">
                  {{ errors.purpose }}
                </p>
              </div>

              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  id="amount"
                  v-model="form.amount"
                  @blur="validateField('amount')"
                  type="number"
                  step="0.01"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  ]"
                  placeholder="0.00"
                />
                <p v-if="errors.amount" class="mt-1 text-sm text-red-600">
                  {{ errors.amount }}
                </p>
              </div>

              <div>
                <label for="amount_unit" class="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  id="amount_unit"
                  v-model="form.amount_unit"
                  @blur="validateField('amount_unit')"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.amount_unit ? 'border-red-300' : 'border-gray-300'
                  ]"
                >
                  <option value="">Select unit</option>
                  <option v-for="unit in amountUnitOptions" :key="unit.value" :value="unit.value">
                    {{ unit.label }}
                  </option>
                </select>
                <p v-if="errors.amount_unit" class="mt-1 text-sm text-red-600">
                  {{ errors.amount_unit }}
                </p>
              </div>
            </div>
          </div>

          <!-- Document Links -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Document Links
            </h3>
            
            <div v-for="(link, index) in form.document_links" :key="index" class="flex items-center space-x-2">
              <input
                v-model="form.document_links[index]"
                type="url"
                :class="[
                  'flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  'border-gray-300'
                ]"
                placeholder="Enter document URL (Google Drive, Apple Drive, etc.)"
              />
              <button
                type="button"
                @click="removeDocumentLink(index)"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <button
              type="button"
              @click="addDocumentLink"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Document Link
            </button>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span v-if="hasErrors" class="text-red-600">Please fix errors</span>
              <span v-else class="text-green-600">All fields valid</span>
            </div>
            
            <div class="flex space-x-3">
              <router-link
                to="/investments"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </router-link>
              
              <button
                type="submit"
                :disabled="loading || hasErrors"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Creating...' : 'Create Investment' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { investmentAssetsAPI } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = reactive({
  investment_type: '',
  name: '',
  purchase_amount: '',
  current_value: '',
  purchase_date: '',
  last_valuation_date: '',
  description: '',
  // Real estate specific
  delivery_date: '',
  construction_status: '',
  completion_date: '',
  developer_owner: '',
  location: '',
  real_estate_status: 'planned',
  // Precious metals specific
  metal_type: '',
  karat: '',
  condition: '',
  form: '',
  purpose: '',
  amount: '',
  amount_unit: '',
  // Common
  document_links: []
})

// State
const loading = ref(false)
const error = ref('')
const errors = reactive({})

// Dropdown options
const investmentTypes = ref([])
const realEstateStatuses = ref([])
const metalTypes = ref([])
const karatOptions = ref([])
const conditionOptions = ref([])
const formOptions = ref([])
const purposeOptions = ref([])
const amountUnitOptions = ref([])

// Computed
const hasErrors = computed(() => Object.keys(errors).length > 0)

// Methods
const validateField = (field) => {
  delete errors[field]
  
  switch (field) {
    case 'investment_type':
      if (!form.investment_type) {
        errors[field] = 'Investment type is required'
      }
      break
    case 'name':
      if (!form.name.trim()) {
        errors[field] = 'Name is required'
      }
      break
    case 'purchase_amount':
      if (!form.purchase_amount || parseFloat(form.purchase_amount) <= 0) {
        errors[field] = 'Valid purchase amount is required'
      }
      break
    case 'delivery_date':
      if (form.investment_type === 'real_estate' && !form.delivery_date) {
        errors[field] = 'Delivery date is required for real estate'
      }
      break
    case 'developer_owner':
      if (form.investment_type === 'real_estate' && !form.developer_owner.trim()) {
        errors[field] = 'Developer/owner is required for real estate'
      }
      break
    case 'metal_type':
      if (form.investment_type === 'precious_metals' && !form.metal_type) {
        errors[field] = 'Metal type is required for precious metals'
      }
      break
    case 'amount':
      if (form.investment_type === 'precious_metals' && (!form.amount || parseFloat(form.amount) <= 0)) {
        errors[field] = 'Valid amount is required for precious metals'
      }
      break
    case 'amount_unit':
      if (form.investment_type === 'precious_metals' && !form.amount_unit) {
        errors[field] = 'Amount unit is required for precious metals'
      }
      break
  }
}

const validateForm = () => {
  // Clear all errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Validate required fields
  validateField('investment_type')
  validateField('name')
  validateField('purchase_amount')
  
  // Validate type-specific fields
  if (form.investment_type === 'real_estate') {
    validateField('delivery_date')
    validateField('developer_owner')
  } else if (form.investment_type === 'precious_metals') {
    validateField('metal_type')
    validateField('amount')
    validateField('amount_unit')
  }
  
  return Object.keys(errors).length === 0
}

const onInvestmentTypeChange = () => {
  // Reset type-specific fields when investment type changes
  if (form.investment_type !== 'real_estate') {
    form.delivery_date = ''
    form.construction_status = ''
    form.completion_date = ''
    form.developer_owner = ''
    form.location = ''
    form.real_estate_status = 'planned'
  }
  
  if (form.investment_type !== 'precious_metals') {
    form.metal_type = ''
    form.karat = ''
    form.condition = ''
    form.form = ''
    form.purpose = ''
    form.amount = ''
    form.amount_unit = ''
  }
  
  // Clear type-specific errors
  Object.keys(errors).forEach(key => {
    if (key !== 'investment_type' && key !== 'name' && key !== 'purchase_amount') {
      delete errors[key]
    }
  })
}

const addDocumentLink = () => {
  form.document_links.push('')
}

const removeDocumentLink = (index) => {
  form.document_links.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    error.value = 'Please fix the errors above'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Prepare the data for submission
    const investmentData = {
      user_id: authStore.user.id,
      investment_type: form.investment_type,
      name: form.name.trim(),
      purchase_amount: parseFloat(form.purchase_amount),
      current_value: form.current_value ? parseFloat(form.current_value) : null,
      purchase_date: form.purchase_date || null,
      last_valuation_date: form.last_valuation_date || null,
      description: form.description.trim() || null,
      document_links: form.document_links.filter(link => link.trim()),
      // Type-specific fields
      ...(form.investment_type === 'real_estate' && {
        delivery_date: form.delivery_date || null,
        construction_status: form.construction_status || null,
        completion_date: form.completion_date || null,
        developer_owner: form.developer_owner.trim(),
        location: form.location.trim() || null,
        real_estate_status: form.real_estate_status
      }),
      ...(form.investment_type === 'precious_metals' && {
        metal_type: form.metal_type,
        karat: form.karat || null,
        condition: form.condition || null,
        form: form.form || null,
        purpose: form.purpose || null,
        amount: parseFloat(form.amount),
        amount_unit: form.amount_unit
      })
    }
    
    const createdInvestment = await investmentAssetsAPI.createInvestmentAsset(investmentData)
    
    // Navigate to the investment details page
    router.push(`/investments/${createdInvestment.id}`)
    
  } catch (err) {
    console.error('Error creating investment:', err)
    error.value = err.message || 'Failed to create investment'
  } finally {
    loading.value = false
  }
}

// Load dropdown options
const loadDropdownOptions = async () => {
  try {
    investmentTypes.value = await investmentAssetsAPI.getInvestmentTypes()
    realEstateStatuses.value = await investmentAssetsAPI.getRealEstateStatuses()
    metalTypes.value = await investmentAssetsAPI.getMetalTypes()
    karatOptions.value = await investmentAssetsAPI.getKaratOptions()
    conditionOptions.value = await investmentAssetsAPI.getConditionOptions()
    formOptions.value = await investmentAssetsAPI.getFormOptions()
    purposeOptions.value = await investmentAssetsAPI.getPurposeOptions()
    amountUnitOptions.value = await investmentAssetsAPI.getAmountUnitOptions()
  } catch (err) {
    console.error('Error loading dropdown options:', err)
    error.value = 'Failed to load form options'
  }
}

onMounted(() => {
  loadDropdownOptions()
})
</script> 