<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Add Budget Item</h3>
        <button 
          @click="closeModal" 
          :disabled="isLoading"
          class="text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Close modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="formData.name" type="text" required 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Budget Type</label>
            <select v-model="formData.type" @change="updateCategoryOnTypeChange"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(label, type) in BUDGET_TYPE_LABELS" :key="type" :value="type">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select v-model="formData.category" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <!-- Income Categories -->
              <optgroup v-if="formData.type === BUDGET_TYPES.INCOME" label="Income Categories">
                <option v-for="category in CATEGORIES_BY_TYPE[BUDGET_TYPES.INCOME]" :key="category" :value="category">{{ category }}</option>
              </optgroup>
              <!-- Investment Categories -->
              <optgroup v-else-if="formData.type === BUDGET_TYPES.INVESTMENT" label="Investment Categories">
                <option v-for="category in CATEGORIES_BY_TYPE[BUDGET_TYPES.INVESTMENT]" :key="category" :value="category">{{ category }}</option>
              </optgroup>
              <!-- Expense Categories -->
              <optgroup v-else label="Expense Categories">
                <option v-for="category in CATEGORIES_BY_TYPE[BUDGET_TYPES.EXPENSE]" :key="category" :value="category">{{ category }}</option>
              </optgroup>
            </select>
          </div>
          <div v-if="formData.type === BUDGET_TYPES.INVESTMENT">
            <label class="block text-sm font-medium text-gray-700">Investment Direction</label>
            <select v-model="formData.investment_direction" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(label, direction) in INVESTMENT_DIRECTION_LABELS" :key="direction" :value="direction">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <input 
              :value="formatNumberWithCommas(formData.defaultAmount)"
              @input="handleAmountInput"
              @keypress="allowOnlyNumbers"
              type="text" 
              required 
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="0" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Recurrence</label>
            <select v-model="formData.recurrence" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(label, type) in RECURRENCE_LABELS" :key="type" :value="type">{{ label }}</option>
            </select>
          </div>
          <div v-if="formData.recurrence !== RECURRENCE_TYPES.ONE_TIME && formData.recurrence !== RECURRENCE_TYPES.CUSTOM">
            <label class="block text-sm font-medium text-gray-700">Start Month</label>
            <select v-model="formData.startMonth" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(monthIndex, arrayIndex) in availableStartMonthIndices" :key="monthIndex" :value="monthIndex">
                {{ MONTHS[monthIndex] }} {{ getMonthLabelForDisplay(monthIndex) }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              <span v-if="formData.recurrence === RECURRENCE_TYPES.MONTHLY">Budget will start from this month and continue monthly until December</span>
              <span v-else-if="formData.recurrence === RECURRENCE_TYPES.QUARTERLY">Budget will start from the first quarter at or after this month</span>
              <span v-else-if="formData.recurrence === RECURRENCE_TYPES.BI_ANNUAL">Budget will start from the first bi-annual period at or after this month</span>
              <span v-else-if="formData.recurrence === RECURRENCE_TYPES.SCHOOL_TERMS">Budget will start from the first school term at or after this month</span>
              <span v-else>Budget will start from this month and continue based on recurrence pattern</span>
              <br>
              <span v-if="selectedYear === currentYear" class="text-orange-600">Only current and future months are available for {{ currentYear }}</span>
              <span v-else-if="selectedYear > currentYear" class="text-green-600">All months are available for future year {{ selectedYear }}</span>
              <span v-else class="text-blue-600">All months are available for past year {{ selectedYear }}</span>
            </p>
          </div>
          <div v-if="formData.recurrence === RECURRENCE_TYPES.CUSTOM">
            <label class="block text-sm font-medium text-gray-700">Select Months</label>
            <div class="grid grid-cols-3 gap-2 mt-2">
              <label v-for="(month, index) in MONTHS" :key="month" class="flex items-center">
                <input type="checkbox" v-model="formData.customMonths" :value="index" class="mr-1" />
                <span class="text-sm">{{ month }}</span>
              </label>
            </div>
          </div>
          <div v-if="formData.recurrence === RECURRENCE_TYPES.ONE_TIME">
            <label class="block text-sm font-medium text-gray-700">Month</label>
            <select v-model="formData.oneTimeMonth" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(month, index) in MONTHS" :key="month" :value="index">{{ month }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="closeModal" 
                  :disabled="isLoading" 
                  class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="submit" 
                  :disabled="isLoading" 
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
            <span v-else>Add Budget</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'

// Import constants and utilities
import { 
  MONTHS, 
  BUDGET_TYPES, 
  BUDGET_TYPE_LABELS,
  CATEGORIES_BY_TYPE,
  INVESTMENT_DIRECTIONS,
  INVESTMENT_DIRECTION_LABELS,
  RECURRENCE_TYPES,
  RECURRENCE_LABELS,
  DEFAULT_VALUES
} from '@/constants/budgetConstants.js'
import { 
  formatNumberWithCommas, 
  getMonthLabel, 
  validationHelpers, 
  dateUtils, 
  inputUtils 
} from '@/utils/budgetUtils.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedYear: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'budget-added'])

// Store
const budgetStore = useBudgetStore()

// Computed
const currentYear = computed(() => budgetStore.currentYear)
const currentMonth = computed(() => budgetStore.currentMonth)

// Available months for start month (depends on selected year)
const availableStartMonthIndices = computed(() => {
  return dateUtils.getAvailableStartMonthIndices(props.selectedYear, currentYear.value, currentMonth.value)
})

// Form data
const formData = ref({ ...DEFAULT_VALUES.FORM_DATA })

// Loading state
const isLoading = ref(false)

// Get month label based on selected year and current date
const getMonthLabelForDisplay = (monthIndex) => {
  return getMonthLabel(monthIndex, props.selectedYear, currentYear.value, currentMonth.value)
}

// Allow only numbers and specific keys
const allowOnlyNumbers = validationHelpers.allowOnlyNumbers

// Handle amount input with validation and formatting
const handleAmountInput = (event) => {
  inputUtils.handleAmountInput(event, formData.value)
}

// Update category when type changes
const updateCategoryOnTypeChange = () => {
  formData.value.category = DEFAULT_VALUES.CATEGORIES_BY_TYPE[formData.value.type]
  
  // Reset start month based on selected year
  formData.value.startMonth = dateUtils.getDefaultStartMonth(props.selectedYear, currentYear.value, currentMonth.value)
}

// Ensure start month is valid for the selected year
const ensureValidStartMonth = () => {
  formData.value.startMonth = validationHelpers.ensureValidStartMonth(
    formData.value.startMonth,
    props.selectedYear,
    currentYear.value,
    currentMonth.value
  )
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    // Generate schedule based on recurrence
    const { schedule, amounts } = generateSchedule(
      formData.value.recurrence,
      formData.value.startMonth,
      formData.value.customMonths,
      formData.value.oneTimeMonth
    )

    // Create budget data object
    const budgetData = {
      name: formData.value.name,
      type: formData.value.type,
      category: formData.value.category,
      recurrence: formData.value.recurrence,
      default_amount: formData.value.defaultAmount,
      amounts: amounts,
      schedule: schedule,
      investment_direction: formData.value.investment_direction,
      start_month: formData.value.startMonth
    }

    // Add to store
    console.log('Adding budget item with data:', budgetData)
    const result = await budgetStore.addBudgetItem(budgetData)
    console.log('Store result:', result)
    
    if (result) {
      // Reset form
      formData.value = {
        ...DEFAULT_VALUES.FORM_DATA,
        startMonth: dateUtils.getDefaultStartMonth(props.selectedYear, currentYear.value, currentMonth.value)
      }
      
      // Close modal
      closeModal()
      
      // Emit success event
      emit('budget-added', result)
    } else {
      // Show error message
      alert('Failed to add budget item. Please try again.')
    }
  } catch (error) {
    console.error('Error adding budget item:', error)
    alert('Error adding budget item: ' + (error.message || 'Unknown error'))
  } finally {
    isLoading.value = false
  }
}

