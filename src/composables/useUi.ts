// composables/useUi.ts
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '../stores/ui/ui.store'

export interface UseUiOptions {
    autoInit?: boolean
}

/**
 * UI Composable
 * Provides reactive UI state and operations
 * Aligned with the ui.store for consistent state management
 */
export function useUi(options: UseUiOptions = {}) {
    const { autoInit = true } = options

    // ============================================
    // Store Integration
    // ============================================
    const store = useUiStore()

    // Store refs for reactivity
    const {
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
        themeClass,
        isConnected,
        hasError,
        hasSuccess,
    } = storeToRefs(store)

    // ============================================
    // Local State
    // ============================================
    const isReady = ref(false)
    let onlineListeners: (() => void)[] = []
    let offlineListeners: (() => void)[] = []

    // ============================================
    // Computed - Additional UI States
    // ============================================

    /**
     * Whether the UI is in dark mode
     */
    const isDark = computed({
        get: () => isDarkMode.value,
        set: (val: boolean) => {
            store.setDarkMode(val)
        },
    })

    /**
     * Whether the UI is in light mode
     */
    const isLight = computed(() => !isDarkMode.value)

    /**
     * Current theme mode (for display)
     */
    const currentTheme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

    /**
     * Whether the app is online
     */
    const online = computed(() => !isOffline.value)

    /**
     * Whether the app is offline
     */
    const offline = computed(() => isOffline.value)

    /**
     * Whether there's a global error
     */
    const hasGlobalError = computed(() => !!globalError.value)

    /**
     * Whether there's a global success message
     */
    const hasGlobalSuccess = computed(() => !!globalSuccess.value)

    /**
     * Get the current toast count
     */
    const toastCount = computed(() => toastQueue.value.length)

    /**
     * Get the latest toast
     */
    const latestToast = computed(() => {
        if (toastQueue.value.length === 0) return null
        return toastQueue.value[toastQueue.value.length - 1]
    })

    // ============================================
    // Methods - Drawer
    // ============================================

    /**
     * Toggle the drawer
     */
    function toggleDrawer(): void {
        store.toggleDrawer()
    }

    /**
     * Open the drawer
     */
    function openDrawer(): void {
        store.setDrawerOpen(true)
    }

    /**
     * Close the drawer
     */
    function closeDrawer(): void {
        store.setDrawerOpen(false)
    }

    /**
     * Set drawer state
     */
    function setDrawerOpen(open: boolean): void {
        store.setDrawerOpen(open)
    }

    // ============================================
    // Methods - Theme
    // ============================================

    /**
     * Toggle dark mode
     */
    function toggleDarkMode(): void {
        store.toggleDarkMode()
    }

    /**
     * Set dark mode
     */
    function setDarkMode(dark: boolean): void {
        store.setDarkMode(dark)
    }

    /**
     * Set theme to system preference
     */
    function setSystemTheme(): void {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        store.setDarkMode(prefersDark)
        localStorage.setItem('bcm_theme', 'system')
    }

    /**
     * Get the current theme as a string
     */
    function getTheme(): 'light' | 'dark' {
        return isDarkMode.value ? 'dark' : 'light'
    }

    // ============================================
    // Methods - Network
    // ============================================

    /**
     * Set online status
     */
    function setOnline(connectionType?: string): void {
        store.setOnline(connectionType)
    }

    /**
     * Set offline status
     */
    function setOffline(): void {
        store.setOffline()
    }

    /**
     * Check if the app is online
     */
    function checkOnlineStatus(): void {
        if (navigator.onLine) {
            const conn = (navigator as any).connection
            const type = conn?.effectiveType || 'unknown'
            store.setOnline(type)
        } else {
            store.setOffline()
        }
    }

    // ============================================
    // Methods - Loading
    // ============================================

    /**
     * Set loading state
     */
    function setLoading(loading: boolean, message?: string): void {
        store.setLoading(loading, message)
    }

    /**
     * Show a loading indicator with a message
     */
    function showLoading(message: string = 'Loading...'): void {
        store.setLoading(true, message)
    }

    /**
     * Hide the loading indicator
     */
    function hideLoading(): void {
        store.setLoading(false)
    }

    /**
     * Wrap an async function with loading state
     */
    async function withLoading<T>(
        fn: () => Promise<T>,
        message: string = 'Loading...'
    ): Promise<T> {
        showLoading(message)
        try {
            return await fn()
        } finally {
            hideLoading()
        }
    }

    // ============================================
    // Methods - Notifications
    // ============================================

    /**
     * Set a global error message
     */
    function setError(message: string | null, duration?: number): void {
        store.setError(message, duration)
    }

    /**
     * Set a global success message
     */
    function setSuccess(message: string | null, duration?: number): void {
        store.setSuccess(message, duration)
    }

    /**
     * Clear the global error
     */
    function clearError(): void {
        store.clearError()
    }

    /**
     * Clear the global success
     */
    function clearSuccess(): void {
        store.clearSuccess()
    }

    /**
     * Add a toast notification
     */
    function addToast(
        type: 'info' | 'success' | 'warning' | 'error',
        title: string,
        message?: string,
        duration: number = 5000,
        actions?: { label: string; handler: () => void; color?: string }[]
    ): void {
        store.addToast({
            type,
            title,
            duration,
            ...(message !== undefined ? { message } : {}),
            ...(actions !== undefined ? { actions } : {}),
        })
    }

    /**
     * Add an info toast
     */
    function toastInfo(title: string, message?: string, duration?: number): void {
        addToast('info', title, message, duration)
    }

    /**
     * Add a success toast
     */
    function toastSuccess(title: string, message?: string, duration?: number): void {
        addToast('success', title, message, duration)
    }

    /**
     * Add a warning toast
     */
    function toastWarning(title: string, message?: string, duration?: number): void {
        addToast('warning', title, message, duration)
    }

    /**
     * Add an error toast
     */
    function toastError(title: string, message?: string, duration?: number): void {
        addToast('error', title, message, duration)
    }

    /**
     * Remove a toast
     */
    function removeToast(id: string): void {
        store.removeToast(id)
    }

    /**
     * Clear all toasts
     */
    function clearToasts(): void {
        toastQueue.value = []
    }

    // ============================================
    // Methods - Search
    // ============================================

    /**
     * Toggle search visibility
     */
    function toggleSearch(): void {
        store.toggleSearch()
    }

    /**
     * Show search
     */
    function showSearch(): void {
        store.isSearchVisible = true
    }

    /**
     * Hide search
     */
    function hideSearch(): void {
        store.isSearchVisible = false
        store.searchQuery = ''
    }

    /**
     * Set search query
     */
    function setSearchQuery(query: string): void {
        store.searchQuery = query
    }

    /**
     * Clear search query
     */
    function clearSearch(): void {
        store.searchQuery = ''
    }

    // ============================================
    // Methods - Modal
    // ============================================

    /**
     * Open a modal
     */
    function openModal(modalId: string): void {
        store.openModal(modalId)
    }

    /**
     * Close the active modal
     */
    function closeModal(): void {
        store.closeModal()
    }

    /**
     * Check if a modal is open
     */
    function isModalOpen(modalId: string): boolean {
        return activeModal.value === modalId
    }

    /**
     * Get the active modal ID
     */
    function getActiveModal(): string | null {
        return activeModal.value
    }

    // ============================================
    // Methods - Initialization
    // ============================================

    /**
     * Initialize the UI composable
     */
    function initialize(): void {
        if (isReady.value) return

        // Initialize theme from localStorage or system preference
        store.initializeTheme()

        // Check initial online status
        checkOnlineStatus()

        // Set up online/offline listeners
        setupNetworkListeners()

        isReady.value = true
    }

    /**
     * Set up network listeners
     */
    function setupNetworkListeners(): void {
        // Remove existing listeners
        teardownNetworkListeners()

        const handleOnline = () => checkOnlineStatus()
        const handleOffline = () => store.setOffline()

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        onlineListeners.push(() => window.removeEventListener('online', handleOnline))
        offlineListeners.push(() => window.removeEventListener('offline', handleOffline))

        // Listen for connection type changes
        const conn = (navigator as any).connection
        if (conn) {
            const handleConnectionChange = () => {
                if (navigator.onLine) {
                    store.setOnline(conn.effectiveType || 'unknown')
                }
            }
            conn.addEventListener('change', handleConnectionChange)
            onlineListeners.push(() => conn.removeEventListener('change', handleConnectionChange))
        }
    }

    /**
     * Tear down network listeners
     */
    function teardownNetworkListeners(): void {
        onlineListeners.forEach((fn) => fn())
        onlineListeners = []
        offlineListeners.forEach((fn) => fn())
        offlineListeners = []
    }

    /**
     * Reset all UI state
     */
    function reset(): void {
        store.isDrawerOpen = false
        store.isLoading = false
        store.loadingMessage = 'Loading...'
        store.globalError = null
        store.globalSuccess = null
        store.isSearchVisible = false
        store.searchQuery = ''
        store.activeModal = null
        store.toastQueue = []
    }

    // ============================================
    // Methods - Utility
    // ============================================

    /**
     * Get a CSS class string for the current theme
     */
    function getThemeClass(): string {
        return themeClass.value
    }

    /**
     * Check if the app is ready
     */
    function isAppReady(): boolean {
        return isReady.value
    }

    // ============================================
    // Lifecycle
    // ============================================

    onMounted(() => {
        if (autoInit) {
            initialize()
        }
    })

    onUnmounted(() => {
        teardownNetworkListeners()
    })

    // Watch for theme changes and apply them
    watch(
        () => isDarkMode.value,
        () => {
            // Theme is already applied by the store
            // This is just for additional side effects
        }
    )

    // Watch for system theme preference changes
    if (window.matchMedia) {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const saved = localStorage.getItem('bcm_theme')
            if (saved === 'system') {
                store.setDarkMode(e.matches)
            }
        }
        darkModeMediaQuery.addEventListener('change', handleSystemThemeChange)
        onUnmounted(() => {
            darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange)
        })
    }

    // ============================================
    // Return API
    // ============================================

    return {
        // State (from store)
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
        themeClass,
        isConnected,
        hasError,
        hasSuccess,

        // Additional computed
        isDark,
        isLight,
        currentTheme,
        online,
        offline,
        hasGlobalError,
        hasGlobalSuccess,
        toastCount,
        latestToast,

        // Drawer methods
        toggleDrawer,
        openDrawer,
        closeDrawer,
        setDrawerOpen,

        // Theme methods
        toggleDarkMode,
        setDarkMode,
        setSystemTheme,
        getTheme,

        // Network methods
        setOnline,
        setOffline,
        checkOnlineStatus,

        // Loading methods
        setLoading,
        showLoading,
        hideLoading,
        withLoading,

        // Notification methods
        setError,
        setSuccess,
        clearError,
        clearSuccess,
        addToast,
        toastInfo,
        toastSuccess,
        toastWarning,
        toastError,
        removeToast,
        clearToasts,

        // Search methods
        toggleSearch,
        showSearch,
        hideSearch,
        setSearchQuery,
        clearSearch,

        // Modal methods
        openModal,
        closeModal,
        isModalOpen,
        getActiveModal,

        // Utility methods
        initialize,
        reset,
        getThemeClass,
        isAppReady,

        // Store reference (for advanced use)
        store,
    }
}

// Export singleton instance pattern
let uiInstance: ReturnType<typeof useUi> | null = null

/**
 * Get the singleton UI instance
 */
export function getUi(): ReturnType<typeof useUi> {
    if (!uiInstance) {
        uiInstance = useUi()
    }
    return uiInstance
}

export default useUi