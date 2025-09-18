<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions.js'
import { useBudgetStore } from '@/stores/budget.js'
import { useAccountsStore } from '@/stores/accounts.js'
import { useTransactionModals } from '@/composables/useTransactionModals.js'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_ICONS,
  INVESTMENT_DIRECTIONS,
  INVESTMENT_DIRECTION_LABELS,
  DATABASE_LIMITS
} from '@/constants/budgetConstants.js'
import { formatCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'
import CurrencyInput from './CurrencyInput.vue'
import { currencyOptions } from '@/constants/currencyOptions.js'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  budgetItem: {
    type: Object,
    default: null
  },
  selectedAccount: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'transaction-added', 'transaction-updated'])

// Stores
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const accountsStore = useAccountsStore()
const toast = useToast()
const confirm = useConfirm()

// Computed
const currentYear = computed(() => transactionStore.currentYear)
const currentMonth = computed(() => transactionStore.currentMonth)
const selectedYear = computed(() => budgetStore.selectedYear)

// Available budget items for linking
const availableBudgetItems = computed(() => {
  return budgetStore.budgetItems.filter(item => item.year === selectedYear.value)
})

// Tag input
const tagInput = ref('')

// Modal composable
const {
  formData,
  isLoading,
  initializeFormData,
  resetFormData,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  handleAmountInput,
  handleTaxAmountInput,
  handleGrossAmountInput,
  handleNetAmountInput,
  handleAddSubmit,
  handleEditSubmit,
  initializeFormDataFromTransaction
} = useTransactionModals(transactionStore, selectedYear, currentYear, currentMonth, toast, confirm)

// Computed options for form fields
const typeOptions = computed(() =>
  Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value,
    label: `${TRANSACTION_TYPE_ICONS[value]} ${label}`
  }))
)

const categoryOptions = computed(() =>
  getCategoriesByType(formData.value.type).map(cat => ({ value: cat, label: cat }))
)

const investmentDirectionOptions = computed(() =>
  Object.entries(INVESTMENT_DIRECTION_LABELS).map(([value, label]) => ({ value, label }))
)

const budgetItemOptions = computed(() => [
  { label: 'No budget item linked', value: '' },
  ...availableBudgetItems.value.map(item => ({
    label: `${item.name} (${item.type} - ${item.category})`,
    value: item.id
  }))
])

const accountOptions = computed(() => [
  { label: 'Select an account', value: '' },
  ...accountsStore.accounts.map(account => ({
    label: `${getAccountIcon(account.type)} ${account.name} - ${formatCurrency(account.balance)}`,
    value: account.id
  }))
])

// Tag management
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  formData.value.tags.splice(index, 1)
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Computed for edit mode - check if it's actually a transaction (has account_id)
const isEditMode = computed(() => {
  return !!props.budgetItem && props.budgetItem.id && props.budgetItem.account_id
})

// Handle form submission
const handleSubmit = async () => {
  let result
  if (isEditMode.value) {
    result = await handleEditSubmit(props.budgetItem.id)
    if (result) {
      closeModal()
      emit('transaction-updated', result)
    }
  } else {
    result = await handleAddSubmit()
    if (result) {
      closeModal()
      emit('transaction-added', result)
    }
  }
}

// Helper functions
const getAccountIcon = (type) => accountsStore.getAccountIcon(type)

