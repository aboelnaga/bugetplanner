# Extraction Findings: Development Patterns from Codebase

**Created**: 2025-01-27
**Status**: Complete
**Phase**: Extraction (T011-T020)

## T011: PrimeVue Component Usage Patterns

### Import Patterns
```javascript
// Direct imports from primevue/[component]
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
```

### Component Categories Used
- **Form Components**: InputText, Select, DatePicker, Textarea, Checkbox, RadioButton
- **Data Display**: DataTable, Card, Panel, Accordion, Tag, Skeleton, Message
- **Navigation**: Menu, TabView, Breadcrumb, Paginator
- **Overlay**: Dialog, Sidebar, Tooltip, Toast, ConfirmDialog
- **Layout**: Divider, Splitter, ScrollPanel
- **Icons**: PrimeIcons for all icon needs

### Usage Patterns
- Consistent prop naming and event handling
- Extensive use of PrimeVue themes and styling
- Integration with Tailwind CSS classes
- Modal components with consistent structure
- Form validation with PrimeVue components

## T012: Vue.js Composition Patterns

### Composable Structure
```javascript
export function useComposableName(params) {
  // State
  const state = ref(initialValue)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const computedValue = computed(() => {
    return state.value.someProperty
  })

  // Methods
  const methodName = async () => {
    // async logic
  }

  // Watchers
  watch(someRef, (newValue) => {
    // side effects
  })

  return {
    // State
    state,
    loading,
    error,

    // Computed
    computedValue,

    // Methods
    methodName
  }
}
```

### Common Patterns
- **Reactive State**: `ref()` for primitive values, `reactive()` for objects
- **Computed Properties**: `computed()` for derived state
- **Lifecycle Hooks**: `onMounted()`, `onUnmounted()`, `onBeforeUnmount()`
- **Watchers**: `watch()` and `watchEffect()` for side effects
- **Props/Emits**: `defineProps()` and `defineEmits()` for component communication

### Composable Examples
- `useBudgetCalculations`: Complex budget calculation logic
- `useErrorHandler`: Centralized error handling
- `useBudgetModals`: Modal state management
- `useIslamicLawCompliance`: Islamic finance compliance
- `useNisabCalculation`: Nisab threshold calculations

## T013: Supabase Integration Patterns

### Client Configuration
```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  },
  global: {
    headers: {
      'X-Client-Info': 'budgrt-vue'
    }
  }
})
```

### API Layer Organization
```javascript
export const budgetAPI = {
  async getBudgetItems(userId, year) {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)

    if (error) throw error
    return data
  }
}
```

### Real-time Subscriptions
```javascript
export const subscribeToBudgetChanges = (userId, year, callback) => {
  return supabase
    .channel('budget_changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'budget_items',
        filter: `user_id=eq.${userId} AND year=eq.${year}`
      },
      callback
    )
    .subscribe()
}
```

### Error Handling Pattern
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)

