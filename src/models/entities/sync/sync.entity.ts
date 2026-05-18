// src/models/entities/sync.entity.ts

/**
 * Sync Status Enum
 */
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
}

/**
 * Sync Priority Enum
 */
export enum SyncPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

/**
 * Operation Type Enum
 */
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Conflict Type Enum
 */
export enum ConflictType {
  UPDATE_UPDATE = 'Update-Update',
  DELETE_UPDATE = 'Delete-Update',
  UNIQUE_CONSTRAINT = 'UniqueConstraint',
  VERSION_SKEW = 'VersionSkew',
}

/**
 * Conflict Resolution Strategy
 */
export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'LWW',
  DELETE_WINS = 'DeleteWins',
  USER_MEDIATED = 'UserMediated',
  MERGE = 'Merge',
}

/**
 * Network Status Enum
 */
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  METERED = 'metered',
  SLOW = 'slow',
}

/**
 * Pending Change Entity
 */
export interface PendingChange {
  id?: string
  uuid: string
  entity_type: string
  entity_id: string
  operation_type: OperationType
  data: Record<string, any>
  priority: SyncPriority
  attempts: number
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
}

/**
 * Sync Conflict Entity
 */
export interface SyncConflict {
  id?: string
  uuid: string
  entity_id: string
  entity_type: string
  client_version: Record<string, any>
  server_version: Record<string, any>
  conflict_type: ConflictType
  detected_at: string
  resolved: boolean
  resolution_strategy?: ConflictResolutionStrategy | null
  resolved_data?: Record<string, any> | null
  resolved_at?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
}

/**
 * Sync Metadata Entity
 */
export interface SyncMetadata {
  key: string
  value: string
  uuid: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
}

/**
 * Sync State
 */
export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline'
  pendingChanges: PendingChange[]
  conflicts: SyncConflict[]
  lastSyncAt: string | null
  syncToken: string | null
  isOnline: boolean
  networkType: string
  progress: number
  error: string | null
}

/**
 * Sync Pull Response
 */
export interface SyncPullResponse {
  changes: SyncChange[]
  syncToken: string
  serverTimestamp: string
}

/**
 * Sync Change
 */
export interface SyncChange {
  entityType: string
  entityId: string
  operationType: OperationType
  data: Record<string, any>
  timestamp: string
  version: number
}

/**
 * Sync Push Request
 */
export interface SyncPushRequest {
  changes: PendingChange[]
  lastSyncToken?: string
}

/**
 * Sync Push Response
 */
export interface SyncPushResponse {
  success: boolean
  appliedChanges: number
  conflicts: SyncConflict[]
  syncToken: string
}

/**
 * Network Information
 */
export interface NetworkInfo {
  isOnline: boolean
  connectionType: string
  lastChecked: string
}
