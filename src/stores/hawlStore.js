import { useIslamicCalendar } from '@/composables/useIslamicCalendar'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useHawlStore = defineStore('hawl', () => {
  // Islamic calendar composable
  const {
    calculateHawlEndDate,
    getDaysRemainingInHawl,
    getHawlProgress,
    isHawlCompleted,
    toHijri,
    formatDate,
    formatHijriDate
  } = useIslamicCalendar()

  // State
  const currentHawl = ref(null)
  const hawlHistory = ref([])
  const assetSnapshots = ref([]) // Monthly asset snapshots for continuity tracking
  const nisabThreshold = ref(150000) // EGP - will be updated with real-time data

  // Hawl States
  const HAWL_STATES = {
    NEW: 'new',           // First time meeting Nisab
    ACTIVE: 'active',     // Hawl in progress
    DUE: 'due',          // Hawl completed, Zakat due
    PAID: 'paid',        // Zakat paid, new Hawl started
    INTERRUPTED: 'interrupted' // Hawl broke, need to restart
  }

  // Getters
  const hasActiveHawl = computed(() => {
    return currentHawl.value && currentHawl.value.status === HAWL_STATES.ACTIVE
  })

  const isHawlDue = computed(() => {
    return currentHawl.value && currentHawl.value.status === HAWL_STATES.DUE
  })

  const isHawlInterrupted = computed(() => {
    return currentHawl.value && currentHawl.value.status === HAWL_STATES.INTERRUPTED
  })

  const currentHawlStatus = computed(() => {
    if (!currentHawl.value) return null

    const progress = getHawlProgress(currentHawl.value.startDate)
    const daysRemaining = getDaysRemainingInHawl(currentHawl.value.startDate)
    const isCompleted = isHawlCompleted(currentHawl.value.startDate)

    return {
      ...currentHawl.value,
      progress,
      daysRemaining,
      isCompleted,
      statusSeverity: getStatusSeverity(currentHawl.value.status)
    }
  })

  const hawlProgress = computed(() => {
    if (!currentHawl.value) return 0
    return getHawlProgress(currentHawl.value.startDate)
  })

  const daysRemaining = computed(() => {
    if (!currentHawl.value) return 0
    return getDaysRemainingInHawl(currentHawl.value.startDate)
  })

  // Actions
  const initializeHawlStore = () => {
    loadHawlData()
    loadAssetSnapshots()
  }

  const loadHawlData = () => {
    try {
      const savedHawl = localStorage.getItem('zakat-hawl-data')
      const savedHistory = localStorage.getItem('zakat-hawl-history')

      if (savedHawl) {
        currentHawl.value = JSON.parse(savedHawl)
        // Validate and update Hawl status
        updateHawlStatus()
      }

      if (savedHistory) {
        hawlHistory.value = JSON.parse(savedHistory)
      }
    } catch (error) {
      console.error('Error loading Hawl data:', error)
    }
  }

  const saveHawlData = () => {
    try {
      if (currentHawl.value) {
        localStorage.setItem('zakat-hawl-data', JSON.stringify(currentHawl.value))
      }
      localStorage.setItem('zakat-hawl-history', JSON.stringify(hawlHistory.value))
    } catch (error) {
      console.error('Error saving Hawl data:', error)
    }
  }

  const createNewHawl = (initialAssets, previousPaymentData = null) => {
    const now = new Date()
    const endDate = calculateHawlEndDate(now)
    const hijriStart = toHijri(now)
    const hijriEnd = toHijri(endDate)

    const newHawl = {
      id: `hawl-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      startDate: now.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: HAWL_STATES.ACTIVE,
      initialAssets,
      currentAssets: initialAssets,
      nisabThreshold: nisabThreshold.value,
      hasBeenInterrupted: false,
      continuousAboveNisab: true,
      previousPaymentData,
      hijriStartDate: hijriStart,
      hijriEndDate: hijriEnd,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    currentHawl.value = newHawl
    saveHawlData()

    // Create initial asset snapshot
    createAssetSnapshot(initialAssets, 'Hawl started')

    return newHawl
  }

  const updateHawlStatus = () => {
    if (!currentHawl.value) return

    const now = new Date()
    const isCompleted = isHawlCompleted(currentHawl.value.startDate)

    // Check for interruption
    const isInterrupted = checkHawlInterruption()

    if (isInterrupted) {
      currentHawl.value.status = HAWL_STATES.INTERRUPTED
      currentHawl.value.hasBeenInterrupted = true
      currentHawl.value.continuousAboveNisab = false
    } else if (isCompleted) {
      currentHawl.value.status = HAWL_STATES.DUE
    } else {
      currentHawl.value.status = HAWL_STATES.ACTIVE
    }

    currentHawl.value.updatedAt = now.toISOString()
    saveHawlData()
  }

  const checkHawlInterruption = () => {
    if (!currentHawl.value) return false

    // Check if current assets are below Nisab
    if (currentHawl.value.currentAssets < nisabThreshold.value) {
      return true
    }

    // Check asset snapshots for continuity
    const relevantSnapshots = assetSnapshots.value.filter(snapshot =>
      new Date(snapshot.date) >= new Date(currentHawl.value.startDate)
    )

    // If any snapshot shows assets below Nisab, Hawl is interrupted
    return relevantSnapshots.some(snapshot =>
      snapshot.totalAssets < nisabThreshold.value
    )
  }

  const updateCurrentAssets = (newAssetValue) => {
    if (!currentHawl.value) return

    currentHawl.value.currentAssets = newAssetValue
    currentHawl.value.updatedAt = new Date().toISOString()

    // Check for interruption
    updateHawlStatus()

    // Create asset snapshot
    createAssetSnapshot(newAssetValue, 'Asset update')

    saveHawlData()
  }

  const createAssetSnapshot = (assetValue, reason = 'Monthly snapshot') => {
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      date: new Date().toISOString(),
      totalAssets: assetValue,
      nisabThreshold: nisabThreshold.value,
      isAboveNisab: assetValue >= nisabThreshold.value,
      reason,
      hawlId: currentHawl.value?.id
    }

    assetSnapshots.value.push(snapshot)

    // Keep only last 12 months of snapshots
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    assetSnapshots.value = assetSnapshots.value.filter(snapshot =>
      new Date(snapshot.date) >= twelveMonthsAgo
    )

    saveAssetSnapshots()
  }

  const saveAssetSnapshots = () => {
    try {
      localStorage.setItem('zakat-asset-snapshots', JSON.stringify(assetSnapshots.value))
    } catch (error) {
      console.error('Error saving asset snapshots:', error)
    }
  }

  const loadAssetSnapshots = () => {
    try {
      const saved = localStorage.getItem('zakat-asset-snapshots')
      if (saved) {
        assetSnapshots.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading asset snapshots:', error)
    }
  }

  const markZakatPaid = (paymentData) => {
    if (!currentHawl.value) return

    // Archive current Hawl
    const completedHawl = {
      ...currentHawl.value,
      status: HAWL_STATES.PAID,
      paymentData,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to history
    hawlHistory.value.push(completedHawl)

    // Clear current Hawl
    currentHawl.value = null

    saveHawlData()

    return completedHawl
  }

  const restartHawl = (newAssetValue) => {
    // Create new Hawl after interruption or payment
    return createNewHawl(newAssetValue, currentHawl.value?.previousPaymentData)
  }

  const getHawlHistory = () => {
    return hawlHistory.value.sort((a, b) =>
      new Date(b.startDate) - new Date(a.startDate)
    )
  }

  const getAssetContinuity = () => {
    if (!currentHawl.value) return { continuous: true, breakDate: null }

    const relevantSnapshots = assetSnapshots.value.filter(snapshot =>
      new Date(snapshot.date) >= new Date(currentHawl.value.startDate)
    )

    const breakSnapshot = relevantSnapshots.find(snapshot =>
      snapshot.totalAssets < nisabThreshold.value
    )

    return {
      continuous: !breakSnapshot,
      breakDate: breakSnapshot?.date || null,
      snapshots: relevantSnapshots
    }
  }

  const updateNisabThreshold = (newThreshold) => {
    nisabThreshold.value = newThreshold

    // Update current Hawl if exists
    if (currentHawl.value) {
      currentHawl.value.nisabThreshold = newThreshold
      updateHawlStatus()
      saveHawlData()
    }
  }

  const getStatusSeverity = (status) => {
    switch (status) {
      case HAWL_STATES.ACTIVE: return 'info'
      case HAWL_STATES.DUE: return 'warning'
      case HAWL_STATES.PAID: return 'success'
      case HAWL_STATES.INTERRUPTED: return 'danger'
      case HAWL_STATES.NEW: return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case HAWL_STATES.ACTIVE: return 'Active'
      case HAWL_STATES.DUE: return 'Due'
      case HAWL_STATES.PAID: return 'Paid'
      case HAWL_STATES.INTERRUPTED: return 'Interrupted'
      case HAWL_STATES.NEW: return 'New'
      default: return 'Unknown'
    }
  }

  const clearAllData = () => {
    currentHawl.value = null
    hawlHistory.value = []
    assetSnapshots.value = []

    localStorage.removeItem('zakat-hawl-data')
    localStorage.removeItem('zakat-hawl-history')
    localStorage.removeItem('zakat-asset-snapshots')
  }

  // Auto-update Hawl status every time the store is accessed
  const ensureHawlStatusUpdated = () => {
    if (currentHawl.value) {
      updateHawlStatus()
    }
  }

  return {
    // State
    currentHawl,
    hawlHistory,
    assetSnapshots,
    nisabThreshold,
    HAWL_STATES,

    // Getters
    hasActiveHawl,
    isHawlDue,
    isHawlInterrupted,
    currentHawlStatus,
    hawlProgress,
    daysRemaining,

    // Actions
    initializeHawlStore,
    createNewHawl,
    updateHawlStatus,
    updateCurrentAssets,
    createAssetSnapshot,
    markZakatPaid,
    restartHawl,
    getHawlHistory,
    getAssetContinuity,
    updateNisabThreshold,
    getStatusSeverity,
    getStatusLabel,
    clearAllData,
    ensureHawlStatusUpdated
  }
})
