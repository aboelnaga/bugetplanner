<template>
  <div class="zakat-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-moon text-primary mr-2" />
        Zakat Calculator
      </h1>
      <p class="page-subtitle">
        Calculate and track your Zakat obligations with Hawl management
      </p>
    </div>

    <!-- Main Content -->
    <div class="zakat-content">
      <!-- Onboarding Flow -->
      <div
        v-if="!hawlStore.currentHawl"
        class="onboarding-section"
      >
        <Card class="onboarding-card">
          <template #header>
            <div class="card-header">
              <h2>Welcome to Zakat Calculator</h2>
              <p>Let's set up your Zakat tracking</p>
            </div>
          </template>

          <template #content>
            <div class="onboarding-steps">
              <!-- Step 1: Previous Zakat Payment Question -->
              <div
                class="step"
                :class="{
                  active: currentStep === 1,
                  completed: currentStep > 1,
                }"
              >
                <div class="step-header">
                  <div class="step-number">
                    1
                  </div>
                  <h3>Previous Zakat Payment</h3>
                </div>

                <div
                  v-if="currentStep === 1"
                  class="step-content"
                >
                  <p class="question">
                    Have you paid Zakat before?
                  </p>
                  <div class="button-group">
                    <Button
                      label="Yes, I have paid Zakat before"
                      :class="{
                        'p-button-success': hasPaidZakatBefore === true,
                      }"
                      class="mr-2"
                      @click="setHasPaidZakatBefore(true)"
                    />
                    <Button
                      label="No, this is my first time"
                      :class="{
                        'p-button-success': hasPaidZakatBefore === false,
                      }"
                      outlined
                      @click="setHasPaidZakatBefore(false)"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 2: Previous Payment Details (if applicable) -->
              <div
                v-if="hasPaidZakatBefore"
                class="step"
                :class="{
                  active: currentStep === 2,
                  completed: currentStep > 2,
                }"
              >
                <div class="step-header">
                  <div class="step-number">
                    2
                  </div>
                  <h3>Previous Payment Details</h3>
                </div>

                <div
                  v-if="currentStep === 2"
                  class="step-content"
                >
                  <div class="form-grid">
                    <div class="form-field">
                      <label for="lastPaymentDate">When did you last pay Zakat?</label>
                      <Calendar
                        id="lastPaymentDate"
                        v-model="previousPaymentData.date"
                        date-format="mm/dd/yy"
                        placeholder="Select date"
                        class="w-full"
                      />
                    </div>

                    <div class="form-field">
                      <label for="lastPaymentAmount">What was the amount paid?</label>
                      <InputNumber
                        id="lastPaymentAmount"
                        v-model="previousPaymentData.amount"
                        mode="currency"
                        currency="EGP"
                        locale="en-US"
                        placeholder="Enter amount"
                        class="w-full"
                      />
                    </div>

                    <div class="form-field">
                      <label>Calculated Asset Value</label>
                      <div class="calculated-value">
                        {{
                          calculateAssetValueFromZakat(
                            previousPaymentData.amount,
                          )
                        }}
                        EGP
                        <small class="text-surface-500">(Calculated from Zakat amount: 2.5% of assets)</small>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions">
                    <Button
                      label="Continue"
                      :disabled="!isPreviousPaymentDataValid"
                      class="p-button-primary"
                      @click="proceedToStep(3)"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 3: Asset Continuity Check -->
              <div
                class="step"
                :class="{
                  active: currentStep === 3,
                  completed: currentStep > 3,
                }"
              >
                <div class="step-header">
                  <div class="step-number">
                    {{ hasPaidZakatBefore ? "3" : "2" }}
                  </div>
                  <h3>Asset Continuity</h3>
                </div>

                <div
                  v-if="currentStep === 3"
                  class="step-content"
                >
                  <p class="question">
                    {{
                      hasPaidZakatBefore
                        ? "Have your assets been above the Nisab threshold continuously since your last payment?"
                        : "Are your current assets above the Nisab threshold?"
                    }}
                  </p>

                  <!-- Additional question for users without payment data -->
                  <div
                    v-if="hasPaidZakatBefore && !previousPaymentData.date"
                    class="continuity-explanation"
                  >
                    <p class="text-sm text-surface-600 mb-3">
                      Since you don't have a specific payment date, we need to
                      know if your assets have been above Nisab continuously.
                      This helps us determine when your Hawl (Zakat year) should
                      start according to Islamic law.
                    </p>
                  </div>

                  <!-- Price Input for Nisab Calculation -->
                  <div class="price-input-section">
                    <h4>Set Gold & Silver Prices for Nisab Calculation</h4>
                    <p class="text-sm text-surface-600 mb-4">
                      We need current gold and silver prices to calculate the
                      Nisab threshold (minimum wealth required for Zakat).
                    </p>

                    <div class="price-inputs">
                      <div class="price-field">
                        <label for="goldPriceStep3">Gold Price (per gram)</label>
                        <InputNumber
                          id="goldPriceStep3"
                          v-model="goldPriceInput"
                          mode="currency"
                          currency="EGP"
                          locale="en-US"
                          placeholder="Enter gold price"
                          class="w-full"
                          @update:model-value="updateGoldPrice"
                        />
                      </div>

                      <div class="price-field">
                        <label for="silverPriceStep3">Silver Price (per gram)</label>
                        <InputNumber
                          id="silverPriceStep3"
                          v-model="silverPriceInput"
                          mode="currency"
                          currency="EGP"
                          locale="en-US"
                          placeholder="Enter silver price"
                          class="w-full"
                          @update:model-value="updateSilverPrice"
                        />
                      </div>
                    </div>

                    <!-- Price Sources -->
                    <div class="price-sources">
                      <h5>Get Current Prices From:</h5>
                      <div class="source-links">
                        <a
                          href="https://www.goldprice.org/"
                          target="_blank"
                          class="source-link"
                        >
                          <i class="pi pi-external-link mr-1" />
                          Gold Price.org
                        </a>
                        <a
                          href="https://www.silverprice.org/"
                          target="_blank"
                          class="source-link"
                        >
                          <i class="pi pi-external-link mr-1" />
                          Silver Price.org
                        </a>
                        <a
                          href="https://www.metals.live/"
                          target="_blank"
                          class="source-link"
                        >
                          <i class="pi pi-external-link mr-1" />
                          Metals.live
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Nisab Calculation Method Selection -->
                  <div class="nisab-method-selection">
                    <h5>Choose Nisab Calculation Method</h5>
                    <p class="text-sm text-surface-600 mb-3">
                      Choose how to calculate the Nisab threshold. This
                      determines the minimum wealth required for Zakat
                      eligibility:
                    </p>

                    <div class="nisab-method-options">
                      <div
                        class="nisab-method-option"
                        :class="{
                          selected: nisabCalculationMethod === 'silver',
                        }"
                      >
                        <Button
                          :label="`Silver Standard (${hawlStore.nisabDetails.silver?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
                          :severity="
                            nisabCalculationMethod === 'silver'
                              ? 'primary'
                              : 'secondary'
                          "
                          :outlined="nisabCalculationMethod !== 'silver'"
                          class="w-full"
                          @click="setNisabCalculationMethod('silver')"
                        />
                        <p class="text-xs text-surface-600 mt-1">
                          Lower threshold - More people eligible for Zakat
                        </p>
                      </div>

                      <div
                        class="nisab-method-option"
                        :class="{ selected: nisabCalculationMethod === 'gold' }"
                      >
                        <Button
                          :label="`Gold Standard (${hawlStore.nisabDetails.gold?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
                          :severity="
                            nisabCalculationMethod === 'gold'
                              ? 'primary'
                              : 'secondary'
                          "
                          :outlined="nisabCalculationMethod !== 'gold'"
                          class="w-full"
                          @click="setNisabCalculationMethod('gold')"
                        />
                        <p class="text-xs text-surface-600 mt-1">
                          Higher threshold - Fewer people eligible for Zakat
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Nisab Display -->
                  <div
                    v-if="hawlStore.currentNisab > 0"
                    class="nisab-info"
                  >
                    <div class="nisab-card">
                      <h4>Current Nisab Threshold</h4>
                      <div class="nisab-value">
                        {{ hawlStore.currentNisab.toLocaleString() }} EGP
                      </div>
                      <p class="nisab-description">
                        Based on {{ nisabCalculationMethod }} standard
                      </p>
                    </div>

                    <!-- Eligibility Status -->
                    <div
                      class="eligibility-card"
                      :class="
                        nisabStatus.isEligible ? 'eligible' : 'not-eligible'
                      "
                    >
                      <div class="eligibility-header">
                        <h4>Zakat Eligibility Status</h4>
                        <Tag
                          :value="
                            nisabStatus.isEligible ? 'Eligible' : 'Not Eligible'
                          "
                          :severity="
                            nisabStatus.isEligible ? 'success' : 'danger'
                          "
                        />
                      </div>
                      <div class="eligibility-details">
                        <div class="eligibility-item">
                          <span>Your Assets:</span>
                          <span class="asset-amount">{{
                            nisabStatus.totalAssets.toLocaleString()
                          }}
                            EGP</span>
                        </div>
                        <div class="eligibility-item">
                          <span>Nisab Threshold:</span>
                          <span class="nisab-amount">{{
                            hawlStore.currentNisab.toLocaleString()
                          }}
                            EGP</span>
                        </div>
                        <div class="eligibility-item difference">
                          <span>Difference:</span>
                          <span
                            :class="
                              nisabStatus.isEligible
                                ? 'text-green-600'
                                : 'text-red-600'
                            "
                          >
                            {{
                              (
                                nisabStatus.totalAssets - hawlStore.currentNisab
                              ).toLocaleString()
                            }}
                            EGP
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="islamic-date-card">
                      <h4>Current Islamic Date</h4>
                      <div class="hijri-date">
                        {{ getCurrentHijriDate().formatted }}
                      </div>
                      <p class="hijri-description">
                        Today's date in Hijri calendar
                      </p>
                    </div>
                  </div>

                  <div class="button-group">
                    <Button
                      label="Yes, assets have been above Nisab"
                      :class="{ 'p-button-success': assetsAboveNisab === true }"
                      class="mr-2"
                      @click="setAssetsAboveNisab(true)"
                    />
                    <Button
                      label="No, assets fell below Nisab"
                      :class="{
                        'p-button-success': assetsAboveNisab === false,
                      }"
                      outlined
                      @click="setAssetsAboveNisab(false)"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 4: Current Status & Confirmation -->
              <div
                class="step"
                :class="{ active: currentStep === 4 }"
              >
                <div class="step-header">
                  <div class="step-number">
                    {{ hasPaidZakatBefore ? "4" : "3" }}
                  </div>
                  <h3>Setup Complete</h3>
                </div>

                <div
                  v-if="currentStep === 4"
                  class="step-content"
                >
                  <div class="status-summary">
                    <h4>Your Zakat Status</h4>
                    <div
                      class="status-card"
                      :class="hawlStatus.class"
                    >
                      <div class="status-icon">
                        <i :class="hawlStatus.icon" />
                      </div>
                      <div class="status-content">
                        <h5>{{ hawlStatus.title }}</h5>
                        <p>{{ hawlStatus.description }}</p>
                        <div
                          v-if="hawlStatus.details"
                          class="status-details"
                        >
                          <p>{{ hawlStatus.details }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions">
                    <Button
                      label="Complete Setup"
                      class="p-button-primary"
                      @click="completeSetup"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Main Zakat Dashboard (after onboarding) -->
      <div
        v-else
        class="zakat-dashboard"
      >
        <!-- Hawl Status Card - Full Width -->
        <Card class="hawl-status-card mb-6">
          <template #header>
            <div class="card-header">
              <h3>Hawl Status</h3>
              <div class="header-actions">
                <Tag
                  :value="
                    hawlStore.getStatusLabel(hawlStore.currentHawl?.status)
                  "
                  :severity="
                    getHawlStatusSeverity(hawlStore.currentHawl?.status)
                  "
                />
                <Button
                  label="Edit Settings"
                  icon="pi pi-cog"
                  severity="secondary"
                  size="small"
                  outlined
                  class="ml-2"
                  @click="showEditSettingsModal = true"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div class="hawl-info">
              <div class="hawl-dates">
                <div class="date-item">
                  <label>Start Date:</label>
                  <span>{{
                    formatDateDisplay(hawlStore.currentHawl?.startDate)
                  }}</span>
                </div>
                <div class="date-item">
                  <label>End Date:</label>
                  <span>{{
                    formatDateDisplay(hawlStore.currentHawl?.endDate)
                  }}</span>
                </div>
                <div
                  v-if="hawlStore.currentHawl?.hijriStartDate"
                  class="date-item"
                >
                  <label>Hijri Start:</label>
                  <span>{{
                    hawlStore.currentHawl.hijriStartDate.formatted
                  }}</span>
                </div>
                <div
                  v-if="hawlStore.currentHawl?.hijriEndDate"
                  class="date-item"
                >
                  <label>Hijri End:</label>
                  <span>{{
                    hawlStore.currentHawl.hijriEndDate.formatted
                  }}</span>
                </div>
              </div>

              <div class="hawl-progress">
                <div class="progress-info">
                  <span>Progress: {{ hawlProgress }}%</span>
                  <span>{{ daysRemaining }} days remaining</span>
                </div>
                <ProgressBar
                  :value="hawlProgress"
                  class="hawl-progress-bar"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Islamic School Information Card -->
        <Card class="school-info-card mb-6">
          <template #header>
            <div class="card-header">
              <h3>Islamic School of Thought (Informational)</h3>
              <Tag
                :value="
                  selectedSchool.charAt(0).toUpperCase() +
                    selectedSchool.slice(1)
                "
                severity="info"
              />
            </div>
          </template>

          <template #content>
            <div class="school-info-content">
              <div class="school-info">
                <p class="school-description">
                  {{ currentSchoolConfig.nisab.description }}
                </p>
                <p class="school-description">
                  {{ currentSchoolConfig.zakatRate.description }}
                </p>
                <p class="school-description">
                  {{ currentSchoolConfig.zakatableAssets.description }}
                </p>
              </div>

              <div class="school-actions">
                <Button
                  v-for="school in schoolOptions"
                  :key="school.value"
                  :label="school.label"
                  :severity="
                    selectedSchool === school.value ? 'primary' : 'secondary'
                  "
                  :outlined="selectedSchool !== school.value"
                  class="school-button"
                  @click="setSchool(school.value)"
                />
              </div>

              <div class="school-note">
                <p class="text-sm text-surface-600 text-center">
                  <i class="pi pi-info-circle mr-1" />
                  School selection is for informational purposes only. Nisab
                  calculation method is set independently above.
                </p>
              </div>
            </div>
          </template>
        </Card>

        <!-- Other Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <!-- Nisab Card -->
          <Card>
            <template #header>
              <div class="card-header">
                <h3>Nisab</h3>
                <div class="header-actions">
                  <Tag
                    :value="
                      nisabStatus.isEligible ? 'Eligible' : 'Not Eligible'
                    "
                    :severity="nisabStatus.isEligible ? 'success' : 'danger'"
                  />
                  <Tag
                    :value="
                      hawlStore.nisabDetails.source === 'gold'
                        ? 'Based on Gold'
                        : hawlStore.nisabDetails.source === 'silver'
                          ? 'Based on Silver'
                          : 'Manual Input'
                    "
                    :severity="
                      hawlStore.nisabDetails.source === 'fallback'
                        ? 'warning'
                        : 'info'
                    "
                  />
                </div>
              </div>
            </template>

            <template #content>
              <div class="flex flex-col gap-4">
                <!-- Nisab Status Summary -->
                <div
                  class="p-4 bg-surface-50 border border-surface-200 rounded-lg"
                >
                  <div
                    class="grid grid-cols-3 gap-4 md:grid-cols-3 sm:grid-cols-1"
                  >
                    <div class="flex flex-col gap-1 text-center">
                      <label class="text-sm font-medium text-surface-600">Current Nisab:</label>
                      <span class="text-lg font-semibold text-surface-900">{{ hawlStore.currentNisab.toLocaleString() }} EGP</span>
                    </div>
                    <div class="flex flex-col gap-1 text-center">
                      <label class="text-sm font-medium text-surface-600">Your Assets:</label>
                      <span class="text-lg font-semibold text-surface-900">{{
                        nisabStatus.totalAssets.toLocaleString()
                      }}
                        EGP</span>
                    </div>
                    <div class="flex flex-col gap-1 text-center">
                      <label class="text-sm font-medium text-surface-600">Difference:</label>
                      <span
                        :class="
                          nisabStatus.isEligible
                            ? 'text-green-600'
                            : 'text-red-600'
                        "
                        class="text-lg font-semibold"
                      >
                        {{
                          (
                            nisabStatus.totalAssets - hawlStore.currentNisab
                          ).toLocaleString()
                        }}
                        EGP
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Current Nisab Threshold (Prominent) -->
                <div
                  class="p-4 bg-primary-50 border border-primary-200 rounded-lg text-center"
                >
                  <div class="flex justify-center items-center gap-2 mb-2">
                    <h4 class="text-lg font-semibold text-primary-700 m-0">
                      Nisab Threshold
                    </h4>
                    <Tag
                      :value="
                        hawlStore.nisabDetails.source === 'gold'
                          ? 'Based on Gold'
                          : hawlStore.nisabDetails.source === 'silver'
                            ? 'Based on Silver'
                            : 'Manual Input'
                      "
                      :severity="
                        hawlStore.nisabDetails.source === 'fallback'
                          ? 'warning'
                          : 'info'
                      "
                    />
                  </div>
                  <div class="text-2xl font-bold text-primary-700">
                    {{ hawlStore.nisabDetails.current.toLocaleString() }} EGP
                  </div>
                </div>

                <!-- Settings Button -->
                <div class="flex justify-center">
                  <Button
                    label="Price Settings"
                    icon="pi pi-cog"
                    severity="secondary"
                    size="small"
                    outlined
                    @click="showPriceSettingsModal = true"
                  />
                </div>
              </div>
            </template>
          </Card>

          <!-- Asset Breakdown Card -->
          <Card class="asset-breakdown-card">
            <template #header>
              <div class="card-header">
                <h3>Asset Breakdown</h3>
                <Tag
                  :value="`${nisabStatus.breakdown.length} categories`"
                  severity="info"
                />
              </div>
            </template>

            <template #content>
              <div class="asset-breakdown">
                <div
                  v-for="category in nisabStatus.breakdown"
                  :key="category.name"
                  class="asset-category"
                >
                  <div class="category-info">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-percentage">{{ category.percentage.toFixed(1) }}%</span>
                  </div>
                  <div class="category-value">
                    {{ category.value.toLocaleString() }} EGP
                  </div>
                </div>
                <div class="asset-total">
                  <div class="total-label">
                    Total Zakatable Assets:
                  </div>
                  <div class="total-value">
                    {{ nisabStatus.totalAssets.toLocaleString() }} EGP
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Zakat Calculation Card -->
          <Card class="zakat-calculation-card">
            <template #header>
              <div class="card-header">
                <h3>Zakat Calculation</h3>
                <Tag
                  :value="`${zakatRate}%`"
                  severity="info"
                />
              </div>
            </template>

            <template #content>
              <div class="zakat-calculation">
                <div
                  v-if="!zakatCalculation.isEligible"
                  class="not-eligible-message"
                >
                  <div class="message-icon">
                    ℹ️
                  </div>
                  <div class="message-content">
                    <h4>Not Eligible for Zakat</h4>
                    <p>
                      Your total assets ({{
                        nisabStatus.totalAssets.toLocaleString()
                      }}
                      EGP) are below the Nisab threshold ({{
                        hawlStore.currentNisab.toLocaleString()
                      }}
                      EGP).
                    </p>
                    <p>Zakat is not required when assets are below Nisab.</p>
                  </div>
                </div>

                <div
                  v-else
                  class="calculation-breakdown"
                >
                  <div class="calculation-item">
                    <label>Total Assets:</label>
                    <span>{{ nisabStatus.totalAssets.toLocaleString() }} EGP</span>
                  </div>
                  <div class="calculation-item">
                    <label>Deductions:</label>
                    <span>{{
                      zakatCalculation.deductions.toLocaleString()
                    }}
                      EGP</span>
                  </div>
                  <div class="calculation-item total">
                    <label>Net Zakatable Assets:</label>
                    <span>{{
                      zakatCalculation.netAssets.toLocaleString()
                    }}
                      EGP</span>
                  </div>
                  <div class="calculation-item zakat-amount">
                    <label>Zakat Amount ({{ zakatRate }}%):</label>
                    <span class="zakat-total">{{ zakatCalculation.amount.toLocaleString() }} EGP</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Budget Integration Card -->
          <Card class="budget-integration-card">
            <template #header>
              <div class="card-header">
                <h3>Budget Integration</h3>
                <Tag
                  :value="`${currentYearZakatItems.length} items`"
                  severity="info"
                />
              </div>
            </template>

            <template #content>
              <div class="budget-integration">
                <div
                  v-if="!zakatCalculation.isEligible"
                  class="not-eligible-budget"
                >
                  <div class="message-icon">
                    ℹ️
                  </div>
                  <div class="message-content">
                    <h4>No Zakat Budget Required</h4>
                    <p>
                      Since your assets are below Nisab, no Zakat budget items
                      are needed.
                    </p>
                  </div>
                </div>

                <div v-else>
                  <div class="budget-summary">
                    <div class="budget-item">
                      <label>Total Budgeted:</label>
                      <span>{{ totalZakatBudgeted.toLocaleString() }} EGP</span>
                    </div>
                    <div class="budget-item">
                      <label>Total Paid:</label>
                      <span>{{ totalPayments.toLocaleString() }} EGP</span>
                    </div>
                    <div class="budget-item">
                      <label>Remaining:</label>
                      <span
                        :class="
                          zakatBudgetStatus.remaining >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        "
                      >
                        {{ zakatBudgetStatus.remaining.toLocaleString() }} EGP
                      </span>
                    </div>
                    <div class="budget-item">
                      <label>Progress:</label>
                      <span>{{ zakatBudgetStatus.percentage.toFixed(1) }}%</span>
                    </div>
                  </div>

                  <div class="budget-progress">
                    <ProgressBar
                      :value="zakatBudgetStatus.percentage"
                      class="budget-progress-bar"
                    />
                  </div>

                  <div class="budget-actions">
                    <Button
                      label="Create Budget Items"
                      severity="secondary"
                      size="small"
                      @click="createZakatBudgetForUpcomingYears(3)"
                    />
                    <Button
                      label="View in Budget"
                      severity="primary"
                      size="small"
                      @click="router.push('/budget')"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>

  <!-- Price Settings Modal -->
  <Dialog
    v-model:visible="showPriceSettingsModal"
    modal
    header="Gold & Silver Price Settings"
    :style="{ width: '600px' }"
    :closable="true"
    :dismissable-mask="true"
  >
    <div class="flex flex-col gap-6">
      <!-- Current Prices Display -->
      <div
        class="p-4 bg-primary-50 border border-primary-200 rounded-lg text-center"
      >
        <h4 class="text-lg font-semibold text-primary-700 mb-2">
          Current Nisab Threshold
        </h4>
        <div class="text-2xl font-bold text-primary-700">
          {{ hawlStore.nisabDetails.current.toLocaleString() }} EGP
        </div>
        <div class="mt-2">
          <Tag
            :value="
              hawlStore.nisabDetails.source === 'gold'
                ? 'Based on Gold'
                : hawlStore.nisabDetails.source === 'silver'
                  ? 'Based on Silver'
                  : 'Manual Input'
            "
            :severity="
              hawlStore.nisabDetails.source === 'fallback' ? 'warning' : 'info'
            "
          />
        </div>
      </div>

      <!-- Nisab Calculation Method Selection -->
      <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
        <h4 class="text-lg font-semibold text-surface-700 mb-3">
          Nisab Calculation Method
        </h4>
        <p class="text-sm text-surface-600 mb-3">
          Choose how to calculate the Nisab threshold:
        </p>
        <div class="flex gap-3">
          <Button
            :label="`Silver Standard (${hawlStore.nisabDetails.silver?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
            :severity="
              nisabCalculationMethod === 'silver' ? 'primary' : 'secondary'
            "
            :outlined="nisabCalculationMethod !== 'silver'"
            class="flex-1"
            @click="setNisabCalculationMethod('silver')"
          />
          <Button
            :label="`Gold Standard (${hawlStore.nisabDetails.gold?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
            :severity="
              nisabCalculationMethod === 'gold' ? 'primary' : 'secondary'
            "
            :outlined="nisabCalculationMethod !== 'gold'"
            class="flex-1"
            @click="setNisabCalculationMethod('gold')"
          />
        </div>
        <p class="text-xs text-surface-600 text-center mt-2">
          Silver standard has a lower threshold (more people eligible), while
          gold standard has a higher threshold.
        </p>
      </div>

      <!-- Price Inputs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Gold Section -->
        <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🥇</span>
            <span class="font-semibold text-surface-900">Gold</span>
          </div>
          <div class="flex gap-2 mb-3">
            <InputNumber
              id="gold-price-modal"
              v-model="goldPriceInput"
              :min="0"
              :max="999999"
              :step="0.01"
              :use-grouping="true"
              suffix=" EGP/gram"
              placeholder="Enter price"
              class="flex-1"
              @update:model-value="updateGoldPrice"
            />
            <Button
              icon="pi pi-save"
              :disabled="!goldPriceInput || goldPriceInput <= 0"
              size="small"
              text
              @click="saveGoldPrice"
            />
          </div>
          <div
            class="flex justify-between items-center p-2 bg-surface-100 rounded text-sm"
          >
            <span class="font-medium text-surface-600">Nisab (85g):</span>
            <span class="font-semibold text-surface-900">
              {{ hawlStore.nisabDetails.gold.nisabValue.toLocaleString() }} EGP
            </span>
          </div>
        </div>

        <!-- Silver Section -->
        <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🥈</span>
            <span class="font-semibold text-surface-900">Silver</span>
          </div>
          <div class="flex gap-2 mb-3">
            <InputNumber
              id="silver-price-modal"
              v-model="silverPriceInput"
              :min="0"
              :max="999999"
              :step="0.01"
              :use-grouping="true"
              suffix=" EGP/gram"
              placeholder="Enter price"
              class="flex-1"
              @update:model-value="updateSilverPrice"
            />
            <Button
              icon="pi pi-save"
              :disabled="!silverPriceInput || silverPriceInput <= 0"
              size="small"
              text
              @click="saveSilverPrice"
            />
          </div>
          <div
            class="flex justify-between items-center p-2 bg-surface-100 rounded text-sm"
          >
            <span class="font-medium text-surface-600">Nisab (595g):</span>
            <span class="font-semibold text-surface-900">
              {{
                hawlStore.nisabDetails.silver.nisabValue.toLocaleString()
              }}
              EGP
            </span>
          </div>
        </div>
      </div>

      <!-- Price Sources Links -->
      <div class="p-4 bg-surface-100 rounded-lg">
        <h5 class="font-semibold text-surface-900 mb-3">
          Get Current Prices From:
        </h5>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.goldprice.org/spot-gold"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <i class="pi pi-external-link text-primary-600" />
            <span class="text-sm font-medium text-surface-900">Gold Price (International)</span>
          </a>
          <a
            href="https://www.silverprice.org/spot-silver"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <i class="pi pi-external-link text-primary-600" />
            <span class="text-sm font-medium text-surface-900">Silver Price (International)</span>
          </a>
          <a
            href="https://www.cbe.org.eg/en/EconomicResearch/Statistics/Pages/ExchangeRates.aspx"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <i class="pi pi-external-link text-primary-600" />
            <span class="text-sm font-medium text-surface-900">CBE Exchange Rates</span>
          </a>
          <a
            href="https://www.goldprice.org/spot-gold"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 p-3 bg-white border border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <i class="pi pi-external-link text-primary-600" />
            <span class="text-sm font-medium text-surface-900">Local Gold Markets</span>
          </a>
        </div>
      </div>

      <!-- Last Updated -->
      <div
        v-if="hawlStore.nisabDetails.lastUpdated"
        class="text-center p-3 bg-surface-100 rounded"
      >
        <small class="text-surface-600 text-sm">
          Last updated:
          {{ new Date(hawlStore.nisabDetails.lastUpdated).toLocaleString() }}
        </small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Close"
          severity="secondary"
          text
          @click="showPriceSettingsModal = false"
        />
      </div>
    </template>
  </Dialog>

  <!-- Edit Settings Modal -->
  <Dialog
    v-model:visible="showEditSettingsModal"
    modal
    header="Edit Zakat Settings"
    :style="{ width: '700px' }"
    :closable="true"
    :dismissable-mask="true"
  >
    <div class="flex flex-col gap-6">
      <!-- Warning Message -->
      <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-amber-600 mt-1" />
          <div>
            <h4 class="font-semibold text-amber-800 mb-1">
              Important Notice
            </h4>
            <p class="text-sm text-amber-700">
              Editing these settings will reset your current Hawl and require
              you to go through the setup process again. This is only
              recommended if you need to correct previous payment information.
            </p>
          </div>
        </div>
      </div>

      <!-- Previous Payment Data -->
      <div
        v-if="hawlStore.currentHawl?.previousPaymentData"
        class="p-4 bg-surface-50 border border-surface-200 rounded-lg"
      >
        <h4 class="font-semibold text-surface-900 mb-3">
          Previous Payment Information
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Last Payment Date</label>
            <Calendar
              v-model="editPaymentData.date"
              date-format="mm/dd/yy"
              placeholder="Select date"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Payment Amount</label>
            <InputNumber
              v-model="editPaymentData.amount"
              mode="currency"
              currency="EGP"
              locale="en-US"
              placeholder="Enter amount"
              class="w-full"
            />
          </div>
        </div>
        <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div class="text-sm">
            <span class="font-medium text-green-800">Calculated Asset Value:</span>
            <span class="ml-2 font-semibold text-green-700">
              {{ calculateAssetValueFromZakat(editPaymentData.amount) }} EGP
            </span>
          </div>
        </div>
      </div>

      <!-- Asset Continuity -->
      <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
        <h4 class="font-semibold text-surface-900 mb-3">
          Asset Continuity
        </h4>
        <p class="text-sm text-surface-600 mb-3">
          Have your assets been above the Nisab threshold continuously since
          your last payment?
        </p>
        <div class="flex gap-3">
          <Button
            label="Yes, assets maintained above Nisab"
            :class="{ 'p-button-success': editAssetsAboveNisab === true }"
            @click="editAssetsAboveNisab = true"
          />
          <Button
            label="No, assets fell below Nisab"
            :class="{ 'p-button-success': editAssetsAboveNisab === false }"
            outlined
            @click="editAssetsAboveNisab = false"
          />
        </div>
      </div>

      <!-- Price Settings -->
      <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
        <h4 class="font-semibold text-surface-900 mb-3">
          Gold & Silver Prices
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Gold Price (per gram)</label>
            <InputNumber
              v-model="editGoldPrice"
              mode="currency"
              currency="EGP"
              locale="en-US"
              placeholder="Enter gold price"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Silver Price (per gram)</label>
            <InputNumber
              v-model="editSilverPrice"
              mode="currency"
              currency="EGP"
              locale="en-US"
              placeholder="Enter silver price"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Nisab Calculation Method -->
      <div class="p-4 bg-surface-50 border border-surface-200 rounded-lg">
        <h4 class="font-semibold text-surface-900 mb-3">
          Nisab Calculation Method
        </h4>
        <p class="text-sm text-surface-600 mb-3">
          Choose how to calculate the Nisab threshold:
        </p>
        <div class="flex gap-3">
          <Button
            :label="`Silver Standard (${hawlStore.nisabDetails.silver?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
            :severity="
              nisabCalculationMethod === 'silver' ? 'primary' : 'secondary'
            "
            :outlined="nisabCalculationMethod !== 'silver'"
            class="flex-1"
            @click="setNisabCalculationMethod('silver')"
          />
          <Button
            :label="`Gold Standard (${hawlStore.nisabDetails.gold?.nisabValue?.toLocaleString() || 'N/A'} EGP)`"
            :severity="
              nisabCalculationMethod === 'gold' ? 'primary' : 'secondary'
            "
            :outlined="nisabCalculationMethod !== 'gold'"
            class="flex-1"
            @click="setNisabCalculationMethod('gold')"
          />
        </div>
        <p class="text-xs text-surface-600 text-center mt-2">
          Silver standard has a lower threshold (more people eligible), while
          gold standard has a higher threshold.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="showEditSettingsModal = false"
        />
        <Button
          label="Reset & Restart Setup"
          severity="danger"
          :disabled="!isEditDataValid"
          @click="resetAndRestartSetup"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useIslamicCalendar } from '@/composables/useIslamicCalendar'
