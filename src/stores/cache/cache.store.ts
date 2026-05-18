import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from './../../services/db'
import type { CacheEntry, CacheStats } from './../../models/entities'
import { cacheService } from './../../services/api'
import { CacheRepository } from './../../services/db/repositories'

/**
 * Cache Store
 * Manages both local (IndexedDB) and remote cache operations
 */
export const useCacheStore = defineStore('cache', () => {
    // ============================================
    // State
    // ============================================
    const localCache = ref<Map<string, CacheEntry>>(new Map())
    const stats = ref<CacheStats | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isInitialized = ref(false)

    // Repository reference
    let repository: CacheRepository | null = null

    // ============================================
    // Getters
    // ============================================
    const totalEntries = computed(() => stats.value?.total_entries || 0)
    const cacheHitRatio = computed(() => stats.value?.cache_hit_ratio || 0)
    const totalSizeMB = computed(() => {
        const bytes = stats.value?.total_size_bytes || 0
        return (bytes / (1024 * 1024)).toFixed(2)
    })
    const needsCleanup = computed(() => {
        const ratio = cacheHitRatio.value
        return ratio < 0.5 // Hit ratio below 50%
    })
    const isCacheHealthy = computed(() => {
        return cacheHitRatio.value > 0.6 && totalEntries.value > 0
    })

    // ============================================
    // Actions - Initialization
    // ============================================

    /**
     * Initialize cache store
     */
    async function initialize(): Promise<void> {
        if (isInitialized.value) return

        isLoading.value = true

        try {
            // Initialize local repository
            repository = new CacheRepository(db.cache)

            // Load initial stats
            await refreshStats()

            // Clean up expired entries on startup
            await clearExpiredLocal()

            isInitialized.value = true
        } catch (err: any) {
            console.error('Failed to initialize cache store:', err)
            error.value = err.message || 'Failed to initialize cache'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Refresh cache statistics from local storage
     */
    async function refreshStats(): Promise<void> {
        try {
            if (repository) {
                stats.value = await repository.getStats()
            }
        } catch (err: any) {
            console.error('Failed to refresh cache stats:', err)
            error.value = err.message || 'Failed to refresh stats'
        }
    }

    /**
     * Refresh cache statistics from remote server
     */
    async function refreshStatsFromServer(): Promise<void> {
        try {
            const serverStats = await cacheService.getStats()
            stats.value = serverStats
        } catch (err: any) {
            console.error('Failed to refresh stats from server:', err)
            error.value = err.message || 'Failed to refresh stats from server'
        }
    }

    // ============================================
    // Actions - Local Cache Operations
    // ============================================

    /**
     * Get value from local cache
     */
    async function getLocal<T = any>(key: string): Promise<T | undefined> {
        if (!repository) return undefined

        try {
            const entry = await repository.get(key)
            if (!entry) return undefined

            localCache.value.set(key, entry)
            return JSON.parse(entry.value) as T
        } catch (err: any) {
            console.error(`Failed to get local cache key ${key}:`, err)
            return undefined
        }
    }

    /**
     * Set value in local cache
     */
    async function setLocal<T = any>(
        key: string,
        value: T,
        ttl?: number,
        tags?: string
    ): Promise<void> {
        if (!repository) return

        try {
            const entry = await repository.set(key, value, ttl, tags)
            localCache.value.set(key, entry)
            await refreshStats()
        } catch (err: any) {
            console.error(`Failed to set local cache key ${key}:`, err)
            error.value = err.message || 'Failed to set cache'
        }
    }

    /**
     * Delete from local cache
     */
    async function deleteLocal(key: string): Promise<void> {
        if (!repository) return

        try {
            await repository.delete(key)
            localCache.value.delete(key)
            await refreshStats()
        } catch (err: any) {
            console.error(`Failed to delete local cache key ${key}:`, err)
            error.value = err.message || 'Failed to delete cache'
        }
    }

    /**
     * Clear local cache
     */
    async function clearLocal(): Promise<void> {
        if (!repository) return

        try {
            await repository.clearAll()
            localCache.value.clear()
            await refreshStats()
        } catch (err: any) {
            console.error('Failed to clear local cache:', err)
            error.value = err.message || 'Failed to clear cache'
        }
    }

    /**
     * Clear expired entries from local cache
     */
    async function clearExpiredLocal(): Promise<number> {
        if (!repository) return 0

        try {
            const count = await repository.clearExpired()
            await refreshStats()
            return count
        } catch (err: any) {
            console.error('Failed to clear expired cache:', err)
            error.value = err.message || 'Failed to clear expired cache'
            return 0
        }
    }

    /**
     * Clear local cache by tags
     */
    async function clearByTagsLocal(tags: string | string[]): Promise<number> {
        if (!repository) return 0

        try {
            const count = await repository.clearByTags(tags)
            await refreshStats()
            return count
        } catch (err: any) {
            console.error('Failed to clear cache by tags:', err)
            error.value = err.message || 'Failed to clear cache by tags'
            return 0
        }
    }

    /**
     * Clear local cache by pattern
     */
    async function clearByPatternLocal(pattern: string): Promise<number> {
        if (!repository) return 0

        try {
            const count = await repository.clearByPattern(pattern)
            await refreshStats()
            return count
        } catch (err: any) {
            console.error('Failed to clear cache by pattern:', err)
            error.value = err.message || 'Failed to clear cache by pattern'
            return 0
        }
    }

    /**
     * Check if local cache has key
     */
    async function hasLocal(key: string): Promise<boolean> {
        if (!repository) return false
        return repository.has(key)
    }

    /**
     * Get multiple local cache values
     */
    async function getManyLocal<T = any>(keys: string[]): Promise<Map<string, T>> {
        if (!repository) return new Map()

        try {
            return await repository.getMany<T>(keys)
        } catch (err: any) {
            console.error('Failed to get many local cache keys:', err)
            return new Map()
        }
    }

    /**
     * Set multiple local cache values
     */
    async function setManyLocal(
        entries: Array<{ key: string; value: any; ttl?: number; tags?: string }>
    ): Promise<void> {
        if (!repository) return

        try {
            await repository.setMany(entries)
            await refreshStats()
        } catch (err: any) {
            console.error('Failed to set many local cache entries:', err)
            error.value = err.message || 'Failed to set many cache entries'
        }
    }

    // ============================================
    // Actions - Remote Cache Operations
    // ============================================

    /**
     * Get value from remote cache
     */
    async function getRemote<T = any>(key: string): Promise<T | undefined> {
        try {
            return await cacheService.getValue<T>(key)
        } catch (err: any) {
            console.error(`Failed to get remote cache key ${key}:`, err)
            error.value = err.message || 'Failed to get remote cache'
            return undefined
        }
    }

    /**
     * Set value in remote cache
     */
    async function setRemote<T = any>(
        key: string,
        value: T,
        ttl?: number,
        tags?: string[]
    ): Promise<void> {
        try {
            await cacheService.setEntry(key, value, ttl, tags)
            await refreshStatsFromServer()
        } catch (err: any) {
            console.error(`Failed to set remote cache key ${key}:`, err)
            error.value = err.message || 'Failed to set remote cache'
        }
    }

    /**
     * Delete from remote cache
     */
    async function deleteRemote(key: string): Promise<void> {
        try {
            await cacheService.deleteEntry(key)
            await refreshStatsFromServer()
        } catch (err: any) {
            console.error(`Failed to delete remote cache key ${key}:`, err)
            error.value = err.message || 'Failed to delete remote cache'
        }
    }

    /**
     * Clear remote cache
     */
    async function clearRemote(): Promise<void> {
        try {
            await cacheService.clearAll()
            await refreshStatsFromServer()
        } catch (err: any) {
            console.error('Failed to clear remote cache:', err)
            error.value = err.message || 'Failed to clear remote cache'
        }
    }

    /**
     * Clear remote cache by tags
     */
    async function clearByTagsRemote(tags: string[]): Promise<number> {
        try {
            const result = await cacheService.clearByTags(tags)
            await refreshStatsFromServer()
            return result.cleared
        } catch (err: any) {
            console.error('Failed to clear remote cache by tags:', err)
            error.value = err.message || 'Failed to clear remote cache by tags'
            return 0
        }
    }

    // ============================================
    // Actions - Hybrid Cache Operations
    // ============================================

    /**
     * Get from cache (local first, fallback to remote)
     */
    async function get<T = any>(
        key: string,
        options?: { remoteFirst?: boolean; ttl?: number }
    ): Promise<T | undefined> {
        const { remoteFirst = false, ttl } = options || {}

        if (remoteFirst) {
            // Try remote first
            const remoteValue = await getRemote<T>(key)
            if (remoteValue !== undefined) {
                // Cache in local for future use
                await setLocal(key, remoteValue, ttl)
                return remoteValue
            }
        }

        // Try local
        const localValue = await getLocal<T>(key)
        if (localValue !== undefined) {
            return localValue
        }

        // Try remote as fallback
        if (!remoteFirst) {
            const remoteValue = await getRemote<T>(key)
            if (remoteValue !== undefined) {
                await setLocal(key, remoteValue, ttl)
                return remoteValue
            }
        }

        return undefined
    }

    /**
     * Set in both local and remote cache
     */
    async function set<T = any>(
        key: string,
        value: T,
        options?: { ttl?: number; tags?: string | string[]; remoteOnly?: boolean; localOnly?: boolean }
    ): Promise<void> {
        const { ttl, tags, remoteOnly = false, localOnly = false } = options || {}

        const promises: Promise<void>[] = []

        if (!remoteOnly) {
            const tagString = Array.isArray(tags) ? tags.join(',') : tags
            promises.push(setLocal(key, value, ttl, tagString))
        }

        if (!localOnly) {
            const tagArray = Array.isArray(tags) ? tags : tags ? [tags] : undefined
            promises.push(setRemote(key, value, ttl, tagArray))
        }

        await Promise.all(promises)
    }

    /**
     * Delete from both local and remote cache
     */
    async function deleteCache(
        key: string,
        options?: { localOnly?: boolean; remoteOnly?: boolean }
    ): Promise<void> {
        const { localOnly = false, remoteOnly = false } = options || {}

        const promises: Promise<void>[] = []

        if (!remoteOnly) {
            promises.push(deleteLocal(key))
        }

        if (!localOnly) {
            promises.push(deleteRemote(key))
        }

        await Promise.all(promises)
    }

    /**
     * Clear all cache (both local and remote)
     */
    async function clearCache(options?: {
        localOnly?: boolean
        remoteOnly?: boolean
    }): Promise<void> {
        const { localOnly = false, remoteOnly = false } = options || {}

        const promises: Promise<void>[] = []

        if (!remoteOnly) {
            promises.push(clearLocal())
        }

        if (!localOnly) {
            promises.push(clearRemote())
        }

        await Promise.all(promises)
    }

    /**
     * Remember pattern (get or compute)
     */
    async function remember<T = any>(
        key: string,
        factory: () => Promise<T>,
        options?: {
            ttl?: number
            tags?: string | string[]
            remoteFirst?: boolean
            forceRefresh?: boolean
        }
    ): Promise<T> {
        const { ttl, tags, remoteFirst = false, forceRefresh = false } = options || {}

        // If force refresh, skip cache and compute new value
        if (!forceRefresh) {
            // Try to get from cache
            const cached = await get<T>(key, { remoteFirst, ttl } as any)
            if (cached !== undefined) {
                return cached
            }
        }

        // Compute value
        const value = await factory()

        // Store in cache
        await set(key, value, { ttl, tags } as any)

        return value
    }

    /**
     * Invalidate cache entries by pattern
     */
    async function invalidate(
        pattern: string,
        options?: { localOnly?: boolean; remoteOnly?: boolean }
    ): Promise<number> {
        const { localOnly = false, remoteOnly = false } = options || {}

        let count = 0

        if (!remoteOnly && repository) {
            count += await clearByPatternLocal(pattern)
        }

        if (!localOnly) {
            // For remote, we need to use tags or specific keys
            // This is a simplified approach - you might want to implement a more sophisticated pattern matching
            const keys = await cacheService.getKeys(pattern)
            for (const key of keys) {
                await deleteRemote(key)
                count++
            }
        }

        return count
    }

    // ============================================
    // Actions - Utility
    // ============================================

    /**
     * Perform cache maintenance
     */
    async function maintain(): Promise<{ cleared: number; stats: CacheStats }> {
        isLoading.value = true

        try {
            const cleared = await clearExpiredLocal()
            await refreshStats()

            return {
                cleared,
                stats: stats.value!,
            }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Warm up cache with common keys
     */
    async function warmUp(keys: string[]): Promise<{ warmed: number; failed: number }> {
        isLoading.value = true

        try {
            const result = await cacheService.warmUp(keys)
            await refreshStatsFromServer()
            return result
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Preload frequently used data into cache
     */
    async function preload(
        entries: Array<{ key: string; factory: () => Promise<any>; ttl?: number; tags?: string }>
    ): Promise<void> {
        isLoading.value = true

        try {
            await Promise.all(
                entries.map(async (entry) => {
                    const value = await entry.factory()
                    await set(entry.key, value, { ttl: entry.ttl, tags: entry.tags } as any)
                })
            )
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get cache entry metadata
     */
    async function getMetadata(key: string): Promise<{
        exists: boolean
        expiresAt?: string
        hitCount?: number
        sizeBytes?: number
    } | null> {
        if (!repository) return null

        try {
            const entry = await repository.get(key)
            if (!entry) return { exists: false }

            return {
                exists: true,
                expiresAt: entry.expires_at || undefined,
                hitCount: entry.hit_count,
                sizeBytes: entry.size_bytes,
            } as any
        } catch (err: any) {
            console.error(`Failed to get metadata for key ${key}:`, err)
            return null
        }
    }

    /**
     * Reset store state
     */
    function reset(): void {
        localCache.value.clear()
        stats.value = null
        error.value = null
        isInitialized.value = false
        isLoading.value = false
        repository = null
    }

    return {
        // State
        localCache,
        stats,
        isLoading,
        error,
        isInitialized,

        // Getters
        totalEntries,
        cacheHitRatio,
        totalSizeMB,
        needsCleanup,
        isCacheHealthy,

        // Initialization
        initialize,
        refreshStats,
        refreshStatsFromServer,

        // Local operations
        getLocal,
        setLocal,
        deleteLocal,
        clearLocal,
        clearExpiredLocal,
        clearByTagsLocal,
        clearByPatternLocal,
        hasLocal,
        getManyLocal,
        setManyLocal,

        // Remote operations
        getRemote,
        setRemote,
        deleteRemote,
        clearRemote,
        clearByTagsRemote,

        // Hybrid operations
        get,
        set,
        delete: deleteCache,
        clear: clearCache,
        remember,
        invalidate,

        // Utility
        maintain,
        warmUp,
        preload,
        getMetadata,
        reset,
    }
})
