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

// Static options for construction status
const constructionStatusOptions = [
  { label: 'Under Construction', value: 'under_construction' },
  { label: 'Finished', value: 'finished' }
]

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

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Card class="mb-6">
      <template #content>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">Create Investment</h1>
            <p class="mt-2">Add a new investment to your portfolio</p>
          </div>
          
          <Button
            @click="router.push('/investments')"
            icon="pi pi-arrow-left"
            label="Back to Investments"
            outlined
            severity="secondary"
          />
        </div>
      </template>
    </Card>

    <!-- Form -->
    <Card>
      <template #content>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Error Alert -->
          <Message v-if="error" severity="error" :closable="false">
            <template #messageicon>
              <i class="pi pi-exclamation-triangle"></i>
            </template>
            {{ error }}
          </Message>

          <!-- Investment Type Selection -->
          <div>
            <label for="investment_type" class="block text-sm font-medium mb-2">
              Investment Type *
            </label>
            <Select
              id="investment_type"
              v-model="form.investment_type"
              :options="investmentTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select investment type"
              class="w-full"
              :class="{ 'p-invalid': errors.investment_type }"
              @change="onInvestmentTypeChange"
            />
            <small v-if="errors.investment_type" class="p-error">{{ errors.investment_type }}</small>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium mb-2">Name/Title *</label>
              <InputText
                id="name"
                v-model="form.name"
                @blur="validateField('name')"
                placeholder="Enter investment name"
                class="w-full"
                :class="{ 'p-invalid': errors.name }"
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>

            <div>
              <label for="purchase_amount" class="block text-sm font-medium mb-2">Purchase Amount *</label>
              <InputNumber
                id="purchase_amount"
                v-model="form.purchase_amount"
                @blur="validateField('purchase_amount')"
                mode="currency"
                currency="EGP"
                placeholder="0.00"
                class="w-full"
                :class="{ 'p-invalid': errors.purchase_amount }"
              />
              <small v-if="errors.purchase_amount" class="p-error">{{ errors.purchase_amount }}</small>
            </div>
          </div>

          <!-- Real Estate Specific Fields -->
          <div v-if="form.investment_type === 'real_estate'" class="space-y-6">
            <Divider>
              <span class="text-lg font-medium">Real Estate Details</span>
            </Divider>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="delivery_date" class="block text-sm font-medium mb-2">Delivery Date</label>
                <DatePicker
                  id="delivery_date"
                  v-model="form.delivery_date"
                  @blur="validateField('delivery_date')"
                  dateFormat="dd/mm/yy"
                  placeholder="Select delivery date"
                  class="w-full"
                  :class="{ 'p-invalid': errors.delivery_date }"
                />
                <small v-if="errors.delivery_date" class="p-error">{{ errors.delivery_date }}</small>
              </div>

              <div>
                <label for="construction_status" class="block text-sm font-medium mb-2">Construction Status</label>
                <Select
                  id="construction_status"
                  v-model="form.construction_status"
                  :options="constructionStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                  class="w-full"
                  :class="{ 'p-invalid': errors.construction_status }"
                  @blur="validateField('construction_status')"
                />
                <small v-if="errors.construction_status" class="p-error">{{ errors.construction_status }}</small>
              </div>

              <div>
                <label for="completion_date" class="block text-sm font-medium mb-2">Completion Date</label>
                <DatePicker
                  id="completion_date"
                  v-model="form.completion_date"
                  @blur="validateField('completion_date')"
                  dateFormat="dd/mm/yy"
                  placeholder="Select completion date"
                  class="w-full"
                  :class="{ 'p-invalid': errors.completion_date }"
                />
                <small v-if="errors.completion_date" class="p-error">{{ errors.completion_date }}</small>
              </div>

              <div>
                <label for="developer_owner" class="block text-sm font-medium mb-2">Developer/Owner *</label>
                <InputText
                  id="developer_owner"
                  v-model="form.developer_owner"
                  @blur="validateField('developer_owner')"
                  placeholder="Enter developer or owner name"
                  class="w-full"
                  :class="{ 'p-invalid': errors.developer_owner }"
                />
                <small v-if="errors.developer_owner" class="p-error">{{ errors.developer_owner }}</small>
              </div>

              <div class="md:col-span-2">
                <label for="location" class="block text-sm font-medium mb-2">Location</label>
                <InputText
                  id="location"
                  v-model="form.location"
                  @blur="validateField('location')"
                  placeholder="Enter property location"
                  class="w-full"
                  :class="{ 'p-invalid': errors.location }"
                />
                <small v-if="errors.location" class="p-error">{{ errors.location }}</small>
              </div>

              <div class="md:col-span-2">
                <label for="real_estate_status" class="block text-sm font-medium mb-2">Status</label>
                <Select
                  id="real_estate_status"
                  v-model="form.real_estate_status"
                  :options="realEstateStatuses"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                  class="w-full"
                  :class="{ 'p-invalid': errors.real_estate_status }"
                  @blur="validateField('real_estate_status')"
                />
                <small v-if="errors.real_estate_status" class="p-error">{{ errors.real_estate_status }}</small>
              </div>

              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium mb-2">General Information</label>
                <Textarea
                  id="description"
                  v-model="form.description"
                  @blur="validateField('description')"
                  rows="4"
                  placeholder="Enter any additional information about the property"
                  class="w-full"
                  :class="{ 'p-invalid': errors.description }"
                />
                <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
              </div>
            </div>
          </div>

          <!-- Precious Metals Specific Fields -->
          <div v-if="form.investment_type === 'precious_metals'" class="space-y-6">
            <Divider>
              <span class="text-lg font-medium">Precious Metals Details</span>
            </Divider>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="metal_type" class="block text-sm font-medium mb-2">Metal Type *</label>
                <Select
                  id="metal_type"
                  v-model="form.metal_type"
                  :options="metalTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select metal type"
                  class="w-full"
                  :class="{ 'p-invalid': errors.metal_type }"
                  @blur="validateField('metal_type')"
                />
                <small v-if="errors.metal_type" class="p-error">{{ errors.metal_type }}</small>
              </div>

              <div>
                <label for="karat" class="block text-sm font-medium mb-2">Karat/Purity</label>
                <Select
                  id="karat"
                  v-model="form.karat"
                  :options="karatOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select karat"
                  class="w-full"
                  :class="{ 'p-invalid': errors.karat }"
                  @blur="validateField('karat')"
                />
                <small v-if="errors.karat" class="p-error">{{ errors.karat }}</small>
              </div>

              <div>
                <label for="condition" class="block text-sm font-medium mb-2">Condition</label>
                <Select
                  id="condition"
                  v-model="form.condition"
                  :options="conditionOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select condition"
                  class="w-full"
                  :class="{ 'p-invalid': errors.condition }"
                  @blur="validateField('condition')"
                />
                <small v-if="errors.condition" class="p-error">{{ errors.condition }}</small>
              </div>

              <div>
                <label for="form" class="block text-sm font-medium mb-2">Form</label>
                <Select
                  id="form"
                  v-model="form.form"
                  :options="formOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select form"
                  class="w-full"
                  :class="{ 'p-invalid': errors.form }"
                  @blur="validateField('form')"
                />
                <small v-if="errors.form" class="p-error">{{ errors.form }}</small>
              </div>

              <div>
                <label for="purpose" class="block text-sm font-medium mb-2">Purpose</label>
                <Select
                  id="purpose"
                  v-model="form.purpose"
                  :options="purposeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select purpose"
                  class="w-full"
                  :class="{ 'p-invalid': errors.purpose }"
                  @blur="validateField('purpose')"
                />
                <small v-if="errors.purpose" class="p-error">{{ errors.purpose }}</small>
              </div>

              <div>
                <label for="amount" class="block text-sm font-medium mb-2">Amount *</label>
                <InputNumber
                  id="amount"
                  v-model="form.amount"
                  @blur="validateField('amount')"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  placeholder="0.00"
                  class="w-full"
                  :class="{ 'p-invalid': errors.amount }"
                />
                <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
              </div>

              <div>
                <label for="amount_unit" class="block text-sm font-medium mb-2">Unit *</label>
                <Select
                  id="amount_unit"
                  v-model="form.amount_unit"
                  :options="amountUnitOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select unit"
                  class="w-full"
                  :class="{ 'p-invalid': errors.amount_unit }"
                  @blur="validateField('amount_unit')"
                />
                <small v-if="errors.amount_unit" class="p-error">{{ errors.amount_unit }}</small>
              </div>
            </div>
          </div>

          <!-- Document Links -->
          <div class="space-y-4">
            <Divider>
              <span class="text-lg font-medium">Document Links</span>
            </Divider>
            
            <div v-for="(link, index) in form.document_links" :key="index" class="flex items-center gap-2">
              <InputText
                v-model="form.document_links[index]"
                type="url"
                placeholder="Enter document URL (Google Drive, Apple Drive, etc.)"
                class="flex-1"
              />
              <Button
                type="button"
                @click="removeDocumentLink(index)"
                icon="pi pi-trash"
                severity="danger"
                text
                size="small"
              />
            </div>
            
            <Button
              type="button"
              @click="addDocumentLink"
              icon="pi pi-plus"
              label="Add Document Link"
              outlined
              severity="secondary"
            />
          </div>

          <!-- Form Actions -->
          <Divider />
          
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span v-if="hasErrors" class="text-red-600 font-medium">Please fix errors</span>
              <span v-else class="text-green-600 font-medium">All fields valid</span>
            </div>
            
            <div class="flex gap-3">
              <Button
                @click="router.push('/investments')"
                label="Cancel"
                outlined
                severity="secondary"
              />
              
              <Button
                type="submit"
                :disabled="loading || hasErrors"
                :loading="loading"
                icon="pi pi-check"
                label="Create Investment"
                severity="primary"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template> 