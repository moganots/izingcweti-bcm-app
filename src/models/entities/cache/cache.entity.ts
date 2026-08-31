// ============================================
// Cache Module - Enums (Aligned with Backend)
// ============================================

export enum CacheEvictionPolicy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

export enum CacheCompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
}

// ============================================
// Cache Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * Cache Entry - Matches backend Cache entity
 */
export interface CacheEntry {
  uuid: string
  key: string
  value: any
  expiresAt?: string | Date | null
  tags?: string | null
  hitCount: number
  lastAccessedAt?: string | Date | null
  sizeBytes: number
  isCompressed: boolean
  compressionAlgorithm?: string | null
  createdBy: string
  createdAt: string | Date
  updatedBy: string
  updatedAt: string | Date
  version: number
  deletedBy?: string | null
  deletedAt?: string | null
  syncStatus?: string
}

/**
 * Cache Stats - Matches backend CacheStatsDto
 */
export interface CacheStats {
  totalEntries: number
  totalSizeBytes: number
  activeEntries: number
  expiredEntries: number
  totalHits: number
  cacheHitRatio: number
}

/**
 * Create Cache DTO - Matches backend CreateCacheDto
 */
export interface CreateCacheRequest {
  key: string
  value: any
  ttl?: number // Time to live in seconds
  tags?: string
  compress?: boolean
}

/**
 * Update Cache DTO - Matches backend UpdateCacheDto
 */
export interface UpdateCacheRequest {
  value: any
  ttl?: number // Time to live in seconds
  tags?: string
}

/**
 * Bulk Cache DTO - Matches backend BulkCacheDto
 */
export interface BulkCacheRequest {
  items: CreateCacheRequest[]
}

/**
 * Cache Query Parameters - Matches backend CacheQueryDto
 */
export interface CacheQueryParams {
  tags?: string
  pattern?: string
  limit?: number
  offset?: number
}

/**
 * Cache Entry Metadata
 */
export interface CacheEntryMetadata {
  key: string
  sizeBytes: number
  expiresAt?: string | Date
  tags?: string
  hitCount: number
  lastAccessedAt?: string | Date
}

/**
 * Cache Cleanup Result
 */
export interface CacheCleanupResult {
  cleaned: number
  freedBytes: number
}

/**
 * Bulk Cache Response
 */
export interface BulkCacheResponse {
  entries: CacheEntry[]
  missedKeys: string[]
}