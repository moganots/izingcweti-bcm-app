// ============================================
// Sync Module - Constants
// ============================================

export const SYNC_CONFIG = {
  MAX_BATCH_SIZE: 1000,
  MAX_RETRY_ATTEMPTS: 3,
  MAX_OFFLINE_DAYS: 30,
  SYNC_INTERVAL_MINUTES: 15,
  PENDING_CHANGES_MAX_QUEUE: 10000,
} as const;

export const RETRY_BACKOFF_DELAYS_SECONDS = [0, 1, 2, 4, 8, 16, 30, 60];

export const SYNC_STORAGE_KEYS = {
  LAST_SYNC_TOKEN: 'bcm_last_sync_token',
  LAST_SYNC_TIMESTAMP: 'bcm_last_sync_timestamp',
  PENDING_CHANGES_QUEUE: 'bcm_pending_changes_queue',
} as const;