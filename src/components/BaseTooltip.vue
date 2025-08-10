<template>
  <div class="relative inline-block" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <slot />
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95">
      <div
        v-if="showTooltip && content"
        class="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-pre-line w-80"
        :class="positionClasses"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false">
          <div v-html="content"></div>
        <div class="absolute w-2 h-2 bg-gray-900 transform rotate-45" :class="arrowClasses"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top', // top, bottom, left, right
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const showTooltip = ref(false)

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
  }
})

const arrowClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1'
    case 'bottom':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mt-1'
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 -ml-1'
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 ml-1'
    default:
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1'
  }
})
</script> 