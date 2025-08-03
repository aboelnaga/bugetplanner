<template>
      <BaseModal 
      :modelValue="modelValue" 
      :loading="isLoading"
      @update:modelValue="$emit('update:modelValue', $event)"
      :data-testid="props.mode === 'edit' ? 'edit-budget-modal' : 'add-budget-modal'">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
    </template>
    
    <template #title>{{ props.mode === 'edit' ? 'Edit Budget Item' : 'Add Budget Item' }}</template>
    <template #subtitle>{{ props.mode === 'edit' ? 'Update budget item for' : 'Create a new budget item for' }} {{ selectedYear }}</template>
    
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Basic Information
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Name
            </label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="e.g., Monthly Salary, Car Expenses"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-name-input" />
          </div>
          
          <!-- Budget Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Budget Type
            </label>
            <select 
              v-model="formData.type" 
              @change="updateCategoryOnTypeChange"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-type-select">
              <option v-for="(label, type) in BUDGET_TYPE_LABELS" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>
          
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Category
            </label>
            <select 
              v-model="formData.category"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="budget-category-select">
              <option v-for="category in getCategoriesByType(formData.type)" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Investment Linking (only for Investment type) -->
        <div v-if="formData.type === BUDGET_TYPES.INVESTMENT" class="space-y-4">
          <!-- Link to Existing Investment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Link to Investment Asset
            </label>
            <div class="space-y-2">
              <select 
                v-model="formData.linked_investment_id"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="">No investment linked</option>
                <option 
                  v-for="investment in availableInvestments" 
                  :key="investment.id" 
                  :value="investment.id">
                  {{ investment.name }} ({{ formatInvestmentType(investment.investment_type) }})
                </option>
              </select>
              
              <div v-if="formData.linked_investment_id" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-900">
                      {{ getLinkedInvestmentName() }}
                    </p>
                    <p class="text-xs text-blue-700">
                      Purchase: {{ formatCurrency(getLinkedInvestmentPurchaseAmount()) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="formData.linked_investment_id = ''"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            </div>
            
            <p class="text-xs text-gray-500 mt-1">
              Link this budget item to an existing investment asset to track payments and returns.
            </p>
          </div>
        </div>
      </div>

      <!-- Financial Details Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          Financial Details
        </h4>
        
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Default Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Default Amount
          </label>
            <div class="relative">
              <input 
                :value="formatCurrency(formData.defaultAmount)"
                @input="handleAmountInput"
                type="text" 
                required 
                placeholder="EGP 0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                data-testid="default-amount-input" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Maximum: {{ DATABASE_LIMITS.MAX_AMOUNT_FORMATTED }}
            </p>
          </div>
          
          <!-- Payment Schedule -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Payment Schedule
            </label>
            <select 
              v-model="formData.payment_schedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="payment-schedule-select">
              <option v-for="(label, schedule) in PAYMENT_SCHEDULE_LABELS" :key="schedule" :value="schedule">
                {{ label }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ PAYMENT_SCHEDULE_DESCRIPTIONS[formData.payment_schedule] }}
            </p>
          </div>
        </div>

        <!-- Investment Direction (only for investment type) -->
        <div v-if="formData.type === BUDGET_TYPES.INVESTMENT" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Investment Direction
            </label>
            <select 
              v-model="formData.investment_direction"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, direction) in INVESTMENT_DIRECTION_LABELS" :key="direction" :value="direction">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Due Date (only for custom_dates) -->
        <div v-if="formData.payment_schedule === PAYMENT_SCHEDULES.CUSTOM_DATES" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Day of Month)
            </label>
            <select 
              v-model="formData.due_date"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="">Select day</option>
              <option v-for="day in 31" :key="day" :value="day">
                {{ day }}{{ getDaySuffix(day) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fixed Expense and Reminder Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fixed Expense Toggle -->
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="is_fixed_expense"
              v-model="formData.is_fixed_expense"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="is_fixed_expense" class="text-sm font-medium text-gray-700">
              Fixed Expense
            </label>
            <div class="flex-1">
              <p class="text-xs text-gray-500">
                Amount doesn't change month to month
              </p>
            </div>
          </div>
          
          <!-- Reminder Toggle -->
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="reminder_enabled"
              v-model="formData.reminder_enabled"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="reminder_enabled" class="text-sm font-medium text-gray-700">
              Enable Reminders
            </label>
            <div class="flex-1">
              <p class="text-xs text-gray-500">
                Get notified before due date
              </p>
            </div>
          </div>
        </div>

        <!-- Reminder Days Before (only if reminders enabled) -->
        <div v-if="formData.reminder_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Remind Me (Days Before)
            </label>
            <select 
              v-model="formData.reminder_days_before"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="days in [1, 2, 3, 5, 7, 10, 14, 21, 30]" :key="days" :value="days">
                {{ days }} day{{ days !== 1 ? 's' : '' }} before
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Schedule & Timing
        </h4>
        
        <!-- Single Year Schedule -->
        <div class="space-y-4">
          <!-- New Recurrence System -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Frequency -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Frequency
              </label>
              <select 
                id="frequency"
                name="frequency"
                v-model="formData.frequency" 
                @change="updateSchedule"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                data-testid="frequency-select">
                <option v-for="(label, type) in FREQUENCY_LABELS" :key="type" :value="type">
                  {{ label }}
                </option>
              </select>
            </div>
            
            <!-- Recurrence Interval (only for repeats) -->
            <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Recurrence Interval
              </label>
              <select 
                id="recurrenceInterval"
                name="recurrenceInterval"
                v-model="formData.recurrenceInterval"
                @change="updateSchedule"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                data-testid="recurrence-interval-select">
                <option v-for="interval in RECURRENCE_INTERVALS" :key="interval.value" :value="interval.value">
                  {{ interval.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Date Selection -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date
                <span class="text-xs text-gray-500 ml-1">
                  ({{ formData.startYear === currentYear ? 'Current year: months ≥ ' + MONTHS[currentMonth] : formData.startYear > currentYear ? 'Future year: all months available' : 'Past year: all months available' }})
                </span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <select 
                  id="startMonth"
                  name="startMonth"
                  v-model="formData.startMonth"
                  @change="updateLegacyRecurrence"
                  data-testid="start-month-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option 
                    v-for="month in MONTH_OPTIONS" 
                    :key="month.value" 
                    :value="month.value"
                    :disabled="!getAvailableStartMonthIndices().find(m => m.value === month.value)"
                    :class="{ 'text-gray-400': !getAvailableStartMonthIndices().find(m => m.value === month.value) }">
                    {{ month.label }}
                  </option>
                </select>
                <select 
                  id="startYear"
                  name="startYear"
                  v-model="formData.startYear"
                  @change="updateLegacyRecurrence"
                  data-testid="start-year-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option v-for="year in getAvailableYears()" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- End Date Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> End Date Type
              </label>
              <select 
                id="endType"
                name="endType"
                v-model="formData.endType"
                @change="updateLegacyRecurrence"
                data-testid="end-type-select"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="(label, type) in END_TYPE_LABELS" :key="type" :value="type">
                  {{ label }}
                </option>
              </select>
            </div>
          </div>

          <!-- End Date Options -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS && formData.endType === END_TYPES.SPECIFIC_DATE" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- End Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> End Date
              </label>
              <div class="grid grid-cols-2 gap-2">
                <select 
                  id="endMonth"
                  name="endMonth"
                  v-model="formData.endMonth"
                  @change="updateLegacyRecurrence"
                  data-testid="end-month-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option v-for="month in MONTH_OPTIONS" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
                <select 
                  id="endYear"
                  name="endYear"
                  v-model="formData.endYear"
                  @change="updateLegacyRecurrence"
                  data-testid="end-year-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option v-for="year in getAvailableEndYears()" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Occurrences Option -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.REPEATS && formData.endType === END_TYPES.AFTER_OCCURRENCES" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Number of Occurrences
              </label>
              <input 
                id="occurrences"
                name="occurrences"
                v-model.number="formData.occurrences"
                @change="updateLegacyRecurrence"
                type="number" 
                min="1" 
                max="120"
                data-testid="occurrences-input"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              <p class="text-xs text-gray-500 mt-1">
                Maximum: 120 occurrences (10 years)
              </p>
            </div>
          </div>

          <!-- Custom Months (for custom frequency) -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.CUSTOM" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Select Custom Months</label>
              <p class="text-xs text-gray-500 mt-1">Custom months for current year only (past months are disabled)</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
              <label 
                v-for="(month, index) in months" 
                :key="month" 
                class="flex items-center p-3 border border-gray-200 rounded-lg transition-colors"
                :class="{ 
                  'bg-blue-50 border-blue-300': formData.customMonths.includes(index),
                  'cursor-pointer hover:bg-gray-50': index >= currentMonth,
                  'cursor-not-allowed bg-gray-100 opacity-50': index < currentMonth
                }">
                <input 
                  type="checkbox" 
                  :value="index" 
                  v-model="formData.customMonths"
                  @change="updateSchedule"
                  :disabled="index < currentMonth"
                  :data-testid="`custom-month-${index}`"
                  class="mr-2 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
                <span class="text-sm font-medium" :class="{ 'text-gray-400': index < currentMonth }">{{ month }}</span>
              </label>
            </div>
          </div>

          <!-- One Time Date (for once frequency) -->
          <div v-if="formData.frequency === FREQUENCY_TYPES.ONCE" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">One-Time Date</label>
              <p class="text-xs text-gray-500 mt-1">
                {{ formData.oneTimeYear === currentYear ? 'Current year: months ≥ ' + MONTHS[currentMonth] : formData.oneTimeYear > currentYear ? 'Future year: all months available' : 'Past year: all months available' }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Month</label>
                <select 
                  id="oneTimeMonth"
                  name="oneTimeMonth"
                  v-model="formData.oneTimeMonth"
                  @change="updateLegacyRecurrence"
                  data-testid="one-time-month-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option 
                    v-for="month in getAvailableOnceMonths()" 
                    :key="month.value" 
                    :value="month.value"
                    :disabled="!getAvailableOnceMonths().find(m => m.value === month.value)"
                    :class="{ 'text-gray-400': !getAvailableOnceMonths().find(m => m.value === month.value) }">
                    {{ month.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Year</label>
                <select 
                  id="oneTimeYear"
                  name="oneTimeYear"
                  v-model="formData.oneTimeYear"
                  @change="updateLegacyRecurrence"
                  data-testid="one-time-year-select"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option v-for="year in getAvailableYears()" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Multi-Year Indicator (Auto-detected) -->
          <div v-if="isMultiYear" class="bg-blue-50 border border-blue-200 rounded-lg p-3" data-testid="multi-year-indicator">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-blue-900">Multi-Year Budget Item</p>
                <p class="text-xs text-blue-700">
                  This budget spans {{ getMultiYearDuration() }} year{{ getMultiYearDuration() !== 1 ? 's' : '' }} 
                  ({{ formData.startYear }} - {{ getCalculatedEndYear() }})
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Schedule Preview
        </h4>
        
        <!-- Unified Schedule Preview -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" :data-testid="isMultiYear ? 'multi-year-preview' : 'schedule-preview'">
          <div class="space-y-4">
            <!-- Overall Summary -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ isMultiYear ? 'Total Multi-Year Amount' : 'Total Amount' }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ isMultiYear ? `Across ${schedulePreviewData.duration} year${schedulePreviewData.duration !== 1 ? 's' : ''}` : `${schedulePreviewData.yearlyBreakdown[0]?.monthsCount || 0} active month${(schedulePreviewData.yearlyBreakdown[0]?.monthsCount || 0) !== 1 ? 's' : ''}` }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(schedulePreviewData.totalAmount) }}</p>
              </div>
            </div>
            
            <!-- Yearly Breakdown with Monthly Grid -->
            <div v-if="schedulePreviewData.yearlyBreakdown.length > 0" class="space-y-4">
              <p class="text-sm font-medium text-gray-900">
                {{ isMultiYear ? 'Yearly Breakdown' : `${schedulePreviewData.yearlyBreakdown[0]?.year || props.selectedYear} Schedule` }}
              </p>
              
              <div v-for="year in schedulePreviewData.yearlyBreakdown" :key="year.year" class="bg-white border border-gray-300 rounded-lg p-3">
                <!-- Year Header -->
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-gray-900">{{ year.year }}</span>
                    <span v-if="year.isFirstYear && isMultiYear" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">First</span>
                    <span v-if="year.isLastYear && isMultiYear" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Last</span>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(year.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ year.monthsCount }} month{{ year.monthsCount !== 1 ? 's' : '' }}</p>
                  </div>
                </div>
                
                <!-- Monthly Grid -->
                <div class="space-y-2">
                  <!-- Month headers -->
                  <div class="grid grid-cols-12 gap-1">
                    <div 
                      v-for="(month, index) in months" 
                      :key="month"
                      class="text-center py-1 px-1 text-xs font-semibold text-gray-700 rounded"
                      :class="getScheduleMonthClass(year.monthlyAmounts[index], index)">
                      {{ month }}
                    </div>
                  </div>
                  
                  <!-- Amount values -->
                  <div class="grid grid-cols-12 gap-1">
                    <div 
                      v-for="(amount, index) in year.monthlyAmounts" 
                      :key="index"
                      class="text-center py-2 px-1 text-xs rounded border"
                      :class="getScheduleAmountClass(amount, index)"
                      :title="formatCurrency(amount)">
                      <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    
    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end space-x-3 w-full">
        <button 
          type="button" 
          @click="closeModal" 
          :disabled="isLoading" 
          class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Cancel
        </button>
        <button 
          type="submit" 
          @click="handleSubmit"
          :disabled="isLoading" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          data-testid="submit-budget-btn">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isLoading">{{ props.mode === 'edit' ? 'Updating...' : 'Adding...' }}</span>
          <span v-else>{{ props.mode === 'edit' ? 'Update Budget Item' : (formData.is_multi_year ? 'Add Multi-Year Budget' : 'Add Budget Item') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget.js'
import { useInvestmentAssetsStore } from '@/stores/investmentAssets.js'
import { useBudgetModals } from '@/composables/useBudgetModals.js'
import { 
  MONTHS, 
  BUDGET_TYPES, 
  BUDGET_TYPE_LABELS, 
  RECURRENCE_LABELS, 
  INVESTMENT_DIRECTIONS, 
  INVESTMENT_DIRECTION_LABELS,
  PAYMENT_SCHEDULES,
  PAYMENT_SCHEDULE_LABELS,
  PAYMENT_SCHEDULE_DESCRIPTIONS,
  DATABASE_LIMITS,
  MULTI_YEAR_CONSTANTS,
  FREQUENCY_TYPES,
  FREQUENCY_LABELS,
  RECURRENCE_INTERVALS,
  MONTH_OPTIONS,
  END_TYPES,
  END_TYPE_LABELS
} from '@/constants/budgetConstants.js'
import { formatCurrency, formatCompactCurrency } from '@/utils/budgetUtils.js'
import BaseModal from './BaseModal.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedYear: {
    type: Number,
    required: true
  },
  budget: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add',
    validator: value => ['add', 'edit'].includes(value)
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'budget-added', 'budget-updated'])

