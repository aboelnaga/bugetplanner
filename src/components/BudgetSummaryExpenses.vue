<template>
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
  
  // Computed properties
  hasExpenseData: {
    type: Boolean,
    required: true
  },
  hasInvestmentOutgoingData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  }
})
</script> 