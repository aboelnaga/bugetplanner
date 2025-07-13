<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Budget Change History</h3>
        <button 
          @click="closeModal" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- History Content -->
      <div v-if="historyItems.length > 0" class="space-y-2">
        <div v-for="change in historyItems" :key="change.id" 
             class="flex justify-between items-center py-2 px-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
          <div class="flex-1">
            <span class="font-medium text-gray-900">{{ getBudgetItemName(change.budget_item_id) }}</span>
            <span class="text-gray-500 ml-2">- Month {{ change.month_index + 1 }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-red-600 font-medium">{{ formatHistoryValue(change.old_amount) }}</span>
            <span class="text-gray-400">→</span>
            <span class="text-green-600 font-medium">{{ formatHistoryValue(change.new_amount) }}</span>
          </div>
          <div class="text-xs text-gray-500 ml-4">
            {{ formatTimestamp(change.changed_at) }}
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">No Changes Yet</h4>
        <p class="text-gray-500">Budget changes will appear here once you start modifying amounts.</p>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <button @click="closeModal" class="btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'

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

// Computed
const historyItems = computed(() => budgetStore.budgetHistory || [])

// Get budget item name by ID
const getBudgetItemName = (budgetItemId) => {
  const budgetItem = budgetStore.budgetItems.find(item => item.id === budgetItemId)
  return budgetItem ? budgetItem.name : `Budget Item #${budgetItemId}`
}

// Format currency for history values
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0))
}

// Format history value (currently same as currency, but can be extended)
const formatHistoryValue = (value) => {
  return formatCurrency(value)
}

// Format timestamp for better readability
const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch (error) {
    // Fallback to original timestamp if parsing fails
    return timestamp
  }
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}
</script> 