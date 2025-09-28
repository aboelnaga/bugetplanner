<script setup>
import { computed, ref } from 'vue'
import BaseModal from './BaseModal.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

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
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
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

<template>
  <BaseModal
    v-model="isOpen"
    title="Close Month"
  >
    <div class="space-y-4">
      <!-- Warning Icon and Message -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center"
          >
            <i class="pi pi-exclamation-triangle text-amber-600" />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-medium">
            Close {{ monthName }} {{ year }}?
          </h3>
          <p class="mt-1 text-sm text-surface-600">
            This will finalize the month and show actual spending amounts
            instead of planned amounts. You can still add or edit transactions,
            but the month will be marked as closed.
          </p>
        </div>
      </div>

      <!-- Month Summary -->
      <div class="bg-surface-50 rounded-lg p-4">
        <h4 class="text-sm font-medium mb-2">
          Month Summary
        </h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-surface-600">Total Budget Items:</span>
            <span class="ml-2 font-medium">{{ budgetItemsCount }}</span>
          </div>
          <div>
            <span class="text-surface-600">Total Transactions:</span>
            <span class="ml-2 font-medium">{{ transactionsCount }}</span>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <Message
        severity="warn"
        :closable="false"
      >
        <template #messageicon>
          <i class="pi pi-exclamation-triangle" />
        </template>
        <template #message>
          <strong>Note:</strong> This action cannot be undone. The month will be
          permanently marked as closed.
        </template>
      </Message>
    </div>

    <!-- Action Buttons -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          :disabled="loading"
          label="Cancel"
          outlined
          severity="secondary"
          @click="handleCancel"
        />
        <Button
          :disabled="loading"
          :loading="loading"
          icon="pi pi-check"
          :label="loading ? 'Closing...' : 'Close Month'"
          severity="warn"
          @click="handleConfirm"
        />
      </div>
    </template>
  </BaseModal>
</template>
