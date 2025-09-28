<script setup>
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { familyBudgets, totalFamilyExpenses, currentMonth } = store

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">
        Family Budget
      </h1>
      <button class="btn-primary">
        Adjust Budgets
      </button>
    </div>

    <!-- Family Members Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(member, key) in familyBudgets"
        :key="key"
        class="card"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-2xl font-bold text-primary-600">{{
              key.charAt(0).toUpperCase()
            }}</span>
          </div>
          <h3 class="text-lg font-semibold capitalize mb-2">
            {{ key }}
          </h3>
          <p class="text-3xl font-bold text-primary-600 mb-2">
            {{ formatCurrency(member.monthly) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ member.category }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ member.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Total Family Spending -->
    <div class="card bg-gradient-to-r from-blue-50 to-purple-50">
      <div class="text-center">
        <h3 class="text-xl font-semibold mb-2">
          Total Family Expenses
        </h3>
        <p class="text-4xl font-bold text-blue-600 mb-2">
          {{ formatCurrency(totalFamilyExpenses || 0) }}
        </p>
        <p class="text-gray-600">
          {{
            (
              ((totalFamilyExpenses || 0) /
                (currentMonth?.monthlySpending || 1)) *
              100
            ).toFixed(1)
          }}% of total monthly spending
        </p>
      </div>
    </div>

    <!-- Monthly Breakdown -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">
        Monthly Allocation Breakdown
      </h3>
      <div class="space-y-4">
        <div
          v-for="(member, key) in familyBudgets"
          :key="key"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <span class="font-semibold text-gray-600 capitalize">{{
                key.charAt(0)
              }}</span>
            </div>
            <div>
              <div class="font-medium capitalize">
                {{ key }}
              </div>
              <div class="text-sm text-gray-500">
                {{ member.category }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold">
              {{ formatCurrency(member.monthly) }}
            </div>
            <div class="text-sm text-gray-500">
              {{
                ((member.monthly / (totalFamilyExpenses || 1)) * 100).toFixed(
                  1,
                )
              }}% of family budget
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
