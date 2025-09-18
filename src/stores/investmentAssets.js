import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { investmentAssetsAPI, subscribeToInvestmentAssetChanges } from '@/lib/supabase.js'
import { useAuthStore } from './auth.js'

export const useInvestmentAssetsStore = defineStore('investmentAssets', () => {
  const authStore = useAuthStore()

  // State
  const investmentAssets = ref([])
  const loading = ref(false)
  const error = ref(null)
  const subscription = ref(null)

  // Computed
  const activeAssets = computed(() =>
    investmentAssets.value.filter(asset =>
      asset.status === 'active' ||
      asset.real_estate_status === 'owned' ||
      asset.real_estate_status === 'finished_installments'
    )
  )

  const plannedAssets = computed(() =>
    investmentAssets.value.filter(asset =>
      asset.status === 'planned' ||
      asset.real_estate_status === 'planned'
    )
  )

  const soldAssets = computed(() =>
    investmentAssets.value.filter(asset => asset.status === 'sold')
  )

  const assetsByType = computed(() => {
    const grouped = {}
    investmentAssets.value.forEach(asset => {
      const type = asset.investment_type || asset.type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(asset)
    })
    return grouped
  })

  const totalPortfolioValue = computed(() => {
    return activeAssets.value.reduce((sum, asset) =>
      sum + (parseFloat(asset.current_value) || 0), 0
    )
  })

  const totalPurchaseValue = computed(() => {
    return activeAssets.value.reduce((sum, asset) =>
      sum + (parseFloat(asset.purchase_amount) || 0), 0
    )
  })

  const totalROI = computed(() => {
    return totalPortfolioValue.value - totalPurchaseValue.value
  })

  const totalROIPercentage = computed(() => {
    if (totalPurchaseValue.value === 0) return 0
    return (totalROI.value / totalPurchaseValue.value) * 100
  })

  // Actions
  const fetchInvestmentAssets = async () => {
    if (!authStore.user) return

    loading.value = true
    error.value = null

    try {
      const data = await investmentAssetsAPI.getInvestmentAssets(authStore.user.id)
      investmentAssets.value = data || []
    } catch (err) {
      console.error('Error fetching investment assets:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchInvestmentAsset = async (assetId) => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.getInvestmentAsset(assetId)
      return data
    } catch (err) {
      console.error('Error fetching investment asset:', err)
      error.value = err.message
      return null
    }
  }

  const createInvestmentAsset = async (assetData) => {
    if (!authStore.user) return null

    loading.value = true
    error.value = null

    try {
      const asset = {
        ...assetData,
        user_id: authStore.user.id
      }

      const data = await investmentAssetsAPI.createInvestmentAsset(asset)
      investmentAssets.value.unshift(data)
      return data
    } catch (err) {
      console.error('Error creating investment asset:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const updateInvestmentAsset = async (assetId, updates) => {
    if (!authStore.user) return null

    loading.value = true
    error.value = null

    try {
      const data = await investmentAssetsAPI.updateInvestmentAsset(assetId, updates)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error updating investment asset:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteInvestmentAsset = async (assetId) => {
    if (!authStore.user) return false

    loading.value = true
    error.value = null

    try {
      await investmentAssetsAPI.deleteInvestmentAsset(assetId)

      // Remove the asset from local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value.splice(index, 1)
      }

      return true
    } catch (err) {
      console.error('Error deleting investment asset:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  const linkToBudgetItem = async (assetId, budgetItemId) => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.linkToBudgetItem(assetId, budgetItemId)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error linking investment asset to budget item:', err)
      error.value = err.message
      return null
    }
  }

  const unlinkFromBudgetItem = async (assetId) => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.unlinkFromBudgetItem(assetId)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error unlinking investment asset from budget item:', err)
      error.value = err.message
      return null
    }
  }

  const getAssetsByType = async (type) => {
    if (!authStore.user) return []

    try {
      const data = await investmentAssetsAPI.getInvestmentAssetsByType(authStore.user.id, type)
      return data || []
    } catch (err) {
      console.error('Error fetching investment assets by type:', err)
      error.value = err.message
      return []
    }
  }

  const getAssetsByStatus = async (status) => {
    if (!authStore.user) return []

    try {
      const data = await investmentAssetsAPI.getInvestmentAssetsByStatus(authStore.user.id, status)
      return data || []
    } catch (err) {
      console.error('Error fetching investment assets by status:', err)
      error.value = err.message
      return []
    }
  }

  const getPortfolioValue = async () => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.getPortfolioValue(authStore.user.id)
      return data
    } catch (err) {
      console.error('Error fetching portfolio value:', err)
      error.value = err.message
      return null
    }
  }

  // Type-specific computed properties
  const realEstateAssets = computed(() =>
    investmentAssets.value.filter(asset =>
      asset.investment_type === 'real_estate' || asset.type === 'real_estate'
    )
  )

  const preciousMetalsAssets = computed(() =>
    investmentAssets.value.filter(asset =>
      asset.investment_type === 'precious_metals' || asset.type === 'precious_metals'
    )
  )

  const assetsByStatus = computed(() => {
    const grouped = {}
    investmentAssets.value.forEach(asset => {
      const status = asset.real_estate_status || asset.status
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(asset)
    })
    return grouped
  })

  // Type-specific actions
  const getRealEstateInvestments = async () => {
    if (!authStore.user) return []

    try {
      const data = await investmentAssetsAPI.getRealEstateInvestments(authStore.user.id)
      return data || []
    } catch (err) {
      console.error('Error fetching real estate investments:', err)
      error.value = err.message
      return []
    }
  }

  const getPreciousMetalsInvestments = async () => {
    if (!authStore.user) return []

    try {
      const data = await investmentAssetsAPI.getPreciousMetalsInvestments(authStore.user.id)
      return data || []
    } catch (err) {
      console.error('Error fetching precious metals investments:', err)
      error.value = err.message
      return []
    }
  }

  const getPreciousMetalsPortfolio = async () => {
    if (!authStore.user) return []

    try {
      const data = await investmentAssetsAPI.getPreciousMetalsPortfolio(authStore.user.id)
      return data || []
    } catch (err) {
      console.error('Error fetching precious metals portfolio:', err)
      error.value = err.message
      return []
    }
  }

  const updateInvestmentStatus = async (assetId, status) => {
    if (!authStore.user) return null

    loading.value = true
    error.value = null

    try {
      const data = await investmentAssetsAPI.updateInvestmentStatus(assetId, status)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error updating investment status:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const addDocumentLink = async (assetId, documentLink) => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.addDocumentLink(assetId, documentLink)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error adding document link:', err)
      error.value = err.message
      return null
    }
  }

  const removeDocumentLink = async (assetId, linkIndex) => {
    if (!authStore.user) return null

    try {
      const data = await investmentAssetsAPI.removeDocumentLink(assetId, linkIndex)

      // Update the asset in the local state
      const index = investmentAssets.value.findIndex(asset => asset.id === assetId)
      if (index !== -1) {
        investmentAssets.value[index] = data
      }

      return data
    } catch (err) {
      console.error('Error removing document link:', err)
      error.value = err.message
      return null
    }
  }

  // Subscription management
  const setupSubscription = () => {
    if (!authStore.user || subscription.value) return

    subscription.value = subscribeToInvestmentAssetChanges(authStore.user.id, (payload) => {
      console.log('Investment asset change:', payload)

      if (payload.eventType === 'INSERT') {
        investmentAssets.value.unshift(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = investmentAssets.value.findIndex(asset => asset.id === payload.new.id)
        if (index !== -1) {
          investmentAssets.value[index] = payload.new
        }
      } else if (payload.eventType === 'DELETE') {
        const index = investmentAssets.value.findIndex(asset => asset.id === payload.old.id)
        if (index !== -1) {
          investmentAssets.value.splice(index, 1)
        }
      }
    })
  }

  const cleanupSubscription = () => {
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }
  }

  // Store lifecycle
  const initialize = async () => {
    if (authStore.isAuthenticated) {
      await fetchInvestmentAssets()
      setupSubscription()
    }
  }

  const watchAuth = () => {
    if (authStore.isAuthenticated) {
      initialize()
    } else {
      cleanupSubscription()
      investmentAssets.value = []
      error.value = null
    }
  }

  return {
    // State
    investmentAssets,
    loading,
    error,

    // Computed
    activeAssets,
    plannedAssets,
    soldAssets,
    assetsByType,
    assetsByStatus,
    realEstateAssets,
    preciousMetalsAssets,
    totalPortfolioValue,
    totalPurchaseValue,
    totalROI,
    totalROIPercentage,

    // Actions
    fetchInvestmentAssets,
    fetchInvestmentAsset,
    createInvestmentAsset,
    updateInvestmentAsset,
    deleteInvestmentAsset,
    linkToBudgetItem,
    unlinkFromBudgetItem,
    getAssetsByType,
    getAssetsByStatus,
    getPortfolioValue,
    getRealEstateInvestments,
    getPreciousMetalsInvestments,
    getPreciousMetalsPortfolio,
    updateInvestmentStatus,
    addDocumentLink,
    removeDocumentLink,

    // Subscription
    setupSubscription,
    cleanupSubscription,

    // Lifecycle
    initialize,
    watchAuth
  }
})