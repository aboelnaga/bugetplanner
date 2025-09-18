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

  // Savings calculations
  const calculateMonthlySavings = (monthIndex, year = selectedYear.value) => {
    // Get budget items for the specific year
    const yearItems = budgetItems.value.filter(item => item.year === year)

    // Calculate monthly net balance (income - expenses)
    const monthlyIncome = yearItems.reduce((sum, budget) => {
      if (budget.type === 'income') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === 'investment' && budget.investment_direction === 'incoming') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)

    const monthlyExpenses = yearItems.reduce((sum, budget) => {
      if (budget.type === 'expense') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === 'investment' && budget.investment_direction === 'outgoing') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)

    return monthlyIncome - monthlyExpenses
  }

  const calculateCumulativeSavings = (monthIndex, year = selectedYear.value) => {
    let cumulativeSavings = 0

    // Add savings from previous years (simplified - could be enhanced with actual data)
    if (year > currentYear.value) {
      // For future years, assume starting with 0 savings
      cumulativeSavings = 0
    } else if (year < currentYear.value) {
      // For past years, we could calculate from actual data if available
      // For now, assume starting with 0
      cumulativeSavings = 0
    } else {
      // For current year, calculate cumulative from start of year
      for (let month = 0; month <= monthIndex; month++) {
        cumulativeSavings += calculateMonthlySavings(month, year)
      }
    }

    return cumulativeSavings
  }

  // Current month data for Dashboard
  const currentMonthData = computed(() => {
    const currentMonthIndex = currentMonth.value
    const currentYearValue = currentYear.value

    // Calculate monthly totals
    const monthlyIncome = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'income') {
        return sum + (parseFloat(budget.amounts[currentMonthIndex]) || 0)
      }
      return sum
    }, 0)

    const monthlyExpenses = budgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'expense') {
        return sum + (parseFloat(budget.amounts[currentMonthIndex]) || 0)
      }
      return sum
    }, 0)

    const monthlySaving = monthlyIncome - monthlyExpenses
    const savings = calculateCumulativeSavings(currentMonthIndex, currentYearValue)

    return {
      month: currentMonthIndex,
      year: currentYearValue,
      monthlyIncome,
      monthlySpending: monthlyExpenses,
      monthlySaving,
      savings
    }
  })

  // Monthly data for charts
  const monthlyData = computed(() => {
    const data = []
    for (let month = 0; month < 12; month++) {
      const monthlyIncome = budgetItems.value.reduce((sum, budget) => {
        if (budget.type === 'income') {
          return sum + (parseFloat(budget.amounts[month]) || 0)
        }
        return sum
      }, 0)

      const monthlyExpenses = budgetItems.value.reduce((sum, budget) => {
        if (budget.type === 'expense') {
          return sum + (parseFloat(budget.amounts[month]) || 0)
        }
        return sum
      }, 0)

      const monthlySaving = monthlyIncome - monthlyExpenses
      const savings = calculateCumulativeSavings(month, selectedYear.value)

      data.push({
        month,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlySaving,
        cumulativeSavings: savings
      })
    }
    return data
  })

  // Savings rate calculation
  const currentSavingsRate = computed(() => {
    const currentMonth = currentMonthData.value
    if (currentMonth.monthlyIncome === 0) return 0
    return Math.round((currentMonth.monthlySaving / currentMonth.monthlyIncome) * 100)
  })

  // Zakat calculation (2.5% of savings)
  const zakatDue = computed(() => {
    const currentMonth = currentMonthData.value
    return currentMonth.savings * 0.025
  })

  // Family budgets (placeholder)
  const familyBudgets = computed(() => ({
    // This could be enhanced with actual family budget data
  }))

  const totalFamilyExpenses = computed(() => 0)

  // Investment totals (placeholder)
  const totalInvestments = computed(() => 0)

  // Projections (placeholder)
  const projections = computed(() => {
    // This could be enhanced with actual projection calculations
    return []
  })

  // Budget items with virtual unlinked items
  const budgetItemsWithUnlinked = computed(() => {
    // Get unlinked transactions from transaction store
    const unlinkedTransactions = transactionStore.transactions?.filter(transaction => {
      const transactionYear = new Date(transaction.date).getFullYear()
      return transactionYear === selectedYear.value && transaction.budget_item_id === null
    }) || []

    // If no unlinked transactions, return original budget items
    if (unlinkedTransactions.length === 0) {
      return budgetItems.value
    }

    // Separate transactions by type
    const incomeTransactions = unlinkedTransactions.filter(transaction => {
      return transaction.type === 'income'
    })

    const expenseTransactions = unlinkedTransactions.filter(transaction => {
      return transaction.type === 'expense'
    })

    // For investment transactions, use the investment_direction field
    const investmentIncomingTransactions = unlinkedTransactions.filter(transaction => {
      return transaction.type === 'investment' && transaction.investment_direction === 'incoming'
    })

    const investmentOutgoingTransactions = unlinkedTransactions.filter(transaction => {
      return transaction.type === 'investment' && transaction.investment_direction === 'outgoing'
    })

    const virtualItems = []

    // Helper function to create virtual item
    const createVirtualItem = (transactions, type, name, category) => {
      if (transactions.length === 0) return null

      const monthlyAmounts = Array(12).fill(0).map((_, monthIndex) => {
        return transactions
          .filter(transaction => {
            const transactionMonth = new Date(transaction.date).getMonth()
            return transactionMonth === monthIndex
          })
          .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0)
      })

      return {
        id: `unlinked-${type}`,
        name,
        category,
        type,
        amounts: monthlyAmounts,
        actual_amounts: monthlyAmounts,
        is_virtual: true,
        is_multi_year: false,
        linked_investment_id: null,
        frequency: 'repeats',
        recurrence_interval: 1,
        start_year: selectedYear.value,
        end_year: selectedYear.value,
        end_type: 'specific_date',
        occurrences: 12,
        custom_months: [],
        recurrence: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: authStore.userId,
        year: selectedYear.value
      }
    }

    // Create virtual items for each type
    const incomeVirtual = createVirtualItem(incomeTransactions, 'income', 'Unlinked Income', 'Unlinked')
    const expenseVirtual = createVirtualItem(expenseTransactions, 'expense', 'Unlinked Expenses', 'Unlinked')
    const investmentIncomingVirtual = createVirtualItem(investmentIncomingTransactions, 'investment', 'Unlinked Investment Incoming', 'Unlinked')
    const investmentOutgoingVirtual = createVirtualItem(investmentOutgoingTransactions, 'investment', 'Unlinked Investment Outgoing', 'Unlinked')

    // Add virtual items to the array
    if (incomeVirtual) virtualItems.push(incomeVirtual)
    if (expenseVirtual) virtualItems.push(expenseVirtual)
    if (investmentIncomingVirtual) {
      investmentIncomingVirtual.investment_direction = 'incoming'
      virtualItems.push(investmentIncomingVirtual)
    }
    if (investmentOutgoingVirtual) {
      investmentOutgoingVirtual.investment_direction = 'outgoing'
      virtualItems.push(investmentOutgoingVirtual)
    }



    return [...budgetItems.value, ...virtualItems]
  })

  // Get budget items for selected year
  const fetchBudgetItems = async (year = selectedYear.value) => {
    if (!authStore.isAuthenticated || !authStore.userId) {
      budgetItems.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      const response = await budgetAPI.getBudgetItems(authStore.userId, year)

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
        // Map new frequency fields - use snake_case from baseData
        frequency: budgetData.frequency || 'repeats',
        recurrence_interval: budgetData.recurrence_interval || budgetData.recurrenceInterval || 1,
        start_year: budgetData.start_year || budgetData.startYear || selectedYear.value,
        end_year: budgetData.end_year || budgetData.endYear || selectedYear.value,
        end_type: budgetData.end_type || budgetData.endType || 'specific_date',
        occurrences: budgetData.occurrences || 12,
        one_time_year: budgetData.one_time_year || budgetData.oneTimeYear,
        custom_months: budgetData.custom_months || budgetData.customMonths || [],
        // Legacy recurrence field (required by database schema)
        recurrence: budgetData.recurrence || 'monthly',
        // New frequency system fields
        start_month: budgetData.start_month || budgetData.startMonth || 0,
        end_month: budgetData.end_month || budgetData.endMonth || 11
      }

      const data = await budgetAPI.createBudgetItem(budgetItemData)

      // Add to local state immediately - no need for general loading state
      // Only add if it belongs to the currently selected year
      if (data.year === selectedYear.value) {
        budgetItems.value.push(data)
      }

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
              // Calculate based on interval and year
              let monthOffset
              if (isFirstYear) {
                // For first year, calculate from start month
                monthOffset = month - start_month
              } else {
                // For subsequent years, calculate from the beginning of the year
                monthOffset = month + (12 - start_month) + ((year - start_year - 1) * 12)
              }

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
          year,
          default_amount: budgetData.default_amount, // Keep original default amount
          amounts: monthlyAmounts, // Set the calculated monthly amounts
          schedule, // Set the calculated schedule
          is_multi_year: true,
          linked_group_id: linkedGroupId,
          is_master: isMaster,
          start_year,
          end_year,
          end_month,
          // New frequency fields
          frequency: frequency || 'repeats',
          recurrence_interval: recurrenceInterval || 1,
          end_type: endType || 'specific_date',
          occurrences: occurrences || 12,
          custom_months: customMonths || []
        }

        try {
          const data = await budgetAPI.createBudgetItem(yearBudgetData)
          createdItems.push(data)
        } catch (createError) {
          console.error(`Store: Failed to create budget item for year ${year}:`, createError)
          throw createError
        }
      }

      // Add only current year items to local state
      const currentYearItems = createdItems.filter(item => item.year === selectedYear.value)
      budgetItems.value.push(...currentYearItems)

      // Refresh budget items to ensure proper filtering
      await fetchBudgetItems(selectedYear.value)

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

        // Delete all existing linked items
        for (const item of linkedItems) {
          await budgetAPI.deleteBudgetItem(item.id)
        }

        // Create new multi-year budget items with the updated structure
        const newBudgetData = {
          ...updates,
          user_id: authStore.userId,
          default_amount
        }

        const createdItems = await addMultiYearBudgetItem(newBudgetData)

        if (createdItems) {
          return true
        } else {
          console.error('Store: Failed to recreate multi-year budget items')
          return false
        }
      } else {

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
                // Calculate based on interval and year
                let monthOffset
                if (isFirstYear) {
                  // For first year, calculate from start month
                  monthOffset = month - start_month
                } else {
                  // For subsequent years, calculate from the beginning of the year
                  monthOffset = month + (12 - start_month) + ((year - start_year - 1) * 12)
                }

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
            start_year,
            end_year,
            end_month,
            amounts: monthlyAmounts,
            schedule,
            // New frequency fields
            frequency,
            recurrence_interval,
            end_type,
            occurrences,
            one_time_year,
            custom_months: customMonths
          }

          if (updates.investment_direction) {
            yearUpdateData.investment_direction = updates.investment_direction
          }

          try {
            // Update this specific year's item
            const result = await budgetAPI.updateBudgetItem(item.id, yearUpdateData)
          } catch (updateError) {
            console.error(`Store: Failed to update budget item for year ${year}:`, updateError)
            throw updateError
          }
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

  // NEW: Unified method that accepts pre-calculated schedule data for multi-year budgets
  const addMultiYearBudgetFromSchedule = async (budgetDataArray, formData) => {
    if (!authStore?.isAuthenticated || !authStore?.userId) {
      throw new Error('User not authenticated')
    }

    const linkedGroupId = crypto.randomUUID()
    const createdItems = []

    try {
      addLoading.value = true
      error.value = null

      for (let i = 0; i < budgetDataArray.length; i++) {
        const yearBudgetData = budgetDataArray[i]
        const isMaster = i === 0

        // Use pre-calculated data from the modal (no recalculation needed)
        const finalBudgetData = {
          ...yearBudgetData,
          user_id: authStore.userId,
          linked_group_id: linkedGroupId,
          is_master: isMaster,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const data = await budgetAPI.createBudgetItem(finalBudgetData)

        if (!data) {
          console.error(`API returned null or undefined data for year ${yearBudgetData.year}`)
          throw new Error(`Failed to create budget item for year ${yearBudgetData.year}: No data returned from API`)
        }

        createdItems.push(data)
      }

      // Add only current year items to the store
      const currentYearItems = createdItems.filter(item => item.year === selectedYear.value)
      budgetItems.value.push(...currentYearItems)

      // Sort budget items
      sortBudgetItems()

      // Refresh budget items to ensure proper filtering
      await fetchBudgetItems(selectedYear.value)

      return createdItems

    } catch (err) {
      error.value = err.message
      console.error('Error in addMultiYearBudgetFromSchedule:', err)

      throw err
    } finally {
      addLoading.value = false
    }
  }

  // NEW: Unified method for single-year budgets that accepts pre-calculated data
  const addBudgetItemFromSchedule = async (budgetData) => {
    if (!authStore?.isAuthenticated || !authStore?.userId) {
      throw new Error('User not authenticated')
    }

    try {
      addLoading.value = true
      error.value = null

      // Use pre-calculated data from the modal (no recalculation needed)
      const finalBudgetData = {
        ...budgetData,
        user_id: authStore.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const data = await budgetAPI.createBudgetItem(finalBudgetData)

      if (!data) {
        console.error('API returned null or undefined data')
        throw new Error('Failed to create budget item: No data returned from API')
      }

      // Add to store only if it belongs to the currently selected year
      if (data.year === selectedYear.value) {
        budgetItems.value.push(data)
        sortBudgetItems()
      }

      return data

    } catch (err) {
      error.value = err.message
      console.error('Error in addBudgetItemFromSchedule:', err)

      throw err
    } finally {
      addLoading.value = false
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

      // Get budget name before deletion for toast message
      const budgetToDelete = budgetItems.value.find(item => item.id === id)
      const budgetName = budgetToDelete?.name || 'Budget item'

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

    if (!authStore.isAuthenticated || !authStore.userId) {
      return []
    }

    // Always fetch data for the specified year to ensure we have the latest
    await fetchBudgetItems(year)

    // Filter budget items for the specified year
    const yearItems = budgetItems.value.filter(item => item.year === year)

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

  // Sort budget items by creation date
  const sortBudgetItems = () => {
    budgetItems.value.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateA - dateB
    })
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
    budgetItemsWithUnlinked,

    // Savings calculations
    calculateMonthlySavings,
    calculateCumulativeSavings,
    currentMonthData,
    monthlyData,
    currentSavingsRate,
    zakatDue,
    familyBudgets,
    totalFamilyExpenses,
    totalInvestments,
    projections,

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
    updateMultiYearBudgetItems,
    // New unified methods
    addMultiYearBudgetFromSchedule,
    addBudgetItemFromSchedule,
    sortBudgetItems
  }
})