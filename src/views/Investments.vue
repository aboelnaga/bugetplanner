<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
      <button class="btn-primary">Add Investment</button>
    </div>

    <!-- Portfolio Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div class="card">
         <h3 class="text-lg font-semibold mb-3">Total Investments</h3>
         <p class="text-3xl font-bold text-green-600">{{ formatCurrency(totalInvestments || 0) }}</p>
         <p class="text-sm text-gray-500 mt-1">Monthly allocation</p>
       </div>
       
       <div class="card">
         <h3 class="text-lg font-semibold mb-3">Active Investments</h3>
         <p class="text-3xl font-bold text-blue-600">{{ activeInvestments?.length || 0 }}</p>
         <p class="text-sm text-gray-500 mt-1">Portfolio items</p>
       </div>
       
       <div class="card">
         <h3 class="text-lg font-semibold mb-3">Investment Ratio</h3>
         <p class="text-3xl font-bold text-purple-600">{{ investmentRatio || 0 }}%</p>
         <p class="text-sm text-gray-500 mt-1">Of monthly income</p>
       </div>
    </div>

    <!-- Investment Items -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Investment Portfolio</h3>
      <div class="space-y-4">
        <div v-for="investment in investments" :key="investment.name" class="border rounded-lg p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="text-lg font-semibold">{{ investment.name }}</h4>
              <p class="text-gray-600">{{ investment.type }}</p>
            </div>
            <span :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              investment.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]">
              {{ investment.status }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">Monthly Payment</p>
              <p class="text-lg font-semibold">{{ formatCurrency(investment.monthlyPayment) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Investment Type</p>
              <p class="text-lg font-semibold">{{ investment.type }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p class="text-lg font-semibold">{{ investment.status }}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Annual Investment</span>
              <span>{{ formatCurrency(investment.monthlyPayment * 12) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Investment Strategy -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Investment Strategy</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-2">Real Estate Focus</h4>
          <p class="text-gray-600 text-sm">Your portfolio is heavily invested in real estate properties, providing long-term wealth building and potential rental income.</p>
        </div>
        <div>
          <h4 class="font-medium mb-2">Diversification Opportunity</h4>
          <p class="text-gray-600 text-sm">Consider diversifying with gold or other precious metals to balance your investment portfolio.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { investments, totalInvestments, currentMonth } = store

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

const activeInvestments = computed(() => {
  return investments?.value?.filter(inv => inv.status === 'Active') || []
})

const investmentRatio = computed(() => {
  if ((currentMonth?.monthlyIncome || 0) === 0) return 0
  return (((totalInvestments || 0) / (currentMonth?.monthlyIncome || 1)) * 100).toFixed(1)
})
</script> 