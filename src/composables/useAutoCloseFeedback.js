import { ref } from 'vue'

export function useAutoCloseFeedback (toastFunction = null) {
  const isAutoClosing = ref(false)
  const autoCloseProgress = ref(0)
  const showHeaderBadge = ref(false)
  const headerBadgeText = ref('')

  // Helper function to show toast if available
  const showToast = (severity, summary, detail, life = 5000) => {
    if (toastFunction && typeof toastFunction === 'function') {
      toastFunction({ severity, summary, detail, life })
    } else if (window.$toaster) {
      // Fallback to old toaster for backward compatibility
      const method = severity === 'error' ? 'error' : severity === 'warn' ? 'warning' : severity
      window.$toaster[method](summary, detail)
    }
  }

  const startAutoCloseFeedback = (year, month, onComplete) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const monthName = monthNames[month]

    // Set loading state
    isAutoClosing.value = true
    autoCloseProgress.value = 0

    // Show immediate feedback toast
    showToast('info', 'Auto-Closing Month', `🔄 Auto-closing ${monthName} ${year}...`, 3000)

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
    showToast('success', 'Month Auto-Closed', `✓ ${monthName} ${year} has been automatically closed. Actual amounts are now displayed.`, 5000)

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