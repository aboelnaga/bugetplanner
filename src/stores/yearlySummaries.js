import { subscribeToYearlySummaryChanges, yearlySummaryAPI } from '@/lib/supabase.js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth.js'

export const useYearlySummariesStore = defineStore('yearlySummaries', () => {
  const authStore = useAuthStore()

  // State
  const yearlySummaries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const subscription = ref(null)

  // Computed properties
  const currentYear = computed(() => new Date().getFullYear())
  const previousYear = computed(() => currentYear.value - 1)

  // Get yearly summary for a specific year
  const getYearlySummary = (year) => {
    return yearlySummaries.value.find(summary => summary.year === year)
  }

  // Get previous year summary
  const getPreviousYearSummary = () => {
    return getYearlySummary(previousYear.value)
  }

  // Get smart default values for previous year (following the smart defaults logic)
  const getSmartPreviousYearValues = (year = null) => {
    // Use provided year or fallback to global previous year
    const targetYear = year || previousYear.value
    const summary = getYearlySummary(targetYear)
    if (!summary) return null

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // For previous years, always show actual amounts
    if (targetYear < currentYear) {
      return {
        income: parseFloat(summary.total_income_actual) || 0,
        expenses: parseFloat(summary.total_expenses_actual) || 0,
        investmentIncoming: parseFloat(summary.total_investment_incoming_actual) || 0,
        investmentOutgoing: parseFloat(summary.total_investment_outgoing_actual) || 0,
        net: (parseFloat(summary.total_income_actual) || 0) +
             (parseFloat(summary.total_investment_incoming_actual) || 0) -
             (parseFloat(summary.total_expenses_actual) || 0) -
             (parseFloat(summary.total_investment_outgoing_actual) || 0)
      }
    }

    // For current year, use smart defaults logic
    return {
      income: parseFloat(summary.total_income_actual) || 0,
      expenses: parseFloat(summary.total_expenses_actual) || 0,
      investmentIncoming: parseFloat(summary.total_investment_incoming_actual) || 0,
      investmentOutgoing: parseFloat(summary.total_investment_outgoing_actual) || 0,
      net: (parseFloat(summary.total_income_actual) || 0) +
           (parseFloat(summary.total_investment_incoming_actual) || 0) -
           (parseFloat(summary.total_expenses_actual) || 0) -
           (parseFloat(summary.total_investment_outgoing_actual) || 0)
    }
  }

  // Get actual values for previous year (always returns actual amounts from yearly summaries)
  const getActualPreviousYearValues = (year = null) => {
    // Use provided year or fallback to global previous year
    const targetYear = year || previousYear.value
    const summary = getYearlySummary(targetYear)
    if (!summary) return null

    // Always return actual amounts from yearly summaries
    return {
      income: parseFloat(summary.total_income_actual) || 0,
      expenses: parseFloat(summary.total_expenses_actual) || 0,
      investmentIncoming: parseFloat(summary.total_investment_incoming_actual) || 0,
      investmentOutgoing: parseFloat(summary.total_investment_outgoing_actual) || 0,
      net: (parseFloat(summary.total_income_actual) || 0) +
           (parseFloat(summary.total_investment_incoming_actual) || 0) -
           (parseFloat(summary.total_expenses_actual) || 0) -
           (parseFloat(summary.total_investment_outgoing_actual) || 0),
      savings: parseFloat(summary.total_savings_actual) || 0
    }
  }

  // Get detailed previous year values with both planned and actual
  const getDetailedPreviousYearValues = (year = null) => {
    // Use provided year or fallback to global previous year
    const targetYear = year || previousYear.value
    const summary = getYearlySummary(targetYear)
    if (!summary) return null

    return {
      income: {
        planned: parseFloat(summary.total_income_planned) || 0,
        actual: parseFloat(summary.total_income_actual) || 0
      },
      expenses: {
        planned: parseFloat(summary.total_expenses_planned) || 0,
        actual: parseFloat(summary.total_expenses_actual) || 0
      },
      investmentIncoming: {
        planned: parseFloat(summary.total_investment_incoming_planned) || 0,
        actual: parseFloat(summary.total_investment_incoming_actual) || 0
      },
      investmentOutgoing: {
        planned: parseFloat(summary.total_investment_outgoing_planned) || 0,
        actual: parseFloat(summary.total_investment_outgoing_actual) || 0
      }
    }
  }

  // Fetch yearly summaries for a user
  const fetchYearlySummaries = async (startYear = null, endYear = null) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      yearlySummaries.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      console.log('Store: Fetching yearly summaries for user:', authStore.userId)
      const data = await yearlySummaryAPI.getYearlySummaries(authStore.userId, startYear, endYear)
      console.log('Store: Fetched yearly summaries:', data)

      yearlySummaries.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching yearly summaries:', err)
      yearlySummaries.value = []
    } finally {
      loading.value = false
    }
  }

  // Fetch a specific yearly summary
  const fetchYearlySummary = async (year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null

    try {
      error.value = null

      console.log('Store: Fetching yearly summary for user:', authStore.userId, 'year:', year)
      const data = await yearlySummaryAPI.getYearlySummary(authStore.userId, year)
      console.log('Store: Fetched yearly summary:', data)

      // Update or add to local state
      if (data) {
        const index = yearlySummaries.value.findIndex(summary => summary.year === year)
        if (index !== -1) {
          yearlySummaries.value[index] = data
        } else {
          yearlySummaries.value.push(data)
        }
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching yearly summary:', err)
      return null
    }
  }

  // Manually recalculate yearly summary
  const recalculateYearlySummary = async (year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false

    try {
      error.value = null

      console.log('Store: Recalculating yearly summary for user:', authStore.userId, 'year:', year)
      await yearlySummaryAPI.recalculateYearlySummary(authStore.userId, year)

      // Refresh the summary
      await fetchYearlySummary(year)

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error recalculating yearly summary:', err)
      return false
    }
  }

  // Get yearly summary statistics
  const getYearlySummaryStats = async () => {
    if (!authStore.isAuthenticated || !authStore.userId) return []

    try {
      error.value = null

      console.log('Store: Fetching yearly summary stats for user:', authStore.userId)
      const data = await yearlySummaryAPI.getYearlySummaryStats(authStore.userId)
      console.log('Store: Fetched yearly summary stats:', data)

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching yearly summary stats:', err)
      return []
    }
  }

  // Setup real-time subscription
  const setupSubscription = () => {
    if (!authStore.isAuthenticated || !authStore.userId) return

    // Clean up existing subscription
    if (subscription.value) {
      subscription.value.unsubscribe()
    }

    console.log('Store: Setting up yearly summaries subscription for user:', authStore.userId)
    subscription.value = subscribeToYearlySummaryChanges(authStore.userId, (payload) => {
      console.log('Store: Yearly summary change received:', payload)

      if (payload.eventType === 'INSERT') {
        // Add new summary
        yearlySummaries.value.push(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        // Update existing summary
        const index = yearlySummaries.value.findIndex(summary => summary.id === payload.new.id)
        if (index !== -1) {
          yearlySummaries.value[index] = payload.new
        }
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted summary
        yearlySummaries.value = yearlySummaries.value.filter(summary => summary.id !== payload.old.id)
      }
    })
  }

  // Clean up subscription
  const cleanupSubscription = () => {
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }
  }

  // Initialize store
  const initialize = async () => {
    console.log('Store: Initializing yearly summaries, auth status:', authStore.isAuthenticated, 'userId:', authStore.userId)
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchYearlySummaries()
      setupSubscription()
    } else {
      // Clear data when not authenticated
      yearlySummaries.value = []
      error.value = null
      cleanupSubscription()
    }
  }

  // Watch for authentication changes
  const watchAuth = () => {
    if (authStore.isAuthenticated && authStore.userId) {
      initialize()
    } else {
      // Clear data when user logs out
      yearlySummaries.value = []
      error.value = null
      cleanupSubscription()
    }
  }

  return {
    // State
    yearlySummaries,
    loading,
    error,

    // Computed
    currentYear,
    previousYear,

    // Actions
    getYearlySummary,
    getPreviousYearSummary,
    getSmartPreviousYearValues,
    getActualPreviousYearValues,
    getDetailedPreviousYearValues,
    fetchYearlySummaries,
    fetchYearlySummary,
    recalculateYearlySummary,
    getYearlySummaryStats,
    setupSubscription,
    cleanupSubscription,
    initialize,
    watchAuth
  }
})
