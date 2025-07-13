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
          <div class="flex items-center space-x-3 text-xs text-gray-600">
            <span class="flex items-center">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              {{ (budgetItems || []).filter(b => b && b.type === 'income').length }}
            </span>
            <span class="flex items-center">
              <div class="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
              {{ (budgetItems || []).filter(b => b && b.type === 'expense').length }}
            </span>
            <span class="flex items-center">
              <div class="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
              {{ (budgetItems || []).filter(b => b && b.type === 'investment').length }}
            </span>
            <span class="text-blue-600 font-semibold">{{ (budgetItems || []).filter(b => b).length }} total</span>
          </div>
          
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

    <!-- Loading State -->
    <div v-if="budgetStore.loading" class="card text-center py-12">
      <div class="text-gray-500 mb-4">
        <div class="text-4xl mb-2">⏳</div>
        <h3 class="text-lg font-medium">Loading budget data...</h3>
        <p class="text-sm mt-2">Please wait while we fetch your budget information.</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="budgetStore.error" class="card text-center py-12">
      <div class="text-red-500 mb-4">
        <div class="text-4xl mb-2">⚠️</div>
        <h3 class="text-lg font-medium">Error loading budget data</h3>
        <p class="text-sm mt-2">{{ budgetStore.error }}</p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="budgetStore.fetchBudgetItems()" class="btn-primary">Retry</button>
      </div>
    </div>

    <!-- Empty State for No Budget Items -->
    <div v-else-if="budgetItems.length === 0" class="card text-center py-12">
      <div class="text-gray-500 mb-4">
        <div class="text-4xl mb-2">📊</div>
        <h3 class="text-lg font-medium">No budget items for {{ selectedYear }}</h3>
        <p class="text-sm mt-2">Start by adding your first budget item or copy from a previous year.</p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="openAddBudgetModal" class="btn-primary">Add First Budget Item</button>
        <button v-if="canCopyFromPreviousYear" 
                @click="copyFromPreviousYear" 
                class="btn-secondary">
          📋 Copy from {{ selectedYear - 1 }}
        </button>
      </div>
    </div>

    <!-- Empty State for No Filtered Results -->
    <div v-else-if="filteredBudgetItems.length === 0" class="card text-center py-12">
      <div class="text-gray-500 mb-4">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No budget items found</h3>
        <p class="text-sm text-gray-500 mb-4">
          <span v-if="selectedTypeFilter !== 'all'">
            No {{ selectedTypeFilter === 'income' ? 'income' : selectedTypeFilter === 'expense' ? 'expense' : 'investment' }} items 
          </span>
          <span v-if="selectedCategoryFilter !== 'all'">
            <span v-if="selectedTypeFilter !== 'all'">in</span>
            in the "{{ selectedCategoryFilter }}" category
          </span>
          <span v-if="selectedTypeFilter === 'all' && selectedCategoryFilter === 'all'">
            No budget items
          </span>
          for {{ selectedYear }}
        </p>
        <div class="flex justify-center space-x-3">
          <button @click="clearAllFilters" class="text-sm text-blue-600 hover:text-blue-800 underline">
            Clear filters
          </button>
          <button 
            @click="openAddBudgetModal" 
            :disabled="budgetStore.loading"
            class="text-sm text-green-600 hover:text-green-800 underline disabled:text-gray-400 disabled:cursor-not-allowed">
            Add budget item
          </button>
        </div>
      </div>
    </div>

    <!-- Budget Table -->
    <div v-else class="card overflow-hidden max-h-[calc(100vh-3rem-100px)]">
      <div class="overflow-auto max-h-[calc(100vh-6rem-100px)]">
        <table class="min-w-full">
          <thead class="bg-gray-50 sticky top-0 z-30">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-40">
                Budget Item
              </th>
              <th v-for="(month, index) in months" :key="month" 
                  :class="[
                    'px-4 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-32 bg-gray-50',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 
                      'bg-blue-200 text-blue-900 font-bold' : 'text-gray-500'
                  ]">
                {{ month }}
                <span v-if="selectedYear === budgetStore.currentYear && index === currentMonth" class="block text-xs font-normal mt-1">
                  (Current)
                </span>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Total
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky right-0 z-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Regular table view -->
            <template v-if="!groupByCategory">
              <tr v-for="budget in filteredBudgetItems" :key="budget.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  <div>
                    <div class="flex items-center">
                      <div class="font-semibold">{{ budget.name }}</div>
                      <span :class="[
                        'ml-2 px-2 py-1 text-xs rounded-full flex items-center',
                        budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        <TrendingUp v-if="budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming')" class="w-3 h-3 mr-1" />
                        <TrendingDown v-else class="w-3 h-3 mr-1" />
                        {{ budget.type === 'income' ? 'Income' : 
                           budget.type === 'investment' ? 'Investment' : 'Expense' }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">{{ budget.category }}</div>
                    <div class="text-xs text-blue-600 flex items-center">
                      <Repeat class="w-3 h-3 mr-1" />
                      {{ budget.recurrence }}
                    </div>
                                           <div v-if="budget.startMonth && budget.startMonth > 0 && budget.startMonth < months.length" class="text-xs text-orange-600 flex items-center">
                         <Calendar class="w-3 h-3 mr-1" />
                         Starts: {{ months[budget.startMonth] }}
                       </div>
                  </div>
                </td>
                <td v-for="(month, index) in months" :key="month" 
                    :class="[
                      'px-2 py-4 text-center',
                      selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-100' : ''
                    ]">
                  <div class="relative">
                    <div :class="[
                      'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center',
                      selectedYear === budgetStore.currentYear && index < currentMonth ? 
                        'bg-gray-100 text-gray-400' :
                        selectedYear === budgetStore.currentYear && index === currentMonth ? 
                          'bg-blue-50 border border-blue-200 shadow-sm' :
                          isScheduledMonth(budget, index) ? 
                            (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-50' : 'bg-red-50') 
                            : 'bg-gray-50',
                      getBudgetAmount(budget, index) > 0 ? 
                        (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'font-semibold text-green-700' : 'font-semibold text-red-700') 
                        : 'text-gray-400'
                    ]">
                      <span v-if="getBudgetAmount(budget, index) > 0">
                        {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(getBudgetAmount(budget, index)) }}
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </div>
                    <div v-if="hasChanges(budget.id, index)" 
                         title="This amount has been manually modified"
                         class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>
                  </div>
                </td>
                <td :class="[
                  'px-4 py-4 text-center font-semibold',
                  calculateYearlyTotal(budget) > 0 ? 
                    (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'text-green-700' : 'text-red-700') 
                    : 'text-gray-400'
                ]">
                  <span v-if="calculateYearlyTotal(budget) > 0">
                    {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(calculateYearlyTotal(budget)) }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td class="px-4 py-4 text-center sticky right-0 bg-white z-10">
                  <div class="flex justify-center space-x-1">
                    <button @click="editBudget(budget)" 
                            title="Edit budget settings"
                            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                      <Edit class="w-5 h-5" />
                    </button>
                    <button @click="duplicateBudget(budget)" 
                            title="Duplicate this budget item"
                            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                      <Copy class="w-5 h-5" />
                    </button>
                    <button @click="deleteBudget(budget.id)" 
                            title="Delete budget item"
                            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Grouped table view -->
            <template v-else>
              <template v-for="(group, categoryName) in groupedBudgetItems" :key="categoryName">
                <!-- Category Header -->
                <tr class="bg-gray-200">
                  <td class="px-6 py-3 text-sm font-bold text-gray-800 sticky left-0 bg-gray-200 z-10">
                    <div>
                      <div>{{ categoryName }} ({{ group.length }} items)</div>
                      <div :class="[
                        'text-xs font-normal',
                        getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700'
                      ]">
                        <span v-if="calculateCategoryTotal(group) > 0">
                          {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryTotal(group)) }} total
                        </span>
                        <span v-else class="text-gray-400">— total</span>
                      </div>
                    </div>
                  </td>
                  <td v-for="(month, index) in months" :key="`header-${categoryName}-${month}`" 
                      :class="[
                        'px-4 py-3 bg-gray-200 text-center font-semibold',
                        selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-100' : '',
                        calculateCategoryMonthlyTotal(group, index) > 0 ? 
                          (getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700') 
                          : 'text-gray-400'
                      ]">
                    <span v-if="calculateCategoryMonthlyTotal(group, index) > 0">
                      {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryMonthlyTotal(group, index)) }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td :class="[
                    'px-4 py-3 bg-gray-200 text-center font-bold',
                    calculateCategoryTotal(group) > 0 ? 
                      (getCategoryType(group) === 'income' || getCategoryType(group) === 'investment-incoming' ? 'text-green-700' : 'text-red-700') 
                      : 'text-gray-400'
                  ]">
                    <span v-if="calculateCategoryTotal(group) > 0">
                      {{ (getCategoryType(group) === 'expense' || getCategoryType(group) === 'investment-outgoing') ? '-' : '' }}{{ formatCurrency(calculateCategoryTotal(group)) }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-4 py-3 bg-gray-200 sticky right-0 z-10"></td>
                </tr>
                                 <!-- Category Items -->
                 <tr v-for="budget in group" :key="budget.id" class="hover:bg-gray-50">
                   <td class="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                     <div>
                       <div class="flex items-center">
                         <div class="font-semibold">{{ budget.name }}</div>
                         <span :class="[
                        'ml-2 px-2 py-1 text-xs rounded-full flex items-center',
                        budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        <TrendingUp v-if="budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming')" class="w-3 h-3 mr-1" />
                        <TrendingDown v-else class="w-3 h-3 mr-1" />
                        {{ budget.type === 'income' ? 'Income' : 
                           budget.type === 'investment' ? 'Investment' : 'Expense' }}
                      </span>
                       </div>
                       <div class="text-xs text-gray-500">{{ budget.category }}</div>
                       <div class="text-xs text-blue-600 flex items-center">
                         <Repeat class="w-3 h-3 mr-1" />
                         {{ budget.recurrence }}
                       </div>
                       <div v-if="budget.startMonth && budget.startMonth > 0 && budget.startMonth < months.length" class="text-xs text-orange-600 flex items-center">
                         <Calendar class="w-3 h-3 mr-1" />
                         Starts: {{ months[budget.startMonth] }}
                       </div>
                     </div>
                   </td>
                   <td v-for="(month, index) in months" :key="month" 
                       :class="[
                         'px-2 py-4 text-center',
                         selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-100' : ''
                       ]">
                     <div class="relative">
                       <div :class="[
                         'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center',
                         selectedYear === budgetStore.currentYear && index < currentMonth ? 
                           'bg-gray-100 text-gray-400' :
                           selectedYear === budgetStore.currentYear && index === currentMonth ? 
                             'bg-blue-50 border border-blue-200 shadow-sm' :
                                                          isScheduledMonth(budget, index) ? 
                               (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-50' : 'bg-red-50') 
                               : 'bg-gray-50',
                           getBudgetAmount(budget, index) > 0 ? 
                             (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'font-semibold text-green-700' : 'font-semibold text-red-700') 
                             : 'text-gray-400'
                       ]">
                         <span v-if="getBudgetAmount(budget, index) > 0">
                           {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(getBudgetAmount(budget, index)) }}
                         </span>
                         <span v-else class="text-gray-400">—</span>
                       </div>
                       <div v-if="hasChanges(budget.id, index)" 
                            title="This amount has been manually modified"
                            class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>
                     </div>
                   </td>
                   <td :class="[
                     'px-4 py-4 text-center font-semibold',
                     calculateYearlyTotal(budget) > 0 ? 
                       (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'text-green-700' : 'text-red-700') 
                       : 'text-gray-400'
                   ]">
                     <span v-if="calculateYearlyTotal(budget) > 0">
                       {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(calculateYearlyTotal(budget)) }}
                     </span>
                     <span v-else>—</span>
                   </td>
                   <td class="px-4 py-4 text-center sticky right-0 bg-white z-10">
                     <div class="flex justify-center space-x-1">
                       <button @click="editBudget(budget)" 
                               title="Edit budget settings"
                               class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                         <Edit class="w-5 h-5" />
                       </button>
                       <button @click="duplicateBudget(budget)" 
                               title="Duplicate this budget item"
                               class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                         <Copy class="w-5 h-5" />
                       </button>
                       <button @click="deleteBudget(budget.id)" 
                               title="Delete budget item"
                               class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                         <Trash2 class="w-5 h-5" />
                       </button>
                     </div>
                   </td>
                 </tr>
               </template>
             </template>

            <!-- Income Line -->
            <tr v-if="hasIncomeData" class="bg-green-50">
              <td class="px-6 py-3 text-sm font-semibold text-green-700 sticky left-0 bg-green-50 z-10">
                <div class="flex items-center">
                  <span class="text-lg font-bold text-green-600 mr-2">+</span>
                  Total Income
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`eq-income-${month}`" 
                  :class="[
                    'px-2 py-3 text-center',
                    calculateMonthlyIncome(index) > 0 ? 'text-green-700 bg-green-50' : 'text-gray-400',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyIncome(index) > 0">
                  {{ formatCurrency(calculateMonthlyIncome(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-3 text-right text-sm font-bold',
                calculateGrandTotalIncome() > 0 ? 'text-green-700' : 'text-gray-400'
              ]">
                <span v-if="calculateGrandTotalIncome() > 0">
                  {{ formatCurrency(calculateGrandTotalIncome()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3 sticky right-0 bg-green-50 z-10"></td>
            </tr>

            <!-- Investment Returns Line -->
            <tr v-if="hasInvestmentIncomingData" class="bg-green-50">
              <td class="px-6 py-3 text-sm font-semibold text-green-700 sticky left-0 bg-green-50 z-10">
                <div class="flex items-center">
                  <span class="text-lg font-bold text-green-600 mr-2">+</span>
                  Investment Returns
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`eq-inv-in-${month}`" 
                  :class="[
                    'px-2 py-3 text-center',
                    calculateMonthlyInvestmentIncoming(index) > 0 ? 'text-green-700 bg-green-50' : 'text-gray-400',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyInvestmentIncoming(index) > 0">
                  {{ formatCurrency(calculateMonthlyInvestmentIncoming(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-3 text-right text-sm font-bold',
                calculateGrandTotalInvestmentIncoming() > 0 ? 'text-green-700' : 'text-gray-400'
              ]">
                <span v-if="calculateGrandTotalInvestmentIncoming() > 0">
                  {{ formatCurrency(calculateGrandTotalInvestmentIncoming()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3 sticky right-0 bg-green-50 z-10"></td>
            </tr>

            <!-- Expenses Line -->
            <tr v-if="hasExpenseData" class="bg-red-50">
              <td class="px-6 py-3 text-sm font-semibold text-red-700 sticky left-0 bg-red-50 z-10">
                <div class="flex items-center">
                  <span class="text-lg font-bold text-red-600 mr-2">−</span>
                  Total Expenses
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`eq-expense-${month}`" 
                  :class="[
                    'px-2 py-3 text-center',
                    calculateMonthlyExpenses(index) > 0 ? 'text-red-700 bg-red-50' : 'text-gray-400',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyExpenses(index) > 0">
                  {{ formatCurrency(calculateMonthlyExpenses(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-3 text-right text-sm font-bold',
                calculateGrandTotalExpenses() > 0 ? 'text-red-700' : 'text-gray-400'
              ]">
                <span v-if="calculateGrandTotalExpenses() > 0">
                  {{ formatCurrency(calculateGrandTotalExpenses()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3 sticky right-0 bg-red-50 z-10"></td>
            </tr>

            <!-- Investment Purchases Line -->
            <tr v-if="hasInvestmentOutgoingData" class="bg-red-50">
              <td class="px-6 py-3 text-sm font-semibold text-red-700 sticky left-0 bg-red-50 z-10">
                <div class="flex items-center">
                  <span class="text-lg font-bold text-red-600 mr-2">−</span>
                  Investment Purchases
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`eq-inv-out-${month}`" 
                  :class="[
                    'px-2 py-3 text-center',
                    calculateMonthlyInvestmentOutgoing(index) > 0 ? 'text-red-700 bg-red-50' : 'text-gray-400',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyInvestmentOutgoing(index) > 0">
                  {{ formatCurrency(calculateMonthlyInvestmentOutgoing(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-3 text-right text-sm font-bold',
                calculateGrandTotalInvestmentOutgoing() > 0 ? 'text-red-700' : 'text-gray-400'
              ]">
                <span v-if="calculateGrandTotalInvestmentOutgoing() > 0">
                  {{ formatCurrency(calculateGrandTotalInvestmentOutgoing()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3 sticky right-0 bg-red-50 z-10"></td>
            </tr>

            <!-- Divider Line -->
            <tr v-if="selectedTypeFilter === 'all' && hasAnyData" class="bg-gray-100">
              <td class="p-0 border-t-2 border-gray-400"></td>
              <td v-for="(month, index) in months" :key="`divider-${month}`" class="p-0 border-t-2 border-gray-400"></td>
              <td class="p-0 border-t-2 border-gray-400"></td>
              <td class="p-0"></td>
            </tr>

            <!-- Net Balance Line -->
            <tr v-if="selectedTypeFilter === 'all' && hasAnyData" class="bg-blue-50 font-bold">
              <td class="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-blue-50 z-10">
                <div class="flex items-center">
                  <span class="text-xl font-bold text-blue-600 mr-2">=</span>
                  Net Monthly Balance
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`eq-net-${month}`" 
                  :class="[
                    'px-2 py-4 text-center font-bold',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyTotal(index) > 0">
                  {{ formatCurrency(calculateMonthlyTotal(index)) }}
                </span>
                <span v-else-if="calculateMonthlyTotal(index) < 0">
                  {{ formatCurrency(calculateMonthlyTotal(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-4 text-right text-lg font-bold border-2',
                calculateGrandTotal() > 0 ? 'text-green-800 bg-green-100 border-green-300' : 
                calculateGrandTotal() < 0 ? 'text-red-800 bg-red-100 border-red-300' : 'text-gray-400 bg-gray-50 border-gray-300'
              ]">
                <span v-if="calculateGrandTotal() > 0">
                  {{ formatCurrency(calculateGrandTotal()) }}
                </span>
                <span v-else-if="calculateGrandTotal() < 0">
                  {{ formatCurrency(calculateGrandTotal()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-4 sticky right-0 bg-blue-50 z-10"></td>
            </tr>

            <!-- Net Investment Row -->
            <tr v-if="hasInvestmentData" class="bg-indigo-50">
              <td class="px-6 py-3 text-sm font-semibold text-indigo-700 sticky left-0 bg-indigo-50 z-10">
                <div class="flex items-center">
                  <span class="text-lg font-bold text-indigo-600 mr-2">📈</span>
                  Net Investment
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  ( Returns - Purchases)
                </div>
              </td>
              <td v-for="(month, index) in months" :key="`net-inv-${month}`" 
                  :class="[
                    'px-2 py-3 text-center',
                    calculateMonthlyInvestmentNet(index) > 0 ? 'text-green-700 bg-green-50' : 
                    calculateMonthlyInvestmentNet(index) < 0 ? 'text-red-700 bg-red-50' : 'text-gray-400 bg-gray-50',
                    selectedYear === budgetStore.currentYear && index === currentMonth ? 'bg-blue-400' : ''
                  ]">
                <span v-if="calculateMonthlyInvestmentNet(index) > 0">
                  {{ formatCurrency(calculateMonthlyInvestmentNet(index)) }}
                </span>
                <span v-else-if="calculateMonthlyInvestmentNet(index) < 0">
                  {{ formatCurrency(calculateMonthlyInvestmentNet(index)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td :class="[
                'px-4 py-3 text-right text-sm font-bold',
                calculateGrandTotalInvestmentNet() > 0 ? 'text-green-700' : 
                calculateGrandTotalInvestmentNet() < 0 ? 'text-red-700' : 'text-gray-400'
              ]">
                <span v-if="calculateGrandTotalInvestmentNet() > 0">
                  {{ formatCurrency(calculateGrandTotalInvestmentNet()) }}
                </span>
                <span v-else-if="calculateGrandTotalInvestmentNet() < 0">
                  {{ formatCurrency(calculateGrandTotalInvestmentNet()) }}
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3 sticky right-0 bg-indigo-50 z-10"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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