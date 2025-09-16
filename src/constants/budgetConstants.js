// Budget constants
// Months array, budget types, categories by type, default values

// Months array
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Full month names for dropdowns
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Month options for dropdowns
export const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  value: index,
  label: name
}))

// Budget types
export const BUDGET_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  INVESTMENT: 'investment'
}

// Budget type icons/emojis
export const BUDGET_TYPE_ICONS = {
  [BUDGET_TYPES.INCOME]: '💰',
  [BUDGET_TYPES.EXPENSE]: '💸',
  [BUDGET_TYPES.INVESTMENT]: '📈'
}

// Budget type labels
export const BUDGET_TYPE_LABELS = {
  [BUDGET_TYPES.INCOME]: 'Income',
  [BUDGET_TYPES.EXPENSE]: 'Expenses',
  [BUDGET_TYPES.INVESTMENT]: 'Investments'
}

// Enhanced summary row types and configurations
export const SUMMARY_ROWS = {
  NET_BALANCE: {
    id: 'net-balance',
    label: 'Net Monthly Balance',
    symbol: '=',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    stickyBgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    fontWeight: 'font-bold',
    fontSize: 'text-base',
    showCondition: (selectedTypeFilter, hasAnyData) => selectedTypeFilter === 'all' && hasAnyData
  },
  NET_INVESTMENT: {
    id: 'net-investment',
    label: 'Net Investment',
    subtitle: '( Returns - Purchases)',
    symbol: '📈',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    stickyBgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    fontWeight: 'font-semibold',
    fontSize: 'text-sm',
    showCondition: (selectedTypeFilter, hasAnyData, hasInvestmentData) => (selectedTypeFilter === 'all' || selectedTypeFilter === 'investment') && hasInvestmentData
  },
  SAVINGS: {
    id: 'savings',
    label: 'Cumulative Savings',
    subtitle: '(Running Total)',
    symbol: '💰',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    stickyBgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    fontWeight: 'font-bold',
    fontSize: 'text-base',
    showCondition: (selectedTypeFilter, hasAnyData) => selectedTypeFilter === 'all' && hasAnyData
  },
  TOTAL_INCOME: {
    id: 'total-income',
    label: 'Total Income',
    symbol: '+',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    stickyBgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    fontWeight: 'font-semibold',
    fontSize: 'text-sm',
    showCondition: (selectedTypeFilter, hasAnyData, hasInvestmentData, hasIncomeData) => (selectedTypeFilter === 'all' || selectedTypeFilter === 'income') && hasIncomeData
  },
  INVESTMENT_RETURNS: {
    id: 'investment-returns',
    label: 'Investment Returns',
    symbol: '+',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    stickyBgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    fontWeight: 'font-medium',
    fontSize: 'text-sm',
    showCondition: (selectedTypeFilter, hasAnyData, hasInvestmentData, hasIncomeData, hasInvestmentIncomingData) => (selectedTypeFilter === 'all' || selectedTypeFilter === 'investment') && hasInvestmentIncomingData
  },
  TOTAL_EXPENSES: {
    id: 'total-expenses',
    label: 'Total Expenses',
    symbol: '−',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    stickyBgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    fontWeight: 'font-semibold',
    fontSize: 'text-sm',
    showCondition: (selectedTypeFilter, hasAnyData, hasInvestmentData, hasIncomeData, hasInvestmentIncomingData, hasExpenseData) => (selectedTypeFilter === 'all' || selectedTypeFilter === 'expense') && hasExpenseData
  },
  INVESTMENT_PURCHASES: {
    id: 'investment-purchases',
    label: 'Investment Purchases',
    symbol: '−',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    stickyBgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    fontWeight: 'font-medium',
    fontSize: 'text-sm',
    showCondition: (selectedTypeFilter, hasAnyData, hasInvestmentData, hasIncomeData, hasInvestmentIncomingData, hasExpenseData, hasInvestmentOutgoingData) => (selectedTypeFilter === 'all' || selectedTypeFilter === 'investment') && hasInvestmentOutgoingData
  }
}

