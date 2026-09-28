import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCacheStore } from '../stores/cache/cache.store'

export interface UseCacheOptions {
    autoInitialize?: boolean
    defaultTTL?: number
    namespace?: string
}

/**
 * Cache composable
 * Aligned with useCacheStore
 */
export function useCache(options: UseCacheOptions = {}) {
    const { autoInitialize = true, defaultTTL = 3600, namespace = '' } = options

    const store = useCacheStore()

    const {
        entries,
        stats,
        isLoading,
        isSaving,
        error,
        isInitialized,
        totalEntries,
        activeEntries,
        expiredEntries,
        cacheHitRatio,
        totalSizeMB,
        totalSizeKB,
        needsCleanup,
        cacheEfficiency,
        hasEntries,
    } = storeToRefs(store)

    const isReady = ref(false)

    function getNamespacedKey(key: string): string {
        return namespace ? `${namespace}:${key}` : key
    }

    async function getValue<T = any>(key: string): Promise<T | null> {
        return store.getValue<T>(getNamespacedKey(key))
    }

    async function setValue<T = any>(key: string, value: T, ttl?: number, tags?: string) {
        return store.setValue(getNamespacedKey(key), value, ttl ?? defaultTTL, tags)
    }

    async function deleteValue(key: string): Promise<boolean> {
        return store.deleteByKey(getNamespacedKey(key))
    }

    async function remember<T = any>(
        key: string,
        factory: () => Promise<T>,
        opts?: { ttl?: number; tags?: string; forceRefresh?: boolean }
    ): Promise<T> {
        return store.remember(getNamespacedKey(key), factory, {
            ttl: opts?.ttl ?? defaultTTL,
            ...(opts?.tags !== undefined ? { tags: opts.tags } : {}),
            ...(opts?.forceRefresh !== undefined ? { forceRefresh: opts.forceRefresh } : {}),
        })
    }

    const status = computed(() => ({
        initialized: isInitialized.value,
        totalEntries: totalEntries.value,
        activeEntries: activeEntries.value,
        expiredEntries: expiredEntries.value,
        hitRatio: cacheHitRatio.value,
        sizeMB: totalSizeMB.value,
        efficiency: cacheEfficiency.value,
        needsCleanup: needsCleanup.value,
    }))

    onMounted(async () => {
        if (autoInitialize) {
            await store.initialize()
            isReady.value = true
        }
    })

    return {
        // State
        entries,
        stats,
        isLoading,
        isSaving,
        error,
        isInitialized,
        isReady,

        // Getters
        totalEntries,
        activeEntries,
        expiredEntries,
        cacheHitRatio,
        totalSizeMB,
        totalSizeKB,
        needsCleanup,
        cacheEfficiency,
        hasEntries,
        status,

        // Actions
        initialize: store.initialize,
        refreshStats: store.refreshStats,
        getValue,
        setValue,
        deleteValue,
        remember,
        clearAll: store.clearAll,
        cleanExpired: store.cleanExpired,
        reset: store.reset,
        getNamespacedKey,
    }
}

export default useCache