import { BaseService } from './BaseService'
import type { PaginatedResponse } from '../../types/common.types'

/**
 * Cache Entry interface
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
    created_at: string
    updated_at: string
}

/**
 * Create Cache Entry Request
 */
export interface CreateCacheEntryRequest {
    key: string
    value: any
    ttl?: number // Time to live in seconds
    tags?: string
    compress?: boolean
}

/**
 * Update Cache Entry Request
 */
export interface UpdateCacheEntryRequest {
    value: any
    ttl?: number
    tags?: string
}

/**
 * Bulk Cache Request
 */
export interface BulkCacheRequest {
    items: CreateCacheEntryRequest[]
}

/**
 * Cache Statistics
 */
export interface CacheStats {
    total_entries: number
    total_size_bytes: number
    active_entries: number
    expired_entries: number
    total_hits: number
    cache_hit_ratio: number
    avg_entry_size: number
    by_tag: Record<string, number>
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

/**
 * Cache API Service
 */
export class CacheService extends BaseService {
    /**
     * Get a cached value by key
     */
    async getValue<T = any>(key: string): Promise<T | null> {
        try {
            const response = await this.get<{ value: T }>(`/cache/${encodeURIComponent(key)}`)
            const data = this.extractData(response)
            return data?.value ?? null
        } catch (error: any) {
            if (error.response?.status === 404) return null
            throw error
        }
    }

    /**
     * Set a cached value
     */
    async set(data: CreateCacheEntryRequest): Promise<CacheEntry> {
        const response = await this.post<CacheEntry>('/cache', data)
        return this.extractData(response)
    }

    /**
     * Update a cached value
     */
    async update(key: string, data: UpdateCacheEntryRequest): Promise<CacheEntry> {
        const response = await this.put<CacheEntry>(`/cache/${encodeURIComponent(key)}`, data)
        return this.extractData(response)
    }

    /**
     * Delete a cached value
     */
    async deleteEntry(key: string): Promise<void> {
        await this.delete(`/cache/${encodeURIComponent(key)}`)
    }

    /**
     * Check if a key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const response = await this.get<{ exists: boolean }>(
                `/cache/${encodeURIComponent(key)}/exists`
            )
            const data = this.extractData(response)
            return data?.exists ?? false
        } catch {
            return false
        }
    }

    /**
     * Get or set a cached value
     */
    async getOrSet<T = any>(key: string, fallbackValue: T, ttl?: number): Promise<T> {
        const response = await this.post<{ value: T }>(`/cache/${encodeURIComponent(key)}/get-or-set`, {
            value: fallbackValue,
            ttl,
        })
        const data = this.extractData(response)
        return data?.value ?? fallbackValue
    }

    /**
     * Get cache entries by tags
     */
    async getByTags(tags: string): Promise<CacheEntry[]> {
        const response = await this.get<CacheEntry[]>('/cache/tags/' + encodeURIComponent(tags))
        return this.extractData(response)
    }

    /**
     * Delete cache entries by tags
     */
    async deleteByTags(tags: string): Promise<{ deleted: number }> {
        const response = await this.delete<{ deleted: number }>(
            '/cache/tags/' + encodeURIComponent(tags)
        )
        return this.extractData(response)
    }

    /**
     * Get cache entries by pattern
     */
    async getByPattern(pattern: string): Promise<CacheEntry[]> {
        const response = await this.get<CacheEntry[]>('/cache/pattern', {
            pattern,
        })
        return this.extractData(response)
    }

    /**
     * Bulk create cache entries
     */
    async bulkSet(data: BulkCacheRequest): Promise<CacheEntry[]> {
        const response = await this.post<CacheEntry[]>('/cache/bulk', data)
        return this.extractData(response)
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<CacheStats> {
        const response = await this.get<CacheStats>('/cache/stats')
        return this.extractData(response)
    }

    /**
     * Clean expired cache entries
     */
    async cleanExpired(): Promise<{ cleaned: number }> {
        const response = await this.post<{ cleaned: number }>('/cache/clean-expired')
        return this.extractData(response)
    }

    /**
     * Clear all cache entries
     */
    async clearAll(): Promise<{ cleared: number }> {
        const response = await this.delete<{ cleared: number }>('/cache/clear-all')
        return this.extractData(response)
    }

    /**
     * Refresh TTL for a cache entry
     */
    async refreshTTL(key: string, ttl?: number): Promise<CacheEntry> {
        const response = await this.patch<CacheEntry>(`/cache/${encodeURIComponent(key)}/refresh`, {
            ttl,
        })
        return this.extractData(response)
    }

    /**
     * Get cache entries with pagination
     */
    async listEntries(params?: CacheQueryParams): Promise<PaginatedResponse<CacheEntry>> {
        return this.getPaginated<CacheEntry>('/cache', params as Record<string, any>)
    }

    /**
     * Get cache entry details
     */
    async getEntry(key: string): Promise<CacheEntry> {
        const response = await this.get<CacheEntry>(`/cache/${encodeURIComponent(key)}/details`)
        return this.extractData(response)
    }

    /**
     * Get cache size
     */
    async getSize(): Promise<{ size_bytes: number; entry_count: number }> {
        const response = await this.get<{
            size_bytes: number
            entry_count: number
        }>('/cache/size')
        return this.extractData(response)
    }
}

// Export singleton
export const cacheService = new CacheService()