import { useIslamicLawCompliance } from '@/composables/useIslamicLawCompliance'
import { useZakatAssets } from '@/composables/useZakatAssets'
import { useZakatBudgetIntegration } from '@/composables/useZakatBudgetIntegration'
import { useZakatPayments } from '@/composables/useZakatPayments'
import { useHawlStore } from '@/stores/hawlStore'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Islamic law compliance
const {
  selectedSchool,
  nisabCalculationMethod,
  schoolOptions,
  currentSchoolConfig,
  setSchool,
  setNisabCalculationMethod,
  loadNisabMethodFromStorage,
  validateCompliance,
  getComplianceReport
} = useIslamicLawCompliance()

// Hawl store
const hawlStore = useHawlStore()

  // Set the external Nisab calculation method in hawlStore
  hawlStore.setExternalNisabMethod(nisabCalculationMethod)

// Zakat assets composable
const {
  totalZakatableAssets,
  assetSummary,
  cashAssets,
  investmentAssets,
  businessInventory,
  goldSilverAssets,
  realEstateAssets,
  otherAssets,
  initializeAssets,
  refreshAssets
} = useZakatAssets()

// Zakat payments composable
const {
  payments: zakatPayments,
  totalPayments,
  createPayment,
  markPaymentAsCompleted,
  getPaymentStats
} = useZakatPayments()

