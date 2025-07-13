<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <slot name="icon">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </slot>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              <slot name="title">Modal Title</slot>
            </h3>
            <p v-if="$slots.subtitle" class="text-sm text-gray-600">
              <slot name="subtitle"></slot>
            </p>
          </div>
        </div>
        <button 
          @click="$emit('update:modelValue', false)" 
          :disabled="loading"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Close modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot></slot>
      </div>
      
      <!-- Footer -->
      <div v-if="$slots.footer" class="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['update:modelValue'])
</script> 