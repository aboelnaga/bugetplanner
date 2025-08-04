<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      
      <!-- Left: Year & Actions -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <Calendar class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium text-gray-700">Year:</span>
          <select 
            :value="selectedYear" 
            @change="$emit('update:selectedYear', parseInt($event.target.value))"
            class="border border-gray-300 rounded-md px-3 py-1 text-sm font-semibold text-blue-600 bg-white hover:border-gray-400 focus:border-blue-500"
            data-testid="year-filter-select"
          >
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="$emit('add-year')"
            title="Add a new year to plan"
            class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Year
          </button>
          
          <button 
            v-if="budgetItems.length === 0 && canCopyFromPreviousYear" 
            @click="$emit('copy-from-previous-year')"
            title="Copy budget items from previous year"
            class="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Copy class="w-3 h-3 mr-1" />
            Copy {{ selectedYear - 1 }}
          </button>
        </div>
      </div>
      
      <!-- Center: Filters -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <Settings class="w-4 h-4 text-gray-500" />
          <select 
            :value="selectedTypeFilter" 
            @change="$emit('update:selectedTypeFilter', $event.target.value)"
            class="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white hover:border-gray-400 focus:border-blue-500"
          >
            <option :value="FILTER_OPTIONS.ALL">All Types</option>
            <option v-for="(label, type) in BUDGET_TYPE_LABELS" :key="type" :value="type">{{ getBudgetTypeIcon(type) }} {{ label }}</option>
          </select>
        </div>
        
        <select 
          :value="selectedCategoryFilter" 
          @change="$emit('update:selectedCategoryFilter', $event.target.value)"
          class="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white hover:border-gray-400 focus:border-blue-500"
        >
          <option :value="FILTER_OPTIONS.ALL">All Categories</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
        </select>
      </div>
      
      <!-- Right: View & Stats -->
      <div class="flex items-center space-x-4">
        <!-- Quick Stats -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">
            <span class="text-green-600 font-semibold">{{ incomeCount }} income</span>
            <span class="mx-2">•</span>
            <span class="text-red-600 font-semibold">{{ expenseCount }} expenses</span>
            <span class="mx-2">•</span>
            <span class="text-purple-600 font-semibold">{{ investmentCount }} investment</span>
          </span>
          
          <!-- View Toggle -->
          <div class="flex items-center bg-gray-100 rounded-md p-0.5">
            <button 
              @click="$emit('update:groupByCategory', false)" 
              :class="[
                'px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                !groupByCategory ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              List
            </button>
            <button 
              @click="$emit('update:groupByCategory', true)" 
              :class="[
                'px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                groupByCategory ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              Grouped
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Filters Row (only show when filters are active) -->
    <div v-if="selectedTypeFilter !== FILTER_OPTIONS.ALL || selectedCategoryFilter !== FILTER_OPTIONS.ALL" class="mt-3 pt-3 border-t border-gray-200">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-medium text-gray-500">Filters:</span>
        <span 
          v-if="selectedTypeFilter !== FILTER_OPTIONS.ALL" 
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ getBudgetTypeIcon(selectedTypeFilter) }}
          <button 
            @click="$emit('update:selectedTypeFilter', FILTER_OPTIONS.ALL)" 
            class="ml-1 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
        <span 
          v-if="selectedCategoryFilter !== FILTER_OPTIONS.ALL" 
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          {{ selectedCategoryFilter }}
          <button 
            @click="$emit('update:selectedCategoryFilter', FILTER_OPTIONS.ALL)" 
            class="ml-1 text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </span>
        <button 
          @click="$emit('clear-filters')" 
          class="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, Copy, Settings } from 'lucide-vue-next'

// Import constants and utilities
import { BUDGET_TYPES, BUDGET_TYPE_LABELS, FILTER_OPTIONS } from '@/constants/budgetConstants.js'
import { getBudgetTypeIcon } from '@/utils/budgetUtils.js'

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
  selectedTypeFilter: {
    type: String,
    required: true
  },
  selectedCategoryFilter: {
    type: String,
    required: true
  },
  uniqueCategories: {
    type: Array,
    required: true
  },
  canCopyFromPreviousYear: {
    type: Boolean,
    default: false
  },
  groupByCategory: {
    type: Boolean,
    required: true
  },
  budgetItems: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'update:selectedYear',
  'update:selectedTypeFilter',
  'update:selectedCategoryFilter',
  'update:groupByCategory',
  'add-year',
  'copy-from-previous-year',
  'clear-filters'
])

// Computed properties for quick stats
const incomeCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === BUDGET_TYPES.INCOME).length
})

const expenseCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === BUDGET_TYPES.EXPENSE).length
})

const investmentCount = computed(() => {
  return (props.budgetItems || []).filter(b => b && b.type === BUDGET_TYPES.INVESTMENT).length
})
</script> 