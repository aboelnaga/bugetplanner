<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { investmentAssetsAPI, budgetAPI } from '@/lib/supabase'
import AddBudgetModal from '@/components/AddBudgetModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const confirm = useConfirm()

// State
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const investment = ref(null)
const editMode = ref(false)
const showCreateBudgetModal = ref(false)
const showEditBudgetModal = ref(false)
const editingBudgetItem = ref(null)
const linkedBudgetItems = ref([])
const realEstateStatuses = ref([])
const expandedBudgetItems = ref([])

// Edit form
const editForm = reactive({
    name: '',
    current_value: '',
    purchase_date: '',
    last_valuation_date: '',
    description: '',
    real_estate_status: '',
    // Real estate specific
    delivery_date: '',
    construction_status: '',
    completion_date: '',
    developer_owner: '',
    location: '',
    // Precious metals specific
    metal_type: '',
    karat: '',
    condition: '',
    form: '',
    purpose: '',
    amount: '',
    amount_unit: ''
  })

// Options for dropdowns
const constructionStatusOptions = [
    { label: 'Under Construction', value: 'under_construction' },
    { label: 'Finished', value: 'finished' }
  ]

const metalTypeOptions = [
    { label: 'Gold', value: 'gold' },
    { label: 'Silver', value: 'silver' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Palladium', value: 'palladium' },
    { label: 'Rhodium', value: 'rhodium' }
  ]

const karatOptions = [
    { label: '24 Karat', value: '24K' },
    { label: '22 Karat', value: '22K' },
    { label: '21 Karat', value: '21K' },
    { label: '18 Karat', value: '18K' },
    { label: '14 Karat', value: '14K' },
    { label: '10 Karat', value: '10K' },
    { label: '9 Karat', value: '9K' }
  ]

const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' }
  ]

const formOptions = [
    { label: 'Bars', value: 'bars' },
    { label: 'Jewelry', value: 'jewelry' },
    { label: 'Coins', value: 'coins' },
    { label: 'Other', value: 'other' }
  ]

const purposeOptions = [
    { label: 'Investment', value: 'investment' },
    {
      label: 'Personal Use (Zakat Calculation)',
      value: 'personal_use_for_zakat'
    }
  ]

const amountUnitOptions = [
    { label: 'Grams', value: 'grams' },
    { label: 'Kilograms', value: 'kilograms' },
    { label: 'Ounces', value: 'ounces' },
    { label: 'Pounds', value: 'pounds' }
  ]

