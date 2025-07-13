<template>
  <tr class="hover:bg-gray-50">
    <!-- Budget Item Info Cell -->
    <td class="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
      <div>
        <div class="flex items-center">
          <div class="font-semibold">{{ budget.name }}</div>
          <span :class="[
            'ml-2 px-2 py-1 text-xs rounded-full flex items-center',
            budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            <TrendingUp v-if="budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming')" class="w-3 h-3 mr-1" />
            <TrendingDown v-else class="w-3 h-3 mr-1" />
            {{ budget.type === 'income' ? 'Income' : 
               budget.type === 'investment' ? 'Investment' : 'Expense' }}
          </span>
        </div>
        <div class="text-xs text-gray-500">{{ budget.category }}</div>
        <div class="text-xs text-blue-600 flex items-center">
          <Repeat class="w-3 h-3 mr-1" />
          {{ budget.recurrence }}
        </div>
        <div v-if="budget.startMonth && budget.startMonth > 0 && budget.startMonth < months.length" class="text-xs text-orange-600 flex items-center">
          <Calendar class="w-3 h-3 mr-1" />
          Starts: {{ months[budget.startMonth] }}
        </div>
      </div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-2 py-4 text-center',
          selectedYear === currentYear && index === currentMonth ? 'bg-blue-100' : ''
        ]">
      <div class="relative">
        <div :class="[
          'w-full text-center py-2 px-2 rounded text-sm min-h-[2rem] flex items-center justify-center',
          selectedYear === currentYear && index < currentMonth ? 
            'bg-gray-100 text-gray-400' :
            selectedYear === currentYear && index === currentMonth ? 
              'bg-blue-50 border border-blue-200 shadow-sm' :
              isScheduledMonth(budget, index) ? 
                (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'bg-green-50' : 'bg-red-50') 
                : 'bg-gray-50',
          getBudgetAmount(budget, index) > 0 ? 
            (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'font-semibold text-green-700' : 'font-semibold text-red-700') 
            : 'text-gray-400'
        ]">
          <span v-if="getBudgetAmount(budget, index) > 0">
            {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(getBudgetAmount(budget, index)) }}
          </span>
          <span v-else class="text-gray-400">—</span>
        </div>
        <div v-if="hasChanges(budget.id, index)" 
             title="This amount has been manually modified"
             class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td :class="[
      'px-4 py-4 text-center font-semibold',
      calculateYearlyTotal(budget) > 0 ? 
        (budget.type === 'income' || (budget.type === 'investment' && budget.investment_direction === 'incoming') ? 'text-green-700' : 'text-red-700') 
        : 'text-gray-400'
    ]">
      <span v-if="calculateYearlyTotal(budget) > 0">
        {{ (budget.type === 'expense' || (budget.type === 'investment' && budget.investment_direction === 'outgoing')) ? '-' : '' }}{{ formatCurrency(calculateYearlyTotal(budget)) }}
      </span>
      <span v-else>—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-4 text-center sticky right-0 bg-white z-10">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('edit-budget', budget)" 
                title="Edit budget settings"
                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
          <Edit class="w-5 h-5" />
        </button>
        <button @click="$emit('duplicate-budget', budget)" 
                title="Duplicate this budget item"
                class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
          <Copy class="w-5 h-5" />
        </button>
        <button @click="$emit('delete-budget', budget.id)" 
                title="Delete budget item"
                class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { Edit, Copy, Trash2, TrendingDown, TrendingUp, Calendar, Repeat } from 'lucide-vue-next'

// Props
const props = defineProps({
  budget: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    required: true
  },
  selectedYear: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  currentMonth: {
    type: Number,
    required: true
  },
  
  // Functions
  isScheduledMonth: {
    type: Function,
    required: true
  },
  getBudgetAmount: {
    type: Function,
    required: true
  },
  hasChanges: {
    type: Function,
    required: true
  },
  calculateYearlyTotal: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget'
])
</script> 