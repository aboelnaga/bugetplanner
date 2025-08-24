<template>
  <div class="card">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-blue-600">New DataTable Implementation (Testing)</h3>
    </div>
    
    <!-- DataTable with Column Groups -->
    <DataTable 
      :value="flattenedBudgetData" 
      :loading="loading"
      tableStyle=""
      scrollable
      scrollHeight="900px"
      class="budget-datatable"
      showGridlines
    >
      <!-- Column Groups Header -->
      <ColumnGroup type="header">
        <Row>
          <Column header="Budget Item" :rowspan="3" frozen alignFrozen="left" />
          <Column :header="`PY ${selectedYear - 1}`" :rowspan="3" />
          <Column header="Monthly Budget" :colspan="12" />
          <Column header="Total" :rowspan="3" frozen alignFrozen="right" />
          <Column header="Actions" :rowspan="3" frozen alignFrozen="right" />
        </Row>
        <Row>
          <Column v-for="month in months" :key="month" :header="month" />
        </Row>
        <Row>
          <Column v-for="month in months" :key="month" :header="getMonthHeaderContent(month)" />
        </Row>
      </ColumnGroup>

              <!-- Budget Item Column -->
        <Column field="name" frozen alignFrozen="left" style="z-index: 1;">
          <template #body="slotProps">
            <div class="space-y-1">
              <!-- Budget Name -->
              <div class="font-semibold text-sm leading-tight truncate">
                {{ slotProps.data.name }}
              </div>
              
                              <!-- Category -->
                <div class="text-xs truncate text-muted-color">
                  {{ slotProps.data.category }}
                </div>
              
              <!-- Secondary Info: Type and Special Indicators -->
              <div class="flex items-center space-x-4 text-xs">
                <!-- Type Badge -->
                <Tag 
                  :icon="getTypeIcon(slotProps.data)"
                  :severity="getTypeSeverity(slotProps.data)"
                  :value="getTypeLabel(slotProps.data.type)"
                  class="text-xs"
                />
                
                                  <!-- Virtual Item Indicator -->
                  <div v-if="slotProps.data.is_virtual" class="flex items-center text-muted-color">
                    <i class="pi pi-plus-circle text-xs mr-1"></i>
                    <span class="text-xs">{{ getVirtualItemLabel(slotProps.data) }}</span>
                  </div>
                
                <!-- Multi-Year Indicator -->
                <div v-if="slotProps.data.is_multi_year" class="flex items-center text-primary-600">
                  <i class="pi pi-calendar text-xs mr-1"></i>
                  <span class="text-xs">{{ slotProps.data.start_year }}-{{ slotProps.data.end_year }}</span>
                </div>
                
                <!-- Linked Investment Indicator -->
                <div v-if="slotProps.data.linked_investment_id" class="flex items-center text-primary-500">
                  <i class="pi pi-link text-xs mr-1"></i>
                  <span class="text-xs">Linked</span>
                </div>
              </div>
            </div>
          </template>
        </Column>

      <!-- Previous Year Column -->
              <Column field="previousYear" style="min-width: 120px">
          <template #body="slotProps">
            <div v-if="getPreviousYearAmount(slotProps.data) > 0" class="text-center">
              <div class="text-sm cursor-help text-muted-color" :title="getPreviousYearTooltip(slotProps.data)">
                {{ formatCurrency(getPreviousYearAmount(slotProps.data)) }}
              </div>
            </div>
            <div v-else class="text-center font-normal text-muted-color">—</div>
          </template>
        </Column>

      <!-- Monthly Columns -->
      <Column 
        v-for="month in months" 
        :key="month"
        :field="month.toLowerCase()"
        style="min-width: 100px"
        :class="getMonthColumnClass(month)"
      >
                  <template #body="slotProps">
            <div class="text-center relative">
              <div v-if="getSmartDefaultAmount(slotProps.data, month) > 0" class="font-medium cursor-help" 
                   :title="getSmartDefaultTooltip(slotProps.data, month)">
                {{ formatAmountWithSign(getSmartDefaultAmount(slotProps.data, month), slotProps.data, formatCurrency) }}
              </div>
              <div v-else class="font-normal text-muted-color">—</div>
            </div>
          </template>
      </Column>

      <!-- Total Column -->
              <Column field="total" frozen alignFrozen="right" style="min-width: 120px; z-index: 1;">
          <template #body="slotProps">
            <div class="text-center">
              <div v-if="slotProps.data.total > 0" class="font-medium">
                {{ formatAmountWithSign(slotProps.data.total, slotProps.data, formatCurrency) }}
              </div>
              <span v-else class="font-normal text-muted-color">—</span>
            </div>
          </template>
        </Column>

      <!-- Actions Column -->
      <Column field="actions" frozen alignFrozen="right" style="min-width: 120px; z-index: 1;">
        <template #body="slotProps">
          <div class="flex justify-center space-x-1">
            <!-- Virtual item actions -->
            <template v-if="slotProps.data.is_virtual">
              <Button 
                @click="$emit('view-transactions')" 
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                text
                rounded
                title="View unlinked transactions"
                aria-label="View unlinked transactions"
                data-testid="view-unlinked-transactions-btn" />
            </template>
            
            <!-- Regular budget item actions -->
            <template v-else>
              <Button 
                @click="$emit('edit-budget', slotProps.data)" 
                icon="pi pi-pencil"
                severity="info"
                size="small"
                text
                rounded
                title="Edit budget item"
                aria-label="Edit budget item"
                data-testid="edit-budget-btn" />
              <Button 
                @click="$emit('duplicate-budget', slotProps.data)" 
                icon="pi pi-copy"
                severity="success"
                size="small"
                text
                rounded
                title="Duplicate budget item"
                aria-label="Duplicate budget item"
                data-testid="duplicate-budget-btn" />
              <Button 
                @click="$emit('delete-budget', slotProps.data.id)" 
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                rounded
                title="Delete budget item"
                aria-label="Delete budget item"
                data-testid="delete-budget-btn" />
            </template>
          </div>
        </template>
      </Column>

      <!-- Smart Footer Summary Rows -->
      <ColumnGroup type="footer">
        <template v-if="showDetailedBreakdown">
          <!-- Income Breakdown -->
          <Row>
            <Column 
              frozen 
              alignFrozen="left" 
              :footerStyle="childRowStyle + 'z-index: 1; border-top: 2px solid var(--surface-border);'"
            >
              <template #footer>
                <div class="ml-6 text-muted-color">Income Total:</div>
              </template>
            </Column>
            <Column 
              :footerStyle="childRowStyle + 'border-top: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getPreviousYearIncomeTotal() }}</template>
            </Column>
            <Column 
              v-for="month in months" 
              :key="month" 
              :footerStyle="childRowStyle + 'border-top: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getMonthlyIncomeTotal(month) }}</template>
            </Column>
            <Column 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1; border-top: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getYearlyIncomeTotal() }}</template>
            </Column>
            <Column 
              footer="" 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1; border-top: 2px solid var(--surface-border);'"
            />
          </Row>
          
          <!-- Expenses Breakdown -->
          <Row>
            <Column 
              frozen 
              alignFrozen="left" 
              :footerStyle="childRowStyle + 'z-index: 1'"
            >
              <template #footer>
                <div class="ml-6 text-muted-color">Expenses Total:</div>
              </template>
            </Column>
            <Column 
              :footerStyle="childRowStyle"
            >
              <template #footer>{{ getPreviousYearExpensesTotal() }}</template>
            </Column>
            <Column 
              v-for="month in months" 
              :key="month" 
              :footerStyle="childRowStyle"
            >
              <template #footer>{{ getMonthlyExpensesTotal(month) }}</template>
            </Column>
            <Column 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1'"
            >
              <template #footer>{{ getYearlyExpensesTotal() }}</template>
            </Column>
            <Column 
              footer="" 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1'"
            />
          </Row>
          
          <template v-if="showDetailedInvestmentBreakdown">
            <!-- Investment Returns -->
            <Row>
                <Column 
                    frozen 
                    alignFrozen="left" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                >
                    <template #footer>
                        <div class="ml-12 text-muted-color">Investment in:</div>
                    </template>
                </Column>
                <Column 
                    :footerStyle="grandchildRowStyle"
                >
                    <template #footer>{{ getPreviousYearInvestmentIncomingTotal() }}</template>
                </Column>
                <Column 
                    v-for="month in months" 
                    :key="month" 
                    :footerStyle="grandchildRowStyle"
                >
                    <template #footer>{{ getMonthlyInvestmentIncomingTotal(month) }}</template>
                </Column>
                <Column 
                    frozen 
                    alignFrozen="right" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                >
                    <template #footer>{{ getYearlyInvestmentIncomingTotal() }}</template>
                </Column>
                <Column 
                    footer="" 
                    frozen 
                    alignFrozen="right" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                />
            </Row>
            
            <!-- Investment Purchases -->
            <Row>
                <Column 
                    frozen 
                    alignFrozen="left" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                >
                    <template #footer>
                        <div class="ml-12 text-muted-color">Investment out:</div>
                    </template>
                </Column>
                <Column 
                    :footerStyle="grandchildRowStyle"
                >
                    <template #footer>{{ getPreviousYearInvestmentOutgoingTotal() }}</template>
                </Column>
                <Column 
                    v-for="month in months" 
                    :key="month" 
                    :footerStyle="grandchildRowStyle"
                >
                    <template #footer>{{ getMonthlyInvestmentOutgoingTotal(month) }}</template>
                </Column>
                <Column 
                    frozen 
                    alignFrozen="right" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                >
                    <template #footer>{{ getYearlyInvestmentOutgoingTotal() }}</template>
                </Column>
                <Column 
                    footer="" 
                    frozen 
                    alignFrozen="right" 
                    :footerStyle="grandchildRowStyle + 'z-index: 1'"
                />
            </Row>
          </template>
          <!-- Net Investment -->
          <Row>
            <Column 
              footer="" 
              frozen 
              alignFrozen="left" 
              :footerStyle="childRowStyle + 'z-index: 1; border-bottom: 2px solid var(--surface-border);'"
            >
              <template #footer>
                <div class="ml-6 flex items-center space-x-2">
                  <Button 
                    @click="showDetailedInvestmentBreakdown = !showDetailedInvestmentBreakdown"
                    :icon="showDetailedInvestmentBreakdown ? 'pi pi-chevron-up' : 'pi pi-chevron-right'"
                    text
                    rounded
                    size="small"
                    severity="secondary"
                    :title="showDetailedInvestmentBreakdown ? 'Hide detailed breakdown' : 'Show detailed breakdown'"
                  />
                  <span class="text-muted-color">Net Investment</span>
                </div>
              </template>
            </Column>
            <Column 
              :footerStyle="childRowStyle + 'border-bottom: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getPreviousYearInvestmentNetTotal() }}</template>
            </Column>
            <Column 
              v-for="month in months" 
              :key="month" 
              :footerStyle="childRowStyle + 'border-bottom: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getMonthlyInvestmentNetTotal(month) }}</template>
            </Column>
            <Column 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1; border-bottom: 2px solid var(--surface-border);'"
            >
              <template #footer>{{ getYearlyInvestmentNetTotal() }}</template>
            </Column>
            <Column 
              footer="" 
              frozen 
              alignFrozen="right" 
              :footerStyle="childRowStyle + 'z-index: 1; border-bottom: 2px solid var(--surface-border);'"
            />
          </Row>
        </template>
        <!-- Core Summary Rows (Always Visible) -->
        <Row>
          <Column 
            frozen 
            alignFrozen="left" 
            :footerStyle="parentRowStyle + 'z-index: 1'"
          >
            <template #footer>
              <div class="flex items-center space-x-2">
                <Button
                  @click="showDetailedBreakdown = !showDetailedBreakdown"
                  :icon="showDetailedBreakdown ? 'pi pi-chevron-up' : 'pi pi-chevron-right'"
                  text
                  rounded
                  severity="secondary"
                  :title="showDetailedBreakdown ? 'Hide detailed breakdown' : 'Show detailed breakdown'"
                />
                <span>Net Balance</span>
              </div>
            </template>
          </Column>
          <Column 
            :footer="getPreviousYearNetTotal()" 
            :footerStyle="parentRowStyle"
          />
          <Column 
            v-for="month in months" 
            :key="month" 
            :footer="getMonthlyNetTotal(month)" 
            :footerStyle="parentRowStyle"
          />
          <Column 
            :footer="getYearlyNetTotal()" 
            frozen 
            alignFrozen="right" 
            :footerStyle="parentRowStyle + 'z-index: 1'"
          />
          <Column 
            footer="" 
            frozen 
            alignFrozen="right" 
            :footerStyle="parentRowStyle + 'z-index: 1'"
          />
        </Row>
        
        <Row>
          <Column 
            footer="Cumulative Savings:" 
            frozen 
            alignFrozen="left" 
            :footerStyle="parentRowStyle"
          />
          <Column 
            :footer="getPreviousYearSavingsTotal()" 
            :footerStyle="parentRowStyle"
          />
          <Column 
            v-for="month in months" 
            :key="month" 
            :footer="getMonthlySavingsTotal(month)" 
            :footerStyle="parentRowStyle"
          />
          <Column 
            :footer="getYearlySavingsTotal()" 
            frozen 
            alignFrozen="right" 
            :footerStyle="parentRowStyle + 'z-index: 1'"
          />
          <Column 
            footer="" 
            frozen 
            alignFrozen="right" 
            :footerStyle="parentRowStyle + 'z-index: 1'"
          />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetDataTable } from '@/composables/useBudgetDataTable.js'