// Zakat budget integration composable
const {
  zakatBudgetItems,
  currentYearZakatItems,
  totalZakatBudgeted,
  zakatBudgetStatus,
  createZakatBudgetForCurrentHawl,
  createZakatBudgetForUpcomingYears,
  markZakatAsPaid,
  initialize: initializeBudgetIntegration
} = useZakatBudgetIntegration()

// Islamic calendar composable
const {
  toHijri,
  toGregorian,
  getCurrentHijriDate,
  calculateHawlEndDate,
  getDaysRemainingInHawl,
  getHawlProgress,
  isHawlCompleted,
  getHawlStatus,
  formatDate,
  formatHijriDate,
  getHijriMonthNames,
  getHijriMonthNamesArabic
} = useIslamicCalendar()

// Onboarding state
const currentStep = ref(1)
const hasPaidZakatBefore = ref(null)
const assetsAboveNisab = ref(null)

// Price input variables
const goldPriceInput = ref(0)
const silverPriceInput = ref(0)

// Modal refs
const showPriceSettingsModal = ref(false)
const showEditSettingsModal = ref(false)

// Edit settings data
const editPaymentData = ref({
    date: null,
    amount: 0
  })
const editAssetsAboveNisab = ref(null)
const editGoldPrice = ref(0)
const editSilverPrice = ref(0)

