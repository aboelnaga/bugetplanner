import { useHawlStore } from '@/stores/hawlStore'
import { computed, ref } from 'vue'

export function useZakatPayments () {
  const hawlStore = useHawlStore()

  // State
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Payment statuses
  const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  }

  // Payment methods
  const PAYMENT_METHODS = {
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
    CHECK: 'check',
    ONLINE: 'online',
    MOBILE_PAYMENT: 'mobile_payment',
    OTHER: 'other'
  }

  // Computed properties
  const totalPayments = computed(() => {
    return payments.value.reduce((sum, payment) => {
      if (payment.status === PAYMENT_STATUS.COMPLETED) {
        return sum + (parseFloat(payment.amount) || 0)
      }
      return sum
    }, 0)
  })

  const completedPayments = computed(() => {
    return payments.value.filter(payment => payment.status === PAYMENT_STATUS.COMPLETED)
  })

  const pendingPayments = computed(() => {
    return payments.value.filter(payment => payment.status === PAYMENT_STATUS.PENDING)
  })

  const paymentsByYear = computed(() => {
    const grouped = {}
    payments.value.forEach(payment => {
      const year = new Date(payment.paymentDate).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(payment)
    })
    return grouped
  })

  const currentYearPayments = computed(() => {
    const currentYear = new Date().getFullYear()
    return paymentsByYear.value[currentYear] || []
  })

  const currentYearTotal = computed(() => {
    return currentYearPayments.value.reduce((sum, payment) => {
      if (payment.status === PAYMENT_STATUS.COMPLETED) {
        return sum + (parseFloat(payment.amount) || 0)
      }
      return sum
    }, 0)
  })

  // Actions
  const createPayment = async (paymentData) => {
    loading.value = true
    error.value = null

    try {
      const payment = {
        id: `payment-${Date.now()}`,
        hawlId: hawlStore.currentHawl?.id,
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || PAYMENT_METHODS.BANK_TRANSFER,
        status: PAYMENT_STATUS.PENDING,
        description: paymentData.description || '',
        recipient: paymentData.recipient || '',
        reference: paymentData.reference || '',
        notes: paymentData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      payments.value.push(payment)
      savePayments()

      // If this is for the current Hawl, mark it as paid
      if (hawlStore.currentHawl && payment.hawlId === hawlStore.currentHawl.id) {
        await markHawlAsPaid(payment)
      }

      return payment
    } catch (err) {
      error.value = err.message
      console.error('Error creating payment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePayment = async (paymentId, updates) => {
    loading.value = true
    error.value = null

    try {
      const paymentIndex = payments.value.findIndex(p => p.id === paymentId)
      if (paymentIndex === -1) {
        throw new Error('Payment not found')
      }

      const updatedPayment = {
        ...payments.value[paymentIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      payments.value[paymentIndex] = updatedPayment
      savePayments()

      return updatedPayment
    } catch (err) {
      error.value = err.message
      console.error('Error updating payment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markPaymentAsCompleted = async (paymentId, completionData = {}) => {
    return await updatePayment(paymentId, {
      status: PAYMENT_STATUS.COMPLETED,
      completedAt: new Date().toISOString(),
      ...completionData
    })
  }

  const markPaymentAsFailed = async (paymentId, failureReason = '') => {
    return await updatePayment(paymentId, {
      status: PAYMENT_STATUS.FAILED,
      failureReason,
      failedAt: new Date().toISOString()
    })
  }

  const deletePayment = async (paymentId) => {
    loading.value = true
    error.value = null

    try {
      const paymentIndex = payments.value.findIndex(p => p.id === paymentId)
      if (paymentIndex === -1) {
        throw new Error('Payment not found')
      }

      payments.value.splice(paymentIndex, 1)
      savePayments()

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting payment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markHawlAsPaid = async (payment) => {
    if (!hawlStore.currentHawl) return

    try {
      const paymentData = {
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes
      }

      await hawlStore.markZakatPaid(paymentData)

      // Create new Hawl for next year
      const newAssetValue = hawlStore.currentHawl?.currentAssets || 0
      await hawlStore.restartHawl(newAssetValue)

    } catch (err) {
      console.error('Error marking Hawl as paid:', err)
      throw err
    }
  }

  const getPaymentsByHawl = (hawlId) => {
    return payments.value.filter(payment => payment.hawlId === hawlId)
  }

  const getPaymentsByDateRange = (startDate, endDate) => {
    return payments.value.filter(payment => {
      const paymentDate = new Date(payment.paymentDate)
      return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)
    })
  }

  const getPaymentStats = () => {
    const stats = {
      total: payments.value.length,
      completed: completedPayments.value.length,
      pending: pendingPayments.value.length,
      failed: payments.value.filter(p => p.status === PAYMENT_STATUS.FAILED).length,
      totalAmount: totalPayments.value,
      currentYearAmount: currentYearTotal.value,
      averageAmount: completedPayments.value.length > 0
        ? totalPayments.value / completedPayments.value.length
        : 0
    }

    return stats
  }

  const savePayments = () => {
    try {
      localStorage.setItem('zakat-payments', JSON.stringify(payments.value))
    } catch (err) {
      console.error('Error saving payments:', err)
    }
  }

  const loadPayments = () => {
    try {
      const saved = localStorage.getItem('zakat-payments')
      if (saved) {
        payments.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Error loading payments:', err)
    }
  }

  const clearAllPayments = () => {
    payments.value = []
    localStorage.removeItem('zakat-payments')
  }

  const exportPayments = () => {
    const data = {
      payments: payments.value,
      exportDate: new Date().toISOString(),
      totalPayments: totalPayments.value,
      stats: getPaymentStats()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zakat-payments-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importPayments = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.payments && Array.isArray(data.payments)) {
            payments.value = data.payments
            savePayments()
            resolve(data)
          } else {
            reject(new Error('Invalid file format'))
          }
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }

  // Initialize
  const initialize = () => {
    loadPayments()
  }

  return {
    // State
    payments,
    loading,
    error,

    // Constants
    PAYMENT_STATUS,
    PAYMENT_METHODS,

    // Computed
    totalPayments,
    completedPayments,
    pendingPayments,
    paymentsByYear,
    currentYearPayments,
    currentYearTotal,

    // Actions
    createPayment,
    updatePayment,
    markPaymentAsCompleted,
    markPaymentAsFailed,
    deletePayment,
    markHawlAsPaid,
    getPaymentsByHawl,
    getPaymentsByDateRange,
    getPaymentStats,
    savePayments,
    loadPayments,
    clearAllPayments,
    exportPayments,
    importPayments,
    initialize
  }
}
