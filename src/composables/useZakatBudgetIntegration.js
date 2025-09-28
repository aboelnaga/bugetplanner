import { useIslamicCalendar } from '@/composables/useIslamicCalendar'
import { useZakatPayments } from '@/composables/useZakatPayments'
import { useBudgetStore } from '@/stores/budget'
import { useHawlStore } from '@/stores/hawlStore'
import { computed, ref } from 'vue'

export function useZakatBudgetIntegration () {
  const budgetStore = useBudgetStore()
  const hawlStore = useHawlStore()
  const zakatPayments = useZakatPayments()

  // Islamic calendar composable for date calculations
  const { calculateHawlEndDate } = useIslamicCalendar()

  // State
  const zakatBudgetItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Zakat budget item configuration
  const ZAKAT_BUDGET_CONFIG = {
    name: 'Zakat Payment',
    type: 'expense',
    category: 'Zakat',
    frequency: 'yearly',
    recurrence_interval: 1,
    end_type: 'specific_date',
    occurrences: 1,
    is_fixed_expense: false,
    reminder_enabled: true,
    reminder_days_before: 30
  }

  // Computed properties
  const currentYearZakatItems = computed(() => {
    const currentYear = new Date().getFullYear()
    return zakatBudgetItems.value.filter((item) => item.year === currentYear)
  })

  const upcomingZakatItems = computed(() => {
    const currentYear = new Date().getFullYear()
    return zakatBudgetItems.value.filter((item) => item.year > currentYear)
  })

  const totalZakatBudgeted = computed(() => {
    return zakatBudgetItems.value.reduce((sum, item) => {
      const amounts = item.amounts || []
      const yearlyTotal = amounts.reduce(
        (itemSum, amount) => itemSum + (parseFloat(amount) || 0),
        0
      )
      return sum + yearlyTotal
    }, 0)
  })

  const totalZakatPaid = computed(() => {
    return zakatPayments.totalPayments.value
  })

  const zakatBudgetStatus = computed(() => {
    const budgeted = totalZakatBudgeted.value
    const paid = totalZakatPaid.value

    return {
      budgeted,
      paid,
      remaining: budgeted - paid,
      percentage: budgeted > 0 ? (paid / budgeted) * 100 : 0,
      isOverBudget: paid > budgeted
    }
  })

  // Actions
  const createZakatBudgetItem = async (year, amount, hawlData = null) => {
    loading.value = true
    error.value = null

    try {
      // Check if Zakat budget item already exists for this year
      const existingItem = zakatBudgetItems.value.find(
        (item) => item.year === year
      )
      if (existingItem) {
        throw new Error(`Zakat budget item already exists for year ${year}`)
      }

      // Calculate Hawl end date for the year
      const hawlEndDate =
        hawlData?.endDate || calculateHawlEndDateForYear(year)

      // Create budget item data
      const budgetItemData = {
        ...ZAKAT_BUDGET_CONFIG,
        name: `Zakat Payment ${year}`,
        year,
        default_amount: amount,
        amounts: [amount], // Single yearly amount
        schedule: [
          {
            month: 11, // December (Hawl typically ends in December)
            year,
            amount
          }
        ],
        start_month: 11,
        start_year: year,
        end_month: 11,
        end_year: year,
        due_date: hawlEndDate,
        // Add Zakat-specific metadata
        zakat_metadata: {
          hawlId: hawlData?.id,
          hawlStartDate: hawlData?.startDate,
          hawlEndDate: hawlData?.endDate,
          nisabThreshold: hawlData?.nisabThreshold,
          assetValue: hawlData?.currentAssets,
          isZakatItem: true
        }
      }

      // Create the budget item
      const createdItem = await budgetStore.addBudgetItem(budgetItemData)

      if (createdItem) {
        zakatBudgetItems.value.push(createdItem)
        saveZakatBudgetItems()
      }

      return createdItem
    } catch (err) {
      error.value = err.message
      console.error('Error creating Zakat budget item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateZakatBudgetItem = async (itemId, updates) => {
    loading.value = true
    error.value = null

    try {
      const itemIndex = zakatBudgetItems.value.findIndex(
        (item) => item.id === itemId
      )
      if (itemIndex === -1) {
        throw new Error('Zakat budget item not found')
      }

      // Update the budget item
      const updatedItem = await budgetStore.updateBudgetItem(itemId, updates)

      if (updatedItem) {
        zakatBudgetItems.value[itemIndex] = updatedItem
        saveZakatBudgetItems()
      }

      return updatedItem
    } catch (err) {
      error.value = err.message
      console.error('Error updating Zakat budget item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteZakatBudgetItem = async (itemId) => {
    loading.value = true
    error.value = null

    try {
      // Delete from budget store
      await budgetStore.deleteBudgetItem(itemId)

      // Remove from local array
      const itemIndex = zakatBudgetItems.value.findIndex(
        (item) => item.id === itemId
      )
      if (itemIndex !== -1) {
        zakatBudgetItems.value.splice(itemIndex, 1)
        saveZakatBudgetItems()
      }

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting Zakat budget item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createZakatBudgetForCurrentHawl = async () => {
    if (!hawlStore.currentHawl) {
      throw new Error('No active Hawl found')
    }

    const hawl = hawlStore.currentHawl

    // Check if assets are above Nisab threshold
    if (hawl.currentAssets < hawlStore.currentNisab) {
      throw new Error('Assets below Nisab threshold - no Zakat required')
    }

    const hawlYear = new Date(hawl.endDate).getFullYear()
    const zakatAmount = calculateZakatAmount(hawl.currentAssets)

    return await createZakatBudgetItem(hawlYear, zakatAmount, hawl)
  }

  const createZakatBudgetForUpcomingYears = async (years = 3) => {
    const currentYear = new Date().getFullYear()
    const results = []

    // Check if current assets are above Nisab
    const currentAssets = hawlStore.currentHawl?.currentAssets || 0
    if (currentAssets < hawlStore.currentNisab) {
      throw new Error(
        'Current assets below Nisab threshold - no Zakat budget items needed'
      )
    }

    for (let i = 1; i <= years; i++) {
      const year = currentYear + i
      const estimatedAmount = calculateEstimatedZakatAmount(year)

      try {
        const item = await createZakatBudgetItem(year, estimatedAmount)
        results.push(item)
      } catch (err) {
        console.warn(
          `Could not create Zakat budget for year ${year}:`,
          err.message
        )
      }
    }

    return results
  }

  const updateZakatAmount = async (itemId, newAmount) => {
    const updates = {
      default_amount: newAmount,
      amounts: [newAmount],
      schedule: [
        {
          month: 11,
          year: zakatBudgetItems.value.find((item) => item.id === itemId)?.year,
          amount: newAmount
        }
      ]
    }

    return await updateZakatBudgetItem(itemId, updates)
  }

  const markZakatAsPaid = async (itemId, paymentData) => {
    // Update actual amounts in budget item
    const updates = {
      actual_amounts: [paymentData.amount],
      actual_schedule: [
        {
          month: 11,
          year: zakatBudgetItems.value.find((item) => item.id === itemId)?.year,
          amount: paymentData.amount,
          date: paymentData.paymentDate
        }
      ]
    }

    await updateZakatBudgetItem(itemId, updates)

    // Create payment record
    await zakatPayments.createPayment({
      ...paymentData,
      budgetItemId: itemId
    })
  }

  const calculateZakatAmount = (assetValue) => {
    const zakatRate = 2.5 // 2.5%
    return (assetValue * zakatRate) / 100
  }

  const calculateEstimatedZakatAmount = (year) => {
    // Estimate based on current assets with inflation
    const currentAssets = hawlStore.currentHawl?.currentAssets || 0
    const inflationRate = 0.05 // 5% annual inflation estimate
    const yearsFromNow = year - new Date().getFullYear()
    const estimatedAssets =
      currentAssets * Math.pow(1 + inflationRate, yearsFromNow)

    return calculateZakatAmount(estimatedAssets)
  }

  const calculateHawlEndDateForYear = (year) => {
    // Calculate Hawl end date for a given year
    // This would typically be based on when the Hawl started
    const hawlStartDate = new Date(`${year}-01-01`) // Placeholder
    return calculateHawlEndDate(hawlStartDate)
  }

  const syncWithBudgetStore = async () => {
    try {
      // Fetch all budget items and filter for Zakat items
      await budgetStore.fetchBudgetItems()

      const allBudgetItems = budgetStore.budgetItems || []
      zakatBudgetItems.value = allBudgetItems.filter(
        (item) =>
          item.zakat_metadata?.isZakatItem ||
          (item.category === 'Zakat' && item.name.includes('Zakat')) ||
          (item.category === 'Religious Obligations' &&
            item.name.includes('Zakat'))
      )

      saveZakatBudgetItems()
    } catch (err) {
      console.error('Error syncing with budget store:', err)
      throw err
    }
  }

  const saveZakatBudgetItems = () => {
    try {
      localStorage.setItem(
        'zakat-budget-items',
        JSON.stringify(zakatBudgetItems.value)
      )
    } catch (err) {
      console.error('Error saving Zakat budget items:', err)
    }
  }

  const loadZakatBudgetItems = () => {
    try {
      const saved = localStorage.getItem('zakat-budget-items')
      if (saved) {
        zakatBudgetItems.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Error loading Zakat budget items:', err)
    }
  }

  const clearAllZakatBudgetItems = () => {
    zakatBudgetItems.value = []
    localStorage.removeItem('zakat-budget-items')
  }

  const getZakatBudgetSummary = () => {
    const summary = {
      totalItems: zakatBudgetItems.value.length,
      currentYear: currentYearZakatItems.value.length,
      upcoming: upcomingZakatItems.value.length,
      totalBudgeted: totalZakatBudgeted.value,
      totalPaid: totalZakatPaid.value,
      status: zakatBudgetStatus.value
    }

    return summary
  }

  // Initialize
  const initialize = async () => {
    loadZakatBudgetItems()
    await syncWithBudgetStore()
    zakatPayments.initialize()
  }

  return {
    // State
    zakatBudgetItems,
    loading,
    error,

    // Configuration
    ZAKAT_BUDGET_CONFIG,

    // Computed
    currentYearZakatItems,
    upcomingZakatItems,
    totalZakatBudgeted,
    totalZakatPaid,
    zakatBudgetStatus,

    // Actions
    createZakatBudgetItem,
    updateZakatBudgetItem,
    deleteZakatBudgetItem,
    createZakatBudgetForCurrentHawl,
    createZakatBudgetForUpcomingYears,
    updateZakatAmount,
    markZakatAsPaid,
    calculateZakatAmount,
    calculateEstimatedZakatAmount,
    syncWithBudgetStore,
    saveZakatBudgetItems,
    loadZakatBudgetItems,
    clearAllZakatBudgetItems,
    getZakatBudgetSummary,
    initialize
  }
}
