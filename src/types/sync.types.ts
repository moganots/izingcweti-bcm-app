import type {
  PendingChange,
  OperationType,
  ConflictType,
  SyncPriority,
} from '../models/entities/sync/sync.entity'

/**
 * Sync Type Definitions
 */

// ============================================
// Sync Engine Types
// ============================================

/**
 * Sync configuration
 */
export interface SyncConfig {
  enabled: boolean
  intervalMinutes: number
  maxRetries: number
  batchSize: number
  conflictStrategy: ConflictResolutionStrategy
  priorityEnabled: boolean
  compressionEnabled: boolean
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MANUAL = 'manual',
}

/**
 * Sync operation
 */
export interface SyncOperation {
  id: string
  type: 'push' | 'pull' | 'full'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  changesProcessed: number
  conflictsResolved: number
  errors: SyncError[]
}

/**
 * Sync error
 */
export interface SyncError {
  code: string
  message: string
  entityType?: string
  entityId?: string
  timestamp: string
  retryable: boolean
}

/**
 * Sync queue
 */
export interface SyncQueue {
  highPriority: PendingChange[]
  mediumPriority: PendingChange[]
  lowPriority: PendingChange[]
}

/**
 * Sync metrics
 */
export interface SyncMetrics {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  averageSyncTime: number
  lastSyncDuration: number
  totalChangesPushed: number
  totalChangesPulled: number
  conflictsEncountered: number
  conflictsResolved: number
  dataTransferred: number // bytes
}

// ============================================
// Change Tracking Types
// ============================================

/**
 * Change set
 */
export interface ChangeSet {
  entityType: string
  entityId: string
  operation: OperationType
  data: Record<string, any>
  previousData?: Record<string, any>
  timestamp: string
  userId: string
  version: number
}

/**
 * Change batch
 */
export interface ChangeBatch {
  changes: ChangeSet[]
  batchId: string
  createdAt: string
  priority: SyncPriority
  retryCount: number
}

// ============================================
// Conflict Resolution Types
// ============================================

/**
 * Conflict details
 */
export interface ConflictDetails {
  conflictId: string
  entityType: string
  entityId: string
  type: ConflictType
  clientVersion: Record<string, any>
  serverVersion: Record<string, any>
  differences: FieldDifference[]
  suggestedResolution?: any
}

/**
 * Field difference
 */
export interface FieldDifference {
  field: string
  clientValue: any
  serverValue: any
  resolved?: boolean
  resolution?: any
}

/**
 * Resolution options
 */
export interface ResolutionOptions {
  strategy: ConflictResolutionStrategy
  resolvedData?: Record<string, any>
  notes?: string
}

// src/types/sync.types.ts (or wherever your sync types are defined)

/**
 * Connection Type Enum
 * Defines the types of network connections available
 */
export enum ConnectionType {
  /** WiFi connection */
  WIFI = 'wifi',

  /** Cellular/mobile data connection (3G, 4G, 5G, LTE) */
  CELLULAR = 'cellular',

  /** Wired ethernet connection */
  ETHERNET = 'ethernet',

  /** No network connection */
  NONE = 'none',

  /** Unable to determine connection type */
  UNKNOWN = 'unknown',
}

/**
 * Connection type labels for display
 */
export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  [ConnectionType.WIFI]: 'WiFi',
  [ConnectionType.CELLULAR]: 'Cellular',
  [ConnectionType.ETHERNET]: 'Ethernet',
  [ConnectionType.NONE]: 'No Connection',
  [ConnectionType.UNKNOWN]: 'Unknown',
}

/**
 * Connection type icons for display
 */
export const CONNECTION_TYPE_ICONS: Record<ConnectionType, string> = {
  [ConnectionType.WIFI]: 'wifi',
  [ConnectionType.CELLULAR]: 'signal_cellular_alt',
  [ConnectionType.ETHERNET]: 'settings_ethernet',
  [ConnectionType.NONE]: 'signal_wifi_off',
  [ConnectionType.UNKNOWN]: 'help_outline',
}

