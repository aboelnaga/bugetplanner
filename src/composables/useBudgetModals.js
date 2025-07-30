// Budget modals composable
// Modal state management, form handling logic, validation functions

import { ref, watch } from 'vue'
import { 
  BUDGET_TYPES, 
  RECURRENCE_TYPES, 
  RECURRENCE_LABELS,
  INVESTMENT_DIRECTIONS, 
  SCHEDULE_PATTERNS,
  DEFAULT_VALUES,
  CATEGORIES_BY_TYPE,
  DATABASE_LIMITS,
  MULTI_YEAR_CONSTANTS,
  MULTI_YEAR_CALCULATION
} from '@/constants/budgetConstants.js'
import { dateUtils, validationHelpers, scheduleUtils, formatCurrency } from '@/utils/budgetUtils.js'

export function useBudgetModals(budgetStore, selectedYear, currentYear, currentMonth) {
  // Modal state
  const showAddBudgetModal = ref(false)
  const showEditBudgetModal = ref(false)
  // const showHistoryModal = ref(false) // History functionality commented out
  const editingBudget = ref(null)
  const isLoading = ref(false)

  // Form data
  const formData = ref({ ...DEFAULT_VALUES.FORM_DATA })

  // Multi-year specific state
  const multiYearPreview = ref({
    yearlyBreakdown: [],
    totalAmount: 0,
    duration: 0
  })

  // Initialize form data
  const initializeFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value),
      // Multi-year defaults
      start_year: selectedYear.value,
      end_year: selectedYear.value + MULTI_YEAR_CONSTANTS.DEFAULT_DURATION_YEARS - 1
    }
    updateMultiYearPreview()
  }

  // Reset form data
  const resetFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value),
      // Multi-year defaults
      start_year: selectedYear.value,
      end_year: selectedYear.value + MULTI_YEAR_CONSTANTS.DEFAULT_DURATION_YEARS - 1
    }
    updateMultiYearPreview()
  }

  // Multi-year calculation functions
  const updateMultiYearPreview = () => {
    if (!formData.value.is_multi_year) {
      multiYearPreview.value = {
        yearlyBreakdown: [],
        totalAmount: 0,
        duration: 0
      }
      return
    }

    const { start_year, end_year, startMonth, end_month, defaultAmount, recurrence, customMonths } = formData.value
    
    if (!start_year || !end_year) {
      multiYearPreview.value = {
        yearlyBreakdown: [],
        totalAmount: 0,
        duration: 0
      }
      return
    }

    const yearlyBreakdown = MULTI_YEAR_CALCULATION.generateYearlyBreakdownWithMonthlyAmounts(
      defaultAmount, 
      start_year, 
      end_year, 
      startMonth, 
      end_month,
      recurrence,
      customMonths
    )

    const totalAmount = MULTI_YEAR_CALCULATION.calculateMultiYearTotalAmount(
      defaultAmount, 
      start_year, 
      end_year, 
      startMonth, 
      end_month
    )

    multiYearPreview.value = {
      yearlyBreakdown,
      totalAmount,
      duration: end_year - start_year + 1
    }
  }

  // Handle multi-year toggle
  const handleMultiYearToggle = () => {
    if (formData.value.is_multi_year) {
      // Enable multi-year: set smart defaults
      formData.value.start_year = selectedYear.value
      formData.value.end_year = selectedYear.value + MULTI_YEAR_CONSTANTS.DEFAULT_DURATION_YEARS - 1
      formData.value.end_month = null // Default to full year
      
      // Set start month based on selected year and current date
      if (selectedYear.value === currentYear.value) {
        // Current year: start from current month or later
        formData.value.startMonth = Math.max(currentMonth.value, 0)
      } else if (selectedYear.value > currentYear.value) {
        // Future year: can start from January
        formData.value.startMonth = 0
      } else {
        // Past year: start from January (though this shouldn't happen in normal flow)
        formData.value.startMonth = 0
      }
      
      // Set valid recurrence for multi-year (exclude One Time)
      if (formData.value.recurrence === RECURRENCE_TYPES.ONE_TIME) {
        formData.value.recurrence = RECURRENCE_TYPES.MONTHLY
      }
    } else {
      // Disable multi-year: reset to single year
      formData.value.start_year = selectedYear.value
      formData.value.end_year = selectedYear.value
      formData.value.end_month = null
      // Reset start month based on selected year for single year
      formData.value.startMonth = dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
    }
    updateMultiYearPreview()
  }

  // Validate multi-year settings
  const validateMultiYearSettings = () => {
    const errors = []
    
    if (!formData.value.is_multi_year) return errors

    const { start_year, end_year } = formData.value

    if (!start_year || !end_year) {
      errors.push('Start year and end year are required for multi-year budgets')
      return errors
    }

    if (start_year > end_year) {
      errors.push('Start year cannot be after end year')
    }

    if (end_year - start_year + 1 > MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS) {
      errors.push(`Multi-year duration cannot exceed ${MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS} years`)
    }

    if (end_year - start_year + 1 < MULTI_YEAR_CONSTANTS.MIN_DURATION_YEARS) {
      errors.push(`Multi-year duration must be at least ${MULTI_YEAR_CONSTANTS.MIN_DURATION_YEARS} year`)
    }

    return errors
  }

  // Get categories by type
  const getCategoriesByType = (type) => {
    return CATEGORIES_BY_TYPE[type] || CATEGORIES_BY_TYPE[BUDGET_TYPES.EXPENSE]
  }

  // Update category when type changes
  const updateCategoryOnTypeChange = () => {
    const categories = getCategoriesByType(formData.value.type)
    formData.value.category = categories[0]
    
    // Reset start month based on selected year
    formData.value.startMonth = dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
    ensureValidStartMonth()
    updateMultiYearPreview()
  }

  // Update schedule when recurrence changes
  const updateSchedule = () => {
    // Reset custom selections when recurrence changes
    formData.value.customMonths = []
    formData.value.oneTimeMonth = 0
    
    // Reset start month based on selected year
    formData.value.startMonth = dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
    ensureValidStartMonth()
    updateMultiYearPreview()
  }

  // Ensure start month is valid for the selected year
  const ensureValidStartMonth = () => {
    formData.value.startMonth = validationHelpers.ensureValidStartMonth(
      formData.value.startMonth,
      selectedYear.value,
      currentYear.value,
      currentMonth.value
    )
  }

  // Get available start month indices
  const getAvailableStartMonthIndices = () => {
    return dateUtils.getAvailableStartMonthIndices(selectedYear.value, currentYear.value, currentMonth.value)
  }

  // Get month label based on selected year and current date
  const getMonthLabel = (monthIndex) => {
    if (selectedYear.value === currentYear.value) {
      if (monthIndex === currentMonth.value) return '(Current)'
      if (monthIndex === currentMonth.value + 1) return '(Next)'
    } else if (selectedYear.value > currentYear.value) {
      if (monthIndex === 0) return '(Jan of future year)'
    } else {
      return '(Past year)'
    }
    return ''
  }

  // Generate schedule based on form data
  const generateSchedule = () => {
    return scheduleUtils.generateSchedule(
      formData.value.recurrence,
      formData.value.startMonth,
      formData.value.customMonths,
      formData.value.oneTimeMonth,
      formData.value.defaultAmount
    )
  }

  // Get schedule preview class
  const getSchedulePreviewClass = (monthIndex) => {
    return scheduleUtils.getSchedulePreviewClass(
      monthIndex,
      formData.value.recurrence,
      formData.value.startMonth,
      formData.value.customMonths,
      formData.value.oneTimeMonth
    )
  }

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (formData.value.is_multi_year) {
      return multiYearPreview.value.totalAmount
    }
    
    return scheduleUtils.calculateTotalAmount(
      formData.value.recurrence,
      formData.value.startMonth,
      formData.value.customMonths,
      formData.value.oneTimeMonth,
      formData.value.defaultAmount
    )
  }

  // Handle amount input with currency formatting
  const handleAmountInput = (event) => {
    const input = event.target
    const value = input.value
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    let cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
    
    // Check if the integer part exceeds the maximum length
    const maxLength = DATABASE_LIMITS.MAX_AMOUNT.toString().length // 10 digits
    if (parts[0].length > maxLength) {
      // Trim the integer part to max length
      cleanValue = parts[0].substring(0, maxLength) + (parts.length > 1 ? '.' + parts[1] : '')
    }
    
    // Convert to number
    let numberValue = parseFloat(cleanValue) || 0
    
    // Apply database limits (precision 12, scale 2 = max 9,999,999,999.99)
    if (numberValue > DATABASE_LIMITS.MAX_AMOUNT) {
      numberValue = DATABASE_LIMITS.MAX_AMOUNT
      // Show warning to user
      if (!window.amountLimitWarningShown) {
        alert(`Amount cannot exceed ${DATABASE_LIMITS.MAX_AMOUNT_FORMATTED} due to database limitations.`)
        window.amountLimitWarningShown = true
      }
    }
    
    // Update form data
    formData.value.defaultAmount = numberValue
    
    // Update multi-year preview
    updateMultiYearPreview()
    
    // Update input value with formatted display
    input.value = formatCurrency(numberValue)
  }

  // Validate form data
  const validateFormData = () => {
    const errors = []
    
    if (!formData.value.name.trim()) {
      errors.push('Name is required')
    }
    
    if (formData.value.defaultAmount <= 0) {
      errors.push('Default amount must be greater than 0')
    }
    
    // Check for database limits (precision 12, scale 2 = max 9,999,999,999.99)
    if (formData.value.defaultAmount > DATABASE_LIMITS.MAX_AMOUNT) {
      errors.push(`Default amount cannot exceed ${DATABASE_LIMITS.MAX_AMOUNT_FORMATTED} due to database limitations`)
    }
    
    if (formData.value.recurrence === 'custom' && formData.value.customMonths.length === 0) {
      errors.push('Please select at least one custom month')
    }
    
    if (formData.value.recurrence === 'one-time' && formData.value.oneTimeMonth === undefined) {
      errors.push('Please select a month for one-time recurrence')
    }

    // Validate start month for current year
    if (formData.value.start_year === currentYear.value && formData.value.startMonth < currentMonth.value) {
      errors.push('Start month cannot be in the past for the current year')
    }

    // Multi-year validation
    const multiYearErrors = validateMultiYearSettings()
    errors.push(...multiYearErrors)
    
    return errors
  }

  // Create budget data object for submission
  const createBudgetData = () => {
    const { schedule, amounts } = generateSchedule()

    const baseData = {
      name: formData.value.name,
      type: formData.value.type,
      category: formData.value.category,
      recurrence: formData.value.recurrence,
      default_amount: formData.value.defaultAmount,
      amounts: amounts,
      schedule: schedule,
      investment_direction: formData.value.investment_direction,
      start_month: formData.value.startMonth,
      payment_schedule: formData.value.payment_schedule,
      due_date: formData.value.due_date,
      is_fixed_expense: formData.value.is_fixed_expense,
      reminder_enabled: formData.value.reminder_enabled,
      reminder_days_before: formData.value.reminder_days_before,
      linked_investment_id: formData.value.linked_investment_id || null
    }

    // Add multi-year fields if enabled
    if (formData.value.is_multi_year) {
      baseData.is_multi_year = true
      baseData.start_year = formData.value.start_year
      baseData.end_year = formData.value.end_year
      baseData.end_month = formData.value.end_month
    }

    return baseData
  }

  // Handle form submission for add modal
  const handleAddSubmit = async () => {
    try {
      isLoading.value = true
      
      const errors = validateFormData()
      if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      const budgetData = createBudgetData()
      console.log('Adding budget item with data:', budgetData)
      
      let result
      if (formData.value.is_multi_year) {
        // Create multiple budget items for multi-year
        result = await budgetStore.addMultiYearBudgetItem(budgetData)
      } else {
        // Create single budget item
        result = await budgetStore.addBudgetItem(budgetData)
      }
      
      console.log('Store result:', result)
      
      if (result) {
        resetFormData()
        return result
      } else {
        alert('Failed to add budget item. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error adding budget item:', error)
      alert('Error adding budget item: ' + (error.message || 'Unknown error'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Handle form submission for edit modal
  const handleEditSubmit = async (budgetId) => {
    try {
      isLoading.value = true
      
      const errors = validateFormData()
      if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      // Preserve existing amounts and only update from start month onwards
      let newSchedule = []
      let newAmounts = [...formData.value.amounts] // Preserve existing amounts
      
      // Calculate schedule with start month consideration
      const startMonth = formData.value.startMonth
      
      // Clear amounts from start month onwards first
      for (let i = startMonth; i < 12; i++) {
        newAmounts[i] = 0
      }
      
      const { schedule } = generateSchedule()
      newSchedule = schedule
      
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
        start_month: formData.value.startMonth,
        payment_schedule: formData.value.payment_schedule,
        due_date: formData.value.due_date,
        is_fixed_expense: formData.value.is_fixed_expense,
        reminder_enabled: formData.value.reminder_enabled,
        reminder_days_before: formData.value.reminder_days_before,
        linked_investment_id: formData.value.linked_investment_id || null
      }
      
      if (formData.value.type === 'investment') {
        updateData.investment_direction = formData.value.investment_direction
      }
      
      console.log('Updating budget item with data:', updateData)
      const result = await budgetStore.updateBudgetItem(budgetId, updateData)
      console.log('Store result:', result)
      
      if (result) {
        return result
      } else {
        alert('Failed to update budget item. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error updating budget item:', error)
      alert('Error updating budget item: ' + (error.message || 'Unknown error'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Initialize form data when budget prop changes (for edit modal)
  const initializeFormDataFromBudget = (budget) => {
    if (budget) {
      formData.value = {
        ...budget,
        // Map snake_case database fields to camelCase frontend fields
        defaultAmount: budget.default_amount || budget.defaultAmount || 0,
        investment_direction: budget.investment_direction || budget.investment_direction || 'outgoing',
        startMonth: budget.start_month !== undefined ? budget.start_month : (budget.startMonth !== undefined ? budget.startMonth : 0),
        amounts: budget.amounts ? [...budget.amounts] : [],
        schedule: budget.schedule ? [...budget.schedule] : [],
        customMonths: budget.customMonths ? [...budget.customMonths] : [],
        oneTimeMonth: budget.oneTimeMonth || 0,
        // New payment schedule fields
        payment_schedule: budget.payment_schedule || 'throughout_month',
        due_date: budget.due_date || null,
        is_fixed_expense: budget.is_fixed_expense || false,
        reminder_enabled: budget.reminder_enabled || false,
        reminder_days_before: budget.reminder_days_before || 3,
        linked_investment_id: budget.linked_investment_id || ''
      }
      
      // Set custom months for custom recurrence
      if (budget.recurrence === 'custom' && budget.schedule) {
        formData.value.customMonths = budget.schedule ? [...budget.schedule] : []
      }
      
      // Set one-time month
      if (budget.recurrence === 'one-time' && budget.schedule && budget.schedule.length > 0) {
        formData.value.oneTimeMonth = budget.schedule[0]
      }
      
      // Ensure start month is valid for the current year context
      ensureValidStartMonth()
    }
  }

  // Modal actions
  const openAddBudgetModal = () => {
    showAddBudgetModal.value = true
    initializeFormData()
  }

  const closeAddBudgetModal = () => {
    showAddBudgetModal.value = false
    resetFormData()
  }

  const openEditBudgetModal = (budget) => {
    editingBudget.value = budget
    showEditBudgetModal.value = true
    initializeFormDataFromBudget(budget)
  }

  const closeEditBudgetModal = () => {
    showEditBudgetModal.value = false
    editingBudget.value = null
  }

  // const openHistoryModal = () => {
  //   showHistoryModal.value = true
  // }

  // const closeHistoryModal = () => {
  //   showHistoryModal.value = false
  // }

  // Form submission handlers
  const handleBudgetAdded = (budgetItem) => {
    console.log('Budget item added successfully:', budgetItem)
  }

  const handleBudgetUpdated = (budgetItem) => {
    console.log('Budget item updated successfully:', budgetItem)
  }

  // Budget actions
  const editBudget = (budget) => {
    editingBudget.value = budget
    showEditBudgetModal.value = true
    initializeFormDataFromBudget(budget)
  }

  const duplicateBudget = async (budget) => {
    // Create a copy of the budget item
    const budgetData = {
      name: budget.name + ' (Copy)',
      type: budget.type,
      category: budget.category,
      recurrence: budget.recurrence,
      default_amount: budget.default_amount || budget.defaultAmount || 0,
      amounts: budget.amounts ? [...budget.amounts] : [],
      schedule: budget.schedule ? [...budget.schedule] : [],
      investment_direction: budget.investment_direction,
      start_month: budget.start_month !== undefined ? budget.start_month : (budget.startMonth !== undefined ? budget.startMonth : 0),
      payment_schedule: budget.payment_schedule || 'throughout_month',
      due_date: budget.due_date || null,
      is_fixed_expense: budget.is_fixed_expense || false,
      reminder_enabled: budget.reminder_enabled || false,
      reminder_days_before: budget.reminder_days_before || 3
    }

    // Add to store
    await budgetStore.addBudgetItem(budgetData)
  }

  const deleteBudget = async (budgetId) => {
    const budget = budgetStore.budgetItems.find(item => item.id === budgetId)
    if (!budget) return
    
    // Check if budget has any values for the whole year
    const hasAnyValues = budget.amounts.some(amount => amount > 0)
    
    // If it's a future year, allow full deletion
    if (selectedYear.value > currentYear) {
      if (confirm('Are you sure you want to delete this budget item?')) {
        await budgetStore.deleteBudgetItem(budgetId)
      }
      return
    }
    
    // If no values for the whole year, allow deletion
    if (!hasAnyValues) {
      if (confirm('Are you sure you want to delete this empty budget item?')) {
        await budgetStore.deleteBudgetItem(budgetId)
      }
      return
    }
    
    // If current year and has values, check if there are past values
    if (selectedYear.value === currentYear) {
      const hasPastValues = budget.amounts.slice(0, currentMonth.value).some(amount => amount > 0)
      const hasFutureValues = budget.amounts.slice(currentMonth.value).some(amount => amount > 0)
      
      if (hasPastValues && hasFutureValues) {
        // Has both past and future values - clear only future values
        if (confirm('This budget item has historical data. Clear only the remaining months (current month onwards)?')) {
          for (let i = currentMonth.value; i < 12; i++) {
            if (budget.amounts[i] > 0) {
              await budgetStore.updateMonthlyAmount(budgetId, i, 0)
            }
          }
        }
      } else if (hasPastValues && !hasFutureValues) {
        // Has only past values - don't allow deletion
        alert('Cannot delete this budget item as it contains historical data and all future months are already empty.')
      } else if (!hasPastValues && hasFutureValues) {
        // Has only future values - allow full deletion
        if (confirm('Are you sure you want to delete this budget item? (It only contains future planning data)')) {
          await budgetStore.deleteBudgetItem(budgetId)
        }
      }
    } else if (selectedYear.value < currentYear) {
      // Past year with values - don't allow deletion
      alert('Cannot delete budget items from past years that contain data.')
    }
  }

  // Year management
  const addNewYear = (availableYears) => {
    const newYear = Math.max(...availableYears) + 1
    availableYears.push(newYear)
    selectedYear.value = newYear
  }

  const copyFromPreviousYear = async () => {
    const previousYear = selectedYear.value - 1
    
    if (confirm(`Copy all budget items from ${previousYear} to ${selectedYear.value}?`)) {
      const result = await budgetStore.copyFromPreviousYear(previousYear, selectedYear.value)
      
      if (!result) {
        alert('Failed to copy budget items. Please try again.')
      }
    }
  }

  // Get available years for start year selection
  const getAvailableYears = () => {
    const currentYearValue = currentYear.value
    const years = []
    // Only allow current year and future years (no past years)
    for (let year = currentYearValue; year <= currentYearValue + 10; year++) {
      years.push(year)
    }
    return years
  }

  // Get available years for end year selection
  const getAvailableEndYears = () => {
    if (!formData.value.start_year) return []
    
    const startYear = formData.value.start_year
    const years = []
    // Allow up to 20 years from start year
    for (let year = startYear; year <= startYear + MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS - 1; year++) {
      years.push(year)
    }
    return years
  }

  // Get recurrence options for multi-year budgets (exclude One Time)
  const getMultiYearRecurrenceOptions = () => {
    const options = {}
    Object.entries(RECURRENCE_LABELS).forEach(([type, label]) => {
      if (type !== RECURRENCE_TYPES.ONE_TIME) {
        options[type] = label
      }
    })
    return options
  }

  // Watch for year changes and adjust start month accordingly
  const watchYearChanges = () => {
    if (showAddBudgetModal.value) {
      // Adjust start month when year changes while modal is open
      if (selectedYear.value === currentYear.value) {
        // Switching to current year: ensure start month is not in the past
        if (formData.value.startMonth < currentMonth.value) {
          formData.value.startMonth = currentMonth.value
        }
      } else if (selectedYear.value > currentYear.value) {
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
  }

  // Watch for modal opening to initialize form
  watch(() => showAddBudgetModal.value, (isOpen) => {
    if (isOpen) {
      initializeFormData()
      ensureValidStartMonth()
    }
  })

  // Watch for year changes and adjust start month accordingly
  watch(() => selectedYear.value, (newYear, oldYear) => {
    if (showAddBudgetModal.value) {
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

  return {
    // Modal state
    showAddBudgetModal,
    showEditBudgetModal,
    // showHistoryModal, // History functionality commented out
    editingBudget,
    isLoading,
    formData,
    
    // Modal actions
    openAddBudgetModal,
    closeAddBudgetModal,
    openEditBudgetModal,
    closeEditBudgetModal,
    // openHistoryModal, // History functionality commented out
    // closeHistoryModal, // History functionality commented out
    
    // Form management
    initializeFormData,
    resetFormData,
    initializeFormDataFromBudget,
    getCategoriesByType,
    updateCategoryOnTypeChange,
    updateSchedule,
    ensureValidStartMonth,
    getAvailableStartMonthIndices,
    getMonthLabel,
    generateSchedule,
    getSchedulePreviewClass,
    calculateTotalAmount,
    handleAmountInput,
    
    // Form validation and submission
    validateFormData,
    createBudgetData,
    handleAddSubmit,
    handleEditSubmit,
    
    // Form handlers
    handleBudgetAdded,
    handleBudgetUpdated,
    
    // Budget actions
    editBudget,
    duplicateBudget,
    deleteBudget,
    
    // Year management
    addNewYear,
    copyFromPreviousYear,
    
    // Multi-year functionality
    multiYearPreview,
    handleMultiYearToggle,
    validateMultiYearSettings,
    updateMultiYearPreview,
    getAvailableYears,
    getAvailableEndYears,
    getMultiYearRecurrenceOptions,
    watchYearChanges
  }
} 