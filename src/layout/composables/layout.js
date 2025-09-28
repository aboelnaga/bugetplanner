import { computed, onMounted, reactive } from 'vue'

const layoutConfig = reactive({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  darkTheme: false,
  menuMode: 'static'
})

const layoutState = reactive({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: null,
  sidebarCollapsed: false
})

export function useLayout () {
  // Load sidebar collapsed state from localStorage on mount
  onMounted(() => {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsedState !== null) {
      layoutState.sidebarCollapsed = JSON.parse(savedCollapsedState)
    }
  })

  const setActiveMenuItem = (item) => {
    layoutState.activeMenuItem = item.value || item
  }

  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle()

      return
    }

    document.startViewTransition(() => executeDarkModeToggle(event))
  }

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme
    document.documentElement.classList.toggle('app-dark')
  }

  const toggleMenu = () => {
    if (layoutConfig.menuMode === 'overlay') {
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive
    }

    if (window.innerWidth > 991) {
      // For desktop, toggle between expanded and collapsed (not hidden)
      layoutState.sidebarCollapsed = !layoutState.sidebarCollapsed
      layoutState.staticMenuDesktopInactive = false // Keep sidebar visible

      // Save the collapsed state to localStorage
      localStorage.setItem(
        'sidebar-collapsed',
        JSON.stringify(layoutState.sidebarCollapsed)
      )
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive
    }
  }

  const isSidebarActive = computed(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive
  )

  const isSidebarCollapsed = computed(() => layoutState.sidebarCollapsed)

  const isDarkTheme = computed(() => layoutConfig.darkTheme)

  const getPrimary = computed(() => layoutConfig.primary)

  const getSurface = computed(() => layoutConfig.surface)

  return {
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    isSidebarCollapsed,
    isDarkTheme,
    getPrimary,
    getSurface,
    setActiveMenuItem,
    toggleDarkMode
  }
}
