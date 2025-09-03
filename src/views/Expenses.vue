<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { currentMonth, totalFamilyExpenses, totalInvestments } = store

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

const expenseCategories = computed(() => {
  const total = currentMonth?.monthlySpending || 0
  if (total === 0) return []
  
  const categories = [
    {
      name: 'Family Budget',
      description: 'Personal allowances and household',
      amount: totalFamilyExpenses || 0,
      color: 'bg-blue-500',
      percentage: (((totalFamilyExpenses || 0) / total) * 100).toFixed(1)
    },
    {
      name: 'Investments',
      description: 'Real estate and asset investments',
      amount: totalInvestments || 0,
      color: 'bg-green-500',
      percentage: (((totalInvestments || 0) / total) * 100).toFixed(1)
    },
    {
      name: 'Extra Expenses',
      description: 'Miscellaneous and unexpected costs',
      amount: currentMonth?.expenses?.extra || 0,
      color: 'bg-red-500',
      percentage: (((currentMonth?.expenses?.extra || 0) / total) * 100).toFixed(1)
    },
    {
      name: 'Gam3iat',
      description: 'Savings group contributions',
      amount: currentMonth?.expenses?.gam3iat || 0,
      color: 'bg-yellow-500',
      percentage: (((currentMonth?.expenses?.gam3iat || 0) / total) * 100).toFixed(1)
    },
    {
      name: 'Charity & Zakat',
      description: 'Religious obligations and donations',
      amount: (currentMonth?.expenses?.charity || 0) + (currentMonth?.expenses?.zakat || 0),
      color: 'bg-purple-500',
      percentage: ((((currentMonth?.expenses?.charity || 0) + (currentMonth?.expenses?.zakat || 0)) / total) * 100).toFixed(1)
    }
  ].filter(cat => cat.amount > 0)
  
  return categories
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Expense Management</h1>
      <button class="btn-primary">Add Expense</button>
    </div>

    <!-- Expense Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Total Monthly</h3>
        <p class="text-3xl font-bold text-red-600">{{ formatCurrency(currentMonth?.monthlySpending || 0) }}</p>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Family Expenses</h3>
        <p class="text-3xl font-bold text-blue-600">{{ formatCurrency(totalFamilyExpenses || 0) }}</p>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Investments</h3>
        <p class="text-3xl font-bold text-green-600">{{ formatCurrency(totalInvestments || 0) }}</p>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Charity & Zakat</h3>
        <p class="text-3xl font-bold text-purple-600">{{ formatCurrency((currentMonth?.expenses?.charity || 0) + (currentMonth?.expenses?.zakat || 0)) }}</p>
      </div>
    </div>

    <!-- Expense Categories -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Expense Categories</h3>
      <div class="space-y-4">
        <div v-for="(category, key) in expenseCategories" :key="key" class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div :class="['w-4 h-4 rounded-full', category.color]"></div>
            <div>
              <div class="font-medium">{{ category.name }}</div>
              <div class="text-sm text-gray-500">{{ category.description }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold">{{ formatCurrency(category.amount) }}</div>
            <div class="text-sm text-gray-500">{{ category.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 