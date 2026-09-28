import type { BaseEntity } from "../../core/base/base.entity";
import type { EntityType } from "../audit/audit.entity";

// Re-export frontend enums/types from sync.types so existing imports keep working
export {
  SyncStatus,
  SyncPriority,
  OperationType,
  PendingChangeStatus,
  PendingChangeOperation,
  ConflictType,
  ConflictSeverity,
  ConflictResolutionStrategy,
  ConflictResolutionEnvironment,
  ConflictResolutionCategory,
  ConnectionType,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_ICONS,
  CONNECTION_TYPE_COLORS,
} from "../../types/sync.types";

export type {
  SyncProgress,
  SyncResult,
  SyncStats,
  SyncState,
  SyncChange,
  SyncPullResponse,
  SyncPushRequest,
  SyncPushResponse,
  NetworkInfo,
  NetworkStatus,
  ConnectionQuality,
} from "../../types/sync.types";

// Re-export enums we need for entity types
import {
  PendingChangeStatus,
  OperationType,
  ConflictType,
  ConflictResolutionStrategy,
} from "../../types/sync.types";

// ============================================
// Pending Change Entity
// ============================================

export interface PendingChange extends BaseEntity {
  entityType: EntityType;
  entityId: string;
  operationType: OperationType;
  data: any;
  priority: number;
  attempts: number;
  status: PendingChangeStatus;
  errorMessage?: string;
}

// ============================================
// Sync Conflict Entity
// ============================================

export interface SyncConflict extends BaseEntity {
  entityId: string;
  entityType: EntityType;
  sourceData: any;
  clientVersion: any;
  serverVersion: any;
  conflictType: ConflictType;
  detectedAt: Date;
  resolved: boolean;
  autoResolvable: boolean;
  autoResolved: boolean;
  resolutionStrategy?: ConflictResolutionStrategy;
  resolutionData?: any;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// ============================================
// Sync Metadata Entity
// ============================================

export interface SyncMetadata extends BaseEntity {
  key: string;
  value?: string;
}