// Computed
const investmentId = computed(() => route.params.id)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatConstructionStatus = (status) => {
  if (!status) return 'N/A'
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatMetalType = (type) => {
  if (!type) return 'N/A'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatCondition = (condition) => {
  if (!condition) return 'N/A'
  return condition.charAt(0).toUpperCase() + condition.slice(1)
}

const formatForm = (form) => {
  if (!form) return 'N/A'
  return form.charAt(0).toUpperCase() + form.slice(1)
}

const formatPurpose = (purpose) => {
  if (!purpose) return 'N/A'
  if (purpose === 'personal_use_for_zakat') {
    return 'Personal Use (Zakat Calculation)'
  }
  return purpose.charAt(0).toUpperCase() + purpose.slice(1)
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

const getTransactionSeverity = (type) => {
  switch (type) {
    case 'income':
      return 'success'
    case 'expense':
      return 'danger'
    case 'investment':
      return 'info'
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

const getROIColor = (investment) => {
  const purchaseAmount = parseFloat(investment.purchase_amount) || 0
  const currentValue = parseFloat(investment.current_value) || 0

  if (purchaseAmount === 0) return ''

  const roi = currentValue - purchaseAmount
  return roi >= 0 ? 'text-green-600' : 'text-red-600'
}

const calculateTotalAmount = (amounts) => {
  if (!amounts || !Array.isArray(amounts)) return 0
  return amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
}

const loadInvestment = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await investmentAssetsAPI.getInvestmentAsset(
        investmentId.value
      )
    investment.value = data

    // Initialize edit form
    editForm.name = data.name || ''
    editForm.current_value = data.current_value || ''
    editForm.purchase_date = data.purchase_date
      ? new Date(data.purchase_date)
      : null
    editForm.last_valuation_date = data.last_valuation_date
      ? new Date(data.last_valuation_date)
      : null
    editForm.description = data.description || ''
    editForm.real_estate_status = data.real_estate_status || ''
    // Real estate specific
    editForm.delivery_date = data.delivery_date
      ? new Date(data.delivery_date)
      : null
    editForm.construction_status = data.construction_status || ''
    editForm.completion_date = data.completion_date
      ? new Date(data.completion_date)
      : null
    editForm.developer_owner = data.developer_owner || ''
    editForm.location = data.location || ''
    // Precious metals specific
    editForm.metal_type = data.metal_type || ''
    editForm.karat = data.karat || ''
    editForm.condition = data.condition || ''
    editForm.form = data.form || ''
    editForm.purpose = data.purpose || ''
    editForm.amount = data.amount || ''
    editForm.amount_unit = data.amount_unit || ''

    // Load linked budget items
    if (data.budget_items) {
      linkedBudgetItems.value = Array.isArray(data.budget_items)
          ? data.budget_items
      : [data.budget_items]
    }

    // Load real estate statuses
    realEstateStatuses.value =
      await investmentAssetsAPI.getRealEstateStatuses()
  } catch (err) {
      console.error('Error loading investment:', err)
      error.value = err.message || 'Failed to load investment'
  } finally {
    loading.value = false
  }
}

const saveChanges = async () => {
  saving.value = true
  error.value = ''

  try {
    const updates = {
        name: editForm.name,
        current_value: editForm.current_value
          ? parseFloat(editForm.current_value)
          : null,
        purchase_date: editForm.purchase_date || null,
        last_valuation_date: editForm.last_valuation_date || null,
        description: editForm.description,
        ...(investment.value.investment_type === 'real_estate' && {
          real_estate_status: editForm.real_estate_status,
          delivery_date: editForm.delivery_date || null,
          construction_status: editForm.construction_status || null,
          completion_date: editForm.completion_date || null,
          developer_owner: editForm.developer_owner,
          location: editForm.location
        }),
        ...(investment.value.investment_type === 'precious_metals' && {
          metal_type: editForm.metal_type,
          karat: editForm.karat || null,
          condition: editForm.condition || null,
          form: editForm.form || null,
          purpose: editForm.purpose || null,
          amount: editForm.amount ? parseFloat(editForm.amount) : null,
          amount_unit: editForm.amount_unit
        })
      }

    await investmentAssetsAPI.updateInvestmentAsset(
        investmentId.value,
        updates
      )

    // Reload investment data
    await loadInvestment()

    editMode.value = false
  } catch (err) {
      console.error('Error saving changes:', err)
      error.value = err.message || 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

const deleteInvestment = () => {
    console.log('deleteInvestment called, confirm object:', confirm)
    confirm.require({
      message: `Are you sure you want to delete Investment item: ${investment.value?.name}?`,
      header: 'Delete Investment?',
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          deleting.value = true
          await investmentAssetsAPI.deleteInvestmentAsset(investmentId.value)
          router.push('/investments')
        } catch (err) {
          console.error('Error deleting investment:', err)
          error.value = err.message || 'Failed to delete investment'
        } finally {
          deleting.value = false
        }
      }
    })
}

const goToBudgetItems = () => {
    router.push('/')
}

const editBudgetItem = (budgetItem) => {
  editingBudgetItem.value = budgetItem
  showEditBudgetModal.value = true
}

const unlinkBudgetItem = async (budgetItem) => {
    confirm.require({
      message: `Are you sure you want to unlink "${budgetItem.name}" from this investment?`,
      header: 'Confirm Unlink?',
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await investmentAssetsAPI.unlinkBudgetItemFromInvestment(
            budgetItem.id
          )

          // Reload the investment data to update the linked budget items
          await loadInvestment()

          console.log('Budget item unlinked successfully')
        } catch (err) {
          console.error('Error unlinking budget item:', err)
          error.value = err.message || 'Failed to unlink budget item'
        }
      }
    })
}

const deleteBudgetItem = async (budgetItem) => {
    confirm.require({
      message: `Are you sure you want to delete budget item: ${budgetItem.name}?`,
      header: 'Confirm Delete?',
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await budgetAPI.deleteBudgetItem(budgetItem.id)

          // Reload the investment data to update the linked budget items
          await loadInvestment()

          console.log('Budget item deleted successfully')
        } catch (err) {
          console.error('Error deleting budget item:', err)
          error.value = err.message || 'Failed to delete budget item'
        }
      }
    })
}

