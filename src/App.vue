<template>
  <div v-if="authStore.loading" class="flex h-screen items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>

  <div v-else-if="!authStore.isAuthenticated" class="h-screen">
    <router-view />
  </div>

  <div v-else class="flex h-screen bg-gray-50">
    <!-- Sidebar Navigation -->
    <nav class="bg-white shadow-lg w-64 fixed h-full overflow-y-auto">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-primary-600">Budgrt</h1>
        <p class="text-sm text-gray-500 mt-1">Personal Budget Manager</p>
        
        <!-- User Info -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {{ userInitials }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.user_metadata?.full_name || 'User' }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
            </div>
          </div>
        </div>
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

      <!-- Sign Out Button -->
      <div class="px-4 mt-auto">
        <button
          @click="handleSignOut"
          class="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut class="w-5 h-5 mr-3" />
          Sign Out
        </button>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Calendar, DollarSign, CreditCard, Users, TrendingUp, Calculator, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', label: 'Dashboard', path: '/', icon: BarChart3 },
  { name: 'BudgetPlanner', label: 'Budget Planner', path: '/planner', icon: Calendar },
  { name: 'Income', label: 'Income', path: '/income', icon: DollarSign },
  { name: 'Expenses', label: 'Expenses', path: '/expenses', icon: CreditCard },
  { name: 'Family', label: 'Family Budget', path: '/family', icon: Users },
  { name: 'Investments', label: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Zakat', label: 'Zakat Calculator', path: '/zakat', icon: Calculator },
]

const userInitials = computed(() => {
  const fullName = authStore.user?.user_metadata?.full_name || ''
  return fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
})

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/auth')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

onMounted(() => {
  // Initialize authentication
  authStore.initAuth()
})
</script> 