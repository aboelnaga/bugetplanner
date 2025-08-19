// Budget modals composable
// Modal state management, form handling logic, validation functions

import { ref, watch } from 'vue'
import { 
  BUDGET_TYPES, 
  RECURRENCE_LABELS,
  INVESTMENT_DIRECTIONS, 
  SCHEDULE_PATTERNS,
  DEFAULT_VALUES,
  CATEGORIES_BY_TYPE,
  DATABASE_LIMITS,
  MULTI_YEAR_CONSTANTS,
  FREQUENCY_TYPES,
  FREQUENCY_LABELS,
  RECURRENCE_INTERVALS,
  MONTH_OPTIONS,
  END_TYPES,
  END_TYPE_LABELS
} from '@/constants/budgetConstants.js'
import { dateUtils, validationHelpers, scheduleUtils, formatCurrency } from '@/utils/budgetUtils.js'

export function useBudgetModals(budgetStore, selectedYear, currentYear, currentMonth, toastFunction = null) {
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

  // Helper function to show toast if available
  const showToast = (severity, summary, detail, life = 5000) => {
    if (toastFunction && typeof toastFunction === 'function') {
      toastFunction({ severity, summary, detail, life })
    } else if (window.$toaster) {
      // Fallback to old toaster for backward compatibility
      const method = severity === 'error' ? 'error' : severity === 'warn' ? 'warning' : severity
      window.$toaster[method](summary, detail)
    }
  }

  // Initialize form data
  const initializeFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      // New recurrence system defaults
      frequency: FREQUENCY_TYPES.REPEATS, // DEFAULT: Repeats monthly
      recurrenceInterval: 1, // DEFAULT: 1 month (monthly)
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value),
      startYear: selectedYear.value,
      endMonth: 11, // DEFAULT: December
      endYear: selectedYear.value, // DEFAULT: Current year
      endType: END_TYPES.SPECIFIC_DATE, // DEFAULT: End on specific date
      occurrences: 12, // DEFAULT: 12 occurrences
      // Once frequency fields (new)
      oneTimeMonth: currentMonth.value, // DEFAULT: Current month
      oneTimeYear: currentYear.value, // DEFAULT: Current year
      // Auto-detect multi-year (no checkbox needed)
      is_multi_year: false // Will be computed based on start/end years
    }
    
    // Set default category based on budget type
    const categories = getCategoriesByType(formData.value.type)
    if (categories.length > 0) {
      formData.value.category = categories[0]
    }
    
    updateMultiYearPreview()
  }

  // Reset form data
  const resetFormData = () => {
    formData.value = {
      ...DEFAULT_VALUES.FORM_DATA,
      // New recurrence system defaults
      frequency: FREQUENCY_TYPES.REPEATS, // DEFAULT: Repeats monthly
      recurrenceInterval: 1, // DEFAULT: 1 month (monthly)
      startMonth: dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value),
      startYear: selectedYear.value,
      endMonth: 11, // DEFAULT: December
      endYear: selectedYear.value, // DEFAULT: Current year
      endType: END_TYPES.SPECIFIC_DATE, // DEFAULT: End on specific date
      occurrences: 12, // DEFAULT: 12 occurrences
      // Once frequency fields (new)
      oneTimeMonth: currentMonth.value, // DEFAULT: Current month
      oneTimeYear: currentYear.value, // DEFAULT: Current year
      // Auto-detect multi-year (no checkbox needed)
      is_multi_year: false // Will be computed based on start/end years
    }
    
    // Set default category based on budget type
    const categories = getCategoriesByType(formData.value.type)
    if (categories.length > 0) {
      formData.value.category = categories[0]
    }
    
    updateMultiYearPreview()
  }



  // Multi-year calculation functions
  const updateMultiYearPreview = () => {
    // Auto-detect if this is multi-year based on frequency type and start/end years
    let isMultiYear = false
    let calculatedEndYear = formData.value.endYear
    let calculatedEndMonth = formData.value.endMonth
    
    console.log('updateMultiYearPreview called with:', {
      frequency: formData.value.frequency,
      endType: formData.value.endType,
      startMonth: formData.value.startMonth,
      startYear: formData.value.startYear,
      occurrences: formData.value.occurrences,
      recurrenceInterval: formData.value.recurrenceInterval
    })
    
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
      if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
        isMultiYear = formData.value.endYear > formData.value.startYear
      } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
        // For occurrences, calculate the actual end date
        let currentMonth = formData.value.startMonth
        let currentYear = formData.value.startYear
        let occurrenceCount = 0
        
        console.log('Starting occurrence calculation:', {
          startMonth: currentMonth,
          startYear: currentYear,
          occurrences: formData.value.occurrences,
          interval: formData.value.recurrenceInterval
        })
        
        while (occurrenceCount < formData.value.occurrences) {
          // First occurrence is the start month itself
          if (occurrenceCount === 0) {
            // Don't add interval for the first occurrence
          } else {
            // For 1 occurrence, we don't need to move to next occurrence
            if (formData.value.occurrences === 1) {
              // Single occurrence - stay at start month/year
              currentMonth = formData.value.startMonth
              currentYear = formData.value.startYear
            } else {
              // Move to next occurrence
              currentMonth += formData.value.recurrenceInterval
              
              // Handle year rollover
              while (currentMonth >= 12) {
                currentMonth -= 12
                currentYear++
              }
            }
          }
          
          occurrenceCount++
          
          console.log(`Occurrence ${occurrenceCount}: month=${currentMonth}, year=${currentYear}`)
        }
        
        // Set the calculated end date
        calculatedEndYear = currentYear
        calculatedEndMonth = currentMonth
        
        console.log('Calculated end date:', {
          calculatedEndYear,
          calculatedEndMonth,
          isMultiYear: calculatedEndYear > formData.value.startYear
        })
        
        isMultiYear = calculatedEndYear > formData.value.startYear
      }
    } else {
      // For once and custom, it's never multi-year
      isMultiYear = false
    }
    
    // Update the formData field
    formData.value.is_multi_year = isMultiYear
    
    if (!isMultiYear) {
      multiYearPreview.value = {
        yearlyBreakdown: [],
        totalAmount: 0,
        duration: 0
      }
      return
    }

    const { startYear, defaultAmount, frequency, recurrenceInterval, endType, occurrences } = formData.value
    
    if (!startYear || !calculatedEndYear) {
      multiYearPreview.value = {
        yearlyBreakdown: [],
        totalAmount: 0,
        duration: 0
      }
      return
    }

    // Generate yearly breakdown for the new frequency system
    const yearlyBreakdown = generateYearlyBreakdown(startYear, calculatedEndYear, formData.value.startMonth, calculatedEndMonth, defaultAmount, frequency, recurrenceInterval, endType, occurrences)
    
    // Calculate total amount
    const totalAmount = yearlyBreakdown.reduce((sum, year) => sum + year.amount, 0)

    console.log('Final multi-year preview:', {
      startYear,
      calculatedEndYear,
      duration: calculatedEndYear - startYear + 1,
      totalAmount,
      yearlyBreakdown: yearlyBreakdown.map(y => ({ year: y.year, amount: y.amount, monthsCount: y.monthsCount }))
    })

    multiYearPreview.value = {
      yearlyBreakdown,
      totalAmount,
      duration: calculatedEndYear - startYear + 1
    }
  }

  // Generate yearly breakdown for new frequency system
  const generateYearlyBreakdown = (startYear, endYear, startMonth, endMonth, defaultAmount, frequency, recurrenceInterval, endType, occurrences) => {
    const breakdown = []
    
    for (let year = startYear; year <= endYear; year++) {
      let yearlyAmount = 0
      let monthlyAmounts = new Array(12).fill(0)
      let monthsCount = 0
      const isFirstYear = year === startYear
      const isLastYear = year === endYear
      
      if (frequency === FREQUENCY_TYPES.REPEATS) {
        if (endType === END_TYPES.SPECIFIC_DATE) {
          // Calculate monthly amounts for this year using interval-based scheduling
          let currentMonth = startMonth
          let currentYear = startYear
          
          while (currentYear <= endYear) {
            if (currentYear === year) {
              // Check if this month is within the valid range for this year
              let isValidMonth = true
              
              if (currentYear === startYear && currentMonth < startMonth) {
                isValidMonth = false
              }
              
              if (currentYear === endYear && currentMonth > endMonth) {
                isValidMonth = false
              }
              
              if (isValidMonth && currentMonth >= 0 && currentMonth < 12) {
                monthlyAmounts[currentMonth] = defaultAmount
                yearlyAmount += defaultAmount
                monthsCount++
              }
            }
            
            // Move to next occurrence
            currentMonth += recurrenceInterval
            
            // Handle year rollover
            while (currentMonth >= 12) {
              currentMonth -= 12
              currentYear++
            }
            
            // Stop if we've passed the end year
            if (currentYear > endYear) {
              break
            }
          }
        } else if (endType === END_TYPES.AFTER_OCCURRENCES) {
          // Calculate occurrences that fall in this year
          let currentMonth = startMonth
          let currentYear = startYear
          let occurrenceCount = 0
          
          while (occurrenceCount < occurrences) {
            if (currentYear === year) {
              if (currentMonth >= 0 && currentMonth < 12) {
                monthlyAmounts[currentMonth] = defaultAmount
                yearlyAmount += defaultAmount
                monthsCount++
              }
            }
            
            // For 1 occurrence, we don't need to move to next occurrence
            if (occurrences === 1) {
              // Single occurrence - stay at start month/year
              currentMonth = startMonth
              currentYear = startYear
            } else {
              // Move to next occurrence
              currentMonth += recurrenceInterval
              
              // Handle year rollover
              while (currentMonth >= 12) {
                currentMonth -= 12
                currentYear++
              }
            }
            
            occurrenceCount++
          }
        }
      }
      
      breakdown.push({
        year,
        amount: yearlyAmount,
        monthlyAmounts,
        monthsCount,
        isFirstYear,
        isLastYear
      })
    }
    
    return breakdown
  }

  // Validate multi-year settings
  const validateMultiYearSettings = () => {
    const errors = []
    
    if (!formData.value.is_multi_year) return errors

    const { startYear, endYear } = formData.value

    if (!startYear || !endYear) {
      errors.push('Start year and end year are required for multi-year budgets')
      return errors
    }

    if (startYear > endYear) {
      errors.push('Start year cannot be after end year')
    }

    if (endYear - startYear + 1 > MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS) {
      errors.push(`Multi-year duration cannot exceed ${MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS} years`)
    }

    if (endYear - startYear + 1 < MULTI_YEAR_CONSTANTS.MIN_DURATION_YEARS) {
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

  // Update schedule when frequency changes
  const updateSchedule = () => {
    console.log('updateSchedule called with formData:', formData.value)
    
    // Reset custom selections when frequency changes (but preserve if already set)
    if (formData.value.frequency !== FREQUENCY_TYPES.CUSTOM) {
      // Only reset if not already set
      if (!formData.value.customMonths || formData.value.customMonths.length === 0) {
        formData.value.customMonths = []
      }
    }
    if (formData.value.frequency !== FREQUENCY_TYPES.ONCE) {
      // Only reset if not already set
      if (formData.value.oneTimeMonth === undefined || formData.value.oneTimeMonth === null) {
        formData.value.oneTimeMonth = 0
      }
    }
    
    // Set appropriate defaults based on frequency type
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
      // For repeats: only set defaults if not already set
      if (formData.value.startMonth === undefined || formData.value.startMonth === null) {
        formData.value.startMonth = dateUtils.getDefaultStartMonth(selectedYear.value, currentYear.value, currentMonth.value)
      }
      if (formData.value.startYear === undefined || formData.value.startYear === null) {
        formData.value.startYear = selectedYear.value
      }
      if (formData.value.endMonth === undefined || formData.value.endMonth === null) {
        formData.value.endMonth = 11 // December
      }
      if (formData.value.endYear === undefined || formData.value.endYear === null) {
        formData.value.endYear = selectedYear.value // Current year
      }
      if (formData.value.endType === undefined || formData.value.endType === null) {
        formData.value.endType = END_TYPES.SPECIFIC_DATE
      }
      if (formData.value.occurrences === undefined || formData.value.occurrences === null) {
        formData.value.occurrences = 12
      }
      
      // Only validate start month for repeats frequency
      ensureValidStartMonth()
    } else if (formData.value.frequency === FREQUENCY_TYPES.ONCE) {
      // For once: set one-time month and year to current values only if not already set
      if (formData.value.oneTimeMonth === undefined || formData.value.oneTimeMonth === null) {
        formData.value.oneTimeMonth = currentMonth.value
      }
      if (formData.value.oneTimeYear === undefined || formData.value.oneTimeYear === null) {
        formData.value.oneTimeYear = currentYear.value
      }
      // Clear start/end dates as they're not needed
      formData.value.startMonth = 0
      formData.value.startYear = selectedYear.value
      formData.value.endMonth = 0
      formData.value.endYear = selectedYear.value
      formData.value.endType = END_TYPES.SPECIFIC_DATE
      formData.value.occurrences = 1
    } else if (formData.value.frequency === FREQUENCY_TYPES.CUSTOM) {
      // For custom: clear custom months only if not already set
      if (!formData.value.customMonths || formData.value.customMonths.length === 0) {
        formData.value.customMonths = []
      }
      // Clear start/end dates as they're not needed
      formData.value.startMonth = 0
      formData.value.startYear = selectedYear.value
      formData.value.endMonth = 0
      formData.value.endYear = selectedYear.value
      formData.value.endType = END_TYPES.SPECIFIC_DATE
      formData.value.occurrences = 1
    }
    
    updateMultiYearPreview()
  }

  // Update legacy recurrence field (for date changes) - now simplified
  const updateLegacyRecurrence = () => {
    // No longer need legacy conversion - using new frequency system directly
    
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
    console.log('generateSchedule called with:')
    console.log('- frequency:', formData.value.frequency)
    console.log('- startMonth:', formData.value.startMonth)
    console.log('- startYear:', formData.value.startYear)
    console.log('- endMonth:', formData.value.endMonth)
    console.log('- endYear:', formData.value.endYear)
    console.log('- recurrenceInterval:', formData.value.recurrenceInterval)
    console.log('- endType:', formData.value.endType)
    console.log('- occurrences:', formData.value.occurrences)
    
    let schedule = []
    let amounts = new Array(12).fill(0)
    
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
      console.log('Generating repeating schedule...')
      if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
        // Generate schedule for specific date range
        schedule = generateRepeatingSchedule(
          formData.value.startMonth,
          formData.value.startYear,
          formData.value.endMonth,
          formData.value.endYear,
          formData.value.recurrenceInterval
        )
      } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
        // Generate schedule for specific number of occurrences
        schedule = generateOccurrenceSchedule(
          formData.value.startMonth,
          formData.value.startYear,
          formData.value.recurrenceInterval,
          formData.value.occurrences
        )
      }
      console.log('Generated repeating schedule:', schedule)
    } else if (formData.value.frequency === FREQUENCY_TYPES.ONCE) {
      console.log('Generating once schedule...')
      schedule = [formData.value.oneTimeMonth]
      console.log('Generated once schedule:', schedule)
    } else if (formData.value.frequency === FREQUENCY_TYPES.CUSTOM) {
      console.log('Generating custom schedule...')
      schedule = [...formData.value.customMonths]
      console.log('Generated custom schedule:', schedule)
    } else {
      console.log('No valid frequency, returning empty schedule')
    }
    
    // Populate amounts array
    schedule.forEach(month => {
      if (month >= 0 && month < 12) {
        amounts[month] = formData.value.defaultAmount
      }
    })
    
    console.log('Final amounts array:', amounts)
    return { schedule, amounts }
  }

  // Generate repeating schedule for specific date range
  const generateRepeatingSchedule = (startMonth, startYear, endMonth, endYear, interval) => {
    const schedule = []
    const selectedYearValue = selectedYear.value
    
    console.log('generateRepeatingSchedule called with:', {
      startMonth,
      startYear,
      endMonth,
      endYear,
      interval,
      selectedYearValue
    })
    
    // Calculate the actual schedule based on interval
    let currentMonth = startMonth
    let currentYear = startYear
    
    console.log('Starting calculation with currentMonth:', currentMonth, 'currentYear:', currentYear)
    
    while (currentYear <= endYear) {
      // Check if this occurrence falls in the budget's year range
      if (currentYear >= startYear && currentYear <= endYear) {
        // Check if this month is within the valid range for this year
        let isValidMonth = true
        
        if (currentYear === startYear && currentMonth < startMonth) {
          isValidMonth = false
          console.log('Invalid month: currentMonth < startMonth', currentMonth, '<', startMonth)
        }
        
        if (currentYear === endYear && currentMonth > endMonth) {
          isValidMonth = false
          console.log('Invalid month: currentMonth > endMonth', currentMonth, '>', endMonth)
        }
        
        if (isValidMonth && currentMonth >= 0 && currentMonth < 12) {
          schedule.push(currentMonth)
          console.log('Added month to schedule:', currentMonth)
        }
      }
      
      // Move to next occurrence
      currentMonth += interval
      
      // Handle year rollover
      while (currentMonth >= 12) {
        currentMonth -= 12
        currentYear++
      }
      
      // Stop if we've passed the end year
      if (currentYear > endYear) {
        break
      }
    }
    
    console.log('Final schedule:', schedule)
    return schedule
  }

  // Generate schedule for specific number of occurrences
  const generateOccurrenceSchedule = (startMonth, startYear, interval, occurrences) => {
    const schedule = []
    const selectedYearValue = selectedYear.value
    
    console.log('generateOccurrenceSchedule called with:', {
      startMonth,
      startYear,
      interval,
      occurrences,
      selectedYearValue
    })
    
    let currentMonth = startMonth
    let currentYear = startYear
    let occurrenceCount = 0
    
    while (occurrenceCount < occurrences) {
      // Add to schedule if this occurrence falls in the selected year
      if (currentYear === selectedYearValue && currentMonth >= 0 && currentMonth < 12) {
        schedule.push(currentMonth)
        console.log('Added month to schedule:', currentMonth, 'for year:', currentYear)
      }
      
      // For 1 occurrence, we don't need to move to next occurrence
      if (occurrences === 1) {
        // Single occurrence - stay at start month/year
        currentMonth = startMonth
        currentYear = startYear
      } else {
        // Move to next occurrence
        currentMonth += interval
        
        // Handle year rollover
        while (currentMonth >= 12) {
          currentMonth -= 12
          currentYear++
        }
      }
      
      occurrenceCount++
    }
    
    console.log('Final schedule:', schedule)
    return schedule
  }

  // Get schedule preview class
  const getSchedulePreviewClass = (monthIndex) => {
    const { schedule } = generateSchedule()
    
    if (schedule.includes(monthIndex)) {
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    } else {
      return 'bg-gray-100 text-gray-500'
    }
  }

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (formData.value.is_multi_year) {
      return multiYearPreview.value.totalAmount
    }
    
    const { schedule } = generateSchedule()
    return schedule.length * formData.value.defaultAmount
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
        showToast('warn', 'Amount Limit', `Amount cannot exceed ${DATABASE_LIMITS.MAX_AMOUNT_FORMATTED} due to database limitations.`)
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
    
    console.log('Validating form data:', {
      name: formData.value.name,
      defaultAmount: formData.value.defaultAmount,
      frequency: formData.value.frequency,
      oneTimeMonth: formData.value.oneTimeMonth,
      oneTimeYear: formData.value.oneTimeYear,
      customMonths: formData.value.customMonths,
      recurrenceInterval: formData.value.recurrenceInterval,
      startYear: formData.value.startYear,
      endYear: formData.value.endYear,
      startMonth: formData.value.startMonth,
      endMonth: formData.value.endMonth,
      currentYear: currentYear.value,
      currentMonth: currentMonth.value
    })
    
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
    
    // Validate new recurrence system
    if (formData.value.frequency === FREQUENCY_TYPES.CUSTOM && formData.value.customMonths.length === 0) {
      errors.push('Please select at least one custom month')
    }
    
    if (formData.value.frequency === FREQUENCY_TYPES.ONCE && formData.value.oneTimeMonth === undefined) {
      errors.push('Please select a month for one-time frequency')
    }
    
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS && !formData.value.recurrenceInterval) {
      errors.push('Please select a recurrence interval')
    }

    // Validate date ranges
    if (formData.value.startYear > formData.value.endYear) {
      errors.push('Start year cannot be after end year')
    }
    
    if (formData.value.startYear === formData.value.endYear && formData.value.startMonth > formData.value.endMonth) {
      errors.push('Start month cannot be after end month in the same year')
    }

    // Validate start month for current year (only for repeats frequency)
    if (formData.value.frequency === FREQUENCY_TYPES.REPEATS && 
        formData.value.startYear === currentYear.value && 
        formData.value.startMonth < currentMonth.value) {
      errors.push('Start month cannot be in the past for the current year')
    }
    
    // Validate one-time month for current year
    if (formData.value.frequency === FREQUENCY_TYPES.ONCE && 
        formData.value.oneTimeYear === currentYear.value && 
        formData.value.oneTimeMonth < currentMonth.value) {
      errors.push('One-time month cannot be in the past for the current year')
    }

    // Multi-year validation
    const multiYearErrors = validateMultiYearSettings()
    errors.push(...multiYearErrors)
    
    console.log('Validation errors:', errors)
    return errors
  }

  // Create budget data object for submission
  const createBudgetData = () => {
    console.log('createBudgetData called with formData:', formData.value)
    console.log('formData.startMonth:', formData.value.startMonth)
    console.log('formData.startYear:', formData.value.startYear)
    console.log('formData.endMonth:', formData.value.endMonth)
    console.log('formData.endYear:', formData.value.endYear)
    
    const { schedule, amounts } = generateSchedule()

    const baseData = {
      name: formData.value.name,
      type: formData.value.type,
      category: formData.value.category,
      // New recurrence system fields
      frequency: formData.value.frequency,
      recurrence_interval: formData.value.recurrenceInterval,
      start_month: formData.value.startMonth,
      start_year: formData.value.startYear,
      end_month: formData.value.endMonth,
      end_year: formData.value.endYear,
      end_type: formData.value.endType,
      occurrences: formData.value.occurrences,
      one_time_month: formData.value.oneTimeMonth,
      one_time_year: formData.value.oneTimeYear,
      custom_months: formData.value.customMonths || [],
      // Legacy recurrence field (required by database schema)
      recurrence: 'monthly',
      // New frequency system fields
      default_amount: formData.value.defaultAmount,
      amounts: amounts,
      schedule: schedule,
      investment_direction: formData.value.investment_direction,
      payment_schedule: formData.value.payment_schedule,
      due_date: formData.value.due_date,
      is_fixed_expense: formData.value.is_fixed_expense,
      reminder_enabled: formData.value.reminder_enabled,
      reminder_days_before: formData.value.reminder_days_before,
      linked_investment_id: formData.value.linked_investment_id || null
    }

    console.log('baseData created:', baseData)
    console.log('baseData.start_month:', baseData.start_month)
    console.log('baseData.start_year:', baseData.start_year)
    console.log('baseData.end_month:', baseData.end_month)
    console.log('baseData.end_year:', baseData.end_year)

    // Add multi-year fields if enabled
    if (formData.value.is_multi_year) {
      baseData.is_multi_year = true
      baseData.start_year = formData.value.startYear
      baseData.end_year = formData.value.endYear
      baseData.end_month = formData.value.endMonth
    }

    return baseData
  }

  // Handle form submission for add modal
  const handleAddSubmit = async () => {
    console.log('handleAddSubmit called')
    try {
      isLoading.value = true
      console.log('isLoading set to true')
      
      const errors = validateFormData()
      console.log('Validation completed, errors:', errors)
      if (errors.length > 0) {
        console.log('Validation errors found, showing alert')
        showToast('error', 'Validation Error', 'Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      const budgetData = createBudgetData()
      console.log('Adding budget item with data:', budgetData)
      
      let result
      if (formData.value.is_multi_year) {
        // Create multiple budget items for multi-year
        console.log('Creating multi-year budget item')
        result = await budgetStore.addMultiYearBudgetItem(budgetData)
      } else {
        // Create single budget item
        console.log('Creating single budget item')
        result = await budgetStore.addBudgetItem(budgetData)
      }
      
      console.log('Store result:', result)
      
      if (result) {
        console.log('Budget item created successfully, resetting form')
        resetFormData()
        return result
      } else {
        console.log('Failed to create budget item')
        showToast('error', 'Add Budget Failed', 'Failed to add budget item. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error adding budget item:', error)
      showToast('error', 'Add Budget Failed', 'Error adding budget item: ' + (error.message || 'Unknown error'))
      return false
    } finally {
      console.log('Setting isLoading to false')
      isLoading.value = false
    }
  }

  // Handle form submission for edit modal
  const handleEditSubmit = async (budgetId) => {
    try {
      isLoading.value = true
      
      const errors = validateFormData()
      console.log('Validation errors:', errors)
      if (errors.length > 0) {
        console.log('Please fix the following errors:\n' + errors.join('\n'))
        showToast('error', 'Validation Error', 'Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      // Get the existing budget
      const budget = budgetStore.budgetItems.find(item => item.id === budgetId)
      if (!budget) {
        console.error('Budget not found:', budgetId)
        return false
      }

      console.log('Updating existing budget:', budgetId)
      
      // Update existing budget
      const updatedBudget = {
        ...budget,
        name: formData.value.name,
        type: formData.value.type,
        category: formData.value.category,
        default_amount: parseFloat(formData.value.defaultAmount),
        linked_investment_id: formData.value.linked_investment_id || null,
        frequency: formData.value.frequency,
        recurrence_interval: formData.value.frequency === FREQUENCY_TYPES.REPEATS ? formData.value.recurrenceInterval : null,
        start_month: formData.value.frequency === FREQUENCY_TYPES.REPEATS ? formData.value.startMonth : null,
        start_year: formData.value.frequency === FREQUENCY_TYPES.REPEATS ? formData.value.startYear : null,
        end_type: formData.value.frequency === FREQUENCY_TYPES.REPEATS ? formData.value.endType : null,
        end_month: formData.value.frequency === FREQUENCY_TYPES.REPEATS && formData.value.endType === END_TYPES.SPECIFIC_DATE ? formData.value.endMonth : null,
        end_year: formData.value.frequency === FREQUENCY_TYPES.REPEATS && formData.value.endType === END_TYPES.SPECIFIC_DATE ? formData.value.endYear : null,
        occurrences: formData.value.frequency === FREQUENCY_TYPES.REPEATS && formData.value.endType === END_TYPES.AFTER_OCCURRENCES ? formData.value.occurrences : null,
        one_time_month: formData.value.frequency === FREQUENCY_TYPES.ONCE ? formData.value.oneTimeMonth : null,
        one_time_year: formData.value.frequency === FREQUENCY_TYPES.ONCE ? formData.value.oneTimeYear : null,
        custom_months: formData.value.frequency === FREQUENCY_TYPES.CUSTOM ? formData.value.customMonths : null,
        // Add multi-year flag
        is_multi_year: formData.value.endYear > formData.value.startYear
      }
      
      console.log('Updated budget data:', updatedBudget)
      const result = await budgetStore.updateBudgetItem(budgetId, updatedBudget)
      console.log('Update result:', result)
      return result
    } catch (e) {
      console.log('Error in handleEditSubmit: ' + (e?.message || e));
      console.error('Error in handleEditSubmit:', e);
      return false;
    } finally {
      isLoading.value = false
    }
  }

  // Helper function for updating multi-year budgets
  const handleMultiYearEditSubmit = async (budgetId) => {
    try {
      console.log('handleMultiYearEditSubmit called with budgetId:', budgetId)
      
      const budget = budgetStore.budgetItems.find(item => item.id === budgetId)
      if (!budget || !budget.linked_group_id) {
        console.error('Invalid multi-year budget item or missing linked_group_id')
        showToast('error', 'Invalid Multi-Year Budget', 'Invalid multi-year budget item')
        return false
      }

      console.log('Found budget:', budget)
      console.log('Linked group ID:', budget.linked_group_id)

      // Validate multi-year settings
      const multiYearErrors = validateMultiYearSettings()
      if (multiYearErrors.length > 0) {
        console.error('Multi-year validation errors:', multiYearErrors)
        showToast('error', 'Multi-Year Validation Error', 'Please fix the following multi-year errors:\n' + multiYearErrors.join('\n'))
        return false
      }

      // Create update data for multi-year budget
      const updateData = {
        name: formData.value.name,
        type: formData.value.type,
        category: formData.value.category,
        // New recurrence system fields
        frequency: formData.value.frequency,
        recurrence_interval: formData.value.recurrenceInterval,
        start_month: formData.value.startMonth,
        start_year: formData.value.startYear,
        end_month: formData.value.endMonth,
        end_year: formData.value.endYear,
        end_type: formData.value.endType,
        occurrences: formData.value.occurrences,
        one_time_year: formData.value.oneTimeYear,
        custom_months: formData.value.customMonths,
        // Legacy fields for backward compatibility
        recurrence: formData.value.recurrence,
        default_amount: formData.value.defaultAmount,
        payment_schedule: formData.value.payment_schedule,
        due_date: formData.value.due_date,
        is_fixed_expense: formData.value.is_fixed_expense,
        reminder_enabled: formData.value.reminder_enabled,
        reminder_days_before: formData.value.reminder_days_before,
        linked_investment_id: formData.value.linked_investment_id || null,
        // Multi-year specific fields
        is_multi_year: formData.value.is_multi_year
      }

      if (formData.value.type === 'investment') {
        updateData.investment_direction = formData.value.investment_direction
      }

      console.log('Composable: Updating multi-year budget with data:', updateData)
      console.log('Composable: Form data frequency:', formData.value.frequency)
      console.log('Composable: Form data recurrenceInterval:', formData.value.recurrenceInterval)
      console.log('Composable: Form data startMonth:', formData.value.startMonth)
      console.log('Composable: Form data endMonth:', formData.value.endMonth)
      console.log('Composable: Form data endType:', formData.value.endType)
      console.log('Composable: Form data occurrences:', formData.value.occurrences)
      
      // Update all linked items using the store function
      const result = await budgetStore.updateMultiYearBudgetItems(budget.linked_group_id, updateData)
      console.log('Multi-year update result:', result)
      
      if (result) {
        return result
      } else {
        showToast('error', 'Update Multi-Year Budget Failed', 'Failed to update multi-year budget. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error updating multi-year budget:', error)
      showToast('error', 'Update Multi-Year Budget Failed', 'Error updating multi-year budget: ' + (error.message || 'Unknown error'))
      return false
    }
  }

  // Helper function for converting single year to multi-year
  const handleSingleYearToMultiYearConversion = async (budgetId) => {
    try {
      console.log('Converting single year to multi-year budget')
      
      // Validate multi-year settings
      const multiYearErrors = validateMultiYearSettings()
      if (multiYearErrors.length > 0) {
        showToast('error', 'Multi-Year Validation Error', 'Please fix the following multi-year errors:\n' + multiYearErrors.join('\n'))
        return false
      }

      // Create multi-year budget data
      const budgetData = {
        name: formData.value.name,
        type: formData.value.type,
        category: formData.value.category,
        default_amount: formData.value.defaultAmount,
        // New recurrence system fields
        frequency: formData.value.frequency,
        recurrence_interval: formData.value.recurrenceInterval,
        start_month: formData.value.startMonth,
        start_year: formData.value.startYear,
        end_month: formData.value.endMonth,
        end_year: formData.value.endYear,
        end_type: formData.value.endType,
        occurrences: formData.value.occurrences,
        one_time_year: formData.value.oneTimeYear,
        custom_months: formData.value.customMonths,
        // Legacy fields for backward compatibility
        recurrence: formData.value.recurrence,
        payment_schedule: formData.value.payment_schedule,
        due_date: formData.value.due_date,
        is_fixed_expense: formData.value.is_fixed_expense,
        reminder_enabled: formData.value.reminder_enabled,
        reminder_days_before: formData.value.reminder_days_before,
        linked_investment_id: formData.value.linked_investment_id || null,
        // Multi-year specific fields
        is_multi_year: true
      }

      if (formData.value.type === 'investment') {
        budgetData.investment_direction = formData.value.investment_direction
      }

      console.log('Converting to multi-year with data:', budgetData)
      
      try {
        // Use the store function to create multi-year budget
        const result = await budgetStore.addMultiYearBudgetItem(budgetData)
        console.log('Multi-year conversion result:', result)
        
        if (result && result.length > 0) {
          console.log('Successfully created multi-year budget, deleting original item')
          // Delete the original single year item
          const deleteResult = await budgetStore.deleteBudgetItem(budgetId)
          console.log('Delete original item result:', deleteResult)
          return result
        } else {
          console.error('addMultiYearBudgetItem returned falsy or empty result')
          showToast('error', 'Convert to Multi-Year Failed', 'Failed to convert to multi-year budget. Please try again.')
          return false
        }
      } catch (conversionError) {
        console.error('Error in addMultiYearBudgetItem:', conversionError)
        throw conversionError
      }
    } catch (error) {
      console.error('Error converting to multi-year budget:', error)
      showToast('error', 'Convert to Multi-Year Failed', 'Error converting to multi-year budget: ' + (error.message || 'Unknown error'))
      return false
    }
  }

  // Helper function for converting multi-year to single year
  const handleMultiYearToSingleYearConversion = async (budgetId) => {
    try {
      console.log('Converting multi-year to single year budget')
      
      // Get the original budget to find the linked group
      const budget = budgetStore.budgetItems.find(item => item.id === budgetId)
      if (!budget || !budget.linked_group_id) {
        showToast('error', 'Invalid Multi-Year Budget', 'Invalid multi-year budget item')
        return false
      }

      // Create single year budget data
      const budgetData = {
        name: formData.value.name,
        type: formData.value.type,
        category: formData.value.category,
        default_amount: formData.value.defaultAmount,
        // New recurrence system fields
        frequency: formData.value.frequency,
        recurrence_interval: formData.value.recurrenceInterval,
        start_month: formData.value.startMonth,
        start_year: formData.value.startYear,
        end_month: formData.value.endMonth,
        end_year: formData.value.endYear,
        end_type: formData.value.endType,
        occurrences: formData.value.occurrences,
        one_time_year: formData.value.oneTimeYear,
        custom_months: formData.value.customMonths,
        // Legacy fields for backward compatibility
        recurrence: formData.value.recurrence,
        payment_schedule: formData.value.payment_schedule,
        due_date: formData.value.due_date,
        is_fixed_expense: formData.value.is_fixed_expense,
        reminder_enabled: formData.value.reminder_enabled,
        reminder_days_before: formData.value.reminder_days_before,
        linked_investment_id: formData.value.linked_investment_id || null,
        // Single year specific fields
        is_multi_year: false,
        year: formData.value.startYear
      }

      if (formData.value.type === 'investment') {
        budgetData.investment_direction = formData.value.investment_direction
      }

      console.log('Converting to single year with data:', budgetData)
      
      // Use the store function to create single year budget
      const result = await budgetStore.addBudgetItem(budgetData)
      console.log('Single year conversion result:', result)
      
      if (result) {
        // Delete the original multi-year group
        await budgetStore.deleteMultiYearBudget(budget)
        return result
      } else {
        showToast('error', 'Convert to Single Year Failed', 'Failed to convert to single year budget. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error converting to single year budget:', error)
      showToast('error', 'Convert to Single Year Failed', 'Error converting to single year budget: ' + (error.message || 'Unknown error'))
      return false
    }
  }

  // Helper function for updating single year budgets
  const handleSingleYearEditSubmit = async (budgetId) => {
    try {
      console.log('handleSingleYearEditSubmit called with budgetId:', budgetId)
      console.log('formData.value:', formData.value)
      
      // Preserve existing amounts and only update from start month onwards
      let newSchedule = []
      let newAmounts = [...(formData.value.amounts || [])] // Add null check
      
      console.log('Initial newAmounts:', newAmounts)
      
      // Calculate schedule with start month consideration
      const startMonth = formData.value.startMonth
      
      console.log('Start month:', startMonth)
      
      // Clear amounts from start month onwards first
      for (let i = startMonth; i < 12; i++) {
        newAmounts[i] = 0
      }
      
      const { schedule } = generateSchedule()
      newSchedule = schedule
      
      console.log('Generated schedule:', newSchedule)
      
      // Set amounts for scheduled months
      newSchedule.forEach(month => {
        newAmounts[month] = formData.value.defaultAmount
      })
      
      console.log('Final newAmounts:', newAmounts)
      
      // Create update data object
      const updateData = {
        name: formData.value.name,
        type: formData.value.type,
        category: formData.value.category,
        // New recurrence system fields
        frequency: formData.value.frequency,
        recurrence_interval: formData.value.recurrenceInterval,
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
      
      console.log('Updating single year budget item with data:', updateData)
      const result = await budgetStore.updateBudgetItem(budgetId, updateData)
      console.log('Store result:', result)
      
      if (result) {
        return result
      } else {
        showToast('error', 'Update Budget Failed', 'Failed to update budget item. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error updating single year budget:', error)
      showToast('error', 'Update Budget Failed', 'Error updating budget item: ' + (error.message || 'Unknown error'))
      return false
    }
  }

  // Initialize form data when budget prop changes (for edit modal)
  const initializeFormDataFromBudget = (budget) => {
    if (budget) {
      console.log('Initializing form data from budget:', budget)
      
      // Map the budget data to form data, handling null values properly
      formData.value = {
        // Basic fields
        id: budget.id || null,
        name: budget.name || '',
        type: budget.type || BUDGET_TYPES.EXPENSE,
        category: budget.category || '',
        defaultAmount: budget.default_amount || budget.defaultAmount || 0,
        
        // Frequency and recurrence
        frequency: budget.frequency || FREQUENCY_TYPES.REPEATS,
        recurrenceInterval: budget.recurrence_interval || budget.recurrenceInterval || 1,
        
        // Date fields - handle null values properly
        startMonth: budget.start_month !== null ? budget.start_month : 0,
        startYear: budget.start_year || budget.year || new Date().getFullYear(),
        endMonth: budget.end_month !== null ? budget.end_month : 11,
        endYear: budget.end_year || budget.year || new Date().getFullYear(),
        
        // End type and occurrences
        endType: budget.end_type || 'SPECIFIC_DATE',
        occurrences: budget.occurrences || 12,
        
        // One-time fields
        oneTimeMonth: budget.one_time_month !== null ? budget.one_time_month : 0,
        oneTimeYear: budget.one_time_year || budget.year || new Date().getFullYear(),
        
        // Custom fields
        customMonths: budget.custom_months ? [...budget.custom_months] : [],
        
        // Legacy fields (required by database schema)
        recurrence: budget.recurrence || 'monthly',
        amounts: budget.amounts ? [...budget.amounts] : [],
        schedule: budget.schedule ? [...budget.schedule] : [],
        
        // Payment schedule fields
        payment_schedule: budget.payment_schedule || 'throughout_month',
        due_date: budget.due_date || null,
        is_fixed_expense: budget.is_fixed_expense || false,
        reminder_enabled: budget.reminder_enabled || false,
        reminder_days_before: budget.reminder_days_before || 3,
        linked_investment_id: budget.linked_investment_id || null,
        
        // Investment fields
        investment_direction: budget.investment_direction || 'outgoing',
        
        // Multi-year fields
        is_multi_year: budget.is_multi_year || false
      }
      
      console.log('Form data initialized:', formData.value)
      
      // Update schedule preview
      updateSchedule()
    } else {
      console.log('Budget object is null, using default values')
      // Initialize with default values when budget is null
      formData.value = {
        id: null,
        name: '',
        type: BUDGET_TYPES.EXPENSE,
        category: '',
        defaultAmount: 0,
        frequency: FREQUENCY_TYPES.REPEATS,
        recurrenceInterval: 1,
        startMonth: 0, // Default to January
        startYear: new Date().getFullYear(),
        endMonth: 11, // Default to December
        endYear: new Date().getFullYear(),
        endType: 'SPECIFIC_DATE',
        occurrences: 12,
        oneTimeMonth: 0,
        oneTimeYear: new Date().getFullYear(),
        customMonths: [],
        // Legacy fields (required by database schema)
        recurrence: 'monthly',
        amounts: [],
        schedule: [],
        payment_schedule: 'throughout_month',
        due_date: null,
        is_fixed_expense: false,
        reminder_enabled: false,
        reminder_days_before: 3,
        linked_investment_id: null,
        investment_direction: 'outgoing',
        is_multi_year: false
      }
      
      console.log('Form data initialized with defaults:', formData.value)
      
      // Update schedule preview
      updateSchedule()
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
    // Check if this is a multi-year budget item
    if (budget.is_multi_year && budget.linked_group_id) {
      // For multi-year items, we need to fetch all linked items first
      const linkedItems = budgetStore.getLinkedBudgetItems(budget.linked_group_id)
      if (linkedItems.length > 0) {
        // Use the master item (first item) for editing
        const masterItem = linkedItems.find(item => item.is_master) || linkedItems[0]
        editingBudget.value = masterItem
        showEditBudgetModal.value = true
        initializeFormDataFromBudget(masterItem)
      } else {
        // Fallback to single item editing
        editingBudget.value = budget
        showEditBudgetModal.value = true
        initializeFormDataFromBudget(budget)
      }
    } else {
      // Single year budget item
      editingBudget.value = budget
      showEditBudgetModal.value = true
      initializeFormDataFromBudget(budget)
    }
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
    
    // Handle both single-year and multi-year results
    if (Array.isArray(budgetItem)) {
      // Multi-year budget - array of budget items
      const budgetName = budgetItem[0]?.name || 'Budget items'
      const years = budgetItem.map(item => item.year).sort((a, b) => a - b)
      const yearRange = years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]
      const message = `${budgetName} created for years ${yearRange}`
      console.log('Success message:', message)
      
      // Show success toast
      showToast('success', 'Multi-Year Budget Created', message)
    } else {
      // Single-year budget - single budget item
      const budgetName = budgetItem?.name || 'Budget item'
      const budgetYear = budgetItem?.year || selectedYear.value
      const currentViewYear = selectedYear.value
      
      let message = `Budget item "${budgetName}" created successfully`
      
      // If the budget was created for a different year than the current view
      if (budgetYear !== currentViewYear) {
        message += ` for ${budgetYear}`
        showToast('success', 'Budget Created', message)
      } else {
        // Same year, show normal success message
        showToast('success', 'Budget Created', message)
      }
    }
  }

  const handleBudgetUpdated = (budgetItem) => {
    console.log('Budget item updated successfully:', budgetItem)
    const budgetName = budgetItem?.name || 'Budget item'
    const message = `Budget item "${budgetName}" updated successfully`
    console.log('Success message:', message)
    
    // Show success toast
    showToast('success', 'Budget Updated', message)
  }

  // Budget actions
  const editBudget = async (budget) => {
    // Check if this is a multi-year budget item
    if (budget.is_multi_year && budget.linked_group_id) {
      // For multi-year items, we need to fetch all linked items first
      const linkedItems = budgetStore.getLinkedBudgetItems(budget.linked_group_id)
      if (linkedItems.length > 0) {
        // Use the master item (first item) for editing
        const masterItem = linkedItems.find(item => item.is_master) || linkedItems[0]
        editingBudget.value = masterItem
        showEditBudgetModal.value = true
        initializeFormDataFromBudget(masterItem)
      } else {
        // Fallback to single item editing
        editingBudget.value = budget
        showEditBudgetModal.value = true
        initializeFormDataFromBudget(budget)
      }
    } else {
      // Single year budget item
      editingBudget.value = budget
      showEditBudgetModal.value = true
      initializeFormDataFromBudget(budget)
    }
  }

  const duplicateBudget = async (budget) => {
    // Create a copy of the budget item
    const budgetData = {
      name: budget.name + ' (Copy)',
      type: budget.type,
      category: budget.category,
      // New recurrence system fields
      frequency: budget.frequency || FREQUENCY_TYPES.REPEATS,
      recurrence_interval: budget.recurrence_interval || 1,
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
    
    // Check if this is a multi-year budget item
    if (budget.is_multi_year && budget.linked_group_id) {
      // Handle multi-year budget deletion
      await deleteMultiYearBudget(budget)
    } else {
      // Handle single year budget deletion
      await deleteSingleYearBudget(budget)
    }
  }

  // Helper function for deleting multi-year budgets
  const deleteMultiYearBudget = async (budget) => {
    const linkedItems = budgetStore.getLinkedBudgetItems(budget.linked_group_id)
    const totalYears = linkedItems.length
    const yearsRange = `${budget.start_year} - ${budget.end_year}`
    
    // Check if any items have actual values
    const hasActualValues = linkedItems.some(item => 
      item.actual_amounts && item.actual_amounts.some(amount => amount > 0)
    )
    
    if (hasActualValues) {
      showToast('warn', 'Delete Multi-Year Budget Failed', `Cannot delete this multi-year budget (${yearsRange}) as it contains actual transaction data. Please clear all actual amounts first.`)
      return
    }
    
    // Check if any items have planned values for current/future months
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const hasPlannedValues = linkedItems.some(item => {
      if (item.year > currentYear) return true // Future year
      if (item.year === currentYear) {
        // Check if there are planned values for current month onwards
        return item.amounts && item.amounts.slice(currentMonth).some(amount => amount > 0)
      }
      return false
    })
    
    if (hasPlannedValues) {
      const confirmMessage = `This multi-year budget (${yearsRange}) contains planned values for current/future months. Are you sure you want to delete the entire ${totalYears}-year schedule?`
      if (!confirm(confirmMessage)) return
    } else {
      const confirmMessage = `Are you sure you want to delete this multi-year budget (${yearsRange})?`
      if (!confirm(confirmMessage)) return
    }
    
    // Delete all linked items
    await budgetStore.deleteMultiYearBudgetItems(budget.linked_group_id)
  }

  // Helper function for deleting single year budgets
  const deleteSingleYearBudget = async (budget) => {
    // Check if budget has any values for the whole year
    const hasAnyValues = budget.amounts.some(amount => amount > 0)
    
    // If it's a future year, allow full deletion
    if (selectedYear.value > currentYear) {
      if (confirm('Are you sure you want to delete this budget item?')) {
        await budgetStore.deleteBudgetItem(budget.id)
      }
      return
    }
    
    // If no values for the whole year, allow deletion
    if (!hasAnyValues) {
      if (confirm('Are you sure you want to delete this empty budget item?')) {
        await budgetStore.deleteBudgetItem(budget.id)
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
              await budgetStore.updateMonthlyAmount(budget.id, i, 0)
            }
          }
        }
      } else if (hasPastValues && !hasFutureValues) {
        // Has only past values - don't allow deletion
        showToast('warn', 'Delete Budget Failed', 'Cannot delete this budget item as it contains historical data and all future months are already empty.')
      } else if (!hasPastValues && hasFutureValues) {
        // Has only future values - allow full deletion
        if (confirm('Are you sure you want to delete this budget item? (It only contains future planning data)')) {
          await budgetStore.deleteBudgetItem(budget.id)
        }
      }
    } else if (selectedYear.value < currentYear) {
      // Past year with values - don't allow deletion
      showToast('warn', 'Delete Budget Failed', 'Cannot delete budget items from past years that contain data.')
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
        showToast('error', 'Copy Budget Failed', 'Failed to copy budget items. Please try again.')
      } else {
        showToast('success', 'Budget Copied', `Budget items copied from ${previousYear} to ${selectedYear.value} successfully.`)
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
    // Use startYear (new format) or start_year (legacy format) or current year as fallback
    const startYear = formData.value.startYear || formData.value.start_year || currentYear.value
    console.log('getAvailableEndYears - startYear:', startYear, 'formData:', formData.value)
    const years = []
    // Allow up to 20 years from start year
    for (let year = startYear; year <= startYear + MULTI_YEAR_CONSTANTS.MAX_DURATION_YEARS - 1; year++) {
      years.push(year)
    }
    console.log('getAvailableEndYears - returning years:', years)
    return years
  }

  // Get recurrence options for multi-year budgets (exclude One Time)
  const getMultiYearRecurrenceOptions = () => {
    const options = {}
    Object.entries(RECURRENCE_LABELS).forEach(([type, label]) => {
      if (type !== 'one-time') {
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

  // Watch for startYear changes to ensure startMonth is valid
  watch(() => formData.value.startYear, (newStartYear) => {
    if (newStartYear && formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
      const currentYearValue = currentYear.value
      const currentMonthValue = currentMonth.value
      
      // If switching to current year, ensure start month is not in the past
      if (newStartYear === currentYearValue && formData.value.startMonth < currentMonthValue) {
        formData.value.startMonth = currentMonthValue
      }
      // If switching to future year, allow any month
      else if (newStartYear > currentYearValue) {
        // Keep current selection if it's valid, otherwise default to January
        if (formData.value.startMonth < 0 || formData.value.startMonth > 11) {
          formData.value.startMonth = 0
        }
      }
      // If switching to past year, allow any month for historical data
      
      updateLegacyRecurrence()
    }
  })

  // Watch for oneTimeYear changes to ensure oneTimeMonth is valid
  watch(() => formData.value.oneTimeYear, (newOneTimeYear) => {
    if (newOneTimeYear && formData.value.frequency === FREQUENCY_TYPES.ONCE) {
      const currentYearValue = currentYear.value
      const currentMonthValue = currentMonth.value
      
      // If switching to current year, ensure one-time month is not in the past
      if (newOneTimeYear === currentYearValue && formData.value.oneTimeMonth < currentMonthValue) {
        formData.value.oneTimeMonth = currentMonthValue
      }
      // If switching to future year, allow any month
      else if (newOneTimeYear > currentYearValue) {
        // Keep current selection if it's valid, otherwise default to January
        if (formData.value.oneTimeMonth < 0 || formData.value.oneTimeMonth > 11) {
          formData.value.oneTimeMonth = 0
        }
      }
      // If switching to past year, allow any month for historical data
      
      updateLegacyRecurrence()
    }
  })

  // Watch for frequency changes to update schedule
  watch(() => formData.value.frequency, (newFrequency) => {
    console.log('Frequency changed to:', newFrequency)
    updateSchedule()
  })

  // Watch for recurrence interval changes
  watch(() => formData.value.recurrenceInterval, (newInterval) => {
    console.log('Recurrence interval changed to:', newInterval)
    updateLegacyRecurrence()
  })

  // Watch for end type changes
  watch(() => formData.value.endType, (newEndType) => {
    console.log('End type changed to:', newEndType)
    updateLegacyRecurrence()
  })

  // Watch for end month changes
  watch(() => formData.value.endMonth, (newEndMonth) => {
    console.log('End month changed to:', newEndMonth)
    updateLegacyRecurrence()
  })

  // Watch for end year changes
  watch(() => formData.value.endYear, (newEndYear) => {
    console.log('End year changed to:', newEndYear)
    updateLegacyRecurrence()
  })

  // Watch for occurrences changes
  watch(() => formData.value.occurrences, (newOccurrences) => {
    console.log('Occurrences changed to:', newOccurrences)
    updateLegacyRecurrence()
  })

  // Get available months for "Once" frequency with enhanced dynamic validation
  const getAvailableOnceMonths = () => {
    const oneTimeYear = formData.value.oneTimeYear || currentYear.value
    return getDynamicAvailableMonths(oneTimeYear, false)
  }

  // Get available months for "Custom" frequency with enhanced dynamic validation
  const getAvailableCustomMonths = () => {
    const currentYearValue = currentYear.value
    return getDynamicAvailableMonths(currentYearValue, true)
  }

  // Dynamic month validation - more flexible approach
  const getDynamicAvailableMonths = (targetYear, isCurrentYearOnly = false) => {
    const currentYearValue = currentYear.value
    const currentMonthValue = currentMonth.value
    
    // If we're in December (month 11) and target year is current year,
    // allow selecting future months from next year
    if (currentMonthValue === 11 && targetYear === currentYearValue) {
      // For December, allow selecting months from next year
      return MONTH_OPTIONS
    }
    
    // If target year is current year, only show months >= current month
    if (targetYear === currentYearValue) {
      return MONTH_OPTIONS.filter(month => month.value >= currentMonthValue)
    }
    // If target year is in the future, show all months
    else if (targetYear > currentYearValue) {
      return MONTH_OPTIONS
    }
    // If target year is in the past, show all months (for historical data)
    else {
      return MONTH_OPTIONS
    }
  }

  // Get available start months with enhanced dynamic validation
  const getAvailableStartMonthIndices = () => {
    // For ONCE and CUSTOM frequencies, return all months since date fields are hidden
    if (formData.value.frequency === FREQUENCY_TYPES.ONCE || formData.value.frequency === FREQUENCY_TYPES.CUSTOM) {
      return MONTH_OPTIONS
    }
    
    const startYear = formData.value.startYear || currentYear.value
    return getDynamicAvailableMonths(startYear, false)
  }

  // Get multi-year duration
  const getMultiYearDuration = () => {
    if (!formData.value.startYear || !formData.value.endYear) return 1
    return formData.value.endYear - formData.value.startYear + 1
  }

  // Get calculated end year
  const getCalculatedEndYear = () => {
    if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
      return formData.value.endYear
    }
    // For occurrence-based end, calculate based on start year and occurrences
    if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
      // For 1 occurrence, the end year is the same as start year
      if (formData.value.occurrences === 1) {
        return formData.value.startYear
      }
      
      const totalMonths = (formData.value.occurrences - 1) * formData.value.recurrenceInterval
      const endMonth = formData.value.startMonth + totalMonths
      const additionalYears = Math.floor(endMonth / 12)
      return formData.value.startYear + additionalYears
    }
    return formData.value.startYear
  }

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
    updateMultiYearPreview,
    getAvailableYears,
    getAvailableEndYears,
    getMultiYearRecurrenceOptions,
    watchYearChanges,
    getAvailableOnceMonths,
    getAvailableCustomMonths,
    getMultiYearDuration,
    getCalculatedEndYear
  }
} 