<script setup>
import { useBudgetDataTable } from '@/composables/useBudgetDataTable.js'
import { MONTHS } from '@/constants/budgetConstants.js'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { computed, ref } from 'vue'
import BudgetCell from './BudgetCell.vue'
import FooterDualModeCell from './FooterDualModeCell.vue'

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

  // Previous year dual calculation functions (return both expected and actual)
  calculatePreviousYearIncomeTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearExpensesTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearNetTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotalWithDual: {
    type: Function,
    default: null
  },
  calculatePreviousYearSavingsTotalWithDual: {
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

  // Grand total actual calculation functions
  calculateGrandTotalActualInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateGrandTotalActualInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateGrandTotalActualInvestmentNet: {
    type: Function,
    default: null
  },

  // Dual display mode
  dualMode: {
    type: String,
    default: 'both', // 'both', 'actual', 'expected'
    validator: (value) => ['both', 'actual', 'expected'].includes(value)
  },

  // Copy from previous year functionality
  canCopyFromPreviousYear: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget',
  'view-transactions',
  'update:dualMode',
  'add-budget',
  'retry-load',
  'copy-from-previous-year'
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

// Computed properties for empty state logic
const hasActiveFilter = computed(() => {
  return filters.value.global.value && filters.value.global.value.trim() !== ''
})

const hasNoDataForYear = computed(() => {
  return !props.loading && props.budgetItems && props.budgetItems.length === 0
})

// Methods for empty state actions
const clearFilters = () => {
  filters.value.global.value = null
}

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


const getDualDisplay = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const expectedAmount = getMonthlyAmount(budget, month)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0
  const monthClosed = isMonthClosed(monthIndex)

  // Return based on display mode
  switch (props.dualMode) {
    case 'actual':
      return { type: 'single', value: actualAmount, closed: monthClosed }
    case 'expected':
      return { type: 'single', value: expectedAmount, closed: monthClosed }
    case 'both':
    default:
      // For 'both' mode, always return both values
      // The template will handle closed month display logic
      return {
        type: 'both',
        actual: actualAmount,
        expected: expectedAmount,
        closed: monthClosed
      }
  }
}

const getDualTooltip = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const expectedAmount = getMonthlyAmount(budget, month)
  const actualAmount = props.getActualAmount ? props.getActualAmount(budget, monthIndex) : 0
  const monthClosed = isMonthClosed(monthIndex)

  let tooltip = `Expected: ${props.formatCurrency(expectedAmount)}<br>Actual: ${props.formatCurrency(actualAmount)}`

  // Add special messages for different scenarios
  if (monthClosed) {
    if (props.dualMode === 'both') {
      tooltip += '<br><br>Month is closed - actual amount is displayed (actual = expected)'
    } else {
      tooltip += '<br><br>Month is closed - actual amount is displayed'
    }
  } else if (expectedAmount === 0 && actualAmount === 0) {
    tooltip += '<br><br>No budget or actual amounts for this month'
  } else if (expectedAmount === 0) {
    tooltip += '<br><br>No budget amount set for this month'
  } else if (actualAmount === 0) {
    tooltip += '<br><br>No actual amount recorded for this month'
  }

  return tooltip
}

// Dual mode version for total amounts
const getTotalAmountWithDual = (budget) => {
  const expectedTotal = budget.total || 0
  // For total amounts, we can calculate actual from monthly actuals if available
  let actualTotal = expectedTotal
  if (props.getActualAmount) {
    actualTotal = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      actualTotal += props.getActualAmount(budget, monthIndex) || 0
    }
  }

  // Return data structure based on current dual mode
  switch (props.dualMode) {
    case 'actual':
      return {
        type: 'single',
        value: actualTotal,
        closed: false
      }
    case 'expected':
      return {
        type: 'single',
        value: expectedTotal,
        closed: false
      }
    case 'both':
    default:
      // For totals, if both are 0, we'll handle this in renderCellContent
      return {
        expected: expectedTotal,
        actual: actualTotal,
        closed: false,
        type: 'both'
      }
  }
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

// Footer total calculations with dual mode support

const getMonthlyIncomeTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}


const getMonthlyExpensesTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}


const getMonthlyNetTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}


// Investment Returns (Investment Incoming)

const getMonthlyInvestmentIncomingTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}


// Investment Purchases (Investment Outgoing)

const getMonthlyInvestmentOutgoingTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}



const getMonthlySavingsTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}



// Dual mode versions for yearly totals
const getYearlyIncomeTotalWithDual = () => {
  const expectedTotal = props.calculateGrandTotalIncome()
  // For yearly totals, we can calculate actual from monthly actuals if available
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualIncome) {
    actualTotal = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      actualTotal += props.calculateMonthlyActualIncome(monthIndex)
    }
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false, // Yearly totals are never "closed"
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlyExpensesTotalWithDual = () => {
  const expectedTotal = props.calculateGrandTotalExpenses()
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualExpenses) {
    actualTotal = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      actualTotal += props.calculateMonthlyActualExpenses(monthIndex)
    }
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false,
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlyNetTotalWithDual = () => {
  const expectedTotal = props.calculateGrandTotal()
  let actualTotal = expectedTotal
  if (props.calculateMonthlyActualTotal) {
    actualTotal = 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      actualTotal += props.calculateMonthlyActualTotal(monthIndex)
    }
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false,
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlyInvestmentIncomingTotalWithDual = () => {
  // Calculate expected total from budget items
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      expectedTotal += item.total || 0
    }
  })

  // Calculate actual total using the provided calculation function
  let actualTotal = expectedTotal
  if (props.calculateGrandTotalActualInvestmentIncoming) {
    actualTotal = props.calculateGrandTotalActualInvestmentIncoming()
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false,
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlyInvestmentOutgoingTotalWithDual = () => {
  // Calculate expected total from budget items
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      expectedTotal += item.total || 0
    }
  })

  // Calculate actual total using the provided calculation function
  let actualTotal = expectedTotal
  if (props.calculateGrandTotalActualInvestmentOutgoing) {
    actualTotal = props.calculateGrandTotalActualInvestmentOutgoing()
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false,
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlyInvestmentNetTotalWithDual = () => {
  // Calculate expected total from budget items
  let expectedTotal = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      expectedTotal += item.total || 0
    }
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      expectedTotal -= item.total || 0
    }
  })

  // Calculate actual total using the provided calculation function
  let actualTotal = expectedTotal
  if (props.calculateGrandTotalActualInvestmentNet) {
    actualTotal = props.calculateGrandTotalActualInvestmentNet()
  }

  return {
    expected: expectedTotal,
    actual: actualTotal,
    closed: false,
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

const getYearlySavingsTotalWithDual = () => {
  // Yearly savings is the same as December's cumulative savings
  return getMonthlySavingsTotalWithDual('Dec')
}



// Net Investment

const getMonthlyInvestmentNetTotalWithDual = (month) => {
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
    type: 'both' // Use 'both' to indicate dual mode display
  }
}

