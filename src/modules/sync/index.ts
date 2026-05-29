// ============================================
// Sync Module - Enums
// ============================================

export enum PendingChangeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SyncPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

export enum ConflictType {
  UPDATE_UPDATE = 'UPDATE_UPDATE',
  DELETE_UPDATE = 'DELETE_UPDATE',
  UPDATE_DELETE = 'UPDATE_DELETE',
  CREATE_CREATE = 'CREATE_CREATE',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
  VERSION_SKEW = 'VERSION_SKEW',
  SCHEMA_CONFLICT = 'SCHEMA_CONFLICT',
  DEPENDENCY_CONFLICT = 'DEPENDENCY_CONFLICT',
  PERMISSION_CONFLICT = 'PERMISSION_CONFLICT',
  VALIDATION_CONFLICT = 'VALIDATION_CONFLICT',
  REFERENCE_CONFLICT = 'REFERENCE_CONFLICT',
  DATA_TYPE_CONFLICT = 'DATA_TYPE_CONFLICT',
  REQUIRED_FIELD_CONFLICT = 'REQUIRED_FIELD_CONFLICT',
  BUSINESS_RULE_CONFLICT = 'BUSINESS_RULE_CONFLICT',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  NETWORK_CONFLICT = 'NETWORK_CONFLICT',
  CUSTOM = 'CUSTOM',
}

export enum ResolutionStrategy {
  CLIENT_WINS = 'CLIENT_WINS',
  SERVER_WINS = 'SERVER_WINS',
  LATEST_WINS = 'LATEST_WINS',
  HIGHER_VERSION_WINS = 'HIGHER_VERSION_WINS',
  MERGE = 'MERGE',
  MANUAL = 'MANUAL',
  AUTO_RESOLVED = 'AUTO_RESOLVED',
  CUSTOM = 'CUSTOM',
  SKIP = 'SKIP',
  NEW_VERSION = 'NEW_VERSION',
}

// ============================================
// Sync Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

export interface PendingChange extends BaseEntity {
  entity_type: string
  entity_id: string
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE'
  data: Record<string, any>
  priority: SyncPriority
  attempts: number
  status: PendingChangeStatus
  error_message?: string
  last_attempt_at?: string
  sync_token?: string
}

export interface SyncConflict extends BaseEntity {
  entity_id: string
  entity_type: string
  source_data: Record<string, any>
  client_version: Record<string, any>
  server_version: Record<string, any>
  conflict_type: ConflictType
  detected_at: string
  resolved: boolean
  auto_resolvable: boolean
  auto_resolved: boolean
  resolution_strategy?: ResolutionStrategy
  resolution_data?: Record<string, any>
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
}

export interface SyncMetadata extends BaseEntity {
  key: string
  value: string
}

export interface SyncConfig {
  enabled: boolean
  interval_minutes: number
  max_retries: number
  batch_size: number
  conflict_strategy: ResolutionStrategy
  priority_enabled: boolean
  compression_enabled: boolean
}

export interface Tombstone {
  entity_type: string
  entity_id: string
  deleted_at: string
  deleted_by: string
}

export interface SyncProgress {
  total_pending: number
  syncing: boolean
  last_sync_at?: string
  last_sync_status: 'SUCCESS' | 'FAILED' | 'PARTIAL'
  current_batch: number
  total_batches: number
}

export interface ConflictResolutionPreview {
  conflict_id: string
  entity_type: string
  entity_id: string
  local_version: Record<string, any>
  remote_version: Record<string, any>
  suggested_resolution: Record<string, any>
  resolution_strategy: ResolutionStrategy
}

// Request Types
export interface PushChangesRequest {
  changes: PendingChange[]
  last_sync_token?: string
  device_id?: string
}

export interface PushChangesResponse {
  success: boolean
  synced_count: number
  failed_count: number
  conflicts: SyncConflict[]
  new_sync_token: string
  server_timestamp: string
}

export interface PullChangesRequest {
  since_token?: string
  entity_types?: string[]
  limit?: number
  last_sync_time?: string
}

export interface PullChangesResponse {
  changes: Record<string, any[]>
  sync_token: string
  server_timestamp: string
  tombstones: Tombstone[]
  has_more: boolean
  next_token?: string
}

export interface ResolveConflictRequest {
  resolution: Record<string, any>
  strategy: ResolutionStrategy
  notes?: string
}

export interface CreatePendingChangeRequest {
  entity_type: string
  entity_id: string
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE'
  data: Record<string, any>
  priority?: SyncPriority
}