if (error) throw error
return data
```

## T014: Pinia Store Patterns

### Store Structure
```javascript
export const useStoreName = defineStore('storeName', () => {
  // Dependencies
  const otherStore = useOtherStore()

  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const computedValue = computed(() => {
    return items.value.filter(item => item.active)
  })

  // Actions
  const loadItems = async (params) => {
    loading.value = true
    try {
      const data = await api.getItems(params)
      items.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    items,
    loading,
    error,

    // Computed
    computedValue,

    // Actions
    loadItems
  }
})
```

### Cross-Store Communication
- Stores importing other stores for data access
- Shared state through store composition
- Centralized API calls in stores

## T015: Error Handling Patterns

### Centralized Error Handler
```javascript
export function useErrorHandler(toastFunction = null) {
  const errors = ref([])
  const isHandlingError = ref(false)

  const handleError = async (error, context = '', options = {}) => {
    const errorType = classifyError(error)
    const severity = getErrorSeverity(errorType)
    const message = getErrorMessage(error, errorType)
    const recovery = getRecoveryAction(errorType)

    // Log error
    console.error(`Error in ${context}:`, error)

    // Show notification
    if (toastFunction) {
      toastFunction({ severity, summary: `Error in ${context}`, detail: message })
    }

    return { errorType, severity, message, recovery }
  }

  return { handleError, errors, isHandlingError }
}
```

### Error Classification
- **Network Errors**: Connection issues, fetch failures
- **Authentication Errors**: Auth failures, unauthorized access
- **Validation Errors**: Input validation failures
- **Permission Errors**: Access denied
- **Not Found Errors**: Resource not found
- **Server Errors**: Backend server issues

### Recovery Actions
- Retry with exponential backoff
- User-friendly error messages
- Recovery action suggestions
- Toast notifications for user feedback

## T016: Testing Patterns

### E2E Testing with Playwright
```typescript
test('budget creation flow', async ({ page }) => {
  await page.goto('/budget')
  await page.click('[data-testid="add-budget-button"]')
  await page.fill('[data-testid="budget-name"]', 'Test Budget')
  await page.click('[data-testid="save-budget"]')
  await expect(page.locator('[data-testid="budget-item"]')).toBeVisible()
})
```

### Test Structure
- Organized test files with helpers and utilities
- API testing with Supabase cleanup helpers
- Authentication testing with helper functions
- Test data management with cleanup utilities

## T017: Islamic Finance Compliance Patterns

### Islamic Law Compliance
```javascript
export function useIslamicLawCompliance() {
  const ISLAMIC_SCHOOLS = {
    HANAFI: 'hanafi',
    MALIKI: 'maliki',
    SHAFII: 'shafii',
    HANBALI: 'hanbali'
  }

  const NISAB_THRESHOLDS = {
    [ISLAMIC_SCHOOLS.HANAFI]: {
      gold: 85, // grams
      silver: 595, // grams
      preference: 'silver'
    }
  }

  const validateNisabCalculation = (goldPrice, silverPrice) => {
    // Validation logic
  }

  return {
    ISLAMIC_SCHOOLS,
    NISAB_THRESHOLDS,
    validateNisabCalculation
  }
}
```

### Zakat Calculation Patterns
- Nisab threshold calculations
- Hawl (lunar year) requirements
- Islamic school of thought compliance
- Zakat rate calculations
- Asset eligibility validation

## T018: Chart.js Usage Patterns

### Chart Integration
```javascript
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// Chart configuration
const chartConfig = {
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'Income',
      data: incomeData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
}
```

### Chart Components
- Expense breakdown charts
- Monthly trend charts
- Projection charts
- Financial visualization components

## T019: TypeScript Usage Patterns

### Type Definitions
```typescript
interface BudgetItem {
  id: string
  name: string
  type: 'income' | 'expense' | 'investment'
  category: string
  amounts: number[]
  actual_amounts: number[]
  year: number
  user_id: string
}
```

### Type Safety
- Interface definitions for data structures
- Type annotations for function parameters
- Generic types for reusable functions
- Optional TypeScript usage (not enforced)

## T020: Routing and Navigation Patterns

### Router Configuration
```javascript
const routes = [
  {
    path: '/budget',
    name: 'BudgetPlanner',
    component: () => import('@/views/BudgetPlanner.vue')
  }
]
```

### Navigation Patterns
- Programmatic navigation with `router.push()`
- Route parameters and query strings
- Navigation guards for authentication
- Layout components for consistent UI

## Summary of Extracted Patterns

### Key Patterns Identified
1. **PrimeVue Components**: Extensive use with consistent import patterns
2. **Vue.js Composition**: Well-structured composables with clear separation of concerns
3. **Supabase Integration**: Centralized API layer with real-time subscriptions
4. **Pinia Stores**: Composition API stores with cross-store communication
5. **Error Handling**: Centralized error handling with user feedback
6. **Testing**: E2E testing with Playwright and test utilities
7. **Islamic Finance**: Comprehensive compliance patterns for Zakat calculations
8. **Chart.js**: Financial visualization with Chart.js integration
9. **TypeScript**: Optional type safety with interface definitions
10. **Routing**: Standard Vue Router patterns with navigation guards

### Missing Patterns to Add
1. **Solo Development Guidelines**: Pragmatic rules for fast iteration
2. **Performance Optimization**: Guidelines for efficient development
3. **Code Quality**: Standards for maintainable code
4. **Documentation**: Inline documentation patterns
5. **Testing Strategy**: Manual vs automated testing guidelines

### Next Steps
- Analyze extracted patterns for best practices
- Create consolidated guidelines document
- Update .cursorrules and constitution.md files
- Add pragmatic solo development rules
