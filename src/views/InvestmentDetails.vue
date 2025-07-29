<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <router-link
              to="/investments"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Investments
            </router-link>
            
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ investment?.name || 'Investment Details' }}</h1>
              <p class="mt-1 text-gray-600">{{ formatInvestmentType(investment?.investment_type) }}</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="editMode = !editMode"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {{ editMode ? 'Cancel Edit' : 'Edit Investment' }}
            </button>
            
            <button
              v-if="editMode"
              @click="saveChanges"
              :disabled="saving"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Investment Content -->
      <div v-else-if="investment" class="space-y-8">
        <!-- Investment Overview -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Investment Overview</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Purchase Amount</h3>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ formatCurrency(investment.purchase_amount) }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Current Value</h3>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ formatCurrency(investment.current_value || 0) }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">ROI</h3>
                <p class="mt-1 text-2xl font-semibold" :class="getROIColor(investment)">
                  {{ formatROI(investment) }}
                </p>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-500">Status</h3>
              <span :class="[
                'mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium',
                getStatusColor(investment.real_estate_status || investment.status)
              ]">
                {{ formatStatus(investment.real_estate_status || investment.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Investment Details -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Investment Details</h2>
          </div>
          <div class="p-6">
            <div v-if="editMode" class="space-y-6">
              <!-- Edit Form -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    v-model="editForm.name"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
                  <input
                    :value="formatInvestmentType(investment.investment_type)"
                    type="text"
                    disabled
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Amount</label>
                  <input
                    :value="formatCurrency(investment.purchase_amount)"
                    type="text"
                    disabled
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <input
                    v-model="editForm.current_value"
                    type="number"
                    step="0.01"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                  <input
                    v-model="editForm.purchase_date"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Valuation Date</label>
                  <input
                    v-model="editForm.last_valuation_date"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <!-- Real Estate Specific -->
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    v-model="editForm.real_estate_status"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option v-for="status in realEstateStatuses" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Developer/Owner</label>
                  <input
                    v-model="editForm.developer_owner"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    v-model="editForm.location"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                  <input
                    v-model="editForm.delivery_date"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Construction Status</label>
                  <select
                    v-model="editForm.construction_status"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select status</option>
                    <option value="under_construction">Under Construction</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                  <input
                    v-model="editForm.completion_date"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <!-- Precious Metals Specific -->
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
                  <select
                    v-model="editForm.metal_type"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select metal type</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="palladium">Palladium</option>
                    <option value="rhodium">Rhodium</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Karat/Purity</label>
                  <select
                    v-model="editForm.karat"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select karat</option>
                    <option value="24K">24 Karat</option>
                    <option value="22K">22 Karat</option>
                    <option value="21K">21 Karat</option>
                    <option value="18K">18 Karat</option>
                    <option value="14K">14 Karat</option>
                    <option value="10K">10 Karat</option>
                    <option value="9K">9 Karat</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    v-model="editForm.condition"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Form</label>
                  <select
                    v-model="editForm.form"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select form</option>
                    <option value="bars">Bars</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="coins">Coins</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <select
                    v-model="editForm.purpose"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select purpose</option>
                    <option value="investment">Investment</option>
                    <option value="personal_use_for_zakat">Personal Use (Zakat Calculation)</option>
                  </select>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    v-model="editForm.amount"
                    type="number"
                    step="0.01"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Amount Unit</label>
                  <select
                    v-model="editForm.amount_unit"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select unit</option>
                    <option value="grams">Grams</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="ounces">Ounces</option>
                    <option value="pounds">Pounds</option>
                  </select>
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    v-model="editForm.description"
                    rows="3"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <!-- Read-only Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Name</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.name }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Type</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatInvestmentType(investment.investment_type) }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Purchase Amount</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatCurrency(investment.purchase_amount) }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Current Value</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatCurrency(investment.current_value || 0) }}</p>
                </div>
                

                
                <div v-if="investment.purchase_date">
                  <h3 class="text-sm font-medium text-gray-500">Purchase Date</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(investment.purchase_date) }}</p>
                </div>
                
                <div v-if="investment.last_valuation_date">
                  <h3 class="text-sm font-medium text-gray-500">Last Valuation Date</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(investment.last_valuation_date) }}</p>
                </div>
                
                <div v-if="investment.description" class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500">Description</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.description }}</p>
                </div>
                
                <!-- Real Estate Specific -->
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Developer/Owner</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.developer_owner || 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Location</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.location || 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Delivery Date</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.delivery_date ? formatDate(investment.delivery_date) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Construction Status</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.construction_status ? formatConstructionStatus(investment.construction_status) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Completion Date</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.completion_date ? formatDate(investment.completion_date) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'real_estate'">
                  <h3 class="text-sm font-medium text-gray-500">Real Estate Status</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatStatus(investment.real_estate_status) }}</p>
                </div>
                
                <!-- Precious Metals Specific -->
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Metal Type</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatMetalType(investment.metal_type) }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Karat/Purity</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.karat || 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Condition</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.condition ? formatCondition(investment.condition) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Form</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.form ? formatForm(investment.form) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Purpose</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.purpose ? formatPurpose(investment.purpose) : 'N/A' }}</p>
                </div>
                
                <div v-if="investment.investment_type === 'precious_metals'">
                  <h3 class="text-sm font-medium text-gray-500">Amount</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ investment.amount ? `${investment.amount} ${investment.amount_unit}` : 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Links -->
        <div v-if="investment.document_links && investment.document_links.length > 0" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Documents</h2>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div
                v-for="(link, index) in investment.document_links"
                :key="index"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-md"
              >
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <a
                    :href="link"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Document {{ index + 1 }}
                  </a>
                </div>
                <button
                  v-if="editMode"
                  @click="removeDocumentLink(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="editMode" class="mt-4">
              <button
                @click="addDocumentLink"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Document Link
              </button>
            </div>
          </div>
        </div>

        <!-- Linked Budget Items -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900">Linked Budget Items</h2>
              <button
                @click="showBudgetItemModal = true"
                class="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Link Budget Item
              </button>
            </div>
          </div>
          <div class="p-6">
            <div v-if="linkedBudgetItems.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No budget items linked</h3>
              <p class="mt-1 text-sm text-gray-500">Link a budget item to track payments for this investment.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="budgetItem in linkedBudgetItems"
                :key="budgetItem.id"
                class="border rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ budgetItem.name }}</h3>
                    <p class="text-sm text-gray-600">{{ budgetItem.category }} - {{ budgetItem.type }}</p>
                  </div>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    budgetItem.type === 'income' ? 'bg-green-100 text-green-800' :
                    budgetItem.type === 'expense' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  ]">
                    {{ budgetItem.type }}
                  </span>
                </div>
                
                <div class="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Planned Amount</p>
                    <p class="text-lg font-semibold">{{ formatCurrency(calculateTotalAmount(budgetItem.amounts)) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Actual Amount</p>
                    <p class="text-lg font-semibold">{{ formatCurrency(calculateTotalAmount(budgetItem.actual_amounts)) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Transactions -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Related Transactions</h2>
          </div>
          <div class="p-6">
            <div v-if="relatedTransactions.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p class="mt-1 text-sm text-gray-500">Transactions linked to budget items will appear here.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="transaction in relatedTransactions"
                :key="transaction.id"
                class="border rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ transaction.description }}</h3>
                    <p class="text-sm text-gray-600">{{ formatDate(transaction.date) }}</p>
                  </div>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ transaction.type }}
                  </span>
                </div>
                
                <div class="mt-2">
                  <p class="text-lg font-semibold" :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(transaction.amount) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { investmentAssetsAPI } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const investment = ref(null)
const editMode = ref(false)
const showBudgetItemModal = ref(false)
const linkedBudgetItems = ref([])
const relatedTransactions = ref([])
const realEstateStatuses = ref([])

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

// Computed
const investmentId = computed(() => route.params.id)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const formatInvestmentType = (type) => {
  if (!type) return 'Unknown'
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatConstructionStatus = (status) => {
  if (!status) return 'N/A'
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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

const calculateTotalAmount = (amounts) => {
  if (!amounts || !Array.isArray(amounts)) return 0
  return amounts.reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
}

const loadInvestment = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await investmentAssetsAPI.getInvestmentAsset(investmentId.value)
    investment.value = data
    
    // Initialize edit form
    editForm.name = data.name || ''
    editForm.current_value = data.current_value || ''
    editForm.purchase_date = data.purchase_date || ''
    editForm.last_valuation_date = data.last_valuation_date || ''
    editForm.description = data.description || ''
    editForm.real_estate_status = data.real_estate_status || ''
    // Real estate specific
    editForm.delivery_date = data.delivery_date || ''
    editForm.construction_status = data.construction_status || ''
    editForm.completion_date = data.completion_date || ''
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
      linkedBudgetItems.value = Array.isArray(data.budget_items) ? data.budget_items : [data.budget_items]
    }
    
    // Load real estate statuses
    realEstateStatuses.value = await investmentAssetsAPI.getRealEstateStatuses()
    
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
      current_value: editForm.current_value ? parseFloat(editForm.current_value) : null,
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
    
    await investmentAssetsAPI.updateInvestmentAsset(investmentId.value, updates)
    
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

// Lifecycle
onMounted(() => {
  if (authStore.isAuthenticated && investmentId.value) {
    loadInvestment()
  }
})

watch(() => route.params.id, (newId) => {
  if (newId && authStore.isAuthenticated) {
    loadInvestment()
  }
})
</script> 