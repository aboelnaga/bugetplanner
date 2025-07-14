// Budget utilities
// Formatting functions, validation helpers, date utilities

import { BUDGET_TYPE_ICONS, BUDGET_TYPES, SUMMARY_VALUE_STYLES, BUDGET_TYPE_STYLES, TABLE_CELL_STYLES } from '@/constants/budgetConstants.js'

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0))
}

// Compact currency formatting for better display in small spaces
export const formatCompactCurrency = (amount) => {
  const num = Math.abs(amount || 0)
  
  // Use Intl.NumberFormat with compact notation to avoid rounding issues
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    notation: 'compact',
    compactDisplay: 'short'
  })
  
  return `EGP ${formatter.format(num)}`
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
    
    // Apply current month styling first (highest priority)
    if (isCurrentMonth) {
      classes += ` ${SUMMARY_VALUE_STYLES.CURRENT_MONTH.bgColor}`
    }
    
    // Use summary row styling if provided (for expense/investment purchase rows)
    if (summaryRowStyling) {
      classes += ` ${summaryRowStyling.textColor}`
      // Only apply summary row background if not current month
      if (!isCurrentMonth) {
        classes += ` ${summaryRowStyling.bgColor}`
      }
    } else {
      // Use value-based styling for other summary rows
      const valueStyles = summaryUtils.getValueStyles(value)
      classes += ` ${valueStyles.textColor}`
      // Only apply value-based background if not current month
      if (!isCurrentMonth) {
        classes += ` ${valueStyles.bgColor}`
      }
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

// Empty state utilities
export const emptyStateUtils = {
  // Generate empty state message based on filters
  generateFilteredResultsMessage: (selectedTypeFilter, selectedCategoryFilter, selectedYear) => {
    const parts = []
    
    if (selectedTypeFilter !== 'all') {
      const typeLabel = selectedTypeFilter === 'income' ? 'income' : 
                       selectedTypeFilter === 'expense' ? 'expense' : 'investment'
      parts.push(`No ${typeLabel} items`)
    }
    
    if (selectedCategoryFilter !== 'all') {
      if (selectedTypeFilter !== 'all') {
        parts.push('in')
      }
      parts.push(`in the "${selectedCategoryFilter}" category`)
    }
    
    if (selectedTypeFilter === 'all' && selectedCategoryFilter === 'all') {
      parts.push('No budget items')
    }
    
    parts.push(`for ${selectedYear}`)
    
    return parts.join(' ')
  },

  // Format empty state title with dynamic values
  formatEmptyStateTitle: (title, replacements = {}) => {
    let formattedTitle = title
    Object.entries(replacements).forEach(([key, value]) => {
      formattedTitle = formattedTitle.replace(`{${key}}`, value)
    })
    return formattedTitle
  }
}

// Table utilities
export const tableUtils = {
  // Get table header classes for month columns
  getMonthHeaderClasses: (selectedYear, currentYear, currentMonth, monthIndex) => {
    const baseClasses = 'px-4 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-32 bg-gray-50'
    const isCurrentMonth = selectedYear === currentYear && monthIndex === currentMonth
    
    if (isCurrentMonth) {
      return `${baseClasses} bg-blue-200 text-blue-900 font-bold`
    }
    
    return `${baseClasses} text-gray-500`
  },

  // Get table container classes
  getTableContainerClasses: () => {
    return 'overflow-hidden max-h-[calc(100vh-3rem-100px)]'
  },

  // Get table scroll container classes
  getTableScrollClasses: () => {
    return 'overflow-auto max-h-[calc(100vh-6rem-100px)]'
  },

  // Get budget type styling based on budget object
  getBudgetTypeStyling: (budget) => {
    if (budget.type === 'income') {
      return BUDGET_TYPE_STYLES.INCOME
    } else if (budget.type === 'expense') {
      return BUDGET_TYPE_STYLES.EXPENSE
    } else if (budget.type === 'investment') {
      return budget.investment_direction === 'incoming' 
        ? BUDGET_TYPE_STYLES.INVESTMENT_INCOMING 
        : BUDGET_TYPE_STYLES.INVESTMENT_OUTGOING
    }
    return BUDGET_TYPE_STYLES.EXPENSE // fallback
  },

  // Get category type styling based on group
  getCategoryTypeStyling: (group, getCategoryType) => {
    const categoryType = getCategoryType(group)
    if (categoryType === 'income' || categoryType === 'investment-incoming') {
      return { textColor: 'text-green-700' }
    } else {
      return { textColor: 'text-red-700' }
    }
  },

  // Get monthly amount cell classes
  getMonthlyAmountCellClasses: (budget, selectedYear, currentYear, currentMonth, monthIndex, isScheduledMonth, getBudgetAmount) => {
    const baseClasses = 'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center'
    const typeStyling = tableUtils.getBudgetTypeStyling(budget)
    const amount = getBudgetAmount(budget, monthIndex)
    
    let bgClasses = ''
    let textClasses = ''
    
    // Background classes
    if (selectedYear === currentYear && monthIndex < currentMonth) {
      bgClasses = TABLE_CELL_STYLES.PAST_MONTH.bgColor
      textClasses = TABLE_CELL_STYLES.PAST_MONTH.textColor
    } else if (selectedYear === currentYear && monthIndex === currentMonth) {
      bgClasses = `${TABLE_CELL_STYLES.CURRENT_MONTH.amountBgColor} ${TABLE_CELL_STYLES.CURRENT_MONTH.borderColor} ${TABLE_CELL_STYLES.CURRENT_MONTH.shadow}`
    } else if (isScheduledMonth(budget, monthIndex)) {
      bgClasses = typeStyling.amountBgColor
    } else {
      bgClasses = TABLE_CELL_STYLES.DEFAULT.bgColor
    }
    
    // Text classes
    if (amount > 0) {
      textClasses = `font-semibold ${typeStyling.amountTextColor}`
    } else {
      textClasses = 'text-gray-400'
    }
    
    return `${baseClasses} ${bgClasses} ${textClasses}`
  },

  // Get yearly total cell classes
  getYearlyTotalCellClasses: (budget, calculateYearlyTotal) => {
    const baseClasses = 'px-4 py-4 text-center font-semibold'
    const typeStyling = tableUtils.getBudgetTypeStyling(budget)
    const total = calculateYearlyTotal(budget)
    
    if (total > 0) {
      return `${baseClasses} ${typeStyling.amountTextColor}`
    } else {
      return `${baseClasses} text-gray-400`
    }
  },

  // Format amount with sign based on budget type
  formatAmountWithSign: (amount, budget, formatCurrency) => {
    if (amount <= 0) return '—'
    
    const isExpense = budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')
    const sign = isExpense ? '-' : ''
    return `${sign}${formatCurrency(amount)}`
  },

  // Get budget type label
  getBudgetTypeLabel: (budget) => {
    if (budget.type === 'income') return 'Income'
    if (budget.type === 'investment') return 'Investment'
    return 'Expense'
  }
} 

// Schedule generation utilities
export const scheduleUtils = {
  // Generate schedule based on recurrence
  generateSchedule: (recurrence, startMonth, customMonths = [], oneTimeMonth = 0, defaultAmount = 0) => {
    let schedule = []
    let amounts = new Array(12).fill(0)
    
    switch (recurrence) {
      case 'monthly':
        // Start from specified month and continue for remaining months in the year
        for (let month = startMonth; month < 12; month++) {
          schedule.push(month)
        }
        break
      case 'quarterly':
        // Start from the first quarter that includes or comes after startMonth
        const quarters = [0, 3, 6, 9] // Q1, Q2, Q3, Q4
        schedule = quarters.filter(quarter => quarter >= startMonth)
        break
      case 'bi-annual':
        // Start from the first bi-annual period that includes or comes after startMonth
        const biAnnual = [0, 6] // January and July
        schedule = biAnnual.filter(month => month >= startMonth)
        break
      case 'school-terms':
        // Start from the first school term that includes or comes after startMonth
        const schoolTerms = [0, 8] // January and September
        schedule = schoolTerms.filter(month => month >= startMonth)
        break
      case 'custom':
        schedule = [...customMonths]
        break
      case 'one-time':
        schedule = [oneTimeMonth]
        break
    }

    // Populate amounts array
    schedule.forEach(month => {
      amounts[month] = defaultAmount
    })

    return { schedule, amounts }
  },

  // Get schedule preview class
  getSchedulePreviewClass: (monthIndex, recurrence, startMonth, customMonths = [], oneTimeMonth = 0) => {
    const { schedule } = scheduleUtils.generateSchedule(recurrence, startMonth, customMonths, oneTimeMonth)
    
    if (schedule.includes(monthIndex)) {
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    } else {
      return 'bg-gray-100 text-gray-500'
    }
  },

  // Calculate total amount for schedule
  calculateTotalAmount: (recurrence, startMonth, customMonths = [], oneTimeMonth = 0, defaultAmount = 0) => {
    const { schedule } = scheduleUtils.generateSchedule(recurrence, startMonth, customMonths, oneTimeMonth, defaultAmount)
    return schedule.length * defaultAmount
  }
}

// History formatting utilities
export const historyUtils = {
  // Format timestamp for better readability
  formatTimestamp: (timestamp) => {
    if (!timestamp) return ''
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch (error) {
      // Fallback to original timestamp if parsing fails
      return timestamp
    }
  },

  // Format full date for detailed view
  formatFullDate: (timestamp) => {
    if (!timestamp) return ''
    
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return timestamp
    }
  },

  // Format history value (currently same as currency, but can be extended)
  formatHistoryValue: (value) => {
    return formatCurrency(value)
  }
} 