import { ref, readonly } from 'vue'
import { supabase } from './supabase.js'

// Authentication helper functions
export const authAPI = {
  // Sign up with email and password
  async signUp (email, password, fullName = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error

    // Create profile if signup successful
    if (data.user) {
      await this.createProfile(data.user.id, email, fullName)
    }

    return data
  },

  // Sign in with email and password
  async signIn (email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut () {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser () {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Create or update profile
  async createProfile (userId, email, fullName) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user profile
  async getProfile (userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Update profile
  async updateProfile (userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Listen to auth state changes
  onAuthStateChange (callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Reactive auth state
export const useAuth = () => {
  const user = ref(null)
  const loading = ref(true)

  // Initialize auth state
  const initAuth = async () => {
    try {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  // Listen to auth changes
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    user.value = session?.user ?? null
    loading.value = false
  })

  // Initialize on mount
  initAuth()

  return {
    user: readonly(user),
    loading: readonly(loading),
    signUp: authAPI.signUp,
    signIn: authAPI.signIn,
    signOut: authAPI.signOut,
    getProfile: authAPI.getProfile,
    updateProfile: authAPI.updateProfile
  }
}
