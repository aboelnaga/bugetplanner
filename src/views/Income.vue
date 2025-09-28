<script setup>
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { currentMonth } = store

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
        Income Management
      </h1>
      <button class="btn-primary">
        Add Income Source
      </button>
    </div>

    <!-- Current Income Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">
          Current Salary
        </h3>
        <p class="text-3xl font-bold text-green-600">
          {{ formatCurrency(currentMonth?.salary || 0) }}
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Monthly base salary
        </p>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-3">
          Last Bonus
        </h3>
        <p class="text-3xl font-bold text-blue-600">
          {{ formatCurrency(currentMonth?.bonus || 0) }}
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Performance bonus
        </p>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-3">
          Total Monthly
        </h3>
        <p class="text-3xl font-bold text-primary-600">
          {{ formatCurrency(currentMonth?.monthlyIncome || 0) }}
        </p>
        <p class="text-sm text-gray-500 mt-1">
          All income sources
        </p>
      </div>
    </div>

    <!-- Income Sources Table -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">
        Income Sources
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Source
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Frequency
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                Base Salary
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Regular
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(currentMonth?.salary || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Monthly
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >Active</span>
              </td>
            </tr>
            <tr v-if="(currentMonth?.bonus || 0) > 0">
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                Performance Bonus
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Bonus
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(currentMonth?.bonus || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Variable
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                >Received</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Salary Growth Projection -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">
        Salary Growth Projection
      </h3>
      <p class="text-gray-600 mb-4">
        Based on your historical data and planned raises
      </p>
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-sm text-gray-600">
          Next projected raise: <span class="font-semibold">May 2025</span>
        </p>
        <p class="text-sm text-gray-600">
          Expected increase:
          <span class="font-semibold text-green-600">15-20%</span>
        </p>
      </div>
    </div>
  </div>
</template>
