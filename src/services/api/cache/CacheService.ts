import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  type CacheEntry,
  type CacheStats,
  type CreateCacheRequest,
  type UpdateCacheRequest,
  type BulkCacheRequest,
  type BulkCacheResponse,
  type CacheCleanupResult,
  type CacheQueryParams,
  type CacheEntryMetadata,
  type PaginatedResponse,
} from '../../../models/entities/cache/cache.entity'

/**
 * Cache Service - Aligned with Backend DTOs (camelCase)
 */
export class CacheService extends BaseService {
  // ============================================
  // GET Operations
  // ============================================

  /**
   * Get cache entry by key - GET /cache/:key
   */
  async getEntry(key: string): Promise<CacheEntry | null> {
    try {
      const response = await this.get<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key))
      return this.extractData(response)
    } catch (err: any) {
      if (err.status === 404) {
        return null
      }
      throw err
    }
  }

  /**
   * Get cache value by key - GET /cache/:key (returns just the value)
   */
  async getValue<T = any>(key: string): Promise<T | null> {
    const entry = await this.getEntry(key)
    if (!entry) return null
    return entry.value as T
  }

  /**
   * Get cache entries by tags - GET /cache/tags/:tags
   */
  async getByTags(tags: string): Promise<CacheEntry[]> {
    const response = await this.get<CacheEntry[]>(API_ENDPOINTS.CACHE.BY_TAGS(tags))
    return this.extractData(response)
  }

  /**
   * Get cache entries by pattern - GET /cache/pattern
   */
  async getByPattern(pattern: string): Promise<CacheEntry[]> {
    const response = await this.get<CacheEntry[]>(
      API_ENDPOINTS.CACHE.BY_PATTERN,
      { pattern }
    )
    return this.extractData(response)
  }

  /**
   * Check if cache key exists - GET /cache/:key/exists
   */
  async exists(key: string): Promise<boolean> {
    const response = await this.get<{ exists: boolean }>(API_ENDPOINTS.CACHE.EXISTS(key))
    return this.extractData(response).exists
  }

  /**
   * Get or set cache value - POST /cache/:key/get-or-set
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const response = await this.post<{ key: string; value: T }>(
      API_ENDPOINTS.CACHE.GET_OR_SET(key),
      {
        value: await factory(),
        ttl,
      }
    )
    return this.extractData(response).value
  }

  // ============================================
  // SET Operations
  // ============================================

  /**
   * Set cache entry - POST /cache
   */
  async setEntry(data: CreateCacheRequest): Promise<CacheEntry> {
    const response = await this.post<CacheEntry>(API_ENDPOINTS.CACHE.BASE, data)
    return this.extractData(response)
  }

  /**
   * Set multiple cache entries - POST /cache/bulk
   */
  async setMany(data: BulkCacheRequest): Promise<CacheEntry[]> {
    const response = await this.post<CacheEntry[]>(API_ENDPOINTS.CACHE.BULK, data)
    return this.extractData(response)
  }

  // ============================================
  // UPDATE Operations
  // ============================================

  /**
   * Update cache entry - PUT /cache/:key
   */
  async updateEntry(key: string, data: UpdateCacheRequest): Promise<CacheEntry> {
    const response = await this.put<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key), data)
    return this.extractData(response)
  }

  /**
   * Update TTL for cache entry - PATCH /cache/:key/ttl
   */
  async updateTTL(key: string, ttlSeconds: number): Promise<void> {
    await this.patch(`${API_ENDPOINTS.CACHE.BY_KEY(key)}/ttl`, { ttl: ttlSeconds })
  }

  // ============================================
  // DELETE Operations
  // ============================================

  /**
   * Delete cache entry - DELETE /cache/:key
   */
  async deleteEntry(key: string): Promise<void> {
    await this.delete(API_ENDPOINTS.CACHE.BY_KEY(key))
  }

  /**
   * Delete cache entries by tags - DELETE /cache/tags/:tags
   */
  async deleteByTags(tags: string): Promise<{ count: number }> {
    const response = await this.delete<{ count: number }>(
      API_ENDPOINTS.CACHE.DELETE_BY_TAGS(tags)
    )
    return this.extractData(response)
  }

  /**
   * Clear all cache entries - DELETE /cache/clear-all
   */
  async clearAll(): Promise<{ count: number }> {
    const response = await this.delete<{ count: number }>(API_ENDPOINTS.CACHE.CLEAR_ALL)
    return this.extractData(response)
  }

  /**
   * Clean expired cache entries - POST /cache/clean-expired
   */
  async cleanExpired(): Promise<{ count: number }> {
    const response = await this.post<{ count: number }>(API_ENDPOINTS.CACHE.CLEAN_EXPIRED)
    return this.extractData(response)
  }

  // ============================================
  // STATISTICS Operations
  // ============================================

  /**
   * Get cache statistics - GET /cache/stats
   */
  async getStats(): Promise<CacheStats> {
    const response = await this.get<CacheStats>(API_ENDPOINTS.CACHE.STATS)
    return this.extractData(response)
  }

  /**
   * Get cache size - GET /cache/stats (derived)
   */
  async getSize(): Promise<number> {
    const stats = await this.getStats()
    return stats.totalSizeBytes || 0
  }

  /**
   * Get cache hit ratio - GET /cache/stats (derived)
   */
  async getHitRatio(): Promise<number> {
    const stats = await this.getStats()
    return stats.cacheHitRatio || 0
  }

  /**
   * Get cache entries count - GET /cache/stats (derived)
   */
  async getEntryCount(): Promise<number> {
    const stats = await this.getStats()
    return stats.totalEntries || 0
  }

  // ============================================
  // QUERY Operations
  // ============================================

  /**
   * Query cache entries - GET /cache (with pagination)
   */
  async query(params?: CacheQueryParams): Promise<PaginatedResponse<CacheEntry>> {
    const response = await this.getPaginated<CacheEntry>(
      API_ENDPOINTS.CACHE.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  // ============================================
  // UTILITY Operations
  // ============================================

  /**
   * Get cache keys by pattern
   */
  async getKeys(pattern?: string): Promise<string[]> {
    if (pattern) {
      const response = await this.get<string[]>(
        `${API_ENDPOINTS.CACHE.BY_PATTERN}?pattern=${encodeURIComponent(pattern)}`
      )
      return this.extractData(response)
    }
    // Fallback to query
    const result = await this.query({ limit: 1000 })
    return result.data.map((entry) => entry.key)
  }

  /**
   * Warm up cache with keys
   */
  async warmUp(keys: string[]): Promise<{ warmed: number; failed: number }> {
    const response = await this.post<{ warmed: number; failed: number }>(
      '/cache/warm-up',
      { keys }
    )
    return this.extractData(response)
  }

  /**
   * Get cache entry metadata
   */
  async getMetadata(key: string): Promise<CacheEntryMetadata | null> {
    const entry = await this.getEntry(key)
    if (!entry) return null

    return {
      key: entry.key,
      sizeBytes: entry.sizeBytes,
      expiresAt: entry.expiresAt,
      tags: entry.tags,
      hitCount: entry.hitCount,
      lastAccessedAt: entry.lastAccessedAt,
    }
  }
}

export const cacheService = new CacheService()