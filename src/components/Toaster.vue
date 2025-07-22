<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
      name="toast"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getToastClasses(toast.type)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ toast.title }}
              </p>
              <p v-if="toast.message" class="mt-1 text-sm text-gray-500">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeToast(toast.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Progress bar -->
        <div v-if="toast.duration" class="h-1 bg-gray-200">
          <div
            :style="{ width: `${toast.progress}%` }"
            :class="getProgressBarClasses(toast.type)"
            class="h-full transition-all duration-100 ease-linear"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-vue-next'

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Toast state
const toasts = ref([])
let nextId = 1

// Toast icons
const getToastIcon = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return CheckCircle
    case TOAST_TYPES.ERROR:
      return XCircle
    case TOAST_TYPES.WARNING:
      return AlertTriangle
    case TOAST_TYPES.INFO:
    default:
      return Info
  }
}

// Toast classes
const getToastClasses = (type) => {
  const baseClasses = 'w-96 bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden'
  
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return `${baseClasses} ring-green-500`
    case TOAST_TYPES.ERROR:
      return `${baseClasses} ring-red-500`
    case TOAST_TYPES.WARNING:
      return `${baseClasses} ring-yellow-500`
    case TOAST_TYPES.INFO:
    default:
      return `${baseClasses} ring-blue-500`
  }
}

// Progress bar classes
const getProgressBarClasses = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return 'bg-green-500'
    case TOAST_TYPES.ERROR:
      return 'bg-red-500'
    case TOAST_TYPES.WARNING:
      return 'bg-yellow-500'
    case TOAST_TYPES.INFO:
    default:
      return 'bg-blue-500'
  }
}

// Toast methods
const addToast = (toast) => {
  const id = nextId++
  const newToast = {
    id,
    type: TOAST_TYPES.INFO,
    title: '',
    message: '',
    duration: 5000,
    progress: 100,
    ...toast
  }
  
  toasts.value.push(newToast)
  
  // Auto-dismiss
  if (newToast.duration) {
    const startTime = Date.now()
    const endTime = startTime + newToast.duration
    
    const updateProgress = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const remaining = endTime - now
      
      if (remaining <= 0) {
        removeToast(id)
        return
      }
      
      newToast.progress = (remaining / newToast.duration) * 100
      requestAnimationFrame(updateProgress)
    }
    
    requestAnimationFrame(updateProgress)
    
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Convenience methods
const success = (title, message = '', duration = 5000) => {
  return addToast({ type: TOAST_TYPES.SUCCESS, title, message, duration })
}

const error = (title, message = '', duration = 7000) => {
  return addToast({ type: TOAST_TYPES.ERROR, title, message, duration })
}

const warning = (title, message = '', duration = 6000) => {
  return addToast({ type: TOAST_TYPES.WARNING, title, message, duration })
}

const info = (title, message = '', duration = 5000) => {
  return addToast({ type: TOAST_TYPES.INFO, title, message, duration })
}

// Expose methods globally
const toaster = {
  addToast,
  removeToast,
  success,
  error,
  warning,
  info
}

// Make toaster available globally
if (typeof window !== 'undefined') {
  window.$toaster = toaster
}

// Expose toaster for use in components
defineExpose({
  addToast,
  removeToast,
  success,
  error,
  warning,
  info
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style> 