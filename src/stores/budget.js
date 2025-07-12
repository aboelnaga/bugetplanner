import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBudgetStore = defineStore('budget', () => {
  // Current month data (using December 2024 as example)
  const currentMonth = ref({
    year: 2024,
    month: 'december',
    savings: 110133.15,
    monthlySaving: -70279.41,
    monthlySpending: 359950.00,
    monthlyIncome: 289670.59,
    salary: 181670.59,
    bonus: 108000.00,
    // Detailed expenses
    expenses: {
      apartmentRent: 2500.00,
      insurance: {
        axa: 0,
        masrLife: 0
      },
      gam3iat: 20000.00,
      family: {
        maha: 2500.00,
        mohamed: 2500.00,
        karamAnas: 3500.00,
        home: 8500.00
      },
      utilities: {
        electricity: 0,
        internet: 700.00,
        mobile: {
          maha: 150.00,
          mohamed: 400.00
        }
      },
      transportation: {
        car: 400.00,
        maintenance: 0,
        uber: 500.00
      },
      charity: 4500.00,
      play: 1000.00,
      extra: 142200.00,
      investments: {
        apartment2nd: 36000.00,
        apartmentYearly: 131000.00
      },
      gold: 0,
      zakat: 4500.00
    }
  })

  // Historical data (last 12 months)
  const monthlyData = ref([
    { month: 'Jan 2024', income: 106116, spending: 123400, savings: 12658 },
    { month: 'Feb 2024', income: 118116, spending: 52400, savings: 78374 },
    { month: 'Mar 2024', income: 166116, spending: 204050, savings: 40440 },
    { month: 'Apr 2024', income: 136116, spending: 95400, savings: 81156 },
    { month: 'May 2024', income: 181671, spending: 127450, savings: 135377 },
    { month: 'Jun 2024', income: 317683, spending: 242550, savings: 210510 },
    { month: 'Jul 2024', income: 181671, spending: 215450, savings: 176730 },
    { month: 'Aug 2024', income: 181671, spending: 88700, savings: 269701 },
    { month: 'Sep 2024', income: 287671, spending: 327250, savings: 230121 },
    { month: 'Oct 2024', income: 181671, spending: 238150, savings: 173642 },
    { month: 'Nov 2024', income: 181671, spending: 174900, savings: 180413 },
    { month: 'Dec 2024', income: 289671, spending: 359950, savings: 110133 }
  ])

  // Future projections (2025-2029)
  const projections = ref([
    { year: 2025, totalSavings: 1500158.51, income: 3207025.37, spending: 1817000.00 },
    { year: 2026, totalSavings: 3148265.89, income: 3132507.37, spending: 1484400.00 },
    { year: 2027, totalSavings: 4574036.68, income: 3474070.80, spending: 2048300.00 },
    { year: 2028, totalSavings: 6975466.33, income: 3858329.65, spending: 1456900.00 },
    { year: 2029, totalSavings: 9940187.18, income: 4290620.85, spending: 1325900.00 }
  ])

  // Family members allocation
  const familyBudgets = ref({
    maha: {
      monthly: 2500,
      category: 'Personal Expenses',
      description: 'Monthly personal allowance'
    },
    mohamed: {
      monthly: 2500,
      category: 'Personal Expenses', 
      description: 'Monthly personal allowance'
    },
    karamAnas: {
      monthly: 3500,
      category: 'Children Expenses',
      description: 'Combined allowance for Karam & Anas'
    },
    home: {
      monthly: 8500,
      category: 'Household',
      description: 'General household expenses'
    }
  })

  // Investment portfolio
  const investments = ref([
    {
      type: 'Real Estate',
      name: 'Second Apartment',
      monthlyPayment: 36000,
      totalValue: 0, // Can be calculated
      status: 'Active'
    },
    {
      type: 'Real Estate', 
      name: 'Apartment Yearly Investment',
      monthlyPayment: 131000,
      totalValue: 0,
      status: 'Active'
    },
    {
      type: 'Precious Metals',
      name: 'Gold Investment',
      monthlyPayment: 0,
      totalValue: 0,
      status: 'Inactive'
    }
  ])

  // Computed values
  const currentSavingsRate = computed(() => {
    if (currentMonth.value.monthlyIncome === 0) return 0
    return ((currentMonth.value.monthlySaving / currentMonth.value.monthlyIncome) * 100).toFixed(1)
  })

  const zakatDue = computed(() => {
    // 2.5% of total savings (Islamic wealth tax)
    return (currentMonth.value.savings * 0.025).toFixed(2)
  })

  const totalFamilyExpenses = computed(() => {
    return Object.values(familyBudgets.value).reduce((sum, member) => sum + member.monthly, 0)
  })

  const totalInvestments = computed(() => {
    return investments.value.reduce((sum, inv) => sum + inv.monthlyPayment, 0)
  })

  // Actions
  function updateCurrentMonth(data) {
    currentMonth.value = { ...currentMonth.value, ...data }
  }

  function addMonthlyRecord(record) {
    monthlyData.value.push(record)
  }

  function updateFamilyBudget(member, amount) {
    if (familyBudgets.value[member]) {
      familyBudgets.value[member].monthly = amount
    }
  }

  return {
    currentMonth,
    monthlyData,
    projections,
    familyBudgets,
    investments,
    currentSavingsRate,
    zakatDue,
    totalFamilyExpenses,
    totalInvestments,
    updateCurrentMonth,
    addMonthlyRecord,
    updateFamilyBudget
  }
}) 