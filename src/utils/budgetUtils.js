// Budget utilities
// Formatting functions, validation helpers, date utilities

import { BUDGET_TYPE_ICONS, BUDGET_TYPES, SUMMARY_VALUE_STYLES } from '@/constants/budgetConstants.js'

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0))
}

// Format number with commas every 3 digits
export const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Parse formatted number back to numeric value
export const parseFormattedNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0
  return parseFloat(value.toString().replace(/,/g, '')) || 0
}

// Get budget type icon
export const getBudgetTypeIcon = (type) => {
  return BUDGET_TYPE_ICONS[type] || '📊'
}

// Get month label based on selected year and current date
export const getMonthLabel = (monthIndex, selectedYear, currentYear, currentMonth) => {
  if (selectedYear === currentYear) {
    if (monthIndex === currentMonth) return '(Current)'
    if (monthIndex === currentMonth + 1) return '(Next)'
  } else if (selectedYear > currentYear) {
    if (monthIndex === 0) return '(Jan of future year)'
  } else {
    return '(Past year)'
  }
  return ''
}

// Summary utilities
export const summaryUtils = {
  // Get summary value styling based on value
  getValueStyles: (value) => {
    if (value > 0) return SUMMARY_VALUE_STYLES.POSITIVE
    if (value < 0) return SUMMARY_VALUE_STYLES.NEGATIVE
    return SUMMARY_VALUE_STYLES.NEUTRAL
  },

  // Get summary cell classes
  getSummaryCellClasses: (value, selectedYear, currentYear, currentMonth, monthIndex, summaryRowStyling = null) => {
    const baseClasses = 'px-2 py-3 text-center'
    const isCurrentMonth = selectedYear === currentYear && monthIndex === currentMonth
    
    let classes = baseClasses
    
    // Use summary row styling if provided (for expense/investment purchase rows)
    if (summaryRowStyling) {
      classes += ` ${summaryRowStyling.textColor} ${summaryRowStyling.bgColor}`
    } else {
      // Use value-based styling for other summary rows
      const valueStyles = summaryUtils.getValueStyles(value)
      classes += ` ${valueStyles.textColor} ${valueStyles.bgColor}`
    }
    
    if (isCurrentMonth) {
      classes += ` ${SUMMARY_VALUE_STYLES.CURRENT_MONTH.bgColor}`
    }
    
    return classes
  },

  // Get summary total cell classes
  getSummaryTotalClasses: (value, isGrandTotal = false) => {
    const baseClasses = isGrandTotal 
      ? 'px-4 py-4 text-right text-lg font-bold border-2'
      : 'px-4 py-3 text-right text-sm font-bold'
    
    const valueStyles = summaryUtils.getValueStyles(value)
    
    if (isGrandTotal) {
      return `${baseClasses} ${valueStyles.textColor} ${valueStyles.bgColor} ${valueStyles.borderColor}`
    }
    
    return `${baseClasses} ${valueStyles.textColor}`
  },

  // Format summary value for display
  formatSummaryValue: (value, formatCurrency) => {
    if (value > 0) {
      return formatCurrency(value)
    } else if (value < 0) {
      return formatCurrency(value)
    } else {
      return '—'
    }
  },

  // Check if summary row should be shown
  shouldShowSummaryRow: (rowConfig, conditions) => {
    return rowConfig.showCondition(...Object.values(conditions))
  }
}

// Validation helpers
export const validationHelpers = {
  // Allow only numbers and specific keys
  allowOnlyNumbers: (event) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
    const allowedChars = /[0-9]/
    
    if (allowedKeys.includes(event.key) || allowedChars.test(event.key)) {
      return true
    }
    
    event.preventDefault()
    return false
  },

  // Validate amount input
  validateAmountInput: (input) => {
    const rawValue = input.replace(/,/g, '')
    return rawValue === '' || /^\d*\.?\d*$/.test(rawValue)
  },

  // Ensure start month is valid for the selected year
  ensureValidStartMonth: (startMonth, selectedYear, currentYear, currentMonth) => {
    if (selectedYear === currentYear && startMonth < currentMonth) {
      return currentMonth
    } else if (selectedYear !== currentYear && startMonth < 0) {
      return 0 // Default to January for non-current years
    }
    return startMonth
  }
}

// Date utilities
export const dateUtils = {
  // Get available start month indices based on selected year
  getAvailableStartMonthIndices: (selectedYear, currentYear, currentMonth) => {
    if (selectedYear > currentYear) {
      // Future year: all month indices (0-11)
      return Array.from({ length: 12 }, (_, i) => i)
    } else if (selectedYear === currentYear) {
      // Current year: only current month and future month indices
      return Array.from({ length: 12 - currentMonth }, (_, i) => currentMonth + i)
    } else {
      // Past year: all month indices (0-11)
      return Array.from({ length: 12 }, (_, i) => i)
    }
  },

  // Get default start month based on selected year
  getDefaultStartMonth: (selectedYear, currentYear, currentMonth) => {
    if (selectedYear === currentYear) {
      return currentMonth
    } else {
      return 0 // Default to January for non-current years
    }
  }
}

// Input handling utilities
export const inputUtils = {
  // Handle amount input with validation and formatting
  handleAmountInput: (event, formData) => {
    const input = event.target.value
    const rawValue = input.replace(/,/g, '')
    
    // Only allow numbers
    if (validationHelpers.validateAmountInput(rawValue)) {
      const numericValue = parseFloat(rawValue) || 0
      formData.defaultAmount = numericValue
    }
  }
} 