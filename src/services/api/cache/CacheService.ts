import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  type CacheEntry,
  type CacheStats,
  type SetCacheRequest,
  type BulkCacheRequest,
  type BulkCacheResponse,
  type CacheCleanupResult,
  type PaginatedResponse,
} from './../../../modules'

export interface CacheQueryParams {
  tags?: string[]
  prefix?: string
  page?: number
  limit?: number
}

export class CacheService extends BaseService {
  async getEntry(key: string): Promise<CacheEntry | undefined> {
    try {
      const response = await this.get<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key))
      return this.extractData(response)
    } catch (err: any) {
      if (err.status === 404) {
        return undefined
      }
      throw err
    }
  }

  async getValue<T = any>(key: string): Promise<T | undefined> {
    const entry = await this.getEntry(key)
    if (!entry) return undefined
    return entry.value as T
  }

  async setEntry(
    key: string,
    value: any,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<CacheEntry> {
    const request: SetCacheRequest = { key, value, ttl_seconds: ttlSeconds ?? 0, tags: tags ?? [] }
    const response = await this.post<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key), request)
    return this.extractData(response)
  }

  async deleteEntry(key: string): Promise<void> {
    await this.delete(API_ENDPOINTS.CACHE.BY_KEY(key))
  }

  async clearAll(): Promise<void> {
    await this.post(API_ENDPOINTS.CACHE.CLEAR_ALL)
  }

  async clearByTags(tags: string[]): Promise<{ cleared: number }> {
    const response = await this.post<{ cleared: number }>(
      API_ENDPOINTS.CACHE.DELETE_BY_TAGS(tags.join(',')),
      { tags }
    )
    return this.extractData(response)
  }

  async getStats(): Promise<CacheStats> {
    const response = await this.get<CacheStats>(API_ENDPOINTS.CACHE.STATS)
    return this.extractData(response)
  }

  async query(params: CacheQueryParams): Promise<PaginatedResponse<CacheEntry>> {
    return this.getPaginated<CacheEntry>(API_ENDPOINTS.CACHE.BASE, params as Record<string, any>)
  }

  async remember<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<T> {
    const existing = await this.getValue<T>(key)
    if (existing !== undefined) {
      return existing
    }

    const value = await factory()
    await this.setEntry(key, value, ttlSeconds, tags)
    return value
  }

  async getMany(keys: string[]): Promise<Map<string, any>> {
    const request: BulkCacheRequest = { entries: keys.map((key) => ({ key, value: null })) }
    const response = await this.post<BulkCacheResponse>(API_ENDPOINTS.CACHE.BULK, request)
    const data = this.extractData(response)
    const result = new Map<string, any>()
    data.entries.forEach((entry) => {
      result.set(entry.key, entry.value)
    })
    return result
  }

  async setMany(
    entries: Array<{ key: string; value: any; ttl_seconds?: number; tags?: string[] }>
  ): Promise<void> {
    const request: BulkCacheRequest = { entries }
    await this.post(API_ENDPOINTS.CACHE.BULK, request)
  }

  async hasKey(key: string): Promise<boolean> {
    const response = await this.get<{ exists: boolean }>(API_ENDPOINTS.CACHE.EXISTS(key))
    return this.extractData(response).exists
  }

  async updateTTL(key: string, ttlSeconds: number): Promise<void> {
    await this.patch(`/cache/${encodeURIComponent(key)}/ttl`, { ttl: ttlSeconds })
  }

  async getSize(): Promise<number> {
    const stats = await this.getStats()
    return stats.size
  }

  async getHitRatio(): Promise<number> {
    const stats = await this.getStats()
    return stats.hit_ratio
  }

  async cleanExpired(): Promise<CacheCleanupResult> {
    const response = await this.post<CacheCleanupResult>(API_ENDPOINTS.CACHE.CLEAN_EXPIRED)
    return this.extractData(response)
  }

  async getKeys(pattern?: string): Promise<string[]> {
    if (pattern) {
      const response = await this.get<string[]>(
        `${API_ENDPOINTS.CACHE.BY_PATTERN}?pattern=${encodeURIComponent(pattern)}`
      )
      return this.extractData(response)
    }
    const response = await this.get<string[]>(API_ENDPOINTS.CACHE_EXTRA.KEYS)
    return this.extractData(response)
  }

  async increment(key: string, delta: number = 1, ttlSeconds?: number): Promise<number> {
    const response = await this.post<{ value: number }>(API_ENDPOINTS.CACHE_EXTRA.INCREMENT(key), {
      delta,
      ttl: ttlSeconds,
    })
    return this.extractData(response).value
  }

  async decrement(key: string, delta: number = 1, ttlSeconds?: number): Promise<number> {
    const response = await this.post<{ value: number }>(API_ENDPOINTS.CACHE_EXTRA.DECREMENT(key), {
      delta,
      ttl: ttlSeconds,
    })
    return this.extractData(response).value
  }

  async getTTL(key: string): Promise<number | null> {
    const response = await this.get<{ ttl: number | null }>(API_ENDPOINTS.CACHE_EXTRA.TTL(key))
    return this.extractData(response).ttl
  }

  async warmUp(keys: string[]): Promise<{ warmed: number; failed: number }> {
    const response = await this.post<{ warmed: number; failed: number }>(
      API_ENDPOINTS.CACHE_EXTRA.WARM_UP,
      { keys }
    )
    return this.extractData(response)
  }
}

export const cacheService = new CacheService()
