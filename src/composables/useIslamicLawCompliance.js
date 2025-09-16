import { computed, ref } from 'vue'

/**
 * Islamic Law Compliance Composable
 * Ensures Zakat calculations follow proper Islamic jurisprudence
 */
export function useIslamicLawCompliance() {

  // Islamic Schools of Thought (Madhahib)
  const ISLAMIC_SCHOOLS = {
    HANAFI: 'hanafi',
    MALIKI: 'maliki',
    SHAFII: 'shafii',
    HANBALI: 'hanbali'
  }

  // Nisab thresholds according to different schools
  const NISAB_THRESHOLDS = {
    [ISLAMIC_SCHOOLS.HANAFI]: {
      gold: 85, // grams
      silver: 595, // grams
      preference: 'silver', // Hanafi prefers silver standard (lower threshold)
      description: 'Hanafi school uses silver standard for Nisab calculation'
    },
    [ISLAMIC_SCHOOLS.MALIKI]: {
      gold: 85, // grams
      silver: 595, // grams
      preference: 'gold', // Maliki prefers gold standard
      description: 'Maliki school uses gold standard for Nisab calculation'
    },
    [ISLAMIC_SCHOOLS.SHAFII]: {
      gold: 85, // grams
      silver: 595, // grams
      preference: 'gold', // Shafi'i prefers gold standard
      description: 'Shafi\'i school uses gold standard for Nisab calculation'
    },
    [ISLAMIC_SCHOOLS.HANBALI]: {
      gold: 85, // grams
      silver: 595, // grams
      preference: 'gold', // Hanbali prefers gold standard
      description: 'Hanbali school uses gold standard for Nisab calculation'
    }
  }

  // Zakat rates by school (all are 2.5% but some schools have variations for specific assets)
  const ZAKAT_RATES = {
    [ISLAMIC_SCHOOLS.HANAFI]: {
      general: 0.025, // 2.5%
      agricultural: 0.1, // 10% for irrigated land
      description: 'Hanafi: 2.5% on general wealth, 10% on irrigated agricultural produce'
    },
    [ISLAMIC_SCHOOLS.MALIKI]: {
      general: 0.025, // 2.5%
      agricultural: 0.1, // 10% for irrigated land
      description: 'Maliki: 2.5% on general wealth, 10% on irrigated agricultural produce'
    },
    [ISLAMIC_SCHOOLS.SHAFII]: {
      general: 0.025, // 2.5%
      agricultural: 0.1, // 10% for irrigated land
      description: 'Shafi\'i: 2.5% on general wealth, 10% on irrigated agricultural produce'
    },
    [ISLAMIC_SCHOOLS.HANBALI]: {
      general: 0.025, // 2.5%
      agricultural: 0.1, // 10% for irrigated land
      description: 'Hanbali: 2.5% on general wealth, 10% on irrigated agricultural produce'
    }
  }

  // Zakatable assets by school (some schools have different rules)
  const ZAKATABLE_ASSETS = {
    [ISLAMIC_SCHOOLS.HANAFI]: {
      cash: true,
      gold: true,
      silver: true,
      jewelry: false, // Hanafi: No Zakat on jewelry for personal use
      businessInventory: true,
      realEstate: false, // Hanafi: No Zakat on personal residence
      agricultural: true,
      livestock: true,
      description: 'Hanafi: Excludes personal jewelry and residence from Zakat'
    },
    [ISLAMIC_SCHOOLS.MALIKI]: {
      cash: true,
      gold: true,
      silver: true,
      jewelry: true, // Maliki: Zakat on jewelry if above Nisab
      businessInventory: true,
      realEstate: false, // Maliki: No Zakat on personal residence
      agricultural: true,
      livestock: true,
      description: 'Maliki: Includes jewelry but excludes personal residence'
    },
    [ISLAMIC_SCHOOLS.SHAFII]: {
      cash: true,
      gold: true,
      silver: true,
      jewelry: true, // Shafi'i: Zakat on jewelry if above Nisab
      businessInventory: true,
      realEstate: false, // Shafi'i: No Zakat on personal residence
      agricultural: true,
      livestock: true,
      description: 'Shafi\'i: Includes jewelry but excludes personal residence'
    },
    [ISLAMIC_SCHOOLS.HANBALI]: {
      cash: true,
      gold: true,
      silver: true,
      jewelry: true, // Hanbali: Zakat on jewelry if above Nisab
      businessInventory: true,
      realEstate: false, // Hanbali: No Zakat on personal residence
      agricultural: true,
      livestock: true,
      description: 'Hanbali: Includes jewelry but excludes personal residence'
    }
  }

  // Hawl (lunar year) requirements by school
  const HAWL_REQUIREMENTS = {
    [ISLAMIC_SCHOOLS.HANAFI]: {
      duration: 354, // days (lunar year)
      continuity: 'strict', // Must maintain Nisab throughout
      interruption: 'restart', // Hawl restarts if interrupted
      description: 'Hanafi: Strict continuity required, Hawl restarts if interrupted'
    },
    [ISLAMIC_SCHOOLS.MALIKI]: {
      duration: 354, // days (lunar year)
      continuity: 'moderate', // Some flexibility in continuity
      interruption: 'partial', // Partial Hawl credit possible
      description: 'Maliki: Moderate continuity, partial credit for interrupted periods'
    },
    [ISLAMIC_SCHOOLS.SHAFII]: {
      duration: 354, // days (lunar year)
      continuity: 'strict', // Must maintain Nisab throughout
      interruption: 'restart', // Hawl restarts if interrupted
      description: 'Shafi\'i: Strict continuity required, Hawl restarts if interrupted'
    },
    [ISLAMIC_SCHOOLS.HANBALI]: {
      duration: 354, // days (lunar year)
      continuity: 'strict', // Must maintain Nisab throughout
      interruption: 'restart', // Hawl restarts if interrupted
      description: 'Hanbali: Strict continuity required, Hawl restarts if interrupted'
    }
  }

  // State
  const selectedSchool = ref(ISLAMIC_SCHOOLS.HANAFI) // Default to Hanafi
  const nisabCalculationMethod = ref('silver') // 'silver' or 'gold' - independent of school
  const complianceWarnings = ref([])
  const complianceErrors = ref([])

  // Computed properties
  const currentSchoolConfig = computed(() => ({
    nisab: NISAB_THRESHOLDS[selectedSchool.value],
    zakatRate: ZAKAT_RATES[selectedSchool.value],
    zakatableAssets: ZAKATABLE_ASSETS[selectedSchool.value],
    hawl: HAWL_REQUIREMENTS[selectedSchool.value]
  }))

  const schoolOptions = computed(() => [
    {
      label: 'Hanafi',
      value: ISLAMIC_SCHOOLS.HANAFI,
      description: 'Uses silver standard for Nisab (lower threshold)'
    },
    {
      label: 'Maliki',
      value: ISLAMIC_SCHOOLS.MALIKI,
      description: 'Uses gold standard for Nisab'
    },
    {
      label: 'Shafi\'i',
      value: ISLAMIC_SCHOOLS.SHAFII,
      description: 'Uses gold standard for Nisab'
    },
    {
      label: 'Hanbali',
      value: ISLAMIC_SCHOOLS.HANBALI,
      description: 'Uses gold standard for Nisab'
    }
  ])

  // Functions
  const setSchool = (school) => {
    if (Object.values(ISLAMIC_SCHOOLS).includes(school)) {
      selectedSchool.value = school
      validateCompliance()
    }
  }

  const setNisabCalculationMethod = (method) => {
    if (method === 'silver' || method === 'gold') {
      nisabCalculationMethod.value = method
      
      // Save to localStorage
      localStorage.setItem('zakat-nisab-method', method)
    }
  }

  const loadNisabMethodFromStorage = () => {
    const saved = localStorage.getItem('zakat-nisab-method')
    if (saved === 'silver' || saved === 'gold') {
      nisabCalculationMethod.value = saved
    }
  }

  const validateNisabCalculation = (goldPrice, silverPrice) => {
    const warnings = []
    const errors = []

    // Check if we have valid prices
    if (!goldPrice || goldPrice <= 0) {
      warnings.push('Gold price not available - using fallback Nisab value')
    }
    if (!silverPrice || silverPrice <= 0) {
      warnings.push('Silver price not available - using fallback Nisab value')
    }

    // Calculate Nisab according to selected school
    const schoolConfig = currentSchoolConfig.value
    const goldNisab = goldPrice * schoolConfig.nisab.gold
    const silverNisab = silverPrice * schoolConfig.nisab.silver

    // Use the selected Nisab calculation method (independent of school)
    let recommendedNisab
    if (nisabCalculationMethod.value === 'silver') {
      recommendedNisab = silverNisab
    } else {
      recommendedNisab = goldNisab
    }

    // Validate Nisab thresholds
    if (schoolConfig.nisab.gold !== 85) {
      errors.push(`Invalid gold Nisab threshold: ${schoolConfig.nisab.gold}g (should be 85g)`)
    }
    if (schoolConfig.nisab.silver !== 595) {
      errors.push(`Invalid silver Nisab threshold: ${schoolConfig.nisab.silver}g (should be 595g)`)
    }

    return {
      recommendedNisab,
      goldNisab,
      silverNisab,
      warnings,
      errors
    }
  }

  const validateZakatRate = (rate) => {
    const schoolConfig = currentSchoolConfig.value
    const expectedRate = schoolConfig.zakatRate.general

    if (Math.abs(rate - expectedRate) > 0.001) { // Allow for small floating point differences
      return {
        valid: false,
        error: `Invalid Zakat rate: ${rate} (should be ${expectedRate} for ${selectedSchool.value} school)`
      }
    }

    return { valid: true }
  }

  const validateHawlDuration = (startDate, endDate) => {
    const schoolConfig = currentSchoolConfig.value
    const expectedDays = schoolConfig.hawl.duration
    const actualDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    if (Math.abs(actualDays - expectedDays) > 1) { // Allow 1 day tolerance
      return {
        valid: false,
        warning: `Hawl duration: ${actualDays} days (expected ~${expectedDays} days for lunar year)`
      }
    }

    return { valid: true }
  }

  const validateAssetEligibility = (assetType) => {
    const schoolConfig = currentSchoolConfig.value
    return schoolConfig.zakatableAssets[assetType] || false
  }

  const validateCompliance = () => {
    complianceWarnings.value = []
    complianceErrors.value = []

    // Add school-specific warnings
    const schoolConfig = currentSchoolConfig.value
    complianceWarnings.value.push(schoolConfig.nisab.description)
    complianceWarnings.value.push(schoolConfig.zakatRate.description)
    complianceWarnings.value.push(schoolConfig.zakatableAssets.description)
    complianceWarnings.value.push(schoolConfig.hawl.description)
  }

  const getComplianceReport = () => {
    return {
      selectedSchool: selectedSchool.value,
      schoolConfig: currentSchoolConfig.value,
      warnings: complianceWarnings.value,
      errors: complianceErrors.value,
      isCompliant: complianceErrors.value.length === 0
    }
  }

  const resetCompliance = () => {
    complianceWarnings.value = []
    complianceErrors.value = []
  }

  return {
    // State
    selectedSchool,
    nisabCalculationMethod,
    complianceWarnings,
    complianceErrors,

    // Constants
    ISLAMIC_SCHOOLS,
    NISAB_THRESHOLDS,
    ZAKAT_RATES,
    ZAKATABLE_ASSETS,
    HAWL_REQUIREMENTS,

    // Computed
    currentSchoolConfig,
    schoolOptions,

    // Functions
    setSchool,
    setNisabCalculationMethod,
    loadNisabMethodFromStorage,
    validateNisabCalculation,
    validateZakatRate,
    validateHawlDuration,
    validateAssetEligibility,
    validateCompliance,
    getComplianceReport,
    resetCompliance
  }
}
