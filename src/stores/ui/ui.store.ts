import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // ============================================
  // State
  // ============================================
  const isDrawerOpen = ref(false)
  const isDarkMode = ref(false)
  const isOffline = ref(false)
  const isLoading = ref(false)
  const loadingMessage = ref('Loading...')
  const globalError = ref<string | null>(null)
  const globalSuccess = ref<string | null>(null)
  const networkType = ref<string>('unknown')
  const isSearchVisible = ref(false)
  const searchQuery = ref('')
  const activeModal = ref<string | null>(null)
  const toastQueue = ref<Toast[]>([])

  // ============================================
  // Getters
  // ============================================
  const themeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'))
  const isConnected = computed(() => !isOffline.value)
  const hasError = computed(() => !!globalError.value)
  const hasSuccess = computed(() => !!globalSuccess.value)

  // ============================================
  // Actions
  // ============================================

  function toggleDrawer(): void {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  function setDrawerOpen(open: boolean): void {
    isDrawerOpen.value = open
  }

  function toggleDarkMode(): void {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    localStorage.setItem('bcm_theme', isDarkMode.value ? 'dark' : 'light')
  }

  function setDarkMode(dark: boolean): void {
    isDarkMode.value = dark
    applyTheme()
  }

  function applyTheme(): void {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('body--dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('body--dark')
    }
  }

  function setOnline(connectionType?: string): void {
    isOffline.value = false
    if (connectionType) networkType.value = connectionType
  }

  function setOffline(): void {
    isOffline.value = true
    networkType.value = 'offline'
  }

  function setLoading(loading: boolean, message?: string): void {
    isLoading.value = loading
    if (message) loadingMessage.value = message
    if (!loading) loadingMessage.value = 'Loading...'
  }

  function setError(error: string | null, duration?: number): void {
    globalError.value = error
    if (error && duration) {
      setTimeout(() => {
        if (globalError.value === error) globalError.value = null
      }, duration)
    }
  }

  function setSuccess(message: string | null, duration: number = 3000): void {
    globalSuccess.value = message
    if (message && duration) {
      setTimeout(() => {
        if (globalSuccess.value === message) globalSuccess.value = null
      }, duration)
    }
  }

  function clearError(): void {
    globalError.value = null
  }

  function clearSuccess(): void {
    globalSuccess.value = null
  }

  function toggleSearch(): void {
    isSearchVisible.value = !isSearchVisible.value
    if (!isSearchVisible.value) {
      searchQuery.value = ''
    }
  }

  function openModal(modalId: string): void {
    activeModal.value = modalId
  }

  function closeModal(): void {
    activeModal.value = null
  }

  function addToast(toast: Toast): void {
    const id = `toast_${Date.now()}`
    toastQueue.value.push({ ...toast, id })
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration || 5000)
    }
  }

  function removeToast(id: string): void {
    toastQueue.value = toastQueue.value.filter((t) => t.id !== id)
  }

  function initializeTheme(): void {
    const saved = localStorage.getItem('bcm_theme')
    if (saved === 'dark' || saved === 'light') {
      isDarkMode.value = saved === 'dark'
    } else if (saved === 'system' || !saved) {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  return {
    // State
    isDrawerOpen,
    isDarkMode,
    isOffline,
    isLoading,
    loadingMessage,
    globalError,
    globalSuccess,
    networkType,
    isSearchVisible,
    searchQuery,
    activeModal,
    toastQueue,
    // Getters
    themeClass,
    isConnected,
    hasError,
    hasSuccess,
    // Actions
    toggleDrawer,
    setDrawerOpen,
    toggleDarkMode,
    setDarkMode,
    setOnline,
    setOffline,
    setLoading,
    setError,
    setSuccess,
    clearError,
    clearSuccess,
    toggleSearch,
    openModal,
    closeModal,
    addToast,
    removeToast,
    initializeTheme,
  }
})

/**
 * Toast interface
 */
interface Toast {
  id?: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  actions?: ToastAction[]
}

interface ToastAction {
  label: string
  handler: () => void
  color?: string
}
