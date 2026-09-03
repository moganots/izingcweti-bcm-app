// ============================================
// Sync Module - Enums (Aligned with Backend)
// ============================================

import { BaseEntity } from "src/core/base/base.entity";

export enum ConflictResolutionEnvironment {
  LOCAL = "Local",
  REMOTE = "Remote",
}

export enum ConflictResolutionStrategy {
  CLIENT_WINS = "ClientWins",
  SERVER_WINS = "ServerWins",
  LATEST_WINS = "LatestWins",
  HIGHER_VERSION_WINS = "HigherVersionWins",
  MERGE = "Merge",
  MANUAL = "Manual",
  AUTO_RESOLVED = "AutoResolved",
  CUSTOM = "Custom",
  SKIP = "Skip",
  NEW_VERSION = "NewVersion",
  LAST_WRITE_WINS = "LastWriteWins",
  DELETE_WINS = "DeleteWins",
  USER_MEDIATED = "UserMediated",
}

export enum ConflictType {
  UPDATE_UPDATE = "UPDATE_UPDATE",
  DELETE_UPDATE = "DELETE_UPDATE",
  UPDATE_DELETE = "UPDATE_DELETE",
  CREATE_CREATE = "CREATE_CREATE",
  UNIQUE_CONSTRAINT = "UNIQUE_CONSTRAINT",
  VERSION_SKEW = "VERSION_SKEW",
  SCHEMA_CONFLICT = "SCHEMA_CONFLICT",
  DEPENDENCY_CONFLICT = "DEPENDENCY_CONFLICT",
  PERMISSION_CONFLICT = "PERMISSION_CONFLICT",
  VALIDATION_CONFLICT = "VALIDATION_CONFLICT",
  REFERENCE_CONFLICT = "REFERENCE_CONFLICT",
  DATA_TYPE_CONFLICT = "DATA_TYPE_CONFLICT",
  REQUIRED_FIELD_CONFLICT = "REQUIRED_FIELD_CONFLICT",
  BUSINESS_RULE_CONFLICT = "BUSINESS_RULE_CONFLICT",
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",
  NETWORK_CONFLICT = "NETWORK_CONFLICT",
  CUSTOM = "CUSTOM",
  VERSION_MISMATCH = "VERSION_MISMATCH",
  DATA_CORRUPTION = "DATA_CORRUPTION",
}

export enum ConflictSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ConflictResolutionCategory {
  AUTO_RESOLVABLE = "AUTO_RESOLVABLE",
  MANUAL_REQUIRED = "MANUAL_REQUIRED",
  ADMIN_REQUIRED = "ADMIN_REQUIRED",
  BLOCKING = "BLOCKING",
}

export enum SyncPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

export enum SyncStatus {
  IDLE = "Idle",
  OFFLINE = "Offline",
  PENDING = "Pending",
  SYNCING = "Syncing",
  SYNCED = "Synced",
  CONFLICT = "Conflict",
  ERROR = "Error",
}

export enum FeatureFlag {
  SYNC_AUTO_SYNC_ENABLED = "sync.autoSyncEnabled",
  SYNC_CONFLICT_STRATEGY_DEFAULT = "sync.conflictStrategy.default",
  SYNC_BATCH_SIZE = "sync.batchSize",
  OFFLINE_MAX_DAYS = "offline.maxDays",
  STORAGE_QUOTA_MB = "storage.quotaMB",
}

export enum PendingChangeStatus {
  PENDING = "Pending",
  PROCESSING = "Processing",
  COMPLETED = "Completed",
  FAILED = "Failed",
}

export enum PendingChangeOperation {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete",
}

export enum OperationType {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete",
}

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  METERED = 'metered',
  SLOW = 'slow',
}

// ============================================
// Pending Change - Aligned with Backend PendingChange entity (camelCase)
// ============================================

export interface PendingChange extends BaseEntity {
  entityType: string;
  entityId: string;
  operationType: OperationType;
  data: Record<string, any>;
  priority: SyncPriority;
  attempts: number;
  status: string; // PendingChangeStatus from backend
  errorMessage?: string;
}

// ============================================
// Sync Conflict - Aligned with Backend SyncConflict entity (camelCase)
// ============================================

export interface SyncConflict extends BaseEntity {
  entityId: string;
  entityType: string;
  sourceData: Record<string, any>;
  clientVersion: Record<string, any>;
  serverVersion: Record<string, any>;
  conflictType: ConflictType;
  detectedAt: string | Date;
  resolved: boolean;
  autoResolvable: boolean;
  autoResolved: boolean;
  resolutionStrategy?: ConflictResolutionStrategy;
  resolutionData?: Record<string, any>;
  resolvedAt?: string | Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// ============================================
// Sync Metadata - Aligned with Backend SyncMetadata entity (camelCase)
// ============================================

export interface SyncMetadata extends BaseEntity {
  key: string;
  value: string;
}

// ============================================
// DTOs - Aligned with Backend DTOs
// ============================================

export interface SyncProgress {
  lastSyncToken: string | null;
  lastSyncTime: Date | null;
  totalProcessed: number;
  pendingItems: number;
  failedItems: number;
}

export interface SyncPullResponse {
  changes: SyncChange[];
  syncToken: string;
  serverTimestamp: string;
}

export interface SyncChange {
  entityType: string;
  entityId: string;
  operationType: OperationType;
  data: Record<string, any>;
  timestamp: string;
  version: number;
}

export interface SyncPushRequest {
  changes: PendingChange[];
  lastSyncToken?: string;
}

export interface SyncPushResponse {
  success: boolean;
  appliedChanges: number;
  conflicts: SyncConflict[];
  syncToken: string;
}

export interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  lastChecked: string;
}

// ============================================
// Helper Functions
// ============================================

export function getSyncPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: 'Highest',
    2: 'High',
    3: 'Medium',
    4: 'Low',
  };
  return labels[priority] || 'Unknown';
}

export function getConflictTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'Update-Update': 'Update-Update',
    'Delete-Update': 'Delete-Update',
    UniqueConstraint: 'Unique Constraint',
    VersionSkew: 'Version Skew',
  };
  return labels[type] || type;
}

export function getConflictResolutionStrategyLabel(strategy: string): string {
  const labels: Record<string, string> = {
    LWW: 'Last Write Wins',
    DeleteWins: 'Delete Wins',
    UserMediated: 'User Mediated',
    Merge: 'Merge',
  };
  return labels[strategy] || strategy;
}

export function isSyncConflictResolved(conflict: SyncConflict): boolean {
  return conflict.resolved === true;
}

export function getPendingChangeStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[status] || status;
}