// Enhanced summary value styling configurations
export const SUMMARY_VALUE_STYLES = {
  POSITIVE: {
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    fontWeight: 'font-semibold'
  },
  NEGATIVE: {
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    fontWeight: 'font-semibold'
  },
  NEUTRAL: {
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    fontWeight: 'font-normal'
  },
  CURRENT_MONTH: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-900',
    fontWeight: 'font-bold',
    borderColor: 'border-blue-300',
    shadow: 'shadow-md',
    ringColor: 'ring-2 ring-blue-400'
  }
}

// Categories by type
export const CATEGORIES_BY_TYPE = {
  [BUDGET_TYPES.INCOME]: [
    'Salary',
    'Freelance',
    'Business',
    'Bonus',
    'Side Hustle',
    'Other Income'
  ],
  [BUDGET_TYPES.INVESTMENT]: [
    'Real Estate Purchase',
    'Real Estate Installment',
    'Rental Income',
    'Stock Purchase',
    'Stock Dividends',
    'Gold Purchase',
    'Gold Sale',
    'Mutual Funds',
    'Retirement Fund',
    'Crypto Purchase',
    'Crypto Sale',
    'Investment Returns',
    'Capital Gains',
    'Other Investment'
  ],
  [BUDGET_TYPES.EXPENSE]: [
    'Essential',
    'Lifestyle',
    'Savings',
    'Investment',
    'Education',
    'Transportation',
    'Healthcare',
    'Food & Dining',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Travel',
    'Insurance',
    'Debt Payments',
    'Charity',
    'Zakat',
    'Other'
  ]
}

// Investment directions
export const INVESTMENT_DIRECTIONS = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming'
}

export const INVESTMENT_DIRECTION_LABELS = {
  [INVESTMENT_DIRECTIONS.OUTGOING]: 'Outgoing (Purchase/Contribution)',
  [INVESTMENT_DIRECTIONS.INCOMING]: 'Incoming (Returns/Sales)'
}

// Payment schedule options
export const PAYMENT_SCHEDULES = {
  START_OF_MONTH: 'start_of_month',
  THROUGHOUT_MONTH: 'throughout_month',
  END_OF_MONTH: 'end_of_month',
  CUSTOM_DATES: 'custom_dates'
}

export const PAYMENT_SCHEDULE_LABELS = {
  [PAYMENT_SCHEDULES.START_OF_MONTH]: 'Start of Month',
  [PAYMENT_SCHEDULES.THROUGHOUT_MONTH]: 'Throughout Month',
  [PAYMENT_SCHEDULES.END_OF_MONTH]: 'End of Month',
  [PAYMENT_SCHEDULES.CUSTOM_DATES]: 'Custom Dates'
}

export const PAYMENT_SCHEDULE_DESCRIPTIONS = {
  [PAYMENT_SCHEDULES.START_OF_MONTH]: 'Paid once at the beginning of the month',
  [PAYMENT_SCHEDULES.THROUGHOUT_MONTH]: 'Spent gradually throughout the month',
  [PAYMENT_SCHEDULES.END_OF_MONTH]: 'Paid once at the end of the month',
  [PAYMENT_SCHEDULES.CUSTOM_DATES]: 'Paid on specific dates (1-31)'
}

// New Recurrence System - Frequency Options
export const FREQUENCY_TYPES = {
  ONCE: 'once',
  CUSTOM: 'custom',
  REPEATS: 'repeats'
}

export const FREQUENCY_LABELS = {
  [FREQUENCY_TYPES.ONCE]: 'Once (one-time)',
  [FREQUENCY_TYPES.CUSTOM]: 'Custom (manual selection)',
  [FREQUENCY_TYPES.REPEATS]: 'Repeats every'
}