// Previous payment data
const previousPaymentData = ref({
    date: null,
    amount: null,
    assetValue: null
  })

// Nisab and calculation data
const zakatRate = 2.5

// Computed properties
const isPreviousPaymentDataValid = computed(() => {
    return previousPaymentData.value.date && previousPaymentData.value.amount
  })

const nisabStatus = computed(() => {
    const totalAssets = totalZakatableAssets.value.total
    return {
      totalAssets,
      isEligible: totalAssets >= hawlStore.currentNisab,
      breakdown: assetSummary.value.categories
    }
  })

const zakatCalculation = computed(() => {
    const totalAssets = nisabStatus.value.totalAssets
    const isEligible = nisabStatus.value.isEligible

    // If not eligible (assets below Nisab), return zero amounts
    if (!isEligible) {
      return {
        totalAssets,
        deductions: 0,
        netAssets: 0,
        amount: 0,
        isEligible: false
      }
    }

    const deductions = 0 // Placeholder - will calculate real deductions
    const netAssets = totalAssets - deductions
    const amount = netAssets * (zakatRate / 100)

    return {
      totalAssets,
      deductions,
      netAssets,
      amount,
      isEligible: true
    }
  })

const hawlProgress = computed(() => {
    return hawlStore.hawlProgress
  })

