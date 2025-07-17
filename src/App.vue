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
    <nav 
      :class="[
        'bg-white shadow-lg fixed h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-gray-200',
        isCollapsed ? 'w-14' : 'w-64'
      ]"
    >
      <!-- Header Section -->
      <div :class="isCollapsed ? 'p-3' : 'p-6'">
        <div class="flex items-center justify-between">
          <div v-if="!isCollapsed" class="flex-1">
            <h1 class="text-2xl font-bold text-primary-600">Budgrt</h1>
            <p class="text-sm text-gray-500 mt-1">Personal Budget Manager</p>
          </div>
          <div v-else class="flex-1 flex justify-center">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">B</span>
            </div>
          </div>
        </div>
        
        <!-- User Info -->
        <div :class="[
          'mt-4 rounded-lg transition-all duration-200',
          isCollapsed ? '' : 'py-3 bg-gray-50'
        ]">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {{ userInitials }}
            </div>
            <div v-if="!isCollapsed" class="ml-3 min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user?.user_metadata?.full_name || 'User' }}</p>
              <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Items -->
      <div :class="isCollapsed ? 'px-2' : 'px-4'">
        <div class="space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.path"
            :class="[
              'group relative flex items-center rounded-lg transition-all duration-200',
              isCollapsed ? 'justify-center p-2' : 'px-3 py-2.5',
              $route.name === item.name
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
            :title="isCollapsed ? item.label : ''"
          >
            <component 
              :is="item.icon" 
              :class="[
                'flex-shrink-0 transition-colors',
                isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'
              ]" 
            />
            <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </div>

      <!-- Bottom Section: Sign Out & Toggle -->
      <div :class="[
        'mt-auto',
        isCollapsed ? 'px-2 pb-4' : 'px-4 pb-6'
      ]">
        <!-- Sign Out Button -->
        <button
          @click="handleSignOut"
          :class="[
            'group relative w-full flex items-center rounded-lg transition-all duration-200 mb-2',
            isCollapsed ? 'justify-center p-2' : 'px-3 py-2.5',
            'text-red-600 hover:bg-red-50 hover:text-red-700'
          ]"
          title="Sign Out"
        >
          <LogOut 
            :class="[
              'flex-shrink-0 transition-colors',
              isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'
            ]" 
          />
          <span v-if="!isCollapsed" class="text-sm font-medium">Sign Out</span>
        </button>

        <!-- Toggle Button -->
        <button
          @click="toggleSidebar"
          :class="[
            'w-full flex items-center rounded-lg transition-all duration-200',
            isCollapsed ? 'justify-center p-2' : 'px-3 py-2.5',
            'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeft v-if="!isCollapsed" :class="['flex-shrink-0 transition-colors', 'w-5 h-5 mr-3']" />
          <ChevronRight v-else :class="['flex-shrink-0 transition-colors', 'w-5 h-5']" />
          <span v-if="!isCollapsed" class="text-sm font-medium">Collapse</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main 
      :class="[
        'flex-1 overflow-y-auto transition-all duration-300 ease-in-out',
        isCollapsed ? 'ml-14' : 'ml-64'
      ]"
    >
      <div class="p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Calendar, DollarSign, CreditCard, Users, TrendingUp, Calculator, Receipt, LogOut, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const isCollapsed = ref(false)

const navigation = [
  { name: 'BudgetPlanner', label: 'Budget Planner', path: '/', icon: Calendar },
  { name: 'BudgetActionCenter', label: 'Action Center', path: '/action-center', icon: Receipt },
  // { name: 'Dashboard', label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  // { name: 'Income', label: 'Income', path: '/income', icon: DollarSign },
  // { name: 'Expenses', label: 'Expenses', path: '/expenses', icon: CreditCard },
  // { name: 'Family', label: 'Family Budget', path: '/family', icon: Users },
  // { name: 'Investments', label: 'Investments', path: '/investments', icon: TrendingUp },
  // { name: 'Zakat', label: 'Zakat Calculator', path: '/zakat', icon: Calculator },
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

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // Optionally save to localStorage for persistence
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

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
  
  // Restore sidebar state from localStorage
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
})
</script> 