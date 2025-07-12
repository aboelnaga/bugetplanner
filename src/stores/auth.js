import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)

  // Initialize auth state
  const initAuth = async () => {
    try {
      loading.value = true
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session?.user) {
        user.value = session.user
        await createProfileIfNeeded(session.user)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          user.value = session.user
          await createProfileIfNeeded(session.user)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
        }
      })

    } catch (err) {
      error.value = err.message
      console.error('Auth initialization error:', err)
    } finally {
      loading.value = false
    }
  }

  // Create user profile if it doesn't exist
  const createProfileIfNeeded = async (userData) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.id)
        .single()

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.id,
            email: userData.email,
            full_name: userData.user_metadata?.full_name || '',
          })

        if (profileError) throw profileError
        console.log('Profile created for user:', userData.id)
      }
    } catch (err) {
      console.error('Error creating profile:', err)
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, fullName = '') => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (signUpError) throw signUpError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (googleError) throw googleError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError

      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) throw resetError
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)

      if (updateError) throw updateError

      // Update local user data
      user.value = { ...user.value, ...updates }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userId,
    
    // Actions
    initAuth,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }
}) 