<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const authStore = useAuthStore()
const investmentAssetsStore = useInvestmentAssetsStore()
const toast = useToast()
const confirm = useConfirm()

// State
const loading = ref(false)
const searchTerm = ref('')
const selectedType = ref('')

// Filter options
const typeOptions = [
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Precious Metals', value: 'precious_metals' },
  { label: 'Other', value: 'other' }
]

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
    maximumFractionDigits: 0
  }).format(Math.abs(amount))
}

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return '0%'
  return `${percentage.toFixed(2)}%`
}

const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusSeverity = (status) => {
  switch (status) {
    case 'owned':
    case 'finished_installments':
      return 'success'
    case 'paying':
    case 'delivered':
      return 'info'
    case 'planned':
      return 'warning'
    default:
      return 'secondary'
  }
}

const formatROI = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0

  if (purchaseAmount === 0) return 'N/A'

  const roi = currentValue - purchaseAmount
  return formatCurrency(roi)
}

const formatROIPercentage = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0

  if (purchaseAmount === 0) return 'N/A'

  const roi = currentValue - purchaseAmount
  const roiPercentage = (roi / purchaseAmount) * 100
  return `${roiPercentage.toFixed(2)}%`
}

const getROIColor = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0

  if (purchaseAmount === 0) return ''

  const roi = currentValue - purchaseAmount
  return roi >= 0 ? 'text-green-600' : 'text-red-600'
}

const viewInvestment = (investmentId) => {
  router.push(`/investments/${investmentId}`)
}

const deleteInvestment = async (investment) => {
  confirm.require({
    message: `Are you sure you want to delete "${investment.name}"? This action cannot be undone and will also remove any linked budget items and transactions.`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const success = await investmentAssetsStore.deleteInvestmentAsset(investment.id)
        if (success) {
          console.log('Investment deleted successfully')
          toast.add({ severity: 'success', summary: 'Investment Deleted', detail: `Investment "${investment.name}" deleted.` })
        } else {
          toast.add({ severity: 'error', summary: 'Error deleting investment', detail: 'Failed to delete investment. Please try again.' })
        }
      } catch (error) {
        console.error('Error deleting investment:', error)
        toast.add({ severity: 'error', summary: 'Error deleting investment', detail: 'Failed to delete investment. Please try again.' })
      }
    },
    reject: () => {
      // User cancelled the deletion
    }
  })
}