// Dual mode versions for previous year totals
const getPreviousYearIncomeTotalWithDual = () => {
  if (props.calculatePreviousYearIncomeTotalWithDual) {
    const dualData = props.calculatePreviousYearIncomeTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearExpensesTotalWithDual = () => {
  if (props.calculatePreviousYearExpensesTotalWithDual) {
    const dualData = props.calculatePreviousYearExpensesTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearNetTotalWithDual = () => {
  if (props.calculatePreviousYearNetTotalWithDual) {
    const dualData = props.calculatePreviousYearNetTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearInvestmentIncomingTotalWithDual = () => {
  if (props.calculatePreviousYearInvestmentIncomingTotalWithDual) {
    const dualData = props.calculatePreviousYearInvestmentIncomingTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearInvestmentOutgoingTotalWithDual = () => {
  if (props.calculatePreviousYearInvestmentOutgoingTotalWithDual) {
    const dualData = props.calculatePreviousYearInvestmentOutgoingTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearSavingsTotalWithDual = () => {
  if (props.calculatePreviousYearSavingsTotalWithDual) {
    const dualData = props.calculatePreviousYearSavingsTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
}

const getPreviousYearInvestmentNetTotalWithDual = () => {
  if (props.calculatePreviousYearInvestmentNetTotalWithDual) {
    const dualData = props.calculatePreviousYearInvestmentNetTotalWithDual()
    return {
      expected: dualData.expected,
      actual: dualData.actual,
      closed: false, // Previous year data is not "closed" - it's historical data
      type: 'both' // Use 'both' to indicate dual mode display
    }
  }
  return null
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

// Helper function to render cell content
const renderCellContent = (data, month = null, isTotal = false) => {
  try {
    const dualData = month ? getDualDisplay(data, month) :
      (isTotal ? getTotalAmountWithDual(data) : data)

    if (!dualData) return null

    // For single mode, we already have the data we need
    if (dualData.type === 'single') {
      return {
        display: {
          type: 'single',
          value: dualData.value === 0 ? '—' :
            formatAmountWithSign(dualData.value, data, props.formatCurrency),
          closed: dualData.closed,
          classes: dualData.closed ? '' : ''
        },
        tooltip: month ? getDualTooltip(data, month) :
          (isTotal ? `Total: ${props.formatCurrency(data.total || 0)}` : `Expected: ${props.formatCurrency(data.total || 0)}`)
      }
    }

    // For both mode, format the values
    if (dualData.type === 'both') {
      // For closed months, show only actual value since actual = expected
      if (dualData.closed) {
        const actualValue = dualData.actual === 0 ? '—' :
          formatAmountWithSign(dualData.actual, data, props.formatCurrency)

        return {
          display: {
            type: 'single',
            value: actualValue,
            closed: true,
            classes: ''
          },
          tooltip: month ? getDualTooltip(data, month) :
            (isTotal ? `Total: ${props.formatCurrency(data.total || 0)}` : `Expected: ${props.formatCurrency(data.total || 0)}`)
        }
      }

      // For open months, check if both are 0 or "—"
      const actualValue = dualData.actual === 0 ? '—' :
        formatAmountWithSign(dualData.actual, data, props.formatCurrency)
      const expectedValue = dualData.expected === 0 ? '—' :
        formatAmountWithSign(dualData.expected, data, props.formatCurrency)

      // If both are "—", show single "—"
      if (actualValue === '—' && expectedValue === '—') {
        return {
          display: {
            type: 'single',
            value: '—',
            closed: false,
            classes: ''
          },
          tooltip: month ? getDualTooltip(data, month) :
            (isTotal ? `Total: ${props.formatCurrency(data.total || 0)}` : `Expected: ${props.formatCurrency(data.total || 0)}`)
        }
      }

      // Otherwise show both values
      return {
        display: {
          type: 'both',
          actual: actualValue,
          expected: expectedValue,
          closed: false
        },
        tooltip: month ? getDualTooltip(data, month) :
          (isTotal ? `Total: ${props.formatCurrency(data.total || 0)}` : `Expected: ${props.formatCurrency(data.total || 0)}`)
      }
    }

    return null
  } catch (error) {
    console.error('Error in renderCellContent:', error, { data, month, isTotal })
    return null
  }
}

// Helper function to render dual mode cell content
const renderDualModeCell = (data, month = null, isTotal = false) => {
  try {
    const cellContent = renderCellContent(data, month, isTotal)
    if (!cellContent) return null

    const { display, tooltip } = cellContent

    // Return the display data directly since it's already formatted
    return {
      ...display,
      tooltip
    }
  } catch (error) {
    console.error('Error in renderDualModeCell:', error, { data, month, isTotal })
    return null
  }
}

// Helper function to render cell template
const renderCellTemplate = (data, month = null, isTotal = false) => {
  try {
    const cellData = renderDualModeCell(data, month, isTotal)
    if (!cellData) return null

    // Add template property to distinguish between 'both' and 'single' modes
    return {
      template: cellData.type,
      ...cellData
    }
  } catch (error) {
    console.error('Error in renderCellTemplate:', error, { data, month, isTotal })
    return null
  }
}
</script>

<template>
  <div class="card">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-blue-600">New DataTable Implementation (Testing)</h3>
    </div>

    <!-- Header Controls - Only show when there's data or loading -->
    <div v-if="!hasNoDataForYear" class="flex justify-between items-center mb-4">
      <!-- Dual Mode Filter -->
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Display Mode:</span>
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <Button @click="$emit('update:dualMode', 'both')" :label="'Both'" :text="props.dualMode !== 'both'"
            :outlined="props.dualMode !== 'both'" size="small" class="mr-1" />
          <Button @click="$emit('update:dualMode', 'actual')" :label="'Actual'" :text="props.dualMode !== 'actual'"
            :outlined="props.dualMode !== 'actual'" size="small" class="mr-1" />
          <Button @click="$emit('update:dualMode', 'expected')" :label="'Expected'"
            :text="props.dualMode !== 'expected'" :outlined="props.dualMode !== 'expected'" size="small" />
        </div>
      </div>

      <!-- Search Input -->
      <div class="flex items-center justify-end gap-3">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters['global'].value" placeholder="Search budget items..." class="w-80" />
          <InputIcon v-if="hasActiveFilter" class="pi pi-times cursor-pointer hover:text-red-500"
            @click="clearFilters" />
        </IconField>

        <!-- Filter Active Indicator -->
        <Tag v-if="hasActiveFilter" value="Filtered" severity="info" class="text-xs" />
      </div>
    </div>

    <!-- DataTable with Column Groups - Only show when there's data or loading -->
    <DataTable v-if="!hasNoDataForYear" :value="flattenedBudgetData" :loading="loading" :filters="filters"
      filterDisplay="menu" :globalFilterFields="['name', 'category', 'type', 'investment_direction']" tableStyle=""
      scrollable scrollHeight="70vh" class="budget-datatable" showGridlines>
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16">
          <!-- Simple icon -->
          <div class="mb-6">
            <i class="pi pi-inbox text-4xl text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- Content -->
          <div class="text-center max-w-md">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {{ hasActiveFilter ? 'No Matching Budget Items' : 'No Budget Data for ' + selectedYear }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {{ hasActiveFilter
                ? 'Try adjusting your search criteria or clearing the filter to see all budget items.'
                : 'Start by adding your first budget item to begin tracking your finances for this year.'
              }}
            </p>

            <!-- Action buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <Button v-if="hasActiveFilter" @click="clearFilters" icon="pi pi-filter-slash" label="Clear Filter"
                severity="secondary" size="small" />
              <Button v-if="!hasActiveFilter" @click="$emit('add-budget')" icon="pi pi-plus" label="Add Budget Item"
                severity="primary" size="small" />
              <Button v-if="!hasActiveFilter && canCopyFromPreviousYear" @click="$emit('copy-from-previous-year')"
                icon="pi pi-copy" :label="`Copy from ${selectedYear - 1}`" severity="secondary" size="small" />
            </div>
          </div>
        </div>
      </template>
      <template #loading>
        <div class="p-datatable-loading-content w-full overflow-x-auto">
          <div class="skeleton-table-container">
            <!-- Skeleton rows for budget items -->
            <div v-for="i in 4" :key="i" class="p-datatable-loading-row w-full">
              <div class="flex items-stretch w-full skeleton-row">
                <!-- Budget Item Name Column -->
                <div class="w-64 p-4 flex-shrink-0 skeleton-cell flex flex-col justify-center">
                  <Skeleton width="100%" height="1.5rem" class="mb-2" />
                  <Skeleton width="60%" height="1rem" />
                </div>

                <!-- Previous Year Column -->
                <div class="w-32 p-3 flex-shrink-0 skeleton-cell flex items-center justify-center">
                  <Skeleton width="80%" height="1.5rem" />
                </div>

                <!-- Monthly Columns -->
                <div v-for="j in 4" :key="j"
                  class="w-24 p-2 flex-shrink-0 skeleton-cell flex items-center justify-center">
                  <Skeleton width="90%" height="1.5rem" />
                </div>

                <!-- Total Column -->
                <div class="w-32 p-3 flex-shrink-0 skeleton-cell flex items-center justify-center">
                  <Skeleton width="85%" height="1.5rem" />
                </div>

                <!-- Spacer to push Actions to the right -->
                <div class="flex-1"></div>

                <!-- Actions Column - Fixed to the right -->
                <div class="p-3 flex-shrink-0 flex items-center justify-center">
                  <div class="flex gap-1">
                    <Skeleton shape="circle" size="2rem" class="mr-2" />
                    <Skeleton shape="circle" size="2rem" class="mr-2" />
                    <Skeleton shape="circle" size="2rem" class="mr-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Error State -->
      <template v-if="error">
        <div class="flex flex-col items-center justify-center py-16">
          <!-- Simple error icon -->
          <div class="mb-6">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 dark:text-red-400"></i>
          </div>

          <!-- Error content -->
          <div class="text-center max-w-md">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Loading Budget Data</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ error }}</p>

            <!-- Retry button -->
            <Button @click="$emit('retry-load')" icon="pi pi-refresh" label="Try Again" severity="secondary"
              size="small" />
          </div>
        </div>
      </template>
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
          <BudgetCell :data="slotProps.data" :renderCellTemplate="renderCellTemplate"
            :getCellTextColorClass="getCellTextColorClass" />
        </template>
      </Column>

      <!-- Monthly Columns -->
      <Column v-for="month in months" :key="month" :field="month.toLowerCase()" :class="getMonthColumnClass(month)">
        <template #body="slotProps">
          <BudgetCell :data="slotProps.data" :month="month" :renderCellTemplate="renderCellTemplate"
            :getCellTextColorClass="getCellTextColorClass" />
        </template>
      </Column>

      <!-- Total Column -->
      <Column field="total" frozen alignFrozen="right">
        <template #body="slotProps">
          <BudgetCell :data="slotProps.data" :isTotal="true" :renderCellTemplate="renderCellTemplate"
            :getCellTextColorClass="getCellTextColorClass" />
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

      <!-- Footer Summary Rows -->
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
                <FooterDualModeCell :data="getPreviousYearIncomeTotalWithDual()" itemType="income"
                  :closedTooltip="`Previous year data - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column v-for="month in months" :key="month" :footerStyle="childRowStyle"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <FooterDualModeCell :data="getMonthlyIncomeTotalWithDual(month)" itemType="income"
                  :closedTooltip="`Month is closed - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column frozen alignFrozen="right" :footerStyle="childRowStyle">
              <template #footer>
                <FooterDualModeCell :data="getYearlyIncomeTotalWithDual()" itemType="income"
                  :closedTooltip="`Yearly total - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
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
                <FooterDualModeCell :data="getPreviousYearExpensesTotalWithDual()" itemType="expense"
                  :closedTooltip="`Previous year data - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column v-for="month in months" :key="month" :footerStyle="childRowStyle"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <FooterDualModeCell :data="getMonthlyExpensesTotalWithDual(month)" itemType="expense"
                  :closedTooltip="`Month is closed - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column frozen alignFrozen="right" :footerStyle="childRowStyle">
              <template #footer>
                <FooterDualModeCell :data="getYearlyExpensesTotalWithDual()" itemType="expense"
                  :closedTooltip="`Yearly total - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
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
                  <FooterDualModeCell :data="getPreviousYearInvestmentIncomingTotalWithDual()" itemType="income"
                    :closedTooltip="`Previous year data - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
                </template>
              </Column>
              <Column v-for="month in months" :key="month" :footerStyle="grandchildRowStyle"
                :class="getMonthColumnClass(month)">
                <template #footer>
                  <FooterDualModeCell :data="getMonthlyInvestmentIncomingTotalWithDual(month)" itemType="income"
                    :closedTooltip="`Month is closed - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
                </template>
              </Column>
              <Column frozen alignFrozen="right" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <FooterDualModeCell :data="getYearlyInvestmentIncomingTotalWithDual()" itemType="income"
                    :closedTooltip="`Yearly total - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
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
                  <FooterDualModeCell :data="getPreviousYearInvestmentOutgoingTotalWithDual()" itemType="expense"
                    :closedTooltip="`Previous year data - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
                </template>
              </Column>
              <Column v-for="month in months" :key="month" :footerStyle="grandchildRowStyle"
                :class="getMonthColumnClass(month)">
                <template #footer>
                  <FooterDualModeCell :data="getMonthlyInvestmentOutgoingTotalWithDual(month)" itemType="expense"
                    :closedTooltip="`Month is closed - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
                </template>
              </Column>
              <Column frozen alignFrozen="right" :footerStyle="grandchildRowStyle">
                <template #footer>
                  <FooterDualModeCell :data="getYearlyInvestmentOutgoingTotalWithDual()" itemType="expense"
                    :closedTooltip="`Yearly total - actual amount is displayed`"
                    :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency"
                    :dualMode="dualMode" />
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
                <FooterDualModeCell :data="getPreviousYearInvestmentNetTotalWithDual()" itemType="net"
                  :closedTooltip="`Previous year data - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column v-for="month in months" :key="month"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'"
              :class="getMonthColumnClass(month)">
              <template #footer>
                <FooterDualModeCell :data="getMonthlyInvestmentNetTotalWithDual(month)" itemType="net"
                  :closedTooltip="`Month is closed - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
              </template>
            </Column>
            <Column frozen alignFrozen="right"
              :footerStyle="childRowStyle + 'border-bottom-color: var(--p-green-500);'">
              <template #footer>
                <FooterDualModeCell :data="getYearlyInvestmentNetTotalWithDual()" itemType="net"
                  :closedTooltip="`Yearly total - actual amount is displayed`"
                  :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
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
              <FooterDualModeCell :data="getPreviousYearNetTotalWithDual()" itemType="net"
                :closedTooltip="`Previous year data - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column v-for="month in months" :key="month" :footerStyle="parentRowStyle"
            :class="getMonthColumnClass(month)">
            <template #footer>
              <FooterDualModeCell :data="getMonthlyNetTotalWithDual(month)" itemType="net"
                :closedTooltip="`Month is closed - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column frozen alignFrozen="right" :footerStyle="parentRowStyle">
            <template #footer>
              <FooterDualModeCell :data="getYearlyNetTotalWithDual()" itemType="net"
                :closedTooltip="`Yearly total - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column footer="" frozen alignFrozen="right" :footerStyle="parentRowStyle" />
        </Row>

        <Row>
          <Column footer="Cumulative Savings:" frozen alignFrozen="left" :footerStyle="parentRowStyle" />
          <Column :footerStyle="parentRowStyle">
            <template #footer>
              <FooterDualModeCell :data="getPreviousYearSavingsTotalWithDual()" itemType="net"
                :closedTooltip="`Previous year data - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column v-for="month in months" :key="month" :footerStyle="parentRowStyle"
            :class="getMonthColumnClass(month)">
            <template #footer>
              <FooterDualModeCell :data="getMonthlySavingsTotalWithDual(month)" itemType="net"
                :closedTooltip="`Month is closed - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column frozen alignFrozen="right" :footerStyle="parentRowStyle">
            <template #footer>
              <FooterDualModeCell :data="getYearlySavingsTotalWithDual()" itemType="net"
                :closedTooltip="`Yearly total - actual amount is displayed`"
                :formatAmountWithSign="formatAmountWithSign" :formatCurrency="formatCurrency" :dualMode="dualMode" />
            </template>
          </Column>
          <Column footer="" frozen alignFrozen="right" :footerStyle="parentRowStyle" />
        </Row>
      </ColumnGroup>
    </DataTable>

    <!-- Standalone Empty State for No Data for Year -->
    <div v-if="hasNoDataForYear" class="flex flex-col items-center justify-center py-16">
      <!-- Simple icon -->
      <div class="mb-6">
        <i class="pi pi-inbox text-4xl text-gray-400 dark:text-gray-500"></i>
      </div>

      <!-- Content -->
      <div class="text-center max-w-md">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Budget Data for {{ selectedYear }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Start by adding your first budget item to begin tracking your finances for this year.
        </p>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button @click="$emit('add-budget')" icon="pi pi-plus" label="Add Budget Item" severity="primary"
            size="small" />
          <Button v-if="canCopyFromPreviousYear" @click="$emit('copy-from-previous-year')" icon="pi pi-copy"
            :label="`Copy from ${selectedYear - 1}`" severity="secondary" size="small" />
        </div>
      </div>
    </div>
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

/* Cell styling is now handled by BudgetCell component */

:deep(.p-datatable-column-header-content) {
  display: block;
}

:deep(.p-datatable-mask) {
  background-color: var(--surface-card);
  align-items: start;
  justify-content: start;
}

:deep(.p-datatable-mask.p-overlay-mask) {
  z-index: 3;
}

/* Skeleton loading styles */
.p-datatable-loading-content {
  width: 100%;
  min-height: 100%;
  background-color: var(--surface-card);
  border: 1px solid var(--p-datatable-header-cell-border-color);
  border-radius: 6px;
}

.skeleton-table-container {
  width: 100%;
}

.p-datatable-loading-row {
  width: 100%;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--p-datatable-header-cell-border-color);
}

/* Ensure skeleton content fills the available space */
:deep(.p-datatable-loading-content) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Vertical border styling for skeleton cells */
.skeleton-row {
  position: relative;
}

.skeleton-cell {
  position: relative;
}

.skeleton-cell:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background-color: var(--p-datatable-header-cell-border-color);
}
</style>
