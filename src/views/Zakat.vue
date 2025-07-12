<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Zakat Calculator</h1>
      <button class="btn-primary">Pay Zakat</button>
    </div>

    <!-- Zakat Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div class="card">
         <h3 class="text-lg font-semibold mb-3">Current Zakat Due</h3>
         <p class="text-3xl font-bold text-green-600">{{ formatCurrency(zakatDue || 0) }}</p>
         <p class="text-sm text-gray-500 mt-1">2.5% of total savings</p>
       </div>
       
       <div class="card">
         <h3 class="text-lg font-semibold mb-3">Total Wealth</h3>
         <p class="text-3xl font-bold text-blue-600">{{ formatCurrency(currentMonth?.savings || 0) }}</p>
         <p class="text-sm text-gray-500 mt-1">Zakatable amount</p>
       </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold mb-3">Nisab Threshold</h3>
        <p class="text-3xl font-bold text-purple-600">{{ formatCurrency(nisabThreshold) }}</p>
        <p class="text-sm text-gray-500 mt-1">Minimum for Zakat</p>
      </div>
    </div>

    <!-- Zakat Calculation Details -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Zakat Calculation Details</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <div class="font-medium">Current Savings</div>
            <div class="text-sm text-gray-500">Total accumulated wealth</div>
          </div>
                     <div class="text-lg font-semibold">{{ formatCurrency(currentMonth?.savings || 0) }}</div>
         </div>
         
         <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
           <div>
             <div class="font-medium">Zakat Rate</div>
             <div class="text-sm text-gray-500">Islamic wealth tax rate</div>
           </div>
           <div class="text-lg font-semibold">2.5%</div>
         </div>
         
         <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
           <div>
             <div class="font-medium text-green-900">Zakat Due</div>
             <div class="text-sm text-green-600">Amount to be paid</div>
           </div>
           <div class="text-lg font-bold text-green-900">{{ formatCurrency(zakatDue || 0) }}</div>
         </div>
      </div>
    </div>

    <!-- Zakat Information -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">About Zakat</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-2">What is Zakat?</h4>
          <p class="text-gray-600 text-sm mb-4">Zakat is one of the Five Pillars of Islam and is a form of almsgiving treated as a religious obligation. It requires Muslims to give 2.5% of their accumulated wealth annually to help the poor and needy.</p>
          
          <h4 class="font-medium mb-2">Eligibility</h4>
          <p class="text-gray-600 text-sm">You must pay Zakat if your wealth exceeds the Nisab threshold (approximately {{ formatCurrency(nisabThreshold) }}) and has been held for one full lunar year.</p>
        </div>
        
        <div>
          <h4 class="font-medium mb-2">Calculation Method</h4>
          <p class="text-gray-600 text-sm mb-4">Zakat is calculated at 2.5% of your total qualifying wealth, including cash, savings, investments, and gold/silver above the Nisab threshold.</p>
          
          <h4 class="font-medium mb-2">Payment Schedule</h4>
          <p class="text-gray-600 text-sm">Zakat should be paid annually. Based on your current savings, your next payment should be made during Ramadan or your personal Zakat anniversary date.</p>
        </div>
      </div>
    </div>

    <!-- Zakat History -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Zakat Payment History</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wealth at Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
                         <tr>
               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2024</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(currentMonth?.expenses?.zakat || 0) }}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(currentMonth?.savings || 0) }}</td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
               </td>
             </tr>
             <tr>
               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2025</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(zakatDue || 0) }}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(currentMonth?.savings || 0) }}</td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Due</span>
               </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()
const { currentMonth, zakatDue } = store

// Nisab threshold is approximately the value of 85 grams of gold
// Using an approximate value in EGP
const nisabThreshold = 85000

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}
</script> 