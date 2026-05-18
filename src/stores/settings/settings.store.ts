import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  ThemeSettings,
  LanguageSettings,
  DisplaySettings,
  SecuritySettings,
  Settings,
  SyncSettings,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_LANGUAGE_SETTINGS,
  DEFAULT_DISPLAY_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
} from './../../models/entities'
import { settingsService } from './../../services/api'
import type {
  DefaultSettingsTemplate,
  SettingsQueryParams,
  UpdateSettingsRequest,
  SettingsValidationResult,
} from './../../types'
import { useAuthStore } from './../auth/auth.store'

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()

  // ============================================
  // State
  // ============================================
  const settings = ref<Settings | null>(null)
  const organisationSettings = ref<Settings[]>([])
  const systemDefaultSettings = ref<Settings | null>(null)
  const settingsTemplates = ref<DefaultSettingsTemplate[]>([])

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  const filters = ref<SettingsQueryParams>({})

  // Available options
  const availableThemes = ref<Array<{ id: string; name: string; preview_url?: string }>>([])
  const availableLocales = ref<Array<{ code: string; name: string; native_name: string }>>([])

  // ============================================
  // Getters - User Settings
  // ============================================

  const hasSettings = computed(() => settings.value !== null)

  const userPreferences = computed(() => settings.value?.preferences || {})

  const notificationSettings = computed(() => settings.value?.notification_settings || {})

  // Fixed: Use default theme settings when settings.value.theme_settings is undefined
  const themeSettings = computed((): ThemeSettings => {
    return settings.value?.theme_settings || DEFAULT_THEME_SETTINGS
  })

  // Fixed: Properly typed with default values
  const isDarkMode = computed(() => {
    const mode = themeSettings.value.mode || 'system'
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return mode === 'dark'
  })

  // Fixed: Use default language settings when undefined
  const languageSettings = computed((): LanguageSettings => {
    return settings.value?.language_settings || DEFAULT_LANGUAGE_SETTINGS
  })

  // Fixed: locale property now exists on LanguageSettings
  const currentLocale = computed(() => languageSettings.value.locale || 'en')

  // Fixed: Use default display settings when undefined
  const displaySettings = computed((): DisplaySettings => {
    return settings.value?.display_settings || DEFAULT_DISPLAY_SETTINGS
  })

  // Fixed: table_density property now exists on DisplaySettings
  const tableDensity = computed(() => displaySettings.value.table_density || 'normal')
  const itemsPerPageSetting = computed(() => userPreferences.value.items_per_page || 20)
  const dateFormat = computed(() => userPreferences.value.date_format || 'YYYY-MM-DD')
  const timeFormat = computed(() => userPreferences.value.time_format || 'HH:mm')
  const timezone = computed(() => userPreferences.value.timezone || 'UTC')

  // Fixed: Use default security settings when undefined
  const securitySettings = computed((): SecuritySettings => {
    return settings.value?.security_settings || DEFAULT_SECURITY_SETTINGS
  })

  // Fixed: session_timeout_minutes property now exists on SecuritySettings
  const sessionTimeout = computed(() => securitySettings.value.session_timeout_minutes || 30)

  // Fixed: two_factor_enabled property now exists on SecuritySettings
  const twoFactorEnabled = computed(() => securitySettings.value.two_factor_enabled || false)

  // Fixed: Use default sync settings when undefined
  const syncSettings = computed((): SyncSettings => {
    return settings.value?.sync_settings || DEFAULT_SYNC_SETTINGS
  })

  // Fixed: auto_sync_enabled property now exists on SyncSettings
  const autoSyncEnabled = computed(() => syncSettings.value.auto_sync_enabled ?? true)

  // Fixed: sync_interval_minutes property now exists on SyncSettings
  const syncInterval = computed(() => syncSettings.value.sync_interval_minutes || 15)

  const privacySettings = computed(() => settings.value?.privacy_settings || {})

  // ============================================
  // Getters - Organisation Settings
  // ============================================

  const hasOrganisationSettings = computed(() => organisationSettings.value.length > 0)

  const organisationDefaultSettings = computed(
    () => organisationSettings.value.find((s) => !s.user_id) || null
  )

  const userSettingsInOrganisation = computed(() =>
    organisationSettings.value.filter((s) => s.user_id)
  )

  // ============================================
  // Getters - System Settings
  // ============================================

  const hasSystemDefaultSettings = computed(() => systemDefaultSettings.value !== null)

  // ============================================
  // Actions - Initialization
  // ============================================

  /**
   * Initialize settings for current user
   */
  async function initializeSettings(): Promise<void> {
    if (!authStore.isAuthenticated) return

    isLoading.value = true
    error.value = null

    try {
      // Load user settings
      await loadUserSettings()

      // Load system defaults
      await loadSystemDefaultSettings()

      // Load available themes and locales
      await loadAvailableThemes()
      await loadAvailableLocales()

      // Apply theme
      applyTheme()

      // Watch for system theme changes
      if (themeSettings.value.mode === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          applyTheme()
        })
      }
    } catch (err: any) {
      console.error('Failed to initialize settings:', err)
      error.value = err.message || 'Failed to initialize settings'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load current user's settings
   */
  async function loadUserSettings(): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    try {
      settings.value = await settingsService.getUserSettings(userId)
    } catch (err: any) {
      console.error('Failed to load user settings:', err)
      // Create default settings if not found
      if (err.response?.status === 404) {
        await createDefaultSettings()
      } else {
        throw err
      }
    }
  }

  /**
   * Create default settings for current user
   */
  async function createDefaultSettings(): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    try {
      const systemDefaults = await settingsService.getSystemDefaultSettings()
      settings.value = await settingsService.createSettings({
        user_id: userId,
        organisation_id: authStore.userOrganisationId,
        preferences: systemDefaults.preferences,
        notification_settings: systemDefaults.notification_settings,
        theme_settings: systemDefaults.theme_settings,
        language_settings: systemDefaults.language_settings,
        display_settings: systemDefaults.display_settings,
        security_settings: systemDefaults.security_settings,
        sync_settings: systemDefaults.sync_settings,
        privacy_settings: systemDefaults.privacy_settings,
        is_system_default: false,
        created_by: userId,
        updated_by: userId,
      } as any)
    } catch (err: any) {
      console.error('Failed to create default settings:', err)
      throw err
    }
  }

  /**
   * Load system default settings
   */
  async function loadSystemDefaultSettings(): Promise<void> {
    try {
      systemDefaultSettings.value = await settingsService.getSystemDefaultSettings()
    } catch (err: any) {
      console.error('Failed to load system default settings:', err)
    }
  }

  /**
   * Load organisation settings
   */
  async function loadOrganisationSettings(organisationId?: string): Promise<void> {
    const orgId = organisationId || authStore.userOrganisationId
    if (!orgId) return

    isLoading.value = true

    try {
      organisationSettings.value = await settingsService.getOrganisationSettings(orgId)
    } catch (err: any) {
      console.error('Failed to load organisation settings:', err)
      error.value = err.message || 'Failed to load organisation settings'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load all settings with pagination
   */
  async function loadAllSettings(params?: SettingsQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await settingsService.getSettings(queryParams)

      // Filter based on type
      if (params?.user_id) {
        const found = response.data?.find((s) => s.user_id === params.user_id)
        if (found) settings.value = found
      }
      if (params?.organisation_id) {
        organisationSettings.value = response.data || []
      }
      if (params?.is_system_default) {
        systemDefaultSettings.value = response.data?.[0] || null
      }

      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0

      if (params) filters.value = { ...filters.value, ...params }
    } catch (err: any) {
      console.error('Failed to load settings:', err)
      error.value = err.message || 'Failed to load settings'
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - Update Settings
  // ============================================

  /**
   * Update user settings
   */
  async function updateUserSettings(data: UpdateSettingsRequest): Promise<Settings> {
    isSaving.value = true
    error.value = null

    try {
      const userId = authStore.userId
      if (!userId) throw new Error('No user logged in')

      const updated = await settingsService.updateUserSettings(userId, data)
      settings.value = updated

      // Apply theme if changed
      if (data.theme_settings) {
        applyTheme()
      }

      return updated
    } catch (err: any) {
      console.error('Failed to update settings:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update settings'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update user preference
   */
  async function updatePreference<T = any>(key: string, value: T): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    try {
      await settingsService.setUserPreference(userId, key, value)

      // Update local state
      if (settings.value) {
        const keys = key.split('.')
        let current: any = settings.value.preferences || {}
        const lastKey = keys.pop()!
        let parent = current

        for (const k of keys) {
          if (!parent[k]) parent[k] = {}
          parent = parent[k]
        }
        parent[lastKey] = value

        settings.value.preferences = current
      }
    } catch (err: any) {
      console.error('Failed to update preference:', err)
      error.value = err.message || 'Failed to update preference'
      throw err
    }
  }

  /**
   * Update theme settings
   */
  async function updateTheme(themeSettings: Partial<ThemeSettings>): Promise<void> {
    await updateUserSettings({ theme_settings: themeSettings })
  }

  /**
   * Update language settings
   */
  async function updateLanguage(languageSettings: Partial<LanguageSettings>): Promise<void> {
    await updateUserSettings({ language_settings: languageSettings })
  }

  /**
   * Update display settings
   */
  async function updateDisplay(displaySettings: Partial<DisplaySettings>): Promise<void> {
    await updateUserSettings({ display_settings: displaySettings })
  }

  /**
   * Update notification settings for a specific type
   */
  async function updateNotificationType(
    notificationType: string,
    channel: 'email' | 'push' | 'sms' | 'in_app',
    enabled: boolean
  ): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    try {
      await settingsService.updateNotificationSettings(userId, notificationType, {
        [channel]: enabled,
      })

      // Update local state
      if (settings.value) {
        if (!settings.value.notification_settings[notificationType]) {
          settings.value.notification_settings[notificationType] = {
            email: true,
            push: true,
            sms: true,
            in_app: true,
          }
        }
        settings.value.notification_settings[notificationType][channel] = enabled
      }
    } catch (err: any) {
      console.error('Failed to update notification settings:', err)
      error.value = err.message || 'Failed to update notification settings'
      throw err
    }
  }

  /**
   * Update security settings
   */
  async function updateSecurity(securitySettings: Partial<SecuritySettings>): Promise<void> {
    await updateUserSettings({ security_settings: securitySettings })
  }

  /**
   * Update sync settings
   */
  async function updateSync(syncSettings: Partial<SyncSettings>): Promise<void> {
    await updateUserSettings({ sync_settings: syncSettings })
  }

  /**
   * Reset user settings to system defaults
   */
  async function resetSettings(): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    isSaving.value = true

    try {
      settings.value = await settingsService.resetUserSettings(userId)
      applyTheme()
    } catch (err: any) {
      console.error('Failed to reset settings:', err)
      error.value = err.message || 'Failed to reset settings'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Organisation Settings
  // ============================================

  /**
   * Update organisation default settings
   */
  async function updateOrganisationDefaultSettings(data: UpdateSettingsRequest): Promise<Settings> {
    const orgId = authStore.userOrganisationId
    if (!orgId) throw new Error('No organisation associated')

    isSaving.value = true

    try {
      const updated = await settingsService.updateOrganisationSettings(orgId, data)

      // Update local cache
      const index = organisationSettings.value.findIndex(
        (s: any) => !s.user_id && s.organisation_id === orgId
      )
      if (index !== -1) {
        organisationSettings.value[index] = updated
      } else {
        organisationSettings.value.push(updated)
      }

      return updated
    } catch (err: any) {
      console.error('Failed to update organisation settings:', err)
      error.value = err.message || 'Failed to update organisation settings'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Templates
  // ============================================

  /**
   * Load settings templates
   */
  async function loadSettingsTemplates(): Promise<void> {
    try {
      settingsTemplates.value = await settingsService.getSettingsTemplates()
    } catch (err: any) {
      console.error('Failed to load settings templates:', err)
    }
  }

  /**
   * Apply settings template
   */
  async function applyTemplate(templateId: string, userIds: string[]): Promise<void> {
    isSaving.value = true

    try {
      await settingsService.applySettingsTemplate(templateId, userIds)
    } catch (err: any) {
      console.error('Failed to apply template:', err)
      error.value = err.message || 'Failed to apply template'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Theme
  // ============================================

  /**
   * Apply current theme to document
   */
  function applyTheme(): void {
    const isDark = isDarkMode.value
    document.documentElement.classList.toggle('dark', isDark)

    // Apply custom colors if set
    const root = document.documentElement
    const theme = themeSettings.value

    if (theme.primary_color) {
      root.style.setProperty('--q-primary', theme.primary_color)
    }
    if (theme.secondary_color) {
      root.style.setProperty('--q-secondary', theme.secondary_color)
    }
    if (theme.accent_color) {
      root.style.setProperty('--q-accent', theme.accent_color)
    }

    // Apply font size
    if (theme.font_size) {
      const fontSizeMap = { small: '14px', medium: '16px', large: '18px' }
      root.style.setProperty('--q-body-font-size', fontSizeMap[theme.font_size])
    }
  }

  /**
   * Load available themes
   */
  async function loadAvailableThemes(): Promise<void> {
    try {
      availableThemes.value = await settingsService.getAvailableThemes()
    } catch (err: any) {
      console.error('Failed to load available themes:', err)
    }
  }

  /**
   * Load available locales
   */
  async function loadAvailableLocales(): Promise<void> {
    try {
      availableLocales.value = await settingsService.getAvailableLocales()
    } catch (err: any) {
      console.error('Failed to load available locales:', err)
    }
  }

  // ============================================
  // Actions - Validation
  // ============================================

  /**
   * Validate settings
   */
  async function validateSettings(
    settingsToValidate: UpdateSettingsRequest
  ): Promise<SettingsValidationResult> {
    try {
      return await settingsService.validateSettings(settingsToValidate)
    } catch (err: any) {
      console.error('Failed to validate settings:', err)
      return { valid: false, errors: [err.message], warnings: [] }
    }
  }

  // ============================================
  // Actions - Export/Import
  // ============================================

  /**
   * Export user settings
   */
  async function exportSettings(format: 'json' | 'csv' = 'json'): Promise<void> {
    const userId = authStore.userId
    if (!userId) return

    try {
      await settingsService.exportSettings({ user_id: userId, format })
    } catch (err: any) {
      console.error('Failed to export settings:', err)
      error.value = err.message || 'Failed to export settings'
      throw err
    }
  }

  /**
   * Import settings
   */
  async function importSettings(file: File, overwrite: boolean = false): Promise<void> {
    isSaving.value = true

    try {
      const result = await settingsService.importSettings(file, { overwrite })
      if (result.imported > 0) {
        await loadUserSettings()
      }
      if (result.errors.length > 0) {
        error.value = `Import completed with ${result.errors.length} errors`
      }
    } catch (err: any) {
      console.error('Failed to import settings:', err)
      error.value = err.message || 'Failed to import settings'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Utility
  // ============================================

  function clearAll(): void {
    settings.value = null
    organisationSettings.value = []
    systemDefaultSettings.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    filters.value = {}
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadAllSettings()
  }

  // ============================================
  // Watch for auth changes
  // ============================================
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        initializeSettings()
      } else {
        clearAll()
      }
    }
  )

  return {
    // State
    settings,
    organisationSettings,
    systemDefaultSettings,
    settingsTemplates,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    availableThemes,
    availableLocales,

    // Getters - User
    hasSettings,
    userPreferences,
    notificationSettings,
    themeSettings,
    isDarkMode,
    languageSettings,
    currentLocale,
    displaySettings,
    tableDensity,
    itemsPerPageSetting,
    dateFormat,
    timeFormat,
    timezone,
    securitySettings,
    sessionTimeout,
    twoFactorEnabled,
    syncSettings,
    autoSyncEnabled,
    syncInterval,
    privacySettings,

    // Getters - Organisation
    hasOrganisationSettings,
    organisationDefaultSettings,
    userSettingsInOrganisation,

    // Getters - System
    hasSystemDefaultSettings,

    // Actions - Initialization
    initializeSettings,
    loadUserSettings,
    loadOrganisationSettings,
    loadAllSettings,
    loadSystemDefaultSettings,
    loadSettingsTemplates,

    // Actions - Update
    updateUserSettings,
    updatePreference,
    updateTheme,
    updateLanguage,
    updateDisplay,
    updateNotificationType,
    updateSecurity,
    updateSync,
    resetSettings,

    // Actions - Organisation
    updateOrganisationDefaultSettings,

    // Actions - Templates
    applyTemplate,

    // Actions - Theme
    applyTheme,
    loadAvailableThemes,
    loadAvailableLocales,

    // Actions - Validation
    validateSettings,

    // Actions - Export/Import
    exportSettings,
    importSettings,

    // Actions - Utility
    clearAll,
    setPage,
  }
})
