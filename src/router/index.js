import { useAuthStore } from '@/stores/auth.js'
import { createRouter, createWebHistory } from 'vue-router'

// Views
import Auth from '@/views/Auth.vue'
import Banking from '@/views/Banking.vue'
import BudgetActionCenter from '@/views/BudgetActionCenter.vue'
import BudgetPlanner from '@/views/BudgetPlanner.vue'
import CreateInvestment from '@/views/CreateInvestment.vue'
import InvestmentDetails from '@/views/InvestmentDetails.vue'
import Investments from '@/views/Investments.vue'
import Transactions from '@/views/Transactions.vue'
import Zakat from '@/views/Zakat.vue'

const routes = [
  { path: '/auth', name: 'Auth', component: Auth },
  { path: '/', name: 'BudgetPlanner', component: BudgetPlanner, meta: { requiresAuth: true } },
  { path: '/action-center', name: 'BudgetActionCenter', component: BudgetActionCenter, meta: { requiresAuth: true } },
  { path: '/transactions', name: 'Transactions', component: Transactions, meta: { requiresAuth: true } },
  { path: '/banking', name: 'Banking', component: Banking, meta: { requiresAuth: true } },
  { path: '/investments', name: 'Investments', component: Investments, meta: { requiresAuth: true } },
  { path: '/investments/create', name: 'CreateInvestment', component: CreateInvestment, meta: { requiresAuth: true } },
  { path: '/investments/:id', name: 'InvestmentDetails', component: InvestmentDetails, meta: { requiresAuth: true } },
  { path: '/zakat', name: 'Zakat', component: Zakat, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.loading) {
    await authStore.initAuth()
  }

  if (authStore.loading) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router


