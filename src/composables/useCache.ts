// src/composables/useCache.ts

import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCacheStore } from '../stores/cache/cache.store'
import type {
  CacheEntry,
  CacheStats,
  CreateCacheRequest,
  UpdateCacheRequest,
  CacheQueryParams,
  CacheEntryMetadata,
  CacheCleanupResult,
} from '../models/entities/cache/cache.entity'

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
      const value = await keyMap[key]()
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

    // Reset
    reset,

    // Helpers
    getNamespacedKey,
  }
}

export default useCache