const daysRemaining = computed(() => {
    return hawlStore.daysRemaining
  })

const hawlStatus = computed(() => {
    if (!hawlStore.currentHawl) {
      return {
        class: 'status-new',
        icon: 'pi pi-plus-circle',
        title: 'Start New Hawl',
        description:
          'Your assets are above Nisab threshold. Start your Zakat year.',
        details: null
      }
    }

    const currentStatus = hawlStore.currentHawlStatus
    if (!currentStatus) return null

    switch (currentStatus.status) {
      case hawlStore.HAWL_STATES.ACTIVE:
        return {
          class: 'status-active',
          icon: 'pi pi-clock',
          title: 'Hawl in Progress',
          description: 'Your Zakat year is ongoing.',
          details: `${currentStatus.daysRemaining} days remaining`
        }
      case hawlStore.HAWL_STATES.DUE:
        return {
          class: 'status-due',
          icon: 'pi pi-exclamation-triangle',
          title: 'Zakat Due',
          description: 'Your Hawl is complete. Zakat is now due.',
          details: 'Please pay your Zakat obligation'
        }
      case hawlStore.HAWL_STATES.INTERRUPTED:
        return {
          class: 'status-interrupted',
          icon: 'pi pi-times-circle',
          title: 'Hawl Interrupted',
          description: 'Your Hawl was interrupted. Assets fell below Nisab.',
          details: 'Start a new Hawl when assets are above Nisab again'
        }
      case hawlStore.HAWL_STATES.PAID:
        return {
          class: 'status-paid',
          icon: 'pi pi-check-circle',
          title: 'Zakat Paid',
          description: 'Your Zakat has been paid for this Hawl.',
          details: 'Start a new Hawl for the next year'
        }
      default:
        return {
          class: 'status-unknown',
          icon: 'pi pi-question-circle',
          title: 'Unknown Status',
          description: 'Hawl status is unclear.',
          details: null
        }
    }
  })

