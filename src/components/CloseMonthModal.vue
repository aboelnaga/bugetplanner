<template>
  <BaseModal v-model="isOpen" title="Close Month">
    <div class="space-y-4">
      <!-- Warning Icon and Message -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">
            Close {{ monthName }} {{ year }}?
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            This will finalize the month and show actual spending amounts instead of planned amounts. 
            You can still add or edit transactions, but the month will be marked as closed.
          </p>
        </div>
      </div>

      <!-- Month Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Month Summary</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Total Budget Items:</span>
            <span class="ml-2 font-medium">{{ budgetItemsCount }}</span>
          </div>
          <div>
            <span class="text-gray-600">Total Transactions:</span>
            <span class="ml-2 font-medium">{{ transactionsCount }}</span>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-amber-800">
              <strong>Note:</strong> This action cannot be undone. The month will be permanently marked as closed.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="handleCancel"
          :disabled="loading"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="loading"
          class="btn-primary"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Closing...' : 'Close Month' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseModal from './BaseModal.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  budgetItemsCount: {
    type: Number,
    default: 0
  },
  transactionsCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm'])

// Local state
const loading = ref(false)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const monthName = computed(() => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[props.month]
})

// Methods
const handleCancel = () => {
  isOpen.value = false
}

const handleConfirm = async () => {
  loading.value = true
  try {
    await emit('confirm', props.year, props.month)
    isOpen.value = false
  } catch (error) {
    console.error('Error closing month:', error)
  } finally {
    loading.value = false
  }
}
</script> 