import { MONTHS } from '@/constants/budgetConstants.js'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

// Props
const props = defineProps({
  // State
  loading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    default: null
  },
  budgetItems: {
    type: Array,
    required: true
  },
  selectedYear: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  currentMonth: {
    type: Number,
    required: true
  },
  
  // Functions
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Calculation functions for footer totals
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateGrandTotalIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'edit-budget',
  'duplicate-budget',
  'delete-budget',
  'view-transactions'
])

// Use the composable
const { flattenedBudgetData } = useBudgetDataTable(
  computed(() => props.budgetItems),
  computed(() => props.selectedYear),
  computed(() => props.currentYear),
  computed(() => props.currentMonth)
)

// Footer expansion state
const showDetailedBreakdown = ref(false)

// Footer row styling variables
const parentRowStyle = computed(() => 
  'font-weight: bold; font-size: 1rem;'
)

const childRowStyle = computed(() => 
  'font-weight: 500; background-color: var(--surface-ground); border-top: 1px solid var(--surface-border);'
)

const grandchildRowStyle = computed(() => 
  'font-weight: 500; font-size: 0.875rem; border-top: 1px solid var(--surface-border);'
)
const showDetailedInvestmentBreakdown = ref(false)

// Constants
const months = MONTHS

// Helper functions
const getTypeLabel = (type) => {
  if (type === 'income') return 'Income'
  if (type === 'expense') return 'Expense'
  if (type === 'investment') return 'Investment'
  return 'Unknown'
}