// Methods
const setHasPaidZakatBefore = (value) => {
  hasPaidZakatBefore.value = value
  if (value === false) {
    // Skip to step 3 (asset continuity check)
    currentStep.value = 3
  } else {
    currentStep.value = 2
  }
}

const setAssetsAboveNisab = (value) => {
  assetsAboveNisab.value = value
  currentStep.value = 4
}

const proceedToStep = (step) => {
  currentStep.value = step
}

// Price update methods
const updateGoldPrice = (price) => {
  if (price && price > 0) {
      hawlStore.updateGoldPrice(price)
  }
}

const updateSilverPrice = (price) => {
  if (price && price > 0) {
      hawlStore.updateSilverPrice(price)
  }
}

const saveGoldPrice = () => {
  if (goldPriceInput.value && goldPriceInput.value > 0) {
      hawlStore.updateGoldPrice(goldPriceInput.value)
  }
}

const saveSilverPrice = () => {
  if (silverPriceInput.value && silverPriceInput.value > 0) {
      hawlStore.updateSilverPrice(silverPriceInput.value)
  }
}

// Calculate asset value from Zakat amount (reverse calculation)
const calculateAssetValueFromZakat = (zakatAmount) => {
  if (!zakatAmount || zakatAmount <= 0) return 0
  // Zakat is 2.5% (1/40) of assets, so assets = Zakat amount * 40
  return Math.round(zakatAmount * 40)
}

// Edit settings validation
const isEditDataValid = computed(() => {
    if (hawlStore.currentHawl?.previousPaymentData) {
      return (
        editPaymentData.value.date &&
        editPaymentData.value.amount &&
        editAssetsAboveNisab.value !== null
      )
    }
    return editAssetsAboveNisab.value !== null
  })

// Initialize edit data when modal opens
const initializeEditData = () => {
  if (hawlStore.currentHawl?.previousPaymentData) {
    editPaymentData.value = { ...hawlStore.currentHawl.previousPaymentData }
  }
  editAssetsAboveNisab.value =
    hawlStore.currentHawl?.continuousAboveNisab ?? null

  // Get prices from the correct nested structure with fallbacks
  const goldPrice = hawlStore.nisabDetails?.gold?.pricePerGram || 0
  const silverPrice = hawlStore.nisabDetails?.silver?.pricePerGram || 0

    // Debug logging
    console.log('Initializing edit data:', {
      nisabDetails: hawlStore.nisabDetails,
      goldPrice,
      silverPrice,
      goldPriceType: typeof goldPrice,
      silverPriceType: typeof silverPrice,
      currentNisabMethod: nisabCalculationMethod.value
    })

  // Ensure we have valid numbers (not NaN or undefined)
  editGoldPrice.value =
      isNaN(goldPrice) || goldPrice === undefined ? 0 : goldPrice
  editSilverPrice.value =
      isNaN(silverPrice) || silverPrice === undefined ? 0 : silverPrice

    console.log('Final edit prices:', {
      editGoldPrice: editGoldPrice.value,
      editSilverPrice: editSilverPrice.value,
      nisabMethod: nisabCalculationMethod.value
    })
}

