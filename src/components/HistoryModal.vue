<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'
import { useBudgetHistory } from '@/composables/useBudgetHistory.js'
import { MONTHS } from '@/constants/budgetConstants.js'
import { formatCompactCurrency } from '@/utils/budgetUtils.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Store
const budgetStore = useBudgetStore()

// Constants
const months = MONTHS

// History composable
const {
  historyItems,
  formatHistoryValue,
  formatTimestamp,
  formatFullDate,
  getChangeIndicator,
  getBudgetItemName,
  getHistoryStats
} = useBudgetHistory(budgetStore)

// Get history statistics
const historyStats = computed(() => getHistoryStats())

// Group history items by budget item
const groupedHistoryItems = computed(() => {
  const grouped = {}
  historyItems.value.forEach(change => {
    if (!grouped[change.budget_item_id]) {
      grouped[change.budget_item_id] = []
    }
    grouped[change.budget_item_id].push(change)
  })

  // Sort each group by timestamp (newest first)
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
  })

  return grouped
})

// Get change for specific month
const getChangeForMonth = (changes, monthIndex) => {
  return changes.find(change => change.month_index === monthIndex)
}

// Calculate total impact of all changes
const calculateTotalImpact = () => {
  return historyItems.value.reduce((total, change) => {
    return total + Math.abs(change.new_amount - change.old_amount)
  }, 0)
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              Budget Change History
            </h3>
            <p class="text-sm text-gray-600">
              Track all modifications to your budget items
            </p>
          </div>
        </div>
        <button
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          title="Close modal"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- History Content -->
        <div
          v-if="historyItems.length > 0"
          class="space-y-6"
        >
          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-600">
                    Total Changes
                  </p>
                  <p class="text-2xl font-bold text-green-700">
                    {{ historyStats.totalChanges }}
                  </p>
                </div>
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-600">
                    Unique Items
                  </p>
                  <p class="text-2xl font-bold text-blue-700">
                    {{ historyStats.uniqueItems }}
                  </p>
                </div>
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-600">
                    Latest Change
                  </p>
                  <p class="text-sm font-semibold text-purple-700">
                    {{ historyStats.latestChange }}
                  </p>
                </div>
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-orange-600">
                    Total Impact
                  </p>
                  <p class="text-2xl font-bold text-orange-700">
                    {{ formatCompactCurrency(calculateTotalImpact()) }}
                  </p>
                </div>
                <div class="p-2 bg-orange-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- History by Budget Items -->
          <div class="space-y-6">
            <div
              v-for="(itemChanges, budgetItemId) in groupedHistoryItems"
              :key="budgetItemId"
              class="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Item Header -->
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="p-1.5 bg-blue-100 rounded-md">
                      <svg
                        class="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h4 class="font-semibold text-gray-900">
                      {{ getBudgetItemName(budgetItemId) }}
                    </h4>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ itemChanges.length }} change{{ itemChanges.length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    Last modified: {{ formatTimestamp(itemChanges[0].changed_at) }}
                  </div>
                </div>
              </div>

              <!-- Changes Grid -->
              <div class="p-4">
                <!-- Month headers -->
                <div class="grid grid-cols-12 gap-1 mb-2">
                  <div
                    v-for="(month, index) in months"
                    :key="month"
                    class="text-center py-2 px-1 text-xs font-semibold text-gray-700 rounded"
                  >
                    {{ month }}
                  </div>
                </div>

                <!-- Changes by month -->
                <div class="grid grid-cols-12 gap-1">
                  <div
                    v-for="(month, monthIndex) in months"
                    :key="monthIndex"
                    class="text-center py-2 px-1 text-xs rounded border border-gray-200 bg-white min-h-[60px] flex flex-col justify-center"
                  >
                    <!-- Find change for this month -->
                    <div
                      v-if="getChangeForMonth(itemChanges, monthIndex)"
                      class="space-y-1"
                    >
                      <div
                        class="font-medium text-red-600"
                        :title="formatCurrency(getChangeForMonth(itemChanges, monthIndex).old_amount)"
                      >
                        {{ formatCompactCurrency(getChangeForMonth(itemChanges, monthIndex).old_amount) }}
                      </div>
                      <div class="flex items-center justify-center">
                        <svg
                          class="w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                      <div
                        class="font-medium text-green-600"
                        :title="formatCurrency(getChangeForMonth(itemChanges, monthIndex).new_amount)"
                      >
                        {{ formatCompactCurrency(getChangeForMonth(itemChanges, monthIndex).new_amount) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatTimestamp(getChangeForMonth(itemChanges, monthIndex).changed_at) }}
                      </div>
                    </div>

                    <!-- No change for this month -->
                    <div
                      v-else
                      class="text-gray-400"
                    >
                      —
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12"
        >
          <div class="max-w-md mx-auto">
            <div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg
                class="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">
              No Changes Yet
            </h4>
            <p class="text-gray-600 mb-6">
              Budget changes will appear here once you start modifying amounts in your budget planner.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="p-1 bg-blue-100 rounded">
                  <svg
                    class="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="text-sm text-blue-800">
                  <p class="font-medium mb-1">
                    How to see changes:
                  </p>
                  <ul class="space-y-1 text-blue-700">
                    <li>• Edit budget items and save changes</li>
                    <li>• Modify monthly amounts in the table</li>
                    <li>• All changes are automatically tracked</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-600">
          Showing {{ historyItems.length }} change{{ historyItems.length !== 1 ? 's' : '' }} across {{ Object.keys(groupedHistoryItems).length }} budget item{{ Object.keys(groupedHistoryItems).length !== 1 ? 's' : '' }}
        </div>
        <button
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>