import type { BaseEntity } from "../../core/base/base.entity";

// ============================================
// Settings Module - Types (Aligned with Backend)
// ============================================

export interface NotificationChannelSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface DisplaySettings {
  tableDensity: "comfortable" | "compact" | "normal";
  showAvatars: boolean;
  showAnimations: boolean;
  autoRefreshInterval?: number;
  confirmDialogs: boolean;
  tooltipsEnabled: boolean;
}

export interface UserPreferences {
  dashboardLayout?: string;
  defaultView?: string;
  itemsPerPage?: number;
  dateFormat?: string;
  timeFormat?: string;
  timezone?: string;
  startOfWeek?: "monday" | "sunday" | "saturday";
  collapseSidebar?: boolean;
  enableShortcuts?: boolean;
  autoSave?: boolean;
  confirmBeforeClose?: boolean;
}

export interface NotificationSettings {
  [notificationType: string]: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: "small" | "medium" | "large";
  reducedMotion?: boolean;
  highContrast?: boolean;
}

export interface LanguageSettings {
  locale: string;
  fallbackLocale?: string;
  dateLocale?: string;
  numberLocale?: string;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  twoFactorEnabled: boolean;
  twoFactorMethod?: "authenticator" | "sms" | "email";
  loginNotifications: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps?: string[];
  deviceManagementEnabled: boolean;
  autoLogoutOnInactivity: boolean;
}

export interface SyncSettings {
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  syncOnReconnect: boolean;
  syncOnAppStart: boolean;
  syncOnlyOnWifi: boolean;
  conflictResolutionStrategy: "serverWins" | "clientWins" | "manual";
  maxRetryAttempts: number;
  retryDelaySeconds: number;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  shareUsageData: boolean;
  allowMarketingEmails: boolean;
  dataRetentionDays: number;
  exportDataEnabled: boolean;
}

// ============================================
// Settings Entity - Aligned with Backend
// ============================================

export interface Settings extends BaseEntity {
  userId?: string;
  organisationId?: string;
  category?: string;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  themeSettings: ThemeSettings;
  languageSettings: LanguageSettings;
  displaySettings: DisplaySettings;
  securitySettings: SecuritySettings;
  syncSettings: SyncSettings;
  privacySettings?: PrivacySettings;
  customSettings?: Record<string, any>;
  isSystemDefault: boolean;
}

// ============================================
// Default Settings Constants
// ============================================

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dashboardLayout: "grid",
  defaultView: "dashboard",
  itemsPerPage: 20,
  dateFormat: "yyyy-MM-dd",
  timeFormat: "HH:mm",
  timezone: "UTC",
  startOfWeek: "monday",
  collapseSidebar: false,
  enableShortcuts: true,
  autoSave: true,
  confirmBeforeClose: true,
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: "system",
  fontSize: "medium",
  reducedMotion: false,
  highContrast: false,
};

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  locale: "en",
  fallbackLocale: "en",
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  tableDensity: "normal",
  showAvatars: true,
  showAnimations: true,
  confirmDialogs: true,
  tooltipsEnabled: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionTimeoutMinutes: 30,
  twoFactorEnabled: false,
  loginNotifications: true,
  ipRestrictionEnabled: false,
  deviceManagementEnabled: true,
  autoLogoutOnInactivity: true,
};

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  autoSyncEnabled: true,
  syncIntervalMinutes: 15,
  syncOnReconnect: true,
  syncOnAppStart: true,
  syncOnlyOnWifi: true,
  conflictResolutionStrategy: "serverWins",
  maxRetryAttempts: 3,
  retryDelaySeconds: 30,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  shareAnalytics: true,
  shareUsageData: false,
  allowMarketingEmails: false,
  dataRetentionDays: 365,
  exportDataEnabled: true,
};