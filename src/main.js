import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import views
import Dashboard from './views/Dashboard.vue'
import BudgetPlanner from './views/BudgetPlanner.vue'
import Income from './views/Income.vue'
import Expenses from './views/Expenses.vue'
import Family from './views/Family.vue'
import Investments from './views/Investments.vue'
import Zakat from './views/Zakat.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/planner', name: 'BudgetPlanner', component: BudgetPlanner },
  { path: '/income', name: 'Income', component: Income },
  { path: '/expenses', name: 'Expenses', component: Expenses },
  { path: '/family', name: 'Family', component: Family },
  { path: '/investments', name: 'Investments', component: Investments },
  { path: '/zakat', name: 'Zakat', component: Zakat },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app') 