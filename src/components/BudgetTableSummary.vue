<template>
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
</template>

<script setup>
// Props
const props = defineProps({
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
  formatCurrency: {
    type: Function,
    required: true
  }
})
</script> 