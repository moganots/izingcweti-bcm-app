import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
} from '../../models/sync/sync.entity'
import { ConflictResolutionStrategy } from '../../models/sync/sync.entity'
import type {
  SyncProgress,
  SyncResult,
  SyncStats,
  NetworkStatus,
} from '../../types/sync.types'
import { SyncStatus, ConnectionType } from '../../types/sync.types'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { SyncEngine } from '../../services/sync/SyncEngine'
import { NetworkMonitor } from '../../services/sync/NetworkMonitor'
import { useAuthStore } from '../auth/auth.store'
import { useSettingsStore } from '../settings/settings.store'

// ============================================
// Sub-stores for sync entities
// ============================================
export const usePendingChangeStore = createOfflineCrudStore<PendingChange>({
  storeId: 'pending-changes',
  tableName: 'pendingChanges',
})

export const useSyncConflictStore = createOfflineCrudStore<SyncConflict>({
  storeId: 'sync-conflicts',
  tableName: 'syncConflicts',
})

export const useSyncMetadataStore = createOfflineCrudStore<SyncMetadata>({
  storeId: 'sync-metadata',
  tableName: 'syncMetadata',
})

// ============================================
// Sync Store (Main)
// ============================================
export const useSyncStore = defineStore('sync', () => {
  // ============================================
  // Dependencies
  // ============================================
  const authStore = useAuthStore()
  const settingsStore = useSettingsStore()

  const pendingStore = usePendingChangeStore()
  const conflictStore = useSyncConflictStore()
  const metadataStore = useSyncMetadataStore()

  // ============================================
  // Service instances (lazy loaded)
  // ============================================
  let syncEngine: SyncEngine | null = null
  let networkMonitor: NetworkMonitor | null = null

  // ============================================
  // State
  // ============================================
  const status = ref<SyncStatus>(SyncStatus.IDLE)
  const isInitialized = ref(false)
  const isCancelled = ref(false)

  const progress = ref<SyncProgress>({
    isSyncing: false,
    current: 0,
    total: 100,
    percentage: 0,
  })

  const lastResult = ref<SyncResult | null>(null)
  const lastSyncAt = ref<string | null>(null)
  const syncToken = ref<string | null>(null)
  const error = ref<string | null>(null)

  // Network state — uses NetworkStatus (single source of truth)
  const networkStatus = ref<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: ConnectionType.UNKNOWN,
    signalStrength: 0,
    isMetered: false,
    lastChecked: new Date().toISOString(),
  })

  // Auto-sync state
  const autoSyncEnabled = ref(true)
  const backgroundSyncEnabled = ref(false)
  let autoSyncTimeout: ReturnType<typeof setTimeout> | null = null
  let networkListenerCleanup: (() => void) | null = null

  // ============================================
  // Getters
  // ============================================
  const isOnline = computed(() => networkStatus.value.isOnline)
  const isOffline = computed(() => !isOnline.value)
  const isSyncing = computed(() => status.value === SyncStatus.SYNCING)
  const isIdle = computed(() => status.value === SyncStatus.IDLE)
  const hasError = computed(
    () => status.value === SyncStatus.ERROR || !!error.value
  )

  const hasPending = computed(() => (pendingStore?.items?.length ?? 0) > 0)
  const hasConflicts = computed(
    () => (conflictStore?.items?.filter((c) => !c.resolved).length ?? 0) > 0
  )

  const pendingCount = computed(() => pendingStore?.items?.length ?? 0)
  const unresolvedConflictCount = computed(
    () => conflictStore?.items?.filter((c) => !c.resolved).length ?? 0
  )

  const isFullySynced = computed(
    () =>
      status.value === SyncStatus.SYNCED &&
      pendingCount.value === 0 &&
      unresolvedConflictCount.value === 0
  )

  const needsSync = computed(
    () => hasPending.value || hasConflicts.value || status.value === SyncStatus.ERROR
  )

  const canSync = computed(
    () => isOnline.value && !isSyncing.value && authStore.isAuthenticated
  )

  const canSyncOnCurrentNetwork = computed(() => {
    if (!isOnline.value) return false
    if (!networkStatus.value.isMetered) return true
    return !settingsStore.syncSettings.syncOnlyOnWifi
  })

  const stats = computed<SyncStats>(() => ({
    pendingChanges: pendingCount.value,
    conflicts: conflictStore?.items?.length ?? 0,
    unresolvedConflicts: unresolvedConflictCount.value,
    lastSyncTime: lastSyncAt.value,
    lastSyncToken: syncToken.value,
    isOnline: isOnline.value,
    syncInProgress: isSyncing.value,
  }))

  const syncStatusLabel = computed(() => {
    if (isSyncing.value) return 'Syncing...'
    if (isOffline.value) return 'Offline'
    if (hasConflicts.value) return `${unresolvedConflictCount.value} conflicts`
    if (hasPending.value) return `${pendingCount.value} pending`
    if (isFullySynced.value) return 'Up to date'
    return 'Ready'
  })

  const syncStatusColor = computed(() => {
    if (isSyncing.value) return 'blue'
    if (isOffline.value) return 'grey'
    if (hasError.value) return 'negative'
    if (hasConflicts.value) return 'warning'
    if (hasPending.value) return 'orange'
    if (isFullySynced.value) return 'positive'
    return 'grey'
  })

  // ============================================
  // Initialization
  // ============================================
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    networkMonitor = NetworkMonitor.getInstance()
    syncEngine = new SyncEngine()

    await networkMonitor.startMonitoring()
    await syncEngine.initialize()

    await Promise.all([
      pendingStore.initialize(),
      conflictStore.initialize(),
      metadataStore.initialize(),
    ])

    await loadPersistedState()

    networkListenerCleanup = networkMonitor.addListener((newStatus) => {
      networkStatus.value = newStatus

      if (newStatus.isOnline) {
        onNetworkRestored()
      } else {
        onNetworkLost()
      }
    })

    networkStatus.value = networkMonitor.currentStatus
    autoSyncEnabled.value = settingsStore.autoSyncEnabled ?? true

    isInitialized.value = true

    if (
      autoSyncEnabled.value &&
      settingsStore.syncSettings.syncOnAppStart &&
      canSync.value
    ) {
      await sync().catch(console.error)
    }
  }

  async function loadPersistedState(): Promise<void> {
    try {
      const token = await syncEngine!.getSyncToken()
      if (token) syncToken.value = token

      const lastTime = await syncEngine!.getSyncMetadata('last_sync_time')
      if (lastTime?.value) lastSyncAt.value = lastTime.value
    } catch (err) {
      console.warn('Failed to load persisted sync state:', err)
    }
  }

  // ============================================
  // Network Event Handlers
  // ============================================
  function onNetworkRestored(): void {
    console.log('🌐 Network restored')

    if (autoSyncTimeout) {
      clearTimeout(autoSyncTimeout)
      autoSyncTimeout = null
    }

    if (
      autoSyncEnabled.value &&
      settingsStore.syncSettings.syncOnReconnect &&
      canSyncOnCurrentNetwork.value
    ) {
      autoSyncTimeout = setTimeout(() => {
        sync().catch(console.error)
      }, 2000)
    }
  }

  function onNetworkLost(): void {
    console.log('📴 Network lost')

    if (isSyncing.value) {
      cancelSync()
    }

    status.value = SyncStatus.OFFLINE
  }

  // ============================================
  // Core Sync Actions
  // ============================================
  async function sync(): Promise<SyncResult> {
    if (!syncEngine) await initialize()

    if (!authStore.isAuthenticated) {
      return buildFailedResult('User not authenticated')
    }

    if (!isOnline.value) {
      const result = buildFailedResult('Cannot sync while offline')
      lastResult.value = result
      return result
    }

    if (!canSyncOnCurrentNetwork.value) {
      const result = buildFailedResult(
        'Cannot sync on metered connection (WiFi only mode)'
      )
      lastResult.value = result
      return result
    }

    if (isSyncing.value) {
      console.warn('Sync already in progress, skipping')
      return lastResult.value || buildFailedResult('Sync already in progress')
    }

    isCancelled.value = false
    status.value = SyncStatus.SYNCING
    error.value = null

    progress.value = {
      isSyncing: true,
      current: 0,
      total: 100,
      percentage: 0,
      startedAt: new Date().toISOString(),
    }

    const startTime = Date.now()
    const result: SyncResult = {
      success: false,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      durationMs: 0,
      startedAt: new Date().toISOString(),
    }

    try {
      // Phase 1: PUSH (25%)
      if (isCancelled.value) throw new Error('Sync cancelled')

      progress.value.current = 25
      progress.value.percentage = 25
      progress.value.currentOperation = 'Pushing local changes...'

      const pushResult = await syncEngine!.pushChanges()
      result.pushed = pushResult.appliedChanges || 0
      result.conflicts = pushResult.conflicts?.length || 0

      // Phase 2: PULL (75%)
      if (isCancelled.value) throw new Error('Sync cancelled')

      progress.value.current = 75
      progress.value.percentage = 75
      progress.value.currentOperation = 'Pulling remote changes...'

      const pullResult = await syncEngine!.pullChanges()
      result.pulled = pullResult.changes?.length || 0
      result.syncToken = pullResult.syncToken

      if (pullResult.syncToken) {
        syncToken.value = pullResult.syncToken
        await syncEngine!.setSyncToken(pullResult.syncToken)
      }

      // Phase 3: COMPLETE (100%)
      progress.value.current = 100
      progress.value.percentage = 100
      progress.value.currentOperation = 'Complete'

      result.success = pushResult.success !== false

      if (result.conflicts > 0) {
        status.value = SyncStatus.CONFLICT
      } else if (result.errors.length > 0) {
        status.value = SyncStatus.ERROR
      } else {
        status.value = SyncStatus.SYNCED
      }

      lastSyncAt.value = new Date().toISOString()
      await syncEngine!.updateSyncMetadata('last_sync_time', lastSyncAt.value!)
    } catch (err: any) {
      const errMsg = err?.message || 'Unknown sync error'
      result.errors.push(errMsg)
      error.value = errMsg

      if (errMsg === 'Sync cancelled') {
        status.value = SyncStatus.IDLE
      } else {
        status.value = SyncStatus.ERROR
      }

      console.error('Sync failed:', err)
    } finally {
      result.durationMs = Date.now() - startTime
      result.completedAt = new Date().toISOString()
      lastResult.value = result

      progress.value.isSyncing = false
      delete progress.value.currentOperation

      await Promise.all([
        pendingStore.loadAll().catch(console.error),
        conflictStore.loadAll().catch(console.error),
      ])
    }

    return result
  }

  async function push(): Promise<SyncResult> {
    if (!syncEngine) await initialize()

    if (!canSync.value) {
      return buildFailedResult(
        isOffline.value ? 'Cannot sync while offline' : 'Cannot sync right now'
      )
    }

    status.value = SyncStatus.SYNCING
    const startTime = Date.now()

    const result: SyncResult = {
      success: false,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      durationMs: 0,
    }

    try {
      const pushResult = await syncEngine!.pushChanges()
      result.pushed = pushResult.appliedChanges || 0
      result.conflicts = pushResult.conflicts?.length || 0
      result.success = pushResult.success !== false
      status.value = result.conflicts > 0 ? SyncStatus.CONFLICT : SyncStatus.SYNCED
    } catch (err: any) {
      result.errors.push(err?.message || 'Push failed')
      error.value = err?.message || 'Push failed'
      status.value = SyncStatus.ERROR
    } finally {
      result.durationMs = Date.now() - startTime
      lastResult.value = result
      await pendingStore.loadAll().catch(console.error)
      await conflictStore.loadAll().catch(console.error)
    }

    return result
  }

  async function pull(): Promise<SyncResult> {
    if (!syncEngine) await initialize()

    if (!canSync.value) {
      return buildFailedResult(
        isOffline.value ? 'Cannot sync while offline' : 'Cannot sync right now'
      )
    }

    status.value = SyncStatus.SYNCING
    const startTime = Date.now()

    const result: SyncResult = {
      success: false,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
      durationMs: 0,
    }

    try {
      const pullResult = await syncEngine!.pullChanges()
      result.pulled = pullResult.changes?.length || 0
      result.syncToken = pullResult.syncToken
      result.success = true

      if (pullResult.syncToken) {
        syncToken.value = pullResult.syncToken
        await syncEngine!.setSyncToken(pullResult.syncToken)
      }

      lastSyncAt.value = new Date().toISOString()
      await syncEngine!.updateSyncMetadata('last_sync_time', lastSyncAt.value!)

      status.value = SyncStatus.SYNCED
    } catch (err: any) {
      result.errors.push(err?.message || 'Pull failed')
      error.value = err?.message || 'Pull failed'
      status.value = SyncStatus.ERROR
    } finally {
      result.durationMs = Date.now() - startTime
      lastResult.value = result
    }

    return result
  }

  function cancelSync(): void {
    if (!isSyncing.value) return
    isCancelled.value = true
    console.warn('Sync cancellation requested')
  }

  // ============================================
  // Conflict Resolution
  // ============================================
  async function resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    resolvedData?: Record<string, any>
  ): Promise<void> {
    if (!syncEngine) await initialize()

    try {
      // Build the resolution payload — only include resolvedData if defined
      const payload: {
        strategy: ConflictResolutionStrategy
        userId: string
        resolvedData?: Record<string, any>
      } = {
        strategy,
        userId: authStore.userId,
      }
      if (resolvedData !== undefined) {
        payload.resolvedData = resolvedData
      }

      await syncEngine!.resolveConflict(conflictId, payload as any)
      await conflictStore.loadAll()
    } catch (err: any) {
      error.value = err?.message || 'Failed to resolve conflict'
      throw err
    }
  }

  async function bulkResolveConflicts(
    conflictIds: string[],
    strategy: ConflictResolutionStrategy,
    resolvedData?: Record<string, any>
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    if (!syncEngine) await initialize()

    const result = {
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const conflictId of conflictIds) {
      try {
        const payload: {
          strategy: ConflictResolutionStrategy
          userId: string
          resolvedData?: Record<string, any>
        } = {
          strategy,
          userId: authStore.userId,
        }
        if (resolvedData !== undefined) {
          payload.resolvedData = resolvedData
        }

        await syncEngine!.resolveConflict(conflictId, payload as any)
        result.updated++
      } catch (err: any) {
        result.failed++
        result.errors.push(err?.message || `Failed to resolve ${conflictId}`)
      }
    }

    await conflictStore.loadAll()
    return result
  }

  // ============================================
  // Retry & Cleanup
  // ============================================
  async function retryFailed(): Promise<number> {
    if (!syncEngine) await initialize()
    const count = await syncEngine!.retryFailedSyncs()
    await pendingStore.loadAll()
    return count
  }

  async function clearPending(): Promise<void> {
    if (!syncEngine) await initialize()
    await syncEngine!.clearAllPendingChanges()
    await pendingStore.loadAll()
  }

  async function syncWithRetry(
    maxAttempts: number = 3,
    baseDelayMs: number = 1000
  ): Promise<SyncResult> {
    let lastResult_: SyncResult | null = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        console.log(
          `Retrying sync in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      const result = await sync()
      if (result.success) return result

      lastResult_ = result

      if (!isOnline.value) break
    }

    return lastResult_ || lastResult.value || buildFailedResult('Sync failed after retries')
  }

  // ============================================
  // Background Sync
  // ============================================
  function enableBackgroundSync(intervalMinutes: number = 15): void {
    backgroundSyncEnabled.value = true
    settingsStore
      .updateSync({
        autoSyncEnabled: true,
        syncIntervalMinutes: intervalMinutes,
      })
      .catch(console.error)
  }

  function disableBackgroundSync(): void {
    backgroundSyncEnabled.value = false
    settingsStore.updateSync({ autoSyncEnabled: false }).catch(console.error)
  }

  // ============================================
  // Settings Watchers
  // ============================================
  watch(
    () => settingsStore.autoSyncEnabled,
    (enabled) => {
      autoSyncEnabled.value = enabled
    }
  )

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth && isInitialized.value) {
        if (settingsStore.syncSettings.syncOnAppStart && canSync.value) {
          sync().catch(console.error)
        }
      } else if (!isAuth) {
        reset()
      }
    }
  )

  // ============================================
  // Utilities
  // ============================================
  function buildFailedResult(message: string): SyncResult {
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [message],
      durationMs: 0,
    }
  }

  function clearError(): void {
    error.value = null
    if (status.value === SyncStatus.ERROR) {
      status.value = SyncStatus.IDLE
    }
  }

  function reset(): void {
    status.value = SyncStatus.IDLE
    progress.value = {
      isSyncing: false,
      current: 0,
      total: 100,
      percentage: 0,
    }
    lastResult.value = null
    lastSyncAt.value = null
    syncToken.value = null
    error.value = null
    isCancelled.value = false

    if (autoSyncTimeout) {
      clearTimeout(autoSyncTimeout)
      autoSyncTimeout = null
    }
  }

  function cleanup(): void {
    if (networkListenerCleanup) {
      networkListenerCleanup()
      networkListenerCleanup = null
    }

    if (autoSyncTimeout) {
      clearTimeout(autoSyncTimeout)
      autoSyncTimeout = null
    }

    if (networkMonitor) {
      networkMonitor.stopMonitoring()
    }

    reset()
    isInitialized.value = false
  }

  // ============================================
  // Expose
  // ============================================
  return {
    // State
    status: readonly(status),
    progress: readonly(progress),
    lastResult: readonly(lastResult),
    lastSyncAt: readonly(lastSyncAt),
    syncToken: readonly(syncToken),
    error: readonly(error),
    networkStatus: readonly(networkStatus),
    isInitialized: readonly(isInitialized),
    autoSyncEnabled: readonly(autoSyncEnabled),
    backgroundSyncEnabled: readonly(backgroundSyncEnabled),

    // Sub-store access
    pendingChanges: pendingStore.items,
    conflicts: conflictStore.items,
    syncMetadata: metadataStore.items,

    // Getters
    isOnline,
    isOffline,
    isSyncing,
    isIdle,
    hasError,
    hasPending,
    hasConflicts,
    pendingCount,
    unresolvedConflictCount,
    isFullySynced,
    needsSync,
    canSync,
    canSyncOnCurrentNetwork,
    stats,
    syncStatusLabel,
    syncStatusColor,

    // Initialization
    initialize,
    loadPersistedState,

    // Core Actions
    sync,
    push,
    pull,
    cancelSync,
    syncWithRetry,

    // Conflict Resolution
    resolveConflict,
    bulkResolveConflicts,

    // Retry & Cleanup
    retryFailed,
    clearPending,

    // Background Sync
    enableBackgroundSync,
    disableBackgroundSync,

    // Utilities
    clearError,
    reset,
    cleanup,

    // Sub-stores (for direct access if needed)
    pendingStore,
    conflictStore,
    metadataStore,
  }
})

// Default export for convenience
export default useSyncStore