// Recurrence intervals (in months)
export const RECURRENCE_INTERVALS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 4, label: '4 months' },
  { value: 5, label: '5 months' },
  { value: 6, label: '6 months' },
  { value: 7, label: '7 months' },
  { value: 8, label: '8 months' },
  { value: 9, label: '9 months' },
  { value: 10, label: '10 months' },
  { value: 11, label: '11 months' },
  { value: 12, label: '12 months' }
]

// End date types
export const END_TYPES = {
  SPECIFIC_DATE: 'specific_date',
  AFTER_OCCURRENCES: 'after_occurrences'
}

export const END_TYPE_LABELS = {
  [END_TYPES.SPECIFIC_DATE]: 'on specific date',
  [END_TYPES.AFTER_OCCURRENCES]: 'after number of occurrences'
}

// Legacy recurrence types (for backward compatibility)
export const RECURRENCE_TYPES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  BI_ANNUAL: 'bi-annual',
  SCHOOL_TERMS: 'school-terms',
  CUSTOM: 'custom',
  ONE_TIME: 'one-time'
}

export const RECURRENCE_LABELS = {
  [RECURRENCE_TYPES.MONTHLY]: 'Monthly',
  [RECURRENCE_TYPES.QUARTERLY]: 'Quarterly (Q1, Q2, Q3, Q4)',
  [RECURRENCE_TYPES.BI_ANNUAL]: 'Bi-Annual (Jan & Jul)',
  [RECURRENCE_TYPES.SCHOOL_TERMS]: 'School Terms (Jan & Sep)',
  [RECURRENCE_TYPES.CUSTOM]: 'Custom Months',
  [RECURRENCE_TYPES.ONE_TIME]: 'One Time'
}

// Filter options
export const FILTER_OPTIONS = {
  ALL: 'all'
}

// View modes
export const VIEW_MODES = {
  LIST: 'list',
  GROUPED: 'grouped'
}

// Default form data values
export const DEFAULT_VALUES = {
  FORM_DATA: {
    // Basic information
    name: '',
    type: BUDGET_TYPES.EXPENSE,
    category: '',
    defaultAmount: 0,

    // New recurrence system defaults
    frequency: FREQUENCY_TYPES.REPEATS, // DEFAULT: Repeats monthly
    recurrenceInterval: 1, // DEFAULT: 1 month (monthly)
    startMonth: 0, // DEFAULT: January
    startYear: new Date().getFullYear(), // DEFAULT: Current year
    endMonth: 11, // DEFAULT: December
    endYear: new Date().getFullYear(), // DEFAULT: Current year
    endType: END_TYPES.SPECIFIC_DATE, // DEFAULT: End on specific date
    occurrences: 12, // DEFAULT: 12 occurrences

    // Once frequency fields (new)
    oneTimeMonth: new Date().getMonth(), // DEFAULT: Current month
    oneTimeYear: new Date().getFullYear(), // DEFAULT: Current year

    // Custom frequency fields
    customMonths: [],

    // Legacy fields for backward compatibility
    recurrence: RECURRENCE_TYPES.MONTHLY,
    startDate: '',
    endDate: '',
    is_multi_year: false, // Will be computed based on start/end years
    start_year: null,
    end_year: null,

    // Investment linking
    linked_investment_id: null,
    investment_direction: INVESTMENT_DIRECTIONS.OUTGOING,

    // Payment schedule settings
    payment_schedule: PAYMENT_SCHEDULES.THROUGHOUT_MONTH,
    due_date: null,
    is_fixed_expense: false,
    reminder_enabled: false,
    reminder_days_before: 7,

    // Multi-year specific
    yearlyBreakdown: [],
    totalAmount: 0,
    duration: 0
  },
  CATEGORIES_BY_TYPE: {
    [BUDGET_TYPES.INCOME]: 'Salary',
    [BUDGET_TYPES.INVESTMENT]: 'Real Estate Purchase',
    [BUDGET_TYPES.EXPENSE]: 'Essential'
  }
}

