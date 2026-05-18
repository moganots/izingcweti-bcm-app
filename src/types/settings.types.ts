import {
    NotificationSettings,
    ThemeSettings,
    LanguageSettings,
    DisplaySettings,
    SecuritySettings,
    SyncSettings,
    PrivacySettings,
    UserPreferences,
} from 'src/models/entities/settings/settings.entity'

export interface UpdateSettingsRequest {
    preferences?: Partial<UserPreferences>
    notification_settings?: Partial<NotificationSettings>
    theme_settings?: Partial<ThemeSettings>
    language_settings?: Partial<LanguageSettings>
    display_settings?: Partial<DisplaySettings>
    security_settings?: Partial<SecuritySettings>
    sync_settings?: Partial<SyncSettings>
    privacy_settings?: Partial<PrivacySettings>
    custom_settings?: Record<string, any>
}

export interface SettingsQueryParams {
    user_id?: string
    organisation_id?: string
    category?: string
    is_system_default?: boolean
    page?: number
    limit?: number
}

export interface BulkUpdateSettingsRequest {
    settings: Array<{
        user_id: string
        settings: UpdateSettingsRequest
    }>
}

export interface SettingsExportOptions {
    user_id?: string
    organisation_id?: string
    format?: 'json' | 'csv'
    include_system_defaults?: boolean
}

export interface SettingsImportResult {
    imported: number
    updated: number
    failed: number
    errors: string[]
}

export interface SettingsValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

export interface DefaultSettingsTemplate {
    name: string
    description: string
    settings: UpdateSettingsRequest
    applies_to: 'system' | 'organisation' | 'user'
}
