import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import App from './App.vue'
import './style.css'

// Import views
// import Dashboard from './views/Dashboard.vue'
import BudgetPlanner from './views/BudgetPlanner.vue'
import BudgetActionCenter from './views/BudgetActionCenter.vue'
import Transactions from './views/Transactions.vue'
import Banking from './views/Banking.vue'
// import Income from './views/Income.vue'
// import Expenses from './views/Expenses.vue'
// import Family from './views/Family.vue'
// import Investments from './views/Investments.vue'
// import Zakat from './views/Zakat.vue'
import Auth from './views/Auth.vue'

const routes = [
  { path: '/auth', name: 'Auth', component: Auth },
  // { 
  //   path: '/', 
  //   name: 'Dashboard', 
  //   component: Dashboard,
  //   meta: { requiresAuth: true }
  // },
  { 
    path: '/', 
    name: 'BudgetPlanner', 
    component: BudgetPlanner,
    meta: { requiresAuth: true }
  },
  { 
    path: '/action-center', 
    name: 'BudgetActionCenter', 
    component: BudgetActionCenter,
    meta: { requiresAuth: true }
  },
  { 
    path: '/transactions', 
    name: 'Transactions', 
    component: Transactions,
    meta: { requiresAuth: true }
  },
  { 
    path: '/banking', 
    name: 'Banking', 
    component: Banking,
    meta: { requiresAuth: true }
  },
  // { 
  //   path: '/income', 
  //   name: 'Income', 
  //   component: Income,
  //   meta: { requiresAuth: true }
  // },
  // { 
  //   path: '/expenses', 
  //   name: 'Expenses', 
  //   component: Expenses,
  //   meta: { requiresAuth: true }
  // },
  // { 
  //   path: '/family', 
  //   name: 'Family', 
  //   component: Family,
  //   meta: { requiresAuth: true }
  // },
  // { 
  //   path: '/investments', 
  //   name: 'Investments', 
  //   component: Investments,
  //   meta: { requiresAuth: true }
  // },
  // { 
  //   path: '/zakat', 
  //   name: 'Zakat', 
  //   component: Zakat,
  //   meta: { requiresAuth: true }
  // },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.user && !authStore.loading) {
    await authStore.initAuth()
  }
  
  // Wait a bit for auth to settle if still loading
  if (authStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app') 