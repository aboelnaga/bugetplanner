<script setup>
import { computed, watch, ref } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets.js'
import { useBudgetModals } from '@/composables/useBudgetModals.js'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import {
  MONTHS,
  BUDGET_TYPES,
  BUDGET_TYPE_LABELS,
  INVESTMENT_DIRECTION_LABELS,
  PAYMENT_SCHEDULES,
  PAYMENT_SCHEDULE_LABELS,
  FREQUENCY_TYPES,
  FREQUENCY_LABELS,
  RECURRENCE_INTERVALS,
  MONTH_OPTIONS,
  END_TYPES,
  END_TYPE_LABELS
} from '@/constants/budgetConstants.js'
import { formatCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'

// Props
const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    selectedYear: {
      type: Number,
      required: true
    },
    budget: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    }
  })

// Emits
const emit = defineEmits([
    'update:modelValue',
    'budget-added',
    'budget-updated'
  ])

// Store
const budgetStore = useBudgetStore()
const investmentAssetsStore = useInvestmentAssetsStore()

// Toast
const toast = useToast()

// Confirm
const confirm = useConfirm()

// Constants
const months = MONTHS

// Investment linking
const availableInvestments = ref([])

// DataTable state
const expandedRows = ref({})

// Computed
const currentYear = computed(() => budgetStore.currentYear)
const currentMonth = computed(() => budgetStore.currentMonth)

// Auto-detect multi-year based on start/end years
const isMultiYear = computed(() => {
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
      if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
        return formData.value.endYear > formData.value.startYear
      } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
        // For occurrences, calculate if it spans multiple years
        const totalMonths =
          formData.value.occurrences === 1
            ? 0
            : (formData.value.occurrences - 1) *
              formData.value.recurrenceInterval
        const startDate = new Date(
          formData.value.startYear,
          formData.value.startMonth
        )
        const endDate = new Date(
          startDate.getTime() + totalMonths * 30 * 24 * 60 * 60 * 1000
        )
        return endDate.getFullYear() > startDate.getFullYear()
      }
    }
    // For once and custom, it's never multi-year
    return false
  })

// Validation errors state
const validationErrors = ref([])

// Modal composable
const {
  formData,
  isLoading,
  initializeFormData,
  initializeFormDataFromBudget,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getAvailableStartMonthIndices,
  calculateTotalAmount,
  generateSchedule,
  updateMultiYearPreview,
  getAvailableYears,
  getAvailableEndYears,
  multiYearPreview,
  updateLegacyRecurrence,
  getAvailableOnceMonths,
  validateFormData
} = useBudgetModals(
    budgetStore,
    computed(() => props.selectedYear),
    currentYear,
    currentMonth,
    toast,
    confirm
  )

