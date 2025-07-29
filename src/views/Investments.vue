<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
      <router-link
        to="/investments/create"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Investment
      </router-link>
    </div>

    <!-- Portfolio Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Total Portfolio Value</h3>
        <p class="text-3xl font-bold text-green-600">{{ formatCurrency(portfolioValue?.totalCurrentValue || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">Current market value</p>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Total Investments</h3>
        <p class="text-3xl font-bold text-blue-600">{{ investmentAssets?.length || 0 }}</p>
        <p class="text-sm text-gray-500 mt-1">Portfolio items</p>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Total ROI</h3>
        <p class="text-3xl font-bold text-purple-600">{{ formatCurrency(portfolioValue?.totalROI || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">Return on investment</p>
      </div>
    </div>

    <!-- Investment Items -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Investment Portfolio</h3>
        <div class="flex space-x-2">
          <select
            v-model="selectedType"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="real_estate">Real Estate</option>
            <option value="precious_metals">Precious Metals</option>
            <option value="other">Other</option>
          </select>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search investments..."
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="filteredInvestments.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 2a2 2 0 00-2 2v6a2 2 0 002 2m0 0V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No investments found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first investment.</p>
        <div class="mt-6">
          <router-link
            to="/investments/create"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Investment
          </router-link>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="investment in filteredInvestments"
          :key="investment.id"
          class="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer relative"
          @click="viewInvestment(investment.id)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="text-lg font-semibold">{{ investment.name }}</h4>
              <p class="text-gray-600 capitalize">{{ formatInvestmentType(investment.investment_type) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                getStatusColor(investment.real_estate_status || investment.status)
              ]">
                {{ formatStatus(investment.real_estate_status || investment.status) }}
              </span>
              <button
                @click.stop="deleteInvestment(investment)"
                class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                title="Delete investment"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">Purchase Amount</p>
              <p class="text-lg font-semibold">{{ formatCurrency(investment.purchase_amount) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Current Value</p>
              <p class="text-lg font-semibold">{{ formatCurrency(investment.current_value || 0) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">ROI</p>
              <p class="text-lg font-semibold" :class="getROIColor(investment)">
                {{ formatROI(investment) }}
              </p>
            </div>
          </div>
          
          <div v-if="investment.description" class="mt-4 pt-4 border-t">
            <p class="text-sm text-gray-600">{{ investment.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Investment Strategy -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Investment Strategy</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-2">Portfolio Overview</h4>
          <p class="text-gray-600 text-sm">Your current portfolio includes {{ investmentAssets?.length || 0 }} investments with a total value of {{ formatCurrency(portfolioValue?.totalCurrentValue || 0) }}.</p>
        </div>
        <div>
          <h4 class="font-medium mb-2">Diversification Opportunity</h4>
          <p class="text-gray-600 text-sm">Consider diversifying with different investment types to balance your portfolio and reduce risk.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets'

const router = useRouter()
const authStore = useAuthStore()
const investmentAssetsStore = useInvestmentAssetsStore()

// State
const loading = ref(false)
const searchTerm = ref('')
const selectedType = ref('')

// Computed
const investmentAssets = computed(() => investmentAssetsStore.investmentAssets)
const portfolioValue = computed(() => ({
  totalCurrentValue: investmentAssetsStore.totalPortfolioValue,
  totalPurchaseValue: investmentAssetsStore.totalPurchaseValue,
  totalROI: investmentAssetsStore.totalROI,
  totalROIPercentage: investmentAssetsStore.totalROIPercentage
}))

const filteredInvestments = computed(() => {
  let filtered = investmentAssets.value || []
  
  if (selectedType.value) {
    filtered = filtered.filter(inv => inv.investment_type === selectedType.value)
  }
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(inv => 
      inv.name.toLowerCase().includes(term) ||
      inv.description?.toLowerCase().includes(term)
    )
  }
  
  return filtered
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusColor = (status) => {
  switch (status) {
    case 'owned':
    case 'finished_installments':
      return 'bg-green-100 text-green-800'
    case 'paying':
    case 'delivered':
      return 'bg-blue-100 text-blue-800'
    case 'planned':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatROI = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0
  
  if (purchaseAmount === 0) return 'N/A'
  
  const roi = currentValue - purchaseAmount
  return formatCurrency(roi)
}

const getROIColor = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0
  
  if (purchaseAmount === 0) return 'text-gray-600'
  
  const roi = currentValue - purchaseAmount
  return roi >= 0 ? 'text-green-600' : 'text-red-600'
}

const viewInvestment = (investmentId) => {
  router.push(`/investments/${investmentId}`)
}

const deleteInvestment = async (investment) => {
  if (!confirm(`Are you sure you want to delete "${investment.name}"? This action cannot be undone and will also remove any linked budget items and transactions.`)) {
    return
  }
  
  try {
    const success = await investmentAssetsStore.deleteInvestmentAsset(investment.id)
    if (success) {
      // The store will automatically update the list
      console.log('Investment deleted successfully')
    } else {
      alert('Failed to delete investment. Please try again.')
    }
  } catch (error) {
    console.error('Error deleting investment:', error)
    alert('Failed to delete investment. Please try again.')
  }
}

// Load data
const loadData = async () => {
  loading.value = true
  try {
    await investmentAssetsStore.fetchInvestmentAssets()
    // Portfolio value is calculated from the fetched assets, no need for separate call
  } catch (error) {
    console.error('Error loading investment data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadData()
  }
})
</script> 