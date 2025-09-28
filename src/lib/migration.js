import { supabase, budgetAPI } from './supabase.js'

// Migration script to move current budget data to Supabase
export const migrateBudgetData = async (userId) => {
  try {
    console.log('Starting budget data migration...')

    // Sample budget data from your current store
    const sampleBudgetItems = [
      {
        name: 'Car Expenses',
        type: 'expense',
        category: 'Transportation',
        recurrence: 'monthly',
        default_amount: 500,
        start_month: 0,
        year: 2024
      },
      {
        name: 'Karam School Installment',
        type: 'expense',
        category: 'Education',
        recurrence: 'school-terms',
        default_amount: 5000,
        start_month: 0,
        year: 2024
      },
      {
        name: 'Quarterly Insurance',
        type: 'expense',
        category: 'Insurance',
        recurrence: 'quarterly',
        default_amount: 1200,
        start_month: 0,
        year: 2024
      },
      {
        name: 'Monthly Charity',
        type: 'expense',
        category: 'Charity',
        recurrence: 'monthly',
        default_amount: 1000,
        start_month: 0,
        year: 2024
      },
      {
        name: 'Monthly Salary',
        type: 'income',
        category: 'Salary',
        recurrence: 'monthly',
        default_amount: 15000,
        start_month: 0,
        year: 2024
      },
      {
        name: 'Annual Bonus',
        type: 'income',
        category: 'Bonus',
        recurrence: 'one-time',
        default_amount: 20000,
        start_month: 11,
        year: 2024
      },
      {
        name: 'Real Estate Installment',
        type: 'investment',
        category: 'Real Estate Installment',
        recurrence: 'monthly',
        default_amount: 8000,
        start_month: 0,
        year: 2024,
        investment_direction: 'outgoing'
      },
      {
        name: 'Apartment Rental Income',
        type: 'investment',
        category: 'Rental Income',
        recurrence: 'monthly',
        default_amount: 3000,
        start_month: 0,
        year: 2024,
        investment_direction: 'incoming'
      }
    ]

    const migratedItems = []

    for (const item of sampleBudgetItems) {
      try {
        // Create budget item
        const budgetItem = await budgetAPI.createBudgetItem({
          ...item,
          user_id: userId
        })

        console.log(`Created budget item: ${item.name}`)
        migratedItems.push(budgetItem)

        // Generate monthly amounts based on recurrence
        const amounts = generateMonthlyAmounts(item)

        // Update budget item with amounts array
        await budgetAPI.updateBudgetItem(budgetItem.id, {
          amounts
        })

        console.log(`Created amounts for: ${item.name}`)
      } catch (error) {
        console.error(`Error migrating ${item.name}:`, error)
      }
    }

    console.log(`Migration completed. ${migratedItems.length} items migrated.`)
    return migratedItems
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Helper function to generate monthly amounts based on recurrence
const generateMonthlyAmounts = (budgetItem) => {
  const amounts = new Array(12).fill(0)
  const startMonth = budgetItem.start_month

  switch (budgetItem.recurrence) {
    case 'monthly':
      for (let month = startMonth; month < 12; month++) {
        amounts[month] = budgetItem.default_amount
      }
      break
    case 'quarterly': {
      const quarters = [0, 3, 6, 9]
      quarters
        .filter((quarter) => quarter >= startMonth)
        .forEach((month) => {
          amounts[month] = budgetItem.default_amount
        })
      break
    }
    case 'bi-annual': {
      const biAnnual = [0, 6]
      biAnnual
        .filter((month) => month >= startMonth)
        .forEach((month) => {
          amounts[month] = budgetItem.default_amount
        })
      break
    }
    case 'school-terms': {
      const schoolTerms = [0, 8]
      schoolTerms
        .filter((month) => month >= startMonth)
        .forEach((month) => {
          amounts[month] = budgetItem.default_amount
        })
      break
    }
    case 'one-time':
      amounts[startMonth] = budgetItem.default_amount
      break
  }

  return amounts
}

// Function to check if migration is needed
export const checkMigrationStatus = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('budget_items')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error

    return {
      needsMigration: data.length === 0,
      itemCount: data.length
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return { needsMigration: false, itemCount: 0 }
  }
}
