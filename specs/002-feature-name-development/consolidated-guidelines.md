# Consolidated Development Guidelines for Budgrt

**Created**: 2025-01-27  
**Status**: Complete  
**Phase**: Consolidation (T026-T030)

## Overview
This document consolidates all development guidelines, patterns, and best practices extracted from the Budgrt codebase. It serves as a single source of truth for AI assistance and human developers.

## Technology Stack

### Core Technologies
- **Vue.js 3.3.4**: Composition API preferred, Options API acceptable for simple components
- **PrimeVue 4.3.7**: Primary UI component library with extensive component set
- **PrimeIcons 7.0.0**: Icon library for all icon needs
- **Tailwind CSS 3.3.3**: Utility-first CSS framework for rapid styling
- **Supabase 2.50.5**: Backend-as-a-Service with PostgreSQL and real-time features
- **Pinia 2.1.6**: State management with composition API stores
- **Chart.js 4.4.0**: Data visualization for financial charts
- **TypeScript 5.2.2**: Optional type safety for complex logic

### Package Documentation References
- [Vue.js 3 Documentation](https://vuejs.org/)
- [PrimeVue Documentation](https://primevue.org/)
- [PrimeIcons Documentation](https://primevue.org/icons/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## Solo Development Guidelines (Pragmatic Approach)

### UI Components Strategy
- **PrimeVue First**: Always check PrimeVue components before creating custom ones
- **Component Categories**:
  - Form: InputText, Dropdown, Calendar, Checkbox, RadioButton
  - Data Display: DataTable, Card, Panel, Accordion, Tag, Skeleton
  - Navigation: Menu, TabView, Breadcrumb, Paginator
  - Overlay: Dialog, Sidebar, Tooltip, Toast, ConfirmDialog
  - Layout: Divider, Splitter, ScrollPanel
- **Icons**: Use PrimeIcons exclusively, avoid custom icon libraries
- **Styling**: Use Tailwind CSS classes, avoid custom CSS unless no Tailwind equivalent

### Vue.js Development Patterns
- **Composition API**: Preferred for complex components and logic reuse
- **Composables**: Extract reusable logic into composables with clear interfaces
- **Reactive State**: Use `ref()` for primitives, `computed()` for derived state
- **Props/Emits**: Use `defineProps()` and `defineEmits()` for component communication
- **Lifecycle Hooks**: Use `onMounted()`, `onUnmounted()` for component lifecycle

### Supabase Integration Patterns
- **API Layer**: Organize API functions by feature (budgetAPI, transactionAPI, accountAPI)
- **Real-time Subscriptions**: Use consistent channel naming and user filtering
- **Error Handling**: Centralized error handling with user-friendly messages
- **Authentication**: Row Level Security (RLS) with user_id filtering
- **Client Configuration**: Centralized client setup with proper auth configuration

### State Management (Pinia)
- **Store Structure**: Use composition API with `defineStore()`
- **Cross-Store Communication**: Import other stores for data access
- **Reactive State**: Use `ref()` and `computed()` for reactive data
- **Actions**: Async actions for API calls with proper error handling

### Error Handling Strategy
- **Centralized Handler**: Use `useErrorHandler` composable for consistent error handling
- **Error Classification**: Network, authentication, validation, permission, not found, server errors
- **User Feedback**: Toast notifications with recovery actions
- **Recovery Logic**: Exponential backoff for retryable errors

### Testing Strategy (Pragmatic)
- **Manual Testing**: Test in browser first, add automated tests for critical features only
- **E2E Testing**: Use Playwright for end-to-end testing of critical user flows
- **Test Structure**: Organize tests with helpers and utilities
- **Test Data**: Use cleanup utilities for test data management

### Performance Guidelines
- **Optimize When Needed**: Avoid premature optimization, optimize only when performance issues arise
- **Lazy Loading**: Use dynamic imports for route components
- **Real-time Subscriptions**: Use appropriate filters to minimize unnecessary updates
- **Component Reusability**: Create reusable components to reduce code duplication

### Code Quality Standards
- **Readability**: Focus on readable and maintainable code over perfection
- **Documentation**: Inline comments for complex logic, README for setup
- **Consistency**: Follow existing patterns in the codebase
- **Simplicity**: Start simple, add complexity only when needed

## Islamic Finance Compliance

### Core Principles
- **Zakat Calculations**: Follow proper Hawl (lunar year) requirements
- **Nisab Thresholds**: Use Islamic law-compliant Nisab calculations
- **School of Thought**: Support multiple Islamic schools (Hanafi, Maliki, Shafi'i, Hanbali)
- **Asset Eligibility**: Validate assets for Zakat eligibility

### Implementation Patterns
```javascript
// Islamic Law Compliance
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
```

## Code Patterns

### Component Structure
```javascript
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/store.js'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'data-changed'])

// State
const loading = ref(false)
const error = ref(null)

// Computed
const computedValue = computed(() => {
  return props.modelValue ? 'active' : 'inactive'
})

// Methods
const handleAction = async () => {
  loading.value = true
  try {
    // Action logic
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
```

### Composable Pattern
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
    loading.value = true
    try {
      // Async logic
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
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

### Supabase API Pattern
```javascript
export const apiName = {
  async getItems(userId, year) {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
    
    if (error) throw error
    return data
  }
}
```

### Real-time Subscription Pattern
```javascript
export const subscribeToChanges = (userId, year, callback) => {
  return supabase
    .channel('channel_name')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'table_name',
        filter: `user_id=eq.${userId} AND year=eq.${year}`
      },
      callback
    )
    .subscribe()
}
```

### Error Handling Pattern
```javascript
import { useErrorHandler } from '@/composables/useErrorHandler.js'

const { handleError } = useErrorHandler(toast)

const performAction = async () => {
  try {
    // Action logic
  } catch (error) {
    await handleError(error, 'Action Name', {
      showNotification: true,
      logError: true
    })
  }
}
```

## Development Workflow

### 1. Check PrimeVue First
Look for existing PrimeVue component before creating custom ones.

### 2. Use Tailwind Classes
Prefer utility classes over custom CSS.

### 3. Follow Existing Patterns
Look at similar components in codebase for consistency.

### 4. Test Manually
Test in browser before adding automated tests.

### 5. Keep It Simple
Don't over-engineer for future requirements.

### 6. Document Complex Logic
Add inline comments for complex business logic.

## File Organization

### Component Structure
```
src/
├── components/          # Reusable UI components
├── composables/         # Reusable logic composables
├── stores/             # Pinia stores for state management
├── lib/                # External library configurations
├── views/              # Page components
├── constants/          # Application constants
└── utils/              # Utility functions
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BudgetDataTable.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useBudgetCalculations.js`)
- **Stores**: camelCase with `use` prefix (e.g., `useBudgetStore.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BUDGET_TYPES`)

## Best Practices Summary

### Do's
- ✅ Use PrimeVue components when available
- ✅ Use Tailwind CSS classes for styling
- ✅ Extract reusable logic into composables
- ✅ Use centralized error handling
- ✅ Follow existing patterns in codebase
- ✅ Test manually in browser first
- ✅ Keep components simple and focused
- ✅ Use TypeScript for complex logic

### Don'ts
- ❌ Create custom components when PrimeVue equivalent exists
- ❌ Use custom CSS when Tailwind classes available
- ❌ Reinvent existing patterns
- ❌ Over-engineer for future requirements
- ❌ Skip manual testing
- ❌ Create overly complex components
- ❌ Ignore Islamic finance compliance requirements

## AI Assistance Guidelines

When providing AI assistance for this project:

1. **Always check PrimeVue first** for UI components
2. **Use Tailwind CSS classes** for styling
3. **Follow existing patterns** from the codebase
4. **Consider Islamic finance compliance** for financial features
5. **Focus on pragmatic solutions** for solo development
6. **Maintain consistency** with existing code structure
7. **Provide clear, actionable guidance** for implementation

## Conclusion

This consolidated guidelines document provides a comprehensive reference for developing the Budgrt budget planning application. It emphasizes pragmatic solo development practices while maintaining high code quality and Islamic finance compliance. Use this document as the primary reference for all development decisions and AI assistance.
