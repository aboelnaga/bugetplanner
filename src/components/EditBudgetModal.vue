<template>
  <div v-if="modelValue && budget" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Edit Budget Item</h3>
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
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select v-model="formData.category" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <!-- Income Categories -->
              <optgroup v-if="formData.type === 'income'" label="Income Categories">
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Business">Business</option>
                <option value="Bonus">Bonus</option>
                <option value="Side Hustle">Side Hustle</option>
                <option value="Other Income">Other Income</option>
              </optgroup>
              <!-- Investment Categories -->
              <optgroup v-else-if="formData.type === 'investment'" label="Investment Categories">
                <option value="Real Estate Purchase">Real Estate Purchase</option>
                <option value="Real Estate Installment">Real Estate Installment</option>
                <option value="Rental Income">Rental Income</option>
                <option value="Stock Purchase">Stock Purchase</option>
                <option value="Stock Dividends">Stock Dividends</option>
                <option value="Gold Purchase">Gold Purchase</option>
                <option value="Gold Sale">Gold Sale</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Retirement Fund">Retirement Fund</option>
                <option value="Crypto Purchase">Crypto Purchase</option>
                <option value="Crypto Sale">Crypto Sale</option>
                <option value="Investment Returns">Investment Returns</option>
                <option value="Capital Gains">Capital Gains</option>
                <option value="Other Investment">Other Investment</option>
              </optgroup>
              <!-- Expense Categories -->
              <optgroup v-else label="Expense Categories">
                <option value="Essential">Essential</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Savings">Savings</option>
                <option value="Investment">Investment</option>
                <option value="Education">Education</option>
                <option value="Transportation">Transportation</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Insurance">Insurance</option>
                <option value="Debt Payments">Debt Payments</option>
                <option value="Charity">Charity</option>
                <option value="Other">Other</option>
              </optgroup>
            </select>
          </div>
          <div v-if="formData.type === 'investment'">
            <label class="block text-sm font-medium text-gray-700">Investment Direction</label>
            <select v-model="formData.investment_direction" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="outgoing">Outgoing (Purchase/Contribution)</option>
              <option value="incoming">Incoming (Returns/Sales)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Default Amount</label>
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
            <select v-model="formData.recurrence" @change="updateSchedule"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly (Q1, Q2, Q3, Q4)</option>
              <option value="bi-annual">Bi-Annual (Jan & Jul)</option>
              <option value="school-terms">School Terms (Jan & Sep)</option>
              <option value="custom">Custom Months</option>
              <option value="one-time">One Time</option>
            </select>
          </div>
          <div v-if="formData.recurrence !== 'one-time' && formData.recurrence !== 'custom'">
            <label class="block text-sm font-medium text-gray-700">Start Month</label>
            <select v-model="formData.startMonth" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(monthIndex, arrayIndex) in availableStartMonthIndices" :key="monthIndex" :value="monthIndex">
                {{ months[monthIndex] }} {{ getMonthLabel(monthIndex) }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              <span v-if="formData.recurrence === 'monthly'">Budget will start from this month and continue monthly until December</span>
              <span v-else-if="formData.recurrence === 'quarterly'">Budget will start from the first quarter at or after this month</span>
              <span v-else-if="formData.recurrence === 'bi-annual'">Budget will start from the first bi-annual period at or after this month</span>
              <span v-else-if="formData.recurrence === 'school-terms'">Budget will start from the first school term at or after this month</span>
              <span v-else>Budget will start from this month and continue based on recurrence pattern</span>
              <br>
              <span v-if="selectedYear === currentYear" class="text-orange-600">Only current and future months are available for {{ currentYear }}</span>
              <span v-else-if="selectedYear > currentYear" class="text-green-600">All months are available for future year {{ selectedYear }}</span>
              <span v-else class="text-blue-600">All months are available for past year {{ selectedYear }}</span>
            </p>
          </div>
          <div v-if="formData.recurrence === 'custom'">
            <label class="block text-sm font-medium text-gray-700">Select Months</label>
            <div class="grid grid-cols-3 gap-2 mt-2">
              <label v-for="(month, index) in months" :key="month" class="flex items-center">
                <input type="checkbox" v-model="formData.customMonths" :value="index" class="mr-1" />
                <span class="text-sm">{{ month }}</span>
              </label>
            </div>
          </div>
          <div v-if="formData.recurrence === 'one-time'">
            <label class="block text-sm font-medium text-gray-700">Month</label>
            <select v-model="formData.oneTimeMonth" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option v-for="(month, index) in months" :key="month" :value="index">{{ month }}</option>
            </select>
          </div>
          <div class="bg-blue-50 p-3 rounded-md">
            <p class="text-sm text-gray-700">
              <strong>Note:</strong> Amounts will be recalculated from the start month onwards based on the new recurrence pattern.
              Past months (before start month) will be preserved.
            </p>
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
              Updating...
            </span>
            <span v-else>Update Budget</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Object,
    default: null
  },
  selectedYear: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'budget-updated'])

