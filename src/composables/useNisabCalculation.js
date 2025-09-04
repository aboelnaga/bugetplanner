import { computed, ref } from 'vue'

export function useNisabCalculation() {
  // State
  const goldPricePerGram = ref(0) // EGP per gram
  const silverPricePerGram = ref(0) // EGP per gram
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Nisab thresholds (in grams)
  const NISAB_GOLD_GRAMS = 85 // 85 grams of gold
  const NISAB_SILVER_GRAMS = 595 // 595 grams of silver

  // Computed properties
  const nisabGoldValue = computed(() => {
    return goldPricePerGram.value * NISAB_GOLD_GRAMS
  })

  const nisabSilverValue = computed(() => {
    return silverPricePerGram.value * NISAB_SILVER_GRAMS
  })

  // Use the lower of gold or silver Nisab (Islamic ruling)
  const currentNisab = computed(() => {
    if (goldPricePerGram.value === 0 && silverPricePerGram.value === 0) {
      return 150000 // Fallback value in EGP
    }

    // If we have both prices, use the lower one
    if (goldPricePerGram.value > 0 && silverPricePerGram.value > 0) {
      return Math.min(nisabGoldValue.value, nisabSilverValue.value)
    }

    // If we only have one price, use that
    if (goldPricePerGram.value > 0) {
      return nisabGoldValue.value
    }

    if (silverPricePerGram.value > 0) {
      return nisabSilverValue.value
    }

    return 150000 // Fallback
  })

  const nisabSource = computed(() => {
    if (goldPricePerGram.value === 0 && silverPricePerGram.value === 0) {
      return 'fallback'
    }

    if (goldPricePerGram.value > 0 && silverPricePerGram.value > 0) {
      return nisabGoldValue.value <= nisabSilverValue.value ? 'gold' : 'silver'
    }

    if (goldPricePerGram.value > 0) {
      return 'gold'
    }

    if (silverPricePerGram.value > 0) {
      return 'silver'
    }

    return 'fallback'
  })

  const nisabDetails = computed(() => {
    return {
      current: currentNisab.value,
      source: nisabSource.value,
      gold: {
        pricePerGram: goldPricePerGram.value,
        nisabGrams: NISAB_GOLD_GRAMS,
        nisabValue: nisabGoldValue.value
      },
      silver: {
        pricePerGram: silverPricePerGram.value,
        nisabGrams: NISAB_SILVER_GRAMS,
        nisabValue: nisabSilverValue.value
      },
      lastUpdated: lastUpdated.value
    }
  })

  // Mock API functions (replace with real API calls)
  const fetchGoldPrice = async () => {
    try {
      // Mock API call - replace with real API
      // Example: const response = await fetch('https://api.goldapi.io/api/XAU/EGP')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      // Mock data - replace with real API response
      const mockGoldPrice = 2800 // EGP per gram (example)
      goldPricePerGram.value = mockGoldPrice

      return mockGoldPrice
    } catch (err) {
      console.error('Error fetching gold price:', err)
      error.value = 'Failed to fetch gold price'
      throw err
    }
  }

  const fetchSilverPrice = async () => {
    try {
      // Mock API call - replace with real API
      // Example: const response = await fetch('https://api.goldapi.io/api/XAG/EGP')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      // Mock data - replace with real API response
      const mockSilverPrice = 35 // EGP per gram (example)
      silverPricePerGram.value = mockSilverPrice

      return mockSilverPrice
    } catch (err) {
      console.error('Error fetching silver price:', err)
      error.value = 'Failed to fetch silver price'
      throw err
    }
  }

  // Fetch both prices
  const fetchPreciousMetalPrices = async () => {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchGoldPrice(),
        fetchSilverPrice()
      ])

      lastUpdated.value = new Date().toISOString()

      // Save to localStorage for offline use
      localStorage.setItem('nisab-data', JSON.stringify({
        goldPrice: goldPricePerGram.value,
        silverPrice: silverPricePerGram.value,
        lastUpdated: lastUpdated.value
      }))

    } catch (err) {
      console.error('Error fetching precious metal prices:', err)
      error.value = 'Failed to fetch precious metal prices'
    } finally {
      loading.value = false
    }
  }

  // Load cached data
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem('nisab-data')
      if (cached) {
        const data = JSON.parse(cached)
        goldPricePerGram.value = data.goldPrice || 0
        silverPricePerGram.value = data.silverPrice || 0
        lastUpdated.value = data.lastUpdated || null

        // Check if data is older than 24 hours
        if (lastUpdated.value) {
          const lastUpdate = new Date(lastUpdated.value)
          const now = new Date()
          const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60)

          if (hoursDiff > 24) {
            // Data is stale, fetch new data
            fetchPreciousMetalPrices()
          }
        }
      }
    } catch (err) {
      console.error('Error loading cached Nisab data:', err)
    }
  }

  // Manual refresh
  const refreshPrices = async () => {
    await fetchPreciousMetalPrices()
  }

  // Initialize
  const initialize = async () => {
    loadCachedData()

    // If no cached data, fetch fresh data
    if (!lastUpdated.value) {
      await fetchPreciousMetalPrices()
    }
  }

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Format grams for display
  const formatGrams = (grams) => {
    return `${grams.toLocaleString()}g`
  }

  return {
    // State
    goldPricePerGram,
    silverPricePerGram,
    loading,
    error,
    lastUpdated,

    // Constants
    NISAB_GOLD_GRAMS,
    NISAB_SILVER_GRAMS,

    // Computed
    nisabGoldValue,
    nisabSilverValue,
    currentNisab,
    nisabSource,
    nisabDetails,

    // Actions
    fetchGoldPrice,
    fetchSilverPrice,
    fetchPreciousMetalPrices,
    loadCachedData,
    refreshPrices,
    initialize,
    formatPrice,
    formatGrams
  }
}
