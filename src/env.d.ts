/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Application
  readonly VITE_COMPANY_APP_NAME: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string

  // Environment
  readonly VITE_ENV_NAME: 'Local' | 'Development' | 'Staging' | 'SIT' | 'UAT' | 'Production' | 'DR'
  readonly VITE_NODE_ENV: 'development' | 'staging' | 'sit' | 'uat' | 'production' | 'dr'
  readonly VITE_PORT: number
  readonly VITE_CAPACITOR_PORT: number

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRY_ATTEMPTS: string
  readonly VITE_API_RETRY_DELAY: string

  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_AUTH_REFRESH_KEY: string
  readonly VITE_AUTH_USER_KEY: string
  readonly VITE_AUTH_REMEMBER_ME_KEY: string

  // Sync
  readonly VITE_SYNC_INTERVAL_MINUTES: string
  readonly VITE_SYNC_MAX_RETRIES: string
  readonly VITE_SYNC_BATCH_SIZE: string
  readonly VITE_SYNC_ENABLED: string

  // Cache
  readonly VITE_CACHE_ENABLED: string
  readonly VITE_CACHE_TTL_SECONDS: string
  readonly VITE_CACHE_MAX_SIZE_MB: string

  // Logging
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  readonly VITE_LOG_ENABLE_CONSOLE: string
  readonly VITE_LOG_ENABLE_REMOTE: string

  // Feature Flags
  readonly VITE_FEATURE_OFFLINE_MODE: string
  readonly VITE_FEATURE_BIOMETRIC: string
  readonly VITE_FEATURE_PUSH_NOTIFICATIONS: string
  readonly VITE_FEATURE_DARK_MODE: string
  readonly VITE_FEATURE_MULTI_TENANT: string

  // Sentry
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENVIRONMENT?: string

  // Analytics
  readonly VITE_ANALYTICS_ID?: string
  readonly VITE_ANALYTICS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
