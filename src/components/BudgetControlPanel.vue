<script setup>
import { Calendar } from 'lucide-vue-next'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { computed } from 'vue'

// Props
const props = defineProps({
  selectedYear: {
    type: Number,
    required: true
  },
  availableYears: {
    type: Array,
    required: true
  },
  canCopyFromPreviousYear: {
    type: Boolean,
    default: false
  },
  budgetItems: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'update:selectedYear',
  'add-year',
  'copy-from-previous-year'
])

// Computed properties for navigation
const canGoToPreviousYear = computed(() => {
  const currentIndex = props.availableYears.indexOf(props.selectedYear)
  return currentIndex > 0
})

const canGoToNextYear = computed(() => {
  const currentIndex = props.availableYears.indexOf(props.selectedYear)
  return currentIndex < props.availableYears.length - 1
})

// Methods for navigation
const goToPreviousYear = () => {
  if (canGoToPreviousYear.value) {
    const currentIndex = props.availableYears.indexOf(props.selectedYear)
    const previousYear = props.availableYears[currentIndex - 1]
    emit('update:selectedYear', previousYear)
  }
}

const goToNextYear = () => {
  if (canGoToNextYear.value) {
    const currentIndex = props.availableYears.indexOf(props.selectedYear)
    const nextYear = props.availableYears[currentIndex + 1]
    emit('update:selectedYear', nextYear)
  }
}

// Computed properties for quick stats
const incomeCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === 'income').length
})

const expenseCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === 'expense').length
})

const investmentCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === 'investment').length
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
    <div class="flex items-center justify-between gap-2">

      <!-- Left: Year & Actions -->
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-1">
          <Calendar class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium text-gray-700">Year:</span>

          <!-- Previous Year Button -->
          <Button @click="goToPreviousYear" :disabled="!canGoToPreviousYear" icon="pi pi-chevron-left" size="small"
            severity="secondary" text rounded title="Previous year" />

          <!-- Year Select -->
          <Select :modelValue="selectedYear" @update:modelValue="$emit('update:selectedYear', $event)"
            :options="availableYears" size="small" />

          <!-- Next Year Button -->
          <Button @click="goToNextYear" :disabled="!canGoToNextYear" icon="pi pi-chevron-right" size="small"
            severity="secondary" text rounded title="Next year" />
        </div>

        <div class="flex items-center space-x-1">
          <Button @click="$emit('add-year')" icon="pi pi-plus" label="Add Year" size="small" severity="secondary" text
            title="Add a new year to plan" />

          <Button v-if="budgetItems.length === 0 && canCopyFromPreviousYear" @click="$emit('copy-from-previous-year')"
            icon="pi pi-copy" :label="`Copy ${selectedYear - 1}`" size="small" severity="success" text
            title="Copy budget items from previous year" />
        </div>
      </div>

      <!-- Right: Stats -->
      <div class="flex items-center space-x-2">
        <!-- Quick Stats -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">
            <span class="text-green-600 font-semibold">{{ incomeCount }} income</span>
            <span class="mx-1">•</span>
            <span class="text-red-600 font-semibold">{{ expenseCount }} expenses</span>
            <span class="mx-1">•</span>
            <span class="text-purple-600 font-semibold">{{ investmentCount }} investment</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
