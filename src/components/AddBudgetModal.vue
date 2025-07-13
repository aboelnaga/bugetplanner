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
  startMonth: 0
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
    
    let schedule = []
    let amounts = new Array(12).fill(0)
    
    // Generate schedule based on recurrence
    const startMonth = formData.value.startMonth
    
    switch (formData.value.recurrence) {
      case 'monthly':
        // Start from specified month and continue for remaining months in the year
        schedule = []
        for (let month = startMonth; month < 12; month++) {
          schedule.push(month)
        }
        schedule.forEach(month => amounts[month] = formData.value.defaultAmount)
        break
      case 'quarterly':
        // Start from the first quarter that includes or comes after startMonth
        const quarters = [0, 3, 6, 9] // Q1, Q2, Q3, Q4
        schedule = quarters.filter(quarter => quarter >= startMonth)
        schedule.forEach(month => amounts[month] = formData.value.defaultAmount)
        break
      case 'bi-annual':
        // Start from the first bi-annual period that includes or comes after startMonth
        const biAnnual = [0, 6] // January and July
        schedule = biAnnual.filter(month => month >= startMonth)
        schedule.forEach(month => amounts[month] = formData.value.defaultAmount)
        break
      case 'school-terms':
        // Start from the first school term that includes or comes after startMonth
        const schoolTerms = [0, 8] // January and September
        schedule = schoolTerms.filter(month => month >= startMonth)
        schedule.forEach(month => amounts[month] = formData.value.defaultAmount)
        break
      case 'custom':
        schedule = [...formData.value.customMonths]
        schedule.forEach(month => amounts[month] = formData.value.defaultAmount)
        break
      case 'one-time':
        schedule = [formData.value.oneTimeMonth]
        amounts[formData.value.oneTimeMonth] = formData.value.defaultAmount
        break
    }

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
        name: '',
        type: 'expense',
        category: 'Essential',
        defaultAmount: 0,
        recurrence: 'monthly',
        customMonths: [],
        oneTimeMonth: 0,
        investment_direction: 'outgoing',
        startMonth: props.selectedYear === currentYear.value ? currentMonth.value : 0
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

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Set appropriate default start month based on selected year
    if (props.selectedYear === currentYear.value) {
      formData.value.startMonth = currentMonth.value
    } else {
      formData.value.startMonth = 0 // Default to January for non-current years
    }
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