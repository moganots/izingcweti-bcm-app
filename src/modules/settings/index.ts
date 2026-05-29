// ============================================
// Settings Module - Enums
// ============================================

export enum SettingCategory {
  PREFERENCES = 'PREFERENCES',
  NOTIFICATIONS = 'NOTIFICATIONS',
  THEME = 'THEME',
  LANGUAGE = 'LANGUAGE',
  DISPLAY = 'DISPLAY',
  SECURITY = 'SECURITY',
  SYNC = 'SYNC',
  PRIVACY = 'PRIVACY',
  SYSTEM = 'SYSTEM',
}

export enum NotificationSettingType {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  WORKFLOW_UPDATES = 'WORKFLOW_UPDATES',
  INCIDENT_ALERTS = 'INCIDENT_ALERTS',
  RISK_ALERTS = 'RISK_ALERTS',
  COMPLIANCE_REMINDERS = 'COMPLIANCE_REMINDERS',
  TRAINING_NOTIFICATIONS = 'TRAINING_NOTIFICATIONS',
  SYSTEM_NOTIFICATIONS = 'SYSTEM_NOTIFICATIONS',
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum SyncMode {
  AUTO = 'auto',
  MANUAL = 'manual',
  WIFI_ONLY = 'wifi_only',
}

import { QueryParams } from 'src/shared/types/common.types'
// ============================================
// Settings Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

export interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  in_app_enabled: boolean
  workflow_updates: boolean
  incident_alerts: boolean
  risk_alerts: boolean
  compliance_reminders: boolean
  training_notifications: boolean
  system_notifications: boolean
  daily_digest: boolean
  weekly_report: boolean
}

export interface ThemeSettings {
  mode: ThemeMode
  primary_color?: string
  accent_color?: string
  font_size: 'small' | 'medium' | 'large'
  high_contrast: boolean
  reduce_animations: boolean
}

export interface LanguageSettings {
  locale: string
  date_format: string
  time_format: '12h' | '24h'
  timezone: string
  first_day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface DisplaySettings {
  compact_view: boolean
  show_avatars: boolean
  default_dashboard: string
  items_per_page: number
  show_offline_indicator: boolean
  auto_refresh_interval: number
}

export interface SecuritySettings {
  biometric_enabled: boolean
  auto_lock_minutes: number
  encrypt_local_data: boolean
  show_sensitive_info: boolean
  require_password_for_export: boolean
  session_timeout_minutes: number
}

export interface SyncSettings {
  mode: SyncMode
  auto_sync_interval_minutes: number
  sync_on_app_start: boolean
  sync_on_network_restore: boolean
  sync_only_on_charging: boolean
  max_sync_size_mb: number
  compress_before_sync: boolean
  retry_on_failure: boolean
  max_retry_attempts: number
}

export interface PrivacySettings {
  share_analytics: boolean
  share_crash_reports: boolean
  allow_remote_wipe: boolean
  store_activity_history: boolean
  activity_history_days: number
}

export interface UserPreferences {
  notifications: NotificationSettings
  theme: ThemeSettings
  language: LanguageSettings
  display: DisplaySettings
  security: SecuritySettings
  sync: SyncSettings
  privacy: PrivacySettings
  custom?: Record<string, any>
}

export interface Settings extends BaseEntity {
  user_id: string
  organisation_id?: string
  category: SettingCategory
  preferences: UserPreferences
  is_system_default: boolean
  version: number
  last_modified_by: string
  last_modified_at: string
}

// Request Types
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

export interface SettingsQueryParams extends QueryParams {
  user_id?: string
  organisation_id?: string
  category?: SettingCategory
  is_system_default?: boolean
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
