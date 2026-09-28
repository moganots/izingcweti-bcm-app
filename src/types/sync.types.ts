export enum SyncStatus {
  PENDING = 'Pending',
  SYNCING = 'Syncing',
  SYNCED = 'Synced',
  FAILED = 'Failed',
  CONFLICT = 'Conflict',
}

export enum SyncPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  BACKGROUND = 5,
}

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum PendingChangeStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export enum PendingChangeOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ConflictType {
  UPDATE_UPDATE = 'UPDATE_UPDATE',
  DELETE_UPDATE = 'DELETE_UPDATE',
  CREATE_CREATE = 'CREATE_CREATE',
  VERSION_SKEW = 'VERSION_SKEW',
}

export enum ConflictSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',
  DELETE_WINS = 'DELETE_WINS',
  MERGE = 'MERGE',
  USER_MEDIATED = 'USER_MEDIATED',
  CLIENT_WINS = 'CLIENT_WINS',
  SERVER_WINS = 'SERVER_WINS',
  CUSTOM = 'CUSTOM',
}

export enum ConflictResolutionEnvironment {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID',
}

export enum ConflictResolutionCategory {
  DATA = 'DATA',
  STRUCTURAL = 'STRUCTURAL',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  PERMISSION = 'PERMISSION',
}

export enum ConnectionType {
  NONE = 'none',
  UNKNOWN = 'unknown',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
}

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'Offline',
  [ConnectionType.UNKNOWN]: 'Unknown',
  [ConnectionType.WIFI]: 'WiFi',
  [ConnectionType.CELLULAR]: 'Cellular',
  [ConnectionType.ETHERNET]: 'Ethernet',
}

export const CONNECTION_TYPE_ICONS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'wifi_off',
  [ConnectionType.UNKNOWN]: 'help',
  [ConnectionType.WIFI]: 'wifi',
  [ConnectionType.CELLULAR]: 'signal_cellular_4_bar',
  [ConnectionType.ETHERNET]: 'settings_ethernet',
}

export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'negative',
  [ConnectionType.UNKNOWN]: 'grey',
  [ConnectionType.WIFI]: 'positive',
  [ConnectionType.CELLULAR]: 'warning',
  [ConnectionType.ETHERNET]: 'positive',
}

// ============================================
// Interfaces
// ============================================

export interface NetworkStatus {
  isOnline: boolean
  connectionType: ConnectionType
  signalStrength: number
  isMetered: boolean
  lastChecked: string
}

export interface NetworkInfo {
  isOnline: boolean
  connectionType: ConnectionType
  signalStrength: number
  isMetered: boolean
  latency: number
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
  lastChecked: string
}

export interface SyncProgress {
  lastSyncToken: string | null
  lastSyncTime: string | Date | null
  totalProcessed: number
  pendingItems: number
  failedItems: number
}

export interface SyncResult {
  success: boolean
  appliedChanges: number
  conflicts: any[]
  syncToken: string
}

export interface SyncStats {
  pendingChanges: number
  conflicts: number
  unresolvedConflicts: number
  lastSyncTime: string | null
  lastSyncToken: string | null
  isOnline: boolean
  syncInProgress: boolean
}

export interface SyncState {
  isSyncing: boolean
  lastSyncAt: string | null
  lastSyncToken: string | null
  pendingCount: number
  conflictCount: number
}

export interface SyncChange {
  entityType: string
  entityId: string
  operationType: OperationType
  data: Record<string, any>
  version?: number
  clientTimestamp?: string
}

export interface SyncPullResponse {
  success: boolean
  changes: SyncChange[]
  syncToken: string
  hasMore: boolean
}

export interface SyncPushRequest {
  changes: SyncChange[]
  lastSyncToken: string | null
  deviceId?: string
}

export interface SyncPushResponse {
  success: boolean
  appliedChanges: number
  conflicts: any[]
  syncToken: string
  appliedIds?: string[]
  failedIds?: string[]
}

export interface ConnectionQuality {
  type: ConnectionType
  strength: number
  latency: number
  bandwidth: number
  reliable: boolean
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
}

// Helper function to get connection type from Capacitor
export function getConnectionType(type: string): ConnectionType {
  switch (type?.toLowerCase()) {
    case 'wifi':
      return ConnectionType.WIFI
    case 'cellular':
      return ConnectionType.CELLULAR
    case 'ethernet':
      return ConnectionType.ETHERNET
    case 'none':
      return ConnectionType.NONE
    default:
      return ConnectionType.UNKNOWN
  }
}