// Budget type styling configurations
export const BUDGET_TYPE_STYLES = {
  INCOME: {
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    amountTextColor: 'text-emerald-700',
    amountBgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'TrendingUp',
    label: 'Income',
    // Enhanced typography
    fontWeight: 'font-semibold',
    fontSize: 'text-sm'
  },
  EXPENSE: {
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    amountTextColor: 'text-rose-700',
    amountBgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: 'TrendingDown',
    label: 'Expense',
    // Enhanced typography
    fontWeight: 'font-semibold',
    fontSize: 'text-sm'
  },
  INVESTMENT_INCOMING: {
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    amountTextColor: 'text-emerald-700',
    amountBgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'TrendingUp',
    label: 'Investment',
    // Enhanced typography
    fontWeight: 'font-semibold',
    fontSize: 'text-sm'
  },
  INVESTMENT_OUTGOING: {
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    amountTextColor: 'text-rose-700',
    amountBgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: 'TrendingDown',
    label: 'Investment',
    // Enhanced typography
    fontWeight: 'font-semibold',
    fontSize: 'text-sm'
  }
}

// Enhanced table cell styling configurations
export const TABLE_CELL_STYLES = {
  CURRENT_MONTH: {
    bgColor: 'bg-blue-100',
    amountBgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    shadow: 'shadow-md',
    // Enhanced typography for current month
    fontWeight: 'font-bold',
    textColor: 'text-blue-900',
    // Enhanced current month indicators
    ringColor: 'ring-2 ring-blue-400',
    borderWidth: 'border-2',
    // Status indicator for current month
    statusIndicator: 'bg-blue-500',
    statusText: 'text-blue-700'
  },
  PAST_MONTH: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    // Enhanced typography for past months
    fontWeight: 'font-normal',
    opacity: 'opacity-75'
  },
  SCHEDULED_MONTH: {
    incomeBgColor: 'bg-emerald-50',
    expenseBgColor: 'bg-rose-50',
    // Enhanced typography for scheduled months
    fontWeight: 'font-medium'
  },
  DEFAULT: {
    bgColor: 'bg-white',
    // Enhanced typography for default cells
    fontWeight: 'font-normal'
  },
  CHANGES_INDICATOR: {
    bgColor: 'bg-orange-500',
    borderColor: 'border-white',
    shadow: 'shadow-lg',
    // Enhanced visibility
    size: 'w-4 h-4',
    // Enhanced animation
    animation: 'animate-pulse',
    // Enhanced positioning
    position: 'absolute -top-1.5 -right-1.5'
  }
}

// Enhanced action button configurations
export const ACTION_BUTTONS = {
  EDIT: {
    color: 'text-blue-600',
    hoverColor: 'hover:text-blue-800',
    hoverBg: 'hover:bg-blue-50',
    title: 'Edit budget settings',
    // Enhanced styling
    size: 'w-4 h-4',
    padding: 'p-2',
    borderRadius: 'rounded-md',
    transition: 'transition-all duration-200'
  },
  DUPLICATE: {
    color: 'text-emerald-600',
    hoverColor: 'hover:text-emerald-800',
    hoverBg: 'hover:bg-emerald-50',
    title: 'Duplicate this budget item to create a copy',
    label: 'Duplicate',
    // Enhanced styling
    size: 'w-4 h-4',
    padding: 'p-2',
    borderRadius: 'rounded-md',
    transition: 'transition-all duration-200',
    // Enhanced accessibility
    ariaLabel: 'Duplicate budget item'
  },
  DELETE: {
    color: 'text-rose-600',
    hoverColor: 'hover:text-rose-800',
    hoverBg: 'hover:bg-rose-50',
    title: 'Delete this budget item permanently',
    label: 'Delete',
    // Enhanced styling
    size: 'w-4 h-4',
    padding: 'p-2',
    borderRadius: 'rounded-md',
    transition: 'transition-all duration-200',
    // Enhanced accessibility
    ariaLabel: 'Delete budget item'
  }
}

