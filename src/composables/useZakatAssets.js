import { useAccountsStore } from '@/stores/accounts'
import { useBudgetStore } from '@/stores/budget'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets'
import { useTransactionStore } from '@/stores/transactions'
import { computed } from 'vue'

export function useZakatAssets () {
  const budgetStore = useBudgetStore()
  const accountsStore = useAccountsStore()
  const investmentAssetsStore = useInvestmentAssetsStore()
  const transactionStore = useTransactionStore()

  // Asset categories for Zakat calculation
  const ZAKATABLE_ASSET_TYPES = {
    CASH: 'cash',
    BANK_ACCOUNTS: 'bank_accounts',
    INVESTMENTS: 'investments',
    BUSINESS_INVENTORY: 'business_inventory',
    RECEIVABLES: 'receivables',
    GOLD_SILVER: 'gold_silver',
    REAL_ESTATE: 'real_estate',
    OTHER: 'other'
  }

  // Computed properties for asset aggregation
  const cashAssets = computed(() => {
    // Cash accounts (checking, savings, cash)
    const cashAccounts = accountsStore.accounts.filter(account =>
      ['checking', 'savings', 'cash'].includes(account.type)
    )

    return {
      type: ZAKATABLE_ASSET_TYPES.CASH,
      name: 'Cash & Bank Accounts',
      value: cashAccounts.reduce((sum, account) => sum + (account.balance || 0), 0),
      details: cashAccounts.map(account => ({
        name: account.name,
        type: account.type,
        balance: account.balance || 0
      }))
    }
  })

  const investmentAssets = computed(() => {
    // Active investment assets
    const activeInvestments = investmentAssetsStore.activeAssets

    return {
      type: ZAKATABLE_ASSET_TYPES.INVESTMENTS,
      name: 'Investment Assets',
      value: activeInvestments.reduce((sum, asset) => sum + (parseFloat(asset.current_value) || 0), 0),
      details: activeInvestments.map(asset => ({
        name: asset.name || asset.investment_name,
        type: asset.investment_type || asset.type,
        currentValue: parseFloat(asset.current_value) || 0,
        purchaseAmount: parseFloat(asset.purchase_amount) || 0
      }))
    }
  })

  const businessInventory = computed(() => {
    // Business-related budget items (inventory, receivables, etc.)
    const businessItems = budgetStore.budgetItems.filter(item =>
      item.category && (
        item.category.toLowerCase().includes('business') ||
        item.category.toLowerCase().includes('inventory') ||
        item.category.toLowerCase().includes('receivable') ||
        item.category.toLowerCase().includes('merchandise')
      )
    )

    // Calculate current value based on actual amounts
    const totalValue = businessItems.reduce((sum, item) => {
      const actualAmounts = item.actual_amounts || []
      const currentMonth = new Date().getMonth()
      const currentValue = actualAmounts[currentMonth] || actualAmounts[actualAmounts.length - 1] || 0
      return sum + (parseFloat(currentValue) || 0)
    }, 0)

    return {
      type: ZAKATABLE_ASSET_TYPES.BUSINESS_INVENTORY,
      name: 'Business Inventory & Receivables',
      value: totalValue,
      details: businessItems.map(item => ({
        name: item.name,
        category: item.category,
        currentValue: (item.actual_amounts || [])[new Date().getMonth()] || 0
      }))
    }
  })

  const goldSilverAssets = computed(() => {
    // Gold and silver related assets
    const goldSilverItems = budgetStore.budgetItems.filter(item =>
      item.category && (
        item.category.toLowerCase().includes('gold') ||
        item.category.toLowerCase().includes('silver') ||
        item.category.toLowerCase().includes('jewelry') ||
        item.category.toLowerCase().includes('precious')
      )
    )

    const totalValue = goldSilverItems.reduce((sum, item) => {
      const actualAmounts = item.actual_amounts || []
      const currentMonth = new Date().getMonth()
      const currentValue = actualAmounts[currentMonth] || actualAmounts[actualAmounts.length - 1] || 0
      return sum + (parseFloat(currentValue) || 0)
    }, 0)

    return {
      type: ZAKATABLE_ASSET_TYPES.GOLD_SILVER,
      name: 'Gold & Silver Assets',
      value: totalValue,
      details: goldSilverItems.map(item => ({
        name: item.name,
        category: item.category,
        currentValue: (item.actual_amounts || [])[new Date().getMonth()] || 0
      }))
    }
  })

  const realEstateAssets = computed(() => {
    // Real estate investments
    const realEstateInvestments = investmentAssetsStore.activeAssets.filter(asset =>
      asset.investment_type === 'real_estate' ||
      asset.type === 'real_estate'
    )

    return {
      type: ZAKATABLE_ASSET_TYPES.REAL_ESTATE,
      name: 'Real Estate Investments',
      value: realEstateInvestments.reduce((sum, asset) => sum + (parseFloat(asset.current_value) || 0), 0),
      details: realEstateInvestments.map(asset => ({
        name: asset.name || asset.investment_name,
        type: asset.investment_type || asset.type,
        currentValue: parseFloat(asset.current_value) || 0,
        status: asset.real_estate_status || asset.status
      }))
    }
  })

  const otherAssets = computed(() => {
    // Other assets that might be Zakatable
    const otherItems = budgetStore.budgetItems.filter(item =>
      item.type === 'investment' &&
      item.investment_direction === 'incoming' &&
      !item.category?.toLowerCase().includes('business') &&
      !item.category?.toLowerCase().includes('gold') &&
      !item.category?.toLowerCase().includes('silver')
    )

    const totalValue = otherItems.reduce((sum, item) => {
      const actualAmounts = item.actual_amounts || []
      const currentMonth = new Date().getMonth()
      const currentValue = actualAmounts[currentMonth] || actualAmounts[actualAmounts.length - 1] || 0
      return sum + (parseFloat(currentValue) || 0)
    }, 0)

    return {
      type: ZAKATABLE_ASSET_TYPES.OTHER,
      name: 'Other Investment Assets',
      value: totalValue,
      details: otherItems.map(item => ({
        name: item.name,
        category: item.category,
        currentValue: (item.actual_amounts || [])[new Date().getMonth()] || 0
      }))
    }
  })

  // Total Zakatable assets
  const totalZakatableAssets = computed(() => {
    const assets = [
      cashAssets.value,
      investmentAssets.value,
      businessInventory.value,
      goldSilverAssets.value,
      realEstateAssets.value,
      otherAssets.value
    ]

    return {
      total: assets.reduce((sum, asset) => sum + asset.value, 0),
      breakdown: assets.filter(asset => asset.value > 0),
      details: assets
    }
  })

  // Asset summary for display
  const assetSummary = computed(() => {
    const { total, breakdown } = totalZakatableAssets.value

    return {
      total,
      count: breakdown.length,
      categories: breakdown.map(asset => ({
        name: asset.name,
        value: asset.value,
        percentage: total > 0 ? (asset.value / total) * 100 : 0
      }))
    }
  })

  // Monthly asset tracking for Hawl continuity
  const getMonthlyAssetValue = (year, month) => {
    // This would calculate asset value for a specific month
    // For now, return current total (would need historical data)
    return totalZakatableAssets.value.total
  }

  // Asset growth tracking
  const assetGrowth = computed(() => {
    // Calculate growth compared to previous month
    const currentValue = totalZakatableAssets.value.total
    const previousMonth = new Date()
    previousMonth.setMonth(previousMonth.getMonth() - 1)

    // For now, return 0 (would need historical data)
    return {
      current: currentValue,
      previous: currentValue, // Placeholder
      growth: 0,
      growthPercentage: 0
    }
  })

  // Initialize asset data
  const initializeAssets = async () => {
    try {
      await Promise.all([
        budgetStore.fetchBudgetItems(),
        accountsStore.fetchAccounts(),
        investmentAssetsStore.fetchInvestmentAssets()
      ])
    } catch (error) {
      console.error('Error initializing asset data:', error)
    }
  }

  // Refresh asset data
  const refreshAssets = async () => {
    await initializeAssets()
  }

  return {
    // Asset types
    ZAKATABLE_ASSET_TYPES,

    // Individual asset categories
    cashAssets,
    investmentAssets,
    businessInventory,
    goldSilverAssets,
    realEstateAssets,
    otherAssets,

    // Aggregated data
    totalZakatableAssets,
    assetSummary,
    assetGrowth,

    // Utility functions
    getMonthlyAssetValue,
    initializeAssets,
    refreshAssets
  }
}
