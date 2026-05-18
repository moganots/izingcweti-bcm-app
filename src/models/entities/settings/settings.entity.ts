export interface NotificationChannelSettings {
  email: boolean
  push: boolean
  sms: boolean
  in_app: boolean
}

export interface DisplaySettings {
  table_density: 'comfortable' | 'compact' | 'normal'
  show_avatars: boolean
  show_animations: boolean
  auto_refresh_interval?: number
  confirm_dialogs: boolean
  tooltips_enabled: boolean
}

// ============================================
// Settings Types
// ============================================

export interface UserPreferences {
  dashboard_layout?: string
  default_view?: string
  items_per_page?: number
  date_format?: string
  time_format?: string
  timezone?: string
  start_of_week?: 'monday' | 'sunday' | 'saturday'
  collapse_sidebar?: boolean
  enable_shortcuts?: boolean
  auto_save?: boolean
  confirm_before_close?: boolean
}

export interface NotificationSettings {
  [notificationType: string]: {
    email: boolean
    push: boolean
    sms: boolean
    in_app: boolean
  }
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_family?: string
  font_size?: 'small' | 'medium' | 'large'
  reduced_motion?: boolean
  high_contrast?: boolean
}

export interface LanguageSettings {
  locale: string
  fallback_locale?: string
  date_locale?: string
  number_locale?: string
}

export interface SecuritySettings {
  session_timeout_minutes: number
  two_factor_enabled: boolean
  two_factor_method?: 'authenticator' | 'sms' | 'email'
  login_notifications: boolean
  ip_restriction_enabled: boolean
  allowed_ips?: string[]
  device_management_enabled: boolean
  auto_logout_on_inactivity: boolean
}

export interface SyncSettings {
  auto_sync_enabled: boolean
  sync_interval_minutes: number
  sync_on_reconnect: boolean
  sync_on_app_start: boolean
  sync_only_on_wifi: boolean
  conflict_resolution_strategy: 'server_wins' | 'client_wins' | 'manual'
  max_retry_attempts: number
  retry_delay_seconds: number
}

export interface PrivacySettings {
  share_analytics: boolean
  share_usage_data: boolean
  allow_marketing_emails: boolean
  data_retention_days: number
  export_data_enabled: boolean
}

/**
 * Settings Entity
 */
export interface Settings {
  uuid: string
  user_id?: string | null
  organisation_id?: string | null
  category?: string | null
  preferences: UserPreferences
  notification_settings: NotificationSettings
  theme_settings: ThemeSettings
  language_settings: LanguageSettings
  display_settings: DisplaySettings
  security_settings: SecuritySettings
  sync_settings: SyncSettings
  privacy_settings?: PrivacySettings
  custom_settings?: Record<string, any>
  is_system_default: boolean
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
}

// Default settings constants
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dashboard_layout: 'grid',
  default_view: 'dashboard',
  items_per_page: 20,
  date_format: 'YYYY-MM-DD',
  time_format: 'HH:mm',
  timezone: 'UTC',
  start_of_week: 'monday',
  collapse_sidebar: false,
  enable_shortcuts: true,
  auto_save: true,
  confirm_before_close: true,
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'system',
  font_size: 'medium',
  reduced_motion: false,
  high_contrast: false,
}

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  locale: 'en',
  fallback_locale: 'en',
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  table_density: 'normal',
  show_avatars: true,
  show_animations: true,
  confirm_dialogs: true,
  tooltips_enabled: true,
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  session_timeout_minutes: 30,
  two_factor_enabled: false,
  login_notifications: true,
  ip_restriction_enabled: false,
  device_management_enabled: true,
  auto_logout_on_inactivity: true,
}

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  auto_sync_enabled: true,
  sync_interval_minutes: 15,
  sync_on_reconnect: true,
  sync_on_app_start: true,
  sync_only_on_wifi: true,
  conflict_resolution_strategy: 'server_wins',
  max_retry_attempts: 3,
  retry_delay_seconds: 30,
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  share_analytics: true,
  share_usage_data: false,
  allow_marketing_emails: false,
  data_retention_days: 365,
  export_data_enabled: true,
}
