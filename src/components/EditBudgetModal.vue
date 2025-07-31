<template>
  <BaseModal 
    :modelValue="modelValue" 
    :loading="isLoading"
    @update:modelValue="$emit('update:modelValue', $event)">
    
    <!-- Header -->
    <template #icon>
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </template>
    
    <template #title>Edit Budget Item</template>
    <template #subtitle>Modify budget item settings for {{ selectedYear }}</template>
    
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option v-for="year in getAvailableYears()" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Multi-Year Indicator (Auto-detected) -->
          <div v-if="isMultiYear" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
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

      <!-- Current Values Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Current Monthly Values
        </h4>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <!-- Month headers -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-2">
            <div 
              v-for="(month, index) in months" 
              :key="month"
              class="text-center py-2 px-1 text-xs font-semibold text-gray-700 rounded"
              :class="getCurrentValueClass(index)">
              {{ month }}
            </div>
          </div>
          
          <!-- Amount values -->
          <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mb-3">
            <div 
              v-for="(amount, index) in formData.amounts" 
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
              <span class="font-medium">Current Total:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateCurrentTotal()) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ getCurrentActiveMonthsCount() }} active month{{ getCurrentActiveMonthsCount() !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          New Schedule Preview
        </h4>
        
        <div class="bg-gray-50 rounded-lg p-4">
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
              <span class="font-medium">New Total:</span> 
              <span class="font-semibold text-gray-800">{{ formatCurrency(calculateNewTotal()) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ getActiveMonthsCount() }} active month{{ getActiveMonthsCount() !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Multi-Year Preview Section -->
      <div v-if="isMultiYear" class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Multi-Year Breakdown
        </h4>
        
        <div class="bg-gray-50 rounded-lg p-4 space-y-4">
          <!-- Yearly breakdown -->
          <div v-for="yearData in multiYearPreview.yearlyBreakdown" :key="yearData.year" class="border border-gray-200 rounded-lg p-3 bg-white">
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-semibold text-gray-900">
                {{ yearData.year }}
                <span v-if="yearData.isFirstYear" class="text-xs text-blue-600 ml-1">(First Year)</span>
                <span v-if="yearData.isLastYear" class="text-xs text-green-600 ml-1">(Last Year)</span>
              </h5>
              <div class="text-sm font-medium text-gray-700">
                {{ formatCurrency(yearData.amount) }}
                <span class="text-xs text-gray-500 ml-1">({{ yearData.monthsCount }} months)</span>
              </div>
            </div>
            
            <!-- Monthly grid for this year -->
            <div class="space-y-2">
              <!-- Month headers -->
              <div class="grid grid-cols-12 gap-1">
                <div 
                  v-for="(month, index) in months" 
                  :key="month"
                  class="text-center py-1 px-1 text-xs font-semibold text-gray-700 rounded"
                  :class="getMultiYearMonthClass(yearData.monthlyAmounts[index], index)">
                  {{ month }}
                </div>
              </div>
              
              <!-- Amount values -->
              <div class="grid grid-cols-12 gap-1">
                <div 
                  v-for="(amount, monthIndex) in yearData.monthlyAmounts" 
                  :key="monthIndex"
                  class="text-center py-1 px-1 text-xs rounded border"
                  :class="getMultiYearAmountClass(amount, monthIndex)"
                  :title="`${months[monthIndex]}: ${formatCurrency(amount)}`">
                  <div class="font-medium">{{ formatCompactCurrency(amount) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Total summary -->
          <div class="flex justify-between items-center pt-3 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Total Multi-Year Amount:</span>
            </div>
            <div class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(multiYearPreview.totalAmount) }}
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
          <span v-if="isLoading">Updating...</span>
          <span v-else>Update Budget Item</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, watch, ref, onMounted, nextTick } from 'vue'
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
  budget: {
    type: Object,
    default: null
  },
  selectedYear: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'budget-updated'])

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
  multiYearPreview,
  initializeFormDataFromBudget,
  getCategoriesByType,
  updateCategoryOnTypeChange,
  updateSchedule,
  getAvailableStartMonthIndices,
  getMonthLabel,
  getSchedulePreviewClass,
  calculateTotalAmount,
  handleEditSubmit,
  handleAmountInput,
  generateSchedule,
  updateMultiYearPreview,
  getAvailableYears,
  getAvailableEndYears,
  getMultiYearRecurrenceOptions,
  updateLegacyRecurrence,
  getAvailableOnceMonths,
  getAvailableCustomMonths
} = useBudgetModals(budgetStore, computed(() => props.selectedYear), currentYear, currentMonth)

// Get current value class
const getCurrentValueClass = (monthIndex) => {
  if (props.selectedYear === currentYear.value && monthIndex === currentMonth.value) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  } else if (props.selectedYear === currentYear.value && monthIndex < currentMonth.value) {
    return 'bg-gray-200 text-gray-600'
  } else {
    return 'bg-gray-100 text-gray-700'
  }
}

// Get amount class
const getAmountClass = (amount) => {
  if (amount > 0) {
    return 'border-green-200 bg-green-100 text-green-800'
  } else {
    return 'border-gray-200 bg-white text-gray-400'
  }
}

// Calculate current total
const calculateCurrentTotal = () => {
  return formData.value.amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
}

// Calculate new total
const calculateNewTotal = () => {
  return calculateTotalAmount()
}

// Get active months count
const getActiveMonthsCount = () => {
  return generateSchedule().amounts.filter(amount => amount > 0).length
}

// Get current active months count
const getCurrentActiveMonthsCount = () => {
  return formData.value.amounts.filter(amount => amount > 0).length
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
  const result = await handleEditSubmit(formData.value.id)
  if (result) {
    closeModal()
    emit('budget-updated', result)
  }
}

// Watch for form data changes to debug
watch(() => formData.value.startMonth, (newValue, oldValue) => {
  console.log('Start Month changed:', { oldValue, newValue, formData: formData.value })
})

// Watch for budget changes to initialize form
watch(() => props.budget, (newBudget) => {
  if (newBudget) {
    initializeFormDataFromBudget(newBudget)
    // Ensure frequency is set to "repeats" if the budget has date fields
    if (newBudget.start_month !== undefined || newBudget.startMonth !== undefined || 
        newBudget.end_month !== undefined || newBudget.endMonth !== undefined) {
      formData.value.frequency = FREQUENCY_TYPES.REPEATS
    }
  }
}, { immediate: true })

// Watch for modal opening to initialize form
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.budget) {
    nextTick(() => {
      initializeFormDataFromBudget(props.budget)
      // Ensure frequency is set to "repeats" if the budget has date fields
      if (props.budget.start_month !== undefined || props.budget.startMonth !== undefined || 
          props.budget.end_month !== undefined || props.budget.endMonth !== undefined) {
        formData.value.frequency = FREQUENCY_TYPES.REPEATS
      }
      loadAvailableInvestments()
    })
  }
})

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

// Get multi-year month class
const getMultiYearMonthClass = (amount, index) => {
  if (amount > 0) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  } else {
    return 'bg-gray-50 border-gray-100 text-gray-400'
  }
}

// Get multi-year amount class
const getMultiYearAmountClass = (amount, index) => {
  if (amount > 0) {
    return 'border-green-200 bg-green-100 text-green-800'
  } else {
    return 'border-gray-200 bg-white text-gray-400'
  }
}
</script> 