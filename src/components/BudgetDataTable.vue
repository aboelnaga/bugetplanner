<script setup>
import { useBudgetDataTable } from '@/composables/useBudgetDataTable.js'
import { MONTHS } from '@/constants/budgetConstants.js'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  // State
  loading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    default: null
  },
  budgetItems: {
    type: Array,
    required: true
  },
  selectedYear: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  currentMonth: {
    type: Number,
    required: true
  },

  // Functions
  formatCurrency: {
    type: Function,
    required: true
  },

  // Calculation functions for footer totals
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
    type: Function,
    required: true
  },

  // Previous year calculation functions
  calculatePreviousYearIncomeTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearExpensesTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearSavings: {
    type: Function,
    default: null
  },

  // Month closure functionality
  closedMonths: {
    type: Array,
    default: () => []
  },
  getActualAmount: {
    type: Function,
    default: null
  },

  // Monthly actual calculation functions
  calculateMonthlyActualIncome: {
    type: Function,
    default: null
  },
  calculateMonthlyActualExpenses: {
    type: Function,
    default: null
  },
  calculateMonthlyActualTotal: {
    type: Function,
    default: null
  },
  calculateMonthlyActualInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateMonthlyActualInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateMonthlyActualInvestmentNet: {
    type: Function,
    default: null
  },

  // Smart defaults display mode
  smartDefaultsMode: {
    type: String,
    default: 'both', // 'both', 'actual', 'expected'
    validator: (value) => ['both', 'actual', 'expected'].includes(value)
  }
})

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget',
  'view-transactions',
  'update:smartDefaultsMode'
])

// Use the composable
const { flattenedBudgetData } = useBudgetDataTable(
  computed(() => props.budgetItems),
  computed(() => props.selectedYear),
  computed(() => props.currentYear),
  computed(() => props.currentMonth)
)

// Footer expansion state
const showDetailedBreakdown = ref(false)

// PrimeVue DataTable filtering
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

// Footer row styling variables
const parentRowStyle = computed(() =>
  'font-weight: bold; font-size: 1rem;'
)

const childRowStyle = computed(() =>
  'font-weight: 500; background-color: var(--surface-ground);'
)

const grandchildRowStyle = computed(() =>
  'font-weight: 500; font-size: 0.875rem;'
)
const showDetailedInvestmentBreakdown = ref(false)

// Constants
const months = MONTHS

// Helper functions
const getTypeLabel = (type) => {
  if (type === 'income') return 'Income'
  if (type === 'expense') return 'Expense'
  if (type === 'investment') return 'Investment'
  return 'Unknown'
}

const getTypeIcon = (item) => {
  if (item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) return 'pi pi-arrow-up'
  if (item.type === 'expense' || (item.type === 'investment' && item.investment_direction === 'outgoing')) return 'pi pi-arrow-down'
  return 'pi pi-question'
}

const getTypeSeverity = (item) => {
  if (item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) return 'success'
  if (item.type === 'expense' || (item.type === 'investment' && item.investment_direction === 'outgoing')) return 'danger'
  return 'secondary'
}

const getVirtualItemLabel = (budget) => {
  if (budget.is_virtual) {
    if (budget.name === 'Unlinked Income') {
      return 'Unlinked Income'
    } else if (budget.name === 'Unlinked Expenses') {
      return 'Unlinked Expense'
    } else if (budget.name === 'Unlinked Investment Incoming') {
      return 'Unlinked Investment Incoming'
    } else if (budget.name === 'Unlinked Investment Outgoing') {
      return 'Unlinked Investment Outgoing'
    }
  }
  return 'Unlinked'
}

const getMonthColumnClass = (month) => {
  const monthIndex = months.indexOf(month)
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    return '!bg-primary-50 dark:!bg-primary-900'
  }
  return ''
}

const getMonthlyAmount = (budget, month) => {
  const monthField = month.toLowerCase()
  return budget[monthField] || 0
}