// Store
const budgetStore = useBudgetStore()
const investmentAssetsStore = useInvestmentAssetsStore()

// Constants
const months = MONTHS

// Investment linking
const availableInvestments = ref([])

// Computed
const currentYear = computed(() => budgetStore.currentYear)
const currentMonth = computed(() => budgetStore.currentMonth)

// Auto-detect multi-year based on start/end years
const isMultiYear = computed(() => {
  if (formData.value.frequency === FREQUENCY_TYPES.REPEATS) {
    if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
      return formData.value.endYear > formData.value.startYear
    } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
      // For occurrences, calculate if it spans multiple years
      const totalMonths = formData.value.occurrences * formData.value.recurrenceInterval
      const startDate = new Date(formData.value.startYear, formData.value.startMonth)
      const endDate = new Date(startDate.getTime() + (totalMonths * 30 * 24 * 60 * 60 * 1000))
      return endDate.getFullYear() > startDate.getFullYear()
    }
  }
  // For once and custom, it's never multi-year
  return false
})

// Modal composable
const {
  formData,
  isLoading,
  initializeFormData,
  initializeFormDataFromBudget,
  resetFormData,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getAvailableStartMonthIndices,
  getMonthLabel,
  getSchedulePreviewClass,
  calculateTotalAmount,
  handleAmountInput,
  generateSchedule,
  updateMultiYearPreview,
  getAvailableYears,
  getAvailableEndYears,
  multiYearPreview,
  updateLegacyRecurrence,
  getAvailableOnceMonths
  // Removed: handleAddSubmit, handleEditSubmit, handleMultiYearEditSubmit, handleSingleYearEditSubmit
  // Removed: getMultiYearRecurrenceOptions, handleMultiYearToggle, validateMultiYearSettings, getAvailableCustomMonths
  // These are now replaced by our unified handlers or not needed
} = useBudgetModals(budgetStore, computed(() => props.selectedYear), currentYear, currentMonth)