const getTypeIcon = (item) => {
  if (item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) return 'pi pi-arrow-up'
  if (item.type === 'expense' || (item.type === 'investment' && item.investment_direction === 'outgoing')) return 'pi pi-arrow-down'
  return 'pi pi-question'
}

const getTypeSeverity = (item) => {
  if (item.type === 'income' || (item.type === 'investment' && item.investment_direction === 'incoming')) return 'success'
  if (item.type === 'expense' || (item.type === 'investment' && item.investment_direction === 'outgoing')) return 'danger'
  return 'secondary'
}

const getVirtualItemLabel = (budget) => {
  if (budget.is_virtual) {
    if (budget.name === 'Unlinked Income') {
      return 'Unlinked Income'
    } else if (budget.name === 'Unlinked Expenses') {
      return 'Unlinked Expense'
    } else if (budget.name === 'Unlinked Investment Incoming') {
      return 'Unlinked Investment Incoming'
    } else if (budget.name === 'Unlinked Investment Outgoing') {
      return 'Unlinked Investment Outgoing'
    }
  }
  return 'Unlinked'
}

const getMonthColumnClass = (month) => {
  const monthIndex = months.indexOf(month)
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    return 'current-month bg-primary-50 dark:bg-primary-900'
  }
  return ''
}

const getMonthlyAmount = (budget, month) => {
  const monthField = month.toLowerCase()
  return budget[monthField] || 0
}

