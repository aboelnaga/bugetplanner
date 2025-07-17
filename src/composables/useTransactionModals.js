// Transaction modals composable
// Modal state management, form handling logic, validation functions

import { ref, watch } from 'vue'
import { 
  TRANSACTION_TYPES, 
  TRANSACTION_CATEGORIES,
  DEFAULT_TRANSACTION_VALUES,
  DATABASE_LIMITS
} from '@/constants/budgetConstants.js'
import { formatCurrency } from '@/utils/budgetUtils.js'

export function useTransactionModals(transactionStore, selectedYear, currentYear, currentMonth) {
  // Modal state
  const showAddTransactionModal = ref(false)
  const showEditTransactionModal = ref(false)
  const editingTransaction = ref(null)
  const isLoading = ref(false)

  // Form data
  const formData = ref({ ...DEFAULT_TRANSACTION_VALUES })

  // Initialize form data
  const initializeFormData = () => {
    formData.value = {
      ...DEFAULT_TRANSACTION_VALUES,
      date: new Date().toISOString().split('T')[0] // Today's date
    }
  }

  // Reset form data
  const resetFormData = () => {
    formData.value = {
      ...DEFAULT_TRANSACTION_VALUES,
      date: new Date().toISOString().split('T')[0]
    }
  }

  // Get categories by type
  const getCategoriesByType = (type) => {
    return TRANSACTION_CATEGORIES[type] || TRANSACTION_CATEGORIES[TRANSACTION_TYPES.EXPENSE]
  }

  // Update category when type changes
  const updateCategoryOnTypeChange = () => {
    const categories = getCategoriesByType(formData.value.type)
    formData.value.category = categories[0]
  }

  // Handle amount input with currency formatting
  const handleAmountInput = (event) => {
    const input = event.target
    const value = input.value
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    let cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
    
    // Check if the integer part exceeds the maximum length
    const maxLength = DATABASE_LIMITS.MAX_AMOUNT.toString().length // 10 digits
    if (parts[0].length > maxLength) {
      // Trim the integer part to max length
      cleanValue = parts[0].substring(0, maxLength) + (parts.length > 1 ? '.' + parts[1] : '')
    }
    
    // Convert to number
    let numberValue = parseFloat(cleanValue) || 0
    
    // Apply database limits (precision 12, scale 2 = max 9,999,999,999.99)
    if (numberValue > DATABASE_LIMITS.MAX_AMOUNT) {
      numberValue = DATABASE_LIMITS.MAX_AMOUNT
      // Show warning to user
      if (!window.amountLimitWarningShown) {
        alert(`Amount cannot exceed ${DATABASE_LIMITS.MAX_AMOUNT_FORMATTED} due to database limitations.`)
        window.amountLimitWarningShown = true
      }
    }
    
    // Update form data
    formData.value.amount = numberValue
    
    // Update input value with formatted display
    input.value = formatCurrency(numberValue)
  }

  // Handle tax amount input
  const handleTaxAmountInput = (event) => {
    const input = event.target
    const value = input.value
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    let cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
    
    // Convert to number
    let numberValue = parseFloat(cleanValue) || 0
    
    // Apply database limits
    if (numberValue > DATABASE_LIMITS.MAX_AMOUNT) {
      numberValue = DATABASE_LIMITS.MAX_AMOUNT
    }
    
    // Update form data
    formData.value.tax_amount = numberValue
    
    // Auto-calculate net amount if gross amount is set
    if (formData.value.gross_amount) {
      formData.value.net_amount = formData.value.gross_amount - numberValue
    }
    
    // Update input value with formatted display
    input.value = formatCurrency(numberValue)
  }

  // Handle gross amount input
  const handleGrossAmountInput = (event) => {
    const input = event.target
    const value = input.value
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    let cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
    
    // Convert to number
    let numberValue = parseFloat(cleanValue) || 0
    
    // Apply database limits
    if (numberValue > DATABASE_LIMITS.MAX_AMOUNT) {
      numberValue = DATABASE_LIMITS.MAX_AMOUNT
    }
    
    // Update form data
    formData.value.gross_amount = numberValue
    
    // Auto-calculate net amount if tax amount is set
    if (formData.value.tax_amount) {
      formData.value.net_amount = numberValue - formData.value.tax_amount
    }
    
    // Update input value with formatted display
    input.value = formatCurrency(numberValue)
  }

  // Handle net amount input
  const handleNetAmountInput = (event) => {
    const input = event.target
    const value = input.value
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    let cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
    
    // Convert to number
    let numberValue = parseFloat(cleanValue) || 0
    
    // Apply database limits
    if (numberValue > DATABASE_LIMITS.MAX_AMOUNT) {
      numberValue = DATABASE_LIMITS.MAX_AMOUNT
    }
    
    // Update form data
    formData.value.net_amount = numberValue
    
    // Auto-calculate gross amount if tax amount is set
    if (formData.value.tax_amount) {
      formData.value.gross_amount = numberValue + formData.value.tax_amount
    }
    
    // Update input value with formatted display
    input.value = formatCurrency(numberValue)
  }

  // Validate form data
  const validateFormData = () => {
    const errors = []
    
    if (!formData.value.description.trim()) {
      errors.push('Description is required')
    }
    
    if (formData.value.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }
    
    // Check for database limits
    if (formData.value.amount > DATABASE_LIMITS.MAX_AMOUNT) {
      errors.push(`Amount cannot exceed ${DATABASE_LIMITS.MAX_AMOUNT_FORMATTED} due to database limitations`)
    }
    
    if (!formData.value.date) {
      errors.push('Date is required')
    }
    
    // Validate tax amounts consistency
    if (formData.value.gross_amount && formData.value.net_amount && formData.value.tax_amount) {
      const expectedGross = formData.value.net_amount + formData.value.tax_amount
      if (Math.abs(formData.value.gross_amount - expectedGross) > 0.01) {
        errors.push('Tax amounts are inconsistent: gross amount must equal net amount + tax amount')
      }
    }
    
    return errors
  }

  // Create transaction data object for submission
  const createTransactionData = () => {
    return {
      description: formData.value.description,
      amount: formData.value.amount,
      type: formData.value.type,
      category: formData.value.category,
      date: formData.value.date,
      budget_item_id: formData.value.budget_item_id || null,
      account_name: formData.value.account_name,
      tags: formData.value.tags,
      notes: formData.value.notes,
      gross_amount: formData.value.gross_amount,
      tax_amount: formData.value.tax_amount,
      net_amount: formData.value.net_amount
    }
  }

  // Handle form submission for add modal
  const handleAddSubmit = async () => {
    try {
      isLoading.value = true
      
      const errors = validateFormData()
      if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      const transactionData = createTransactionData()
      console.log('Adding transaction with data:', transactionData)
      
      const result = await transactionStore.addTransaction(transactionData)
      console.log('Store result:', result)
      
      if (result) {
        resetFormData()
        return result
      } else {
        alert('Failed to add transaction. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Error adding transaction: ' + (error.message || 'Unknown error'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Handle form submission for edit modal
  const handleEditSubmit = async (transactionId) => {
    try {
      isLoading.value = true
      
      const errors = validateFormData()
      if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'))
        return false
      }

      const updateData = createTransactionData()
      
      console.log('Updating transaction with data:', updateData)
      const result = await transactionStore.updateTransaction(transactionId, updateData)
      console.log('Store result:', result)
      
      if (result) {
        return result
      } else {
        alert('Failed to update transaction. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Error updating transaction: ' + (error.message || 'Unknown error'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Initialize form data when transaction prop changes (for edit modal)
  const initializeFormDataFromTransaction = (transaction) => {
    if (transaction) {
      formData.value = {
        ...transaction,
        // Ensure date is in YYYY-MM-DD format
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        // Ensure tags is an array
        tags: Array.isArray(transaction.tags) ? [...transaction.tags] : []
      }
    }
  }

  // Modal actions
  const openAddTransactionModal = () => {
    showAddTransactionModal.value = true
    initializeFormData()
  }

  const closeAddTransactionModal = () => {
    showAddTransactionModal.value = false
    resetFormData()
  }

  const openEditTransactionModal = (transaction) => {
    editingTransaction.value = transaction
    showEditTransactionModal.value = true
    initializeFormDataFromTransaction(transaction)
  }

  const closeEditTransactionModal = () => {
    showEditTransactionModal.value = false
    editingTransaction.value = null
  }

  // Form submission handlers
  const handleTransactionAdded = (transaction) => {
    console.log('Transaction added successfully:', transaction)
  }

  const handleTransactionUpdated = (transaction) => {
    console.log('Transaction updated successfully:', transaction)
  }

  // Transaction actions
  const editTransaction = (transaction) => {
    editingTransaction.value = transaction
    showEditTransactionModal.value = true
    initializeFormDataFromTransaction(transaction)
  }

  const deleteTransaction = async (transactionId) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const result = await transactionStore.deleteTransaction(transactionId)
      if (!result) {
        alert('Failed to delete transaction. Please try again.')
      }
    }
  }

  // Watch for modal opening to initialize form
  watch(() => showAddTransactionModal.value, (isOpen) => {
    if (isOpen) {
      initializeFormData()
    }
  })

  return {
    // Modal state
    showAddTransactionModal,
    showEditTransactionModal,
    editingTransaction,
    isLoading,
    formData,
    
    // Modal actions
    openAddTransactionModal,
    closeAddTransactionModal,
    openEditTransactionModal,
    closeEditTransactionModal,
    
    // Form management
    initializeFormData,
    resetFormData,
    initializeFormDataFromTransaction,
    getCategoriesByType,
    updateCategoryOnTypeChange,
    
    // Form input handlers
    handleAmountInput,
    handleTaxAmountInput,
    handleGrossAmountInput,
    handleNetAmountInput,
    
    // Form validation and submission
    validateFormData,
    createTransactionData,
    handleAddSubmit,
    handleEditSubmit,
    
    // Form handlers
    handleTransactionAdded,
    handleTransactionUpdated,
    
    // Transaction actions
    editTransaction,
    deleteTransaction
  }
} 