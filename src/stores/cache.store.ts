import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    CacheEntry,
    CreateCacheEntryRequest,
    UpdateCacheEntryRequest,
    BulkCacheRequest,
    CacheStats,
    CacheQueryParams,
} from '../services/api/CacheService'
import { cacheService } from '../services/api/CacheService'

export const useCacheStore = defineStore('cache', () => {
    // ============================================
    // State
    // ============================================
    const entries = ref<CacheEntry[]>([])
    const selectedEntry = ref<CacheEntry | null>(null)
    const stats = ref<CacheStats | null>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const hasMore = ref(false)

    // ============================================
    // Getters
    // ============================================
    const totalEntries = computed(() => stats.value?.total_entries || 0)
    const activeEntries = computed(() => stats.value?.active_entries || 0)
    const expiredEntries = computed(() => stats.value?.expired_entries || 0)
    const totalHits = computed(() => stats.value?.total_hits || 0)
    const hitRatio = computed(() => stats.value?.cache_hit_ratio || 0)
    const totalSizeBytes = computed(() => stats.value?.total_size_bytes || 0)

    const entriesByTag = computed(() => {
        const grouped: Record<string, CacheEntry[]> = {}
        entries.value.forEach((entry) => {
            if (entry.tags) {
                const tags = entry.tags.split(',').map((t) => t.trim())
                tags.forEach((tag) => {
                    if (!grouped[tag]) grouped[tag] = []
                    grouped[tag].push(entry)
                })
            }
        })
        return grouped
    })

    const activeEntriesList = computed(() =>
        entries.value.filter((e) => !e.expires_at || new Date(e.expires_at) > new Date())
    )

    const expiredEntriesList = computed(() =>
        entries.value.filter((e) => e.expires_at && new Date(e.expires_at) <= new Date())
    )

    // ============================================
    // Actions
    // ============================================

    /**
     * Load cache entries with pagination
     */
    async function loadEntries(params?: CacheQueryParams): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await cacheService.listEntries({
                ...params,
                offset: (currentPage.value - 1) * 20,
                limit: 20,
            })
            entries.value = response.data || []
            hasMore.value = (response.data || []).length === 20
        } catch (err: any) {
            console.error('Failed to load cache entries:', err)
            error.value = err.message || 'Failed to load cache entries'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load cache statistics
     */
    async function loadStats(): Promise<void> {
        try {
            stats.value = await cacheService.getStats()
        } catch (err: any) {
            console.error('Failed to load cache stats:', err)
        }
    }

    /**
     * Get a cached value by key
     */
    async function getValue<T = any>(key: string): Promise<T | null> {
        try {
            return await cacheService.getValue<T>(key)
        } catch (err: any) {
            console.error('Failed to get cache value:', err)
            return null
        }
    }

    /**
     * Set a cached value
     */
    async function setValue(data: CreateCacheEntryRequest): Promise<CacheEntry> {
        isSaving.value = true
        error.value = null

        try {
            const entry = await cacheService.set(data)
            // Add or update in local list
            const index = entries.value.findIndex((e) => e.key === data.key)
            if (index !== -1) {
                entries.value[index] = entry
            } else {
                entries.value.unshift(entry)
            }
            await loadStats()
            return entry
        } catch (err: any) {
            console.error('Failed to set cache value:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to set cache value'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Update a cached value
     */
    async function updateValue(key: string, data: UpdateCacheEntryRequest): Promise<CacheEntry> {
        isSaving.value = true
        error.value = null

        try {
            const entry = await cacheService.update(key, data)
            updateLocalEntry(key, entry)
            return entry
        } catch (err: any) {
            console.error('Failed to update cache value:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to update cache value'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Delete a cache entry
     */
    async function deleteEntry(key: string): Promise<void> {
        isSaving.value = true
        error.value = null

        try {
            await cacheService.deleteEntry(key)
            entries.value = entries.value.filter((e) => e.key !== key)
            if (selectedEntry.value?.key === key) {
                selectedEntry.value = null
            }
            await loadStats()
        } catch (err: any) {
            console.error('Failed to delete cache entry:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to delete cache entry'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Delete entries by tags
     */
    async function deleteByTags(tags: string): Promise<number> {
        isSaving.value = true
        error.value = null

        try {
            const result = await cacheService.deleteByTags(tags)
            await loadEntries()
            await loadStats()
            return result.deleted
        } catch (err: any) {
            console.error('Failed to delete by tags:', err)
            error.value = err.message || 'Failed to delete by tags'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Get or set a cached value
     */
    async function getOrSet<T = any>(key: string, fallbackValue: T, ttl?: number): Promise<T> {
        try {
            return await cacheService.getOrSet<T>(key, fallbackValue, ttl)
        } catch (err: any) {
            console.error('Failed to get or set cache:', err)
            return fallbackValue
        }
    }

    /**
     * Check if a key exists in cache
     */
    async function exists(key: string): Promise<boolean> {
        try {
            return await cacheService.exists(key)
        } catch {
            return false
        }
    }

    /**
     * Load a single cache entry details
     */
    async function loadEntry(key: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            selectedEntry.value = await cacheService.getEntry(key)
        } catch (err: any) {
            error.value = err.message || 'Failed to load entry'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Refresh TTL for a cache entry
     */
    async function refreshTTL(key: string, ttl?: number): Promise<CacheEntry> {
        isSaving.value = true
        error.value = null

        try {
            const entry = await cacheService.refreshTTL(key, ttl)
            updateLocalEntry(key, entry)
            return entry
        } catch (err: any) {
            error.value = err.message || 'Failed to refresh TTL'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Bulk set cache entries
     */
    async function bulkSet(data: BulkCacheRequest): Promise<CacheEntry[]> {
        isSaving.value = true
        error.value = null

        try {
            const newEntries = await cacheService.bulkSet(data)
            await loadEntries()
            await loadStats()
            return newEntries
        } catch (err: any) {
            error.value = err.message || 'Failed to bulk set cache'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Clean expired cache entries
     */
    async function cleanExpired(): Promise<number> {
        isSaving.value = true
        error.value = null

        try {
            const result = await cacheService.cleanExpired()
            await loadEntries()
            await loadStats()
            return result.cleaned
        } catch (err: any) {
            error.value = err.message || 'Failed to clean expired entries'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Clear all cache entries
     */
    async function clearAll(): Promise<number> {
        isSaving.value = true
        error.value = null

        try {
            const result = await cacheService.clearAll()
            entries.value = []
            selectedEntry.value = null
            await loadStats()
            return result.cleared
        } catch (err: any) {
            error.value = err.message || 'Failed to clear cache'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Get total cache size
     */
    async function getSize(): Promise<{
        size_bytes: number
        entry_count: number
    }> {
        try {
            return await cacheService.getSize()
        } catch (err: any) {
            console.error('Failed to get cache size:', err)
            return { size_bytes: 0, entry_count: 0 }
        }
    }

    /**
     * Load more entries (pagination)
     */
    async function loadMore(): Promise<void> {
        if (!hasMore.value || isLoading.value) return
        currentPage.value++
        await loadEntries()
    }

    /**
     * Clear selected entry
     */
    function clearSelection(): void {
        selectedEntry.value = null
    }

    /**
     * Clear all cache store data
     */
    function clearAllData(): void {
        entries.value = []
        selectedEntry.value = null
        stats.value = null
        error.value = null
        currentPage.value = 1
        hasMore.value = false
    }

    // ============================================
    // Private Helpers
    // ============================================

    /**
     * Update a cache entry in the local list and selected entry
     */
    function updateLocalEntry(key: string, entry: CacheEntry): void {
        const index = entries.value.findIndex((e) => e.key === key)
        if (index !== -1) {
            entries.value[index] = entry
        }
        if (selectedEntry.value?.key === key) {
            selectedEntry.value = entry
        }
    }

    return {
        // State
        entries,
        selectedEntry,
        stats,
        isLoading,
        isSaving,
        error,
        currentPage,
        hasMore,
        // Getters
        totalEntries,
        activeEntries,
        expiredEntries,
        totalHits,
        hitRatio,
        totalSizeBytes,
        entriesByTag,
        activeEntriesList,
        expiredEntriesList,
        // Actions
        loadEntries,
        loadStats,
        getValue,
        setValue,
        updateValue,
        deleteEntry,
        deleteByTags,
        getOrSet,
        exists,
        loadEntry,
        refreshTTL,
        bulkSet,
        cleanExpired,
        clearAll,
        getSize,
        loadMore,
        clearSelection,
        clearAllData,
    }
})