const formatAmountWithSign = (amount, item, formatCurrency) => {
  if (amount === 0) return formatCurrency(0)
  
  // For income and investment incoming, always show positive
  // For expenses and investment outgoing, always show negative
  if (item.type === 'income') {
    return formatCurrency(Math.abs(amount))
  } else if (item.type === 'expense') {
    return `-${formatCurrency(Math.abs(amount))}`
  } else if (item.type === 'investment') {
    if (item.investment_direction === 'incoming') {
      return formatCurrency(Math.abs(amount))
    } else if (item.investment_direction === 'outgoing') {
      return `-${formatCurrency(Math.abs(amount))}`
    }
  }
  
  // Fallback: show with sign based on amount value
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatCurrency(amount)}`
}

// Smart defaults logic
const getSmartDefaultAmount = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const plannedAmount = getMonthlyAmount(budget, month)
  const actualAmount = budget[month.toLowerCase() + '_actual'] || 0
  
  // For now, just return planned amount (we'll enhance this later)
  return plannedAmount
}

const getSmartDefaultTooltip = (budget, month) => {
  const monthIndex = months.indexOf(month)
  const plannedAmount = getMonthlyAmount(budget, month)
  const actualAmount = budget[month.toLowerCase() + '_actual'] || 0
  
  return `Planned: ${props.formatCurrency(plannedAmount)}<br>Actual: ${props.formatCurrency(actualAmount)}`
}

// Previous year functions (placeholder for now)
const getPreviousYearAmount = (budget) => {
  // This will need to be implemented with actual previous year data
  return 0
}

const getPreviousYearTooltip = (budget) => {
  return 'Previous year data not yet implemented'
}

// Month header content with close month functionality
const getMonthHeaderContent = (month) => {
  const monthIndex = months.indexOf(month)
  
  // Current month indicator
  if (props.selectedYear === props.currentYear && monthIndex === props.currentMonth) {
    return 'Current'
  }
  
  // Month closure status (placeholder for now)
  // This will need to be enhanced with actual closed months data
  return ''
}

// Footer total calculations
const getMonthlyIncomeTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyIncome(monthIndex)
  return total > 0 ? `+${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getMonthlyExpensesTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyExpenses(monthIndex)
  return total > 0 ? `-${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getMonthlyNetTotal = (month) => {
  const monthIndex = months.indexOf(month)
  const total = props.calculateMonthlyTotal(monthIndex)
  const sign = total > 0 ? '+' : ''
  return `${sign}${props.formatCurrency(total)}`
}

const getYearlyIncomeTotal = () => {
  const total = props.calculateGrandTotalIncome()
  return total > 0 ? `+${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getYearlyExpensesTotal = () => {
  const total = props.calculateGrandTotalExpenses()
  return total > 0 ? `-${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getYearlyNetTotal = () => {
  const total = props.calculateGrandTotal()
  const sign = total > 0 ? '+' : ''
  return `${sign}${props.formatCurrency(total)}`
}

// Previous year footer totals
const getPreviousYearIncomeTotal = () => {
  // Placeholder for now - will need to implement with actual previous year data
  return props.formatCurrency(0)
}

const getPreviousYearExpensesTotal = () => {
  // Placeholder for now - will need to implement with actual previous year data
  return props.formatCurrency(0)
}

const getPreviousYearNetTotal = () => {
  // Placeholder for now - will need to implement with actual previous year data
  return props.formatCurrency(0)
}

// Investment Returns (Investment Incoming)
const getMonthlyInvestmentIncomingTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item[monthField] || 0
    }
  })
  return total > 0 ? `+${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getYearlyInvestmentIncomingTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item.total || 0
    }
  })
  return total > 0 ? `+${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getPreviousYearInvestmentIncomingTotal = () => {
  // TODO: Implement previous year investment incoming total
  return props.formatCurrency(0)
}

// Investment Purchases (Investment Outgoing)
const getMonthlyInvestmentOutgoingTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total += item[monthField] || 0
    }
  })
  return total > 0 ? `-${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getYearlyInvestmentOutgoingTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total += item.total || 0
    }
  })
  return total > 0 ? `-${props.formatCurrency(total)}` : props.formatCurrency(total)
}

