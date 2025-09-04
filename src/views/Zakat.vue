<template>
  <div class="zakat-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-moon text-primary mr-2"></i>
        Zakat Calculator
      </h1>
      <p class="page-subtitle">
        Calculate and track your Zakat obligations with Hawl management
      </p>
    </div>

    <!-- Main Content -->
    <div class="zakat-content">
      <!-- Onboarding Flow -->
      <div v-if="!hawlData" class="onboarding-section">
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
              <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
                <div class="step-header">
                  <div class="step-number">1</div>
                  <h3>Previous Zakat Payment</h3>
                </div>

                <div v-if="currentStep === 1" class="step-content">
                  <p class="question">Have you paid Zakat before?</p>
                  <div class="button-group">
                    <Button label="Yes, I have paid Zakat before"
                      :class="{ 'p-button-success': hasPaidZakatBefore === true }" @click="setHasPaidZakatBefore(true)"
                      class="mr-2" />
                    <Button label="No, this is my first time"
                      :class="{ 'p-button-success': hasPaidZakatBefore === false }"
                      @click="setHasPaidZakatBefore(false)" outlined />
                  </div>
                </div>
              </div>

              <!-- Step 2: Previous Payment Details (if applicable) -->
              <div v-if="hasPaidZakatBefore" class="step"
                :class="{ active: currentStep === 2, completed: currentStep > 2 }">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <h3>Previous Payment Details</h3>
                </div>

                <div v-if="currentStep === 2" class="step-content">
                  <div class="form-grid">
                    <div class="form-field">
                      <label for="lastPaymentDate">When did you last pay Zakat?</label>
                      <Calendar v-model="previousPaymentData.date" id="lastPaymentDate" dateFormat="mm/dd/yy"
                        placeholder="Select date" class="w-full" />
                    </div>

                    <div class="form-field">
                      <label for="lastPaymentAmount">What was the amount paid?</label>
                      <InputNumber v-model="previousPaymentData.amount" id="lastPaymentAmount" mode="currency"
                        currency="EGP" locale="en-US" placeholder="Enter amount" class="w-full" />
                    </div>

                    <div class="form-field">
                      <label for="lastAssetValue">What was your total asset value at that time?</label>
                      <InputNumber v-model="previousPaymentData.assetValue" id="lastAssetValue" mode="currency"
                        currency="EGP" locale="en-US" placeholder="Enter asset value" class="w-full" />
                    </div>
                  </div>

                  <div class="step-actions">
                    <Button label="Continue" @click="proceedToStep(3)" :disabled="!isPreviousPaymentDataValid"
                      class="p-button-primary" />
                  </div>
                </div>
              </div>

              <!-- Step 3: Asset Continuity Check -->
              <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
                <div class="step-header">
                  <div class="step-number">{{ hasPaidZakatBefore ? '3' : '2' }}</div>
                  <h3>Asset Continuity</h3>
                </div>

                <div v-if="currentStep === 3" class="step-content">
                  <p class="question">
                    {{ hasPaidZakatBefore
                      ? 'Have your assets been above the Nisab threshold continuously since your last payment?'
                      : 'Are your current assets above the Nisab threshold?'
                    }}
                  </p>

                  <div class="nisab-info">
                    <div class="nisab-card">
                      <h4>Current Nisab Threshold</h4>
                      <div class="nisab-value">{{ currentNisab.toLocaleString() }} EGP</div>
                      <p class="nisab-description">
                        Based on current gold/silver prices
                      </p>
                    </div>
                  </div>

                  <div class="button-group">
                    <Button label="Yes, assets have been above Nisab"
                      :class="{ 'p-button-success': assetsAboveNisab === true }" @click="setAssetsAboveNisab(true)"
                      class="mr-2" />
                    <Button label="No, assets fell below Nisab"
                      :class="{ 'p-button-success': assetsAboveNisab === false }" @click="setAssetsAboveNisab(false)"
                      outlined />
                  </div>
                </div>
              </div>

              <!-- Step 4: Current Status & Confirmation -->
              <div class="step" :class="{ active: currentStep === 4 }">
                <div class="step-header">
                  <div class="step-number">{{ hasPaidZakatBefore ? '4' : '3' }}</div>
                  <h3>Setup Complete</h3>
                </div>

                <div v-if="currentStep === 4" class="step-content">
                  <div class="status-summary">
                    <h4>Your Zakat Status</h4>
                    <div class="status-card" :class="hawlStatus.class">
                      <div class="status-icon">
                        <i :class="hawlStatus.icon"></i>
                      </div>
                      <div class="status-content">
                        <h5>{{ hawlStatus.title }}</h5>
                        <p>{{ hawlStatus.description }}</p>
                        <div v-if="hawlStatus.details" class="status-details">
                          <p>{{ hawlStatus.details }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions">
                    <Button label="Complete Setup" @click="completeSetup" class="p-button-primary" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Main Zakat Dashboard (after onboarding) -->
      <div v-else class="zakat-dashboard">
        <div class="dashboard-grid">
          <!-- Hawl Status Card -->
          <Card class="hawl-status-card">
            <template #header>
              <div class="card-header">
                <h3>Hawl Status</h3>
                <Tag :value="hawlData.status" :severity="getHawlStatusSeverity(hawlData.status)" />
              </div>
            </template>

            <template #content>
              <div class="hawl-info">
                <div class="hawl-dates">
                  <div class="date-item">
                    <label>Start Date:</label>
                    <span>{{ formatDate(hawlData.startDate) }}</span>
                  </div>
                  <div class="date-item">
                    <label>End Date:</label>
                    <span>{{ formatDate(hawlData.endDate) }}</span>
                  </div>
                </div>

                <div class="hawl-progress">
                  <div class="progress-info">
                    <span>Progress: {{ hawlProgress }}%</span>
                    <span>{{ daysRemaining }} days remaining</span>
                  </div>
                  <ProgressBar :value="hawlProgress" class="hawl-progress-bar" />
                </div>
              </div>
            </template>
          </Card>

          <!-- Nisab Status Card -->
          <Card class="nisab-status-card">
            <template #header>
              <div class="card-header">
                <h3>Nisab Status</h3>
                <Tag :value="nisabStatus.isEligible ? 'Eligible' : 'Not Eligible'"
                  :severity="nisabStatus.isEligible ? 'success' : 'danger'" />
              </div>
            </template>

            <template #content>
              <div class="nisab-info">
                <div class="nisab-threshold">
                  <label>Current Nisab:</label>
                  <span class="nisab-value">{{ currentNisab.toLocaleString() }} EGP</span>
                </div>
                <div class="user-assets">
                  <label>Your Assets:</label>
                  <span class="asset-value">{{ nisabStatus.totalAssets.toLocaleString() }} EGP</span>
                </div>
                <div class="nisab-difference">
                  <label>Difference:</label>
                  <span :class="nisabStatus.isEligible ? 'text-green-600' : 'text-red-600'">
                    {{ (nisabStatus.totalAssets - currentNisab).toLocaleString() }} EGP
                  </span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Zakat Calculation Card -->
          <Card class="zakat-calculation-card">
            <template #header>
              <div class="card-header">
                <h3>Zakat Calculation</h3>
                <Tag :value="`${zakatRate}%`" severity="info" />
              </div>
            </template>

            <template #content>
              <div class="zakat-calculation">
                <div class="calculation-breakdown">
                  <div class="calculation-item">
                    <label>Total Assets:</label>
                    <span>{{ nisabStatus.totalAssets.toLocaleString() }} EGP</span>
                  </div>
                  <div class="calculation-item">
                    <label>Deductions:</label>
                    <span>{{ zakatCalculation.deductions.toLocaleString() }} EGP</span>
                  </div>
                  <div class="calculation-item total">
                    <label>Net Zakatable Assets:</label>
                    <span>{{ zakatCalculation.netAssets.toLocaleString() }} EGP</span>
                  </div>
                  <div class="calculation-item zakat-amount">
                    <label>Zakat Amount ({{ zakatRate }}%):</label>
                    <span class="zakat-total">{{ zakatCalculation.amount.toLocaleString() }} EGP</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Onboarding state
const currentStep = ref(1)
const hasPaidZakatBefore = ref(null)
const assetsAboveNisab = ref(null)

// Previous payment data
const previousPaymentData = ref({
  date: null,
  amount: null,
  assetValue: null
})

// Hawl data
const hawlData = ref(null)

// Nisab and calculation data
const currentNisab = ref(150000) // Placeholder - will be calculated from gold/silver prices (approximately 85g gold in EGP)
const zakatRate = 2.5

// Computed properties
const isPreviousPaymentDataValid = computed(() => {
  return previousPaymentData.value.date &&
    previousPaymentData.value.amount &&
    previousPaymentData.value.assetValue
})

const nisabStatus = computed(() => {
  // Placeholder calculation - will be replaced with real asset calculation
  const totalAssets = 500000 // This should come from budget items (500k EGP)
  return {
    totalAssets,
    isEligible: totalAssets >= currentNisab.value
  }
})

const zakatCalculation = computed(() => {
  const totalAssets = nisabStatus.value.totalAssets
  const deductions = 0 // Placeholder - will calculate real deductions
  const netAssets = totalAssets - deductions
  const amount = netAssets * (zakatRate / 100)

  return {
    totalAssets,
    deductions,
    netAssets,
    amount
  }
})

const hawlProgress = computed(() => {
  if (!hawlData.value) return 0

  const startDate = new Date(hawlData.value.startDate)
  const endDate = new Date(hawlData.value.endDate)
  const now = new Date()

  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))

  return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
})