/**
 * Connection type colors for display
 */
export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  [ConnectionType.WIFI]: 'green',
  [ConnectionType.CELLULAR]: 'orange',
  [ConnectionType.ETHERNET]: 'blue',
  [ConnectionType.NONE]: 'red',
  [ConnectionType.UNKNOWN]: 'grey',
}

/**
 * Check if a connection type requires a metered connection
 */
export function isMeteredConnection(type: ConnectionType): boolean {
  return type === ConnectionType.CELLULAR
}

/**
 * Check if a connection type is suitable for large data transfers
 */
export function isHighBandwidthConnection(type: ConnectionType): boolean {
  return type === ConnectionType.WIFI || type === ConnectionType.ETHERNET
}

/**
 * Get connection type from a string value
 */
export function getConnectionType(value: string): ConnectionType {
  const normalized = value?.toLowerCase() || 'unknown'

  switch (normalized) {
    case 'wifi':
      return ConnectionType.WIFI
    case 'cellular':
    case 'mobile':
    case '4g':
    case '5g':
    case 'lte':
      return ConnectionType.CELLULAR
    case 'ethernet':
    case 'wired':
    case 'lan':
      return ConnectionType.ETHERNET
    case 'none':
    case 'offline':
    case 'disconnected':
      return ConnectionType.NONE
    default:
      return ConnectionType.UNKNOWN
  }
}

// ============================================
// Network Types
// ============================================

/**
 * Network Status Interface
 */
export interface NetworkStatus {
  /** Whether the device is currently online */
  isOnline: boolean

  /** The type of network connection */
  connectionType: ConnectionType

  /** Signal strength (0-100) if available */
  signalStrength?: number

  /** Whether the connection is metered (costs data) */
  isMetered?: boolean

  /** Last time the status was checked */
  lastChecked: string

  /** Network latency in milliseconds */
  latency?: number

  /** Estimated bandwidth in kbps */
  bandwidth?: number
}

/**
 * Connection Quality
 */
export interface ConnectionQuality {
  /** Connection type */
  type: ConnectionType

  /** Signal strength percentage (0-100) */
  strength: number

  /** Latency in milliseconds */
  latency: number

  /** Estimated bandwidth in kbps */
  bandwidth: number

  /** Whether the connection is reliable for sync */
  reliable: boolean

  /** Quality rating */
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
}

/**
 * Network event types
 */
export enum NetworkEventType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  TYPE_CHANGED = 'type_changed',
  SIGNAL_CHANGED = 'signal_changed',
  QUALITY_CHANGED = 'quality_changed',
}

// ============================================
// Offline Types
// ============================================

/**
 * Offline action
 */
export interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entityType: string
  entityId?: string
  data?: Record<string, any>
  createdAt: string
  synced: boolean
  error?: string
}

/**
 * Offline queue state
 */
export interface OfflineQueueState {
  pending: number
  processing: number
  completed: number
  failed: number
  total: number
}

/**
 * Storage usage
 */
export interface StorageUsage {
  used: number // bytes
  total: number // bytes
  available: number // bytes
  percentage: number
  byType: Record<string, number>
}

// ============================================
// Sync Event Types
// ============================================

/**
 * Sync event types
 */
export enum SyncEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_PROGRESS = 'sync_progress',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  CONFLICT_DETECTED = 'conflict_detected',
  CONFLICT_RESOLVED = 'conflict_resolved',
  OFFLINE_MODE_ENTERED = 'offline_mode_entered',
  ONLINE_MODE_RESTORED = 'online_mode_restored',
  QUEUE_UPDATED = 'queue_updated',
}

/**
 * Sync event
 */
export interface SyncEvent {
  type: SyncEventType
  timestamp: string
  data?: any
}

/**
 * Sync event handler
 */
export type SyncEventHandler = (event: SyncEvent) => void