// Reset and restart setup
const resetAndRestartSetup = async () => {
    // Clear current Hawl
    hawlStore.clearAllData()

    // Update prices if provided
    if (editGoldPrice.value > 0) {
      hawlStore.updateGoldPrice(editGoldPrice.value)
    }
    if (editSilverPrice.value > 0) {
      hawlStore.updateSilverPrice(editSilverPrice.value)
    }

    // Close modal and reset onboarding
    showEditSettingsModal.value = false
    currentStep.value = 1
    hasPaidZakatBefore.value = null
    assetsAboveNisab.value = null

    // Pre-populate with edit data if available
    if (editPaymentData.value.date && editPaymentData.value.amount) {
      hasPaidZakatBefore.value = true
      previousPaymentData.value = { ...editPaymentData.value }
      assetsAboveNisab.value = editAssetsAboveNisab.value
    }
}

const completeSetup = async () => {
  // Refresh asset data before creating Hawl
  await refreshAssets()

    // Save the Nisab calculation method selection from onboarding
    setNisabCalculationMethod(nisabCalculationMethod.value)

  // Prepare previous payment data with calculated asset value
  let paymentDataWithCalculatedAssets = null
  if (hasPaidZakatBefore.value && previousPaymentData.value) {
    paymentDataWithCalculatedAssets = {
        ...previousPaymentData.value,
        assetValue: calculateAssetValueFromZakat(
          previousPaymentData.value.amount
        )
      }
  }

  // Create new Hawl using the store with real asset data
  // Pass the assetsAboveNisab value to determine Hawl start date
  const newHawl = hawlStore.createNewHawl(
      nisabStatus.value.totalAssets,
      paymentDataWithCalculatedAssets,
      assetsAboveNisab.value
    )

  // Only create budget items if eligible for Zakat
  if (nisabStatus.value.isEligible) {
    // Create Zakat budget item for current Hawl
    try {
      await createZakatBudgetForCurrentHawl()
        console.log('Zakat budget item created for current Hawl')
    } catch (error) {
        console.warn('Could not create Zakat budget item:', error.message)
    }

    // Create Zakat budget items for upcoming years
    try {
      await createZakatBudgetForUpcomingYears(3)
        console.log('Zakat budget items created for upcoming years')
    } catch (error) {
        console.warn(
          'Could not create Zakat budget items for upcoming years:',
          error.message
        )
    }
  } else {
      console.log('Assets below Nisab - no Zakat budget items created')
  }

    console.log(
      'New Hawl created with real assets and budget integration:',
      newHawl
    )
}

const getHawlStatusSeverity = (status) => {
  return hawlStore.getStatusSeverity(status)
}

const formatDateDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

  // Watch for edit modal opening to initialize data
  watch(showEditSettingsModal, (isOpen) => {
    if (isOpen) {
      initializeEditData()
    }
  })

  // Watch for Nisab calculation method changes and update hawlStore
  watch(nisabCalculationMethod, (newMethod) => {
    hawlStore.setExternalNisabMethod(newMethod)
  })

  // Initialize stores and assets on mount
  onMounted(async () => {
    try {
      console.log('Initializing Zakat page...')

      // Load Nisab calculation method from localStorage
      loadNisabMethodFromStorage()

      // Initialize the hawl store first
      if (hawlStore && typeof hawlStore.initializeHawlStore === 'function') {
        await hawlStore.initializeHawlStore()
        console.log('Hawl store initialized')
      } else {
        console.error('Hawl store not properly initialized')
        return
      }

      // Update hawl status
      if (hawlStore.ensureHawlStatusUpdated) {
        hawlStore.ensureHawlStatusUpdated()
      }

      // Initialize other components
      await initializeAssets()
      await initializeBudgetIntegration()

      // Initialize price inputs with current values
      goldPriceInput.value = hawlStore.nisabDetails.gold.pricePerGram
      silverPriceInput.value = hawlStore.nisabDetails.silver.pricePerGram

      console.log('Zakat page initialization complete')
    } catch (error) {
      console.error('Error initializing Zakat page:', error)
    }
  })
</script>

