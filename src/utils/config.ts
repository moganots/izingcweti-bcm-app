/**
 * Application configuration helper
 * Provides typed access to environment variables with defaults
 */
export const AppConfig = {
  // Application
  appName: import.meta.env.VITE_APP_NAME || 'Izingcweti (BCM)',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.1',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Izingcweti (BCM)lication',

  // Environment
  envName: import.meta.env.VITE_ENV_NAME || 'Local',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  port: import.meta.env.VITE_PORT,
  capacitorPort: import.meta.env.VITE_CAPACITOR_PORT,

  // API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9810/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  },

  // Auth
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'bcm_auth_token',
    refreshKey: import.meta.env.VITE_AUTH_REFRESH_KEY || 'bcm_refresh_token',
    userKey: import.meta.env.VITE_AUTH_USER_KEY || 'bcm_user',
    rememberMeKey: import.meta.env.VITE_AUTH_REMEMBER_ME_KEY || 'bcm_remembered_email',
  },

  // Sync
  sync: {
    intervalMinutes: parseInt(import.meta.env.VITE_SYNC_INTERVAL_MINUTES || '5'),
    maxRetries: parseInt(import.meta.env.VITE_SYNC_MAX_RETRIES || '5'),
    batchSize: parseInt(import.meta.env.VITE_SYNC_BATCH_SIZE || '50'),
    enabled: import.meta.env.VITE_SYNC_ENABLED !== 'false',
  },

  // Cache
  cache: {
    enabled: import.meta.env.VITE_CACHE_ENABLED !== 'false',
    ttlSeconds: parseInt(import.meta.env.VITE_CACHE_TTL_SECONDS || '3600'),
    maxSizeMB: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE_MB || '50'),
  },

  // Logging
  log: {
    level: import.meta.env.VITE_LOG_LEVEL || 'debug',
    enableConsole: import.meta.env.VITE_LOG_ENABLE_CONSOLE !== 'false',
    enableRemote: import.meta.env.VITE_LOG_ENABLE_REMOTE === 'true',
  },

  // Feature Flags
  features: {
    offlineMode: import.meta.env.VITE_FEATURE_OFFLINE_MODE !== 'false',
    biometric: import.meta.env.VITE_FEATURE_BIOMETRIC === 'true',
    pushNotifications: import.meta.env.VITE_FEATURE_PUSH_NOTIFICATIONS !== 'false',
    darkMode: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
    multiTenant: import.meta.env.VITE_FEATURE_MULTI_TENANT !== 'false',
  },

  // Sentry
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.VITE_ENV_NAME || 'development',
  },

  // Analytics
  analytics: {
    id: import.meta.env.VITE_ANALYTICS_ID || '',
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  },

  // Helpers
  get isProduction(): boolean {
    return this.nodeEnv === 'production'
  },

  get isStaging(): boolean {
    return this.nodeEnv === 'staging'
  },

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development' || this.nodeEnv === undefined
  },

  get isUat(): boolean {
    return this.envName === 'UAT'
  },

  get isSit(): boolean {
    return this.envName === 'SIT'
  },

  get isDr(): boolean {
    return this.envName === 'DR'
  },

  get isLocal(): boolean {
    return this.envName === 'Local'
  },

  get showDebugFeatures(): boolean {
    return !this.isProduction || this.envName === 'Development' || this.envName === 'Local'
  },
} as const

export default AppConfig