// Watch for budget type changes to clear linked investment
watch(() => formData.value.type, (newType, oldType) => {
  if (oldType === BUDGET_TYPES.INVESTMENT && newType !== BUDGET_TYPES.INVESTMENT) {
    formData.value.linked_investment_id = ''
  }
})

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.budget) {
      console.log('Initializing form with budget for edit:', props.budget)
      initializeFormDataFromBudget(props.budget)
    } else {
      initializeFormData()
      // Ensure frequency is set to "repeats" by default for add mode
      formData.value.frequency = FREQUENCY_TYPES.REPEATS
    }
    loadAvailableInvestments()
  }
})

// Watch for budget changes in edit mode
watch(() => props.budget, (newBudget) => {
  if (newBudget && props.modelValue && props.mode === 'edit') {
    console.log('Budget changed, reinitializing form:', newBudget)
    initializeFormDataFromBudget(newBudget)
  }
})

// Watch for form changes to update preview (both single-year and multi-year)
watch([
  () => formData.value.frequency,
  () => formData.value.startMonth,
  () => formData.value.startYear,
  () => formData.value.endMonth,
  () => formData.value.endYear,
  () => formData.value.endType,
  () => formData.value.recurrenceInterval,
  () => formData.value.occurrences,
  () => formData.value.customMonths,
  () => formData.value.oneTimeMonth,
  () => formData.value.oneTimeYear,
  () => formData.value.defaultAmount,
  // Legacy fields for backward compatibility
  () => formData.value.is_multi_year,
  () => formData.value.start_year,
  () => formData.value.end_year,
  () => formData.value.end_month
], () => {
  // Update multi-year preview if available
  if (updateMultiYearPreview) {
    updateMultiYearPreview()
  }
}, { deep: true })

