// Budget constants
// Months array, budget types, categories by type, default values

// Months array
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

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
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-900',
    fontWeight: 'font-semibold'
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

// Recurrence types
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

// Default values

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
    bgColor: 'bg-sky-100',
    amountBgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    shadow: 'shadow-sm',
    // Enhanced typography for current month
    fontWeight: 'font-semibold',
    textColor: 'text-sky-900'
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
    bgColor: 'bg-amber-500',
    borderColor: 'border-white',
    shadow: 'shadow-sm',
    // Enhanced visibility
    size: 'w-3 h-3'
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
    title: 'Duplicate this budget item',
    // Enhanced styling
    size: 'w-4 h-4',
    padding: 'p-2',
    borderRadius: 'rounded-md',
    transition: 'transition-all duration-200'
  },
  DELETE: {
    color: 'text-rose-600',
    hoverColor: 'hover:text-rose-800',
    hoverBg: 'hover:bg-rose-50',
    title: 'Delete budget item',
    // Enhanced styling
    size: 'w-4 h-4',
    padding: 'p-2',
    borderRadius: 'rounded-md',
    transition: 'transition-all duration-200'
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
export const DEFAULT_VALUES = {
  FORM_DATA: {
    name: '',
    type: BUDGET_TYPES.EXPENSE,
    category: 'Essential',
    defaultAmount: 0,
    recurrence: RECURRENCE_TYPES.MONTHLY,
    customMonths: [],
    oneTimeMonth: 0,
    investment_direction: INVESTMENT_DIRECTIONS.OUTGOING,
    startMonth: 0
  },
  CATEGORIES_BY_TYPE: {
    [BUDGET_TYPES.INCOME]: 'Salary',
    [BUDGET_TYPES.INVESTMENT]: 'Real Estate Purchase',
    [BUDGET_TYPES.EXPENSE]: 'Essential'
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