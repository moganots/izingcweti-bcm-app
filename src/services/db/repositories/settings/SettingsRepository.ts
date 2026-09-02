import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
    NotificationChannelSettings,
    DEFAULT_USER_PREFERENCES,
    DEFAULT_THEME_SETTINGS,
    DEFAULT_LANGUAGE_SETTINGS,
    DEFAULT_DISPLAY_SETTINGS,
    DEFAULT_SECURITY_SETTINGS,
    DEFAULT_SYNC_SETTINGS,
    DEFAULT_PRIVACY_SETTINGS,
    ThemeSettings,
    LanguageSettings,
    SecuritySettings,
    Settings,
    SyncSettings,
    DisplaySettings,
} from './../../../../models/entities'

/**
 * Type for notification channel keys
 */
type NotificationChannel = keyof NotificationChannelSettings

/**
 * Type for notification type map
 */
interface NotificationSettingsMap {
    [notificationType: string]: NotificationChannelSettings
}

/**
 * Settings Repository
 * Manages application and user settings in IndexedDB
 */
export class SettingsRepository extends BaseRepository<Settings> {
    constructor(table: Table<Settings, string>) {
        super(table, 'settings')
    }

    /**
     * Find settings by user ID
     */
    async findByUserId(userId: string): Promise<Settings | undefined> {
        return this.findOne({ user_id: userId } as Partial<Settings>)
    }

    /**
     * Find settings by organisation ID
     */
    async findByOrganisationId(organisationId: string): Promise<Settings[]> {
        return this.findMany({ organisation_id: organisationId } as Partial<Settings>)
    }

    /**
     * Find system-wide settings (no user or organisation)
     */
    async findSystemSettings(): Promise<Settings | undefined> {
        return this.findOne({ is_system_default: true } as Partial<Settings>)
    }

    /**
     * Get settings by category
     */
    async findByCategory(category: string, userId?: string): Promise<Settings[]> {
        const all = await this.findAll()
        return all.filter(
            (settings) => settings.category === category && (!userId || settings.user_id === userId)
        )
    }

    /**
     * Get user preference value
     */
    async getUserPreference<T = any>(
        userId: string,
        key: string,
        defaultValue?: T
    ): Promise<T | undefined> {
        const settings = await this.findByUserId(userId)
        if (!settings || !settings.preferences) return defaultValue

        const keys = key.split('.')
        let value: any = settings.preferences

        for (const k of keys) {
            if (value === undefined || value === null) return defaultValue
            value = value[k]
        }

        return (value !== undefined ? value : defaultValue) as T
    }

