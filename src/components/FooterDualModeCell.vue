<template>
  <div
    :class="getFooterCellClasses(getRawValueForCSS(data), itemType)"
    class="whitespace-nowrap"
  >
    <template v-if="getFooterDualData(data, itemType)?.type === 'both'">
      <div
        v-if="getFooterDualData(data, itemType)?.closed"
        class="footer-dual-mode"
      >
        <div
          class="actual"
          :class="
            getValueColorClasses(
              getFooterDualData(data, itemType)?.actual,
              itemType,
            )
          "
        >
          {{ getFooterDualData(data, itemType)?.actual }}
        </div>
        <div
          class="expected"
          :class="
            getValueColorClasses(
              getFooterDualData(data, itemType)?.expected,
              itemType,
            )
          "
        >
          {{ getFooterDualData(data, itemType)?.expected }}
        </div>
        <span
          class="text-xs ml-1 text-green-600 dark:text-green-400 cursor-help"
          :title="closedTooltip"
        >●</span>
      </div>
      <div
        v-else
        class="footer-dual-mode"
      >
        <div
          class="actual"
          :class="
            getValueColorClasses(
              getFooterDualData(data, itemType)?.actual,
              itemType,
            )
          "
        >
          {{ getFooterDualData(data, itemType)?.actual }}
        </div>
        <div
          class="expected"
          :class="
            getValueColorClasses(
              getFooterDualData(data, itemType)?.expected,
              itemType,
            )
          "
        >
          {{ getFooterDualData(data, itemType)?.expected }}
        </div>
      </div>
    </template>
    <template v-else>
      <div
        v-if="getFooterDualData(data, itemType)?.closed"
        :title="closedTooltip"
        :class="
          getValueColorClasses(
            getFooterDualData(data, itemType)?.value,
            itemType,
          )
        "
      >
        {{ getFooterDualData(data, itemType)?.value }}
        <span class="text-xs ml-1 text-green-600 dark:text-green-400">●</span>
      </div>
      <div
        v-else
        :class="
          getValueColorClasses(
            getFooterDualData(data, itemType)?.value,
            itemType,
          )
        "
      >
        {{ getFooterDualData(data, itemType)?.value }}
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
    data: {
      type: Object,
      required: true
    },
    itemType: {
      type: String,
      required: true
    },
    closedTooltip: {
      type: String,
      default: 'Month is closed - actual amount is displayed'
    },
    formatAmountWithSign: {
      type: Function,
      required: true
    },
    formatCurrency: {
      type: Function,
      required: true
    },
    dualMode: {
      type: String,
      required: true
    }
  })

// Helper function to get raw value for CSS classes
const getRawValueForCSS = (dualData) => {
  if (!dualData) return 0

  // For dual mode, we don't want to apply color classes to the container
  // The individual actual/expected values will handle their own colors
  if (props.dualMode === 'both') {
    return 0 // Return 0 to avoid applying color classes to container
  }

  // For single modes, use the appropriate value
  if (props.dualMode === 'actual') {
    return dualData.actual || 0
  } else if (props.dualMode === 'expected') {
    return dualData.expected || 0
  }

  return dualData.expected || 0
}

// Helper function to get footer cell classes
const getFooterCellClasses = (amount, itemType) => {
  const baseClasses = 'text-center font-medium'

  // For net item type in single modes, don't apply color classes to container
  if (itemType === 'net') {
    return baseClasses
  }

  if (amount === 0) return baseClasses

  switch (itemType) {
    case 'income':
      return `${baseClasses} text-green-600 dark:text-green-400`
    case 'expense':
      return `${baseClasses} text-red-600 dark:text-red-400`
    default:
      return baseClasses
  }
}

// Helper function to get color classes for individual values
const getValueColorClasses = (value, itemType) => {
  if (value === 0 || value === '—') return ''

  // For net item type, check if value is positive or negative
  if (itemType === 'net') {
    // Handle different value formats: "—", "- 2,222", "+ 2,222", "- USD 2,222", "+ USD 2,222"
    if (value === '—' || value === 0) {
      return ''
    }

    // Check if value is a string and contains a sign
    if (typeof value === 'string') {
      // Check for positive sign (+)
      if (value.includes('+')) {
        return 'text-green-600 dark:text-green-400'
      }
      // Check for negative sign (-)
      if (value.includes('-')) {
        return 'text-red-600 dark:text-red-400'
      }
      // If no sign, try to parse as number
      const numericValue = parseFloat(value.replace(/[,$]/g, ''))
      return numericValue > 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'
    }

    // Handle numeric values
    return value > 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  // For income and expense, use standard colors
  switch (itemType) {
    case 'income':
      return 'text-green-600 dark:text-green-400'
    case 'expense':
      return 'text-red-600 dark:text-red-400'
    default:
      return ''
  }
}

// Helper function to get footer dual data
const getFooterDualData = (dualData, itemType) => {
  if (!dualData) return null

  // Helper function to convert 0 to "—"
  const formatValue = (value) => {
    if (value === 0) return '—'
    return props.formatAmountWithSign(
        value,
        { type: itemType },
        props.formatCurrency
      )
  }

  switch (props.dualMode) {
    case 'actual':
      return {
          type: 'single',
          value: formatValue(dualData.actual),
          closed: dualData.closed
        }
    case 'expected':
      return {
          type: 'single',
          value: formatValue(dualData.expected),
          closed: dualData.closed
        }
    case 'both':
    default:
      if (dualData.closed) {
        // For closed months, show only actual (since actual = expected)
        return {
            type: 'single',
            value: formatValue(dualData.actual),
            closed: true
          }
      }

      // If both are 0, show single "—"
      if (dualData.actual === 0 && dualData.expected === 0) {
        return {
            type: 'single',
            value: '—',
            closed: false
          }
      }

      // For open months, show both
      {
        const actualFormatted = formatValue(dualData.actual)
        const expectedFormatted = formatValue(dualData.expected)

        return {
            type: 'both',
            actual: actualFormatted,
            expected: expectedFormatted,
            closed: false
          }
      }
  }
}
</script>

<style scoped>
  .footer-dual-mode .actual {
    border-bottom: 1px solid;
    margin-bottom: 2px;
    padding-bottom: 2px;
    font-weight: 500;
  }

  .footer-dual-mode {
    font-size: 0.875rem;
  }
</style>
