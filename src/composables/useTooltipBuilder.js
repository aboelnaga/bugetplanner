// Reusable tooltip builder for Planned/Actual/Status lines

export function useTooltipBuilder (formatCurrency) {
  const BLUE_PLANNED = 'text-blue-300'
  const GREEN = 'text-green-300'
  const RED = 'text-red-300'
  const YELLOW = 'text-yellow-300'

  const formatPercent = (planned, variance) => {
    if (!planned || planned === 0) return 'n/a'
    const pct = (variance / planned) * 100
    const sign = pct >= 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}%`
  }

  const buildStatus = (planned, actual, category) => {
    const variance = actual - planned
    const percentText = formatPercent(planned, variance)

    if (variance === 0) {
      return {
        label: 'OnPlan',
        colorClass: 'text-white',
        amountText: '',
        percentText
      }
    }

    if (category === 'expense') {
      // Expenses and Purchases
      return {
        label: variance > 0 ? 'OverSpent' : 'Remaining',
        colorClass: variance > 0 ? RED : YELLOW,
        amountText: formatCurrency(Math.abs(variance)),
        percentText
      }
    }

    if (category === 'income') {
      // Income and Returns
      return {
        label: variance > 0 ? 'OverPaid' : 'Remaining',
        colorClass: variance > 0 ? GREEN : YELLOW,
        amountText: formatCurrency(Math.abs(variance)),
        percentText
      }
    }

    // Net (Balance or Investment)
    return {
      label: variance > 0 ? 'OverPaid' : 'Remaining',
      colorClass: variance > 0 ? GREEN : YELLOW,
      amountText: formatCurrency(Math.abs(variance)),
      percentText
    }
  }

  const buildTooltip = (planned, actual, category, actualColorClass) => {
    const { label, colorClass, amountText, percentText } = buildStatus(planned, actual, category)

    if (label === 'OnPlan') {
      return `<span class="font-bold">Planned:</span> <span class="${BLUE_PLANNED} font-bold">${formatCurrency(planned)}</span>
      <span class="font-bold">Actual:</span> <span class="${actualColorClass} font-bold">${formatCurrency(actual)}</span>
      <span class="font-bold">OnPlan</span>
      `
    }

    return `<span class="font-bold">Planned:</span> <span class="${BLUE_PLANNED} font-bold">${formatCurrency(planned)}</span>
    <span class="font-bold">Actual:</span> <span class="${actualColorClass} font-bold">${formatCurrency(actual)}</span>
    <span class="font-bold">${label}:</span> <span class="${colorClass} font-bold">${amountText} (${percentText})</span>
    `
  }

  const actualColorFor = (value, category) => {
    if (category === 'expense') return RED
    if (category === 'income') return GREEN
    // Net is value-based
    return value >= 0 ? GREEN : RED
  }

  const buildNetBreakdownTooltip = (plannedIncome, actualIncome, plannedExpense, actualExpense) => {
    const incomeStatus = buildStatus(plannedIncome, actualIncome, 'income')
    const expenseStatus = buildStatus(plannedExpense, actualExpense, 'expense')

    const incomeActualClass = actualColorFor(actualIncome, 'income')
    const expenseActualClass = actualColorFor(actualExpense, 'expense')

    const incomeStatusText = incomeStatus.label === 'OnPlan'
      ? 'OnPlan'
      : `${incomeStatus.label}: ${incomeStatus.amountText} (${incomeStatus.percentText})`

    const expenseStatusText = expenseStatus.label === 'OnPlan'
      ? 'OnPlan'
      : `${expenseStatus.label}: ${expenseStatus.amountText} (${expenseStatus.percentText})`

    // Render as compact table with white borders for clarity
    return `<table class="text-sm border border-white border-collapse">
      <thead>
        <tr>
          <th class="text-white font-bold pr-3 border border-white px-2 py-1"></th>
          <th class="text-white font-bold pr-3 border border-white px-2 py-1">Income</th>
          <th class="text-white font-bold border border-white px-2 py-1">Expense</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-white font-bold pr-3 border border-white px-2 py-0.5">Planned</td>
          <td class="${BLUE_PLANNED} font-bold border border-white px-2 py-0.5">${formatCurrency(plannedIncome)}</td>
          <td class="${BLUE_PLANNED} font-bold border border-white px-2 py-0.5">${formatCurrency(plannedExpense)}</td>
        </tr>
        <tr>
          <td class="text-white font-bold pr-3 border border-white px-2 py-0.5">Actual</td>
          <td class="${incomeActualClass} font-bold border border-white px-2 py-0.5">${formatCurrency(actualIncome)}</td>
          <td class="${expenseActualClass} font-bold border border-white px-2 py-0.5">${formatCurrency(actualExpense)}</td>
        </tr>
        <tr>
          <td class="text-white font-bold pr-3 border border-white px-2 py-0.5">Status</td>
          <td class="${incomeStatus.colorClass} font-bold border border-white px-2 py-0.5">${incomeStatusText}</td>
          <td class="${expenseStatus.colorClass} font-bold border border-white px-2 py-0.5">${expenseStatusText}</td>
        </tr>
      </tbody>
    </table>
    `
  }

  return {
    buildTooltip,
    actualColorFor,
    buildNetBreakdownTooltip
  }
}


