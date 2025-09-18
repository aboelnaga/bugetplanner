import { computed } from 'vue'
import { MONTHS } from '@/constants/budgetConstants.js'

export function useBudgetDataTable (budgetItems, selectedYear, currentYear, currentMonth) {

  /**
   * Transform nested budget data into flat structure for DataTable
   */
  const flattenedBudgetData = computed(() => {
    if (!budgetItems.value || budgetItems.value.length === 0) {
      return []
    }

    return budgetItems.value.map(budget => {
      const flattened = {
        // Keep ALL original budget properties for modal compatibility
        ...budget,
        // Previous year data (placeholder for now)
        previousYear: 0,
        // Monthly planned amounts (flatten for DataTable display)
        ...generateMonthlyFields(budget.amounts || [], ''),
        // Monthly actual amounts (flatten for DataTable display)
        ...generateMonthlyFields(budget.actual_amounts || [], '_actual'),
        // Yearly totals (calculated for display)
        total: calculateYearlyTotal(budget.amounts || []),
        total_actual: calculateYearlyTotal(budget.actual_amounts || [])
      }

      return flattened
    })
  })

  /**
   * Generate monthly field names dynamically
   */
  const generateMonthlyFields = (amounts, suffix) => {
    const fields = {}
    MONTHS.forEach((month, index) => {
      const fieldName = month.toLowerCase()
      fields[fieldName + suffix] = amounts[index] || 0
    })
    return fields
  }

  /**
   * Calculate yearly total from monthly amounts
   */
  const calculateYearlyTotal = (amounts) => {
    if (!Array.isArray(amounts)) return 0
    return amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
  }

  /**
   * Generate dynamic columns for DataTable
   */
  const generateColumns = () => {
    const columns = [
      // Budget Item Column (frozen left)
      {
        field: 'name',
        header: 'Budget Item',
        frozen: 'left',
        width: '300px',
        bodyTemplate: (data) => {
          return {
            name: data.name,
            category: data.category,
            type: data.type,
            is_virtual: data.is_virtual,
            is_multi_year: data.is_multi_year,
            linked_investment_id: data.linked_investment_id
          }
        }
      },
      // Previous Year Column
      {
        field: 'previousYear',
        header: `PY ${selectedYear.value - 1}`,
        width: '120px',
        bodyTemplate: (data) => data.previousYear || 0
      }
    ]

    // Add monthly columns dynamically
    MONTHS.forEach((month, index) => {
      columns.push({
        field: month.toLowerCase(),
        header: month,
        width: '100px',
        bodyTemplate: (data) => data[month.toLowerCase()] || 0,
        // Add special styling for current month
        class: selectedYear.value === currentYear.value && index === currentMonth.value
          ? 'current-month'
          : ''
      })
    })

    // Total Column
    columns.push({
      field: 'total',
      header: 'Total',
      width: '120px',
      frozen: 'right',
      bodyTemplate: (data) => data.total || 0
    })

    // Actions Column (frozen right)
    columns.push({
      field: 'actions',
      header: 'Actions',
      width: '120px',
      frozen: 'right',
      bodyTemplate: (data) => data
    })

    return columns
  }

  /**
   * Generate column groups for header
   */
  const generateColumnGroups = () => {
    return [
      {
        type: 'header',
        rows: [
          {
            cells: [
              { header: 'Budget Item', rowspan: 2, frozen: 'left' },
              { header: 'Previous Year', rowspan: 2 },
              { header: 'Monthly Budget', colspan: MONTHS.length },
              { header: 'Total', rowspan: 2, frozen: 'right' },
              { header: 'Actions', rowspan: 2, frozen: 'right' }
            ]
          },
          {
            cells: [
              ...MONTHS.map(month => ({ header: month }))
            ]
          }
        ]
      }
    ]
  }

  /**
   * Generate footer rows for summary
   */
  const generateFooterRows = () => {
    return [
      {
        type: 'footer',
        rows: [
          {
            cells: [
              { footer: 'Income Total:', colspan: 2, footerStyle: 'text-align:right;font-weight:bold' },
              ...MONTHS.map(() => ({ footer: '' })),
              { footer: '', footerStyle: 'font-weight:bold' },
              { footer: '' }
            ]
          },
          {
            cells: [
              { footer: 'Expenses Total:', colspan: 2, footerStyle: 'text-align:right;font-weight:bold' },
              ...MONTHS.map(() => ({ footer: '' })),
              { footer: '', footerStyle: 'font-weight:bold' },
              { footer: '' }
            ]
          },
          {
            cells: [
              { footer: 'Net Balance:', colspan: 2, footerStyle: 'text-align:right;font-weight:bold' },
              ...MONTHS.map(() => ({ footer: '' })),
              { footer: '', footerStyle: 'font-weight:bold' },
              { footer: '' }
            ]
          }
        ]
      }
    ]
  }

  return {
    flattenedBudgetData,
    generateColumns,
    generateColumnGroups,
    generateFooterRows
  }
}