// Removed getAmountClass - now using unified getScheduleAmountClass

// Get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

// Investment linking helpers
const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getLinkedInvestmentName = () => {
  if (!formData.value.linked_investment_id) return ''
  const investment = availableInvestments.value.find(inv => inv.id === formData.value.linked_investment_id)
  return investment?.name || ''
}

const getLinkedInvestmentPurchaseAmount = () => {
  if (!formData.value.linked_investment_id) return 0
  const investment = availableInvestments.value.find(inv => inv.id === formData.value.linked_investment_id)
  return investment?.purchase_amount || 0
}

const loadAvailableInvestments = async () => {
  try {
    await investmentAssetsStore.fetchInvestmentAssets()
    availableInvestments.value = investmentAssetsStore.investmentAssets || []
  } catch (error) {
    console.error('Error loading investments:', error)
    availableInvestments.value = []
  }
}

// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Unified budget submission handler
const handleSubmit = async () => {
  console.log('AddBudgetModal handleSubmit called, mode:', props.mode)
  
  try {
    // Use the same schedule data that preview uses (single source of truth)
    const scheduleData = schedulePreviewData.value
    console.log('Using schedule data:', scheduleData)
    
    let result
    if (props.mode === 'edit') {
      console.log('Edit mode - budget:', props.budget)
      if (!props.budget || !props.budget.id) {
        console.error('No budget to edit')
        return
      }
      
      // Use unified submit logic for both single and multi-year edits
      result = await handleUnifiedEditSubmit(props.budget.id, scheduleData)
    } else {
      // Use unified submit logic for both single and multi-year adds
      result = await handleUnifiedAddSubmit(scheduleData)
    }
    
    console.log('Submit result:', result)
    
    if (result) {
      console.log('Budget operation successful, closing modal')
      closeModal()
      emit(props.mode === 'edit' ? 'budget-updated' : 'budget-added', result)
    } else {
      console.log('Budget operation failed, keeping modal open')
      const errorMessage = `Failed to ${props.mode === 'edit' ? 'update' : 'create'} budget item "${formData.value.name}". Please try again.`
      console.log('Error message:', errorMessage)
      
      // Show error toast
      if (window.$toaster) {
        window.$toaster.error('Error', errorMessage)
      }
    }
  } catch (error) {
    console.error('Budget submission error:', error)
    const errorMessage = `Error ${props.mode === 'edit' ? 'updating' : 'creating'} budget item "${formData.value.name}": ${error.message || 'Unknown error'}`
    console.log('Error message:', errorMessage)
    
    // Show error toast
    if (window.$toaster) {
      window.$toaster.error('Error', errorMessage)
    }
  }
}

