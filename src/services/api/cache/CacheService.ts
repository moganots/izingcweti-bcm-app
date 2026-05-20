import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import type {
    CacheEntry,
    CacheStats,
    CreateCacheDTO,
    CacheQueryParams,
} from './../../../models/entities'
import type { PaginatedResponse } from './../../../types'

/**
 * Cache API Service
 * Handles server-side cache operations
 */
export class CacheService extends BaseService {
    /**
     * Get cache entry by key
     * Renamed from get() to getEntry() to avoid conflict with BaseService.get()
     */
    async getEntry(key: string): Promise<CacheEntry | undefined> {
        try {
            const response = await this.get<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key))
            return this.extractData(response)
        } catch (err: any) {
            if (err.response?.status === 404) {
                return undefined
            }
            throw err
        }
    }

    /**
     * Get cache value (parsed)
     */
    async getValue<T = any>(key: string): Promise<T | undefined> {
        const entry = await this.getEntry(key)
        if (!entry) return undefined

        try {
            return JSON.parse(entry.value) as T
        } catch {
            return entry.value as T
        }
    }

    /**
     * Set cache entry
     */
    async setEntry(key: string, value: any, ttl?: number, tags?: string[]): Promise<CacheEntry> {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
        const data: CreateCacheDTO = {
            key,
            value: serializedValue,
            ttl,
            tags: tags?.join(','),
        } as CreateCacheDTO

        const response = await this.post<CacheEntry>(API_ENDPOINTS.CACHE.BY_KEY(key), data)
        return this.extractData(response)
    }

    /**
     * Delete cache entry
     * Renamed from delete() to deleteEntry() to avoid conflict with BaseService.delete()
     */
    async deleteEntry(key: string): Promise<void> {
        await this.delete(API_ENDPOINTS.CACHE.BY_KEY(key))
    }

    /**
     * Clear all cache
     */
    async clearAll(): Promise<void> {
        await this.post(API_ENDPOINTS.CACHE.CLEAR)
    }

    /**
     * Clear cache by tags
     */
    async clearByTags(tags: string[]): Promise<{ cleared: number }> {
        const response = await this.post<{ cleared: number }>(API_ENDPOINTS.CACHE.CLEAR_BY_TAGS, {
            tags,
        })
        return this.extractData(response)
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<CacheStats> {
        const response = await this.get<CacheStats>(API_ENDPOINTS.CACHE.STATS)
        return this.extractData(response)
    }

    /**
     * Get all cache keys
     */
    async getKeys(pattern?: string): Promise<string[]> {
        let url: string = API_ENDPOINTS.CACHE.KEYS
        if (pattern) {
            url = API_ENDPOINTS.CACHE.KEYS_BY_PATTERN(pattern)
        }
        const response = await this.get<string[]>(url)
        return this.extractData(response)
    }

    /**
     * Query cache entries
     */
    async query(params: CacheQueryParams): Promise<PaginatedResponse<CacheEntry>> {
        return this.getPaginated<CacheEntry>(API_ENDPOINTS.CACHE.BASE, params as Record<string, any>)
    }

    /**
     * Get or set cache (atomic)
     */
    async remember<T = any>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number,
        tags?: string[]
    ): Promise<T> {
        const existing = await this.getValue<T>(key)
        if (existing !== undefined) {
            return existing
        }

        const value = await factory()
        await this.setEntry(key, value, ttl, tags)
        return value
    }

    /**
     * Bulk get cache entries
     */
    async getMany(keys: string[]): Promise<Map<string, any>> {
        const response = await this.post<Record<string, any>>(API_ENDPOINTS.CACHE.BULK, { keys })
        const data = this.extractData(response)
        return new Map(Object.entries(data))
    }

    /**
     * Bulk set cache entries
     */
    async setMany(
        entries: Array<{ key: string; value: any; ttl?: number; tags?: string[] }>
    ): Promise<void> {
        await this.post(API_ENDPOINTS.CACHE.BULK, { entries })
    }

    /**
     * Increment cache value
     */
    async increment(key: string, delta: number = 1, ttl?: number): Promise<number> {
        const response = await this.post<{ value: number }>(
            `${API_ENDPOINTS.CACHE.BY_KEY(key)}/increment`,
            {
                delta,
                ttl,
            }
        )
        return this.extractData(response).value
    }

    /**
     * Decrement cache value
     */
    async decrement(key: string, delta: number = 1, ttl?: number): Promise<number> {
        const response = await this.post<{ value: number }>(
            `${API_ENDPOINTS.CACHE.BY_KEY(key)}/decrement`,
            {
                delta,
                ttl,
            }
        )
        return this.extractData(response).value
    }

    /**
     * Check if key exists
     */
    async hasKey(key: string): Promise<boolean> {
        try {
            const entry = await this.getEntry(key)
            return !!entry
        } catch {
            return false
        }
    }

    /**
     * Get cache TTL for key
     */
    async getTTL(key: string): Promise<number | null> {
        const response = await this.get<{ ttl: number | null }>(
            `${API_ENDPOINTS.CACHE.BY_KEY(key)}/ttl`
        )
        const data = this.extractData(response)
        return data.ttl
    }

    /**
     * Update cache TTL
     */
    async updateTTL(key: string, ttl: number): Promise<void> {
        await this.patch(`${API_ENDPOINTS.CACHE.BY_KEY(key)}/ttl`, { ttl })
    }

    /**
     * Get cache size
     */
    async getSize(): Promise<number> {
        const stats = await this.getStats()
        return stats.total_size_bytes
    }

    /**
     * Warm up cache with multiple keys
     */
    async warmUp(keys: string[]): Promise<{ warmed: number; failed: number }> {
        const response = await this.post<{ warmed: number; failed: number }>(
            `${API_ENDPOINTS.CACHE.BASE}/warm-up`,
            {
                keys,
            }
        )
        return this.extractData(response)
    }

    /**
     * Get cache hit ratio
     */
    async getHitRatio(): Promise<number> {
        const stats = await this.getStats()
        return stats.cache_hit_ratio
    }
}

// Export singleton
export const cacheService = new CacheService()
