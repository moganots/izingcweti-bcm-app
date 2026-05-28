import { BaseEntity } from '../../../core/base/base.entity'
import {
  SyncStatus,
  PendingChangeStatus,
  ConflictType,
  ResolutionStrategy,
  SyncPriority,
} from '../enums/sync.enum'
import { OperationType } from '../../../shared/enums/system.enum'

export interface PendingChange extends BaseEntity {
  entity_type: string
  entity_id: string
  operation_type: OperationType
  data: Record<string, any>
  priority: SyncPriority
  attempts: number
  status: PendingChangeStatus
  error_message?: string
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
  intervalMinutes: number
  maxRetries: number
  batchSize: number
  conflictStrategy: ResolutionStrategy
  priorityEnabled: boolean
  compressionEnabled: boolean
}

export interface PushChangesRequest {
  changes: PendingChange[]
  lastSyncToken?: string
}

export interface PullChangesRequest {
  since?: string
  entityTypes?: string[]
  limit?: number
}

export interface PullChangesResponse {
  changes: Record<string, any[]>
  syncToken: string
  serverTimestamp: string
  tombstones: Tombstone[]
}

export interface Tombstone {
  entity_type: string
  entity_id: string
  deleted_at: string
  deleted_by: string
}

export interface ResolveConflictRequest {
  resolution: Record<string, any>
  strategy: ResolutionStrategy
  notes?: string
}