// Empty state configurations
export const EMPTY_STATES = {
  LOADING: {
    icon: '⏳',
    title: 'Loading budget data...',
    message: 'Please wait while we fetch your budget information.',
    showActions: false
  },
  ERROR: {
    icon: '⚠️',
    title: 'Error loading budget data',
    message: null, // Will be passed dynamically
    showActions: true,
    actions: ['retry']
  },
  NO_BUDGET_ITEMS: {
    icon: '📊',
    title: 'No budget items for {year}',
    message: 'Start by adding your first budget item or copy from a previous year.',
    showActions: true,
    actions: ['add-first-budget', 'copy-from-previous-year']
  },
  NO_FILTERED_RESULTS: {
    icon: '🔍',
    title: 'No budget items found',
    message: null, // Will be generated dynamically based on filters
    showActions: true,
    actions: ['clear-filters', 'add-budget']
  }
}

// Schedule patterns
export const SCHEDULE_PATTERNS = {
  [RECURRENCE_TYPES.QUARTERLY]: [0, 3, 6, 9], // Q1, Q2, Q3, Q4
  [RECURRENCE_TYPES.BI_ANNUAL]: [0, 6], // January and July
  [RECURRENCE_TYPES.SCHOOL_TERMS]: [0, 8] // January and September
}

// Database limits (precision 12, scale 2)
export const DATABASE_LIMITS = {
  MAX_AMOUNT: 9999999999, // Maximum amount allowed by database
  MAX_AMOUNT_FORMATTED: 'EGP 9,999,999,999'
}

// Transaction types (matching budget types)
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  INVESTMENT: 'investment'
}

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.INCOME]: 'Income',
  [TRANSACTION_TYPES.EXPENSE]: 'Expense',
  [TRANSACTION_TYPES.INVESTMENT]: 'Investment'
}

export const TRANSACTION_TYPE_ICONS = {
  [TRANSACTION_TYPES.INCOME]: '💰',
  [TRANSACTION_TYPES.EXPENSE]: '💸',
  [TRANSACTION_TYPES.INVESTMENT]: '📈'
}

// Transaction categories (matching budget categories)
export const TRANSACTION_CATEGORIES = {
  [TRANSACTION_TYPES.INCOME]: [
    'Salary',
    'Freelance',
    'Business',
    'Bonus',
    'Side Hustle',
    'Investment Returns',
    'Rental Income',
    'Other Income'
  ],
  [TRANSACTION_TYPES.EXPENSE]: [
    'Essential',
    'Lifestyle',
    'Savings',
    'Investment',
    'Education',
    'Transportation',
    'Healthcare',
    'Food & Dining',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Travel',
    'Insurance',
    'Debt Payments',
    'Charity',
    'Zakat',
    'Other'
  ],
  [TRANSACTION_TYPES.INVESTMENT]: [
    'Real Estate Purchase',
    'Real Estate Installment',
    'Rental Income',
    'Stock Purchase',
    'Stock Dividends',
    'Gold Purchase',
    'Gold Sale',
    'Mutual Funds',
    'Retirement Fund',
    'Crypto Purchase',
    'Crypto Sale',
    'Investment Returns',
    'Capital Gains',
    'Other Investment'
  ]
}

// Default transaction values
export const DEFAULT_TRANSACTION_VALUES = {
  type: TRANSACTION_TYPES.EXPENSE,
  category: 'Essential',
  amount: 0,
  date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  description: '',
  account_id: null,
  tags: [],
  notes: '',
  gross_amount: null,
  tax_amount: null,
  net_amount: null,
  investment_direction: null
}

// Multi-year budget constants
export const MULTI_YEAR_CONSTANTS = {
  MAX_DURATION_YEARS: 20,
  DEFAULT_DURATION_YEARS: 5,
  MIN_DURATION_YEARS: 1,
  END_MONTH_OPTIONS: [
    { value: null, label: 'Full Year (December)' },
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ]
}

// Multi-year calculation helpers
export const MULTI_YEAR_CALCULATION = {
  // Legacy calculation functions removed - now using new frequency-based system
}