// Initialize accounts when component mounts
onMounted(async () => {
  await accountsStore.fetchAccounts()
})

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (isEditMode.value) {
      // Initialize form with transaction data for editing
      initializeFormDataFromTransaction(props.budgetItem)
    } else {
      // Initialize form for new transaction
      initializeFormData()

      // Pre-fill form if budget item is provided (for new transactions from budget items)
      if (props.budgetItem && !props.budgetItem.account_id) {
        formData.value.budget_item_id = props.budgetItem.id
        formData.value.type = props.budgetItem.type
        formData.value.category = props.budgetItem.category
        formData.value.amount = props.budgetItem.amount
        formData.value.description = props.budgetItem.name
        formData.value.date = new Date().toISOString().split('T')[0] // Today's date
      }

      // Set account based on priority: selectedAccount > defaultAccount
      if (!formData.value.account_id) {
        if (props.selectedAccount) {
          formData.value.account_id = props.selectedAccount.id
        } else if (accountsStore.defaultAccount) {
          formData.value.account_id = accountsStore.defaultAccount.id
        }
      }
    }
  }
})
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :loading="isLoading"
    :title="isEditMode ? 'Edit Transaction' : 'Add Transaction'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Content -->
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-info-circle text-primary" />
          Transaction Details
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Description
            </label>
            <InputText
              v-model="formData.description"
              required
              placeholder="e.g., Grocery shopping, Salary payment"
              class="w-full"
            />
          </div>

          <!-- Transaction Type -->
          <div>
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Transaction Type
            </label>
            <Select
              v-model="formData.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select transaction type"
              class="w-full"
              @change="updateCategoryOnTypeChange"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Category
            </label>
            <Select
              v-model="formData.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Select category"
              class="w-full"
            />
          </div>

          <!-- Investment Direction (only for investment type) -->
          <div v-if="formData.type === 'investment'">
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Investment Direction
            </label>
            <Select
              v-model="formData.investment_direction"
              :options="investmentDirectionOptions"
              option-label="label"
              option-value="value"
              placeholder="Select direction"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Financial Details Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-dollar text-green-600" />
          Financial Details
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Amount
            </label>
            <div class="relative">
              <CurrencyInput
                v-model="formData.amount"
                :options="currencyOptions"
                inputmode="decimal"
                required
                placeholder="EGP 0"
                class="w-full"
              />
            </div>
            <p class="text-xs text-surface-500 mt-1">
              Maximum: {{ DATABASE_LIMITS.MAX_AMOUNT_FORMATTED }}
            </p>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Date
            </label>
            <DatePicker
              v-model="formData.date"
              required
              date-format="yy-mm-dd"
              class="w-full"
            />
          </div>
        </div>

        <!-- Tax Tracking (optional) -->
        <div class="space-y-4 pt-4 border-t border-surface-200">
          <h5 class="text-md font-medium flex items-center gap-2">
            <i class="pi pi-calculator text-purple-600" />
            Tax Information (Optional)
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Gross Amount -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Gross Amount
              </label>
              <CurrencyInput
                v-model="formData.gross_amount"
                :options="currencyOptions"
                inputmode="decimal"
                placeholder="EGP 0"
                class="w-full"
              />
            </div>

            <!-- Tax Amount -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Tax Amount
              </label>
              <CurrencyInput
                v-model="formData.tax_amount"
                :options="currencyOptions"
                inputmode="decimal"
                placeholder="EGP 0"
                class="w-full"
              />
            </div>

            <!-- Net Amount -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Net Amount
              </label>
              <CurrencyInput
                v-model="formData.net_amount"
                :options="currencyOptions"
                inputmode="decimal"
                placeholder="EGP 0"
                class="w-full"
              />
            </div>
          </div>

          <Message
            severity="info"
            icon="pi pi-lightbulb"
          >
            Fill any two fields and the third will be calculated automatically
          </Message>
        </div>
      </div>

      <!-- Linking Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-link text-indigo-600" />
          Linking & Organization
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Budget Item Link -->
          <div>
            <label class="block text-sm font-medium mb-2">
              Link to Budget Item (Optional)
            </label>
            <Select
              v-model="formData.budget_item_id"
              :options="budgetItemOptions"
              option-label="label"
              option-value="value"
              placeholder="No budget item linked"
              class="w-full"
            />
          </div>

          <!-- Account -->
          <div>
            <label class="block text-sm font-medium mb-2">
              <span class="text-red-500">*</span> Account
            </label>
            <Select
              v-model="formData.account_id"
              :options="accountOptions"
              option-label="label"
              option-value="value"
              placeholder="Select an account"
              required
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Additional Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-tag text-orange-600" />
          Additional Information
        </h4>

        <div class="space-y-4">
          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium mb-2">
              Tags
            </label>
            <InputText
              v-model="tagInput"
              placeholder="Type a tag and press Enter"
              class="w-full"
              @keydown.enter.prevent="addTag"
            />

            <!-- Display tags -->
            <div
              v-if="formData.tags.length > 0"
              class="flex flex-wrap gap-2 mt-2"
            >
              <Tag
                v-for="(tag, index) in formData.tags"
                :key="index"
                :value="tag"
                severity="info"
                class="cursor-pointer"
                @click="removeTag(index)"
              >
                <template #icon>
                  <i class="pi pi-times text-xs" />
                </template>
              </Tag>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium mb-2">
              Notes
            </label>
            <Textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Additional notes about this transaction..."
              class="w-full"
            />
          </div>
        </div>
      </div>
    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button
          type="button"
          :disabled="isLoading"
          label="Cancel"
          outlined
          severity="secondary"
          @click="closeModal"
        />
        <Button
          type="submit"
          :disabled="isLoading"
          :loading="isLoading"
          icon="pi pi-check"
          :label="isEditMode ? 'Update Transaction' : 'Add Transaction'"
          severity="primary"
          @click="handleSubmit"
        />
      </div>
    </template>
  </BaseModal>
</template>