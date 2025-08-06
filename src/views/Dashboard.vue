<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">{{ currentMonthData?.month || 'Current' }} {{ currentMonthData?.year || new Date().getFullYear() }} Overview</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="text-sm text-gray-500">Total Savings</div>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(currentMonthData?.savings || 0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Monthly Income"
        :value="formatCurrency(currentMonthData?.monthlyIncome || 0)"
        change="+12.5%"
        icon="DollarSign"
        color="green"
      />
      <StatCard
        title="Monthly Spending"
        :value="formatCurrency(currentMonthData?.monthlySpending || 0)"
        change="+23.1%"
        icon="CreditCard"
        color="red"
      />
      <StatCard
        title="This Month Saving"
        :value="formatCurrency(currentMonthData?.monthlySaving || 0)"
        :change="savingsChangeText"
        icon="TrendingUp"
        :color="(currentMonthData?.monthlySaving || 0) >= 0 ? 'green' : 'red'"
      />
      <StatCard
        title="Zakat Due"
        :value="formatCurrency(zakatDue)"
        change="2.5% of savings"
        icon="Calculator"
        color="blue"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly Trend Chart -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Monthly Trend (2024)</h3>
        <MonthlyTrendChart :data="monthlyData" />
      </div>

      <!-- Expense Breakdown -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Expense Breakdown</h3>
        <ExpenseBreakdownChart :expenses="currentMonth.expenses" />
      </div>
    </div>

    <!-- Family Budget & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Family Budget Summary -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Family Budget</h3>
        <div class="space-y-3">
          <div 
            v-for="(member, key) in familyBudgets" 
            :key="key"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium capitalize">{{ key }}</div>
              <div class="text-sm text-gray-500">{{ member.category }}</div>
            </div>
            <div class="text-lg font-semibold">
              {{ formatCurrency(member.monthly) }}
            </div>
          </div>
          <div class="border-t pt-3 mt-3">
            <div class="flex justify-between items-center font-semibold">
              <span>Total Family Expenses</span>
              <span>{{ formatCurrency(totalFamilyExpenses) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions & Quick Actions -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Quick Insights</h3>
        <div class="space-y-4">
          <!-- Investment Summary -->
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-blue-900">Total Investments</div>
                <div class="text-sm text-blue-600">Real Estate & Assets</div>
              </div>
              <div class="text-xl font-bold text-blue-900">
                {{ formatCurrency(totalInvestments) }}
              </div>
            </div>
          </div>

          <!-- Savings Rate -->
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-green-900">Savings Rate</div>
                <div class="text-sm text-green-600">This Month</div>
              </div>
              <div class="text-xl font-bold text-green-900">
                {{ currentSavingsRate }}%
              </div>
            </div>
          </div>

          <!-- Next Zakat Payment -->
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-purple-900">Next Zakat</div>
                <div class="text-sm text-purple-600">Annual Islamic Tax</div>
              </div>
              <div class="text-xl font-bold text-purple-900">
                {{ formatCurrency(zakatDue) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Future Projections -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">5-Year Financial Projection</h3>
      <ProjectionChart :projections="projections" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import StatCard from '@/components/StatCard.vue'
import MonthlyTrendChart from '@/components/MonthlyTrendChart.vue'
import ExpenseBreakdownChart from '@/components/ExpenseBreakdownChart.vue'
import ProjectionChart from '@/components/ProjectionChart.vue'

const store = useBudgetStore()

const {
  currentMonthData,
  monthlyData,
  projections,
  familyBudgets,
  currentSavingsRate,
  zakatDue,
  totalFamilyExpenses,
  totalInvestments
} = store

const savingsChangeText = computed(() => {
  return `${currentSavingsRate?.value || 0}%`
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}
</script> 