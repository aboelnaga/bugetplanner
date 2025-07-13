<template>
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
  hasInvestmentData: {
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
  calculateMonthlyInvestmentNet: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
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