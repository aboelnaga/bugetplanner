<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  )

const props = defineProps({
    projections: {
      type: Array,
      required: true
    }
  })

const chartData = computed(() => ({
    labels: props.projections.map((item) => `${item.year}`),
    datasets: [
      {
        label: 'Total Income',
        data: props.projections.map((item) => item.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 2
      },
      {
        label: 'Total Spending',
        data: props.projections.map((item) => item.spending),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 2
      },
      {
        label: 'Total Savings',
        data: props.projections.map((item) => item.totalSavings),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2
      }
    ]
  }))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback (value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              notation: 'compact'
            }).format(value)
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label (context) {
            const label = context.dataset.label || ''
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(context.parsed.y)
            return `${label}: ${value}`
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }
</script>

<template>
  <div class="relative h-80">
    <Bar
      ref="chart"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
