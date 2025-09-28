// Budget history composable
// History data management, formatting, and statistics

import { computed } from 'vue'
import { formatCurrency, historyUtils } from '@/utils/budgetUtils.js'

export function useBudgetHistory (budgetStore) {
  // Get history items
  const historyItems = computed(() => budgetStore.budgetHistory || [])

  // Get budget item name by ID
  const getBudgetItemName = (budgetItemId) => {
    const budgetItem = budgetStore.budgetItems.find(
      (item) => item.id === budgetItemId
    )
    return budgetItem ? budgetItem.name : `Budget Item #${budgetItemId}`
  }

  // Get unique budget items count
  const uniqueBudgetItems = computed(() => {
    const uniqueIds = new Set(
      historyItems.value.map((item) => item.budget_item_id)
    )
    return uniqueIds.size
  })

  // Get latest change time
  const latestChangeTime = computed(() => {
    if (historyItems.value.length === 0) return 'No changes'
    const latest = historyItems.value[0] // Already sorted by changed_at desc
    return historyUtils.formatTimestamp(latest.changed_at)
  })

  // Format currency for history values
  const formatHistoryCurrency = (amount) => {
    return formatCurrency(amount)
  }

  // Format history value (currently same as currency, but can be extended)
  const formatHistoryValue = (value) => {
    return historyUtils.formatHistoryValue(value)
  }

  // Format timestamp for better readability
  const formatTimestamp = (timestamp) => {
    return historyUtils.formatTimestamp(timestamp)
  }

  // Format full date for detailed view
  const formatFullDate = (timestamp) => {
    return historyUtils.formatFullDate(timestamp)
  }

  // Get change indicator data
  const getChangeIndicator = (change) => {
    if (change.new_amount > change.old_amount) {
      return {
        type: 'increase',
        label: 'Increased',
        classes: 'bg-green-100 text-green-800',
        icon: 'M5 10l7-7m0 0l7 7m-7-7v18'
      }
    } else if (change.new_amount < change.old_amount) {
      return {
        type: 'decrease',
        label: 'Decreased',
        classes: 'bg-red-100 text-red-800',
        icon: 'M19 14l-7 7m0 0l-7-7m7 7V3'
      }
    } else {
      return {
        type: 'no-change',
        label: 'No Change',
        classes: 'bg-gray-100 text-gray-800',
        icon: 'M5 12h14'
      }
    }
  }

  // Get history statistics
  const getHistoryStats = () => {
    const totalChanges = historyItems.value.length
    const uniqueItems = uniqueBudgetItems.value
    const latestChange = latestChangeTime.value

    // Calculate change types
    const increases = historyItems.value.filter(
      (change) => change.new_amount > change.old_amount
    ).length
    const decreases = historyItems.value.filter(
      (change) => change.new_amount < change.old_amount
    ).length
    const noChanges = historyItems.value.filter(
      (change) => change.new_amount === change.old_amount
    ).length

    // Calculate total amount changes
    const totalIncrease = historyItems.value
      .filter((change) => change.new_amount > change.old_amount)
      .reduce(
        (sum, change) => sum + (change.new_amount - change.old_amount),
        0
      )

    const totalDecrease = historyItems.value
      .filter((change) => change.new_amount < change.old_amount)
      .reduce(
        (sum, change) => sum + (change.old_amount - change.new_amount),
        0
      )

    return {
      totalChanges,
      uniqueItems,
      latestChange,
      increases,
      decreases,
      noChanges,
      totalIncrease,
      totalDecrease,
      netChange: totalIncrease - totalDecrease
    }
  }

  // Get history items grouped by budget item
  const getHistoryByBudgetItem = () => {
    const grouped = {}

    historyItems.value.forEach((change) => {
      const itemId = change.budget_item_id
      if (!grouped[itemId]) {
        grouped[itemId] = {
          name: getBudgetItemName(itemId),
          changes: []
        }
      }
      grouped[itemId].changes.push(change)
    })

    return grouped
  }

  // Get history items grouped by month
  const getHistoryByMonth = () => {
    const grouped = {}

    historyItems.value.forEach((change) => {
      const monthKey = `${change.month_index + 1}`
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          changes: []
        }
      }
      grouped[monthKey].changes.push(change)
    })

    return grouped
  }

  // Filter history by date range
  const filterHistoryByDateRange = (startDate, endDate) => {
    return historyItems.value.filter((change) => {
      const changeDate = new Date(change.changed_at)
      return changeDate >= startDate && changeDate <= endDate
    })
  }

  // Filter history by budget item
  const filterHistoryByBudgetItem = (budgetItemId) => {
    return historyItems.value.filter(
      (change) => change.budget_item_id === budgetItemId
    )
  }

  // Filter history by month
  const filterHistoryByMonth = (monthIndex) => {
    return historyItems.value.filter(
      (change) => change.month_index === monthIndex
    )
  }

  return {
    // Data
    historyItems,
    uniqueBudgetItems,
    latestChangeTime,

    // Formatting
    formatHistoryCurrency,
    formatHistoryValue,
    formatTimestamp,
    formatFullDate,

    // Utilities
    getBudgetItemName,
    getChangeIndicator,
    getHistoryStats,

    // Grouping
    getHistoryByBudgetItem,
    getHistoryByMonth,

    // Filtering
    filterHistoryByDateRange,
    filterHistoryByBudgetItem,
    filterHistoryByMonth
  }
}
