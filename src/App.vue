<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar Navigation -->
    <nav class="bg-white shadow-lg w-64 fixed h-full overflow-y-auto">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-primary-600">Budgrt</h1>
        <p class="text-sm text-gray-500 mt-1">Personal Budget Manager</p>
      </div>
      
      <div class="px-4 pb-6">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          :class="[
            'flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors',
            $route.name === item.name
              ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 ml-64 overflow-y-auto">
      <div class="p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { BarChart3, Calendar, DollarSign, CreditCard, Users, TrendingUp, Calculator } from 'lucide-vue-next'

const navigation = [
  { name: 'Dashboard', label: 'Dashboard', path: '/', icon: BarChart3 },
  { name: 'BudgetPlanner', label: 'Budget Planner', path: '/planner', icon: Calendar },
  { name: 'Income', label: 'Income', path: '/income', icon: DollarSign },
  { name: 'Expenses', label: 'Expenses', path: '/expenses', icon: CreditCard },
  { name: 'Family', label: 'Family Budget', path: '/family', icon: Users },
  { name: 'Investments', label: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Zakat', label: 'Zakat Calculator', path: '/zakat', icon: Calculator },
]
</script> 