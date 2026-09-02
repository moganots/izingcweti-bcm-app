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
  UPDATE_UPDATE = 'UPDATE_UPDATE',
  DELETE_UPDATE = 'DELETE_UPDATE',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
  VERSION_SKEW = 'VERSION_SKEW',
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'LWW',
  DELETE_WINS = 'DeleteWins',
  USER_MEDIATED = 'UserMediated',
  MERGE = 'Merge',
}

export enum PendingChangeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  METERED = 'metered',
  SLOW = 'slow',
}

// ============================================
// Connection Type Enum - For Network Monitoring
// ============================================

export enum ConnectionType {
  NONE = 'none',
  UNKNOWN = 'unknown',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  USB = 'usb',
}

// ============================================
// Connection Type Constants
// ============================================

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'Offline',
  [ConnectionType.UNKNOWN]: 'Unknown',
  [ConnectionType.WIFI]: 'WiFi',
  [ConnectionType.CELLULAR]: 'Cellular',
  [ConnectionType.ETHERNET]: 'Ethernet',
  [ConnectionType.BLUETOOTH]: 'Bluetooth',
  [ConnectionType.USB]: 'USB',
};

export const CONNECTION_TYPE_ICONS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'wifi_off',
  [ConnectionType.UNKNOWN]: 'help_outline',
  [ConnectionType.WIFI]: 'wifi',
  [ConnectionType.CELLULAR]: 'signal_cellular_alt',
  [ConnectionType.ETHERNET]: 'settings_ethernet',
  [ConnectionType.BLUETOOTH]: 'bluetooth',
  [ConnectionType.USB]: 'usb',
};

export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'grey',
  [ConnectionType.UNKNOWN]: 'grey',
  [ConnectionType.WIFI]: 'green',
  [ConnectionType.CELLULAR]: 'blue',
  [ConnectionType.ETHERNET]: 'primary',
  [ConnectionType.BLUETOOTH]: 'info',
  [ConnectionType.USB]: 'teal',
};

// ============================================
// Network Quality Types
// ============================================

export interface ConnectionQuality {
  type: ConnectionType;
  strength: number;
  latency: number;
  bandwidth: number;
  reliable: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
}

export interface NetworkStatusInfo {
  isOnline: boolean;
  connectionType: ConnectionType;
  connectionQuality: ConnectionQuality;
  lastChecked: string | Date;
}

// ============================================
// Sync Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * Pending Change - Matches backend PendingChange entity
 */
export interface PendingChange {
  uuid: string;
  entityType: string;
  entityId: string;
  operationType: OperationType;
  data: Record<string, any>;
  priority: SyncPriority;
  attempts: number;
  status: PendingChangeStatus;
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

/**
 * Sync Conflict - Matches backend SyncConflict entity
 */
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

/**
 * Sync Metadata - Matches backend SyncMetadata entity
 */
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

/**
 * Sync Progress - Matches backend SyncProgressDto
 */
export interface SyncProgress {
  lastSyncToken: string | null;
  lastSyncTime: string | Date | null;
  totalProcessed: number;
  pendingItems: number;
  failedItems: number;
}

/**
 * Sync Pull Response - Matches backend
 */
export interface SyncPullResponse {
  changes: SyncChange[];
  syncToken: string;
  serverTimestamp: string;
}

/**
 * Sync Change - Matches backend SyncChange
 */
export interface SyncChange {
  entityType: string;
  entityId: string;
  operationType: OperationType;
  data: Record<string, any>;
  timestamp: string;
  version: number;
}

/**
 * Sync Push Request - Matches backend PushChangesRequest
 */
export interface SyncPushRequest {
  changes: PendingChange[];
  lastSyncToken?: string;
}

/**
 * Sync Push Response - Matches backend PushChangesResponse
 */
export interface SyncPushResponse {
  success: boolean;
  appliedChanges: number;
  conflicts: SyncConflict[];
  syncToken: string;
}

/**
 * Sync State - Frontend state
 */
export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline';
  pendingChanges: PendingChange[];
  conflicts: SyncConflict[];
  lastSyncAt: string | null;
  syncToken: string | null;
  isOnline: boolean;
  networkType: string;
  progress: number;
  error: string | null;
}

/**
 * Sync Statistics - Frontend stats
 */
export interface SyncStatistics {
  pendingChanges: number;
  conflicts: number;
  unresolvedConflicts: number;
  lastSyncTime: string | null;
  lastSyncToken: string | null;
  isOnline: boolean;
  syncInProgress: boolean;
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

export function getPendingChangeStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[status] || status;
}

export function getPendingChangeStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'grey',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
  };
  return colors[status] || 'grey';
}

export function getConflictTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    UPDATE_UPDATE: 'Update-Update',
    DELETE_UPDATE: 'Delete-Update',
    UNIQUE_CONSTRAINT: 'Unique Constraint',
    VERSION_SKEW: 'Version Skew',
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

export function getConnectionTypeLabel(type: ConnectionType): string {
  return CONNECTION_TYPE_LABELS[type] || 'Unknown';
}

export function getConnectionTypeIcon(type: ConnectionType): string {
  return CONNECTION_TYPE_ICONS[type] || 'help_outline';
}

export function getConnectionTypeColor(type: ConnectionType): string {
  return CONNECTION_TYPE_COLORS[type] || 'grey';
}

export function isConnectionOnline(type: ConnectionType): boolean {
  return type !== ConnectionType.NONE && type !== ConnectionType.UNKNOWN;
}

export function isConnectionHighBandwidth(type: ConnectionType): boolean {
  return type === ConnectionType.WIFI || 
         type === ConnectionType.ETHERNET || 
         type === ConnectionType.USB;
}