const daysRemaining = computed(() => {
  if (!hawlData.value) return 0

  const endDate = new Date(hawlData.value.endDate)
  const now = new Date()

  return Math.max(Math.floor((endDate - now) / (1000 * 60 * 60 * 24)), 0)
})

const hawlStatus = computed(() => {
  if (!hawlData.value) {
    return {
      class: 'status-new',
      icon: 'pi pi-plus-circle',
      title: 'Start New Hawl',
      description: 'Your assets are above Nisab threshold. Start your Zakat year.',
      details: null
    }
  }

  // This will be calculated based on Hawl logic
  return {
    class: 'status-active',
    icon: 'pi pi-clock',
    title: 'Hawl in Progress',
    description: 'Your Zakat year is ongoing.',
    details: `${daysRemaining.value} days remaining`
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

const completeSetup = () => {
  // Create Hawl data based on user responses
  const now = new Date()
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 354) // Add 354 days (lunar year)

  hawlData.value = {
    id: `hawl-${now.getFullYear()}`,
    startDate: now.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: 'active',
    initialAssets: nisabStatus.value.totalAssets,
    currentAssets: nisabStatus.value.totalAssets,
    nisabThreshold: currentNisab.value,
    hasBeenInterrupted: false,
    continuousAboveNisab: true,
    previousPaymentData: hasPaidZakatBefore.value ? previousPaymentData.value : null
  }

  // Save to localStorage or database
  localStorage.setItem('zakat-hawl-data', JSON.stringify(hawlData.value))
}

const getHawlStatusSeverity = (status) => {
  switch (status) {
    case 'active': return 'info'
    case 'due': return 'warning'
    case 'paid': return 'success'
    case 'interrupted': return 'danger'
    default: return 'secondary'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Load existing Hawl data on mount
onMounted(() => {
  const savedHawlData = localStorage.getItem('zakat-hawl-data')
  if (savedHawlData) {
    hawlData.value = JSON.parse(savedHawlData)
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
