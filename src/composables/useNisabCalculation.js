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

  // Update gold price manually
  const updateGoldPrice = (price) => {
    goldPricePerGram.value = parseFloat(price) || 0
    lastUpdated.value = new Date().toISOString()
    error.value = null
    savePricesToStorage()
  }

  // Update silver price manually
  const updateSilverPrice = (price) => {
    silverPricePerGram.value = parseFloat(price) || 0
    lastUpdated.value = new Date().toISOString()
    error.value = null
    savePricesToStorage()
  }

  // Update both prices
  const updatePrices = (goldPrice, silverPrice) => {
    goldPricePerGram.value = parseFloat(goldPrice) || 0
    silverPricePerGram.value = parseFloat(silverPrice) || 0
    lastUpdated.value = new Date().toISOString()
    error.value = null
    savePricesToStorage()
  }

  // Save prices to localStorage
  const savePricesToStorage = () => {
    try {
      localStorage.setItem('nisab-data', JSON.stringify({
        goldPrice: goldPricePerGram.value,
        silverPrice: silverPricePerGram.value,
        lastUpdated: lastUpdated.value
      }))
    } catch (err) {
      console.error('Error saving prices to storage:', err)
    }
  }

  // Load cached data (no longer fetches from API)
  const loadCachedPrices = () => {
    try {
      const cached = localStorage.getItem('nisab-data')
      if (cached) {
        const data = JSON.parse(cached)
        goldPricePerGram.value = data.goldPrice || 0
        silverPricePerGram.value = data.silverPrice || 0
        lastUpdated.value = data.lastUpdated || null
      }
    } catch (err) {
      console.error('Error loading cached prices:', err)
    }
  }



  // Initialize
  const initialize = async () => {
    loadCachedPrices()
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
    updateGoldPrice,
    updateSilverPrice,
    updatePrices,
    loadCachedPrices,
    initialize,
    formatPrice,
    formatGrams
  }
}
