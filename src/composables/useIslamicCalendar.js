import moment from 'moment-hijri'

/**
 * Islamic Calendar Composable
 * Provides Hijri to Gregorian date conversion and Hawl calculations
 */
export function useIslamicCalendar () {

  /**
   * Convert Gregorian date to Hijri date
   * @param {Date|string} gregorianDate - Gregorian date to convert
   * @returns {Object} Hijri date object with year, month, day
   */
  const toHijri = (gregorianDate) => {
    const hijriMoment = moment(gregorianDate)
    return {
      year: hijriMoment.iYear(),
      month: hijriMoment.iMonth() + 1, // moment-hijri uses 0-based months
      day: hijriMoment.iDate(),
      formatted: hijriMoment.format('iYYYY/iMM/iDD'),
      formattedArabic: hijriMoment.format('iYYYY/iMM/iDD', 'ar')
    }
  }

  /**
   * Convert Hijri date to Gregorian date
   * @param {number} year - Hijri year
   * @param {number} month - Hijri month (1-12)
   * @param {number} day - Hijri day (1-30)
   * @returns {Date} Gregorian date
   */
  const toGregorian = (year, month, day) => {
    const hijriMoment = moment().iYear(year).iMonth(month - 1).iDate(day)
    return hijriMoment.toDate()
  }

  /**
   * Get current Hijri date
   * @returns {Object} Current Hijri date
   */
  const getCurrentHijriDate = () => {
    return toHijri(new Date())
  }

  /**
   * Calculate Hawl end date (one lunar year from start date)
   * @param {Date|string} startDate - Hawl start date
   * @returns {Date} Hawl end date (354 days later)
   */
  const calculateHawlEndDate = (startDate) => {
    const startMoment = moment(startDate)
    const endMoment = startMoment.clone().add(354, 'days')
    return endMoment.toDate()
  }

  /**
   * Calculate days remaining in Hawl
   * @param {Date|string} startDate - Hawl start date
   * @returns {number} Days remaining until Hawl completion
   */
  const getDaysRemainingInHawl = (startDate) => {
    const endDate = calculateHawlEndDate(startDate)
    const now = new Date()
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  /**
   * Calculate Hawl progress percentage
   * @param {Date|string} startDate - Hawl start date
   * @returns {number} Progress percentage (0-100)
   */
  const getHawlProgress = (startDate) => {
    const startMoment = moment(startDate)
    const now = moment()
    const endMoment = startMoment.clone().add(354, 'days')

    const totalDays = 354
    const elapsedDays = now.diff(startMoment, 'days')

    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
  }

  /**
   * Check if Hawl is completed
   * @param {Date|string} startDate - Hawl start date
   * @returns {boolean} True if Hawl is completed
   */
  const isHawlCompleted = (startDate) => {
    const endDate = calculateHawlEndDate(startDate)
    return new Date() >= endDate
  }

  /**
   * Get Hawl status
   * @param {Date|string} startDate - Hawl start date
   * @returns {Object} Hawl status information
   */
  const getHawlStatus = (startDate) => {
    const progress = getHawlProgress(startDate)
    const daysRemaining = getDaysRemainingInHawl(startDate)
    const isCompleted = isHawlCompleted(startDate)

    let status = 'active'
    if (isCompleted) {
      status = 'due'
    } else if (daysRemaining <= 30) {
      status = 'due_soon'
    }

    return {
      status,
      progress,
      daysRemaining,
      isCompleted,
      startDate: new Date(startDate),
      endDate: calculateHawlEndDate(startDate)
    }
  }

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string (default: 'YYYY-MM-DD')
   * @returns {string} Formatted date string
   */
  const formatDate = (date, format = 'YYYY-MM-DD') => {
    return moment(date).format(format)
  }

  /**
   * Format Hijri date for display
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string (default: 'iYYYY/iMM/iDD')
   * @returns {string} Formatted Hijri date string
   */
  const formatHijriDate = (date, format = 'iYYYY/iMM/iDD') => {
    return moment(date).format(format)
  }

  /**
   * Get Hijri month names
   * @returns {Array} Array of Hijri month names
   */
  const getHijriMonthNames = () => {
    return [
      'Muharram',
      'Safar',
      'Rabi\' al-awwal',
      'Rabi\' al-thani',
      'Jumada al-awwal',
      'Jumada al-thani',
      'Rajab',
      'Sha\'ban',
      'Ramadan',
      'Shawwal',
      'Dhu al-Qi\'dah',
      'Dhu al-Hijjah'
    ]
  }

  /**
   * Get Hijri month names in Arabic
   * @returns {Array} Array of Hijri month names in Arabic
   */
  const getHijriMonthNamesArabic = () => {
    return [
      'محرم',
      'صفر',
      'ربيع الأول',
      'ربيع الثاني',
      'جمادى الأولى',
      'جمادى الثانية',
      'رجب',
      'شعبان',
      'رمضان',
      'شوال',
      'ذو القعدة',
      'ذو الحجة'
    ]
  }

  /**
   * Validate if a date is valid
   * @param {Date|string} date - Date to validate
   * @returns {boolean} True if date is valid
   */
  const isValidDate = (date) => {
    return moment(date).isValid()
  }

  /**
   * Get days between two dates
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {number} Number of days between dates
   */
  const getDaysBetween = (startDate, endDate) => {
    const start = moment(startDate)
    const end = moment(endDate)
    return end.diff(start, 'days')
  }

  /**
   * Add days to a date
   * @param {Date|string} date - Base date
   * @param {number} days - Number of days to add
   * @returns {Date} New date with days added
   */
  const addDays = (date, days) => {
    return moment(date).add(days, 'days').toDate()
  }

  /**
   * Get current Islamic year
   * @returns {number} Current Islamic year
   */
  const getCurrentIslamicYear = () => {
    return moment().iYear()
  }

  /**
   * Check if current year is a leap year in Islamic calendar
   * @param {number} year - Islamic year to check
   * @returns {boolean} True if leap year
   */
  const isIslamicLeapYear = (year) => {
    const hijriMoment = moment().iYear(year)
    return hijriMoment.iDaysInMonth() === 30
  }

  return {
    // Date conversion
    toHijri,
    toGregorian,
    getCurrentHijriDate,

    // Hawl calculations
    calculateHawlEndDate,
    getDaysRemainingInHawl,
    getHawlProgress,
    isHawlCompleted,
    getHawlStatus,

    // Date formatting
    formatDate,
    formatHijriDate,

    // Month names
    getHijriMonthNames,
    getHijriMonthNamesArabic,

    // Utility functions
    isValidDate,
    getDaysBetween,
    addDays,
    getCurrentIslamicYear,
    isIslamicLeapYear
  }
}
