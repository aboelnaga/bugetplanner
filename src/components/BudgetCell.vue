<template>
  <div
    class="text-center relative"
    :class="getCellTextColorClass(data)"
  >
    <div
      v-if="cellData"
      class="font-medium cursor-help"
      :title="cellData.tooltip || ''"
    >
      <!-- Both Mode Display -->
      <template v-if="cellData.template === 'both'">
        <div class="actual-expected-display">
          <div class="actual">
            {{ cellData.actual || '—' }}
          </div>
          <div class="expected">
            {{ cellData.expected || '—' }}
          </div>
        </div>
      </template>

      <!-- Single Mode Display -->
      <template v-else>
        <div
          class="single-mode-display"
          :class="cellData.classes || ''"
        >
          {{ cellData.value || '—' }}
          <span
            v-if="cellData.closed"
            class="text-xs ml-1 text-green-600 dark:text-green-400 cursor-help"
            :title="`Month is closed - actual amount is displayed`"
          >●</span>
        </div>
      </template>
    </div>
    <div
      v-else
      class="font-normal text-muted-color"
    >
      —
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  month: {
    type: String,
    default: null
  },
  isTotal: {
    type: Boolean,
    default: false
  },
  // Functions passed from parent
  renderCellTemplate: {
    type: Function,
    required: true
  },
  getCellTextColorClass: {
    type: Function,
    required: true
  }
})

// Computed
const cellData = computed(() => {
  return props.renderCellTemplate(props.data, props.month, props.isTotal)
})
</script>

<style scoped>
/* dual data display styling */
.actual-expected-display {
    line-height: 1.2;
    font-size: 0.875em;
}

.actual-expected-display .actual {
    border-bottom: 1px solid;
    margin-bottom: 2px;
    padding-bottom: 2px;
    font-weight: 500;
}

/* single mode display styling */
.single-mode-display {
    line-height: 1.2;
}
</style>
