import { ref, nextTick } from 'vue'

export function useSmartRefresh() {
  const isRefreshing = ref(false)
  const refreshProgress = ref(0)
  const lastScrollPosition = ref(0)
  const lastViewState = ref(null)

  // Save current view state
  const saveViewState = () => {
    lastScrollPosition.value = window.scrollY
    lastViewState.value = {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      timestamp: Date.now()
    }
  }

  // Restore view state
  const restoreViewState = async () => {
    if (lastViewState.value) {
      await nextTick()
      window.scrollTo({
        top: lastViewState.value.scrollY,
        left: lastViewState.value.scrollX,
        behavior: 'instant'
      })
    }
  }

  // Smart refresh with progress tracking
  const smartRefresh = async (refreshFunction, options = {}) => {
    const {
      preserveScroll = true,
      showProgress = true,
      progressSteps = ['Loading data...', 'Processing...', 'Updating view...'],
      onProgress = null
    } = options

    try {
      isRefreshing.value = true
      refreshProgress.value = 0

      // Save current state
      if (preserveScroll) {
        saveViewState()
      }

      // Step 1: Start loading
      if (showProgress && progressSteps[0]) {
        refreshProgress.value = 10
        if (onProgress) onProgress(progressSteps[0], 10)
      }

      // Step 2: Execute refresh function
      if (showProgress && progressSteps[1]) {
        refreshProgress.value = 30
        if (onProgress) onProgress(progressSteps[1], 30)
      }

      await refreshFunction()

      // Step 3: Update view
      if (showProgress && progressSteps[2]) {
        refreshProgress.value = 80
        if (onProgress) onProgress(progressSteps[2], 80)
      }

      // Step 4: Complete
      refreshProgress.value = 100
      if (onProgress) onProgress('Complete', 100)

      // Restore view state
      if (preserveScroll) {
        await restoreViewState()
      }

      return true
    } catch (error) {
      console.error('Smart refresh error:', error)
      throw error
    } finally {
      // Reset progress after a short delay
      setTimeout(() => {
        isRefreshing.value = false
        refreshProgress.value = 0
      }, 500)
    }
  }

  // Optimistic update helper
  const optimisticUpdate = async (updateFunction, rollbackFunction, options = {}) => {
    const {
      showLoading = true,
      onSuccess = null,
      onError = null
    } = options

    try {
      if (showLoading) {
        isRefreshing.value = true
        refreshProgress.value = 50
      }

      // Execute update
      const result = await updateFunction()

      if (showLoading) {
        refreshProgress.value = 100
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      console.error('Optimistic update error:', error)
      
      // Attempt rollback
      if (rollbackFunction) {
        try {
          await rollbackFunction()
        } catch (rollbackError) {
          console.error('Rollback error:', rollbackError)
        }
      }

      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      if (showLoading) {
        setTimeout(() => {
          isRefreshing.value = false
          refreshProgress.value = 0
        }, 500)
      }
    }
  }

  // Handle refresh conflicts and race conditions
  const debouncedRefresh = (() => {
    let timeoutId = null
    let lastRefreshTime = 0
    const minRefreshInterval = 1000 // 1 second minimum between refreshes

    return async (refreshFunction, options = {}) => {
      const now = Date.now()
      
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Check if we need to wait
      if (now - lastRefreshTime < minRefreshInterval) {
        const waitTime = minRefreshInterval - (now - lastRefreshTime)
        
        return new Promise((resolve, reject) => {
          timeoutId = setTimeout(async () => {
            try {
              lastRefreshTime = Date.now()
              const result = await smartRefresh(refreshFunction, options)
              resolve(result)
            } catch (error) {
              reject(error)
            }
          }, waitTime)
        })
      }

      // Execute immediately
      lastRefreshTime = now
      return smartRefresh(refreshFunction, options)
    }
  })()

  return {
    isRefreshing,
    refreshProgress,
    smartRefresh,
    optimisticUpdate,
    debouncedRefresh,
    saveViewState,
    restoreViewState
  }
} 