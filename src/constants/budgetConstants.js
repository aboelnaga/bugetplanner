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

// Summary row types and configurations
export const SUMMARY_ROWS = {
  NET_BALANCE: {
    id: 'net-balance',
    label: 'Net Monthly Balance',
    symbol: '=',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    stickyBgColor: 'bg-blue-50',
    showCondition: (selectedTypeFilter, hasAnyData) => selectedTypeFilter === 'all' && hasAnyData
  },
  NET_INVESTMENT: {
    id: 'net-investment',
    label: 'Net Investment',
    subtitle: '( Returns - Purchases)',
    symbol: '📈',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    stickyBgColor: 'bg-indigo-50',
    showCondition: (hasInvestmentData) => hasInvestmentData
  },
  TOTAL_INCOME: {
    id: 'total-income',
    label: 'Total Income',
    symbol: '+',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    stickyBgColor: 'bg-green-50',
    showCondition: (hasIncomeData) => hasIncomeData
  },
  INVESTMENT_RETURNS: {
    id: 'investment-returns',
    label: 'Investment Returns',
    symbol: '+',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    stickyBgColor: 'bg-green-50',
    showCondition: (hasInvestmentIncomingData) => hasInvestmentIncomingData
  },
  TOTAL_EXPENSES: {
    id: 'total-expenses',
    label: 'Total Expenses',
    symbol: '−',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    stickyBgColor: 'bg-red-50',
    showCondition: (hasExpenseData) => hasExpenseData
  },
  INVESTMENT_PURCHASES: {
    id: 'investment-purchases',
    label: 'Investment Purchases',
    symbol: '−',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    stickyBgColor: 'bg-red-50',
    showCondition: (hasInvestmentOutgoingData) => hasInvestmentOutgoingData
  }
}

// Summary value styling configurations
export const SUMMARY_VALUE_STYLES = {
  POSITIVE: {
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  NEGATIVE: {
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  },
  NEUTRAL: {
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300'
  },
  CURRENT_MONTH: {
    bgColor: 'bg-blue-400'
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