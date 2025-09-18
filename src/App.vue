<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import AppLayout from '@/layout/AppLayout.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <div
    v-if="authStore.loading"
    class="flex h-screen items-center justify-center"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-4 text-gray-600">
        Loading...
      </p>
    </div>
  </div>

  <div
    v-else-if="!authStore.isAuthenticated"
    class="h-screen"
  >
    <router-view />
  </div>

  <div
    v-else
    class="h-screen"
  >
    <AppLayout />
  </div>

  <!-- PrimeVue Toast Notifications -->
  <Toast />
  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog :draggable="false" />
</template>