<template>
  <BaseModal 
    :modelValue="modelValue" 
    :loading="isLoading"
    @update:modelValue="$emit('update:modelValue', $event)"
    data-testid="edit-budget-modal">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </template>
    
    <template #title>Edit Budget Item</template>
    <template #subtitle>Update budget item for {{ selectedYear }}</template>
    
    <!-- Content -->
    <form @submit.prevent="submitEdit" class="space-y-6">
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-name-input" />
          </div>
          
          <!-- Budget Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Budget Type
            </label>
            <select 
              v-model="formData.type" 
              @change="updateCategoryOnTypeChange"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-type-select">
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-category-select">
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                data-testid="default-amount-input" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Maximum: {{ DATABASE_LIMITS.MAX_AMOUNT_FORMATTED }}
            </p>
          </div>
          
          <!-- Payment Schedule -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Payment Schedule
            </label>
            <select 
              v-model="formData.payment_schedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="payment-schedule-select">
              <option v-for="(label, schedule) in PAYMENT_SCHEDULE_LABELS" :key="schedule" :value="schedule">
                {{ label }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ PAYMENT_SCHEDULE_DESCRIPTIONS[formData.payment_schedule] }}
            </p>
          </div>
        </div>

        <!-- Fixed Expense and Reminder Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fixed Expense Toggle -->
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="is_fixed_expense"
              v-model="formData.is_fixed_expense"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="is_fixed_expense" class="text-sm font-medium text-gray-700">
              Fixed Expense
            </label>
            <div class="flex-1">
              <p class="text-xs text-gray-500">
                Amount doesn't change month to month
              </p>
            </div>
          </div>
          
          <!-- Reminder Toggle -->
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="reminder_enabled"
              v-model="formData.reminder_enabled"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="reminder_enabled" class="text-sm font-medium text-gray-700">
              Enable Reminders
            </label>
            <div class="flex-1">
              <p class="text-xs text-gray-500">
                Get notified before due date
              </p>
            </div>
          </div>
        </div>

        <!-- Reminder Days Before (only if reminders enabled) -->
        <div v-if="formData.reminder_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Remind Me (Days Before)
            </label>
            <select 
              v-model="formData.reminder_days_before"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="days in [1, 2, 3, 5, 7, 10, 14, 21, 30]" :key="days" :value="days">
                {{ days }} day{{ days !== 1 ? 's' : '' }} before
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
        
        <!-- Frequency Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Frequency -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Frequency
            </label>
            <select 
              v-model="formData.frequency" 
              @change="updateSchedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="frequency-select">
              <option v-for="(label, type) in FREQUENCY_LABELS" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>
          
          <!-- Recurrence Interval (only for repeats) -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Recurrence Interval
            </label>
            <select 
              v-model="formData.recurrenceInterval"
              @change="updateSchedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="recurrence-interval-select">
              <option v-for="interval in RECURRENCE_INTERVALS" :key="interval.value" :value="interval.value">
                {{ interval.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date Selection for Repeats -->
        <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div class="grid grid-cols-2 gap-2">
              <select 
                v-model="formData.startMonth"
                @change="updateSchedule"
                data-testid="start-month-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="month in MONTH_OPTIONS" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
              <select 
                v-model="formData.startYear"
                @change="updateSchedule"
                data-testid="start-year-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="year in getAvailableYears()" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
          
          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div class="grid grid-cols-2 gap-2">
              <select 
                v-model="formData.endMonth"
                @change="updateSchedule"
                data-testid="end-month-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="month in MONTH_OPTIONS" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
              <select 
                v-model="formData.endYear"
                @change="updateSchedule"
                data-testid="end-year-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="year in getAvailableYears()" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- One Time Date (for once frequency) -->
        <div v-if="formData.frequency === FREQUENCY_TYPES.ONCE" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">One-Time Date</label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Month</label>
              <select 
                v-model="formData.oneTimeMonth"
                @change="updateSchedule"
                data-testid="one-time-month-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="month in MONTH_OPTIONS" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Year</label>
              <select 
                v-model="formData.oneTimeYear"
                @change="updateSchedule"
                data-testid="one-time-year-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="year in getAvailableYears()" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Schedule Preview
        </h4>
        
        <!-- Schedule Preview -->
        <div class="bg-gray-50 rounded-lg p-4" data-testid="schedule-preview">
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
              :class="getAmountClass(amount)"
              :title="formatCurrency(amount)">
              <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Total Amount:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateTotalAmount()) }}</span>
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
          @click="submitEdit"
          :disabled="isLoading" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          data-testid="submit-edit-btn">
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
import { computed, watch, ref, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'
import { useBudgetModals } from '@/composables/useBudgetModals.js'
import { 
  MONTHS, 
  BUDGET_TYPES, 
  BUDGET_TYPE_LABELS, 
  FREQUENCY_TYPES,
  FREQUENCY_LABELS,
  RECURRENCE_INTERVALS,
  MONTH_OPTIONS,
  PAYMENT_SCHEDULES,
  PAYMENT_SCHEDULE_LABELS,
  PAYMENT_SCHEDULE_DESCRIPTIONS,
  DATABASE_LIMITS
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
  resetFormData,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getSchedulePreviewClass,
  calculateTotalAmount,
  handleEditSubmit,
  handleAmountInput,
  generateSchedule,
  getAvailableYears
} = useBudgetModals(budgetStore, computed(() => props.selectedYear), currentYear, currentMonth)

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.budget) {
    console.log('Initializing form with budget:', props.budget)
    initializeFormDataFromBudget(props.budget)
  }
})

// Watch for budget changes
watch(() => props.budget, (newBudget) => {
  if (newBudget && props.modelValue) {
    console.log('Budget changed, reinitializing form:', newBudget)
    initializeFormDataFromBudget(newBudget)
  }
})

// Get amount class for styling
const getAmountClass = (amount) => {
  if (amount > 0) {
    return 'border-green-200 bg-green-100 text-green-800'
  } else {
    return 'border-gray-200 bg-white text-gray-400'
  }
}

// Get active months count
const getActiveMonthsCount = () => {
  return generateSchedule().amounts.filter(amount => amount > 0).length
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Handle edit submission
const submitEdit = async () => {
  if (!props.budget || !props.budget.id) {
    console.error('No budget to edit')
    return
  }
  
  const result = await handleEditSubmit(props.budget.id)
  if (result) {
    emit('budget-updated', result)
    closeModal()
  }
}
</script> 