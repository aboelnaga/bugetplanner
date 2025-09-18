import { ref } from 'vue'

export function useErrorHandler (toastFunction = null) {
  const errors = ref([])
  const isHandlingError = ref(false)

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

  // Error types
  const ERROR_TYPES = {
    NETWORK: 'network',
    AUTHENTICATION: 'authentication',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    UNKNOWN: 'unknown'
  }

  // Error severity levels
  const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }

  // Classify error type
  const classifyError = (error) => {
    if (!error) return ERROR_TYPES.UNKNOWN

    // Network errors
    if (error.code === 'NETWORK_ERROR' ||
        error.message?.includes('network') ||
        error.message?.includes('fetch')) {
      return ERROR_TYPES.NETWORK
    }

    // Authentication errors
    if (error.code === 'PGRST301' ||
        error.message?.includes('auth') ||
        error.message?.includes('unauthorized')) {
      return ERROR_TYPES.AUTHENTICATION
    }

    // Validation errors
    if (error.code === 'PGRST400' ||
        error.message?.includes('validation') ||
        error.message?.includes('invalid')) {
      return ERROR_TYPES.VALIDATION
    }

    // Permission errors
    if (error.code === 'PGRST403' ||
        error.message?.includes('permission') ||
        error.message?.includes('forbidden')) {
      return ERROR_TYPES.PERMISSION
    }

    // Not found errors
    if (error.code === 'PGRST404' ||
        error.message?.includes('not found')) {
      return ERROR_TYPES.NOT_FOUND
    }

    // Server errors
    if (error.code === 'PGRST500' ||
        error.status >= 500) {
      return ERROR_TYPES.SERVER
    }

    return ERROR_TYPES.UNKNOWN
  }

  // Get error severity
  const getErrorSeverity = (errorType) => {
    switch (errorType) {
      case ERROR_TYPES.CRITICAL:
      case ERROR_TYPES.AUTHENTICATION:
        return ERROR_SEVERITY.CRITICAL
      case ERROR_TYPES.NETWORK:
      case ERROR_TYPES.SERVER:
        return ERROR_SEVERITY.HIGH
      case ERROR_TYPES.PERMISSION:
      case ERROR_TYPES.VALIDATION:
        return ERROR_SEVERITY.MEDIUM
      case ERROR_TYPES.NOT_FOUND:
        return ERROR_SEVERITY.LOW
      default:
        return ERROR_SEVERITY.MEDIUM
    }
  }

  // Get user-friendly error message
  const getErrorMessage = (error, errorType) => {
    const defaultMessage = 'An unexpected error occurred. Please try again.'

    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        return 'Network connection error. Please check your internet connection and try again.'
      case ERROR_TYPES.AUTHENTICATION:
        return 'Authentication error. Please log in again.'
      case ERROR_TYPES.VALIDATION:
        return error.message || 'Please check your input and try again.'
      case ERROR_TYPES.PERMISSION:
        return 'You don\'t have permission to perform this action.'
      case ERROR_TYPES.NOT_FOUND:
        return 'The requested resource was not found.'
      case ERROR_TYPES.SERVER:
        return 'Server error. Please try again later.'
      default:
        return error.message || defaultMessage
    }
  }

  // Get recovery action
  const getRecoveryAction = (errorType) => {
    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        return {
          label: 'Retry',
          action: 'retry',
          icon: 'refresh'
        }
      case ERROR_TYPES.AUTHENTICATION:
        return {
          label: 'Sign In',
          action: 'signin',
          icon: 'login'
        }
      case ERROR_TYPES.VALIDATION:
        return {
          label: 'Fix Input',
          action: 'fix',
          icon: 'edit'
        }
      case ERROR_TYPES.PERMISSION:
        return {
          label: 'Contact Admin',
          action: 'contact',
          icon: 'help'
        }
      case ERROR_TYPES.NOT_FOUND:
        return {
          label: 'Go Back',
          action: 'back',
          icon: 'arrow-left'
        }
      case ERROR_TYPES.SERVER:
        return {
          label: 'Retry Later',
          action: 'retry_later',
          icon: 'clock'
        }
      default:
        return {
          label: 'Try Again',
          action: 'retry',
          icon: 'refresh'
        }
    }
  }

  // Handle error with recovery strategy
  const handleError = async (error, context = '', options = {}) => {
    const {
      showNotification = true,
      logError = true,
      retryFunction = null,
      onRecovery = null
    } = options

    isHandlingError.value = true

    try {
      const errorType = classifyError(error)
      const severity = getErrorSeverity(errorType)
      const message = getErrorMessage(error, errorType)
      const recovery = getRecoveryAction(errorType)

      // Log error
      if (logError) {
        console.error(`Error in ${context}:`, {
          error,
          type: errorType,
          severity,
          message,
          recovery
        })
      }

      // Add to errors list
      const errorEntry = {
        id: Date.now(),
        type: errorType,
        severity,
        message,
        context,
        recovery,
        timestamp: new Date(),
        error
      }
      errors.value.push(errorEntry)

      // Show notification
      if (showNotification) {
        const notificationType = severity === ERROR_SEVERITY.CRITICAL ? 'error' : 'warn'
        showToast(notificationType, `Error in ${context}`, message)
      }

      // Handle recovery
      if (onRecovery) {
        await onRecovery(errorEntry)
      }

      return errorEntry
    } finally {
      isHandlingError.value = false
    }
  }

  // Retry with exponential backoff
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const errorType = classifyError(error)

        // Don't retry certain error types
        if (errorType === ERROR_TYPES.AUTHENTICATION ||
            errorType === ERROR_TYPES.PERMISSION ||
            errorType === ERROR_TYPES.VALIDATION) {
          throw error
        }

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // Clear errors
  const clearErrors = () => {
    errors.value = []
  }

  // Remove specific error
  const removeError = (errorId) => {
    const index = errors.value.findIndex(error => error.id === errorId)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  // Get errors by type
  const getErrorsByType = (type) => {
    return errors.value.filter(error => error.type === type)
  }

  // Get errors by severity
  const getErrorsBySeverity = (severity) => {
    return errors.value.filter(error => error.severity === severity)
  }

  return {
    errors,
    isHandlingError,
    ERROR_TYPES,
    ERROR_SEVERITY,
    handleError,
    retryWithBackoff,
    clearErrors,
    removeError,
    getErrorsByType,
    getErrorsBySeverity,
    classifyError,
    getErrorMessage,
    getRecoveryAction
  }
}