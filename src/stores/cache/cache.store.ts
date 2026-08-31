import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cacheService } from './../../services/api/cache/CacheService'
import type {
  CacheEntry,
  CacheStats,
  CreateCacheRequest,
  UpdateCacheRequest,
  BulkCacheRequest,
  CacheQueryParams,
  CacheEntryMetadata,
  CacheCleanupResult,
} from './../../models/entities/cache/cache.entity'

/**
 * Cache Store - Hybrid cache manager (local + remote)
 */
export const useCacheStore = defineStore('cache', () => {
  // ============================================
  // State
  // ============================================
  const entries = ref<Map<string, CacheEntry>>(new Map())
  const stats = ref<CacheStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const lastSyncAt = ref<string | null>(null)

  // ============================================
  // Getters
  // ============================================

  const totalEntries = computed(() => stats.value?.totalEntries || 0)
  const activeEntries = computed(() => stats.value?.activeEntries || 0)
  const expiredEntries = computed(() => stats.value?.expiredEntries || 0)
  const cacheHitRatio = computed(() => stats.value?.cacheHitRatio || 0)
  const totalSizeMB = computed(() => {
    const bytes = stats.value?.totalSizeBytes || 0
    return parseFloat((bytes / (1024 * 1024)).toFixed(2))
  })
  const totalSizeKB = computed(() => {
    const bytes = stats.value?.totalSizeBytes || 0
    return parseFloat((bytes / 1024).toFixed(2))
  })

  const needsCleanup = computed(() => {
    const ratio = cacheHitRatio.value
    return ratio < 0.5 || expiredEntries.value > totalEntries.value * 0.2
  })

  const isCacheHealthy = computed(() => {
    return cacheHitRatio.value > 0.6 && totalEntries.value > 0
  })

  const cacheEfficiency = computed(() => {
    const ratio = cacheHitRatio.value
    if (ratio >= 0.9) return { label: 'Excellent', color: 'positive', icon: 'check_circle' }
    if (ratio >= 0.7) return { label: 'Good', color: 'info', icon: 'info' }
    if (ratio >= 0.5) return { label: 'Fair', color: 'warning', icon: 'warning' }
    return { label: 'Poor', color: 'negative', icon: 'error' }
  })

  const hasEntries = computed(() => entries.value.size > 0)
  const isEmpty = computed(() => entries.value.size === 0 && !isLoading.value)

  // ============================================
  // Actions - Initialization
  // ============================================

  /**
   * Initialize cache store
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      await refreshStats()
      isInitialized.value = true
    } catch (err: any) {
      console.error('Failed to initialize cache store:', err)
      error.value = err.message || 'Failed to initialize cache'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh cache statistics from server
   */
  async function refreshStats(): Promise<void> {
    try {
      stats.value = await cacheService.getStats()
    } catch (err: any) {
      console.error('Failed to refresh cache stats:', err)
      error.value = err.message || 'Failed to refresh stats'
    }
  }

  /**
   * Sync local state with server
   */
  async function sync(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await refreshStats()
      lastSyncAt.value = new Date().toISOString()
    } catch (err: any) {
      error.value = err.message || 'Failed to sync cache'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - CRUD Operations
  // ============================================

  /**
   * Get cache entry by key
   */
  async function getEntry(key: string): Promise<CacheEntry | null> {
    try {
      // Check local cache first
      if (entries.value.has(key)) {
        const entry = entries.value.get(key)!
        // Check if expired
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
          entries.value.delete(key)
          await deleteEntry(key)
          return null
        }
        return entry
      }

      // Fetch from server
      const entry = await cacheService.getEntry(key)
      if (entry) {
        entries.value.set(key, entry)
      }
      return entry
    } catch (err: any) {
      console.error(`Failed to get cache entry for key ${key}:`, err)
      error.value = err.message || 'Failed to get cache entry'
      return null
    }
  }

  /**
   * Get cache value by key
   */
  async function getValue<T = any>(key: string): Promise<T | null> {
    const entry = await getEntry(key)
    return entry ? (entry.value as T) : null
  }

  /**
   * Set cache entry
   */
  async function setEntry(data: CreateCacheRequest): Promise<CacheEntry> {
    isSaving.value = true
    error.value = null

    try {
      const entry = await cacheService.setEntry(data)
      entries.value.set(entry.key, entry)
      await refreshStats()
      return entry
    } catch (err: any) {
      console.error(`Failed to set cache entry for key ${data.key}:`, err)
      error.value = err.message || 'Failed to set cache entry'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Set cache value (convenience method)
   */
  async function setValue<T = any>(
    key: string,
    value: T,
    ttl?: number,
    tags?: string
  ): Promise<CacheEntry> {
    return setEntry({ key, value, ttl, tags })
  }

  /**
   * Update cache entry
   */
  async function updateEntry(key: string, data: UpdateCacheRequest): Promise<CacheEntry> {
    isSaving.value = true
    error.value = null

    try {
      const entry = await cacheService.updateEntry(key, data)
      entries.value.set(key, entry)
      await refreshStats()
      return entry
    } catch (err: any) {
      console.error(`Failed to update cache entry for key ${key}:`, err)
      error.value = err.message || 'Failed to update cache entry'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete cache entry
   */
  async function deleteEntry(key: string): Promise<void> {
    try {
      await cacheService.deleteEntry(key)
      entries.value.delete(key)
      await refreshStats()
    } catch (err: any) {
      console.error(`Failed to delete cache entry for key ${key}:`, err)
      error.value = err.message || 'Failed to delete cache entry'
      throw err
    }
  }

  /**
   * Delete cache entries by tags
   */
  async function deleteByTags(tags: string): Promise<number> {
    try {
      const result = await cacheService.deleteByTags(tags)
      // Remove entries from local cache
      const keysToRemove: string[] = []
      entries.value.forEach((entry, key) => {
        if (entry.tags && entry.tags.includes(tags)) {
          keysToRemove.push(key)
        }
      })
      keysToRemove.forEach((key) => entries.value.delete(key))

      await refreshStats()
      return result.count
    } catch (err: any) {
      console.error(`Failed to delete cache entries by tags ${tags}:`, err)
      error.value = err.message || 'Failed to delete cache entries'
      throw err
    }
  }

  /**
   * Clear all cache entries
   */
  async function clearAll(): Promise<number> {
    try {
      const result = await cacheService.clearAll()
      entries.value.clear()
      await refreshStats()
      return result.count
    } catch (err: any) {
      console.error('Failed to clear cache:', err)
      error.value = err.message || 'Failed to clear cache'
      throw err
    }
  }

  /**
   * Clean expired cache entries
   */
  async function cleanExpired(): Promise<number> {
    try {
      const result = await cacheService.cleanExpired()
      // Remove expired entries from local cache
      const keysToRemove: string[] = []
      entries.value.forEach((entry, key) => {
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
          keysToRemove.push(key)
        }
      })
      keysToRemove.forEach((key) => entries.value.delete(key))

      await refreshStats()
      return result.count
    } catch (err: any) {
      console.error('Failed to clean expired cache:', err)
      error.value = err.message || 'Failed to clean expired cache'
      throw err
    }
  }

  // ============================================
  // Actions - Query & Search
  // ============================================

  /**
   * Query cache entries
   */
  async function query(params?: CacheQueryParams): Promise<CacheEntry[]> {
    isLoading.value = true
    error.value = null

    try {
      const response = await cacheService.query(params)
      // Update local cache with results
      response.data.forEach((entry) => {
        entries.value.set(entry.key, entry)
      })
      return response.data
    } catch (err: any) {
      console.error('Failed to query cache:', err)
      error.value = err.message || 'Failed to query cache'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search cache by pattern
   */
  async function search(pattern: string): Promise<CacheEntry[]> {
    try {
      const results = await cacheService.getByPattern(pattern)
      results.forEach((entry) => {
        entries.value.set(entry.key, entry)
      })
      return results
    } catch (err: any) {
      console.error(`Failed to search cache with pattern ${pattern}:`, err)
      error.value = err.message || 'Failed to search cache'
      return []
    }
  }

  // ============================================
  // Actions - Utility
  // ============================================

  /**
   * Remember pattern (get or compute)
   */
  async function remember<T = any>(
    key: string,
    factory: () => Promise<T>,
    options?: {
      ttl?: number
      tags?: string
      forceRefresh?: boolean
    }
  ): Promise<T> {
    const { ttl, tags, forceRefresh = false } = options || {}

    // If force refresh, skip cache and compute new value
    if (!forceRefresh) {
      // Try to get from cache
      const cached = await getValue<T>(key)
      if (cached !== null) {
        return cached
      }
    }

    // Compute value
    const value = await factory()

    // Store in cache
    await setValue(key, value, ttl, tags)

    return value
  }

  /**
   * Get multiple cache entries
   */
  async function getMany<T = any>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>()

    for (const key of keys) {
      const value = await getValue<T>(key)
      if (value !== null) {
        result.set(key, value)
      }
    }

    return result
  }

  /**
   * Set multiple cache entries
   */
  async function setMany(entries: Array<{ key: string; value: any; ttl?: number; tags?: string }>): Promise<CacheEntry[]> {
    const items = entries.map((e) => ({
      key: e.key,
      value: e.value,
      ttl: e.ttl,
      tags: e.tags,
    }))

    const results = await cacheService.setMany({ items })
    results.forEach((entry) => {
      entries.value.set(entry.key, entry)
    })
    await refreshStats()
    return results
  }

  /**
   * Check if cache key exists
   */
  async function hasKey(key: string): Promise<boolean> {
    // Check local first
    if (entries.value.has(key)) {
      const entry = entries.value.get(key)!
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        entries.value.delete(key)
        return false
      }
      return true
    }

    // Check server
    return cacheService.exists(key)
  }

  /**
   * Get cache entry metadata
   */
  async function getMetadata(key: string): Promise<CacheEntryMetadata | null> {
    const entry = await getEntry(key)
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

  /**
   * Perform cache maintenance
   */
  async function maintain(): Promise<CacheCleanupResult> {
    isLoading.value = true
    error.value = null

    try {
      const cleaned = await cleanExpired()
      await refreshStats()

      return {
        cleaned,
        freedBytes: 0, // Will be calculated from stats
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to maintain cache'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Warm up cache with common keys
   */
  async function warmUp(keys: string[]): Promise<{ warmed: number; failed: number }> {
    isLoading.value = true
    error.value = null

    try {
      const result = await cacheService.warmUp(keys)
      await refreshStats()
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to warm up cache'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - Reset
  // ============================================

  /**
   * Reset store state
   */
  function reset(): void {
    entries.value.clear()
    stats.value = null
    error.value = null
    isInitialized.value = false
    isLoading.value = false
    isSaving.value = false
    lastSyncAt.value = null
  }

  return {
    // State
    entries,
    stats,
    isLoading,
    isSaving,
    error,
    isInitialized,
    lastSyncAt,

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

    // Initialization
    initialize,
    refreshStats,
    sync,

    // CRUD Operations
    getEntry,
    getValue,
    setEntry,
    setValue,
    updateEntry,
    deleteEntry,
    deleteByTags,
    clearAll,
    cleanExpired,

    // Query & Search
    query,
    search,

    // Utility
    remember,
    getMany,
    setMany,
    hasKey,
    getMetadata,
    maintain,
    warmUp,

    // Reset
    reset,
  }
})