<style scoped>
  .zakat-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  .onboarding-section {
    max-width: 800px;
    margin: 0 auto;
  }

  .onboarding-card {
    margin-bottom: 2rem;
  }

  .card-header {
    text-align: center;
    padding: 1rem;
  }

  .card-header h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
  }

  .card-header p {
    margin: 0;
    color: var(--text-color-secondary);
  }

  .onboarding-steps {
    padding: 1rem;
  }

  .step {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 2px solid var(--surface-border);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .step.active {
    border-color: var(--primary-color);
    background-color: var(--primary-50);
  }

  .step.completed {
    border-color: var(--green-500);
    background-color: var(--green-50);
  }

  .step-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 1rem;
  }

  .step h3 {
    margin: 0;
    color: var(--text-color);
  }

  .step-content {
    margin-left: 3rem;
  }

  .question {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }

  .button-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .form-field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }

  .step-actions {
    text-align: center;
    margin-top: 2rem;
  }

  .nisab-info {
    margin: 1.5rem 0;
  }

  .nisab-card {
    background-color: var(--surface-100);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    border: 2px solid var(--primary-200);
  }

  .nisab-card h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
  }

  .nisab-value {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }

  .nisab-description {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
  }

  .islamic-date-card {
    background-color: var(--surface-100);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    border: 2px solid var(--green-200);
    margin-top: 1rem;
  }

  .islamic-date-card h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
  }

  .hijri-date {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--green-600);
    margin-bottom: 0.5rem;
  }

  .hijri-description {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
  }

  /* Eligibility Card */
  .eligibility-card {
    background-color: var(--surface-100);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    border: 2px solid var(--surface-200);
    margin-top: 1rem;
  }

  .eligibility-card.eligible {
    border-color: var(--green-200);
    background-color: var(--green-50);
  }

  .eligibility-card.not-eligible {
    border-color: var(--red-200);
    background-color: var(--red-50);
  }

  .eligibility-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .eligibility-header h4 {
    margin: 0;
    color: var(--text-color);
  }

  .eligibility-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .eligibility-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--surface-0);
    border-radius: 4px;
  }

  .eligibility-item.difference {
    font-weight: 600;
    background-color: var(--surface-100);
  }

  .asset-amount,
  .nisab-amount {
    font-weight: 600;
    color: var(--text-color);
  }

  .status-summary {
    text-align: center;
  }

  .status-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 1rem 0;
    background-color: var(--surface-100);
  }

  .status-icon {
    font-size: 2rem;
    margin-right: 1rem;
    color: var(--primary-color);
  }

  .status-content h5 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
  }

  .status-content p {
    margin: 0;
    color: var(--text-color-secondary);
  }

  .status-details {
    margin-top: 0.5rem;
  }

  .status-details p {
    font-weight: 500;
    color: var(--primary-color);
  }

  /* Dashboard Styles */
  .zakat-dashboard {
    margin-top: 2rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .hawl-status-card,
  .nisab-status-card,
  .zakat-calculation-card {
    height: 100%;
  }

  .hawl-info,
  .nisab-info,
  .zakat-calculation {
    padding: 1rem 0;
  }

  .hawl-dates {
    margin-bottom: 1.5rem;
  }

  .date-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .date-item label {
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  .hawl-progress {
    margin-top: 1rem;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .hawl-progress-bar {
    height: 8px;
  }

  .nisab-threshold,
  .user-assets,
  .nisab-difference {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .nisab-threshold label,
  .user-assets label,
  .nisab-difference label {
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  .nisab-value,
  .asset-value {
    font-weight: 600;
    color: var(--text-color);
  }

  .calculation-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0.5rem 0;
  }

  .calculation-item.total {
    border-top: 1px solid var(--surface-border);
    border-bottom: 1px solid var(--surface-border);
    font-weight: 600;
  }

  .calculation-item.zakat-amount {
    background-color: var(--primary-50);
    padding: 1rem;
    border-radius: 6px;
    font-weight: 600;
  }

  .zakat-total {
    font-size: 1.2rem;
    color: var(--primary-color);
  }

  /* Not Eligible Message Styles */
  .not-eligible-message {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--blue-50);
    border: 1px solid var(--blue-200);
    border-radius: 8px;
    margin: 1rem 0;
  }

  .message-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .message-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--blue-700);
    font-weight: 600;
  }

  .message-content p {
    margin: 0 0 0.5rem 0;
    color: var(--blue-600);
    line-height: 1.5;
  }

  .message-content p:last-child {
    margin-bottom: 0;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .metal-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--surface-50);
    border-radius: 8px;
    border: 1px solid var(--surface-200);
  }

  .metal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .metal-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .metal-info h4 {
    margin: 0 0 0.25rem 0;
    color: var(--text-color);
    font-weight: 600;
  }

  .metal-price {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
  }

  .nisab-calculation {
    text-align: right;
  }

  .calculation-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .calculation-row span:first-child {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
  }

  .nisab-value {
    font-weight: 600;
    color: var(--text-color);
    font-size: 1.1rem;
  }

  .current-nisab {
    padding: 1.5rem;
    background-color: var(--primary-50);
    border: 1px solid var(--primary-200);
    border-radius: 8px;
    text-align: center;
  }

  .nisab-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .nisab-header h4 {
    margin: 0;
    color: var(--primary-color);
    font-weight: 600;
  }

  .nisab-amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }

  .nisab-explanation {
    margin: 0;
    color: var(--primary-600);
    font-size: 0.9rem;
    font-style: italic;
  }

  .last-updated {
    text-align: center;
    padding: 0.5rem;
    background-color: var(--surface-100);
    border-radius: 4px;
  }

  .last-updated small {
    color: var(--text-color-secondary);
  }

  .error-message {
    text-align: center;
    padding: 0.5rem;
    background-color: var(--orange-50);
    border: 1px solid var(--orange-200);
    border-radius: 4px;
  }

  /* Asset Breakdown Styles */
  .asset-breakdown {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .asset-category {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: var(--surface-50);
    border-radius: 6px;
    border-left: 4px solid var(--primary-color);
  }

  .category-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .category-name {
    font-weight: 500;
    color: var(--text-color);
  }

  .category-percentage {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }

  .category-value {
    font-weight: 600;
    color: var(--text-color);
  }

  .asset-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--primary-50);
    border-radius: 6px;
    border: 1px solid var(--primary-200);
    margin-top: 0.5rem;
  }

  .total-label {
    font-weight: 600;
    color: var(--primary-color);
  }

  .total-value {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--primary-color);
  }

  /* Price Settings Styles */
  .price-settings {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .price-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .price-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .price-field label {
    font-weight: 500;
    color: var(--text-color);
  }

  .price-sources {
    background-color: var(--surface-50);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--surface-200);
  }

  .price-sources h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color);
    font-size: 0.9rem;
  }

  .source-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .source-link {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: var(--primary-50);
    color: var(--primary-color);
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .source-link:hover {
    background-color: var(--primary-100);
    color: var(--primary-700);
  }

  .continuity-explanation {
    background-color: var(--blue-50);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--blue-200);
    margin-bottom: 1rem;
  }

  .calculated-value {
    padding: 0.75rem;
    background-color: var(--green-50);
    border: 1px solid var(--green-200);
    border-radius: 6px;
    font-weight: 600;
    color: var(--green-700);
    text-align: center;
  }

  .price-input-section {
    background-color: var(--surface-50);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--surface-200);
    margin-bottom: 1.5rem;
  }

  .price-input-section h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
    font-size: 1.1rem;
  }

  .price-input-section h5 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color);
    font-size: 0.9rem;
  }

  /* Budget Integration Styles */
  .budget-integration {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .budget-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .budget-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--surface-50);
    border-radius: 4px;
  }

  .budget-item label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }

  .budget-item span {
    font-weight: 600;
    color: var(--text-color);
  }

  .budget-progress {
    margin: 0.5rem 0;
  }

  .budget-progress-bar {
    height: 8px;
  }

  .budget-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  /* Not Eligible Budget Message */
  .not-eligible-budget {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 6px;
    margin: 0.5rem 0;
  }

  .not-eligible-budget .message-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .not-eligible-budget .message-content h4 {
    margin: 0 0 0.25rem 0;
    color: var(--text-color);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .not-eligible-budget .message-content p {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    line-height: 1.4;
  }

  /* School Information Card */
  .school-info-card {
    background: linear-gradient(
      135deg,
      var(--surface-0) 0%,
      var(--surface-50) 100%
    );
    border: 1px solid var(--surface-200);
  }

  .school-info-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .school-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .school-description {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    padding: 0.5rem;
    background-color: var(--surface-100);
    border-radius: 4px;
    border-left: 3px solid var(--primary-color);
  }

  .school-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .school-button {
    min-width: 100px;
    transition: all 0.2s ease;
  }

  .school-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .school-note {
    padding: 0.75rem;
    background-color: var(--blue-50);
    border: 1px solid var(--blue-200);
    border-radius: 6px;
  }

  /* Nisab Method Selection */
  .nisab-method-selection {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
  }

  .nisab-method-selection h5 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .nisab-method-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .nisab-method-option {
    padding: 0.75rem;
    border: 2px solid var(--surface-200);
    border-radius: 8px;
    transition: all 0.2s ease;
    background-color: var(--surface-0);
  }

  .nisab-method-option.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-50);
  }

  .nisab-method-option:hover {
    border-color: var(--primary-300);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .zakat-page {
      padding: 1rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .button-group {
      flex-direction: column;
    }

    .step-content {
      margin-left: 0;
    }

    .status-card {
      flex-direction: column;
      text-align: center;
    }

    .status-icon {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
</style>
