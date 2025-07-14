<template>
  <BaseModal 
    :modelValue="modelValue" 
    :loading="isLoading"
    @update:modelValue="$emit('update:modelValue', $event)">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </template>
    
    <template #title>Edit Budget Item</template>
    <template #subtitle>Modify budget item settings for {{ selectedYear }}</template>
    
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Basic Information
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Name
            </label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="e.g., Monthly Salary, Car Expenses"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          
          <!-- Budget Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Budget Type
            </label>
            <select 
              v-model="formData.type" 
              @change="updateCategoryOnTypeChange"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, type) in BUDGET_TYPE_LABELS" :key="type" :value="type">
                {{ label }}
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
          <!-- Default Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Default Amount
            </label>
            <div class="relative">
              <input 
                :value="formatCurrency(formData.defaultAmount)"
                @input="handleAmountInput"
                type="text" 
                required 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
          </div>
          
          <!-- Investment Direction (only for investment type) -->
          <div v-if="formData.type === BUDGET_TYPES.INVESTMENT">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Investment Direction
            </label>
            <select 
              v-model="formData.investment_direction"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, direction) in INVESTMENT_DIRECTION_LABELS" :key="direction" :value="direction">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Schedule & Timing
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Recurrence -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Recurrence
            </label>
            <select 
              v-model="formData.recurrence" 
              @change="updateSchedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, type) in RECURRENCE_LABELS" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>
          
          <!-- Start Month (hidden for custom and one-time recurrence) -->
          <div v-if="formData.recurrence !== RECURRENCE_TYPES.CUSTOM && formData.recurrence !== RECURRENCE_TYPES.ONE_TIME">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Start Month
            </label>
            <select 
              v-model="formData.startMonth"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option 
                v-for="monthIndex in getAvailableStartMonthIndices()" 
                :key="monthIndex" 
                :value="monthIndex">
                {{ months[monthIndex] }} {{ getMonthLabel(monthIndex) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Custom Months (for custom recurrence) -->
        <div v-if="formData.recurrence === RECURRENCE_TYPES.CUSTOM" class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Select Custom Months</label>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <label 
              v-for="(month, index) in months" 
              :key="month" 
              class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{ 'bg-blue-50 border-blue-300': formData.customMonths.includes(index) }">
              <input 
                type="checkbox" 
                :value="index" 
                v-model="formData.customMonths"
                class="mr-2 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm font-medium">{{ month }}</span>
            </label>
          </div>
        </div>

        <!-- One Time Month (for one-time recurrence) -->
        <div v-if="formData.recurrence === RECURRENCE_TYPES.ONE_TIME" class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Select Month</label>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <label 
              v-for="(month, index) in months" 
              :key="month" 
              class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{ 'bg-blue-50 border-blue-300': formData.oneTimeMonth === index }">
              <input 
                type="radio" 
                :value="index" 
                v-model="formData.oneTimeMonth"
                name="oneTimeMonth"
                class="mr-2 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm font-medium">{{ month }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Current Values Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Current Monthly Values
        </h4>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <!-- Month headers -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-2">
            <div 
              v-for="(month, index) in months" 
              :key="month"
              class="text-center py-2 px-1 text-xs font-semibold text-gray-700 rounded"
              :class="getCurrentValueClass(index)">
              {{ month }}
            </div>
          </div>
          
          <!-- Amount values -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-3">
            <div 
              v-for="(amount, index) in formData.amounts" 
              :key="index"
              class="text-center py-2 px-1 text-xs rounded border border-gray-200 bg-white"
              :class="getAmountClass(amount)">
              <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Current Total:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateCurrentTotal()) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ getCurrentActiveMonthsCount() }} active month{{ getCurrentActiveMonthsCount() !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          New Schedule Preview
        </h4>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <!-- Month headers -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-2">
            <div 
              v-for="(month, index) in months" 
              :key="month"
              class="text-center py-2 px-1 text-xs font-semibold text-gray-700 rounded"
              :class="getSchedulePreviewClass(index)">
              {{ month }}
            </div>
          </div>
          
          <!-- Amount values -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-3">
            <div 
              v-for="(amount, index) in generateSchedule().amounts" 
              :key="index"
              class="text-center py-2 px-1 text-xs rounded border border-gray-200 bg-white"
              :class="getAmountClass(amount)">
              <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span class="font-medium">New Total:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateNewTotal()) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ getActiveMonthsCount() }} active month{{ getActiveMonthsCount() !== 1 ? 's' : '' }}
            </div>
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
          <span v-if="isLoading">Updating...</span>
          <span v-else>Update Budget Item</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'
import { useBudgetModals } from '@/composables/useBudgetModals.js'
import { 
  MONTHS, 
  BUDGET_TYPES, 
  BUDGET_TYPE_LABELS, 
  RECURRENCE_TYPES, 
  RECURRENCE_LABELS, 
  INVESTMENT_DIRECTIONS, 
  INVESTMENT_DIRECTION_LABELS 
} from '@/constants/budgetConstants.js'
import { formatCurrency, formatCompactCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'

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
const months = MONTHS

// Computed
const currentYear = computed(() => budgetStore.currentYear)
const currentMonth = computed(() => budgetStore.currentMonth)

// Modal composable
const {
  formData,
  isLoading,
  initializeFormDataFromBudget,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getAvailableStartMonthIndices,
  getMonthLabel,
  getSchedulePreviewClass,
  calculateTotalAmount,
  handleEditSubmit,
  handleAmountInput,
  generateSchedule
} = useBudgetModals(budgetStore, computed(() => props.selectedYear), currentYear, currentMonth)

// Get current value class
const getCurrentValueClass = (monthIndex) => {
  if (props.selectedYear === currentYear.value && monthIndex === currentMonth.value) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  } else if (props.selectedYear === currentYear.value && monthIndex < currentMonth.value) {
    return 'bg-gray-200 text-gray-600'
  } else {
    return 'bg-gray-100 text-gray-700'
  }
}

// Get amount class
const getAmountClass = (amount) => {
  if (amount > 0) {
    return 'text-green-800'
  } else {
    return 'text-gray-500'
  }
}

// Calculate current total
const calculateCurrentTotal = () => {
  return formData.value.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
}

// Calculate new total
const calculateNewTotal = () => {
  return calculateTotalAmount()
}

// Get active months count
const getActiveMonthsCount = () => {
  return generateSchedule().amounts.filter(amount => amount > 0).length
}

// Get current active months count
const getCurrentActiveMonthsCount = () => {
  return formData.value.amounts.filter(amount => amount > 0).length
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Handle form submission
const handleSubmit = async () => {
  const result = await handleEditSubmit(formData.value.id)
  if (result) {
    closeModal()
    emit('budget-updated', result)
  }
}

// Watch for budget changes to initialize form
watch(() => props.budget, (newBudget) => {
  if (newBudget) {
    initializeFormDataFromBudget(newBudget)
  }
}, { immediate: true })

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.budget) {
    initializeFormDataFromBudget(props.budget)
  }
})
</script> 