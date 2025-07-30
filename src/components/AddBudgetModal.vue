<template>
  <BaseModal 
    :modelValue="modelValue" 
    :loading="isLoading"
    @update:modelValue="$emit('update:modelValue', $event)">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
    </template>
    
    <template #title>Add Budget Item</template>
    <template #subtitle>Create a new budget item for {{ selectedYear }}</template>
    
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          
          <!-- Budget Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Budget Type
            </label>
            <select 
              v-model="formData.type" 
              @change="updateCategoryOnTypeChange"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="category in getCategoriesByType(formData.type)" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Maximum: {{ DATABASE_LIMITS.MAX_AMOUNT_FORMATTED }}
            </p>
          </div>
          
          <!-- Investment Direction (only for investment type) -->
          <div v-if="formData.type === BUDGET_TYPES.INVESTMENT">
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
      </div>

      <!-- Investment Linking Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Investment Linking
        </h4>
        
        <div class="space-y-4">
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

      <!-- Schedule Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Schedule & Timing
        </h4>
        
        <!-- Multi-Year Toggle -->
        <div class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <input 
            type="checkbox" 
            id="is_multi_year"
            v-model="formData.is_multi_year"
            @change="handleMultiYearToggle"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label for="is_multi_year" class="text-sm font-medium text-gray-700">
            Multi-Year Budget Item
          </label>
          <div class="flex-1">
            <p class="text-xs text-gray-500">
              Create budget items across multiple years (e.g., 5-year loans, installments)
            </p>
          </div>
        </div>

        <!-- Single Year Schedule -->
        <div v-if="!formData.is_multi_year" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Recurrence -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Recurrence
              </label>
              <select 
                v-model="formData.recurrence" 
                @change="updateSchedule"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="(label, type) in RECURRENCE_LABELS" :key="type" :value="type">
                  {{ label }}
                </option>
              </select>
            </div>
            
            <!-- Start Month (hidden for custom and one-time recurrence) -->
            <div v-if="formData.recurrence !== RECURRENCE_TYPES.CUSTOM && formData.recurrence !== RECURRENCE_TYPES.ONE_TIME">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Start Month
              </label>
              <select 
                v-model="formData.startMonth"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option 
                  v-for="monthIndex in getAvailableStartMonthIndices()" 
                  :key="monthIndex" 
                  :value="monthIndex">
                  {{ months[monthIndex] }} {{ getMonthLabel(monthIndex) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Custom Months (for custom recurrence) -->
          <div v-if="formData.recurrence === RECURRENCE_TYPES.CUSTOM" class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Select Custom Months</label>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
              <label 
                v-for="(month, index) in months" 
                :key="month" 
                class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50 border-blue-300': formData.customMonths.includes(index) }">
                <input 
                  type="checkbox" 
                  :value="index" 
                  v-model="formData.customMonths"
                  class="mr-2 text-blue-600 focus:ring-blue-500" />
                <span class="text-sm font-medium">{{ month }}</span>
              </label>
            </div>
          </div>

          <!-- One Time Month (for one-time recurrence) -->
          <div v-if="formData.recurrence === RECURRENCE_TYPES.ONE_TIME" class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Select Month</label>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
              <label 
                v-for="(month, index) in months" 
                :key="month" 
                class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50 border-blue-300': formData.oneTimeMonth === index }">
                <input 
                  type="radio" 
                  :value="index" 
                  v-model="formData.oneTimeMonth"
                  name="oneTimeMonth"
                  class="mr-2 text-blue-600 focus:ring-blue-500" />
                <span class="text-sm font-medium">{{ month }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Multi-Year Schedule -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Year -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Start Year
              </label>
              <select 
                v-model="formData.start_year"
                @change="updateMultiYearPreview"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option 
                  v-for="year in getAvailableYears()" 
                  :key="year" 
                  :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            
            <!-- Start Month -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Start Month
              </label>
              <select 
                v-model="formData.startMonth"
                @change="updateMultiYearPreview"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option 
                  v-for="(month, index) in months" 
                  :key="month" 
                  :value="index"
                  :disabled="formData.start_year === currentYear && index < currentMonth">
                  {{ month }}{{ formData.start_year === currentYear && index < currentMonth ? ' (Past)' : '' }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- End Year -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> End Year
              </label>
              <select 
                v-model="formData.end_year"
                @change="updateMultiYearPreview"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option 
                  v-for="year in getAvailableEndYears()" 
                  :key="year" 
                  :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            
            <!-- End Month -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Month (Optional)
              </label>
              <select 
                v-model="formData.end_month"
                @change="updateMultiYearPreview"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option 
                  v-for="option in MULTI_YEAR_CONSTANTS.END_MONTH_OPTIONS" 
                  :key="option.value" 
                  :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Recurrence for Multi-Year -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> Recurrence
            </label>
            <select 
              v-model="formData.recurrence" 
              @change="updateSchedule"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option v-for="(label, type) in RECURRENCE_LABELS" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Schedule Duration Preview -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Schedule Duration
                </p>
                <p class="text-xs text-gray-600">
                  From: {{ months[formData.startMonth] }} {{ formData.start_year }} 
                  → To: {{ formData.end_month !== null ? months[formData.end_month] : 'December' }} {{ formData.end_year }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">
                  {{ multiYearPreview.duration }} year{{ multiYearPreview.duration !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="space-y-4 pt-4 border-t border-gray-200">
          <h5 class="text-md font-medium text-gray-900 flex items-center">
            <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Payment Settings
          </h5>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Payment Schedule -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Payment Schedule
              </label>
              <select 
                v-model="formData.payment_schedule"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option v-for="(label, schedule) in PAYMENT_SCHEDULE_LABELS" :key="schedule" :value="schedule">
                  {{ label }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                {{ PAYMENT_SCHEDULE_DESCRIPTIONS[formData.payment_schedule] }}
              </p>
            </div>
            
            <!-- Due Date (only for custom_dates) -->
            <div v-if="formData.payment_schedule === PAYMENT_SCHEDULES.CUSTOM_DATES">
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
      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          {{ formData.is_multi_year ? 'Multi-Year' : 'Schedule' }} Preview
        </h4>
        
        <!-- Multi-Year Preview -->
        <div v-if="formData.is_multi_year" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">Total Multi-Year Amount</p>
                <p class="text-xs text-gray-600">Across {{ multiYearPreview.duration }} year{{ multiYearPreview.duration !== 1 ? 's' : '' }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(multiYearPreview.totalAmount) }}</p>
              </div>
            </div>
            
            <div v-if="multiYearPreview.yearlyBreakdown.length > 0" class="bg-white border border-gray-300 rounded-lg p-3">
              <p class="text-sm font-medium text-gray-900 mb-2">Yearly Breakdown</p>
              <div class="space-y-2">
                <div 
                  v-for="year in multiYearPreview.yearlyBreakdown" 
                  :key="year.year"
                  class="flex items-center justify-between text-sm"
                  :class="year.isFirstYear || year.isLastYear ? 'font-medium text-gray-800' : 'text-gray-700'">
                  <span>
                    {{ year.year }}
                    <span v-if="year.isFirstYear" class="text-xs text-gray-600">(First)</span>
                    <span v-if="year.isLastYear" class="text-xs text-gray-600">(Last)</span>
                  </span>
                  <span class="font-semibold">{{ formatCurrency(year.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Single Year Preview -->
        <div v-else class="bg-gray-50 rounded-lg p-4">
          <!-- Month headers -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-2">
            <div 
              v-for="(month, index) in months" 
              :key="month"
              class="text-center py-2 px-1 text-xs font-semibold text-gray-700 rounded"
              :class="getSchedulePreviewClass(index)">
              {{ month }}
            </div>
          </div>
          
          <!-- Amount values -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-3">
            <div 
              v-for="(amount, index) in generateSchedule().amounts" 
              :key="index"
              class="text-center py-2 px-1 text-xs rounded border border-gray-200 bg-white"
              :class="getAmountClass(amount)"
              :title="formatCurrency(amount)">
              <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Total Amount:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateTotalAmount()) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ getActiveMonthsCount() }} active month{{ getActiveMonthsCount() !== 1 ? 's' : '' }}
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
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isLoading">Adding...</span>
          <span v-else>{{ formData.is_multi_year ? 'Add Multi-Year Budget' : 'Add Budget Item' }}</span>
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
  RECURRENCE_TYPES, 
  RECURRENCE_LABELS, 
  INVESTMENT_DIRECTIONS, 
  INVESTMENT_DIRECTION_LABELS,
  PAYMENT_SCHEDULES,
  PAYMENT_SCHEDULE_LABELS,
  PAYMENT_SCHEDULE_DESCRIPTIONS,
  DATABASE_LIMITS,
  MULTI_YEAR_CONSTANTS
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
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'budget-added'])

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

// Modal composable
const {
  formData,
  isLoading,
  initializeFormData,
  resetFormData,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getAvailableStartMonthIndices,
  getMonthLabel,
  getSchedulePreviewClass,
  calculateTotalAmount,
  handleAddSubmit,
  handleAmountInput,
  generateSchedule,
  updateMultiYearPreview,
  getAvailableYears,
  getAvailableEndYears,
  multiYearPreview,
  handleMultiYearToggle,
  validateMultiYearSettings
} = useBudgetModals(budgetStore, computed(() => props.selectedYear), currentYear, currentMonth)

// Get amount class for styling
const getAmountClass = (amount) => {
  if (amount > 0) {
    return 'text-green-800'
  } else {
    return 'text-gray-500'
  }
}

// Get active months count
const getActiveMonthsCount = () => {
  return generateSchedule().amounts.filter(amount => amount > 0).length
}

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

// Handle form submission
const handleSubmit = async () => {
  const result = await handleAddSubmit()
  if (result) {
    closeModal()
    emit('budget-added', result)
  }
}

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    initializeFormData()
    loadAvailableInvestments()
  }
})

// Watch for multi-year form changes to update preview
watch([
  () => formData.value.is_multi_year,
  () => formData.value.start_year,
  () => formData.value.end_year,
  () => formData.value.end_month,
  () => formData.value.defaultAmount
], () => {
  updateMultiYearPreview()
}, { deep: true })
</script> 