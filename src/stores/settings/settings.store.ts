import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  Settings,
  ThemeSettings,
  LanguageSettings,
  DisplaySettings,
  SecuritySettings,
  SyncSettings,
} from '../../models/settings/settings.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { useAuthStore } from '../auth/auth.store'

// Re-import the defaults
import {
  DEFAULT_THEME_SETTINGS as DEFAULTS_THEME,
  DEFAULT_LANGUAGE_SETTINGS as DEFAULTS_LANGUAGE,
  DEFAULT_DISPLAY_SETTINGS as DEFAULTS_DISPLAY,
  DEFAULT_SECURITY_SETTINGS as DEFAULTS_SECURITY,
  DEFAULT_SYNC_SETTINGS as DEFAULTS_SYNC,
  DEFAULT_USER_PREFERENCES as DEFAULTS_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS as DEFAULTS_PRIVACY,
} from '../../models/settings/settings.entity'

export const useSettingsItemStore = createOfflineCrudStore<Settings>({
  storeId: 'settings',
  tableName: 'settings',
})

export const useSettingsStore = defineStore('settings', () => {
  const settingsStore = useSettingsItemStore()
  const authStore = useAuthStore()
  const isSaving = ref(false)
  const isInitialized = ref(false)

  // ============================================
  // Getters
  // ============================================
  const settings = computed(() => {
    // Find settings for current user
    return (
      settingsStore.items?.find((s) => s.userId === authStore.userId) ||
      settingsStore.items?.find((s) => !s.userId) || // Fallback to org default
      null
    )
  })

  const hasSettings = computed(() => settings.value !== null)

  const themeSettings = computed(
    (): ThemeSettings => settings.value?.themeSettings || DEFAULTS_THEME
  )

  const isDarkMode = computed(() => {
    const mode = themeSettings?.value?.mode || 'system'
    if (mode === 'system') {
      return typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    }
    return mode === 'dark'
  })

  const languageSettings = computed(
    (): LanguageSettings => settings.value?.languageSettings || DEFAULTS_LANGUAGE
  )

  const currentLocale = computed(() => languageSettings?.value?.locale || 'en')

  const displaySettings = computed(
    (): DisplaySettings => settings.value?.displaySettings || DEFAULTS_DISPLAY
  )

  const securitySettings = computed(
    (): SecuritySettings => settings.value?.securitySettings || DEFAULTS_SECURITY
  )

  const syncSettings = computed(() => ({
    autoSyncEnabled: settings.value?.syncSettings?.autoSyncEnabled ?? true,
    syncIntervalMinutes: settings.value?.syncSettings?.syncIntervalMinutes ?? 15,
    syncOnReconnect: settings.value?.syncSettings?.syncOnReconnect ?? true,
    syncOnAppStart: settings.value?.syncSettings?.syncOnAppStart ?? true,
    syncOnlyOnWifi: settings.value?.syncSettings?.syncOnlyOnWifi ?? true,
    conflictResolutionStrategy: settings.value?.syncSettings?.conflictResolutionStrategy ?? 'serverWins',
    maxRetryAttempts: settings.value?.syncSettings?.maxRetryAttempts ?? 3,
    retryDelaySeconds: settings.value?.syncSettings?.retryDelaySeconds ?? 30,
  }))

  const userPreferences = computed(
    () => settings.value?.preferences || DEFAULTS_PREFERENCES
  )

  const autoSyncEnabled = computed(() => syncSettings?.value?.autoSyncEnabled ?? true)
  const syncInterval = computed(() => syncSettings?.value?.syncIntervalMinutes || 15)

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    await settingsStore.initialize()

    // Create settings if not exist
    if (!settings.value && authStore.userId) {
      await settingsStore.create({
        userId: authStore.userId,
        organisationId: authStore.userOrganisationId,
        preferences: DEFAULTS_PREFERENCES,
        notificationSettings: {},
        themeSettings: DEFAULTS_THEME,
        languageSettings: DEFAULTS_LANGUAGE,
        displaySettings: DEFAULTS_DISPLAY,
        securitySettings: DEFAULTS_SECURITY,
        syncSettings: DEFAULTS_SYNC,
        privacySettings: DEFAULTS_PRIVACY,
        isSystemDefault: false,
      } as Partial<Settings>)
    }

    applyTheme()
    isInitialized.value = true
  }

  async function updateSettings(data: Partial<Settings>): Promise<Settings | null> {
    if (!settings.value) return null

    isSaving.value = true
    try {
      const updated = await settingsStore.update(settings?.value?.uuid, data)
      if (updated && data.themeSettings) {
        applyTheme()
      }
      return updated
    } finally {
      isSaving.value = false
    }
  }

  async function updateTheme(data: Partial<ThemeSettings>): Promise<void> {
    await updateSettings({
      themeSettings: { ...themeSettings.value, ...data },
    } as Partial<Settings>)
  }

  async function updateLanguage(data: Partial<LanguageSettings>): Promise<void> {
    await updateSettings({
      languageSettings: { ...languageSettings.value, ...data },
    } as Partial<Settings>)
  }

  async function updateDisplay(data: Partial<DisplaySettings>): Promise<void> {
    await updateSettings({
      displaySettings: { ...displaySettings.value, ...data },
    } as Partial<Settings>)
  }

  async function updateSecurity(data: Partial<SecuritySettings>): Promise<void> {
    await updateSettings({
      securitySettings: { ...securitySettings.value, ...data },
    } as Partial<Settings>)
  }

  async function updateSync(data: Partial<SyncSettings>): Promise<void> {
    await updateSettings({
      syncSettings: { ...syncSettings.value, ...data },
    } as Partial<Settings>)
  }

  function applyTheme(): void {
    if (typeof document === 'undefined') return
    const isDark = isDarkMode.value
    document.documentElement.classList.toggle('dark', isDark)

    // Apply custom CSS variables
    const root = document.documentElement
    const theme = themeSettings.value

    if (theme.primaryColor) root.style.setProperty('--q-primary', theme.primaryColor)
    if (theme.secondaryColor) root.style.setProperty('--q-secondary', theme.secondaryColor)
    if (theme.accentColor) root.style.setProperty('--q-accent', theme.accentColor)
  }

  async function resetSettings(): Promise<void> {
    if (!settings.value) return

    await updateSettings({
      preferences: DEFAULTS_PREFERENCES,
      themeSettings: DEFAULTS_THEME,
      languageSettings: DEFAULTS_LANGUAGE,
      displaySettings: DEFAULTS_DISPLAY,
      securitySettings: DEFAULTS_SECURITY,
      syncSettings: DEFAULTS_SYNC,
      privacySettings: DEFAULTS_PRIVACY,
    } as Partial<Settings>)

    applyTheme()
  }

  // Watch for auth changes
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) {
        initialize()
      } else {
        isInitialized.value = false
      }
    }
  )

  return {
    // State
    settings,
    isLoading: settingsStore.loading,
    isSaving,
    isInitialized,

    // Getters
    hasSettings,
    themeSettings,
    isDarkMode,
    languageSettings,
    currentLocale,
    displaySettings,
    securitySettings,
    syncSettings,
    userPreferences,
    autoSyncEnabled,
    syncInterval,

    // Actions
    initialize,
    updateSettings,
    updateTheme,
    updateLanguage,
    updateDisplay,
    updateSecurity,
    updateSync,
    applyTheme,
    resetSettings,

    // Sub-store
    settingsStore,
  }
})