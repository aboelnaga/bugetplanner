<template>
  <!-- Income Summary -->
  <BudgetSummaryIncome
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :has-income-data="hasIncomeData"
    :has-investment-incoming-data="hasInvestmentIncomingData"
    :calculate-monthly-income="calculateMonthlyIncome"
    :calculate-monthly-investment-incoming="calculateMonthlyInvestmentIncoming"
    :calculate-grand-total-income="calculateGrandTotalIncome"
    :calculate-grand-total-investment-incoming="calculateGrandTotalInvestmentIncoming"
    :format-currency="formatCurrency" />

  <!-- Expenses Summary -->
  <BudgetSummaryExpenses
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :has-expense-data="hasExpenseData"
    :has-investment-outgoing-data="hasInvestmentOutgoingData"
    :calculate-monthly-expenses="calculateMonthlyExpenses"
    :calculate-monthly-investment-outgoing="calculateMonthlyInvestmentOutgoing"
    :calculate-grand-total-expenses="calculateGrandTotalExpenses"
    :calculate-grand-total-investment-outgoing="calculateGrandTotalInvestmentOutgoing"
    :format-currency="formatCurrency" />

  <!-- Net Summary -->
  <BudgetSummaryNet
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-investment-data="hasInvestmentData"
    :has-any-data="hasAnyData"
    :calculate-monthly-total="calculateMonthlyTotal"
    :calculate-monthly-investment-net="calculateMonthlyInvestmentNet"
    :calculate-grand-total="calculateGrandTotal"
    :calculate-grand-total-investment-net="calculateGrandTotalInvestmentNet"
    :format-currency="formatCurrency" />
</template>

<script setup>
import BudgetSummaryIncome from './BudgetSummaryIncome.vue'
import BudgetSummaryExpenses from './BudgetSummaryExpenses.vue'
import BudgetSummaryNet from './BudgetSummaryNet.vue'

// Props
const props = defineProps({
  months: {
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
  selectedTypeFilter: {
    type: String,
    required: true
  },
  
  // Computed properties
  hasIncomeData: {
    type: Boolean,
    required: true
  },
  hasExpenseData: {
    type: Boolean,
    required: true
  },
  hasInvestmentData: {
    type: Boolean,
    required: true
  },
  hasInvestmentIncomingData: {
    type: Boolean,
    required: true
  },
  hasInvestmentOutgoingData: {
    type: Boolean,
    required: true
  },
  hasAnyData: {
    type: Boolean,
    required: true
  },
  
  // Functions
  calculateMonthlyTotal: {
    type: Function,
    required: true
  },
  calculateMonthlyIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateMonthlyInvestmentNet: {
    type: Function,
    required: true
  },
  calculateGrandTotal: {
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
  calculateGrandTotalInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalInvestmentNet: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  }
})
</script> 