const formatAmountWithSign = (amount, item, formatCurrency) => {
  if (amount === 0) return '—'

  // For income and investment incoming, always show positive
  // For expenses and investment outgoing, always show negative
  if (item.type === 'income') {
    return `+${formatCurrency(Math.abs(amount))}`
  } else if (item.type === 'expense') {
    return `-${formatCurrency(Math.abs(amount))}`
  } else if (item.type === 'investment') {
    if (item.investment_direction === 'incoming') {
      return `+${formatCurrency(Math.abs(amount))}`
    } else if (item.investment_direction === 'outgoing') {
      return `-${formatCurrency(Math.abs(amount))}`
    }
  } else if (item.type === 'net') {
    // For net values, show + for positive, - for negative
    const sign = amount > 0 ? '+' : (amount < 0 ? '-' : '')
    return amount !== 0 ? `${sign}${formatCurrency(Math.abs(amount))}` : formatCurrency(0)
  }

  // Fallback: show with sign based on amount value
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatCurrency(amount)}`
}

// Smart defaults logic with actual/expected display
const getSmartDefaultAmount = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const expectedAmount = getMonthlyAmount(budget, month)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0

  // Return based on display mode
  switch (props.smartDefaultsMode) {
    case 'actual':
      return actualAmount
    case 'expected':
      return expectedAmount
    case 'both':
    default:
      // For 'both' mode, we'll display in the template, so return expected for now
      return expectedAmount
  }
}

const getSmartDefaultDisplay = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const expectedAmount = getMonthlyAmount(budget, month)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0
  const monthClosed = isMonthClosed(monthIndex)

  // Return based on display mode
  switch (props.smartDefaultsMode) {
    case 'actual':
      return actualAmount
    case 'expected':
      return expectedAmount
    case 'both':
    default:
      // For 'both' mode, return both values
      // If month is closed, show only actual (since actual = expected)
      if (monthClosed) {
        return { type: 'single', value: actualAmount, closed: true }
      }

      // For open months, show both
      if (actualAmount === 0 && expectedAmount === 0) {
        return { type: 'single', value: 0, closed: false }
      }

      return {
        type: 'both',
        actual: actualAmount,
        expected: expectedAmount,
        closed: false
      }
  }
}

const getSmartDefaultTooltip = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const expectedAmount = getMonthlyAmount(budget, month)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0

  return `Expected: ${props.formatCurrency(expectedAmount)}<br>Actual: ${props.formatCurrency(actualAmount)}`
}

// Previous year functions - now connected to backend
const getPreviousYearAmount = (budget) => {
  // For now, return 0 as this needs budget-specific previous year data
  // This will be enhanced when we have individual budget item previous year data
  const total = 0
  const summaryItem = { type: 'income', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getPreviousYearTooltip = (budget) => {
  return 'Previous year data available in summary totals below'
}

// Month header content with close month functionality
const getMonthHeaderContent = (month) => {
  const monthIndex = months.indexOf(month)

  // Current month indicator
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    return 'Current'
  }

  // Month closure status
  if (props.closedMonths && props.closedMonths.some(closedMonth => closedMonth.month === monthIndex)) {
    return 'Closed'
  }

  return ''
}

// Helper function to check if a month is closed
const isMonthClosed = (monthIndex) => {
  return props.closedMonths && props.closedMonths.some(closedMonth => closedMonth.month === monthIndex)
}

// Footer total calculations with smart defaults support
const getMonthlyIncomeTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyIncome(monthIndex)
  const summaryItem = { type: 'income', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyIncomeTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const expectedTotal = props.calculateMonthlyIncome(monthIndex)

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualIncome) {
    actualTotal = props.calculateMonthlyActualIncome(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'income'
  }
}

const getMonthlyExpensesTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyExpenses(monthIndex)
  const summaryItem = { type: 'expense', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyExpensesTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const expectedTotal = props.calculateMonthlyExpenses(monthIndex)

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualExpenses) {
    actualTotal = props.calculateMonthlyActualExpenses(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'expense'
  }
}

const getMonthlyNetTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyTotal(monthIndex)
  // Create a summary item object to represent "net" type
  const summaryItem = { type: 'net', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyNetTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const expectedTotal = props.calculateMonthlyTotal(monthIndex)

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualTotal) {
    actualTotal = props.calculateMonthlyActualTotal(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'net'
  }
}

const getYearlyIncomeTotal = () => {
  const total = props.calculateGrandTotalIncome()
  const summaryItem = { type: 'income', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getYearlyExpensesTotal = () => {
  const total = props.calculateGrandTotalExpenses()
  const summaryItem = { type: 'expense', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getYearlyNetTotal = () => {
  const total = props.calculateGrandTotal()
  const summaryItem = { type: 'net', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

// Previous year footer totals - now connected to backend
const getPreviousYearIncomeTotal = () => {
  if (props.calculatePreviousYearIncomeTotal) {
    const total = props.calculatePreviousYearIncomeTotal()
    const summaryItem = { type: 'income', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

const getPreviousYearExpensesTotal = () => {
  if (props.calculatePreviousYearExpensesTotal) {
    const total = props.calculatePreviousYearExpensesTotal()
    const summaryItem = { type: 'expense', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

const getPreviousYearNetTotal = () => {
  if (props.calculatePreviousYearNetTotal) {
    const total = props.calculatePreviousYearNetTotal()
    const summaryItem = { type: 'net', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

// Investment Returns (Investment Incoming)
const getMonthlyInvestmentIncomingTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item[monthField] || 0
    }
  })
  const summaryItem = { type: 'income', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyInvestmentIncomingTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const monthField = month.toLowerCase()
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      expectedTotal += item[monthField] || 0
    }
  })

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualInvestmentIncoming) {
    actualTotal = props.calculateMonthlyActualInvestmentIncoming(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'income'
  }
}

const getYearlyInvestmentIncomingTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item.total || 0
    }
  })
  const summaryItem = { type: 'income', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getPreviousYearInvestmentIncomingTotal = () => {
  if (props.calculatePreviousYearInvestmentIncomingTotal) {
    const total = props.calculatePreviousYearInvestmentIncomingTotal()
    const summaryItem = { type: 'income', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

// Investment Purchases (Investment Outgoing)
const getMonthlyInvestmentOutgoingTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total += item[monthField] || 0
    }
  })
  const summaryItem = { type: 'expense', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyInvestmentOutgoingTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const monthField = month.toLowerCase()
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      expectedTotal += item[monthField] || 0
    }
  })

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualInvestmentOutgoing) {
    actualTotal = props.calculateMonthlyActualInvestmentOutgoing(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'expense'
  }
}

const getYearlyInvestmentOutgoingTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total += item.total || 0
    }
  })
  const summaryItem = { type: 'expense', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getPreviousYearInvestmentOutgoingTotal = () => {
  if (props.calculatePreviousYearInvestmentOutgoingTotal) {
    const total = props.calculatePreviousYearInvestmentOutgoingTotal()
    const summaryItem = { type: 'expense', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

// Cumulative Savings
const getMonthlySavingsTotal = (month) => {
  const monthIndex = months.indexOf(month)
  let cumulativeSavings = 0

  // Calculate cumulative savings from start of year up to this month
  for (let i = 0; i <= monthIndex; i++) {
    const monthField = months[i].toLowerCase()
    let monthlyNet = 0

    flattenedBudgetData.value.forEach(item => {
      if (item.type === 'income') {
        monthlyNet += item[monthField] || 0
      }
      if (item.type === 'expense') {
        monthlyNet -= item[monthField] || 0
      }
      if (item.type === 'investment') {
        if (item.investment_direction === 'incoming') {
          monthlyNet += item[monthField] || 0
        } else if (item.investment_direction === 'outgoing') {
          monthlyNet -= item[monthField] || 0
        }
      }
    })

    cumulativeSavings += monthlyNet
  }

  const summaryItem = { type: 'net', amount: cumulativeSavings }
  return formatAmountWithSign(cumulativeSavings, summaryItem, props.formatCurrency)
}

const getMonthlySavingsTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)

  // Calculate cumulative savings from start of year up to this month
  let expectedCumulativeSavings = 0
  let actualCumulativeSavings = 0

  for (let i = 0; i <= monthIndex; i++) {
    const monthField = months[i].toLowerCase()
    let monthlyNet = 0
    let monthlyActualNet = 0

    // Calculate expected monthly net
    flattenedBudgetData.value.forEach(item => {
      if (item.type === 'income') {
        monthlyNet += item[monthField] || 0
      }
      if (item.type === 'expense') {
        monthlyNet -= item[monthField] || 0
      }
      if (item.type === 'investment') {
        if (item.investment_direction === 'incoming') {
          monthlyNet += item[monthField] || 0
        } else if (item.investment_direction === 'outgoing') {
          monthlyNet -= item[monthField] || 0
        }
      }
    })

    // Calculate actual monthly net if available
    if (props.calculateMonthlyActualTotal) {
      monthlyActualNet = props.calculateMonthlyActualTotal(i)
    } else {
      monthlyActualNet = monthlyNet
    }

    expectedCumulativeSavings += monthlyNet
    actualCumulativeSavings += monthlyActualNet
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedCumulativeSavings,
    actual: actualCumulativeSavings,
    closed: monthClosed,
    type: 'net'
  }
}

const getYearlySavingsTotal = () => {
  // Yearly total is the same as December's cumulative savings
  return getMonthlySavingsTotal('Dec')
}

const getPreviousYearSavingsTotal = () => {
  if (props.calculatePreviousYearSavings) {
    const total = props.calculatePreviousYearSavings()
    const summaryItem = { type: 'net', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

// Net Investment
const getMonthlyInvestmentNetTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment') {
      if (item.investment_direction === 'incoming') {
        total += item[monthField] || 0
      } else if (item.investment_direction === 'outgoing') {
        total -= item[monthField] || 0
      }
    }
  })
  const summaryItem = { type: 'net', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getMonthlyInvestmentNetTotalWithSmartDefaults = (month) => {
  const monthIndex = months.indexOf(month)
  const monthField = month.toLowerCase()
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment') {
      if (item.investment_direction === 'incoming') {
        expectedTotal += item[monthField] || 0
      } else if (item.investment_direction === 'outgoing') {
        expectedTotal -= item[monthField] || 0
      }
    }
  })

  // Get actual total if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualInvestmentNet) {
    actualTotal = props.calculateMonthlyActualInvestmentNet(monthIndex)
  }

  const monthClosed = isMonthClosed(monthIndex)

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: monthClosed,
    type: 'net'
  }
}

const getYearlyInvestmentNetTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item.total || 0
    }
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total -= item.total || 0
    }
  })
  const summaryItem = { type: 'net', amount: total }
  return formatAmountWithSign(total, summaryItem, props.formatCurrency)
}

const getPreviousYearInvestmentNetTotal = () => {
  if (props.calculatePreviousYearInvestmentNetTotal) {
    const total = props.calculatePreviousYearInvestmentNetTotal()
    const summaryItem = { type: 'net', amount: total }
    return formatAmountWithSign(total, summaryItem, props.formatCurrency)
  }
  return '—'
}

// Row border color function based on budget item type
const getCellTextColorClass = (item) => {
  if (item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) {
    return 'text-green-700 dark:text-green-400'
  } else if (item.type === 'expense' || (item.type === 'investment' && item.investment_direction === 'outgoing')) {
    return 'text-red-700 dark:text-red-400'
  } else if (item.type === 'net') {
    // Handle both string and number amounts
    if (typeof item.amount === 'string') {
      if (item.amount.includes('+')) {
        return 'text-green-700 dark:text-green-400'
      } else if (item.amount.includes('-')) {
        return 'text-red-700 dark:text-red-400'
      }
    } else if (typeof item.amount === 'number') {
      if (item.amount > 0) {
        return 'text-green-700 dark:text-green-400'
      } else if (item.amount < 0) {
        return 'text-red-700 dark:text-red-400'
      }
    }
  }
  return 'text-surface'
}

// Helper function to generate complete footer cell classes
const getFooterCellClasses = (amount, itemType) => {
  const baseClasses = 'text-center'

  if (amount === '—') {
    return `${baseClasses} font-normal text-muted-color`
  }

  // For net type items, we need to check the actual amount value
  if (itemType === 'net') {
    const colorClass = getCellTextColorClass({ type: 'net', amount: amount })
    return `${baseClasses} ${colorClass}`
  }

  // For income/expense types, use the type directly
  const colorClass = getCellTextColorClass({ type: itemType })
  return `${baseClasses} ${colorClass}`
}

// Helper function to get raw value for CSS classes
const getRawValueForCSS = (smartData) => {
  if (!smartData) return 0
  return smartData.expected || 0
}

// Helper function to format footer values with smart defaults
const formatFooterValueWithSmartDefaults = (smartData, itemType) => {
  if (!smartData) return '—'

  // Helper function to convert 0 to "—"
  const formatValue = (value) => {
    if (value === 0) return '—'
    return formatAmountWithSign(value, { type: itemType }, props.formatCurrency)
  }

  switch (props.smartDefaultsMode) {
    case 'actual':
      return formatValue(smartData.actual)
    case 'expected':
      return formatValue(smartData.expected)
    case 'both':
    default:
      if (smartData.closed) {
        // For closed months, show only actual (since actual = expected)
        return formatValue(smartData.actual)
      }

      // If both are 0, show single "—"
      if (smartData.actual === 0 && smartData.expected === 0) {
        return '—'
      }

      // For open months, show both
      const actualFormatted = formatValue(smartData.actual)
      const expectedFormatted = formatValue(smartData.expected)

      return `${actualFormatted} / ${expectedFormatted}`
  }
}

// Helper function to get footer display data for template rendering
const getFooterDisplayData = (smartData, itemType) => {
  if (!smartData) return null

  // Helper function to convert 0 to "—"
  const formatValue = (value) => {
    if (value === 0) return '—'
    return formatAmountWithSign(value, { type: itemType }, props.formatCurrency)
  }

  switch (props.smartDefaultsMode) {
    case 'actual':
      return { type: 'single', value: formatValue(smartData.actual), closed: smartData.closed }
    case 'expected':
      return { type: 'single', value: formatValue(smartData.expected), closed: false }
    case 'both':
    default:
      // For closed months, show only actual (since actual = expected)
      if (smartData.closed) {
        return { type: 'single', value: formatValue(smartData.actual), closed: true }
      }

      // If both are 0, show single "—"
      if (smartData.actual === 0 && smartData.expected === 0) {
        return { type: 'single', value: '—', closed: false }
      }

      const actualFormatted = formatValue(smartData.actual)
      const expectedFormatted = formatValue(smartData.expected)

      return {
        type: 'both',
        actual: actualFormatted,
        expected: expectedFormatted,
        closed: false
      }
  }
}
</script>

<template>
  <div class="card">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-blue-600">New DataTable Implementation (Testing)</h3>
    </div>

    <!-- DataTable with Column Groups -->
    <DataTable :value="flattenedBudgetData" :loading="loading" :filters="filters" filterDisplay="menu"
      :globalFilterFields="['name', 'category', 'type', 'investment_direction']" tableStyle="" scrollable
      scrollHeight="70vh" class="budget-datatable" showGridlines>
      <template #header>
        <div class="flex justify-between items-center">
          <!-- Smart Defaults Mode Filter -->
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Display Mode:</span>
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button @click="$emit('update:smartDefaultsMode', 'both')" :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                props.smartDefaultsMode === 'both'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              ]">
                Both
              </button>
              <button @click="$emit('update:smartDefaultsMode', 'actual')" :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                props.smartDefaultsMode === 'actual'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              ]">
                Actual
              </button>
              <button @click="$emit('update:smartDefaultsMode', 'expected')" :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                props.smartDefaultsMode === 'expected'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              ]">
                Expected
              </button>
            </div>
          </div>

          <!-- Search Input -->
          <div class="flex justify-end">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search budget items..." class="w-80" />
            </IconField>
          </div>
        </div>
      </template>
      <template #empty> No budget items found. </template>
      <template #loading> Loading budget data. Please wait. </template>
      <!-- Column Groups Header -->
      <ColumnGroup type="header">
        <Row>
          <Column header="Budget Item" :rowspan="1" frozen alignFrozen="left" />
          <Column :header="`PY ${selectedYear - 1}`" :rowspan="1" />
          <Column v-for="month in months" :key="month" :class="getMonthColumnClass(month)">
            <template #header>
              <div class="text-center">
                <div class="font-medium">{{ month }}</div>
                <div v-if="getMonthHeaderContent(month)"
                  class="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  {{ getMonthHeaderContent(month) }}
                </div>
              </div>
            </template>
          </Column>
          <Column header="Total" :rowspan="1" frozen alignFrozen="right" />
          <Column header="Actions" :rowspan="1" frozen alignFrozen="right" />
        </Row>

      </ColumnGroup>

      <!-- Budget Item Column -->
      <Column field="name" frozen alignFrozen="left" :showFilterMenu="false" filter>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter"
            placeholder="Search by name..." />
        </template>
        <template #body="slotProps">
          <div class="space-y-1">
            <!-- Budget Name -->
            <div class="font-semibold text-sm leading-tight truncate">
              {{ slotProps.data.name }}
            </div>

            <!-- Category -->
            <div class="text-xs truncate text-muted-color">
              {{ slotProps.data.category }}
            </div>

            <!-- Secondary Info: Special Indicators -->
            <div class="flex items-center space-x-4 text-xs">
              <!-- Type Badge -->
              <Tag :icon="getTypeIcon(slotProps.data)" :severity="getTypeSeverity(slotProps.data)"
                :value="getTypeLabel(slotProps.data.type)" class="text-xs" />

              <!-- Virtual Item Indicator -->
              <div v-if="slotProps.data.is_virtual" class="flex items-center text-muted-color">
                <i class="pi pi-plus-circle text-xs mr-1"></i>
                <span class="text-xs">{{ getVirtualItemLabel(slotProps.data) }}</span>
              </div>

              <!-- Multi-Year Indicator -->
              <div v-if="slotProps.data.is_multi_year" class="flex items-center text-primary-600">
                <i class="pi pi-calendar text-xs mr-1"></i>
                <span class="text-xs">{{ slotProps.data.start_year }}-{{ slotProps.data.end_year }}</span>
              </div>

              <!-- Linked Investment Indicator -->
              <div v-if="slotProps.data.linked_investment_id" class="flex items-center text-primary-500">
                <i class="pi pi-link text-xs mr-1"></i>
                <span class="text-xs">Linked</span>
              </div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Previous Year Column -->
      <Column field="previousYear">
        <template #body="slotProps">
          <div v-if="getPreviousYearAmount(slotProps.data) > 0" class="text-center">
            <div class="text-sm cursor-help text-muted-color" :title="getPreviousYearTooltip(slotProps.data)">
              {{ formatCurrency(getPreviousYearAmount(slotProps.data)) }}
            </div>
          </div>
          <div v-else class="text-center font-normal text-muted-color">—</div>
        </template>
      </Column>

      <!-- Monthly Columns -->
      <Column v-for="month in months" :key="month" :field="month.toLowerCase()" :class="getMonthColumnClass(month)">
        <template #body="slotProps">
          <div class="text-center relative" :class="getCellTextColorClass(slotProps.data)">
            <div v-if="getSmartDefaultDisplay(slotProps.data, month)" class="font-medium cursor-help"
              :title="getSmartDefaultTooltip(slotProps.data, month)">
              <!-- Display based on mode -->
              <template v-if="props.smartDefaultsMode === 'both'">
                <div v-if="getSmartDefaultDisplay(slotProps.data, month)?.type === 'single'"
                  class="actual-expected-display">
                  <div class="actual"
                    :class="{ 'text-green-600 dark:text-green-400': getSmartDefaultDisplay(slotProps.data, month).closed }">
                    {{ getSmartDefaultDisplay(slotProps.data, month).value === 0 ? '—' :
                      formatAmountWithSign(getSmartDefaultDisplay(slotProps.data, month).value, slotProps.data,
                        formatCurrency) }}
                    <span v-if="getSmartDefaultDisplay(slotProps.data, month).closed"
                      class="text-xs ml-1 text-green-600 dark:text-green-400 cursor-help"
                      :title="`Month is closed - actual amount is displayed`">●</span>
                  </div>
                </div>
                <div v-else-if="getSmartDefaultDisplay(slotProps.data, month)?.type === 'both'"
                  class="actual-expected-display">
                  <div class="actual">
                    {{ getSmartDefaultDisplay(slotProps.data, month).actual === 0 ? '—' :
                      formatAmountWithSign(getSmartDefaultDisplay(slotProps.data, month).actual, slotProps.data,
                        formatCurrency) }}
                  </div>
                  <div class="expected">
                    / {{ getSmartDefaultDisplay(slotProps.data, month).expected === 0 ? '—' :
                      formatAmountWithSign(getSmartDefaultDisplay(slotProps.data, month).expected, slotProps.data,
                        formatCurrency) }}
                  </div>
                </div>
              </template>
              <template v-else>
                {{ getSmartDefaultDisplay(slotProps.data, month) === 0 ? '—' :
                  formatAmountWithSign(getSmartDefaultDisplay(slotProps.data, month), slotProps.data, formatCurrency) }}
              </template>
            </div>
            <div v-else class="font-normal text-muted-color">—</div>
          </div>
        </template>
      </Column>

      <!-- Total Column -->
      <Column field="total" frozen alignFrozen="right">
        <template #body="slotProps">
          <div class="text-center" :class="getCellTextColorClass(slotProps.data)">
            <div v-if="slotProps.data.total > 0" class="font-medium">
              {{ formatAmountWithSign(slotProps.data.total, slotProps.data, formatCurrency) }}
            </div>
            <span v-else class="font-normal text-muted-color">—</span>
          </div>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column field="actions" frozen alignFrozen="right">
        <template #body="slotProps">
          <div class="flex justify-center space-x-1">
            <!-- Virtual item actions -->
            <template v-if="slotProps.data.is_virtual">
              <Button @click="$emit('view-transactions')" icon="pi pi-eye" severity="secondary" size="small" text
                rounded title="View unlinked transactions" aria-label="View unlinked transactions"
                data-testid="view-unlinked-transactions-btn" />
            </template>

            <!-- Regular budget item actions -->
            <template v-else>
              <Button @click="$emit('edit-budget', slotProps.data)" icon="pi pi-pencil" severity="info" size="small"
                text rounded title="Edit budget item" aria-label="Edit budget item" data-testid="edit-budget-btn" />
              <Button @click="$emit('duplicate-budget', slotProps.data)" icon="pi pi-copy" severity="success"
                size="small" text rounded title="Duplicate budget item" aria-label="Duplicate budget item"
                data-testid="duplicate-budget-btn" />
              <Button @click="$emit('delete-budget', slotProps.data.id)" icon="pi pi-trash" severity="danger"
                size="small" text rounded title="Delete budget item" aria-label="Delete budget item"
                data-testid="delete-budget-btn" />
            </template>
          </div>
        </template>
      </Column>

      <!-- Smart Footer Summary Rows -->
      <ColumnGroup type="footer">
        <template v-if="showDetailedBreakdown">
          <!-- Income Breakdown -->
          <Row>
            <Column frozen alignFrozen="left" :footerStyle="childRowStyle">
              <template #footer>
                <div class="ml-6 text-muted-color">Income Total:</div>
              </template>
            </Column>
            <Column :footerStyle="childRowStyle">
              <template #footer>
                <div :class="getFooterCellClasses(getPreviousYearIncomeTotal(), 'income')">
                  {{ getPreviousYearIncomeTotal() }}
                </div>
              </template>
            </Column>
            <Column v-for="month in months" :key="month" :footerStyle="childRowStyle"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <div
                  :class="getFooterCellClasses(getRawValueForCSS(getMonthlyIncomeTotalWithSmartDefaults(month)), 'income')">
                  <template
                    v-if="getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.type === 'both'">
                    <div class="footer-smart-defaults">
                      <div class="actual">
                        {{ getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.actual }}
                      </div>
                      <div class="expected">
                        / {{ getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.expected }}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-if="getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.closed"
                      class="text-green-600 dark:text-green-400 cursor-help"
                      :title="`Month is closed - actual amount is displayed`">
                      {{ getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.value }}
                      <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                    </div>
                    <div v-else>
                      {{ getFooterDisplayData(getMonthlyIncomeTotalWithSmartDefaults(month), 'income')?.value }}
                    </div>
                  </template>
                </div>
              </template>
            </Column>
            <Column frozen alignFrozen="right" :footerStyle="childRowStyle">
              <template #footer>
                <div :class="getFooterCellClasses(getYearlyIncomeTotal(), 'income')">
                  {{ getYearlyIncomeTotal() }}
                </div>
              </template>
            </Column>
            <Column footer="" frozen alignFrozen="right" :footerStyle="childRowStyle" />
          </Row>

          <!-- Expenses Breakdown -->
          <Row>
            <Column frozen alignFrozen="left" :footerStyle="childRowStyle">
              <template #footer>
                <div class="ml-6 text-muted-color">Expenses Total:</div>
              </template>
            </Column>
            <Column :footerStyle="childRowStyle">
              <template #footer>
                <div :class="getFooterCellClasses(getPreviousYearExpensesTotal(), 'expense')">
                  {{ getPreviousYearExpensesTotal() }}
                </div>
              </template>
            </Column>
            <Column v-for="month in months" :key="month" :footerStyle="childRowStyle"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <div
                  :class="getFooterCellClasses(getRawValueForCSS(getMonthlyExpensesTotalWithSmartDefaults(month)), 'expense')">
                  <template
                    v-if="getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.type === 'both'">
                    <div class="footer-smart-defaults">
                      <div class="actual">
                        {{ getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.actual }}
                      </div>
                      <div class="expected">
                        / {{ getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.expected
                        }}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-if="getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.closed"
                      class="text-green-600 dark:text-green-400 cursor-help"
                      :title="`Month is closed - actual amount is displayed`">
                      {{ getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.value }}
                      <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                    </div>
                    <div v-else>
                      {{ getFooterDisplayData(getMonthlyExpensesTotalWithSmartDefaults(month), 'expense')?.value }}
                    </div>
                  </template>
                </div>
              </template>
            </Column>
            <Column frozen alignFrozen="right" :footerStyle="childRowStyle">
              <template #footer>
                <div :class="getFooterCellClasses(getYearlyExpensesTotal(), 'expense')">
                  {{ getYearlyExpensesTotal() }}
                </div>
              </template>
            </Column>
            <Column footer="" frozen alignFrozen="right" :footerStyle="childRowStyle" />
          </Row>

          <template v-if="showDetailedInvestmentBreakdown">
            <!-- Investment Returns -->
            <Row>
              <Column frozen alignFrozen="left" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div class="ml-12 text-muted-color">Investment in:</div>
                </template>
              </Column>
              <Column :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div :class="getFooterCellClasses(getPreviousYearInvestmentIncomingTotal(), 'income')">
                    {{ getPreviousYearInvestmentIncomingTotal() }}
                  </div>
                </template>
              </Column>
              <Column v-for="month in months" :key="month" :footerStyle="grandchildRowStyle"
                :class="getMonthColumnClass(month)">
                <template #footer>
                  <div
                    :class="getFooterCellClasses(getRawValueForCSS(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month)), 'income')">
                    <template
                      v-if="getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month), 'income')?.type === 'both'">
                      <div class="footer-smart-defaults">
                        <div class="actual">
                          {{ getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month),
                            'income')?.actual }}
                        </div>
                        <div class="expected">
                          / {{ getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month),
                            'income')?.expected }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-if="getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month), 'income')?.closed"
                        class="text-green-600 dark:text-green-400 cursor-help"
                        :title="`Month is closed - actual amount is displayed`">
                        {{ getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month),
                          'income')?.value }}
                        <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                      </div>
                      <div v-else>
                        {{ getFooterDisplayData(getMonthlyInvestmentIncomingTotalWithSmartDefaults(month),
                          'income')?.value }}
                      </div>
                    </template>
                  </div>
                </template>
              </Column>
              <Column frozen alignFrozen="right" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div :class="getFooterCellClasses(getYearlyInvestmentIncomingTotal(), 'income')">
                    {{ getYearlyInvestmentIncomingTotal() }}
                  </div>
                </template>
              </Column>
              <Column footer="" frozen alignFrozen="right" :footerStyle="grandchildRowStyle" />
            </Row>

            <!-- Investment Purchases -->
            <Row>
              <Column frozen alignFrozen="left" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div class="ml-12 text-muted-color">Investment out:</div>
                </template>
              </Column>
              <Column :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div :class="getFooterCellClasses(getPreviousYearInvestmentOutgoingTotal(), 'expense')">
                    {{ getPreviousYearInvestmentOutgoingTotal() }}
                  </div>
                </template>
              </Column>
              <Column v-for="month in months" :key="month" :footerStyle="grandchildRowStyle"
                :class="getMonthColumnClass(month)">
                <template #footer>
                  <div
                    :class="getFooterCellClasses(getRawValueForCSS(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month)), 'expense')">
                    <template
                      v-if="getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month), 'expense')?.type === 'both'">
                      <div class="footer-smart-defaults">
                        <div class="actual">
                          {{ getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month),
                            'expense')?.actual }}
                        </div>
                        <div class="expected">
                          / {{ getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month),
                            'expense')?.expected }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-if="getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month), 'expense')?.closed"
                        class="text-green-600 dark:text-green-400 cursor-help"
                        :title="`Month is closed - actual amount is displayed`">
                        {{ getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month),
                          'expense')?.value }}
                        <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                      </div>
                      <div v-else>
                        {{ getFooterDisplayData(getMonthlyInvestmentOutgoingTotalWithSmartDefaults(month),
                          'expense')?.value }}
                      </div>
                    </template>
                  </div>
                </template>
              </Column>
              <Column frozen alignFrozen="right" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <div :class="getFooterCellClasses(getYearlyInvestmentOutgoingTotal(), 'expense')">
                    {{ getYearlyInvestmentOutgoingTotal() }}
                  </div>
                </template>
              </Column>
              <Column footer="" frozen alignFrozen="right" :footerStyle="grandchildRowStyle" />
            </Row>
          </template>
          <!-- Net Investment -->
          <Row>
            <Column footer="" frozen alignFrozen="left"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'">
              <template #footer>
                <div class="ml-6 flex items-center space-x-2">
                  <Button @click="showDetailedInvestmentBreakdown = !showDetailedInvestmentBreakdown"
                    :icon="showDetailedInvestmentBreakdown ? 'pi pi-chevron-up' : 'pi pi-chevron-right'" text rounded
                    size="small" severity="secondary"
                    :title="showDetailedInvestmentBreakdown ? 'Hide detailed breakdown' : 'Show detailed breakdown'" />
                  <span class="text-muted-color">Net Investment</span>
                </div>
              </template>
            </Column>
            <Column :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'">
              <template #footer>
                <div :class="getFooterCellClasses(getPreviousYearInvestmentNetTotal(), 'net')">
                  {{ getPreviousYearInvestmentNetTotal() }}
                </div>
              </template>
            </Column>
            <Column v-for="month in months" :key="month"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <div
                  :class="getFooterCellClasses(getRawValueForCSS(getMonthlyInvestmentNetTotalWithSmartDefaults(month)), 'net')">
                  <template
                    v-if="getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.type === 'both'">
                    <div class="footer-smart-defaults">
                      <div class="actual">
                        {{ getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.actual }}
                      </div>
                      <div class="expected">
                        / {{ getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.expected
                        }}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-if="getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.closed"
                      class="text-green-600 dark:text-green-400 cursor-help"
                      :title="`Month is closed - actual amount is displayed`">
                      {{ getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.value }}
                      <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                    </div>
                    <div v-else>
                      {{ getFooterDisplayData(getMonthlyInvestmentNetTotalWithSmartDefaults(month), 'net')?.value }}
                    </div>
                  </template>
                </div>
              </template>
            </Column>
            <Column frozen alignFrozen="right"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'">
              <template #footer>
                <div :class="getFooterCellClasses(getYearlyInvestmentNetTotal(), 'net')">
                  {{ getYearlyInvestmentNetTotal() }}
                </div>
              </template>
            </Column>
            <Column footer="" frozen alignFrozen="right"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'" />
          </Row>
        </template>
        <!-- Core Summary Rows (Always Visible) -->
        <Row>
          <Column frozen alignFrozen="left" :footerStyle="parentRowStyle">
            <template #footer>
              <div class="flex items-center space-x-2">
                <Button @click="showDetailedBreakdown = !showDetailedBreakdown"
                  :icon="showDetailedBreakdown ? 'pi pi-chevron-up' : 'pi pi-chevron-right'" text rounded
                  severity="secondary"
                  :title="showDetailedBreakdown ? 'Hide detailed breakdown' : 'Show detailed breakdown'" />
                <span>Net Balance</span>
              </div>
            </template>
          </Column>
          <Column :footerStyle="parentRowStyle">
            <template #footer>
              <div :class="getFooterCellClasses(getPreviousYearNetTotal(), 'net')">
                {{ getPreviousYearNetTotal() }}
              </div>
            </template>
          </Column>
          <Column v-for="month in months" :key="month" :footerStyle="parentRowStyle"
            :class="getMonthColumnClass(month)">
            <template #footer>
              <div :class="getFooterCellClasses(getRawValueForCSS(getMonthlyNetTotalWithSmartDefaults(month)), 'net')">
                <template
                  v-if="getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.type === 'both'">
                  <div class="footer-smart-defaults">
                    <div class="actual">
                      {{ getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.actual }}
                    </div>
                    <div class="expected">
                      / {{ getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.expected }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div v-if="getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.closed"
                    class="text-green-600 dark:text-green-400 cursor-help"
                    :title="`Month is closed - actual amount is displayed`">
                    {{ getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.value }}
                    <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                  </div>
                  <div v-else>
                    {{ getFooterDisplayData(getMonthlyNetTotalWithSmartDefaults(month), 'net')?.value }}
                  </div>
                </template>
              </div>
            </template>
          </Column>
          <Column frozen alignFrozen="right" :footerStyle="parentRowStyle">
            <template #footer>
              <div :class="getFooterCellClasses(getYearlyNetTotal(), 'net')">
                {{ getYearlyNetTotal() }}
              </div>
            </template>
          </Column>
          <Column footer="" frozen alignFrozen="right" :footerStyle="parentRowStyle" />
        </Row>

        <Row>
          <Column footer="Cumulative Savings:" frozen alignFrozen="left" :footerStyle="parentRowStyle" />
          <Column :footerStyle="parentRowStyle">
            <template #footer>
              <div :class="getFooterCellClasses(getPreviousYearSavingsTotal(), 'net')">
                {{ getPreviousYearSavingsTotal() }}
              </div>
            </template>
          </Column>
          <Column v-for="month in months" :key="month" :footerStyle="parentRowStyle"
            :class="getMonthColumnClass(month)">
            <template #footer>
              <div
                :class="getFooterCellClasses(getRawValueForCSS(getMonthlySavingsTotalWithSmartDefaults(month)), 'net')">
                <template
                  v-if="getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.type === 'both'">
                  <div class="footer-smart-defaults">
                    <div class="actual">
                      {{ getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.actual }}
                    </div>
                    <div class="expected">
                      / {{ getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.expected }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div v-if="getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.closed"
                    class="text-green-600 dark:text-green-400 cursor-help"
                    :title="`Month is closed - actual amount is displayed`">
                    {{ getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.value }}
                    <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
                  </div>
                  <div v-else>
                    {{ getFooterDisplayData(getMonthlySavingsTotalWithSmartDefaults(month), 'net')?.value }}
                  </div>
                </template>
              </div>
            </template>
          </Column>
          <Column frozen alignFrozen="right" :footerStyle="parentRowStyle">
            <template #footer>
              <div :class="getFooterCellClasses(getYearlySavingsTotal(), 'net')">
                {{ getYearlySavingsTotal() }}
              </div>
            </template>
          </Column>
          <Column footer="" frozen alignFrozen="right" :footerStyle="parentRowStyle" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<style scoped>
/* This is a hack to make the footer not sticky */
:deep(.p-datatable-tfoot) {
  position: relative !important;
}

:deep(.p-datatable-scrollable .p-datatable-frozen-column:nth-last-child(1)) {
  inset-inline-end: -1px !important;
  min-width: 122px;
}

:deep(.p-datatable-scrollable .p-datatable-frozen-column) {
  z-index: 1;
}

:deep(.p-datatable-scrollable .p-datatable-frozen-column:nth-last-child(2)) {
  inset-inline-end: 120px !important;
}

:deep(.p-datatable-scrollable-table > .p-datatable-thead) {
  z-index: 2;
}

:deep(.p-datatable-gridlines .p-datatable-tfoot > tr:first-child > td) {
  border-top-color: var(--p-green-500);
}

/* Smart defaults display styling */
.actual-expected-display {
  line-height: 1.2;
}

.actual-expected-display .actual {
  font-weight: 600;
  color: var(--primary-700);
}

.actual-expected-display .expected {
  color: var(--gray-500);
  font-size: 0.875em;
}

/* Dark theme overrides */
.dark .actual-expected-display .actual {
  color: var(--primary-300);
}

.dark .actual-expected-display .expected {
  color: var(--gray-400);
}

/* Footer smart defaults styling */
.footer-smart-defaults {
  line-height: 1.1;
  font-size: 0.9em;
}

.footer-smart-defaults .actual {
  font-weight: 600;
  color: var(--primary-700);
}

.footer-smart-defaults .expected {
  color: var(--gray-500);
  font-size: 0.85em;
}

/* Dark theme overrides for footer */
.dark .footer-smart-defaults .actual {
  color: var(--primary-300);
}

.dark .footer-smart-defaults .expected {
  color: var(--gray-400);
}

:deep(.p-datatable-column-header-content) {
  display: block;
}

:deep(.p-datatable-mask.p-overlay-mask) {
  z-index: 3;
}
</style>
