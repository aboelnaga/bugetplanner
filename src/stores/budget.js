import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, budgetAPI } from '@/lib/supabase.js'
import { useAuthStore } from './auth.js'
import { useTransactionStore } from './transactions.js'
import { useAutoCloseFeedback } from '@/composables/useAutoCloseFeedback.js'

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useAuthStore()
  const transactionStore = useTransactionStore()
  const { 
    handleAutoCloseResult,
    isAutoClosing,
    autoCloseProgress,
    showHeaderBadge,
    headerBadgeText
  } = useAutoCloseFeedback()
  
  // State
  const budgetItems = ref([])
  const previousYearItems = ref([])
  // const budgetHistory = ref([]) // History functionality commented out
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear())
  
  // Separate loading states for different operations
  const addLoading = ref(false)
  const editLoading = ref(false)
  const deleteLoading = ref(false)

  // Computed properties
  const currentYear = computed(() => new Date().getFullYear())
  const currentMonth = computed(() => new Date().getMonth())

  // Get budget items for selected year
  const fetchBudgetItems = async (year = selectedYear.value) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      budgetItems.value = []
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('Store: Fetching budget items for user:', authStore.userId, 'year:', year)
      const response = await budgetAPI.getBudgetItems(authStore.userId, year)
      console.log('Store: Fetched budget items:', response)
      
      budgetItems.value = response.budgetItems || []
      previousYearItems.value = response.previousYearItems || []
      
      // Handle auto-close feedback using the composable
      if (response.autoCloseResult) {
        // Define completion callback to refresh data
        const onAutoCloseComplete = async (year, month) => {
          // Refresh budget items to show updated actual amounts
          await fetchBudgetItems(year)
          // Refresh closed months list
          await getClosedMonths(year)
        }
        
        handleAutoCloseResult(response.autoCloseResult, onAutoCloseComplete)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching budget items:', err)
      budgetItems.value = []
    } finally {
      loading.value = false
    }
  }



  // Add new budget item
  const addBudgetItem = async (budgetData) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null
    
    try {
      addLoading.value = true
      error.value = null
      
      // Prepare data with new frequency fields
      const budgetItemData = {
        ...budgetData,
        user_id: authStore.userId,
        year: selectedYear.value,
        // Map new frequency fields
        frequency: budgetData.frequency || 'repeats',
        recurrence_interval: budgetData.recurrenceInterval || 1,
        start_year: budgetData.startYear || selectedYear.value,
        end_year: budgetData.endYear || selectedYear.value,
        end_type: budgetData.endType || 'specific_date',
        occurrences: budgetData.occurrences || 12,
        one_time_year: budgetData.oneTimeYear,
        custom_months: budgetData.customMonths || [],
        // Legacy fields for backward compatibility
        recurrence: budgetData.recurrence || 'monthly',
        start_month: budgetData.startMonth || 0,
        end_month: budgetData.endMonth || 11
      }
      
      console.log('Store: Creating budget item with data:', budgetItemData)
      const data = await budgetAPI.createBudgetItem(budgetItemData)
      console.log('Store: API returned data:', data)
      
      // Add to local state immediately - no need for general loading state
      budgetItems.value.push(data)
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error adding budget item:', err)
      return null
    } finally {
      addLoading.value = false
    }
  }

  // Add multi-year budget items
  const addMultiYearBudgetItem = async (budgetData) => {
    if (!authStore.isAuthenticated || !authStore.userId) return null
    
    try {
      addLoading.value = true
      error.value = null
      
      console.log('Store: Creating multi-year budget items with data:', budgetData)
      
      const { start_year, end_year, end_month, defaultAmount, start_month, recurrence, customMonths, frequency, recurrenceInterval, endType, occurrences } = budgetData
      const linkedGroupId = crypto.randomUUID() // Generate unique group ID
      
      const createdItems = []
      
      // Create budget items for each year
      for (let year = start_year; year <= end_year; year++) {
        const isMaster = year === start_year
        const isFirstYear = year === start_year
        const isLastYear = year === end_year
        
        // Calculate monthly amounts for this specific year
        const monthlyAmounts = new Array(12).fill(0)
        const schedule = []
        let yearlyAmount = 0
        
        for (let month = 0; month < 12; month++) {
          let shouldHaveAmount = false
          
          // Check if this month should have amount based on year and recurrence
          if (isFirstYear && month < start_month) {
            // Before start month in first year
            shouldHaveAmount = false
          } else if (isLastYear && end_month !== null && month > end_month) {
            // After end month in last year
            shouldHaveAmount = false
          } else {
            // Check if this month should have amount based on new frequency system
            if (frequency === 'repeats') {
              // Calculate based on interval
              const monthOffset = month - start_month
              if (monthOffset >= 0 && monthOffset % recurrenceInterval === 0) {
                shouldHaveAmount = true
              }
            } else if (frequency === 'custom') {
              shouldHaveAmount = customMonths && customMonths.includes(month)
            } else if (frequency === 'once') {
              // One-time doesn't make sense for multi-year, but handle gracefully
              shouldHaveAmount = false
            }
          }
          
          if (shouldHaveAmount) {
            monthlyAmounts[month] = budgetData.default_amount // Use the actual default amount
            schedule.push(month)
            yearlyAmount += budgetData.default_amount
          }
        }
        
        // Create budget item data for this year
        const yearBudgetData = {
          ...budgetData,
          user_id: authStore.userId,
          year: year,
          default_amount: budgetData.default_amount, // Keep original default amount
          amounts: monthlyAmounts, // Set the calculated monthly amounts
          schedule: schedule, // Set the calculated schedule
          is_multi_year: true,
          linked_group_id: linkedGroupId,
          is_master: isMaster,
          start_year: start_year,
          end_year: end_year,
          end_month: end_month,
          // New frequency fields
          frequency: frequency || 'repeats',
          recurrence_interval: recurrenceInterval || 1,
          start_year: start_year,
          end_year: end_year,
          end_type: endType || 'specific_date',
          occurrences: occurrences || 12,
          custom_months: customMonths || []
        }
        
        console.log(`Store: Creating budget item for year ${year} with data:`, yearBudgetData)
        
        const data = await budgetAPI.createBudgetItem(yearBudgetData)
        console.log(`Store: API returned data for year ${year}:`, data)
        
        createdItems.push(data)
      }
      
      // Add only current year items to local state
      const currentYearItems = createdItems.filter(item => item.year === selectedYear.value)
      budgetItems.value.push(...currentYearItems)
      
      console.log('Store: Added current year items to local state:', currentYearItems)
      
      return createdItems
    } catch (err) {
      error.value = err.message
      console.error('Error adding multi-year budget items:', err)
      return null
    } finally {
      addLoading.value = false
    }
  }

  // Get linked budget items (for multi-year budgets)
  const getLinkedBudgetItems = (linkedGroupId) => {
    return budgetItems.value.filter(item => item.linked_group_id === linkedGroupId)
  }

  // Delete multi-year budget items
  const deleteMultiYearBudgetItems = async (linkedGroupId) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      deleteLoading.value = true
      error.value = null
      
      const linkedItems = getLinkedBudgetItems(linkedGroupId)
      console.log('Store: Deleting multi-year budget items:', linkedItems.length, 'items')
      
      // Delete all linked items
      for (const item of linkedItems) {
        await budgetAPI.deleteBudgetItem(item.id)
      }
      
      // Remove from local state
      budgetItems.value = budgetItems.value.filter(item => item.linked_group_id !== linkedGroupId)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting multi-year budget items:', err)
      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // Update multi-year budget items
  const updateMultiYearBudgetItems = async (linkedGroupId, updates) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      editLoading.value = true
      error.value = null
      
      const linkedItems = getLinkedBudgetItems(linkedGroupId)
      console.log('Store: Updating multi-year budget items:', linkedItems.length, 'items')
      
      // Extract multi-year specific data including new frequency fields
      const { 
        start_year, 
        end_year, 
        end_month, 
        start_month, 
        recurrence, 
        customMonths,
        default_amount,
        // New frequency fields
        frequency,
        recurrence_interval,
        end_type,
        occurrences,
        one_time_year
      } = updates
      
      // Check if the multi-year structure has changed
      const firstItem = linkedItems[0]
      const structureChanged = (
        firstItem.start_year !== start_year ||
        firstItem.end_year !== end_year ||
        firstItem.end_month !== end_month ||
        firstItem.start_month !== start_month ||
        firstItem.frequency !== frequency ||
        firstItem.recurrence_interval !== recurrence_interval
      )
      
      if (structureChanged) {
        console.log('Store: Multi-year structure changed, recreating items')
        
        // Delete all existing linked items
        for (const item of linkedItems) {
          await budgetAPI.deleteBudgetItem(item.id)
        }
        
        // Create new multi-year budget items with the updated structure
        const newBudgetData = {
          ...updates,
          user_id: authStore.userId,
          default_amount: default_amount
        }
        
        const createdItems = await addMultiYearBudgetItem(newBudgetData)
        
        if (createdItems) {
          console.log('Store: Successfully recreated multi-year budget items')
          return true
        } else {
          console.error('Store: Failed to recreate multi-year budget items')
          return false
        }
      } else {
        console.log('Store: Multi-year structure unchanged, updating existing items')
        
        // Update each linked item with recalculated amounts for that specific year
        for (const item of linkedItems) {
          const year = item.year
          const isFirstYear = year === start_year
          const isLastYear = year === end_year
          
          // Calculate monthly amounts for this specific year
          const monthlyAmounts = new Array(12).fill(0)
          const schedule = []
          let yearlyAmount = 0
          
          for (let month = 0; month < 12; month++) {
            let shouldHaveAmount = false
            
            // Check if this month should have amount based on year and new frequency system
            if (isFirstYear && month < start_month) {
              // Before start month in first year
              shouldHaveAmount = false
            } else if (isLastYear && end_month !== null && month > end_month) {
              // After end month in last year
              shouldHaveAmount = false
            } else {
              // Check if this month should have amount based on new frequency system
              if (frequency === 'repeats') {
                // Calculate based on interval
                const monthOffset = month - start_month
                if (monthOffset >= 0 && monthOffset % recurrence_interval === 0) {
                  shouldHaveAmount = true
                }
              } else if (frequency === 'custom') {
                shouldHaveAmount = customMonths && customMonths.includes(month)
              } else if (frequency === 'once') {
                // One-time doesn't make sense for multi-year, but handle gracefully
                shouldHaveAmount = false
              }
            }
            
            if (shouldHaveAmount) {
              monthlyAmounts[month] = default_amount
              schedule.push(month)
              yearlyAmount += default_amount
            }
          }
          
          // Create update data for this specific year including new frequency fields
          const yearUpdateData = {
            name: updates.name,
            type: updates.type,
            category: updates.category,
            recurrence: updates.recurrence, // Keep for backward compatibility
            default_amount: updates.default_amount,
            start_month: updates.start_month,
            payment_schedule: updates.payment_schedule,
            due_date: updates.due_date,
            is_fixed_expense: updates.is_fixed_expense,
            reminder_enabled: updates.reminder_enabled,
            reminder_days_before: updates.reminder_days_before,
            linked_investment_id: updates.linked_investment_id,
            is_multi_year: updates.is_multi_year,
            start_year: updates.start_year,
            end_year: updates.end_year,
            end_month: updates.end_month,
            amounts: monthlyAmounts,
            schedule: schedule,
            // New frequency fields
            frequency: frequency,
            recurrence_interval: recurrence_interval,
            start_year: start_year,
            end_year: end_year,
            end_type: end_type,
            occurrences: occurrences,
            one_time_year: one_time_year,
            custom_months: customMonths
          }
          
          if (updates.investment_direction) {
            yearUpdateData.investment_direction = updates.investment_direction
          }
          
          console.log(`Store: Updating budget item for year ${year} with data:`, yearUpdateData)
          
          // Update this specific year's item
          await budgetAPI.updateBudgetItem(item.id, yearUpdateData)
        }
        
        // Refresh the budget items to get updated data
        await fetchBudgetItems()
        
        return true
      }
    } catch (err) {
      error.value = err.message
      console.error('Error updating multi-year budget items:', err)
      return false
    } finally {
      editLoading.value = false
    }
  }

  // Update budget item
  const updateBudgetItem = async (id, updates) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      editLoading.value = true
      error.value = null
      
      // Get the current budget item to compare amounts
      const currentBudget = budgetItems.value.find(item => item.id === id)
      if (!currentBudget) return false
      
      const data = await budgetAPI.updateBudgetItem(id, updates)
      
      // Update local state immediately - no need for general loading state
      const index = budgetItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        budgetItems.value[index] = { ...budgetItems.value[index], ...data }
      }
      
      // Create history entries for any amount changes
      // if (updates.amounts && Array.isArray(updates.amounts)) {
      //   for (let monthIndex = 0; monthIndex < updates.amounts.length; monthIndex++) {
      //     const oldAmount = currentBudget.amounts[monthIndex] || 0
      //     const newAmount = updates.amounts[monthIndex] || 0
      //     
      //     if (oldAmount !== newAmount) {
      //       await addBudgetHistory(id, monthIndex, newAmount, oldAmount)
      //     }
      //   }
      // }
      
      // Refresh history to show the new entries
      // await fetchBudgetHistory()
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating budget item:', err)
      return false
    } finally {
      editLoading.value = false
    }
  }

  // Delete budget item
  const deleteBudgetItem = async (id) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      deleteLoading.value = true
      error.value = null
      
      await budgetAPI.deleteBudgetItem(id)
      
      // Remove from local state immediately - no need for general loading state
      budgetItems.value = budgetItems.value.filter(item => item.id !== id)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting budget item:', err)
      return false
    } finally {
      deleteLoading.value = false
    }
  }

  // Update monthly amount
  const updateMonthlyAmount = async (budgetId, monthIndex, amount) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      // Update local state first
      const budget = budgetItems.value.find(b => b.id === budgetId)
      if (!budget) return false
      
      const oldAmount = budget.amounts[monthIndex] || 0
      const numericOldValue = parseFloat(oldAmount) || 0
      const numericNewValue = parseFloat(amount) || 0
      
      // Only proceed if the values are actually different
      if (numericOldValue !== numericNewValue) {
        // Update the amounts array
        const newAmounts = [...budget.amounts]
        newAmounts[monthIndex] = numericNewValue
        
        // Update in database
        await budgetAPI.updateBudgetItem(budgetId, {
          amounts: newAmounts
        })
        
        // Update local state
        budget.amounts[monthIndex] = numericNewValue
        
        // Add to history
        // await addBudgetHistory(budgetId, monthIndex, numericNewValue)
      }
      
      return true
    } catch (err) {
      console.error('Error updating monthly amount:', err)
      return false
    }
  }

  

  // Add budget history entry
  // const addBudgetHistory = async (budgetId, monthIndex, newAmount, oldAmount = null) => {
  //   if (!authStore.isAuthenticated || !authStore.userId) return
  //   
  //   try {
  //     // If oldAmount is not provided, get it from the current budget
  //     if (oldAmount === null) {
  //       const budget = budgetItems.value.find(b => b.id === budgetId)
  //       if (!budget) return
  //       oldAmount = budget.amounts[monthIndex] || 0
  //     }
  //     
  //     if (oldAmount !== newAmount) {
  //       await budgetAPI.createBudgetHistory(authStore.userId, {
  //         budget_item_id: budgetId,
  //         month_index: monthIndex,
  //         old_amount: oldAmount,
  //         new_amount: newAmount,
  //         user_id: authStore.userId
  //       })
  //     }
  //   } catch (err) {
  //     console.error('Error adding budget history:', err)
  //   }
  // }

  // Fetch budget history
  // const fetchBudgetHistory = async () => {
  //   if (!authStore.isAuthenticated || !authStore.userId) {
  //     budgetHistory.value = []
  //     return
  //   }
  //   
  //   try {
  //     const data = await budgetAPI.getBudgetHistory(authStore.userId, selectedYear.value)
  //     
  //     budgetHistory.value = data || []
  //   } catch (err) {
  //     console.error('Error fetching budget history:', err)
  //     budgetHistory.value = []
  //   }
  // }

  // Copy budget items from previous year
  const copyFromPreviousYear = async (sourceYear, targetYear) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      loading.value = true
      error.value = null
      
      const data = await budgetAPI.copyBudgetItems(authStore.userId, sourceYear, targetYear)
      
      // Refresh current year data
      await fetchBudgetItems(targetYear)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error copying budget items:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Check if a specific year has budget items
  const hasBudgetItemsForYear = async (year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      // Use a more efficient check - just count items for the year
      const { count, error } = await supabase
        .from('budget_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authStore.userId)
        .eq('year', year)
      
      if (error) throw error
      return count > 0
    } catch (err) {
      console.error('Error checking budget items for year:', err)
      return false
    }
  }

  // Get budget items for a specific month with transactions
  const getBudgetItemsForMonth = async (month, year) => {
    console.log('getBudgetItemsForMonth called with month:', month, 'year:', year)
    console.log('Auth status:', authStore.isAuthenticated, 'userId:', authStore.userId)
    
    if (!authStore.isAuthenticated || !authStore.userId) {
      console.log('Not authenticated, returning empty array')
      return []
    }
    
    // Always fetch data for the specified year to ensure we have the latest
    console.log('Fetching budget items for year:', year)
    await fetchBudgetItems(year)
    
    console.log('Current budgetItems:', budgetItems.value.length)
    
    // Filter budget items for the specified year
    const yearItems = budgetItems.value.filter(item => item.year === year)
    console.log('Year items:', yearItems.length)
    
    // For now, return all items for the year since we don't have month-specific filtering
    // In the future, we could add month-specific logic based on payment schedules
    return yearItems.map(item => {
      // Get transactions for this budget item
      const itemTransactions = transactionStore?.transactions?.filter(t => 
        t.budget_item_id === item.id
      ) || []
      
      return {
        ...item,
        transactions: itemTransactions
      }
    })
  }

  // Get previous year data for a specific budget item
  const getPreviousYearData = (budgetItem) => {
    if (!previousYearItems.value || previousYearItems.value.length === 0) {
      return null
    }
    
    // Try to find matching item by name and category
    const matchingItem = previousYearItems.value.find(item => 
      item.name === budgetItem.name && 
      item.category === budgetItem.category &&
      item.type === budgetItem.type
    )
    
    return matchingItem || null
  }

  // Month closure functions
  const closeMonth = async (year, month) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      const result = await budgetAPI.closeMonth(authStore.userId, year, month)
      console.log('Month closed successfully:', result)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error closing month:', err)
      return false
    }
  }

  const getClosedMonths = async (year) => {
    if (!authStore.isAuthenticated || !authStore.userId) return []
    
    try {
      const data = await budgetAPI.getClosedMonths(authStore.userId, year)
      return data || []
    } catch (err) {
      console.error('Error fetching closed months:', err)
      return []
    }
  }

  const isMonthClosed = async (year, month) => {
    if (!authStore.isAuthenticated || !authStore.userId) return false
    
    try {
      return await budgetAPI.isMonthClosed(authStore.userId, year, month)
    } catch (err) {
      console.error('Error checking if month is closed:', err)
      return false
    }
  }

  // Initialize store
  const initialize = async () => {
    console.log('Store: Initializing, auth status:', authStore.isAuthenticated, 'userId:', authStore.userId)
    if (authStore.isAuthenticated && authStore.userId) {
      await fetchBudgetItems()
      // await fetchBudgetHistory() // History functionality commented out
    } else {
      // Clear data when not authenticated
      budgetItems.value = []
      // budgetHistory.value = [] // History functionality commented out
      error.value = null
    }
  }

  // Watch for authentication changes
  const watchAuth = () => {
    if (authStore.isAuthenticated && authStore.userId) {
      initialize()
    } else {
      // Clear data when user logs out
      budgetItems.value = []
      // budgetHistory.value = [] // History functionality commented out
      error.value = null
    }
  }

  return {
    // State
    budgetItems,
    previousYearItems,
    // budgetHistory, // History functionality commented out
    loading,
    error,
    selectedYear,
    
    // Loading states
    addLoading,
    editLoading,
    deleteLoading,
    
    // Auto-close feedback state
    isAutoClosing,
    autoCloseProgress,
    showHeaderBadge,
    headerBadgeText,
    
    // Computed
    currentYear,
    currentMonth,
    
    // Actions
    fetchBudgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateMonthlyAmount,
    // addBudgetHistory, // History functionality commented out
    // fetchBudgetHistory, // History functionality commented out
    copyFromPreviousYear,
    hasBudgetItemsForYear,
    getBudgetItemsForMonth,
    getPreviousYearData,
    closeMonth,
    getClosedMonths,
    isMonthClosed,
    initialize,
    watchAuth,
    addLoading,
    editLoading,
    deleteLoading,
    addMultiYearBudgetItem,
    getLinkedBudgetItems,
    deleteMultiYearBudgetItems,
    updateMultiYearBudgetItems
  }
}) 