// Unified add submit handler
const handleUnifiedAddSubmit = async (scheduleData) => {
  if (isMultiYear.value) {
    console.log('Creating multi-year budget with schedule data')
    return await handleMultiYearAddSubmit(scheduleData)
  } else {
    console.log('Creating single-year budget with schedule data')
    return await handleSingleYearAddSubmit(scheduleData)
  }
}

// Unified edit submit handler
const handleUnifiedEditSubmit = async (budgetId, scheduleData) => {
  if (isMultiYear.value) {
    console.log('Updating multi-year budget with schedule data')
    return await handleMultiYearEditWithSchedule(budgetId, scheduleData)
  } else {
    console.log('Updating single-year budget with schedule data')
    return await handleSingleYearEditWithSchedule(budgetId, scheduleData)
  }
}

// Multi-year edit using schedule data
const handleMultiYearEditWithSchedule = async (budgetId, scheduleData) => {
  try {
    // Use existing updateMultiYearBudgetItems but with calculated data
    const updateData = createBudgetDataFromSchedule(formData.value, scheduleData.yearlyBreakdown[0])
    return await budgetStore.updateMultiYearBudgetItems(props.budget.linked_group_id, updateData)
  } catch (error) {
    console.error('Multi-year edit error:', error)
    return null
  }
}

