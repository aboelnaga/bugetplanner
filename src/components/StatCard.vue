<script setup>
import { computed } from 'vue'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calculator,
  ArrowUp,
  ArrowDown
} from 'lucide-vue-next'

const props = defineProps({
  title: String,
  value: String,
  change: String,
  icon: String,
  color: {
    type: String,
    default: 'blue'
  }
})

const iconComponent = computed(() => {
  const icons = {
    DollarSign,
    CreditCard,
    TrendingUp,
    Calculator
  }
  return icons[props.icon] || DollarSign
})

const getIconColor = () => {
  const colors = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600'
  }
  return colors[props.color]
}

const getIconBackgroundColor = () => {
  const colors = {
    green: 'bg-green-100',
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    yellow: 'bg-yellow-100'
  }
  return colors[props.color]
}

const getChangeColor = () => {
  if (!props.change) return 'text-gray-500'
  
  if (props.change.includes('+')) {
    return 'text-green-600'
  } else if (props.change.includes('-')) {
    return 'text-red-600'
  }
  return 'text-gray-600'
}

const getTrendIcon = () => {
  if (!props.change) return null
  
  if (props.change.includes('+')) {
    return ArrowUp
  } else if (props.change.includes('-')) {
    return ArrowDown
  }
  return null
}
</script>

<template>
  <div class="stat-card">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
        <p :class="['text-sm mt-2 flex items-center', getChangeColor()]">
          <component 
            :is="getTrendIcon()" 
            class="w-4 h-4 mr-1" 
            v-if="change && !change.includes('savings')"
          />
          {{ change }}
        </p>
      </div>
      <div :class="['p-3 rounded-lg', getIconBackgroundColor()]">
        <component :is="iconComponent" :class="['w-6 h-6', getIconColor()]" />
      </div>
    </div>
  </div>
</template> 
 