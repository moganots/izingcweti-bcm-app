import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCacheStore } from '../stores/cache/cache.store'
import type {
    CacheEntry,
    CacheStats,
    CacheQueryParams,
} from './../models/entities/cache/cache.entity'

export interface UseCacheOptions {
    autoInitialize?: boolean
    defaultTTL?: number
    namespace?: string
}

/**
 * Composable for cache functionality
 * Provides reactive cache state and operations
 */
export function useCache(options: UseCacheOptions = {}) {
    const { autoInitialize = true, defaultTTL = 3600, namespace = '' } = options

    const cacheStore = useCacheStore()

    // Store refs for reactivity
    const {
        entries,
        stats,
        isLoading,
        isSaving,
        error,
        isInitialized,
        lastSyncAt,
        totalEntries,
        activeEntries,
        expiredEntries,
        cacheHitRatio,
        totalSizeMB,
        totalSizeKB,
        needsCleanup,
        isCacheHealthy,
        cacheEfficiency,
        hasEntries,
        isEmpty,
    } = storeToRefs(cacheStore)

    // Store actions
    const {
        initialize,
        refreshStats,
        sync,
        getEntry,
        getValue,
        setEntry,
        setValue,
        updateEntry,
        deleteEntry,
        deleteByTags,
        clearAll,
        cleanExpired,
        query,
        search,
        remember,
        getMany,
        setMany,
        hasKey,
        getMetadata,
        maintain,
        warmUp,
        reset,
    } = cacheStore

    // Local state
    const isReady = ref(false)

    // ============================================
    // Computed - Namespaced Helpers
    // ============================================

    function getNamespacedKey(key: string): string {
        return namespace ? `${namespace}:${key}` : key
    }

    // ============================================
    // Actions - Namespaced Wrappers
    // ============================================

    /**
     * Get value with namespace
     */
    async function getValueNS<T = any>(key: string): Promise<T | null> {
        return getValue<T>(getNamespacedKey(key))
    }

    /**
     * Set value with namespace
     */
    async function setValueNS<T = any>(
        key: string,
        value: T,
        ttl?: number,
        tags?: string
    ): Promise<CacheEntry> {
        return setValue(getNamespacedKey(key), value, ttl || defaultTTL, tags)
    }

    /**
     * Delete entry with namespace
     */
    async function deleteEntryNS(key: string): Promise<void> {
        return deleteEntry(getNamespacedKey(key))
    }

    /**
     * Check if key exists with namespace
     */
    async function hasKeyNS(key: string): Promise<boolean> {
        return hasKey(getNamespacedKey(key))
    }

    /**
     * Remember with namespace
     */
    async function rememberNS<T = any>(
        key: string,
        factory: () => Promise<T>,
        options?: {
            ttl?: number
            tags?: string
            forceRefresh?: boolean
        }
    ): Promise<T> {
        const namespacedKey = getNamespacedKey(key)
        const ttl = options?.ttl || defaultTTL
        return remember<T>(namespacedKey, factory, { ...options, ttl })
    }

    /**
     * Get entry with namespace
     */
    async function getEntryNS(key: string): Promise<CacheEntry | null> {
        return getEntry(getNamespacedKey(key))
    }

    // ============================================
    // Actions - Extended Utility
    // ============================================

    /**
     * Get or compute multiple values
     */
    async function getOrCompute<T = any>(
        keyMap: Record<string, () => Promise<T>>,
        options?: { ttl?: number; tags?: string }
    ): Promise<Record<string, T>> {
        const result: Record<string, T> = {}
        const missingKeys: string[] = []

        // Check cache first
        for (const key of Object.keys(keyMap)) {
            const value = await getValueNS<T>(key)
            if (value !== null) {
                result[key] = value
            } else {
                missingKeys.push(key)
            }
        }

        // Compute missing values
        for (const key of missingKeys) {
            const factory = keyMap[key]
            if (!factory) continue

            const value = await factory()
            await setValueNS(key, value, options?.ttl, options?.tags)
            result[key] = value
        }

        return result
    }

    /**
     * Invalidate cache entries by pattern
     */
    async function invalidate(pattern: string): Promise<number> {
        const results = await search(pattern)
        let count = 0
        for (const entry of results) {
            await deleteEntry(entry.key)
            count++
        }
        return count
    }

    /**
     * Get cache status summary
     */
    const status = computed(() => ({
        initialized: isInitialized.value,
        totalEntries: totalEntries.value,
        activeEntries: activeEntries.value,
        expiredEntries: expiredEntries.value,
        hitRatio: cacheHitRatio.value,
        sizeMB: totalSizeMB.value,
        isHealthy: isCacheHealthy.value,
        efficiency: cacheEfficiency.value,
        needsCleanup: needsCleanup.value,
    }))

    /**
     * Get cache statistics
     */
    async function getStats(): Promise<CacheStats | null> {
        await refreshStats()
        return stats.value
    }

    /**
     * Get all entries as array (for component compatibility)
     */
    async function getEntriesArray(params?: { offset?: number; limit?: number }): Promise<CacheEntry[]> {
        const results = await query(params as CacheQueryParams)
        return results
    }

    /**
     * Refresh a cache entry (touch to extend TTL)
     */
    async function refreshEntry(key: string): Promise<CacheEntry | null> {
        const namespacedKey = getNamespacedKey(key)
        const entry = await getEntry(namespacedKey)
        if (entry) {
            // Update the entry to refresh TTL
            // This would need a store method to touch/refresh
            // For now, we'll just return the existing entry
            return entry
        }
        return null
    }

    /**
     * Set cache enabled/disabled
     */
    function setEnabled(_enabled: boolean): void {
        // This would need a store method - for now just a local setting
        // The store would need to handle this
        console.warn('setEnabled not fully implemented in store')
    }

    /**
     * Set default TTL
     */
    function setDefaultTTL(_ttl: number): void {
        // This would need a store method
        console.warn('setDefaultTTL not fully implemented in store')
    }

    /**
     * Set max size
     */
    function setMaxSize(_sizeMB: number): void {
        // This would need a store method
        console.warn('setMaxSize not fully implemented in store')
    }

    /**
     * Set eviction policy
     */
    function setEvictionPolicy(_policy: string): void {
        // This would need a store method
        console.warn('setEvictionPolicy not fully implemented in store')
    }

    /**
     * Set compression
     */
    function setCompression(_compressed: boolean): void {
        // This would need a store method
        console.warn('setCompression not fully implemented in store')
    }

    // ============================================
    // Lifecycle
    // ============================================

    onMounted(async () => {
        if (autoInitialize) {
            await initialize()
            isReady.value = true
        }
    })

    // ============================================
    // Return API
    // ============================================

    return {
        // State
        entries,
        stats,
        isLoading,
        isSaving,
        error,
        isInitialized,
        lastSyncAt,
        isReady,

        // Getters
        totalEntries,
        activeEntries,
        expiredEntries,
        cacheHitRatio,
        totalSizeMB,
        totalSizeKB,
        needsCleanup,
        isCacheHealthy,
        cacheEfficiency,
        hasEntries,
        isEmpty,
        status,

        // Initialization
        initialize,
        refreshStats,
        sync,

        // CRUD Operations (raw)
        getEntry,
        getValue,
        setEntry,
        setValue,
        updateEntry,
        deleteEntry,
        deleteByTags,
        clearAll,
        cleanExpired,

        // CRUD Operations (namespaced)
        getEntryNS,
        getValueNS,
        setValueNS,
        deleteEntryNS,
        hasKeyNS,
        rememberNS,

        // Query & Search
        query,
        search,
        hasKey,
        getMetadata,

        // Utility
        remember,
        getMany,
        setMany,
        getOrCompute,
        invalidate,
        maintain,
        warmUp,

        // Additional methods for component compatibility
        getStats,
        getEntries: getEntriesArray,
        refreshEntry,
        setEnabled,
        setDefaultTTL,
        setMaxSize,
        setEvictionPolicy,
        setCompression,

        // Reset
        reset,

        // Helpers
        getNamespacedKey,
    }
}

export default useCache