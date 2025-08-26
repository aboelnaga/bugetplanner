<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  expenses: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => {
  const expenseCategories = []
  const expenseValues = []
  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#10b981', '#f97316',
    '#6366f1', '#84cc16', '#06b6d4', '#e11d48'
  ]

  // Process family expenses
  const familyTotal = Object.values(props.expenses.family || {}).reduce((sum, val) => sum + val, 0)
  if (familyTotal > 0) {
    expenseCategories.push('Family')
    expenseValues.push(familyTotal)
  }

  // Process investment expenses
  const investmentTotal = Object.values(props.expenses.investments || {}).reduce((sum, val) => sum + val, 0)
  if (investmentTotal > 0) {
    expenseCategories.push('Investments')
    expenseValues.push(investmentTotal)
  }

  // Add other major expense categories
  const otherExpenses = [
    { name: 'Apartment Rent', value: props.expenses.apartmentRent },
    { name: 'Gam3iat', value: props.expenses.gam3iat },
    { name: 'Charity', value: props.expenses.charity },
    { name: 'Extra', value: props.expenses.extra },
    { name: 'Zakat', value: props.expenses.zakat },
    { name: 'Gold', value: props.expenses.gold },
    { name: 'Play', value: props.expenses.play }
  ]

  otherExpenses.forEach(expense => {
    if (expense.value > 0) {
      expenseCategories.push(expense.name)
      expenseValues.push(expense.value)
    }
  })

  return {
    labels: expenseCategories,
    datasets: [
      {
        data: expenseValues,
        backgroundColor: colors.slice(0, expenseCategories.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(context.parsed)
          
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  cutout: '60%'
}
</script>

<template>
  <div class="relative h-80">
    <Doughnut
      ref="chart"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template> 