// Computed options for form fields
const typeOptions = computed(() =>
    Object.entries(BUDGET_TYPE_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  )

const categoryOptions = computed(() =>
    getCategoriesByType(formData.value.type).map((cat) => ({
      value: cat,
      label: cat
    }))
  )

const investmentDirectionOptions = computed(() =>
    Object.entries(INVESTMENT_DIRECTION_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  )

const investmentOptions = computed(() => [
    { label: 'No investment linked', value: '' },
    ...availableInvestments.value.map((inv) => ({
      label: `${inv.name} (${formatInvestmentType(inv.investment_type)})`,
      value: inv.id
    }))
  ])

const paymentScheduleOptions = computed(() =>
    Object.entries(PAYMENT_SCHEDULE_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  )

const dueDateOptions = computed(() =>
    Array.from({ length: 31 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}${getDaySuffix(i + 1)}`
    }))
  )

const reminderDaysOptions = computed(() =>
    [1, 2, 3, 5, 7, 10, 14, 21, 30].map((days) => ({
      value: days,
      label: `${days} day${days !== 1 ? 's' : ''} before`
    }))
  )

const frequencyOptions = computed(() =>
    Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  )

const recurrenceIntervalOptions = computed(() =>
    RECURRENCE_INTERVALS.map((interval) => ({
      value: interval.value,
      label: interval.label
    }))
  )

const monthOptions = computed(() =>
    MONTH_OPTIONS.map((month) => ({ value: month.value, label: month.label }))
  )

const availableStartMonthOptions = computed(() =>
    getAvailableStartMonthIndices().map((month) => ({
      value: month.value,
      label: month.label
    }))
  )

const availableYearOptions = computed(() =>
    getAvailableYears().map((year) => ({
      value: year,
      label: year.toString()
    }))
  )

const availableEndYearOptions = computed(() =>
    getAvailableEndYears().map((year) => ({
      value: year,
      label: year.toString()
    }))
  )

const availableOnceMonthOptions = computed(() =>
    getAvailableOnceMonths().map((month) => ({
      value: month.value,
      label: month.label
    }))
  )

const endTypeOptions = computed(() =>
    Object.entries(END_TYPE_LABELS).map(([value, label]) => ({ value, label }))
  )

// Computed
const hasErrors = computed(() => validationErrors.value.length > 0)

  // Watch for budget type changes to clear linked investment
  watch(
    () => formData.value.type,
    (newType, oldType) => {
      if (
        oldType === BUDGET_TYPES.INVESTMENT &&
        newType !== BUDGET_TYPES.INVESTMENT
      ) {
        formData.value.linked_investment_id = ''
      }
    }
  )

  // Watch for modal opening to initialize form
  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen) {
        // Clear validation errors when modal opens
        validationErrors.value = []

        if (props.mode === 'edit' && props.budget) {
          console.log('Initializing form with budget for edit:', props.budget)
          initializeFormDataFromBudget(props.budget)
        } else {
          initializeFormData()
          // Ensure frequency is set to "repeats" by default for add mode
          formData.value.frequency = FREQUENCY_TYPES.REPEATS
        }
        loadAvailableInvestments()
      }
    }
  )

  // Watch for budget changes in edit mode
  watch(
    () => props.budget,
    (newBudget) => {
      if (newBudget && props.modelValue && props.mode === 'edit') {
        console.log('Budget changed, reinitializing form:', newBudget)
        initializeFormDataFromBudget(newBudget)
      }
    }
  )

  // Watch for form changes to update preview (both single-year and multi-year)
  watch(
    [
      () => formData.value.frequency,
      () => formData.value.startMonth,
      () => formData.value.startYear,
      () => formData.value.endMonth,
      () => formData.value.endYear,
      () => formData.value.endType,
      () => formData.value.recurrenceInterval,
      () => formData.value.occurrences,
      () => formData.value.customMonths,
      () => formData.value.oneTimeMonth,
      () => formData.value.oneTimeYear,
      () => formData.value.defaultAmount,
      // Legacy fields for backward compatibility
      () => formData.value.is_multi_year,
      () => formData.value.start_year,
      () => formData.value.end_year,
      () => formData.value.end_month
    ],
    () => {
      // Clear validation errors when user makes changes
      if (validationErrors.value.length > 0) {
        validationErrors.value = []
      }

      // Update multi-year preview if available
      if (updateMultiYearPreview) {
        updateMultiYearPreview()
      }
    },
    { deep: true }
  )

// Get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

// Investment linking helpers
const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const getLinkedInvestmentName = () => {
  if (!formData.value.linked_investment_id) return ''
  const investment = availableInvestments.value.find(
      (inv) => inv.id === formData.value.linked_investment_id
    )
  return investment?.name || ''
}

const getLinkedInvestmentPurchaseAmount = () => {
  if (!formData.value.linked_investment_id) return 0
  const investment = availableInvestments.value.find(
      (inv) => inv.id === formData.value.linked_investment_id
    )
  return investment?.purchase_amount || 0
}

const loadAvailableInvestments = async () => {
  try {
    await investmentAssetsStore.fetchInvestmentAssets()
    availableInvestments.value = investmentAssetsStore.investmentAssets || []
  } catch (error) {
      console.error('Error loading investments:', error)
      availableInvestments.value = []
  }
}

// Close modal
const closeModal = () => {
    emit('update:modelValue', false)
}

// Unified budget submission handler
const handleSubmit = async () => {
    console.log('AddBudgetModal handleSubmit called, mode:', props.mode)

    try {
      // Clear previous validation errors
      validationErrors.value = []

      // Validate form data first
      const errors = validateFormData()
      if (errors.length > 0) {
        console.log('Validation errors found:', errors)
        validationErrors.value = errors
        return
      }

      // Use the same schedule data that preview uses (single source of truth)
      const scheduleData = schedulePreviewData.value
      console.log('Using schedule data:', scheduleData)

      let result
      if (props.mode === 'edit') {
        console.log('Edit mode - budget:', props.budget)
        if (!props.budget || !props.budget.id) {
          console.error('No budget to edit')
          return
        }

        // Use unified submit logic for both single and multi-year edits
        result = await handleUnifiedEditSubmit(props.budget.id, scheduleData)
      } else {
        // Use unified submit logic for both single and multi-year adds
        result = await handleUnifiedAddSubmit(scheduleData)
      }

      console.log('Submit result:', result)

      if (result) {
        console.log('Budget operation successful, closing modal')
        closeModal()
        emit(props.mode === 'edit' ? 'budget-updated' : 'budget-added', result)
      } else {
        console.log('Budget operation failed, keeping modal open')
        const errorMessage = `Failed to ${props.mode === 'edit' ? 'update' : 'create'} budget item "${formData.value.name}". Please try again.`
        console.log('Error message:', errorMessage)

        // Show error toast
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 3000
        })
      }
    } catch (error) {
      console.error('Budget submission error:', error)
      const errorMessage = `Error ${props.mode === 'edit' ? 'updating' : 'creating'} budget item "${formData.value.name}": ${error.message || 'Unknown error'}`
      console.log('Error message:', errorMessage)

      // Show error toast
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })
    }
}

// Unified add submit handler
const handleUnifiedAddSubmit = async (scheduleData) => {
  if (isMultiYear.value) {
      console.log('Creating multi-year budget with schedule data')
      return await handleMultiYearAddSubmit(scheduleData)
  } else {
      console.log('Creating single-year budget with schedule data')
      return await handleSingleYearAddSubmit(scheduleData)
  }
}

// Unified edit submit handler
const handleUnifiedEditSubmit = async (budgetId, scheduleData) => {
  if (isMultiYear.value) {
      console.log('Updating multi-year budget with schedule data')
      return await handleMultiYearEditWithSchedule(budgetId, scheduleData)
  } else {
      console.log('Updating single-year budget with schedule data')
      return await handleSingleYearEditWithSchedule(budgetId, scheduleData)
  }
}

// Multi-year edit using schedule data
const handleMultiYearEditWithSchedule = async (budgetId, scheduleData) => {
  try {
    // Use existing updateMultiYearBudgetItems but with calculated data
    const updateData = createBudgetDataFromSchedule(
        formData.value,
        scheduleData.yearlyBreakdown[0]
      )
    return await budgetStore.updateMultiYearBudgetItems(
        props.budget.linked_group_id,
        updateData
      )
  } catch (error) {
      console.error('Multi-year edit error:', error)
      return null
  }
}

// Single-year edit using schedule data
const handleSingleYearEditWithSchedule = async (budgetId, scheduleData) => {
  try {
    const updateData = createBudgetDataFromSchedule(
        formData.value,
        scheduleData.yearlyBreakdown[0]
      )
    return await budgetStore.updateBudgetItem(budgetId, updateData)
  } catch (error) {
      console.error('Single-year edit error:', error)
      return null
  }
}

// Single-year add using schedule data
const handleSingleYearAddSubmit = async (scheduleData) => {
  // Use the calculated amounts from schedule data instead of recalculating
  const yearData = scheduleData.yearlyBreakdown[0]
  const budgetData = createBudgetDataFromSchedule(formData.value, yearData)

  try {
    return await budgetStore.addBudgetItemFromSchedule(budgetData)
  } catch (error) {
      console.error('Single-year add error:', error)
      return null
  }
}

// Multi-year add using schedule data
const handleMultiYearAddSubmit = async (scheduleData) => {
  // Use the calculated yearly breakdown instead of recalculating
  const budgetDataArray = scheduleData.yearlyBreakdown.map((yearData) =>
      createBudgetDataFromSchedule(formData.value, yearData)
    )

  try {
    return await budgetStore.addMultiYearBudgetFromSchedule(
        budgetDataArray,
        formData.value
      )
  } catch (error) {
      console.error('Multi-year add error:', error)
      return null
  }
}

// Helper function to create budget data from schedule data
const createBudgetDataFromSchedule = (formData, yearData) => {
  return {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      default_amount: formData.defaultAmount,
      payment_schedule: formData.payment_schedule,
      due_date: formData.due_date || null,
      is_fixed_expense: formData.is_fixed_expense,
      reminder_enabled: formData.reminder_enabled,
      reminder_days_before: formData.reminder_days_before,
      investment_direction: formData.investment_direction,
      linked_investment_id: formData.linked_investment_id,
      // Schedule-specific fields
      year: yearData.year,
      frequency: formData.frequency,
      recurrence_interval: formData.recurrenceInterval,
      start_month: formData.startMonth,
      start_year: formData.startYear,
      end_month: formData.endMonth,
      end_year: formData.endYear,
      end_type: formData.endType,
      occurrences: formData.occurrences,
      custom_months: formData.customMonths,
      one_time_month: formData.oneTimeMonth,
      one_time_year: formData.oneTimeYear,
      // Legacy recurrence field (required by database schema)
      recurrence: 'monthly',
      // Pre-calculated amounts (single source of truth)
      amounts: yearData.monthlyAmounts,
      is_multi_year: isMultiYear.value
      // Note: total_amount and months_count removed - not needed in database, only used for UI display
    }
}

// Get calculated end year for occurrence-based endings
const getCalculatedEndYear = () => {
  if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
    return formData.value.endYear
  } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
    // For 1 occurrence, the end year is the same as start year
    if (formData.value.occurrences === 1) {
      return formData.value.startYear
    }

    // Calculate the actual end year from occurrences
    let currentMonth = formData.value.startMonth
    let currentYear = formData.value.startYear
    let occurrenceCount = 0

    while (occurrenceCount < formData.value.occurrences) {
      // Move to next occurrence
      currentMonth += formData.value.recurrenceInterval

      // Handle year rollover
      while (currentMonth >= 12) {
        currentMonth -= 12
        currentYear++
      }

      occurrenceCount++
    }

    return currentYear
  }
  return formData.value.endYear
}

// Unified schedule preview data (computed for reactivity)
const schedulePreviewData = computed(() => {
    if (isMultiYear.value && multiYearPreview.value) {
      // Add computed fields for DataTable
      return {
        ...multiYearPreview.value,
        yearlyBreakdown: multiYearPreview.value.yearlyBreakdown.map((year) => ({
          ...year,
          monthlyAverage:
            year.monthsCount > 0 ? year.amount / year.monthsCount : 0
        }))
      }
    } else {
      // Generate single-year preview data in the same format as multi-year
      const schedule = generateSchedule()
      const totalAmount = calculateTotalAmount()

      // Use the actual year from form data, not props.selectedYear
      const actualYear =
        formData.value.frequency === FREQUENCY_TYPES.ONCE
          ? formData.value.oneTimeYear
          : formData.value.startYear || props.selectedYear

      // Calculate active months from the schedule
      const activeMonths = schedule.amounts.filter(
        (amount) => amount > 0
      ).length

      // Always create a yearlyBreakdown entry, even if there are no active months
      // This ensures the breakdown section is always shown
      return {
        duration: 1,
        totalAmount,
        yearlyBreakdown: [
          {
            year: actualYear,
            amount: totalAmount,
            monthsCount: activeMonths,
            monthlyAmounts: schedule.amounts,
            isFirstYear: true,
            isLastYear: true,
            monthlyAverage: activeMonths > 0 ? totalAmount / activeMonths : 0
          }
        ]
      }
    }
  })

// DataTable methods
const onRowToggle = (event) => {
  expandedRows.value = event.data
}

const getMonthlyData = (yearData) => {
  return yearData.monthlyAmounts.map((amount, index) => ({
      monthIndex: index,
      monthName: months[index],
      amount,
      isCurrentMonth:
        yearData.year === currentYear.value && index === currentMonth.value,
      isPastMonth:
        yearData.year < currentYear.value ||
        (yearData.year === currentYear.value && index < currentMonth.value)
    }))
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :size="'medium'"
    :title="props.mode === 'edit' ? 'Edit Budget Item' : 'Add Budget Item'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Content -->
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Validation Errors -->
      <Message
        v-if="validationErrors.length > 0"
        severity="error"
        :closable="false"
      >
        <template #messageicon>
          <i class="pi pi-exclamation-triangle" />
        </template>
        <div>
          <h4 class="font-medium mb-2">
            Please fix the following errors:
          </h4>
          <ul class="space-y-1">
            <li
              v-for="error in validationErrors"
              :key="error"
              class="flex items-start"
            >
              <span class="mr-2">•</span>
              <span data-testid="validation-error-item">{{ error }}</span>
            </li>
          </ul>
        </div>
      </Message>

      <!-- Basic Information Section -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="md:col-span-2">
            <label
              for="name"
              class="block text-sm font-medium mb-2"
            >
              <span class="text-red-500">*</span> Name
            </label>
            <InputText
              id="name"
              v-model="formData.name"
              placeholder="Budget item name"
              class="w-full"
              :class="{
                'p-invalid': validationErrors.some((e) => e.includes('Name')),
              }"
              data-testid="budget-name-input"
            />
          </div>

          <!-- Budget Type -->
          <div>
            <label
              for="type"
              class="block text-sm font-medium mb-2"
            >
              <span class="text-red-500">*</span> Budget Type
            </label>
            <Select
              id="type"
              v-model="formData.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select budget type"
              class="w-full"
              :class="{
                'p-invalid': validationErrors.some((e) => e.includes('Type')),
              }"
              data-testid="budget-type-select"
              @change="updateCategoryOnTypeChange"
            />
          </div>

          <!-- Category -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium mb-2"
            >
              <span class="text-red-500">*</span> Category
            </label>
            <Select
              id="category"
              v-model="formData.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Select category"
              class="w-full"
              :class="{
                'p-invalid': validationErrors.some((e) =>
                  e.includes('Category'),
                ),
              }"
              data-testid="budget-category-select"
            />
          </div>
        </div>

        <!-- Investment Settings (only for Investment type) -->
        <div
          v-if="formData.type === BUDGET_TYPES.INVESTMENT"
          class="space-y-4"
        >
          <Divider>
            <span class="text-sm font-medium">Investment Settings</span>
          </Divider>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Investment Direction -->
            <div data-testid="investment-direction-section">
              <label
                for="investment_direction"
                class="block text-sm font-medium mb-2"
              >
                <span class="text-red-500">*</span> Investment Direction
              </label>
              <Select
                id="investment_direction"
                v-model="formData.investment_direction"
                :options="investmentDirectionOptions"
                option-label="label"
                option-value="value"
                placeholder="Select direction"
                class="w-full"
              />
            </div>

            <!-- Link to Existing Investment -->
            <div>
              <label
                for="linked_investment_id"
                class="block text-sm font-medium mb-2"
              >
                Link to Investment Asset
              </label>
              <Select
                id="linked_investment_id"
                v-model="formData.linked_investment_id"
                :options="investmentOptions"
                option-label="label"
                option-value="value"
                placeholder="No investment linked"
                class="w-full"
              />
            </div>
          </div>

          <!-- Linked Investment Info -->
          <Message
            v-if="formData.linked_investment_id"
            severity="info"
            :closable="false"
            icon="pi pi-chart-line"
            class="mb-4"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <span class="font-medium">
                  {{ getLinkedInvestmentName() }}
                </span>
                <span class="text-sm opacity-75">
                  (Purchase:
                  {{ formatCurrency(getLinkedInvestmentPurchaseAmount()) }})
                </span>
              </div>
              <Button
                type="button"
                icon="pi pi-times"
                text
                size="small"
                severity="danger"
                class="ml-2"
                @click="formData.linked_investment_id = ''"
              />
            </div>
          </Message>
        </div>
      </div>

      <!-- Financial Details Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">
          Financial Details
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Default Amount -->
          <div>
            <label
              for="defaultAmount"
              class="block text-sm font-medium mb-2"
            >
              <span class="text-red-500">*</span> Default Amount
            </label>
            <InputNumber
              id="defaultAmount"
              v-model="formData.defaultAmount"
              mode="currency"
              currency="EGP"
              placeholder="0.00"
              class="w-full"
              :class="{
                'p-invalid': validationErrors.some((e) => e.includes('Amount')),
              }"
              data-testid="default-amount-input"
            />
          </div>

          <!-- Payment Schedule -->
          <div>
            <label
              for="payment_schedule"
              class="block text-sm font-medium mb-2"
            >
              Payment Schedule
            </label>
            <Select
              id="payment_schedule"
              v-model="formData.payment_schedule"
              :options="paymentScheduleOptions"
              option-label="label"
              option-value="value"
              placeholder="Select schedule"
              class="w-full"
              data-testid="payment-schedule-select"
            />
          </div>
        </div>

        <!-- Due Date (only for custom_dates) -->
        <div
          v-if="formData.payment_schedule === PAYMENT_SCHEDULES.CUSTOM_DATES"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="due-date-section"
        >
          <div>
            <label
              for="due_date"
              class="block text-sm font-medium mb-2"
            >
              Due Date (Day of Month)
            </label>
            <Select
              id="due_date"
              v-model="formData.due_date"
              :options="dueDateOptions"
              option-label="label"
              option-value="value"
              placeholder="Select day"
              class="w-full"
            />
          </div>
        </div>

        <!-- Fixed Expense and Reminder Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fixed Expense Toggle -->
          <div class="flex items-center gap-2">
            <Checkbox
              id="is_fixed_expense"
              v-model="formData.is_fixed_expense"
              :binary="true"
            />
            <label
              for="is_fixed_expense"
              class="text-sm font-medium"
            >
              Fixed Expense
            </label>
          </div>

          <!-- Reminder Toggle -->
          <div class="flex items-center gap-2">
            <Checkbox
              id="reminder_enabled"
              v-model="formData.reminder_enabled"
              :binary="true"
            />
            <label
              for="reminder_enabled"
              class="text-sm font-medium"
            >
              Enable Reminders
            </label>
          </div>
        </div>

        <!-- Reminder Days Before (only if reminders enabled) -->
        <div
          v-if="formData.reminder_enabled"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label
              for="reminder_days_before"
              class="block text-sm font-medium mb-2"
            >
              Remind Me (Days Before)
            </label>
            <Select
              id="reminder_days_before"
              v-model="formData.reminder_days_before"
              :options="reminderDaysOptions"
              option-label="label"
              option-value="value"
              placeholder="Select days"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium border-b pb-2">
          Schedule
        </h3>

        <!-- Frequency -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="frequency"
              class="block text-sm font-medium mb-2"
            >Frequency</label>
            <Select
              id="frequency"
              v-model="formData.frequency"
              :options="frequencyOptions"
              option-label="label"
              option-value="value"
              placeholder="Select frequency"
              class="w-full"
              data-testid="frequency-select"
              @change="updateSchedule"
            />
          </div>

          <!-- Recurrence Interval (only for repeats) -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS">
            <label
              for="recurrenceInterval"
              class="block text-sm font-medium mb-2"
            >Recurrence Interval</label>
            <Select
              id="recurrenceInterval"
              v-model="formData.recurrenceInterval"
              :options="recurrenceIntervalOptions"
              option-label="label"
              option-value="value"
              placeholder="Select interval"
              class="w-full"
              data-testid="recurrence-interval-select"
              @change="updateSchedule"
            />
          </div>
        </div>

        <!-- Date Selection -->
        <div
          v-if="formData.frequency === FREQUENCY_TYPES.REPEATS"
          class="space-y-4"
          data-testid="start-date-section"
        >
          <!-- Start Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="startMonth"
                class="block text-sm font-medium mb-2"
              >Starting Month</label>
              <Select
                id="startMonth"
                v-model="formData.startMonth"
                :options="availableStartMonthOptions"
                option-label="label"
                option-value="value"
                placeholder="Select month"
                class="w-full"
                data-testid="start-month-select"
                @change="updateLegacyRecurrence"
              />
            </div>

            <div>
              <label
                for="startYear"
                class="block text-sm font-medium mb-2"
              >Starting Year</label>
              <Select
                id="startYear"
                v-model="formData.startYear"
                :options="availableYearOptions"
                option-label="label"
                option-value="value"
                placeholder="Select year"
                class="w-full"
                data-testid="start-year-select"
                @change="updateLegacyRecurrence"
              />
            </div>
          </div>

          <!-- End Date Type and End Date Options -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-testid="end-date-section"
          >
            <!-- End Date Type -->
            <div>
              <label
                for="endType"
                class="block text-sm font-medium mb-2"
              >
                <span class="text-red-500">*</span> Ending
              </label>
              <Select
                id="endType"
                v-model="formData.endType"
                :options="endTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select end type"
                class="w-full"
                data-testid="end-type-select"
                @change="updateLegacyRecurrence"
              />
            </div>

            <!-- End Date (only for specific date) -->
            <div v-if="formData.endType === END_TYPES.SPECIFIC_DATE">
              <div class="grid grid-cols-2 gap-2">
                <Select
                  id="endMonth"
                  v-model="formData.endMonth"
                  :options="monthOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Month"
                  class="w-full"
                  data-testid="end-month-select"
                  @change="updateLegacyRecurrence"
                />
                <Select
                  id="endYear"
                  v-model="formData.endYear"
                  :options="availableEndYearOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Year"
                  class="w-full"
                  data-testid="end-year-select"
                  @change="updateLegacyRecurrence"
                />
              </div>
            </div>

            <!-- Occurrences (only for after occurrences) -->
            <div v-if="formData.endType === END_TYPES.AFTER_OCCURRENCES">
              <label
                for="occurrences"
                class="block text-sm font-medium mb-2"
              >Number of Occurrences</label>
              <InputNumber
                id="occurrences"
                v-model="formData.occurrences"
                :min="1"
                :max="120"
                placeholder="Enter occurrences"
                class="w-full"
                data-testid="occurrences-input"
                @change="updateLegacyRecurrence"
              />
            </div>
          </div>
        </div>

        <!-- Custom Months (for custom frequency) -->
        <div
          v-if="formData.frequency === FREQUENCY_TYPES.CUSTOM"
          class="space-y-3"
        >
          <label class="block text-sm font-medium">Custom Months</label>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div
              v-for="(month, index) in months"
              :key="month"
              class="flex items-center p-3 border rounded-lg transition-colors"
              :class="{
                'bg-primary-50 border-primary-300':
                  formData.customMonths.includes(index),
                'cursor-pointer hover:bg-surface-100': index >= currentMonth,
                'cursor-not-allowed bg-surface-100 opacity-50':
                  index < currentMonth,
              }"
            >
              <Checkbox
                v-model="formData.customMonths"
                :value="index"
                :binary="false"
                :disabled="index < currentMonth"
                :data-testid="`custom-month-${index}`"
                @change="updateSchedule"
              />
              <span
                class="text-sm font-medium ml-2"
                :class="{ 'text-surface-500': index < currentMonth }"
              >
                {{ month }}
              </span>
            </div>
          </div>
        </div>

        <!-- One Time Date (for once frequency) -->
        <div
          v-if="formData.frequency === FREQUENCY_TYPES.ONCE"
          class="space-y-3"
        >
          <label class="block text-sm font-medium">One-Time Date</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-surface-600 mb-1">Month</label>
              <Select
                id="oneTimeMonth"
                v-model="formData.oneTimeMonth"
                :options="availableOnceMonthOptions"
                option-label="label"
                option-value="value"
                placeholder="Select month"
                class="w-full"
                data-testid="one-time-month-select"
                @change="updateLegacyRecurrence"
              />
            </div>
            <div>
              <label class="block text-xs text-surface-600 mb-1">Year</label>
              <Select
                id="oneTimeYear"
                v-model="formData.oneTimeYear"
                :options="availableYearOptions"
                option-label="label"
                option-value="value"
                placeholder="Select year"
                class="w-full"
                data-testid="one-time-year-select"
                @change="updateLegacyRecurrence"
              />
            </div>
          </div>
        </div>

        <!-- Multi-Year Indicator (Auto-detected) -->
        <Message
          v-if="isMultiYear"
          icon="pi pi-info-circle"
        >
          Multi-Year: {{ formData.startYear }}-{{ getCalculatedEndYear() }}
        </Message>
      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <!-- Yearly Breakdown DataTable -->
        <div v-if="schedulePreviewData.yearlyBreakdown.length > 0">
          <Panel
            :header="`${isMultiYear ? 'Yearly Breakdown' : 'Monthly Schedule'}`"
            toggleable
          >
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-2">
                  <i class="pi pi-chart-bar text-primary" />
                  <span class="font-medium">schedule preview</span>
                </div>
                <div class="text-right">
                  <span class="font-semibold">{{ formatCurrency(schedulePreviewData.totalAmount) }} /
                  </span>
                  <span class="text-surface-600">
                    {{
                      isMultiYear
                        ? ` ${schedulePreviewData.duration} year${schedulePreviewData.duration !== 1 ? "s" : ""}`
                        : ` ${schedulePreviewData.yearlyBreakdown[0]?.monthsCount || 0} month${(schedulePreviewData.yearlyBreakdown[0]?.monthsCount || 0) !== 1 ? "s" : ""}`
                    }}
                  </span>
                </div>
              </div>
            </template>

            <DataTable
              :value="schedulePreviewData.yearlyBreakdown"
              :expanded-rows="expandedRows"
              data-key="year"
              class="p-datatable-sm"
              :data-testid="
                isMultiYear ? 'multi-year-preview' : 'schedule-preview'
              "
              expandable-rows
              @row-toggle="onRowToggle"
            >
              <!-- Expandable Row -->
              <template #expansion="slotProps">
                <div class="p-4">
                  <DataTable
                    :value="getMonthlyData(slotProps.data)"
                    class="p-datatable-sm"
                    :show-gridlines="true"
                  >
                    <Column
                      field="month"
                      header="Month"
                      class="w-20"
                    >
                      <template #body="{ data }">
                        <div class="text-center">
                          <div class="font-medium">
                            {{ data.monthName }}
                          </div>
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="amount"
                      header="Amount"
                      class="w-24"
                    >
                      <template #body="{ data }">
                        <div class="text-center">
                          <div
                            v-if="data.amount > 0"
                            class="font-medium text-green-700"
                          >
                            {{ formatCurrency(data.amount) }}
                          </div>
                          <div
                            v-else
                            class="text-surface-400"
                          >
                            -
                          </div>
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="status"
                      header="Status"
                      class="w-20"
                    >
                      <template #body="{ data }">
                        <Tag
                          :value="data.amount > 0 ? 'Active' : 'Inactive'"
                          :severity="data.amount > 0 ? 'success' : 'secondary'"
                          size="small"
                        />
                      </template>
                    </Column>
                    <Column
                      field="period"
                      header="Period"
                      class="w-24"
                    >
                      <template #body="{ data }">
                        <div class="text-center text-xs">
                          <div
                            v-if="data.isCurrentMonth"
                            class="text-primary font-medium"
                          >
                            Current
                          </div>
                          <div
                            v-else-if="data.isPastMonth"
                            class="text-surface-500"
                          >
                            Past
                          </div>
                          <div
                            v-else
                            class="text-green-600"
                          >
                            Future
                          </div>
                        </div>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>

              <!-- Main Columns -->
              <Column
                expander
                style="width: 3rem"
              />
              <Column
                field="year"
                header="Year"
                class="w-20"
              >
                <template #body="{ data }">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold">{{ data.year }}</span>
                    <div class="flex gap-1">
                      <Tag
                        v-if="data.isFirstYear && isMultiYear"
                        value="First"
                        severity="info"
                        size="small"
                      />
                      <Tag
                        v-if="data.isLastYear && isMultiYear"
                        value="Last"
                        severity="success"
                        size="small"
                      />
                    </div>
                  </div>
                </template>
              </Column>

              <Column
                field="amount"
                header="Yearly Amount"
                class="w-32"
              >
                <template #body="{ data }">
                  <span class="font-semibold text-lg">{{
                    formatCurrency(data.amount)
                  }}</span>
                </template>
              </Column>

              <Column
                field="monthlyAverage"
                header="Monthly Average"
                class="w-32"
              >
                <template #body="{ data }">
                  <span class="font-medium">{{
                    formatCurrency(data.monthlyAverage)
                  }}</span>
                </template>
              </Column>

              <Column
                field="activeMonths"
                header="Active Months"
                class="w-28"
              >
                <template #body="{ data }">
                  <div>
                    <ProgressBar
                      :value="(data.monthsCount / 12) * 100"
                      class="h-2 mb-1"
                    >
                      {{ data.monthsCount }}/12
                    </ProgressBar>
                  </div>
                </template>
              </Column>
            </DataTable>
          </Panel>
        </div>
      </div>
    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button
          type="button"
          :disabled="isLoading"
          label="Cancel"
          outlined
          severity="secondary"
          data-testid="cancel-btn"
          @click="closeModal"
        />
        <Button
          type="submit"
          :disabled="isLoading || hasErrors"
          :loading="isLoading"
          icon="pi pi-check"
          :label="
            props.mode === 'edit'
              ? 'Update Budget Item'
              : isMultiYear
                ? 'Add Multi-Year Budget'
                : 'Add Budget Item'
          "
          severity="primary"
          :data-testid="
            props.mode === 'edit' ? 'submit-edit-btn' : 'submit-budget-btn'
          "
          @click="handleSubmit"
        />
      </div>
    </template>
  </BaseModal>
</template>