// Store
const budgetStore = useBudgetStore()

// Constants
const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Computed
const currentYear = computed(() => budgetStore.currentYear)
const currentMonth = computed(() => budgetStore.currentMonth)

// Available months for start month (depends on selected year)
const availableStartMonthIndices = computed(() => {
  if (props.selectedYear > currentYear.value) {
    // Future year: all month indices (0-11)
    return Array.from({ length: 12 }, (_, i) => i)
  } else if (props.selectedYear === currentYear.value) {
    // Current year: only current month and future month indices
    return Array.from({ length: 12 - currentMonth.value }, (_, i) => currentMonth.value + i)
  } else {
    // Past year: all month indices (0-11)
    return Array.from({ length: 12 }, (_, i) => i)
  }
})

// Form data
const formData = ref({
  name: '',
  type: 'expense',
  category: 'Essential',
  defaultAmount: 0,
  recurrence: 'monthly',
  customMonths: [],
  oneTimeMonth: 0,
  investment_direction: 'outgoing',
  startMonth: 0,
  amounts: [],
  schedule: []
})

// Loading state
const isLoading = ref(false)

// Get month label based on selected year and current date
const getMonthLabel = (monthIndex) => {
  if (props.selectedYear === currentYear.value) {
    if (monthIndex === currentMonth.value) return '(Current)'
    if (monthIndex === currentMonth.value + 1) return '(Next)'
  } else if (props.selectedYear > currentYear.value) {
    if (monthIndex === 0) return '(Jan of future year)'
  } else {
    return '(Past year)'
  }
  return ''
}

// Format number with commas every 3 digits
const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Parse formatted number back to numeric value
const parseFormattedNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0
  return parseFloat(value.toString().replace(/,/g, '')) || 0
}

// Allow only numbers and specific keys
const allowOnlyNumbers = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
  const allowedChars = /[0-9]/
  
  if (allowedKeys.includes(event.key) || allowedChars.test(event.key)) {
    return true
  }
  
  event.preventDefault()
  return false
}

// Handle amount input with validation and formatting
const handleAmountInput = (event) => {
  const input = event.target.value
  const rawValue = input.replace(/,/g, '')
  
  // Only allow numbers
  if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
    const numericValue = parseFloat(rawValue) || 0
    formData.value.defaultAmount = numericValue
  }
}

// Update category when type changes
const updateCategoryOnTypeChange = () => {
  if (formData.value.type === 'income') {
    formData.value.category = 'Salary'
  } else if (formData.value.type === 'investment') {
    formData.value.category = 'Real Estate Purchase'
  } else {
    formData.value.category = 'Essential'
  }
  
  // Reset start month based on selected year
  if (props.selectedYear === currentYear.value) {
    formData.value.startMonth = currentMonth.value
  } else {
    formData.value.startMonth = 0 // Default to January for non-current years
  }
  ensureValidStartMonth()
}

// Update schedule when recurrence changes
const updateSchedule = () => {
  // Reset custom selections when recurrence changes
  formData.value.customMonths = []
  formData.value.oneTimeMonth = 0
  
  // Reset start month based on selected year
  if (props.selectedYear === currentYear.value) {
    formData.value.startMonth = currentMonth.value
  } else {
    formData.value.startMonth = 0 // Default to January for non-current years
  }
  ensureValidStartMonth()
}

