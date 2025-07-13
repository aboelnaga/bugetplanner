<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Budget Planner</h1>
      </div>
      <div class="flex space-x-3">
        <button @click="openAddBudgetModal" class="btn-primary">Add Budget Item</button>
        <button @click="showHistoryModal = true" class="btn-secondary">View History</button>
      </div>
    </div>

    <!-- Compact Control Panel -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        
        <!-- Left: Year & Actions -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <Calendar class="w-4 h-4 text-blue-600" />
            <span class="text-sm font-medium text-gray-700">Year:</span>
            <select v-model="selectedYear" class="border border-gray-300 rounded-md px-3 py-1 text-sm font-semibold text-blue-600 bg-white hover:border-gray-400 focus:border-blue-500">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <button @click="addNewYear" 
                    title="Add a new year to plan"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Year
            </button>
            
            <button v-if="budgetItems.length === 0 && canCopyFromPreviousYear" 
                    @click="copyFromPreviousYear" 
                    title="Copy budget items from previous year"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors">
              <Copy class="w-3 h-3 mr-1" />
              Copy {{ selectedYear - 1 }}
            </button>
          </div>
        </div>
        
        <!-- Center: Filters -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <Settings class="w-4 h-4 text-gray-500" />
            <select v-model="selectedTypeFilter" class="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white hover:border-gray-400 focus:border-blue-500">
              <option value="all">All Types</option>
              <option value="income">💰 Income</option>
              <option value="expense">💸 Expenses</option>
              <option value="investment">📈 Investments</option>
            </select>
          </div>
          
          <select v-model="selectedCategoryFilter" class="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white hover:border-gray-400 focus:border-blue-500">
            <option value="all">All Categories</option>
            <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        
        <!-- Right: View & Stats -->
        <div class="flex items-center space-x-4">
          <!-- Quick Stats -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              <span class="text-green-600 font-semibold">{{ (budgetItems || []).filter(b => b && b.type === 'income').length }} income</span>
              <span class="mx-2">•</span>
              <span class="text-red-600 font-semibold">{{ (budgetItems || []).filter(b => b && b.type === 'expense').length }} expenses</span>
              <span class="mx-2">•</span>
              <span class="text-purple-600 font-semibold">
                {{ (budgetItems || []).filter(b => b && b.type === 'investment').length }} investment
              </span>
              <span class="text-blue-600 font-semibold">{{ (budgetItems || []).filter(b => b).length }}</span>
            </span>
            
            <!-- View Toggle -->
            <div class="flex items-center bg-gray-100 rounded-md p-0.5">
              <button @click="groupByCategory = false" :class="[
                'px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                !groupByCategory ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              ]">
                List
              </button>
              <button @click="groupByCategory = true" :class="[
                'px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                groupByCategory ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              ]">
                Grouped
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Active Filters Row (only show when filters are active) -->
      <div v-if="selectedTypeFilter !== 'all' || selectedCategoryFilter !== 'all'" class="mt-3 pt-3 border-t border-gray-200">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-medium text-gray-500">Filters:</span>
          <span v-if="selectedTypeFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ selectedTypeFilter === 'income' ? '💰' : selectedTypeFilter === 'expense' ? '💸' : '📈' }}
            <button @click="selectedTypeFilter = 'all'" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <span v-if="selectedCategoryFilter !== 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {{ selectedCategoryFilter }}
            <button @click="selectedCategoryFilter = 'all'" class="ml-1 text-green-600 hover:text-green-800">×</button>
          </span>
          <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-gray-700 underline">Clear all</button>
        </div>
      </div>
    </div>

    <!-- Budget Table -->
    <BudgetTable
      :loading="budgetStore.loading"
      :error="budgetStore.error"
      :budget-items="budgetItems"
      :selected-category-filter="selectedCategoryFilter"
      :can-copy-from-previous-year="canCopyFromPreviousYear"
      :filtered-budget-items="filteredBudgetItems"
      :grouped-budget-items="groupedBudgetItems"
      :months="months"
      :selected-year="selectedYear"
      :current-year="budgetStore.currentYear"
      :current-month="currentMonth"
      :group-by-category="groupByCategory"
      :selected-type-filter="selectedTypeFilter"
      :has-income-data="hasIncomeData"
      :has-expense-data="hasExpenseData"
      :has-investment-data="hasInvestmentData"
      :has-investment-incoming-data="hasInvestmentIncomingData"
      :has-investment-outgoing-data="hasInvestmentOutgoingData"
      :has-any-data="hasAnyData"
      :calculate-yearly-total="calculateYearlyTotal"
      :calculate-monthly-total="calculateMonthlyTotal"
      :calculate-monthly-income="calculateMonthlyIncome"
      :calculate-monthly-expenses="calculateMonthlyExpenses"
      :calculate-monthly-investment-incoming="calculateMonthlyInvestmentIncoming"
      :calculate-monthly-investment-outgoing="calculateMonthlyInvestmentOutgoing"
      :calculate-monthly-investment-net="calculateMonthlyInvestmentNet"
      :calculate-grand-total="calculateGrandTotal"
      :calculate-grand-total-income="calculateGrandTotalIncome"
      :calculate-grand-total-expenses="calculateGrandTotalExpenses"
      :calculate-grand-total-investment-incoming="calculateGrandTotalInvestmentIncoming"
      :calculate-grand-total-investment-outgoing="calculateGrandTotalInvestmentOutgoing"
      :calculate-grand-total-investment-net="calculateGrandTotalInvestmentNet"
      :get-category-type="getCategoryType"
      :calculate-category-total="calculateCategoryTotal"
      :calculate-category-monthly-total="calculateCategoryMonthlyTotal"
      :is-scheduled-month="isScheduledMonth"
      :get-budget-amount="getBudgetAmount"
      :has-changes="hasChanges"
      :format-currency="formatCurrency"
      @retry="budgetStore.fetchBudgetItems()"
      @add-first-budget="openAddBudgetModal"
      @copy-from-previous-year="copyFromPreviousYear"
      @clear-filters="clearAllFilters"
      @add-budget="openAddBudgetModal"
      @edit-budget="editBudget"
      @duplicate-budget="duplicateBudget"
      @delete-budget="deleteBudget" />

    <!-- Add Budget Modal -->
    <AddBudgetModal 
      v-model="showAddBudgetModal"
      :selected-year="selectedYear"
      @budget-added="handleBudgetAdded" />

    <!-- Edit Budget Modal -->
    <EditBudgetModal 
      v-model="showEditBudgetModal"
      :budget="editingBudget"
      :selected-year="selectedYear"
      @budget-updated="handleBudgetUpdated" />

    <!-- History Modal -->
    <HistoryModal v-model="showHistoryModal" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { Edit, Copy, Trash2, DollarSign, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownLeft, Calendar, Clock, Repeat, Settings } from 'lucide-vue-next'
  import { useBudgetStore } from '@/stores/budget.js'
  import { useAuthStore } from '@/stores/auth.js'
  import AddBudgetModal from '@/components/AddBudgetModal.vue'
  import EditBudgetModal from '@/components/EditBudgetModal.vue'
  import HistoryModal from '@/components/HistoryModal.vue'
  import BudgetTable from '@/components/BudgetTable.vue'

  // Stores
  const budgetStore = useBudgetStore()
  const authStore = useAuthStore()

  // Local state
  const showAddBudgetModal = ref(false)
  const showEditBudgetModal = ref(false)
  const showHistoryModal = ref(false)
  const editingBudget = ref(null)
  const selectedTypeFilter = ref('all')
  const selectedCategoryFilter = ref('all')
  const groupByCategory = ref(false)



  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  // Available years (computed from store)
  const availableYears = computed(() => {
    const currentYear = budgetStore.currentYear
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3]
  })

  // Budget items from store
  const budgetItems = computed(() => budgetStore.budgetItems || [])

  // Selected year (from store)
  const selectedYear = computed({
    get: () => budgetStore.selectedYear,
    set: (value) => {
      budgetStore.selectedYear = value
      budgetStore.fetchBudgetItems(value)
    }
  })

  // Check if data is ready
  const isDataReady = computed(() => {
    return !budgetStore.loading && !budgetStore.error && budgetItems.value !== null
  })



  const currentMonth = computed(() => budgetStore.currentMonth)



  // Available months for start month (depends on selected year)
  const availableStartMonths = computed(() => {
    if (selectedYear.value > budgetStore.currentYear) {
      // Future year: all months are available
      return months
    } else if (selectedYear.value === budgetStore.currentYear) {
      // Current year: only current month and future months
      return months.slice(currentMonth.value)
    } else {
      // Past year: all months available for historical data entry
      return months
    }
  })

  // Available start month indices (for dropdown values)
  const availableStartMonthIndices = computed(() => {
    if (selectedYear.value > budgetStore.currentYear) {
      // Future year: all month indices (0-11)
      return Array.from({ length: 12 }, (_, i) => i)
    } else if (selectedYear.value === budgetStore.currentYear) {
      // Current year: only current month and future month indices
      return Array.from({ length: 12 - currentMonth.value }, (_, i) => currentMonth.value + i)
    } else {
      // Past year: all month indices (0-11)
      return Array.from({ length: 12 }, (_, i) => i)
    }
  })

  // Get month label based on selected year and current date
  const getMonthLabel = (monthIndex) => {
    if (selectedYear.value === budgetStore.currentYear) {
      if (monthIndex === currentMonth.value) return '(Current)'
      if (monthIndex === currentMonth.value + 1) return '(Next)'
    } else if (selectedYear.value > budgetStore.currentYear) {
      if (monthIndex === 0) return '(Jan of future year)'
    } else {
      return '(Past year)'
    }
    return ''
  }





  // Open add budget modal with validation
  const openAddBudgetModal = () => {
    showAddBudgetModal.value = true
  }

  const handleBudgetAdded = (budgetItem) => {
    // Budget was successfully added, no additional action needed
    // The store will automatically update the budget items list
    console.log('Budget item added successfully:', budgetItem)
  }

  const handleBudgetUpdated = (budgetItem) => {
    // Budget was successfully updated, no additional action needed
    // The store will automatically update the budget items list
    console.log('Budget item updated successfully:', budgetItem)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount || 0))
  }





  const isScheduledMonth = (budget, monthIndex) => {
    if (!budget || !budget.schedule) return false
    return budget.schedule.includes(monthIndex) || false
  }

  const getBudgetAmount = (budget, monthIndex) => {
    if (!budget || !budget.amounts || !Array.isArray(budget.amounts)) return 0
    return parseFloat(budget.amounts[monthIndex]) || 0
  }

  const hasChanges = (budgetId, monthIndex) => {
    if (!budgetId) return false
    // Check if this month/budget combination has been modified
    return budgetStore.budgetHistory?.some(change => 
      change.budgetId === budgetId && 
      change.monthIndex === monthIndex
    ) || false
  }

  const calculateYearlyTotal = (budget) => {
    if (!budget || !budget.amounts) return 0
    const total = budget.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    return budget.type === 'income' ? total : total
  }

  const calculateMonthlyTotal = (monthIndex) => {
    const income = filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'income') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === 'investment' && budget.investment_direction === 'incoming') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
    
    const expenses = filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'expense') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      if (budget.type === 'investment' && budget.investment_direction === 'outgoing') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
    
    return income - expenses
  }

  const calculateMonthlyIncome = (monthIndex) => {
    return filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'income') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyExpenses = (monthIndex) => {
    return filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'expense') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentIncoming = (monthIndex) => {
    return filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'investment' && budget.investment_direction === 'incoming') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentOutgoing = (monthIndex) => {
    return filteredBudgetItems.value.reduce((sum, budget) => {
      if (budget.type === 'investment' && budget.investment_direction === 'outgoing') {
        return sum + (parseFloat(budget.amounts[monthIndex]) || 0)
      }
      return sum
    }, 0)
  }

  const calculateMonthlyInvestmentNet = (monthIndex) => {
    return calculateMonthlyInvestmentIncoming(monthIndex) - calculateMonthlyInvestmentOutgoing(monthIndex)
  }

  const calculateGrandTotal = () => {
    return calculateGrandTotalIncome() + calculateGrandTotalInvestmentIncoming() - calculateGrandTotalExpenses() - calculateGrandTotalInvestmentOutgoing()
  }

  const calculateGrandTotalIncome = () => {
    return filteredBudgetItems.value.reduce((total, budget) => {
      if (budget.type === 'income') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalExpenses = () => {
    return filteredBudgetItems.value.reduce((total, budget) => {
      if (budget.type === 'expense') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentIncoming = () => {
    return filteredBudgetItems.value.reduce((total, budget) => {
      if (budget.type === 'investment' && budget.investment_direction === 'incoming') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentOutgoing = () => {
    return filteredBudgetItems.value.reduce((total, budget) => {
      if (budget.type === 'investment' && budget.investment_direction === 'outgoing') {
        return total + calculateYearlyTotal(budget)
      }
      return total
    }, 0)
  }

  const calculateGrandTotalInvestmentNet = () => {
    return calculateGrandTotalInvestmentIncoming() - calculateGrandTotalInvestmentOutgoing()
  }



  const updateBudgetAmount = async (budgetId, monthIndex, newValue) => {
    const budget = budgetItems.value.find(b => b.id === budgetId)
    if (!budget) return
    
    const oldValue = budget.amounts[monthIndex]
    const numericOldValue = parseFloat(oldValue) || 0
    const numericNewValue = parseFloat(newValue) || 0
    
    // Only proceed if the values are actually different
    if (numericOldValue !== numericNewValue) {
      // Update via store
      await budgetStore.updateMonthlyAmount(budgetId, monthIndex, numericNewValue)
    }
  }

  const editBudget = (budget) => {
    // Set the budget to edit - the modal component will handle form initialization
    editingBudget.value = budget
    showEditBudgetModal.value = true
  }







  const duplicateBudget = async (budget) => {
    // Create a copy of the budget item
    const budgetData = {
      name: budget.name + ' (Copy)',
      type: budget.type,
      category: budget.category,
      recurrence: budget.recurrence,
      default_amount: budget.defaultAmount || 0,
      amounts: [...budget.amounts],
      schedule: [...budget.schedule],
      investment_direction: budget.investment_direction,
      start_month: budget.startMonth
    }

    // Add to store
    await budgetStore.addBudgetItem(budgetData)
  }

  const deleteBudget = async (budgetId) => {
    const budget = budgetItems.value.find(item => item.id === budgetId)
    if (!budget) return
    
    // Check if budget has any values for the whole year
    const hasAnyValues = budget.amounts.some(amount => amount > 0)
    
    // If it's a future year, allow full deletion
    if (selectedYear.value > budgetStore.currentYear) {
      if (confirm('Are you sure you want to delete this budget item?')) {
        await budgetStore.deleteBudgetItem(budgetId)
      }
      return
    }
    
    // If no values for the whole year, allow deletion
    if (!hasAnyValues) {
      if (confirm('Are you sure you want to delete this empty budget item?')) {
        await budgetStore.deleteBudgetItem(budgetId)
      }
      return
    }
    
    // If current year and has values, check if there are past values
    if (selectedYear.value === budgetStore.currentYear) {
      const hasPastValues = budget.amounts.slice(0, currentMonth.value).some(amount => amount > 0)
      const hasFutureValues = budget.amounts.slice(currentMonth.value).some(amount => amount > 0)
      
      if (hasPastValues && hasFutureValues) {
        // Has both past and future values - clear only future values
        if (confirm('This budget item has historical data. Clear only the remaining months (current month onwards)?')) {
          for (let i = currentMonth.value; i < 12; i++) {
            if (budget.amounts[i] > 0) {
              await updateBudgetAmount(budgetId, i, 0)
            }
          }
        }
      } else if (hasPastValues && !hasFutureValues) {
        // Has only past values - don't allow deletion
        alert('Cannot delete this budget item as it contains historical data and all future months are already empty.')
      } else if (!hasPastValues && hasFutureValues) {
        // Has only future values - allow full deletion
        if (confirm('Are you sure you want to delete this budget item? (It only contains future planning data)')) {
          await budgetStore.deleteBudgetItem(budgetId)
        }
      }
    } else if (selectedYear.value < budgetStore.currentYear) {
      // Past year with values - don't allow deletion
      alert('Cannot delete budget items from past years that contain data.')
    }
  }

  const addNewYear = () => {
    const newYear = Math.max(...availableYears.value) + 1
    availableYears.value.push(newYear)
    selectedYear.value = newYear
    
    // The store will automatically fetch budget items for the new year
    // when selectedYear changes
  }



  // Category management
  const uniqueCategories = computed(() => {
    const categories = new Set()
    ;(budgetItems.value || []).forEach(item => {
      if (item && item.category) {
        categories.add(item.category)
      }
    })
    return Array.from(categories).sort()
  })

  const filteredBudgetItems = computed(() => {
    return budgetItems.value.filter(item => {
      if (!item) return false
      const typeMatches = selectedTypeFilter.value === 'all' || item.type === selectedTypeFilter.value
      const categoryMatches = selectedCategoryFilter.value === 'all' || item.category === selectedCategoryFilter.value
      return typeMatches && categoryMatches
    })
  })

  const groupedBudgetItems = computed(() => {
    if (!groupByCategory.value) return {}
    
    const grouped = {}
    filteredBudgetItems.value.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    
    // Sort categories alphabetically
    const sortedGrouped = {}
    Object.keys(grouped).sort().forEach(key => {
      sortedGrouped[key] = grouped[key]
    })
    
    return sortedGrouped
  })

  const calculateCategoryTotal = (categoryItems) => {
    return categoryItems.reduce((total, item) => {
      return total + calculateYearlyTotal(item)
    }, 0)
  }

  const calculateCategoryMonthlyTotal = (categoryItems, monthIndex) => {
    return categoryItems.reduce((total, item) => {
      return total + (parseFloat(item.amounts[monthIndex]) || 0)
    }, 0)
  }

  const getCategoryType = (categoryItems) => {
    // Determine the predominant type in the category
    if (categoryItems.length === 0) return 'expense'
    
    const typeCounts = categoryItems.reduce((counts, item) => {
      const key = item.type === 'investment' 
        ? `${item.type}-${item.investment_direction}`
        : item.type
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})
    
    // Return the most common type
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    )
    
    return mostCommonType
  }

  const toggleGroupByCategory = () => {
    groupByCategory.value = !groupByCategory.value
  }

  const clearAllFilters = () => {
    selectedTypeFilter.value = 'all'
    selectedCategoryFilter.value = 'all'
  }

  // Year management
  const canCopyFromPreviousYear = computed(() => {
    const previousYear = selectedYear.value - 1
    // For now, return false since we don't have the old budgetData structure
    // This will be updated when we implement the copy functionality with Supabase
    return false
  })

  // Computed properties to check if there's data for each type
  const hasIncomeData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === 'income')
  })

  const hasExpenseData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === 'expense')
  })

  const hasInvestmentIncomingData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === 'investment' && item.investment_direction === 'incoming')
  })

  const hasInvestmentOutgoingData = computed(() => {
    return filteredBudgetItems.value.some(item => item.type === 'investment' && item.investment_direction === 'outgoing')
  })

  const hasInvestmentData = computed(() => {
    return hasInvestmentIncomingData.value || hasInvestmentOutgoingData.value
  })

  const hasAnyData = computed(() => {
    return hasIncomeData.value || hasExpenseData.value || hasInvestmentData.value
  })

  const copyFromPreviousYear = async () => {
    const previousYear = selectedYear.value - 1
    
    if (confirm(`Copy all budget items from ${previousYear} to ${selectedYear.value}?`)) {
      const result = await budgetStore.copyFromPreviousYear(previousYear, selectedYear.value)
      
      if (!result) {
        alert('Failed to copy budget items. Please try again.')
      }
    }
  }



  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      budgetStore.initialize()
    } else {
      // Clear data when not authenticated
      budgetStore.budgetItems = []
      budgetStore.monthlyAmounts = []
      budgetStore.budgetHistory = []
      budgetStore.error = null
    }
  })

  // Initialize on mount
  onMounted(async () => {
    // Wait for auth to initialize
    if (!authStore.user) {
      await authStore.initAuth()
    }
    
    if (authStore.isAuthenticated) {
      budgetStore.initialize()
    }
  })
</script>

<style scoped>
.sticky {
  position: sticky;
}
</style> 