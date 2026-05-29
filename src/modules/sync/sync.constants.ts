// ============================================
// Sync Module - Constants
// ============================================

export const STORAGE_QUOTAS = {
  DEFAULT_QUOTA_MB: 500,
  WARNING_THRESHOLD_PERCENT: 80,
  CRITICAL_THRESHOLD_PERCENT: 95,
  EVICTION_ORDER: ['oldest_sync_logs', 'oldest_tombstones', 'oldest_completed_tasks'] as const,
} as const

export const SYNC_CONFIG = {
  MAX_BATCH_SIZE: 1000,
  MAX_RETRY_ATTEMPTS: 3,
  MAX_OFFLINE_DAYS: 30,
  SYNC_INTERVAL_MINUTES: 15,
  PENDING_CHANGES_MAX_QUEUE: 10000,
  BULK_INITIAL_SYNC_CHUNK_SIZE: 5000,
} as const

export const RETRY_BACKOFF_DELAYS_SECONDS = [0, 1, 2, 4, 8, 16, 30, 60]

export const CIRCUIT_BREAKER = {
  FAILURE_THRESHOLD: 10,
  OPEN_TIMEOUT_MINUTES: 5,
  HALF_OPEN_SUCCESS_THRESHOLD: 3,
} as const

export const TOMBSTONE_CONFIG = {
  RETENTION_DAYS: 90,
  HARD_DELETE_AFTER_DAYS: 90,
} as const

export const PERFORMANCE_BENCHMARKS = {
  RESPONSE_TARGET_MS: 3000,
  LOCAL_QUERY_TARGET_MS: 200,
  MEMORY_LIMIT_MB: 150,
  BATTERY_IMPACT_PERCENT_24H: 5,
  SYNC_LATENCY_TARGET_SECONDS: 10,
  INITIAL_SYNC_10K_RECORDS_SECONDS: 30,
  PUSH_1K_CHANGES_SECONDS: 10,
} as const

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  MEDIA_ATTACHMENT_DEFERRED_TO_ONLINE: true,
} as const

export const SYNC_PRIORITIES = {
  HIGHEST: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
} as const

export const OPERATION_PRIORITY_MAP = {
  APPROVAL: SYNC_PRIORITIES.HIGHEST,
  POLICY_ATTESTATION: SYNC_PRIORITIES.HIGHEST,
  RISK_UPDATE: SYNC_PRIORITIES.HIGH,
  BIA_UPDATE: SYNC_PRIORITIES.HIGH,
  TEST_RESULT: SYNC_PRIORITIES.HIGH,
  TRAINING_COMPLETION: SYNC_PRIORITIES.MEDIUM,
  COMMENT: SYNC_PRIORITIES.MEDIUM,
  AUDIT_LOG: SYNC_PRIORITIES.LOW,
  ANALYTICS: SYNC_PRIORITIES.LOW,
  MEDIA_ATTACHMENT: SYNC_PRIORITIES.LOW,
} as const

export const DATA_RETENTION = {
  SYNCED_ENTITIES: 'until_remote_delete_or_logout',
  PENDING_CHANGES_DAYS: 30,
  SYNC_LOGS_DAYS: 90,
  TOMBSTONES_DAYS: 90,
  LOCAL_ANALYTICS_RETENTION_DAYS: 90,
} as const

export const NETWORK_CONFIG = {
  METERED_CONNECTION_PAUSE_LARGE_SYNC: true,
  SYNC_ONLY_ON_WIFI_PREFERENCE_KEY: 'sync_wifi_only',
  MIN_BANDWIDTH_KBPS_FOR_SYNC: 100,
  MAX_CONCURRENT_SYNC_REQUESTS: 3,
} as const

export const SYNC_COALESCING = {
  MIN_DELAY_BETWEEN_BATCHES_SECONDS: 2,
  MAX_BATCH_SIZE_RECORDS: 1000,
  COALESCE_MULTIPLE_MUTATIONS_TO_SAME_ENTITY: true,
} as const

export const CONFLICT_RESOLUTION = {
  DEFAULT_STRATEGY: 'LWW',
  UPDATE_UPDATE_STRATEGY: 'LWW',
  DELETE_UPDATE_STRATEGY: 'DELETE_WINS',
  UNIQUE_CONSTRAINT_STRATEGY: 'MANUAL',
  VERSION_SKEW_STRATEGY: 'BLOCK',
} as const

export const SYNC_STORAGE_KEYS = {
  LAST_SYNC_TOKEN: 'bcm_last_sync_token',
  LAST_SYNC_TIMESTAMP: 'bcm_last_sync_timestamp',
  PENDING_CHANGES_QUEUE: 'bcm_pending_changes_queue',
  SCHEMA_VERSION: 'bcm_schema_version',
  DEVICE_ID: 'bcm_device_id',
} as const

export const BACKGROUND_SYNC = {
  WEB_API: 'BackgroundSync',
  WEB_PERIODIC_API: 'PeriodicSync',
  ANDROID_WORK_MANAGER: 'WorkManager',
  IOS_BG_TASK_SCHEDULER: 'BGTaskScheduler',
} as const

export const SYNC_TRIGGERS = {
  APP_START: { priority: 'HIGH', enabled: true },
  CONNECTIVITY_RESTORATION: { priority: 'HIGH', enabled: true },
  EVERY_15_MINUTES: { priority: 'MEDIUM', enabled: true },
  MANUAL_SYNC: { priority: 'HIGHEST', enabled: true },
  REAL_TIME_SIGNAL: { priority: 'HIGH', enabled: true },
  AFTER_10_PENDING_MUTATIONS: { priority: 'MEDIUM', enabled: true },
} as const