const handleBudgetItemCreated = async (budgetItem) => {
  try {
    // Handle both single-year and multi-year budget items
    if (Array.isArray(budgetItem)) {
        // Multi-year budget - link all budget items to the investment
        console.log(
          'Linking multi-year budget items to investment:',
          budgetItem.length,
          'items'
        )

        for (const item of budgetItem) {
          await investmentAssetsAPI.linkToBudgetItem(
            investmentId.value,
            item.id
          )
        }

        console.log('All multi-year budget items linked successfully')
    } else {
        // Single-year budget - link the single budget item
        console.log('Linking single budget item to investment:', budgetItem.id)
        await investmentAssetsAPI.linkToBudgetItem(
          investmentId.value,
          budgetItem.id
        )
    }

    // Reload the investment data to show the linked budget items
    await loadInvestment()

      console.log('Budget item(s) created and linked successfully')
  } catch (err) {
      console.error('Error linking budget item to investment:', err)
      error.value = err.message || 'Failed to link budget item to investment'
  }
}

const handleBudgetItemUpdated = async (budgetItem) => {
  try {
    // Reload the investment data to show updated budget item
    await loadInvestment()

      console.log('Budget item updated successfully')
  } catch (err) {
      console.error('Error updating budget item:', err)
      error.value = err.message || 'Failed to update budget item'
  }
}

const addDocumentLink = () => {
  if (!investment.value.document_links) {
    investment.value.document_links = []
  }
    investment.value.document_links.push('')
}

const removeDocumentLink = async (index) => {
  try {
    await investmentAssetsAPI.removeDocumentLink(investmentId.value, index)
    await loadInvestment()
  } catch (err) {
      console.error('Error removing document link:', err)
      error.value = err.message || 'Failed to remove document link'
  }
}

const getTransactionTypeColor = (type) => {
  const colors = {
      income: 'bg-green-500',
      expense: 'bg-red-500',
      investment: 'bg-blue-500'
    }
  return colors[type] || 'bg-gray-500'
}

const getTypeSeverity = (type) => {
  const severity = {
      income: 'success',
      expense: 'danger',
      investment: 'info'
    }
  return severity[type] || 'secondary'
}

const getProgressPercentage = (item) => {
  const actual = calculateTotalAmount(item.actual_amounts)
  const budgetAmount = calculateTotalAmount(item.amounts)
  if (budgetAmount === 0) return 0
  const percentage = (actual / budgetAmount) * 100
  return Math.min(percentage, 100)
}

const getProgressBarColor = (item) => {
  const percentage = getProgressPercentage(item)

  if (percentage >= 100) {
    return 'bg-green-500' // Complete
  } else if (percentage >= 90) {
    return 'bg-orange-500' // Approaching limit
  } else if (percentage > 0) {
    return 'bg-blue-500' // On track
  } else {
    return 'bg-gray-300' // No progress
  }
}

const getBudgetItemStatus = (item) => {
  const actualAmount = calculateTotalAmount(item.actual_amounts)
  const budgetAmount = calculateTotalAmount(item.amounts)

  // Check if completed (amount matches exactly)
  if (actualAmount === budgetAmount) {
    return 'Completed'
  }

  // Check if exceeds budget
  if (actualAmount > budgetAmount) {
    return 'Exceeds Budget'
  }

  // Check if partial
  if (actualAmount > 0 && actualAmount < budgetAmount) {
    return 'Partial'
  }

  return 'Pending'
}

const getBudgetItemStatusSeverity = (status) => {
  const map = {
      Completed: 'success',
      'Exceeds Budget': 'danger',
      Partial: 'info',
      Pending: 'warning'
    }
  return map[status] || 'secondary'
}

const editTransaction = (transaction) => {
    // TODO: Implement transaction editing
    console.log('Edit transaction:', transaction)
// This could open a modal or navigate to transaction edit page
}

