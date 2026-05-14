import { PendingChange } from 'src/models/entities/sync.entity'

/**
 * Database Type Definitions
 * Types for IndexedDB/Dexie database operations
 */

// ============================================
// Database Configuration
// ============================================

/**
 * Database configuration
 */
export interface DatabaseConfig {
  name: string
  version: number
  tables: TableDefinition[]
  encryption?: EncryptionConfig
}

/**
 * Table definition
 */
export interface TableDefinition {
  name: string
  primaryKey?: string
  indexes?: IndexDefinition[]
  timestamps?: boolean
  syncable?: boolean
}

/**
 * Index definition
 */
export interface IndexDefinition {
  name: string
  keyPath: string | string[]
  unique?: boolean
  multiEntry?: boolean
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  enabled: boolean
  algorithm?: string
  key?: string
}

// ============================================
// Database Operations
// ============================================

export type QueryOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'between'
  | 'exists'
  | 'notExists'

/**
 * Query filter
 */
export interface QueryFilter {
  field: string
  operator: QueryOperator
  value: any
  caseSensitive?: boolean
}

/**
 * Query options
 */
export interface QueryOptions {
  filters?: QueryFilter[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  offset?: number
  limit?: number
  distinct?: boolean
}

/**
 * Query result
 */
export interface QueryResult<T> {
  data: T[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

// ============================================
// Repository Types
// ============================================

/**
 * Base repository interface
 */
export interface BaseRepository<T> {
  findAll(options?: QueryOptions): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  findOne(filter: Partial<T>): Promise<T | undefined>
  findMany(filter: Partial<T>, options?: QueryOptions): Promise<T[]>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  upsert(data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  deleteMany(ids: string[]): Promise<void>
  count(filter?: Partial<T>): Promise<number>
  clear(): Promise<void>
}

/**
 * Repository with sync support
 */
export interface SyncableRepository<T> extends BaseRepository<T> {
  getPendingChanges(): Promise<PendingChange[]>
  markSynced(id: string): Promise<void>
  getLastSyncTime(): Promise<string | null>
  setLastSyncTime(time: string): Promise<void>
}

// ============================================
// Migration Types
// ============================================

/**
 * Migration
 */
export interface Migration {
  version: number
  name: string
  up: (db: any) => Promise<void>
  down?: (db: any) => Promise<void>
}

/**
 * Migration state
 */
export interface MigrationState {
  currentVersion: number
  targetVersion: number
  pendingMigrations: Migration[]
  appliedMigrations: Migration[]
  isMigrating: boolean
}

// ============================================
// Storage Types
// ============================================

/**
 * Storage statistics
 */
export interface StorageStats {
  database: string
  tables: TableStats[]
  totalSize: number
  totalEntries: number
  lastUpdated: string
}

/**
 * Table statistics
 */
export interface TableStats {
  name: string
  entries: number
  size: number
  indexes: string[]
}

/**
 * Backup data
 */
export interface DatabaseBackup {
  version: number
  timestamp: string
  tables: Record<string, any[]>
  metadata: Record<string, any>
}

// ============================================
// Cache Types
// ============================================

/**
 * Cache entry
 */
export interface CacheEntry<T = any> {
  key: string
  data: T
  timestamp: number
  ttl: number // milliseconds
  tags?: string[]
  size?: number
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean
  defaultTTL: number // milliseconds
  maxSize: number // bytes
  maxEntries: number
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl'
  compressionEnabled: boolean
}

/**
 * Cache statistics
 */
export interface CacheStats {
  entries: number
  size: number
  hits: number
  misses: number
  hitRatio: number
  evictions: number
  expirations: number
}

// ============================================
// Transaction Types
// ============================================

/**
 * Transaction mode
 */
export type TransactionMode = 'readonly' | 'readwrite'

/**
 * Transaction context
 */
export interface TransactionContext {
  mode: TransactionMode
  tables: string[]
  timeout?: number
}