// Single-year edit using schedule data  
const handleSingleYearEditWithSchedule = async (budgetId, scheduleData) => {
  try {
    const updateData = createBudgetDataFromSchedule(formData.value, scheduleData.yearlyBreakdown[0])
    return await budgetStore.updateBudgetItem(budgetId, updateData)
  } catch (error) {
    console.error('Single-year edit error:', error)
    return null
  }
}

// Single-year add using schedule data
const handleSingleYearAddSubmit = async (scheduleData) => {
  // Use the calculated amounts from schedule data instead of recalculating
  const yearData = scheduleData.yearlyBreakdown[0]
  const budgetData = createBudgetDataFromSchedule(formData.value, yearData)
  
  try {
    return await budgetStore.addBudgetItemFromSchedule(budgetData)
  } catch (error) {
    console.error('Single-year add error:', error)
    return null
  }
}

// Multi-year add using schedule data
const handleMultiYearAddSubmit = async (scheduleData) => {
  // Use the calculated yearly breakdown instead of recalculating
  const budgetDataArray = scheduleData.yearlyBreakdown.map(yearData => 
    createBudgetDataFromSchedule(formData.value, yearData)
  )
  
  try {
    return await budgetStore.addMultiYearBudgetFromSchedule(budgetDataArray, formData.value)
  } catch (error) {
    console.error('Multi-year add error:', error)
    return null
  }
}

