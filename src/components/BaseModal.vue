<script setup>
  // Props
const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
    },
    title: {
      type: String,
      default: ''
    }
  })

  // Emits
  defineEmits(['update:modelValue'])

// Modal size configurations
const modalSizes = {
    small: {
      width: '500px',
      maxWidth: '90vw',
      breakpoints: { '575px': '95vw' }
    },
    medium: {
      width: '800px',
      maxWidth: '90vw',
      breakpoints: { '1199px': '95vw', '575px': '98vw' }
    },
    large: {
      width: '1200px',
      maxWidth: '95vw',
      breakpoints: { '1199px': '98vw', '575px': '100vw' }
    },
    xl: {
      width: '1400px',
      maxWidth: '98vw',
      breakpoints: { '1199px': '100vw', '575px': '100vw' }
    }
  }

// Get modal style based on size
const getModalStyle = () => {
  const size = modalSizes[props.size]
  return {
      width: size.width,
      maxWidth: size.maxWidth
    }
}

// Get modal breakpoints based on size
const getModalBreakpoints = () => {
  return modalSizes[props.size].breakpoints
}

// Get modal header (use prop title or slot title)
const getModalHeader = () => {
  return props.title || 'Modal Title'
}
</script>

<template>
  <Dialog
    :visible="modelValue"
    :modal="true"
    :closable="true"
    :close-on-escape="true"
    :dismissable-mask="false"
    :draggable="false"
    :style="getModalStyle()"
    :breakpoints="getModalBreakpoints()"
    :header="getModalHeader()"
    class="p-fluid"
    @update:visible="$emit('update:modelValue', $event)"
  >
    <!-- Content -->
    <slot />

    <!-- Footer -->
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </Dialog>
</template>
