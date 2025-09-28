<script setup>
import { useTooltipBuilder } from '@/composables/useTooltipBuilder.js'
import { useYearlySummariesStore } from '@/stores/yearlySummaries.js'
import BudgetSummaryRowHelper from './BudgetSummaryRowHelper.vue'

// Props
const props = defineProps({
    months: {
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
    selectedTypeFilter: {
      type: String,
      required: true
    },

    // Computed properties
    hasInvestmentData: {
      type: Boolean,
      required: true
    },
    hasAnyData: {
      type: Boolean,
      required: true
    },

    // Functions
    calculateMonthlyTotal: {
      type: Function,
      required: true
    },
    calculateMonthlyActualTotal: {
      type: Function,
      required: false,
      default: null
    },
    calculateMonthlyInvestmentNet: {
      type: Function,
      required: true
    },
    calculateMonthlyActualInvestmentNet: {
      type: Function,
      required: false,
      default: null
    },
    calculateGrandTotal: {
      type: Function,
      required: true
    },
    calculateGrandTotalActual: {
      type: Function,
      required: false,
      default: null
    },
    calculateGrandTotalInvestmentNet: {
      type: Function,
      required: true
    },
    calculateGrandTotalActualInvestmentNet: {
      type: Function,
      required: false,
      default: null
    },
    formatCurrency: {
      type: Function,
      required: true
    },

    // Planned calculation props for tooltips
    // Monthly planned breakdown (income/expenses)
    calculateMonthlyPlannedIncome: {
      type: Function,
      default: null
    },
    calculateMonthlyPlannedExpenses: {
      type: Function,
      default: null
    },
    calculateMonthlyPlannedTotal: {
      type: Function,
      default: null
    },
    calculateGrandTotalPlanned: {
      type: Function,
      default: null
    },
    // Planned investment props for Net Investment tooltips
    calculateMonthlyPlannedInvestmentIncoming: {
      type: Function,
      default: null
    },
    calculateMonthlyPlannedInvestmentOutgoing: {
      type: Function,
      default: null
    },
    calculateGrandTotalPlannedInvestmentIncoming: {
      type: Function,
      default: null
    },
    calculateGrandTotalPlannedInvestmentOutgoing: {
      type: Function,
      default: null
    },
    // Yearly planned breakdown (income/expenses)
    calculateGrandTotalPlannedIncome: {
      type: Function,
      default: null
    },
    calculateGrandTotalPlannedExpenses: {
      type: Function,
      default: null
    },

    // Actual-only breakdown props used in Net tooltips
    // Monthly actual (income/expenses and investment in/out)
    calculateMonthlyActualIncome: {
      type: Function,
      default: null
    },
    calculateMonthlyActualExpenses: {
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
    // Yearly actual (income/expenses and investment in/out)
    calculateGrandTotalActualIncome: {
      type: Function,
      default: null
    },
    calculateGrandTotalActualExpenses: {
      type: Function,
      default: null
    },
    calculateGrandTotalActualInvestmentIncoming: {
      type: Function,
      default: null
    },
    calculateGrandTotalActualInvestmentOutgoing: {
      type: Function,
      default: null
    },
    // Previous year calculations
    calculatePreviousYearNetTotal: {
      type: Function,
      default: null
    },
    calculatePreviousYearInvestmentNetTotal: {
      type: Function,
      default: null
    },

    // Savings calculations
    calculateCumulativeSavings: {
      type: Function,
      required: true
    },
    calculateGrandTotalSavings: {
      type: Function,
      required: true
    },
    calculatePreviousYearSavings: {
      type: Function,
      required: true
    }
  })

// Tooltip functions via shared builder
const { buildTooltip, actualColorFor, buildNetBreakdownTooltip } =
    useTooltipBuilder(props.formatCurrency)

const getNetBalanceTooltip = (monthIndex) => {
  if (!props.calculateMonthlyPlannedTotal) return ''
  // Planned breakdown
  const plannedIncome =
    (props.calculateMonthlyPlannedIncome
      ? props.calculateMonthlyPlannedIncome(monthIndex)
      : 0) +
    (props.calculateMonthlyPlannedInvestmentIncoming
      ? props.calculateMonthlyPlannedInvestmentIncoming(monthIndex)
      : 0)
  const plannedExpense =
    (props.calculateMonthlyPlannedExpenses
      ? props.calculateMonthlyPlannedExpenses(monthIndex)
      : 0) +
    (props.calculateMonthlyPlannedInvestmentOutgoing
      ? props.calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
      : 0)

  // Actual breakdown
  const actualIncome =
    (props.calculateMonthlyActualIncome
      ? props.calculateMonthlyActualIncome(monthIndex)
      : 0) +
    (props.calculateMonthlyActualInvestmentIncoming
      ? props.calculateMonthlyActualInvestmentIncoming(monthIndex)
      : 0)
  const actualExpense =
    (props.calculateMonthlyActualExpenses
      ? props.calculateMonthlyActualExpenses(monthIndex)
      : 0) +
    (props.calculateMonthlyActualInvestmentOutgoing
      ? props.calculateMonthlyActualInvestmentOutgoing(monthIndex)
      : 0)

  return buildNetBreakdownTooltip(
      plannedIncome,
      actualIncome,
      plannedExpense,
      actualExpense
    )
}

const getNetInvestmentTooltip = (monthIndex) => {
  const plannedIncoming = props.calculateMonthlyPlannedInvestmentIncoming
    ? props.calculateMonthlyPlannedInvestmentIncoming(monthIndex)
    : 0
  const plannedOutgoing = props.calculateMonthlyPlannedInvestmentOutgoing
    ? props.calculateMonthlyPlannedInvestmentOutgoing(monthIndex)
    : 0
  const plannedNet = plannedIncoming - plannedOutgoing
  const actualNet = props.calculateMonthlyActualInvestmentNet
    ? props.calculateMonthlyActualInvestmentNet(monthIndex)
    : 0
  return buildTooltip(
      plannedNet,
      actualNet,
      'net',
      actualColorFor(actualNet, 'net')
    )
}

const getNetBalanceYearlyTooltip = () => {
  if (!props.calculateGrandTotalPlanned) return ''
  // Planned breakdown
  const plannedIncome =
    (props.calculateGrandTotalPlannedIncome
      ? props.calculateGrandTotalPlannedIncome()
      : 0) +
    (props.calculateGrandTotalPlannedInvestmentIncoming
      ? props.calculateGrandTotalPlannedInvestmentIncoming()
      : 0)
  const plannedExpense =
    (props.calculateGrandTotalPlannedExpenses
      ? props.calculateGrandTotalPlannedExpenses()
      : 0) +
    (props.calculateGrandTotalPlannedInvestmentOutgoing
      ? props.calculateGrandTotalPlannedInvestmentOutgoing()
      : 0)

  // Actual breakdown
  const actualIncome =
    (props.calculateGrandTotalActualIncome
      ? props.calculateGrandTotalActualIncome()
      : 0) +
    (props.calculateGrandTotalActualInvestmentIncoming
      ? props.calculateGrandTotalActualInvestmentIncoming()
      : 0)
  const actualExpense =
    (props.calculateGrandTotalActualExpenses
      ? props.calculateGrandTotalActualExpenses()
      : 0) +
    (props.calculateGrandTotalActualInvestmentOutgoing
      ? props.calculateGrandTotalActualInvestmentOutgoing()
      : 0)

  return buildNetBreakdownTooltip(
      plannedIncome,
      actualIncome,
      plannedExpense,
      actualExpense
    )
}

const getNetInvestmentYearlyTooltip = () => {
  const plannedIncoming = props.calculateGrandTotalPlannedInvestmentIncoming
    ? props.calculateGrandTotalPlannedInvestmentIncoming()
    : 0
  const plannedOutgoing = props.calculateGrandTotalPlannedInvestmentOutgoing
    ? props.calculateGrandTotalPlannedInvestmentOutgoing()
    : 0
  const plannedNet = plannedIncoming - plannedOutgoing
  const actualNet = props.calculateGrandTotalActualInvestmentNet
    ? props.calculateGrandTotalActualInvestmentNet()
    : 0
  return buildTooltip(
      plannedNet,
      actualNet,
      'net',
      actualColorFor(actualNet, 'net')
    )
}

// Previous year functions
const getPreviousYearNetTotal = () => {
  if (!props.calculatePreviousYearNetTotal) return 0
  return props.calculatePreviousYearNetTotal()
}

const getPreviousYearInvestmentNetTotal = () => {
  if (!props.calculatePreviousYearInvestmentNetTotal) return 0
  return props.calculatePreviousYearInvestmentNetTotal()
}

const getPreviousYearNetTooltip = () => {
  const total = getPreviousYearNetTotal()
  const previousYear = props.selectedYear - 1

  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues =
      yearlySummariesStore.getDetailedPreviousYearValues(previousYear)

  if (detailedValues) {
    const incomePlanned = detailedValues.income.planned
    const incomeActual = detailedValues.income.actual
    const expensesPlanned = detailedValues.expenses.planned
    const expensesActual = detailedValues.expenses.actual
    const investmentIncomingPlanned =
      detailedValues.investmentIncoming.planned
    const investmentIncomingActual = detailedValues.investmentIncoming.actual
    const investmentOutgoingPlanned =
      detailedValues.investmentOutgoing.planned
    const investmentOutgoingActual = detailedValues.investmentOutgoing.actual

    const plannedNet =
      incomePlanned +
      investmentIncomingPlanned -
      (expensesPlanned + investmentOutgoingPlanned)
    const actualNet =
      incomeActual +
      investmentIncomingActual -
      (expensesActual + investmentOutgoingActual)
    const variance = actualNet - plannedNet
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText =
      variance >= 0
        ? `+${props.formatCurrency(variance)}`
        : props.formatCurrency(variance)

    return (
      `PY ${previousYear} Net Balance<br>` +
      `Planned: <span class="text-blue-300">${props.formatCurrency(plannedNet)}</span><br>` +
      `Actual: <span class="text-green-300">${props.formatCurrency(actualNet)}</span><br>` +
      `Variance: <span class="${varianceColor}">${varianceText}</span>`
    )
  }

  // Fallback to simple display
  return `PY ${previousYear} Net Balance (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}

const getPreviousYearInvestmentNetTooltip = () => {
  const total = getPreviousYearInvestmentNetTotal()
  const previousYear = props.selectedYear - 1

  // Try to get detailed values from yearly summaries store
  const yearlySummariesStore = useYearlySummariesStore()
  const detailedValues =
      yearlySummariesStore.getDetailedPreviousYearValues(previousYear)

  if (detailedValues) {
    const incomingPlanned = detailedValues.investmentIncoming.planned
    const incomingActual = detailedValues.investmentIncoming.actual
    const outgoingPlanned = detailedValues.investmentOutgoing.planned
    const outgoingActual = detailedValues.investmentOutgoing.actual

    const plannedNet = incomingPlanned - outgoingPlanned
    const actualNet = incomingActual - outgoingActual
    const variance = actualNet - plannedNet
    const varianceColor = variance >= 0 ? 'text-green-300' : 'text-red-300'
    const varianceText =
      variance >= 0
        ? `+${props.formatCurrency(variance)}`
        : props.formatCurrency(variance)

    return (
      `PY ${previousYear} Net Investment<br>` +
      `Planned: <span class="text-blue-300">${props.formatCurrency(plannedNet)}</span><br>` +
      `Actual: <span class="text-green-300">${props.formatCurrency(actualNet)}</span><br>` +
      `Variance: <span class="${varianceColor}">${varianceText}</span>`
    )
  }

  // Fallback to simple display
  return `PY ${previousYear} Net Investment (Actual): <span class="text-green-300">${props.formatCurrency(total)}</span>`
}

// Savings tooltip functions
const getSavingsTooltip = (monthIndex) => {
  const savings = props.calculateCumulativeSavings(monthIndex)
  const monthName = props.months[monthIndex]

  return `Cumulative Savings for ${monthName} ${props.selectedYear}: ${props.formatCurrency(savings)}`
}

const getGrandTotalSavingsTooltip = () => {
  const totalSavings = props.calculateGrandTotalSavings()
  return `Total Cumulative Savings for ${props.selectedYear}: ${props.formatCurrency(totalSavings)}`
}

const getPreviousYearSavingsTooltip = () => {
  const previousYearSavings = props.calculatePreviousYearSavings()
  const previousYear = props.selectedYear - 1

  if (previousYearSavings === 0) {
    return `No savings data available for ${previousYear}`
  }

  return `Cumulative Savings for ${previousYear}: ${props.formatCurrency(previousYearSavings)}`
}
</script>

<template>
  <!-- Net Balance Line -->
  <BudgetSummaryRowHelper
    row-type="NET_BALANCE"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateMonthlyTotal"
    :calculate-grand-total="calculateGrandTotal"
    :calculate-previous-year="calculatePreviousYearNetTotal"
    :get-monthly-tooltip="getNetBalanceTooltip"
    :get-grand-total-tooltip="getNetBalanceYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearNetTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200 font-bold"
    :use-value-based-styling="true"
  />

  <!-- Savings Row -->
  <BudgetSummaryRowHelper
    row-type="SAVINGS"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateCumulativeSavings"
    :calculate-grand-total="calculateGrandTotalSavings"
    :calculate-previous-year="calculatePreviousYearSavings"
    :get-monthly-tooltip="getSavingsTooltip"
    :get-grand-total-tooltip="getGrandTotalSavingsTooltip"
    :get-previous-year-tooltip="getPreviousYearSavingsTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200 font-bold"
    :use-value-based-styling="true"
  />

  <!-- Net Investment Row -->
  <BudgetSummaryRowHelper
    row-type="NET_INVESTMENT"
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="false"
    :has-expense-data="false"
    :has-investment-data="hasInvestmentData"
    :has-investment-incoming-data="false"
    :has-investment-outgoing-data="false"
    :has-any-data="hasAnyData"
    :calculate-monthly="calculateMonthlyInvestmentNet"
    :calculate-grand-total="calculateGrandTotalInvestmentNet"
    :calculate-previous-year="calculatePreviousYearInvestmentNetTotal"
    :get-monthly-tooltip="getNetInvestmentTooltip"
    :get-grand-total-tooltip="getNetInvestmentYearlyTooltip"
    :get-previous-year-tooltip="getPreviousYearInvestmentNetTooltip"
    :format-currency="formatCurrency"
    border-top-class="border-t-2 border-gray-200"
    :use-value-based-styling="true"
  />
</template>