const getPreviousYearInvestmentOutgoingTotal = () => {
  // TODO: Implement previous year investment outgoing total
  return props.formatCurrency(0)
}

// Cumulative Savings
const getMonthlySavingsTotal = (month) => {
  const monthIndex = months.indexOf(month)
  let cumulativeSavings = 0
  
  // Calculate cumulative savings from start of year up to this month
  for (let i = 0; i <= monthIndex; i++) {
    const monthField = months[i].toLowerCase()
    let monthlyNet = 0
    
    flattenedBudgetData.value.forEach(item => {
      if (item.type === 'income') {
        monthlyNet += item[monthField] || 0
      }
      if (item.type === 'expense') {
        monthlyNet -= item[monthField] || 0
      }
      if (item.type === 'investment') {
        if (item.investment_direction === 'incoming') {
          monthlyNet += item[monthField] || 0
        } else if (item.investment_direction === 'outgoing') {
          monthlyNet -= item[monthField] || 0
        }
      }
    })
    
    cumulativeSavings += monthlyNet
  }
  
  const sign = cumulativeSavings > 0 ? '+' : ''
  return `${sign}${props.formatCurrency(cumulativeSavings)}`
}

const getYearlySavingsTotal = () => {
  // Yearly total is the same as December's cumulative savings
  return getMonthlySavingsTotal('December')
}