// Helper function to create budget data from schedule data
const createBudgetDataFromSchedule = (formData, yearData) => {
  return {
    name: formData.name,
    type: formData.type,
    category: formData.category,
    default_amount: formData.defaultAmount,
    payment_schedule: formData.payment_schedule,
    due_date: formData.due_date || null,
    is_fixed_expense: formData.is_fixed_expense,
    reminder_enabled: formData.reminder_enabled,
    reminder_days_before: formData.reminder_days_before,
    investment_direction: formData.investment_direction,
    linked_investment_id: formData.linked_investment_id,
    // Schedule-specific fields
    year: yearData.year,
    frequency: formData.frequency,
    recurrence_interval: formData.recurrenceInterval,
    start_month: formData.startMonth,
    start_year: formData.startYear,
    end_month: formData.endMonth,
    end_year: formData.endYear,
    end_type: formData.endType,
    occurrences: formData.occurrences,
    custom_months: formData.customMonths,
    one_time_month: formData.oneTimeMonth,
    one_time_year: formData.oneTimeYear,
    // Legacy recurrence field (required by database schema)
    recurrence: 'monthly',
    // Pre-calculated amounts (single source of truth)
    amounts: yearData.monthlyAmounts,
    is_multi_year: isMultiYear.value
    // Note: total_amount and months_count removed - not needed in database, only used for UI display
  }
}

// Get multi-year duration
const getMultiYearDuration = () => {
  if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
    return formData.value.endYear - formData.value.startYear + 1
  } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
    // Calculate the actual duration by finding the end year
    const calculatedEndYear = getCalculatedEndYear()
    return calculatedEndYear - formData.value.startYear + 1
  }
  return 0
}

// Get calculated end year for occurrence-based endings
const getCalculatedEndYear = () => {
  if (formData.value.endType === END_TYPES.SPECIFIC_DATE) {
    return formData.value.endYear
  } else if (formData.value.endType === END_TYPES.AFTER_OCCURRENCES) {
    // Calculate the actual end year from occurrences
    let currentMonth = formData.value.startMonth
    let currentYear = formData.value.startYear
    let occurrenceCount = 0
    
    while (occurrenceCount < formData.value.occurrences) {
      // Move to next occurrence
      currentMonth += formData.value.recurrenceInterval
      
      // Handle year rollover
      while (currentMonth >= 12) {
        currentMonth -= 12
        currentYear++
      }
      
      occurrenceCount++
    }
    
    return currentYear
  }
  return formData.value.endYear
}

// Unified schedule preview data (computed for reactivity)
const schedulePreviewData = computed(() => {
  if (isMultiYear.value && multiYearPreview.value) {
    return multiYearPreview.value
  } else {
    // Generate single-year preview data in the same format as multi-year
    const schedule = generateSchedule()
    const totalAmount = calculateTotalAmount()
    
    // Use the actual year from form data, not props.selectedYear
    const actualYear = formData.value.frequency === FREQUENCY_TYPES.ONCE 
      ? formData.value.oneTimeYear 
      : formData.value.startYear || props.selectedYear
    
    // Calculate active months from the schedule
    const activeMonths = schedule.amounts.filter(amount => amount > 0).length
    
    return {
      duration: 1,
      totalAmount: totalAmount,
      yearlyBreakdown: [{
        year: actualYear,
        amount: totalAmount,
        monthsCount: activeMonths,
        monthlyAmounts: schedule.amounts,
        isFirstYear: true,
        isLastYear: true
      }]
    }
  }
})

// Unified class for schedule month headers
const getScheduleMonthClass = (amount, index) => {
  if (amount > 0) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  } else if (index < currentMonth.value) {
    return 'bg-gray-100 opacity-50'
  } else {
    return 'bg-gray-50 border-gray-200'
  }
}

// Unified class for schedule amount values
const getScheduleAmountClass = (amount, index) => {
  if (amount > 0) {
    return 'border-green-200 bg-green-100 text-green-800'
  } else {
    return 'border-gray-200 bg-white text-gray-400'
  }
}
</script> 