// Load data
const loadData = async () => {
  loading.value = true
  try {
    await investmentAssetsStore.fetchInvestmentAssets()
  } catch (error) {
    console.error('Error loading investment data:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (authStore.isAuthenticated) {
    loadData()
  }
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Card class="mb-6">
      <template #content>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">
              Investment Portfolio
            </h1>
            <p class="mt-2">
              Manage your investments and track portfolio performance
            </p>
          </div>

          <Button
            icon="pi pi-plus"
            label="Add Investment"
            severity="primary"
            @click="router.push('/investments/create')"
          />
        </div>
      </template>
    </Card>

    <!-- Portfolio Overview Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-line text-green-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total Portfolio Value
              </p>
              <p class="text-2xl font-semibold text-green-600">
                {{ formatCurrency(portfolioValue?.totalCurrentValue || 0) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-briefcase text-blue-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total Investments
              </p>
              <p class="text-2xl font-semibold text-blue-600">
                {{ investmentAssets?.length || 0 }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-percentage text-purple-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Total ROI
              </p>
              <p class="text-2xl font-semibold text-purple-600">
                {{ formatCurrency(portfolioValue?.totalROI || 0) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-pie text-orange-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium">
                ROI %
              </p>
              <p class="text-2xl font-semibold text-orange-600">
                {{ formatPercentage(portfolioValue?.totalROIPercentage || 0) }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Investment DataTable -->
    <Card>
      <template #header>
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 class="text-xl font-semibold">
            Investment Portfolio
          </h3>

          <div class="flex flex-col sm:flex-row gap-3">
            <Select
              v-model="selectedType"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Types"
              class="w-full sm:w-40"
              :show-clear="true"
            />

            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchTerm"
                placeholder="Search investments..."
                class="w-full sm:w-64"
              />
            </IconField>
          </div>
        </div>
      </template>

      <template #content>
        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
          <div class="flex flex-col items-center gap-3">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-600" />
            <span>Loading investments...</span>
          </div>
        </div>

        <div
          v-else-if="filteredInvestments.length === 0"
          class="text-center py-12"
        >
          <i class="pi pi-briefcase text-6xl mb-4" />
          <h3 class="text-lg font-medium mb-2">
            No investments found
          </h3>
          <p class="mb-6">
            {{ investmentAssets?.length === 0 ? 'Get started by creating your first investment.' : 'No investments match your current filters.' }}
          </p>
          <Button
            icon="pi pi-plus"
            label="Add Investment"
            severity="primary"
            @click="router.push('/investments/create')"
          />
        </div>

        <DataTable
          v-else
          :value="filteredInvestments"
          removable-sort
          responsive-layout="scroll"
          class="p-datatable-sm"
          striped-rows
          show-gridlines
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 25, 50]"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords} investments"
        >
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-briefcase text-4xl mb-3" />
              <p>No investments found</p>
            </div>
          </template>

          <Column
            field="name"
            header="Investment Name"
            sortable
            style="min-width: 200px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-briefcase text-blue-600 text-sm" />
                </div>
                <div>
                  <span class="font-medium">{{ data.name }}</span>
                  <p class="text-sm capitalize">
                    {{ formatInvestmentType(data.investment_type) }}
                  </p>
                </div>
              </div>
            </template>
          </Column>

          <Column
            field="status"
            header="Status"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <Tag
                :value="formatStatus(data.real_estate_status || data.status)"
                :severity="getStatusSeverity(data.real_estate_status || data.status)"
                rounded
              />
            </template>
          </Column>

          <Column
            field="purchase_amount"
            header="Purchase Amount"
            sortable
            style="width: 140px"
          >
            <template #body="{ data }">
              <span class="font-semibold">{{ formatCurrency(data.purchase_amount) }}</span>
            </template>
          </Column>

          <Column
            field="current_value"
            header="Current Value"
            sortable
            style="width: 140px"
          >
            <template #body="{ data }">
              <span class="font-semibold">{{ formatCurrency(data.current_value || 0) }}</span>
            </template>
          </Column>

          <Column
            field="roi"
            header="ROI"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <span
                :class="getROIColor(data)"
                class="font-semibold"
              >
                {{ formatROI(data) }}
              </span>
            </template>
          </Column>

          <Column
            field="roi_percentage"
            header="ROI %"
            sortable
            style="width: 100px"
          >
            <template #body="{ data }">
              <span
                :class="getROIColor(data)"
                class="font-semibold"
              >
                {{ formatROIPercentage(data) }}
              </span>
            </template>
          </Column>

          <Column
            header="Actions"
            style="width: 120px"
          >
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  v-tooltip.top="'View Details'"
                  icon="pi pi-eye"
                  size="small"
                  text
                  severity="info"
                  @click="viewInvestment(data.id)"
                />
                <Button
                  v-tooltip.top="'Delete Investment'"
                  icon="pi pi-trash"
                  size="small"
                  text
                  severity="danger"
                  @click="deleteInvestment(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Investment Strategy -->
    <Card v-if="investmentAssets?.length > 0">
      <template #header>
        <h3 class="text-xl font-semibold">
          Investment Strategy
        </h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-2">
              Portfolio Overview
            </h4>
            <p class="text-sm">
              Your current portfolio includes {{ investmentAssets?.length || 0 }} investments with a total value of {{ formatCurrency(portfolioValue?.totalCurrentValue || 0) }}.
            </p>
          </div>
          <div>
            <h4 class="font-medium mb-2">
              Diversification Opportunity
            </h4>
            <p class="text-sm">
              Consider diversifying with different investment types to balance your portfolio and reduce risk.
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>