import { BaseService } from '../../BaseService'
import {
    NotificationSettings,
    ThemeSettings,
    LanguageSettings,
    SecuritySettings,
    Settings,
    SyncSettings,
} from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import type {
    SettingsQueryParams,
    UpdateSettingsRequest,
    BulkUpdateSettingsRequest,
    SettingsImportResult,
    SettingsValidationResult,
    DefaultSettingsTemplate,
    SettingsExportOptions,
    PaginatedResponse,
} from './../../../types'

// ============================================
// Settings Service
// ============================================

export class SettingsService extends BaseService {
    // ============================================
    // Settings CRUD
    // ============================================

    /**
     * Get settings with pagination and filters
     */
    async getSettings(params?: SettingsQueryParams): Promise<PaginatedResponse<Settings>> {
        return this.getPaginated<Settings>(API_ENDPOINTS.SETTINGS.BASE, params as Record<string, any>)
    }

    /**
     * Get settings by ID
     */
    async getSettingsById(id: string): Promise<Settings> {
        const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.BY_ID(id))
        return this.extractData(response)
    }

    /**
     * Get user settings
     */
    async getUserSettings(userId: string): Promise<Settings> {
        const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.USER(userId))
        return this.extractData(response)
    }

    /**
     * Get organisation settings
     */
    async getOrganisationSettings(organisationId: string): Promise<Settings[]> {
        const response = await this.get<Settings[]>(API_ENDPOINTS.SETTINGS.ORGANISATION(organisationId))
        return this.extractData(response)
    }

    /**
     * Get system default settings
     */
    async getSystemDefaultSettings(): Promise<Settings> {
        const response = await this.get<Settings>(API_ENDPOINTS.SETTINGS.SYSTEM_DEFAULTS)
        return this.extractData(response)
    }

    /**
     * Create new settings
     */
    async createSettings(data: Partial<Settings>): Promise<Settings> {
        const response = await this.post<Settings>(API_ENDPOINTS.SETTINGS.BASE, data)
        return this.extractData(response)
    }

    /**
     * Update settings
     */
    async updateSettings(id: string, data: UpdateSettingsRequest): Promise<Settings> {
        const response = await this.put<Settings>(API_ENDPOINTS.SETTINGS.BY_ID(id), data)
        return this.extractData(response)
    }

    /**
     * Update user settings
     */
    async updateUserSettings(userId: string, data: UpdateSettingsRequest): Promise<Settings> {
        const response = await this.put<Settings>(API_ENDPOINTS.SETTINGS.USER(userId), data)
        return this.extractData(response)
    }

    /**
     * Update organisation settings
     */
    async updateOrganisationSettings(
        organisationId: string,
        data: UpdateSettingsRequest
    ): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.ORGANISATION(organisationId),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete settings
     */
    async deleteSettings(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.SETTINGS.BY_ID(id))
    }

    /**
     * Reset user settings to defaults
     */
    async resetUserSettings(userId: string): Promise<Settings> {
        const response = await this.post<Settings>(API_ENDPOINTS.SETTINGS.RESET_USER(userId))
        return this.extractData(response)
    }

    /**
     * Reset organisation settings to defaults
     */
    async resetOrganisationSettings(organisationId: string): Promise<Settings[]> {
        const response = await this.post<Settings[]>(
            API_ENDPOINTS.SETTINGS.RESET_ORGANISATION(organisationId)
        )
        return this.extractData(response)
    }

    // ============================================
    // Preference Operations
    // ============================================

    /**
     * Get a specific user preference
     */
    async getUserPreference<T = any>(userId: string, key: string): Promise<T | null> {
        const response = await this.get<T | null>(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key))
        return this.extractData(response)
    }

    /**
     * Set a specific user preference
     */
    async setUserPreference<T = any>(userId: string, key: string, value: T): Promise<Settings> {
        const response = await this.put<T>(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key), { value })
        return this.extractData(response as any)
    }

    /**
     * Delete a specific user preference
     */
    async deleteUserPreference(userId: string, key: string): Promise<void> {
        await this.delete(API_ENDPOINTS.SETTINGS.PREFERENCE(userId, key))
    }

    /**
     * Bulk get user preferences
     */
    async getUserPreferences(userId: string, keys: string[]): Promise<Record<string, any>> {
        const response = await this.post<Record<string, any>>(
            API_ENDPOINTS.SETTINGS.PREFERENCES_BULK(userId),
            { keys }
        )
        return this.extractData(response)
    }

    // ============================================
    // Notification Settings Operations
    // ============================================

    /**
     * Update notification settings
     */
    async updateNotificationSettings(
        userId: string,
        notificationType: string,
        settings: { email?: boolean; push?: boolean; sms?: boolean; in_app?: boolean }
    ): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.NOTIFICATION_SETTINGS(userId, notificationType),
            settings
        )
        return this.extractData(response)
    }

    /**
     * Bulk update notification settings
     */
    async bulkUpdateNotificationSettings(
        userId: string,
        settings: NotificationSettings
    ): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.NOTIFICATION_SETTINGS_BULK(userId),
            settings
        )
        return this.extractData(response)
    }

    // ============================================
    // Theme Operations
    // ============================================

    /**
     * Update theme settings
     */
    async updateThemeSettings(userId: string, settings: Partial<ThemeSettings>): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.THEME_SETTINGS(userId),
            settings
        )
        return this.extractData(response)
    }

    /**
     * Get available themes
     */
    async getAvailableThemes(): Promise<Array<{ id: string; name: string; preview_url?: string }>> {
        const response = await this.get<Array<{ id: string; name: string; preview_url?: string }>>(
            API_ENDPOINTS.SETTINGS.AVAILABLE_THEMES
        )
        return this.extractData(response)
    }

    // ============================================
    // Language Operations
    // ============================================

    /**
     * Update language settings
     */
    async updateLanguageSettings(
        userId: string,
        settings: Partial<LanguageSettings>
    ): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.LANGUAGE_SETTINGS(userId),
            settings
        )
        return this.extractData(response)
    }

    /**
     * Get available locales
     */
    async getAvailableLocales(): Promise<Array<{ code: string; name: string; native_name: string }>> {
        const response = await this.get<Array<{ code: string; name: string; native_name: string }>>(
            API_ENDPOINTS.SETTINGS.AVAILABLE_LOCALES
        )
        return this.extractData(response)
    }

    // ============================================
    // Security Operations
    // ============================================

    /**
     * Update security settings
     */
    async updateSecuritySettings(
        userId: string,
        settings: Partial<SecuritySettings>
    ): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.SECURITY_SETTINGS(userId),
            settings
        )
        return this.extractData(response)
    }

    /**
     * Enable/disable two-factor authentication
     */
    async toggleTwoFactor(
        userId: string,
        enabled: boolean,
        method?: string
    ): Promise<{ enabled: boolean; secret?: string }> {
        const response = await this.post<{ enabled: boolean; secret?: string }>(
            API_ENDPOINTS.SETTINGS.TWO_FACTOR(userId),
            { enabled, method }
        )
        return this.extractData(response)
    }

    /**
     * Verify two-factor code
     */
    async verifyTwoFactor(userId: string, code: string): Promise<{ verified: boolean }> {
        const response = await this.post<{ verified: boolean }>(
            API_ENDPOINTS.SETTINGS.VERIFY_TWO_FACTOR(userId),
            { code }
        )
        return this.extractData(response)
    }

    // ============================================
    // Sync Operations
    // ============================================

    /**
     * Update sync settings
     */
    async updateSyncSettings(userId: string, settings: Partial<SyncSettings>): Promise<Settings> {
        const response = await this.put<Settings>(
            API_ENDPOINTS.SETTINGS.SYNC_SETTINGS(userId),
            settings
        )
        return this.extractData(response)
    }

    /**
     * Trigger manual sync
     */
    async triggerSync(userId: string): Promise<{ synced: boolean; changes: number }> {
        const response = await this.post<{ synced: boolean; changes: number }>(
            API_ENDPOINTS.SETTINGS.TRIGGER_SYNC(userId)
        )
        return this.extractData(response)
    }

    // ============================================
    // Bulk Operations
    // ============================================

    /**
     * Bulk update settings for multiple users
     */
    async bulkUpdateSettings(data: BulkUpdateSettingsRequest): Promise<SettingsImportResult> {
        const response = await this.post<SettingsImportResult>(API_ENDPOINTS.SETTINGS.BULK_UPDATE, data)
        return this.extractData(response)
    }

    /**
     * Apply settings template to users
     */
    async applySettingsTemplate(
        templateId: string,
        userIds: string[]
    ): Promise<SettingsImportResult> {
        const response = await this.post<SettingsImportResult>(
            API_ENDPOINTS.SETTINGS.APPLY_TEMPLATE(templateId),
            { userIds }
        )
        return this.extractData(response)
    }

    // ============================================
    // Validation & Templates
    // ============================================

    /**
     * Validate settings
     */
    async validateSettings(settings: UpdateSettingsRequest): Promise<SettingsValidationResult> {
        const response = await this.post<SettingsValidationResult>(
            API_ENDPOINTS.SETTINGS.VALIDATE,
            settings
        )
        return this.extractData(response)
    }

    /**
     * Get settings templates
     */
    async getSettingsTemplates(): Promise<DefaultSettingsTemplate[]> {
        const response = await this.get<DefaultSettingsTemplate[]>(API_ENDPOINTS.SETTINGS.TEMPLATES)
        return this.extractData(response)
    }

    /**
     * Create settings template
     */
    async createSettingsTemplate(data: DefaultSettingsTemplate): Promise<DefaultSettingsTemplate> {
        const response = await this.post<DefaultSettingsTemplate>(
            API_ENDPOINTS.SETTINGS.TEMPLATES,
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete settings template
     */
    async deleteSettingsTemplate(templateId: string): Promise<void> {
        await this.delete(API_ENDPOINTS.SETTINGS.TEMPLATE_BY_ID(templateId))
    }

    // ============================================
    // Export/Import Operations
    // ============================================

    /**
     * Export settings
     */
    async exportSettings(options: SettingsExportOptions): Promise<void> {
        const format = options.format || 'json'
        await this.download(
            API_ENDPOINTS.SETTINGS.EXPORT,
            `settings_export_${new Date().toISOString().split('T')[0]}.${format}`,
            { params: options as Record<string, any> }
        )
    }

    /**
     * Import settings
     */
    async importSettings(
        file: File,
        options?: { overwrite?: boolean }
    ): Promise<SettingsImportResult> {
        const formData = new FormData()
        formData.append('file', file)
        if (options?.overwrite) formData.append('overwrite', 'true')

        const response = await this.upload<SettingsImportResult>(
            API_ENDPOINTS.SETTINGS.IMPORT,
            formData
        )
        return this.extractData(response)
    }
}

// Export singleton
export const settingsService = new SettingsService()