    /**
     * Set user preference value
     */
    async setUserPreference<T = any>(
        userId: string,
        key: string,
        value: T
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            // Create new settings if doesn't exist
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        // Update nested preference
        const keys = key.split('.')
        let current: any = settings.preferences || {}
        const lastKey = keys.pop()!
        let parent = current

        for (const k of keys) {
            if (parent[k] === undefined || parent[k] === null) {
                parent[k] = {}
            }
            parent = parent[k]
        }

        parent[lastKey] = value

        return this.update(settings.uuid, {
            preferences: current,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get notification setting
     * Fixed: Added type assertion for notification settings lookup
     */
    async getNotificationSetting(
        userId: string,
        notificationType: string,
        channel: string
    ): Promise<boolean> {
        const settings = await this.findByUserId(userId)
        if (!settings || !settings.notification_settings) return true // Default enabled

        const notificationSettings = settings.notification_settings as NotificationSettingsMap
        const channelSettings = notificationSettings[notificationType]

        if (!channelSettings) return true

        // Type-safe channel lookup
        const channelKey = channel as NotificationChannel
        return channelSettings[channelKey] ?? true
    }

    /**
     * Set notification setting
     * Fixed: Added type assertion for notification settings assignment
     */
    async setNotificationSetting(
        userId: string,
        notificationType: string,
        channel: string,
        enabled: boolean
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const notificationSettings = (settings.notification_settings || {}) as NotificationSettingsMap
        if (!notificationSettings[notificationType]) {
            notificationSettings[notificationType] = {
                email: true,
                push: true,
                sms: true,
                in_app: true,
            }
        }

        const channelKey = channel as NotificationChannel
        notificationSettings[notificationType][channelKey] = enabled

        return this.update(settings.uuid, {
            notification_settings: notificationSettings,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get theme settings
     * Fixed: Returns default theme settings if not found
     */
    async getThemeSettings(userId: string): Promise<ThemeSettings> {
        const settings = await this.findByUserId(userId)
        return settings?.theme_settings || DEFAULT_THEME_SETTINGS
    }

    /**
     * Set theme settings
     */
    async setThemeSettings(
        userId: string,
        themeSettings: Partial<ThemeSettings>
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const currentTheme = settings.theme_settings || DEFAULT_THEME_SETTINGS
        const updatedTheme = { ...currentTheme, ...themeSettings }

        return this.update(settings.uuid, {
            theme_settings: updatedTheme,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get language settings
     * Fixed: Returns default language settings if not found
     */
    async getLanguageSettings(userId: string): Promise<LanguageSettings> {
        const settings = await this.findByUserId(userId)
        return settings?.language_settings || DEFAULT_LANGUAGE_SETTINGS
    }

    /**
     * Set language settings
     */
    async setLanguageSettings(
        userId: string,
        languageSettings: Partial<LanguageSettings>
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const currentLanguage = settings.language_settings || DEFAULT_LANGUAGE_SETTINGS
        const updatedLanguage = { ...currentLanguage, ...languageSettings }

        return this.update(settings.uuid, {
            language_settings: updatedLanguage,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get security settings
     * Fixed: Returns default security settings if not found
     */
    async getSecuritySettings(userId: string): Promise<SecuritySettings> {
        const settings = await this.findByUserId(userId)
        return settings?.security_settings || DEFAULT_SECURITY_SETTINGS
    }

    /**
     * Set security settings
     */
    async setSecuritySettings(
        userId: string,
        securitySettings: Partial<SecuritySettings>
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const currentSecurity = settings.security_settings || DEFAULT_SECURITY_SETTINGS
        const updatedSecurity = { ...currentSecurity, ...securitySettings }

        return this.update(settings.uuid, {
            security_settings: updatedSecurity,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get sync settings
     * Fixed: Returns default sync settings if not found
     */
    async getSyncSettings(userId: string): Promise<SyncSettings> {
        const settings = await this.findByUserId(userId)
        return settings?.sync_settings || DEFAULT_SYNC_SETTINGS
    }

    /**
     * Set sync settings
     */
    async setSyncSettings(
        userId: string,
        syncSettings: Partial<SyncSettings>
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const currentSync = settings.sync_settings || DEFAULT_SYNC_SETTINGS
        const updatedSync = { ...currentSync, ...syncSettings }

        return this.update(settings.uuid, {
            sync_settings: updatedSync,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get display settings
     * Fixed: Returns default display settings if not found
     */
    async getDisplaySettings(userId: string): Promise<DisplaySettings> {
        const settings = await this.findByUserId(userId)
        return settings?.display_settings || DEFAULT_DISPLAY_SETTINGS
    }

    /**
     * Set display settings
     */
    async setDisplaySettings(
        userId: string,
        displaySettings: Partial<DisplaySettings>
    ): Promise<Settings | undefined> {
        let settings = await this.findByUserId(userId)

        if (!settings) {
            settings = await this.create({
                user_id: userId,
                preferences: DEFAULT_USER_PREFERENCES,
                notification_settings: {},
                theme_settings: DEFAULT_THEME_SETTINGS,
                language_settings: DEFAULT_LANGUAGE_SETTINGS,
                display_settings: DEFAULT_DISPLAY_SETTINGS,
                security_settings: DEFAULT_SECURITY_SETTINGS,
                sync_settings: DEFAULT_SYNC_SETTINGS,
                privacy_settings: DEFAULT_PRIVACY_SETTINGS,
                is_system_default: false,
                created_by: userId,
                updated_by: userId,
            } as Partial<Settings>)
        }

        if (!settings) return undefined

        const currentDisplay = settings.display_settings || DEFAULT_DISPLAY_SETTINGS
        const updatedDisplay = { ...currentDisplay, ...displaySettings }

        return this.update(settings.uuid, {
            display_settings: updatedDisplay,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Reset user settings to defaults
     */
    async resetToDefaults(userId: string): Promise<Settings | undefined> {
        const systemDefaults = await this.findSystemSettings()

        if (systemDefaults) {
            return this.update(userId, {
                preferences: systemDefaults.preferences || DEFAULT_USER_PREFERENCES,
                notification_settings: systemDefaults.notification_settings || {},
                theme_settings: systemDefaults.theme_settings || DEFAULT_THEME_SETTINGS,
                language_settings: systemDefaults.language_settings || DEFAULT_LANGUAGE_SETTINGS,
                display_settings: systemDefaults.display_settings || DEFAULT_DISPLAY_SETTINGS,
                security_settings: systemDefaults.security_settings || DEFAULT_SECURITY_SETTINGS,
                sync_settings: systemDefaults.sync_settings || DEFAULT_SYNC_SETTINGS,
                privacy_settings: systemDefaults.privacy_settings || DEFAULT_PRIVACY_SETTINGS,
                updated_by: userId,
            } as Partial<Settings>)
        }

        // If no system defaults, create fresh settings
        return this.create({
            user_id: userId,
            preferences: DEFAULT_USER_PREFERENCES,
            notification_settings: {},
            theme_settings: DEFAULT_THEME_SETTINGS,
            language_settings: DEFAULT_LANGUAGE_SETTINGS,
            display_settings: DEFAULT_DISPLAY_SETTINGS,
            security_settings: DEFAULT_SECURITY_SETTINGS,
            sync_settings: DEFAULT_SYNC_SETTINGS,
            privacy_settings: DEFAULT_PRIVACY_SETTINGS,
            is_system_default: false,
            created_by: userId,
            updated_by: userId,
        } as Partial<Settings>)
    }

    /**
     * Get all organisation settings
     */
    async getOrganisationSettings(organisationId: string): Promise<Settings[]> {
        return this.findMany({ organisation_id: organisationId } as Partial<Settings>)
    }

    /**
     * Get settings by multiple filters
     */
    async findManyByFilters(filters: {
        user_id?: string
        organisation_id?: string
        category?: string
        is_system_default?: boolean
    }): Promise<Settings[]> {
        let results = await this.findAll()

        if (filters.user_id) {
            results = results.filter((s) => s.user_id === filters.user_id)
        }
        if (filters.organisation_id) {
            results = results.filter((s) => s.organisation_id === filters.organisation_id)
        }
        if (filters.category) {
            results = results.filter((s) => s.category === filters.category)
        }
        if (filters.is_system_default !== undefined) {
            results = results.filter((s) => s.is_system_default === filters.is_system_default)
        }

        return results
    }
}
