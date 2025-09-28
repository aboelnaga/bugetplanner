// Budget summaries composable
// Summary row logic, display conditions, and styling

import { computed } from 'vue'
import { SUMMARY_ROWS } from '@/constants/budgetConstants.js'
import { summaryUtils } from '@/utils/budgetUtils.js'

export function useBudgetSummaries (
  budgetItems,
  selectedTypeFilter,
  hasIncomeData,
  hasExpenseData,
  hasInvestmentData,
  hasInvestmentIncomingData,
  hasInvestmentOutgoingData,
  hasAnyData
) {
  // Summary row visibility conditions
  const summaryConditions = computed(() => ({
    selectedTypeFilter: selectedTypeFilter.value,
    hasAnyData: hasAnyData.value,
    hasInvestmentData: hasInvestmentData.value,
    hasIncomeData: hasIncomeData.value,
    hasInvestmentIncomingData: hasInvestmentIncomingData.value,
    hasExpenseData: hasExpenseData.value,
    hasInvestmentOutgoingData: hasInvestmentOutgoingData.value
  }))

  // Check if summary row should be shown
  const shouldShowSummaryRow = (rowKey) => {
    const rowConfig = SUMMARY_ROWS[rowKey]
    if (!rowConfig) return false

    return summaryUtils.shouldShowSummaryRow(
      rowConfig,
      summaryConditions.value
    )
  }

  // Get summary row configuration
  const getSummaryRowConfig = (rowKey) => {
    return SUMMARY_ROWS[rowKey] || null
  }

  // Get summary cell classes
  const getSummaryCellClasses = (
    value,
    selectedYear,
    currentYear,
    currentMonth,
    monthIndex,
    rowKey = null
  ) => {
    const summaryRowStyling = rowKey ? getSummaryRowStyling(rowKey) : null
    return summaryUtils.getSummaryCellClasses(
      value,
      selectedYear,
      currentYear,
      currentMonth,
      monthIndex,
      summaryRowStyling
    )
  }

  // Get summary total cell classes
  const getSummaryTotalClasses = (value, isGrandTotal = false) => {
    return summaryUtils.getSummaryTotalClasses(value, isGrandTotal)
  }

  // Format summary value for display
  const formatSummaryValue = (value, formatCurrency) => {
    return summaryUtils.formatSummaryValue(value, formatCurrency)
  }

  // Get summary row styling
  const getSummaryRowStyling = (rowKey) => {
    const rowConfig = SUMMARY_ROWS[rowKey]
    if (!rowConfig) return {}

    return {
      bgColor: rowConfig.bgColor,
      textColor: rowConfig.textColor,
      stickyBgColor: rowConfig.stickyBgColor
    }
  }

  // Get all visible summary rows
  const getVisibleSummaryRows = () => {
    return Object.keys(SUMMARY_ROWS).filter((rowKey) =>
      shouldShowSummaryRow(rowKey)
    )
  }

  // Get summary row order for display
  const getSummaryRowOrder = () => {
    const order = [
      'TOTAL_INCOME',
      'INVESTMENT_RETURNS',
      'TOTAL_EXPENSES',
      'INVESTMENT_PURCHASES',
      'NET_INVESTMENT',
      'NET_BALANCE'
    ]

    return order.filter((rowKey) => shouldShowSummaryRow(rowKey))
  }

  return {
    // Visibility checks
    shouldShowSummaryRow,
    getVisibleSummaryRows,
    getSummaryRowOrder,

    // Configuration
    getSummaryRowConfig,
    getSummaryRowStyling,

    // Styling
    getSummaryCellClasses,
    getSummaryTotalClasses,
    formatSummaryValue
  }
}
