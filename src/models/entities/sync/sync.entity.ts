// ============================================
// Sync Module - Enums (Aligned with Backend)
// ============================================

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
}

export enum SyncPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ConflictType {
  UPDATE_UPDATE = 'Update-Update',
  DELETE_UPDATE = 'Delete-Update',
  UNIQUE_CONSTRAINT = 'UniqueConstraint',
  VERSION_SKEW = 'VersionSkew',
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'LWW',
  DELETE_WINS = 'DeleteWins',
  USER_MEDIATED = 'UserMediated',
  MERGE = 'Merge',
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

export interface PendingChange {
  uuid: string;
  entityType: string;
  entityId: string;
  operationType: OperationType;
  data: Record<string, any>;
  priority: SyncPriority;
  attempts: number;
  status: string; // PendingChangeStatus from backend
  errorMessage?: string;
  createdBy: string;
  createdAt: string | Date;
  updatedBy: string;
  updatedAt: string | Date;
  version: number;
  deletedBy?: string | null;
  deletedAt?: string | null;
  syncStatus?: SyncStatus;
}

// ============================================
// Sync Conflict - Aligned with Backend SyncConflict entity (camelCase)
// ============================================

export interface SyncConflict {
  uuid: string;
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
  createdBy: string;
  createdAt: string | Date;
  updatedBy: string;
  updatedAt: string | Date;
  version: number;
  deletedBy?: string | null;
  deletedAt?: string | null;
  syncStatus?: SyncStatus;
}

// ============================================
// Sync Metadata - Aligned with Backend SyncMetadata entity (camelCase)
// ============================================

export interface SyncMetadata {
  uuid: string;
  key: string;
  value: string;
  createdBy: string;
  createdAt: string | Date;
  updatedBy: string;
  updatedAt: string | Date;
  version: number;
  deletedBy?: string | null;
  deletedAt?: string | null;
  syncStatus?: SyncStatus;
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