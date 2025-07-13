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
  hasIncomeData: {
    type: Boolean,
    required: true
  },
  hasInvestmentIncomingData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  }
})
</script> 