const deleteTransaction = (transaction) => {
    // TODO: Implement transaction deletion with confirmation
    console.log('Delete transaction:', transaction)
// This should show a confirmation dialog before deleting
}

  // Lifecycle
  onMounted(() => {
    if (authStore.isAuthenticated && investmentId.value) {
      loadInvestment()
    }
  })

  watch(
    () => route.params.id,
    (newId) => {
      if (newId && authStore.isAuthenticated) {
        loadInvestment()
      }
    }
  )
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Card class="mb-6">
      <template #content>
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Button
              icon="pi pi-arrow-left"
              label="Back to Investments"
              outlined
              size="small"
              @click="router.push('/investments')"
            />

            <div>
              <h1 class="text-3xl font-bold">
                {{ investment?.name || "Investment Details" }}
              </h1>
              <p class="mt-1">
                {{ formatInvestmentType(investment?.investment_type) }}
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <Button
              :icon="editMode ? 'pi pi-times' : 'pi pi-pencil'"
              :label="editMode ? 'Cancel Edit' : 'Edit Investment'"
              outlined
              severity="info"
              @click="editMode = !editMode"
            />

            <Button
              v-if="editMode"
              :disabled="saving"
              icon="pi pi-check"
              label="Save Changes"
              severity="success"
              @click="saveChanges"
            />

            <Button
              icon="pi pi-trash"
              label="Delete Investment"
              severity="danger"
              outlined
              @click="deleteInvestment"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-12"
    >
      <div class="flex flex-col items-center gap-3">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600" />
        <span>Loading investment details...</span>
      </div>
    </div>

    <!-- Error State -->
    <Card
      v-else-if="error"
      class="mb-6"
      severity="danger"
    >
      <template #content>
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-xl" />
          <div>
            <h3 class="font-medium">
              Error
            </h3>
            <p class="mt-1">
              {{ error }}
            </p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Investment Content -->
    <div
      v-else-if="investment"
      class="space-y-6"
    >
      <!-- Investment Overview -->
      <Card>
        <template #header>
          <h2 class="text-xl font-semibold">
            Investment Overview
          </h2>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <h3 class="text-sm font-medium mb-2">
                Purchase Amount
              </h3>
              <p class="text-2xl font-semibold">
                {{ formatCurrency(investment.purchase_amount) }}
              </p>
            </div>
            <div class="text-center">
              <h3 class="text-sm font-medium mb-2">
                Current Value
              </h3>
              <p class="text-2xl font-semibold">
                {{ formatCurrency(investment.current_value || 0) }}
              </p>
            </div>
            <div class="text-center">
              <h3 class="text-sm font-medium mb-2">
                ROI
              </h3>
              <p
                class="text-2xl font-semibold"
                :class="getROIColor(investment)"
              >
                {{ formatROI(investment) }}
              </p>
            </div>
          </div>

          <div class="mt-6 text-center">
            <h3 class="text-sm font-medium mb-2">
              Status
            </h3>
            <Tag
              :value="
                formatStatus(investment.real_estate_status || investment.status)
              "
              :severity="
                getStatusSeverity(
                  investment.real_estate_status || investment.status,
                )
              "
              rounded
            />
          </div>
        </template>
      </Card>

      <!-- Investment Details -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">
              Investment Details
            </h2>
            <Button
              v-if="editMode"
              :disabled="saving"
              icon="pi pi-check"
              label="Save Changes"
              severity="success"
              @click="saveChanges"
            />
          </div>
        </template>
        <template #content>
          <div
            v-if="editMode"
            class="space-y-6"
          >
            <!-- Edit Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div>
                <label class="block text-sm font-medium mb-2">Name</label>
                <InputText
                  v-model="editForm.name"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Investment Type</label>
                <InputText
                  :value="formatInvestmentType(investment.investment_type)"
                  disabled
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Purchase Amount</label>
                <InputText
                  :value="formatCurrency(investment.purchase_amount)"
                  disabled
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Current Value</label>
                <InputNumber
                  v-model="editForm.current_value"
                  mode="currency"
                  currency="EGP"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Purchase Date</label>
                <Calendar
                  v-model="editForm.purchase_date"
                  date-format="dd/mm/yy"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Last Valuation Date</label>
                <Calendar
                  v-model="editForm.last_valuation_date"
                  date-format="dd/mm/yy"
                  class="w-full"
                />
              </div>

              <!-- Real Estate Specific -->
              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Status</label>
                <Select
                  v-model="editForm.real_estate_status"
                  :options="realEstateStatuses"
                  option-label="label"
                  option-value="value"
                  placeholder="Select status"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Developer/Owner</label>
                <InputText
                  v-model="editForm.developer_owner"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Location</label>
                <InputText
                  v-model="editForm.location"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Delivery Date</label>
                <Calendar
                  v-model="editForm.delivery_date"
                  date-format="dd/mm/yy"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Construction Status</label>
                <Select
                  v-model="editForm.construction_status"
                  :options="constructionStatusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select status"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <label class="block text-sm font-medium mb-2">Completion Date</label>
                <Calendar
                  v-model="editForm.completion_date"
                  date-format="dd/mm/yy"
                  class="w-full"
                />
              </div>

              <!-- Precious Metals Specific -->
              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Metal Type</label>
                <Select
                  v-model="editForm.metal_type"
                  :options="metalTypeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select metal type"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Karat/Purity</label>
                <Select
                  v-model="editForm.karat"
                  :options="karatOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select karat"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Condition</label>
                <Select
                  v-model="editForm.condition"
                  :options="conditionOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select condition"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Form</label>
                <Select
                  v-model="editForm.form"
                  :options="formOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select form"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Purpose</label>
                <Select
                  v-model="editForm.purpose"
                  :options="purposeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select purpose"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Amount</label>
                <InputNumber
                  v-model="editForm.amount"
                  mode="decimal"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  class="w-full"
                />
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <label class="block text-sm font-medium mb-2">Amount Unit</label>
                <Select
                  v-model="editForm.amount_unit"
                  :options="amountUnitOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select unit"
                  class="w-full"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  v-model="editForm.description"
                  rows="3"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <!-- Read-only Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div>
                <h3 class="text-sm font-medium mb-1">
                  Name
                </h3>
                <p class="text-sm">
                  {{ investment.name }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-1">
                  Type
                </h3>
                <p class="text-sm">
                  {{ formatInvestmentType(investment.investment_type) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-1">
                  Purchase Amount
                </h3>
                <p class="text-sm">
                  {{ formatCurrency(investment.purchase_amount) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium mb-1">
                  Current Value
                </h3>
                <p class="text-sm">
                  {{ formatCurrency(investment.current_value || 0) }}
                </p>
              </div>

              <div v-if="investment.purchase_date">
                <h3 class="text-sm font-medium mb-1">
                  Purchase Date
                </h3>
                <p class="text-sm">
                  {{ formatDate(investment.purchase_date) }}
                </p>
              </div>

              <div v-if="investment.last_valuation_date">
                <h3 class="text-sm font-medium mb-1">
                  Last Valuation Date
                </h3>
                <p class="text-sm">
                  {{ formatDate(investment.last_valuation_date) }}
                </p>
              </div>

              <div
                v-if="investment.description"
                class="md:col-span-2"
              >
                <h3 class="text-sm font-medium mb-1">
                  Description
                </h3>
                <p class="text-sm">
                  {{ investment.description }}
                </p>
              </div>

              <!-- Real Estate Specific -->
              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Developer/Owner
                </h3>
                <p class="text-sm">
                  {{ investment.developer_owner || "N/A" }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Location
                </h3>
                <p class="text-sm">
                  {{ investment.location || "N/A" }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Delivery Date
                </h3>
                <p class="text-sm">
                  {{
                    investment.delivery_date
                      ? formatDate(investment.delivery_date)
                      : "N/A"
                  }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Construction Status
                </h3>
                <p class="text-sm">
                  {{
                    investment.construction_status
                      ? formatConstructionStatus(investment.construction_status)
                      : "N/A"
                  }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Completion Date
                </h3>
                <p class="text-sm">
                  {{
                    investment.completion_date
                      ? formatDate(investment.completion_date)
                      : "N/A"
                  }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'real_estate'">
                <h3 class="text-sm font-medium mb-1">
                  Real Estate Status
                </h3>
                <p class="text-sm">
                  {{ formatStatus(investment.real_estate_status) }}
                </p>
              </div>

              <!-- Precious Metals Specific -->
              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Metal Type
                </h3>
                <p class="text-sm">
                  {{ formatMetalType(investment.metal_type) }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Karat/Purity
                </h3>
                <p class="text-sm">
                  {{ investment.karat || "N/A" }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Condition
                </h3>
                <p class="text-sm">
                  {{
                    investment.condition
                      ? formatCondition(investment.condition)
                      : "N/A"
                  }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Form
                </h3>
                <p class="text-sm">
                  {{ investment.form ? formatForm(investment.form) : "N/A" }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Purpose
                </h3>
                <p class="text-sm">
                  {{
                    investment.purpose
                      ? formatPurpose(investment.purpose)
                      : "N/A"
                  }}
                </p>
              </div>

              <div v-if="investment.investment_type === 'precious_metals'">
                <h3 class="text-sm font-medium mb-1">
                  Amount
                </h3>
                <p class="text-sm">
                  {{
                    investment.amount
                      ? `${investment.amount} ${investment.amount_unit}`
                      : "N/A"
                  }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Document Links -->
      <Card
        v-if="investment.document_links && investment.document_links.length > 0"
      >
        <template #header>
          <h2 class="text-xl font-semibold">
            Documents
          </h2>
        </template>
        <template #content>
          <div class="space-y-3">
            <div
              v-for="(link, index) in investment.document_links"
              :key="index"
              class="flex items-center justify-between p-3 border rounded-md"
            >
              <div class="flex items-center">
                <i class="pi pi-file text-gray-400 mr-3" />
                <a
                  :href="link"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Document {{ index + 1 }}
                </a>
              </div>
              <Button
                v-if="editMode"
                icon="pi pi-trash"
                size="small"
                text
                severity="danger"
                @click="removeDocumentLink(index)"
              />
            </div>
          </div>

          <div
            v-if="editMode"
            class="mt-4"
          >
            <Button
              icon="pi pi-plus"
              label="Add Document Link"
              outlined
              @click="addDocumentLink"
            />
          </div>
        </template>
      </Card>

      <!-- Linked Budget Items -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">
              Linked Budget Items
            </h2>
            <div class="flex gap-2">
              <Button
                icon="pi pi-plus"
                label="Create Budget Item"
                outlined
                @click="showCreateBudgetModal = true"
              />
              <Button
                icon="pi pi-link"
                label="Link Existing"
                severity="primary"
                @click="goToBudgetItems"
              />
            </div>
          </div>
        </template>
        <template #content>
          <div
            v-if="linkedBudgetItems.length === 0"
            class="text-center py-8"
          >
            <i class="pi pi-briefcase text-4xl mb-3" />
            <h3 class="text-lg font-medium mb-2">
              No budget items linked
            </h3>
            <p class="mb-6">
              Link a budget item to track payments for this investment.
            </p>
          </div>

          <div v-else>
            <DataTable
              v-model:expanded-rows="expandedBudgetItems"
              :value="linkedBudgetItems"
              removable-sort
              responsive-layout="scroll"
              data-key="id"
              class="p-datatable-sm"
              striped-rows
              show-gridlines
            >
              <template #expansion="{ data }">
                <div
                  v-if="!data.transactions || data.transactions.length === 0"
                  class="p-4"
                >
                  <p class="text-sm">
                    No transactions for this budget item
                  </p>
                </div>
                <div
                  v-else
                  class="p-4"
                >
                  <h5 class="text-sm font-medium mb-3">
                    Transaction History
                  </h5>

                  <DataTable
                    :value="data.transactions || []"
                    responsive-layout="scroll"
                    class="nested-datatable"
                    striped-rows
                    show-gridlines
                  >
                    <Column
                      field="date"
                      header="Date"
                      sortable
                      style="width: 120px"
                    >
                      <template #body="{ data: transaction }">
                        <span class="font-medium">{{
                          formatDate(transaction.date)
                        }}</span>
                      </template>
                    </Column>

                    <Column
                      field="description"
                      header="Description"
                      sortable
                      style="min-width: 200px"
                    >
                      <template #body="{ data: transaction }">
                        <div class="flex items-center gap-2">
                          <div
                            :class="getTransactionTypeColor(transaction.type)"
                            class="w-3 h-3 rounded-full flex-shrink-0"
                          />
                          <span class="font-medium">{{
                            transaction.description || "Transaction"
                          }}</span>
                        </div>
                      </template>
                    </Column>

                    <Column
                      field="type"
                      header="Type"
                      sortable
                      style="width: 100px"
                    >
                      <template #body="{ data: transaction }">
                        <Tag
                          :value="transaction.type"
                          :severity="getTransactionSeverity(transaction.type)"
                          rounded
                        />
                      </template>
                    </Column>

                    <Column
                      field="amount"
                      header="Amount"
                      sortable
                      style="width: 120px"
                    >
                      <template #body="{ data: transaction }">
                        <span
                          :class="
                            transaction.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          "
                          class="font-semibold text-lg"
                        >
                          {{ transaction.type === "income" ? "+" : "-"
                          }}{{ formatCurrency(transaction.amount) }}
                        </span>
                      </template>
                    </Column>

                    <Column
                      field="account"
                      header="Account"
                      sortable
                      style="width: 120px"
                    >
                      <template #body="{ data: transaction }">
                        <span
                          v-if="transaction.accounts?.name"
                          class="font-medium"
                        >{{ transaction.accounts.name }}</span>
                        <span v-else>-</span>
                      </template>
                    </Column>

                    <Column
                      field="category"
                      header="Category"
                      sortable
                      style="width: 120px"
                    >
                      <template #body="{ data: transaction }">
                        <span
                          v-if="transaction.category"
                          class="font-medium"
                        >{{
                          transaction.category
                        }}</span>
                        <span v-else>-</span>
                      </template>
                    </Column>

                    <Column
                      field="notes"
                      header="Notes"
                      sortable
                      style="min-width: 150px"
                    >
                      <template #body="{ data: transaction }">
                        <span
                          v-if="transaction.notes"
                          class="truncate max-w-xs"
                        >{{ transaction.notes }}</span>
                        <span v-else>-</span>
                      </template>
                    </Column>

                    <Column
                      header="Actions"
                      style="width: 120px"
                    >
                      <template #body="{ data: transaction }">
                        <div class="flex gap-1">
                          <Button
                            v-tooltip.top="'Edit Transaction'"
                            icon="pi pi-pencil"
                            size="small"
                            text
                            severity="info"
                            @click="editTransaction(transaction)"
                          />
                          <Button
                            v-tooltip.top="'Delete Transaction'"
                            icon="pi pi-trash"
                            size="small"
                            text
                            severity="danger"
                            @click="deleteTransaction(transaction)"
                          />
                        </div>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>

              <Column
                expander
                style="width: 3rem"
              />

              <Column
                field="name"
                header="Name"
                sortable
                style="min-width: 200px"
              >
                <template #body="{ data }">
                  <div>
                    <div class="font-medium">
                      {{ data.name }}
                    </div>
                    <div class="text-xs">
                      {{ (data.transactions || []).length }} transactions
                    </div>
                  </div>
                </template>
              </Column>

              <Column
                field="type"
                header="Type"
                sortable
                style="width: 100px"
              >
                <template #body="{ data }">
                  <Tag
                    :value="data.type"
                    :severity="getTypeSeverity(data)"
                    rounded
                  />
                </template>
              </Column>

              <Column
                field="category"
                header="Category"
                sortable
                style="width: 120px"
              >
                <template #body="{ data }">
                  <Tag
                    :value="data.category"
                    severity="info"
                    rounded
                  />
                </template>
              </Column>

              <Column
                header="Progress"
                style="width: 150px"
              >
                <template #body="{ data }">
                  <div class="space-y-2">
                    <div class="font-medium text-center text-sm">
                      {{
                        formatCurrency(
                          calculateTotalAmount(data.actual_amounts),
                        )
                      }}
                      / {{ formatCurrency(calculateTotalAmount(data.amounts)) }}
                    </div>
                    <ProgressBar
                      :value="getProgressPercentage(data)"
                      :class="getProgressBarColor(data).replace('bg-', '')"
                      style="height: 4px"
                      :show-value="false"
                    />
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
                    :value="getBudgetItemStatus(data)"
                    :severity="getBudgetItemStatusSeverity(data)"
                    rounded
                  />
                </template>
              </Column>

              <Column
                header="Actions"
                style="width: 180px"
              >
                <template #body="{ data }">
                  <div class="flex gap-2">
                    <Button
                      v-tooltip.top="'Edit Budget Item'"
                      icon="pi pi-pencil"
                      size="small"
                      text
                      severity="info"
                      @click="editBudgetItem(data)"
                    />
                    <Button
                      v-tooltip.top="'Unlink Budget Item'"
                      icon="pi pi-times"
                      size="small"
                      text
                      severity="warning"
                      @click="unlinkBudgetItem(data)"
                    />
                    <Button
                      v-tooltip.top="'Delete Budget Item'"
                      icon="pi pi-trash"
                      size="small"
                      text
                      severity="danger"
                      @click="deleteBudgetItem(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>

    <!-- Create Budget Item Modal -->
    <AddBudgetModal
      v-model="showCreateBudgetModal"
      :selected-year="new Date().getFullYear()"
      @budget-added="handleBudgetItemCreated"
    />

    <!-- Edit Budget Item Modal -->
    <AddBudgetModal
      v-model="showEditBudgetModal"
      mode="edit"
      :budget="editingBudgetItem"
      :selected-year="editingBudgetItem?.year || new Date().getFullYear()"
      @budget-updated="handleBudgetItemUpdated"
    />
  </div>
</template>
