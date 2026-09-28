import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    Cache,
} from '../../models/cache/cache.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { cacheService } from '../../services/api/cache/CacheService'

export const useCacheEntryStore = createOfflineCrudStore<Cache>({
    storeId: 'cache-entries',
    tableName: 'cache',
})

export const useCacheStore = defineStore('cache', () => {
    const entryStore = useCacheEntryStore()

    const stats = ref<{
        totalEntries: number
        totalSizeBytes: number
        activeEntries: number
        expiredEntries: number
        totalHits: number
        cacheHitRatio: number
    } | null>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref<string | null>(null)
    const isInitialized = ref(false)

    const entries = entryStore.items

    // ============================================
    // Getters
    // ============================================
    const totalEntries = computed(() => stats.value?.totalEntries || entries?.length)
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

    const needsCleanup = computed(
        () => cacheHitRatio.value < 0.5 || expiredEntries.value > totalEntries.value * 0.2
    )

    const cacheEfficiency = computed(() => {
        const ratio = cacheHitRatio.value
        if (ratio >= 0.9) return { label: 'Excellent', color: 'positive', icon: 'check_circle' }
        if (ratio >= 0.7) return { label: 'Good', color: 'info', icon: 'info' }
        if (ratio >= 0.5) return { label: 'Fair', color: 'warning', icon: 'warning' }
        return { label: 'Poor', color: 'negative', icon: 'error' }
    })

    const hasEntries = computed(() => entries?.length > 0)

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        if (isInitialized.value) return
        await entryStore.initialize()
        await refreshStats()
        isInitialized.value = true
    }

    async function refreshStats(): Promise<void> {
        try {
            stats.value = await cacheService.getStats()
        } catch (err: any) {
            console.error('Failed to refresh cache stats:', err)
        }
    }

    async function getValue<T = any>(key: string): Promise<T | null> {
        const entry = entryStore.items?.find((e) => e.key === key)
        if (entry) {
            if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
                await entryStore.remove(entry.uuid)
                return null
            }
            return entry.value as T
        }

        try {
            const serverEntry = await cacheService.getEntry(key)
            if (serverEntry) {
                await entryStore.create(serverEntry)
                return serverEntry.value as T
            }
        } catch (err) {
            console.error('Failed to fetch cache entry:', err)
        }
        return null
    }

    async function setValue<T = any>(
        key: string,
        value: T,
        ttl?: number,
        tags?: string
    ): Promise<Cache | null> {
        const existing = entryStore.items?.find((e) => e.key === key)
        if (existing) {
            return entryStore.update(existing.uuid, { value, tags } as Partial<Cache>)
        }
        return entryStore.create({
            key,
            value,
            tags,
            expiresAt: ttl ? new Date(Date.now() + ttl * 1000) : undefined,
        } as Partial<Cache>)
    }

    async function deleteByKey(key: string): Promise<boolean> {
        const entry = entryStore.items?.find((e) => e.key === key)
        if (!entry) return false
        return entryStore.remove(entry.uuid)
    }

    async function deleteByTags(tags: string): Promise<number> {
        const matching = entryStore.items?.filter(
            (e) => e.tags && e.tags.includes(tags)
        )
        for (const entry of matching) {
            await entryStore.remove(entry.uuid)
        }
        return matching.length
    }

    async function clearAll(): Promise<number> {
        const count = entryStore.items?.length
        for (const entry of [...entryStore.items]) {
            await entryStore.remove(entry.uuid)
        }
        return count
    }

    async function cleanExpired(): Promise<number> {
        const now = new Date()
        const expired = entryStore.items?.filter(
            (e) => e.expiresAt && new Date(e.expiresAt) < now
        )
        for (const entry of expired) {
            await entryStore.remove(entry.uuid)
        }
        return expired.length
    }

    async function remember<T = any>(
        key: string,
        factory: () => Promise<T>,
        options?: { ttl?: number; tags?: string; forceRefresh?: boolean }
    ): Promise<T> {
        const { ttl, tags, forceRefresh = false } = options || {}

        if (!forceRefresh) {
            const cached = await getValue<T>(key)
            if (cached !== null) return cached
        }

        const value = await factory()
        await setValue(key, value, ttl, tags)
        return value
    }

    function reset(): void {
        entryStore.reset()
        stats.value = null
        error.value = null
        isInitialized.value = false
    }

    return {
        // State
        entries,
        stats,
        isLoading,
        isSaving,
        error,
        isInitialized,

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

        // Actions
        initialize,
        refreshStats,
        getValue,
        setValue,
        deleteByKey,
        deleteByTags,
        clearAll,
        cleanExpired,
        remember,
        reset,

        // Sub-store
        entryStore,
    }
})