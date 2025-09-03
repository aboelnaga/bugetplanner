<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLayout } from '@/layout/composables/layout'
import { useAuthStore } from '@/stores/auth.js'

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout()

const router = useRouter()
const authStore = useAuthStore()

const profilePanel = ref()
const profileBtnRef = ref()
const popoverWidth = ref(0)

const displayName = computed(() => authStore.user?.user_metadata?.full_name || 'User')
const email = computed(() => authStore.user?.email || '')
const displayNameShort = computed(() => {
  const name = displayName.value || ''
  return name.length > 18 ? name.slice(0, 18) + '…' : name
})
const userInitials = computed(() => {
  const fullName = authStore.user?.user_metadata?.full_name || ''
  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
  return initials || 'U'
})

const toggleProfile = (event) => {
  profilePanel.value?.toggle(event)
  isProfileOpen.value = !isProfileOpen.value
}

const isProfileOpen = ref(false)

const onPopoverShow = () => {
  isProfileOpen.value = true
  popoverWidth.value = profileBtnRef.value?.offsetWidth || 0
}

const onPopoverHide = () => {
  isProfileOpen.value = false
}

const onSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/auth')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Sign out error:', err)
  }
}
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">Budgrt</router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
      </div>
      
      <button
        ref="profileBtnRef"
        type="button"
        class="inline-flex items-center gap-2 px-2 py-1 border-round overflow-hidden max-w-[160px]"
        @click="toggleProfile($event)"
      >
        <Avatar :label="userInitials" class="bg-primary-500 text-white" shape="circle" />
        <span class="font-medium hidden md:inline truncate">{{ displayNameShort }}</span>
        <i class="hidden md:inline" :class="['pi', isProfileOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
      </button>
      <Popover
        ref="profilePanel"
        appendTo="self"
        @show="onPopoverShow"
        @hide="onPopoverHide"
        class=" w-[160px]"
      >
        <ul class="list-none p-0 m-0 flex flex-col">
          <li class="flex items-center gap-2 px-2 py-3 hover:surface-200 cursor-pointer rounded-border layout-topbar-menu-item">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </li>
          <li class="flex items-center gap-2 px-2 py-3 hover:surface-200 cursor-pointer rounded-border layout-topbar-menu-item" @click="onSignOut">
            <i class="pi pi-sign-out"></i>
            <span>Sign Out</span>
          </li>
        </ul>
      </Popover>
    </div>
  </div>
</template>