// Ensure start month is valid for the selected year
const ensureValidStartMonth = () => {
  if (props.selectedYear === currentYear.value && formData.value.startMonth < currentMonth.value) {
    formData.value.startMonth = currentMonth.value
  } else if (props.selectedYear !== currentYear.value && formData.value.startMonth < 0) {
    formData.value.startMonth = 0 // Default to January for non-current years
  }
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    // Preserve existing amounts and only update from start month onwards
    let newSchedule = []
    let newAmounts = [...formData.value.amounts] // Preserve existing amounts
    
    // Calculate schedule with start month consideration
    const startMonth = formData.value.startMonth
    
    // Clear amounts from start month onwards first
    for (let i = startMonth; i < 12; i++) {
      newAmounts[i] = 0
    }
    
    switch (formData.value.recurrence) {
      case 'monthly':
        // Start from specified month and continue for remaining months in the year
        for (let month = startMonth; month < 12; month++) {
          newSchedule.push(month)
        }
        break
      case 'quarterly':
        // Start from the first quarter that includes or comes after startMonth
        const quarters = [0, 3, 6, 9] // Q1, Q2, Q3, Q4
        newSchedule = quarters.filter(quarter => quarter >= startMonth)
        break
      case 'bi-annual':
        // Start from the first bi-annual period that includes or comes after startMonth
        const biAnnual = [0, 6] // January and July
        newSchedule = biAnnual.filter(month => month >= startMonth)
        break
      case 'school-terms':
        // Start from the first school term that includes or comes after startMonth
        const schoolTerms = [0, 8] // January and September
        newSchedule = schoolTerms.filter(month => month >= startMonth)
        break
      case 'custom':
        newSchedule = [...formData.value.customMonths]
        break
      case 'one-time':
        newSchedule = [formData.value.oneTimeMonth]
        break
    }
    
    // Set amounts for scheduled months
    newSchedule.forEach(month => {
      newAmounts[month] = formData.value.defaultAmount
    })
    
    // Create update data object
    const updateData = {
      name: formData.value.name,
      type: formData.value.type,
      category: formData.value.category,
      recurrence: formData.value.recurrence,
      default_amount: formData.value.defaultAmount,
      amounts: newAmounts,
      schedule: newSchedule,
      start_month: formData.value.startMonth
    }
    
    if (formData.value.type === 'investment') {
      updateData.investment_direction = formData.value.investment_direction
    }
    
    // Update via store
    console.log('Updating budget item with data:', updateData)
    const result = await budgetStore.updateBudgetItem(formData.value.id, updateData)
    console.log('Store result:', result)
    
    if (result) {
      // Close modal
      closeModal()
      
      // Emit success event
      emit('budget-updated', result)
    } else {
      // Show error message
      alert('Failed to update budget item. Please try again.')
    }
  } catch (error) {
    console.error('Error updating budget item:', error)
    alert('Error updating budget item: ' + (error.message || 'Unknown error'))
  } finally {
    isLoading.value = false
  }
}

// Initialize form data when budget prop changes
const initializeFormData = () => {
  if (props.budget) {
    formData.value = {
      ...props.budget,
      // Map snake_case database fields to camelCase frontend fields
      defaultAmount: props.budget.default_amount || props.budget.defaultAmount || 0,
      investment_direction: props.budget.investment_direction || props.budget.investment_direction || 'outgoing',
      startMonth: props.budget.start_month !== undefined ? props.budget.start_month : (props.budget.startMonth !== undefined ? props.budget.startMonth : 0),
      amounts: [...props.budget.amounts],
      schedule: [...props.budget.schedule],
      customMonths: props.budget.customMonths ? [...props.budget.customMonths] : [],
      oneTimeMonth: props.budget.oneTimeMonth || 0
    }
    
    // Set custom months for custom recurrence
    if (props.budget.recurrence === 'custom' && props.budget.schedule) {
      formData.value.customMonths = [...props.budget.schedule]
    }
    
    // Set one-time month
    if (props.budget.recurrence === 'one-time' && props.budget.schedule && props.budget.schedule.length > 0) {
      formData.value.oneTimeMonth = props.budget.schedule[0]
    }
    
    // Ensure start month is valid for the current year context
    ensureValidStartMonth()
  }
}

// Watch for budget changes to initialize form
watch(() => props.budget, (newBudget) => {
  if (newBudget) {
    initializeFormData()
  }
}, { immediate: true })

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.budget) {
    initializeFormData()
  }
})
</script> 