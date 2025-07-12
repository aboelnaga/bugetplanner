<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Budgrt</h1>
        <p class="text-gray-600">Your Personal Budget Management</p>
      </div>

      <!-- Auth Tabs -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex mb-6">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
              activeTab === 'login'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Sign In
          </button>
          <button
            @click="activeTab = 'signup'"
            :class="[
              'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
              activeTab === 'signup'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Sign Up
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ authStore.error }}</p>
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="authStore.loading"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </form>

        <!-- Signup Form -->
        <form v-if="activeTab === 'signup'" @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label for="signup-name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="signup-name"
              v-model="signupForm.fullName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label for="signup-email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="signup-email"
              v-model="signupForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label for="signup-password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="signup-password"
              v-model="signupForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <div>
            <label for="signup-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              v-model="signupForm.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || !passwordsMatch"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleGoogleSignup"
            :disabled="authStore.loading"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-600">
        <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordsMatch = computed(() => {
  return signupForm.value.password === signupForm.value.confirmPassword
})

const handleLogin = async () => {
  try {
    await authStore.signIn(loginForm.value.email, loginForm.value.password)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleSignup = async () => {
  if (!passwordsMatch.value) {
    authStore.error = 'Passwords do not match'
    return
  }

  try {
    await authStore.signUp(
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.fullName
    )
    // Show success message or redirect
    activeTab.value = 'login'
    authStore.error = null
  } catch (error) {
    console.error('Signup error:', error)
  }
}

const handleGoogleLogin = async () => {
  try {
    await authStore.signInWithGoogle()
  } catch (error) {
    console.error('Google login error:', error)
  }
}

const handleGoogleSignup = async () => {
  try {
    await authStore.signInWithGoogle()
  } catch (error) {
    console.error('Google signup error:', error)
  }
}

const handleForgotPassword = async () => {
  if (!loginForm.value.email) {
    authStore.error = 'Please enter your email address first'
    return
  }

  try {
    await authStore.resetPassword(loginForm.value.email)
    authStore.error = null
    alert('Password reset email sent! Check your inbox.')
  } catch (error) {
    console.error('Password reset error:', error)
  }
}

onMounted(() => {
  // Redirect if already authenticated
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script> 