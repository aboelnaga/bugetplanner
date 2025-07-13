<template>
  <div class="card">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <div class="text-4xl mb-2">⏳</div>
        <h3 class="text-lg font-medium">Loading budget data...</h3>
        <p class="text-sm mt-2">Please wait while we fetch your budget information.</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">
        <div class="text-4xl mb-2">⚠️</div>
        <h3 class="text-lg font-medium">Error loading budget data</h3>
        <p class="text-sm mt-2">{{ error }}</p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="$emit('retry')" class="btn-primary">Retry</button>
      </div>
    </div>

    <!-- Empty State for No Budget Items -->
    <div v-else-if="budgetItems.length === 0" class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <div class="text-4xl mb-2">📊</div>
        <h3 class="text-lg font-medium">No budget items for {{ selectedYear }}</h3>
        <p class="text-sm mt-2">Start by adding your first budget item or copy from a previous year.</p>
      </div>
      <div class="flex justify-center space-x-3">
        <button @click="$emit('add-first-budget')" class="btn-primary">Add First Budget Item</button>
        <button v-if="canCopyFromPreviousYear" 
                @click="$emit('copy-from-previous-year')" 
                class="btn-secondary">
          📋 Copy from {{ selectedYear - 1 }}
        </button>
      </div>
    </div>

    <!-- Empty State for No Filtered Results -->
    <div v-else-if="filteredBudgetItems.length === 0" class="text-center py-12">
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
          <button @click="$emit('clear-filters')" class="text-sm text-blue-600 hover:text-blue-800 underline">
            Clear filters
          </button>
          <button 
            @click="$emit('add-budget')" 
            :disabled="loading"
            class="text-sm text-green-600 hover:text-green-800 underline disabled:text-gray-400 disabled:cursor-not-allowed">
            Add budget item
          </button>
        </div>
      </div>
    </div>

    <!-- Budget Table -->
    <div v-else class="overflow-hidden max-h-[calc(100vh-3rem-100px)]">
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
                    selectedYear === currentYear && index === currentMonth ? 
                      'bg-blue-200 text-blue-900 font-bold' : 'text-gray-500'
                  ]">
                {{ month }}
                <span v-if="selectedYear === currentYear && index === currentMonth" class="block text-xs font-normal mt-1">
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
                      selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : ''
                    ]">
                  <div class="relative">
                    <div :class="[
                      'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center',
                      selectedYear === currentYear && index < currentMonth ? 
                        'bg-gray-100 text-gray-400' :
                        selectedYear === currentYear && index === currentMonth ? 
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
                    <button @click="$emit('edit-budget', budget)" 
                            title="Edit budget settings"
                            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                      <Edit class="w-5 h-5" />
                    </button>
                    <button @click="$emit('duplicate-budget', budget)" 
                            title="Duplicate this budget item"
                            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                      <Copy class="w-5 h-5" />
                    </button>
                    <button @click="$emit('delete-budget', budget.id)" 
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
                        selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : '',
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
                        selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : ''
                      ]">
                    <div class="relative">
                      <div :class="[
                        'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center',
                        selectedYear === currentYear && index < currentMonth ? 
                          'bg-gray-100 text-gray-400' :
                          selectedYear === currentYear && index === currentMonth ? 
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
                      <button @click="$emit('edit-budget', budget)" 
                              title="Edit budget settings"
                              class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                        <Edit class="w-5 h-5" />
                      </button>
                      <button @click="$emit('duplicate-budget', budget)" 
                              title="Duplicate this budget item"
                              class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                        <Copy class="w-5 h-5" />
                      </button>
                      <button @click="$emit('delete-budget', budget.id)" 
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
                    selectedYear === currentYear && index === currentMonth ? 'bg-blue-400' : ''
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
  </div>
</template>

<script setup>
import { Edit, Copy, Trash2, TrendingDown, TrendingUp, Calendar, Repeat } from 'lucide-vue-next'

// Props
const props = defineProps({
  // State
  loading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    default: null
  },
  budgetItems: {
    type: Array,
    required: true
  },
  selectedCategoryFilter: {
    type: String,
    required: true
  },
  canCopyFromPreviousYear: {
    type: Boolean,
    required: true
  },
  
  // Data
  filteredBudgetItems: {
    type: Array,
    required: true
  },
  groupedBudgetItems: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    required: true
  },
  selectedYear: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  currentMonth: {
    type: Number,
    required: true
  },
  groupByCategory: {
    type: Boolean,
    required: true
  },
  selectedTypeFilter: {
    type: String,
    required: true
  },
  
  // Computed properties
  hasIncomeData: {
    type: Boolean,
    required: true
  },
  hasExpenseData: {
    type: Boolean,
    required: true
  },
  hasInvestmentData: {
    type: Boolean,
    required: true
  },
  hasInvestmentIncomingData: {
    type: Boolean,
    required: true
  },
  hasInvestmentOutgoingData: {
    type: Boolean,
    required: true
  },
  hasAnyData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateYearlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentNet: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
    type: Function,
    required: true
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentNet: {
    type: Function,
    required: true
  },
  getCategoryType: {
    type: Function,
    required: true
  },
  calculateCategoryTotal: {
    type: Function,
    required: true
  },
  calculateCategoryMonthlyTotal: {
    type: Function,
    required: true
  },
  isScheduledMonth: {
    type: Function,
    required: true
  },
  getBudgetAmount: {
    type: Function,
    required: true
  },
  hasChanges: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'retry',
  'add-first-budget',
  'copy-from-previous-year',
  'clear-filters',
  'add-budget',
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 