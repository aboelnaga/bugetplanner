<template>
  <!-- Income Summary -->
  <BudgetSummaryIncome
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-income-data="hasIncomeData"
    :has-investment-incoming-data="hasInvestmentIncomingData"
    :calculate-monthly-income="calculateMonthlyIncome"
    :calculate-monthly-investment-incoming="calculateMonthlyInvestmentIncoming"
    :calculate-grand-total-income="calculateGrandTotalIncome"
    :calculate-grand-total-investment-incoming="calculateGrandTotalInvestmentIncoming"
    :calculate-monthly-actual-income="calculateMonthlyActualIncome"
    :calculate-grand-total-actual-income="calculateGrandTotalActualIncome"
    :calculate-monthly-actual-investment-incoming="calculateMonthlyActualInvestmentIncoming"
    :calculate-grand-total-actual-investment-incoming="calculateGrandTotalActualInvestmentIncoming"
    :format-currency="formatCurrency"
    :calculate-monthly-planned-income="calculateMonthlyPlannedIncome"
    :calculate-monthly-planned-investment-incoming="calculateMonthlyPlannedInvestmentIncoming"
    :calculate-grand-total-planned-income="calculateGrandTotalPlannedIncome"
    :calculate-grand-total-planned-investment-incoming="calculateGrandTotalPlannedInvestmentIncoming"
    :calculate-previous-year-income-total="calculatePreviousYearIncomeTotal"
    :calculate-previous-year-investment-incoming-total="calculatePreviousYearInvestmentIncomingTotal" />

  <!-- Expenses Summary -->
  <BudgetSummaryExpenses
    :months="months"
    :selected-year="selectedYear"
    :current-year="currentYear"
    :current-month="currentMonth"
    :selected-type-filter="selectedTypeFilter"
    :has-expense-data="hasExpenseData"
    :has-investment-outgoing-data="hasInvestmentOutgoingData"
    :calculate-monthly-expenses="calculateMonthlyExpenses"
    :calculate-monthly-investment-outgoing="calculateMonthlyInvestmentOutgoing"
    :calculate-grand-total-expenses="calculateGrandTotalExpenses"
    :calculate-grand-total-investment-outgoing="calculateGrandTotalInvestmentOutgoing"
    :calculate-monthly-actual-expenses="calculateMonthlyActualExpenses"
    :calculate-grand-total-actual-expenses="calculateGrandTotalActualExpenses"
    :calculate-monthly-actual-investment-outgoing="calculateMonthlyActualInvestmentOutgoing"
    :calculate-grand-total-actual-investment-outgoing="calculateGrandTotalActualInvestmentOutgoing"
    :format-currency="formatCurrency"
    :calculate-monthly-planned-expenses="calculateMonthlyPlannedExpenses"
    :calculate-monthly-planned-investment-outgoing="calculateMonthlyPlannedInvestmentOutgoing"
    :calculate-grand-total-planned-expenses="calculateGrandTotalPlannedExpenses"
    :calculate-grand-total-planned-investment-outgoing="calculateGrandTotalPlannedInvestmentOutgoing"
    :calculate-previous-year-expenses-total="calculatePreviousYearExpensesTotal"
    :calculate-previous-year-investment-outgoing-total="calculatePreviousYearInvestmentOutgoingTotal" />

   
      
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
    :calculate-monthly-actual-total="calculateMonthlyActualTotal"
    :calculate-grand-total-actual="calculateGrandTotalActual"
    :calculate-monthly-actual-investment-net="calculateMonthlyActualInvestmentNet"
    :calculate-grand-total-actual-investment-net="calculateGrandTotalActualInvestmentNet"
    :calculate-monthly-planned-investment-incoming="calculateMonthlyPlannedInvestmentIncoming"
    :calculate-monthly-planned-investment-outgoing="calculateMonthlyPlannedInvestmentOutgoing"
    :calculate-grand-total-planned-investment-incoming="calculateGrandTotalPlannedInvestmentIncoming"
    :calculate-grand-total-planned-investment-outgoing="calculateGrandTotalPlannedInvestmentOutgoing"
    :format-currency="formatCurrency"
    :calculate-monthly-planned-total="calculateMonthlyPlannedTotal"
    :calculate-grand-total-planned="calculateGrandTotalPlanned"
    :calculate-previous-year-net-total="calculatePreviousYearNetTotal"
    :calculate-previous-year-investment-net-total="calculatePreviousYearInvestmentNetTotal"
    :calculate-cumulative-savings="calculateCumulativeSavings"
    :calculate-grand-total-savings="calculateGrandTotalSavings"
    :calculate-previous-year-savings="calculatePreviousYearSavings" />
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
  // Planned investment functions for Net Investment tooltips
  calculateMonthlyPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  // Actual-only calculation props
  calculateMonthlyActualIncome: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualIncome: {
    type: Function,
    required: true
  },
  calculateMonthlyActualInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualInvestmentIncoming: {
    type: Function,
    required: true
  },
  calculateMonthlyActualExpenses: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualExpenses: {
    type: Function,
    required: true
  },
  calculateMonthlyActualInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualInvestmentOutgoing: {
    type: Function,
    required: true
  },
  calculateMonthlyActualTotal: {
    type: Function,
    required: true
  },
  calculateGrandTotalActual: {
    type: Function,
    required: true
  },
  calculateMonthlyActualInvestmentNet: {
    type: Function,
    required: true
  },
  calculateGrandTotalActualInvestmentNet: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  
  // Planned calculation props for tooltips
  calculateMonthlyPlannedIncome: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateMonthlyPlannedTotal: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedIncome: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedExpenses: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentIncoming: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlannedInvestmentOutgoing: {
    type: Function,
    default: null
  },
  calculateGrandTotalPlanned: {
    type: Function,
    default: null
  },
  

  calculatePreviousYearIncomeTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearExpensesTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentIncomingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentOutgoingTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearNetTotal: {
    type: Function,
    default: null
  },
  calculatePreviousYearInvestmentNetTotal: {
    type: Function,
    default: null
  },
  
  // Savings calculations
  calculateCumulativeSavings: {
    type: Function,
    required: true
  },
  calculateGrandTotalSavings: {
    type: Function,
    required: true
  },
  calculatePreviousYearSavings: {
    type: Function,
    required: true
  },
  

})
</script> 