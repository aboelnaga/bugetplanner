// Budget modals composable
// Modal state management, form handling logic, validation functions

import { ref, watch } from 'vue'
import { 
  BUDGET_TYPES, 
  RECURRENCE_TYPES, 
  INVESTMENT_DIRECTIONS, 
  SCHEDULE_PATTERNS,
  DEFAULT_VALUES 
} from '@/constants/budgetConstants.js'
import { dateUtils, validationHelpers } from '@/utils/budgetUtils.js'

export function useBudgetModals(budgetStore, selectedYear, currentYear, currentMonth) {
  // Modal state
  const showAddBudgetModal = ref(false)
  const showEditBudgetModal = ref(false)
  const showHistoryModal = ref(false)
  const editingBudget = ref(null)
  const isLoading = ref(false)

  // Form data
  const formData = ref({ ...DEFAULT_VALUES.FORM_DATA })

  // Initialize form data
  const initializeFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
    }
  }

  // Reset form data
  const resetFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
    }
  }

  // Update category when type changes
  const updateCategoryOnTypeChange = () => {
    formData.value.category = DEFAULT_VALUES.CATEGORIES_BY_TYPE[formData.value.type]
    
    // Reset start month based on selected year
    formData.value.startMonth = dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
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
        schedule = SCHEDULE_PATTERNS[RECURRENCE_TYPES.QUARTERLY].filter(quarter => quarter >= startMonth)
        break
      case RECURRENCE_TYPES.BI_ANNUAL:
        // Start from the first bi-annual period that includes or comes after startMonth
        schedule = SCHEDULE_PATTERNS[RECURRENCE_TYPES.BI_ANNUAL].filter(month => month >= startMonth)
        break
      case RECURRENCE_TYPES.SCHOOL_TERMS:
        // Start from the first school term that includes or comes after startMonth
        schedule = SCHEDULE_PATTERNS[RECURRENCE_TYPES.SCHOOL_TERMS].filter(month => month >= startMonth)
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
  }

  const closeEditBudgetModal = () => {
    showEditBudgetModal.value = false
    editingBudget.value = null
  }

  const openHistoryModal = () => {
    showHistoryModal.value = true
  }

  const closeHistoryModal = () => {
    showHistoryModal.value = false
  }

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
  }

  const duplicateBudget = async (budget) => {
    // Create a copy of the budget item
    const budgetData = {
      name: budget.name + ' (Copy)',
      type: budget.type,
      category: budget.category,
      recurrence: budget.recurrence,
      default_amount: budget.defaultAmount || 0,
      amounts: [...budget.amounts],
      schedule: [...budget.schedule],
      investment_direction: budget.investment_direction,
      start_month: budget.startMonth
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
    if (selectedYear.value > currentYear.value) {
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
    if (selectedYear.value === currentYear.value) {
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
    } else if (selectedYear.value < currentYear.value) {
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
    showHistoryModal,
    editingBudget,
    isLoading,
    formData,
    
    // Modal actions
    openAddBudgetModal,
    closeAddBudgetModal,
    openEditBudgetModal,
    closeEditBudgetModal,
    openHistoryModal,
    closeHistoryModal,
    
    // Form handlers
    handleBudgetAdded,
    handleBudgetUpdated,
    updateCategoryOnTypeChange,
    ensureValidStartMonth,
    generateSchedule,
    resetFormData,
    
    // Budget actions
    editBudget,
    duplicateBudget,
    deleteBudget,
    
    // Year management
    addNewYear,
    copyFromPreviousYear
  }
} 