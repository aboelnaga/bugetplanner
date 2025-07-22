import { ref } from 'vue'

export function useAutoCloseFeedback() {
  const isAutoClosing = ref(false)
  const autoCloseProgress = ref(0)
  const showHeaderBadge = ref(false)
  const headerBadgeText = ref('')

  const startAutoCloseFeedback = (year, month, onComplete) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    const monthName = monthNames[month]
    
    // Set loading state
    isAutoClosing.value = true
    autoCloseProgress.value = 0
    
    // Show immediate feedback toast
    if (window.$toaster) {
      window.$toaster.info(
        'Auto-Closing Month',
        `🔄 Auto-closing ${monthName} ${year}...`
      )
    }
    
    // Simulate progress (since auto-close is fast, we'll show quick progress)
    const progressInterval = setInterval(() => {
      autoCloseProgress.value += 20
      if (autoCloseProgress.value >= 100) {
        clearInterval(progressInterval)
        completeAutoCloseFeedback(year, month, onComplete)
      }
    }, 100)
  }

  const completeAutoCloseFeedback = (year, month, onComplete) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    const monthName = monthNames[month]
    
    // Reset loading state
    isAutoClosing.value = false
    autoCloseProgress.value = 0
    
    // Show success toast
    if (window.$toaster) {
      window.$toaster.success(
        'Month Auto-Closed',
        `✓ ${monthName} ${year} has been automatically closed. Actual amounts are now displayed.`
      )
    }
    
    // Show header badge for 5 seconds
    showHeaderBadge.value = true
    headerBadgeText.value = `✓ ${monthName} ${year} Closed`
    
    setTimeout(() => {
      showHeaderBadge.value = false
      headerBadgeText.value = ''
    }, 5000)
    
    // Call completion callback to refresh data
    if (onComplete) {
      onComplete(year, month)
    }
  }

  const handleAutoCloseResult = (autoCloseResult, onComplete) => {
    if (autoCloseResult && autoCloseResult.autoClosed) {
      startAutoCloseFeedback(autoCloseResult.year, autoCloseResult.month, onComplete)
    }
  }

  return {
    isAutoClosing,
    autoCloseProgress,
    showHeaderBadge,
    headerBadgeText,
    startAutoCloseFeedback,
    completeAutoCloseFeedback,
    handleAutoCloseResult
  }
} 