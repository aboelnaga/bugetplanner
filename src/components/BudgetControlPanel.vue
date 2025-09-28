<script setup>
import { Calendar } from 'lucide-vue-next'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
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
    'copy-from-previous-year',
    'add-budget'
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
    return (props.budgetItems || []).filter((b) => b && b.type === 'income')
      .length
  })

const expenseCount = computed(() => {
    return (props.budgetItems || []).filter((b) => b && b.type === 'expense')
      .length
  })

const investmentCount = computed(() => {
    return (props.budgetItems || []).filter((b) => b && b.type === 'investment')
      .length
  })
</script>

<template>
  <Card>
    <template #content>
      <div class="flex items-center justify-between gap-2">
        <!-- Left: Year & Actions -->
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-1">
            <Calendar class="w-4 h-4 text-primary" />
            <span class="text-sm font-medium text-color">Year:</span>

            <!-- Previous Year Button -->
            <Button
              :disabled="!canGoToPreviousYear"
              icon="pi pi-chevron-left"
              size="small"
              severity="secondary"
              text
              rounded
              title="Previous year"
              @click="goToPreviousYear"
            />

            <!-- Year Select -->
            <Select
              :model-value="selectedYear"
              :options="availableYears"
              size="small"
              @update:model-value="$emit('update:selectedYear', $event)"
            />

            <!-- Next Year Button -->
            <Button
              :disabled="!canGoToNextYear"
              icon="pi pi-chevron-right"
              size="small"
              severity="secondary"
              text
              rounded
              title="Next year"
              @click="goToNextYear"
            />
          </div>

          <div class="flex items-center space-x-1">
            <Button
              icon="pi pi-calendar-plus"
              label="Add Year"
              size="small"
              severity="secondary"
              text
              title="Add a new year to plan"
              @click="$emit('add-year')"
            />

            <Button
              v-if="budgetItems.length === 0 && canCopyFromPreviousYear"
              icon="pi pi-copy"
              :label="`Copy ${selectedYear - 1}`"
              size="small"
              severity="success"
              text
              title="Copy budget items from previous year"
              @click="$emit('copy-from-previous-year')"
            />
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex items-center space-x-2">
          <!-- Quick Stats -->
          <div class="flex items-center space-x-2">
            <Tag
              :value="`${incomeCount} income`"
              severity="success"
              size="small"
            />
            <Tag
              :value="`${expenseCount} expenses`"
              severity="danger"
              size="small"
            />
            <Tag
              :value="`${investmentCount} investment`"
              severity="info"
              size="small"
            />
          </div>

          <Button
            icon="pi pi-plus"
            label="Add Budget Item"
            size="large"
            severity="primary"
            title="Add a new budget item"
            @click="$emit('add-budget')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