const getPreviousYearSavingsTotal = () => {
  // TODO: Implement previous year savings total
  return props.formatCurrency(0)
}

// Net Investment
const getMonthlyInvestmentNetTotal = (month) => {
  const monthField = month.toLowerCase()
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment') {
      if (item.investment_direction === 'incoming') {
        total += item[monthField] || 0
      } else if (item.investment_direction === 'outgoing') {
        total -= item[monthField] || 0
      }
    }
  })
  const sign = total > 0 ? '+' : ''
  return `${sign}${props.formatCurrency(total)}`
}

const getYearlyInvestmentNetTotal = () => {
  let total = 0
  flattenedBudgetData.value.forEach(item => {
    if (item.type === 'investment' && item.investment_direction === 'incoming') {
      total += item.total || 0
    }
    if (item.type === 'investment' && item.investment_direction === 'outgoing') {
      total -= item.total || 0
    }
  })
  const sign = total > 0 ? '+' : ''
  return `${sign}${props.formatCurrency(total)}`
}

const getPreviousYearInvestmentNetTotal = () => {
  // TODO: Implement previous year investment net total
  return props.formatCurrency(0)
}
</script>

<style scoped>
    /* This is a hack to make the footer not sticky */
    :deep(.p-datatable-tfoot) {
    position: relative !important;
    }

    /* Expandable indicator styling */
    :deep(.p-datatable-footer .p-button) {
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    :deep(.p-datatable-footer .p-button:hover) {
      opacity: 1;
    }
</style>
