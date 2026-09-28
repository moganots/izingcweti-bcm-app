import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSyncStore } from '../stores/sync/sync.store'
import { useNetworkStore } from '../stores/network/network.store'
import type { ConflictResolutionStrategy } from '../types/sync.types'

export interface UseSyncOptions {
    /** Auto-sync when network becomes available */
    autoSyncOnReconnect?: boolean
    /** Auto-sync on mount */
    autoSyncOnMount?: boolean
    /** Interval in ms for periodic sync (0 = disabled) */
    intervalMs?: number
}

/**
 * Unified sync composable
 * Aligned with useSyncStore + useNetworkStore
 */
export function useSync(options: UseSyncOptions = {}) {
    const {
        autoSyncOnReconnect = true,
        autoSyncOnMount = false,
        intervalMs = 0,
    } = options

    const syncStore = useSyncStore()
    const networkStore = useNetworkStore()

    const {
        status,
        progress,
        stats,
        lastResult,
        error,
        isOnline,
        isSyncing,
        isIdle,
        hasPending,
        hasConflicts,
        isFullySynced,
        pendingCount,
        unresolvedConflictCount,
        syncStatusLabel,
        syncStatusColor,
    } = storeToRefs(syncStore)

    let intervalId: ReturnType<typeof setInterval> | null = null
    let unwatchOnline: (() => void) | null = null

    // ============================================
    // Actions
    // ============================================
    async function sync() {
        return syncStore.sync()
    }

    async function push() {
        return syncStore.push()
    }

    async function pull() {
        return syncStore.pull()
    }

    async function retryFailed() {
        return syncStore.retryFailed()
    }

    async function clearPending() {
        return syncStore.clearPending()
    }

    async function resolveConflict(
        conflictId: string,
        strategy: ConflictResolutionStrategy,
        resolvedData?: Record<string, any>
    ) {
        return syncStore.resolveConflict(conflictId, strategy, resolvedData)
    }

    async function bulkResolveConflicts(
        conflictIds: string[],
        strategy: ConflictResolutionStrategy,
        resolvedData?: Record<string, any>
    ) {
        return syncStore.bulkResolveConflicts(conflictIds, strategy, resolvedData)
    }

    function clearError() {
        syncStore.clearError()
    }

    // ============================================
    // Lifecycle
    // ============================================
    onMounted(async () => {
        await syncStore.initialize()
        await networkStore.init()

        if (autoSyncOnMount && networkStore.isOnline) {
            sync().catch(console.error)
        }

        if (autoSyncOnReconnect) {
            unwatchOnline = watch(
                () => networkStore.isOnline,
                (online, wasOnline) => {
                    if (online && !wasOnline) {
                        console.log('Network restored, triggering sync...')
                        sync().catch(console.error)
                    }
                }
            )
        }

        if (intervalMs > 0) {
            intervalId = setInterval(() => {
                if (networkStore.isOnline && !syncStore.isSyncing) {
                    sync().catch(console.error)
                }
            }, intervalMs)
        }
    })

    onUnmounted(() => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
        if (unwatchOnline) {
            unwatchOnline()
            unwatchOnline = null
        }
    })

    return {
        // State
        status,
        progress,
        stats,
        lastResult,
        error,

        // Getters
        isOnline,
        isSyncing,
        isIdle,
        hasPending,
        hasConflicts,
        isFullySynced,
        pendingCount,
        unresolvedConflictCount,
        syncStatusLabel,
        syncStatusColor,

        // Actions
        sync,
        push,
        pull,
        retryFailed,
        clearPending,
        resolveConflict,
        bulkResolveConflicts,
        clearError,
    }
}

export default useSync