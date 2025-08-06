<template>
  <tr class="hover:bg-gray-50 transition-colors duration-200 border-t-2 border-gray-200">
    <!-- Budget Item Info Cell -->
    <td class="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray-100">
      <div class="space-y-1">
        <!-- Budget Name -->
        <div class="font-semibold text-gray-900 text-sm leading-tight truncate">
            Unlinked Transactions
        </div>
        
        <!-- Category -->
        <div class="text-xs text-gray-600 truncate">No linked budget</div>
        
        <!-- Secondary Info -->
        <div class="flex items-center space-x-4 text-xs">
          <!-- Type Badge -->
          
          <!-- Transaction Count -->
          <div class="flex items-center text-gray-500">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-xs">{{ unlinkedTransactionCount }} transactions</span>
          </div>
        </div>
      </div>
    </td>

    <!-- Previous Year Column -->
    <td class="px-3 py-4 text-center border-r border-gray-200 bg-gray-50">
      <div class="text-gray-400 font-normal">—</div>
    </td>

    <!-- Monthly Amount Cells -->
    <td v-for="(month, index) in months" :key="month" 
        :class="[
          'px-3 py-4 text-center border-r border-gray-100',
          selectedYear === currentYear && index === currentMonth ? 'bg-sky-100' : ''
        ]">
      <div class="relative">
        <div class="text-sm" >
          <div v-if="calculateUnlinkedTransactionsByMonth(index) !== 0">
            <BaseTooltip :content="getUnlinkedTransactionsTooltip(index)" position="top">
              <div class="font-medium cursor-help" 
                   :class="calculateUnlinkedTransactionsByMonth(index) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatAmountWithSign(calculateUnlinkedTransactionsByMonth(index), formatCurrency) }}
              </div>
            </BaseTooltip>
          </div>
          <div v-else class="text-gray-400 font-normal">—</div>
        </div>
      </div>
    </td>

    <!-- Yearly Total Cell -->
    <td class="border-l-2 border-gray-150 text-sm sticky right-32 bg-white z-20">
      <div v-if="calculateUnlinkedTransactionsTotal() !== 0">
        <BaseTooltip :content="getUnlinkedTransactionsTotalTooltip()" position="top">
          <div class="font-medium cursor-help" 
               :class="calculateUnlinkedTransactionsTotal() > 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatAmountWithSign(calculateUnlinkedTransactionsTotal(), formatCurrency) }}
          </div>
        </BaseTooltip>
      </div>
      <span v-else class="text-gray-400 font-normal">—</span>
    </td>

    <!-- Actions Cell -->
    <td class="px-4 py-4 text-center sticky right-0 bg-white z-20 border-l border-gray-100">
      <div class="flex justify-center space-x-1">
        <button @click="$emit('view-transactions')" 
                title="View unlinked transactions"
                aria-label="View unlinked transactions"
                class="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                data-testid="view-unlinked-transactions-btn">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import BaseTooltip from './BaseTooltip.vue'
import { useBudgetTableRow } from '@/composables/useBudgetTableRow.js'

// Props
const props = defineProps({
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
  calculateUnlinkedTransactionsByMonth: {
    type: Function,
    required: true
  },
  calculateUnlinkedTransactionsTotal: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  unlinkedTransactions: {
    type: Array,
    required: true
  }
})

// Use budget table row composable for formatting
const { formatAmountWithSign } = useBudgetTableRow(computed(() => ({ type: 'unlinked' })))

// Computed
const unlinkedTransactionCount = computed(() => props.unlinkedTransactions.length)

// Methods
const getUnlinkedTransactionsTooltip = (monthIndex) => {
  const monthTransactions = props.unlinkedTransactions.filter(transaction => {
    const transactionMonth = new Date(transaction.date).getMonth()
    return transactionMonth === monthIndex
  })
  
  if (monthTransactions.length === 0) {
    return 'No unlinked transactions for this month'
  }
  
  const total = monthTransactions.reduce((sum, transaction) => {
    return sum + (parseFloat(transaction.amount) || 0)
  }, 0)
  
  const transactionList = monthTransactions
    .slice(0, 5) // Show first 5 transactions
    .map(transaction => {
      const amount = parseFloat(transaction.amount) || 0
      const sign = amount >= 0 ? '+' : ''
      return `• ${transaction.description || 'No description'}: ${sign}${props.formatCurrency(amount)}`
    })
    .join('<br>')
  
  const moreText = monthTransactions.length > 5 ? `<br>... and ${monthTransactions.length - 5} more` : ''
  
  return `Unlinked Transactions for ${props.months[monthIndex]}<br>` +
         `Total: ${props.formatCurrency(total)}<br><br>` +
         transactionList + moreText
}

const getUnlinkedTransactionsTotalTooltip = () => {
  if (props.unlinkedTransactions.length === 0) {
    return 'No unlinked transactions for this year'
  }
  
  const total = props.unlinkedTransactions.reduce((sum, transaction) => {
    return sum + (parseFloat(transaction.amount) || 0)
  }, 0)
  
  const transactionList = props.unlinkedTransactions
    .slice(0, 5) // Show first 5 transactions
    .map(transaction => {
      const amount = parseFloat(transaction.amount) || 0
      const sign = amount >= 0 ? '+' : ''
      return `• ${transaction.description || 'No description'}: ${sign}${props.formatCurrency(amount)}`
    })
    .join('<br>')
  
  const moreText = props.unlinkedTransactions.length > 5 ? `<br>... and ${props.unlinkedTransactions.length - 5} more` : ''
  
  return `Unlinked Transactions for ${props.selectedYear}<br>` +
         `Total: ${props.formatCurrency(total)}<br><br>` +
         transactionList + moreText
}

// Emits
const emit = defineEmits(['view-transactions'])
</script> 