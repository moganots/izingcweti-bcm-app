export interface CacheEntry<T = any> {
  key: string
  value: T
  expires_at?: string
  tags?: string[]
  hit_count: number
  last_accessed_at?: string
  size_bytes: number
  is_compressed: boolean
  compression_algorithm?: string
}

export interface CacheStats {
  entries: number
  size: number
  hits: number
  misses: number
  hit_ratio: number
  evictions: number
  expirations: number
  average_ttl_seconds: number
}

export interface SetCacheRequest {
  key: string
  value: any
  ttl_seconds?: number
  tags?: string[]
}

export interface GetCacheParams {
  key: string
}

export interface BulkCacheRequest {
  entries: SetCacheRequest[]
}

export interface CacheCleanupResult {
  cleaned: number
  freed_bytes: number
}
