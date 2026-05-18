// src/models/entities/cache.entity.ts

/**
 * Cache Entity
 */
export interface CacheEntry {
  key: string
  value: any
  expires_at?: string | null
  tags?: string | null
  hit_count: number
  last_accessed_at?: string | null
  size_bytes: number
  is_compressed: boolean
  compression_algorithm?: string | null
  uuid: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
}

/**
 * Cache Stats
 */
export interface CacheStats {
  total_entries: number
  total_size_bytes: number
  active_entries: number
  expired_entries: number
  total_hits: number
  cache_hit_ratio: number
}

/**
 * Create Cache DTO
 */
export interface CreateCacheDTO {
  key: string
  value: any
  ttl?: number // Time to live in seconds
  tags?: string
  compress?: boolean
}

/**
 * Cache Query Parameters
 */
export interface CacheQueryParams {
  tags?: string
  pattern?: string
  limit?: number
  offset?: number
}