// Generate schedule based on recurrence
const generateSchedule = (recurrence, startMonth, customMonths = [], oneTimeMonth = 0) => {
  let schedule = []
  let amounts = new Array(12).fill(0)
  
  switch (recurrence) {
    case RECURRENCE_TYPES.MONTHLY:
      // Start from specified month and continue for remaining months in the year
      schedule = []
      for (let month = startMonth; month < 12; month++) {
        schedule.push(month)
      }
      break
    case RECURRENCE_TYPES.QUARTERLY:
      // Start from the first quarter that includes or comes after startMonth
      const quarters = [0, 3, 6, 9] // Q1, Q2, Q3, Q4
      schedule = quarters.filter(quarter => quarter >= startMonth)
      break
    case RECURRENCE_TYPES.BI_ANNUAL:
      // Start from the first bi-annual period that includes or comes after startMonth
      const biAnnual = [0, 6] // January and July
      schedule = biAnnual.filter(month => month >= startMonth)
      break
    case RECURRENCE_TYPES.SCHOOL_TERMS:
      // Start from the first school term that includes or comes after startMonth
      const schoolTerms = [0, 8] // January and September
      schedule = schoolTerms.filter(month => month >= startMonth)
      break
    case RECURRENCE_TYPES.CUSTOM:
      schedule = [...customMonths]
      break
    case RECURRENCE_TYPES.ONE_TIME:
      schedule = [oneTimeMonth]
      break
  }

  // Populate amounts array
  schedule.forEach(month => {
    amounts[month] = formData.value.defaultAmount
  })

  return { schedule, amounts }
}

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Set appropriate default start month based on selected year
    formData.value.startMonth = dateUtils.getDefaultStartMonth(props.selectedYear, currentYear.value, currentMonth.value)
    ensureValidStartMonth()
  }
})

// Watch for year changes and adjust start month accordingly
watch(() => props.selectedYear, (newYear, oldYear) => {
  if (props.modelValue) {
    // Adjust start month when year changes while modal is open
    if (newYear === currentYear.value) {
      // Switching to current year: ensure start month is not in the past
      if (formData.value.startMonth < currentMonth.value) {
        formData.value.startMonth = currentMonth.value
      }
    } else if (newYear > currentYear.value) {
      // Switching to future year: default to January if current selection is not valid
      if (oldYear === currentYear.value && formData.value.startMonth >= currentMonth.value) {
        // Keep relative position from current month, but start from January
        const monthsFromCurrent = formData.value.startMonth - currentMonth.value
        formData.value.startMonth = Math.min(monthsFromCurrent, 11)
      } else if (formData.value.startMonth < 0 || formData.value.startMonth > 11) {
        formData.value.startMonth = 0 // Default to January
      }
    } else {
      // Switching to past year: default to January
      formData.value.startMonth = 0
    }
  }
})
</script> 