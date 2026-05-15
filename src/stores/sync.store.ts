import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SyncEngine } from '../services/sync/SyncEngine'
import { db } from '../services/db/Database'
import { useUiStore } from './ui.store'
import { useAuthStore } from './auth.store'
import type { OperationType, PendingChange, SyncConflict } from '../models/entities/sync.entity'

export const useSyncStore = defineStore('sync', () => {
  // ============================================
  // State
  // ============================================
  const syncEngine = ref<SyncEngine | null>(null)
  const status = ref<'idle' | 'syncing' | 'error' | 'offline'>('idle')
  const pendingChanges = ref<PendingChange[]>([])
  const conflicts = ref<SyncConflict[]>([])
  const lastSyncAt = ref<string | null>(null)
  const syncToken = ref<string | null>(null)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const syncInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const isPolling = ref(false)
  const totalPushed = ref(0)
  const totalPulled = ref(0)

  // ============================================
  // Getters
  // ============================================
  const isSyncing = computed(() => status.value === 'syncing')
  const hasPendingChanges = computed(() => pendingChanges.value.length > 0)
  const pendingCount = computed(() => pendingChanges.value.length)
  const conflictCount = computed(() => conflicts.value.filter((c) => !c.resolved).length)
  const resolvedConflictCount = computed(() => conflicts.value.filter((c) => c.resolved).length)
  const highPriorityCount = computed(
    () => pendingChanges.value.filter((c) => c.priority <= 2).length
  )
  const syncStatusText = computed(() => {
    switch (status.value) {
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return 'Sync Error'
      case 'offline':
        return 'Offline'
      default:
        return hasPendingChanges.value ? 'Pending Changes' : 'Synced'
    }
  })
  const syncStatusColor = computed(() => {
    switch (status.value) {
      case 'syncing':
        return 'warning'
      case 'error':
        return 'negative'
      case 'offline':
        return 'grey'
      default:
        return hasPendingChanges.value ? 'warning' : 'positive'
    }
  })
  const lastSyncTimeAgo = computed(() => {
    if (!lastSyncAt.value) return 'Never'
    const diff = Date.now() - new Date(lastSyncAt.value).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Initialize sync engine - called by boot/sync.ts
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    try {
      // Ensure database is ready
      if (!db.isReady()) {
        await db.initialize()
      }

      // Create sync engine instance
      syncEngine.value = new SyncEngine()
      await syncEngine.value.initialize()

      await loadPendingChanges()
      await loadConflicts()
      await loadSyncMetadata()

      isInitialized.value = true

      // Start periodic sync if enabled
      if (import.meta.env.VITE_SYNC_ENABLED !== 'false') {
        startPeriodicSync()
      }

      console.log('✓ Sync store initialized')
    } catch (err: any) {
      console.error('Sync initialization failed:', err)
      error.value = err.message || 'Sync initialization failed'
    }
  }

  /**
   * Load pending changes from sync engine
   */
  async function loadPendingChanges(): Promise<void> {
    if (!syncEngine.value) return
    try {
      pendingChanges.value = await syncEngine.value.getPendingChanges()
    } catch (err: any) {
      console.error('Failed to load pending changes:', err)
    }
  }

  /**
   * Load conflicts from sync engine
   */
  async function loadConflicts(): Promise<void> {
    if (!syncEngine.value) return
    try {
      conflicts.value = await syncEngine.value.getConflicts()
    } catch (err: any) {
      console.error('Failed to load conflicts:', err)
    }
  }

  /**
   * Load sync metadata
   */
  async function loadSyncMetadata(): Promise<void> {
    if (!syncEngine.value) return
    try {
      const metadata = await syncEngine.value.getSyncMetadata()
      if (metadata) {
        syncToken.value = metadata.value
        lastSyncAt.value = metadata.updated_at || null
      }
    } catch (err: any) {
      console.error('Failed to load sync metadata:', err)
    }
  }

  /**
   * Add a pending change to sync queue
   */
  async function addPendingChange(change: {
    entityType: string
    entityId: string
    operationType: 'CREATE' | 'UPDATE' | 'DELETE'
    data: Record<string, unknown>
    priority?: number
  }): Promise<void> {
    if (!syncEngine.value) {
      throw new Error('Sync engine not initialized')
    }

    try {
      await syncEngine.value.addPendingChange({
        entityType: change.entityType,
        entityId: change.entityId,
        operationType: change.operationType as OperationType,
        data: change.data,
        priority: change.priority || 3,
      })
      await loadPendingChanges()

      // Auto-sync if online and changes are high priority
      const uiStore = useUiStore()
      if (!uiStore.isOffline && (change.priority || 3) <= 2) {
        pushChanges().catch(console.error)
      }
    } catch (err: any) {
      console.error('Failed to add pending change:', err)
      error.value = err.message || 'Failed to add pending change'
    }
  }

  /**
   * Push local changes to server
   */
  async function pushChanges(): Promise<void> {
    if (status.value === 'syncing' || !syncEngine.value) return

    const uiStore = useUiStore()
    if (uiStore.isOffline) {
      status.value = 'offline'
      error.value = 'Cannot sync while offline'
      return
    }

    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      error.value = 'Cannot sync while not authenticated'
      return
    }

    status.value = 'syncing'
    error.value = null
    progress.value = 0

    try {
      const result = await syncEngine.value.pushChanges()
      totalPushed.value += result.appliedChanges
      await loadPendingChanges()
      await loadConflicts()
      lastSyncAt.value = new Date().toISOString()
      status.value = 'idle'
      progress.value = 100
    } catch (err: any) {
      status.value = 'error'
      error.value = err.message || 'Push sync failed'
      throw err
    }
  }

  /**
   * Pull changes from server
   */
  async function pullChanges(): Promise<void> {
    if (status.value === 'syncing' || !syncEngine.value) return

    const uiStore = useUiStore()
    if (uiStore.isOffline) {
      status.value = 'offline'
      return
    }

    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      error.value = 'Cannot sync while not authenticated'
      return
    }

    status.value = 'syncing'
    error.value = null

    try {
      const response = await syncEngine.value.pullChanges(syncToken.value)

      if (response.changes) {
        totalPulled.value += response.changes.length
      }

      if (response.syncToken) {
        syncToken.value = response.syncToken
      }

      lastSyncAt.value = new Date().toISOString()
      status.value = 'idle'
    } catch (err: any) {
      status.value = 'error'
      error.value = err.message || 'Pull sync failed'
      throw err
    }
  }

  /**
   * Perform full sync (push then pull)
   */
  async function fullSync(): Promise<void> {
    await pushChanges()
    await pullChanges()
  }

  /**
   * Initialize sync (called by boot/sync.ts)
   * Alias for initialize() for compatibility
   */
  async function initializeSync(): Promise<void> {
    return initialize()
  }

  /**
   * Resolve a sync conflict
   */
  async function resolveConflict(
    conflictId: string,
    resolution: {
      strategy: 'server-wins' | 'client-wins' | 'merge'
      resolvedData?: Record<string, unknown>
    }
  ): Promise<void> {
    if (!syncEngine.value) {
      throw new Error('Sync engine not initialized')
    }

    try {
      await syncEngine.value.resolveConflict(conflictId, resolution)
      await loadConflicts()
    } catch (err: any) {
      console.error('Failed to resolve conflict:', err)
      error.value = err.message || 'Failed to resolve conflict'
    }
  }

  /**
   * Start periodic sync
   */
  function startPeriodicSync(): void {
    if (isPolling.value) return

    const intervalMinutes = parseInt(import.meta.env.VITE_SYNC_INTERVAL_MINUTES || '5')

    isPolling.value = true
    syncInterval.value = setInterval(async () => {
      const uiStore = useUiStore()
      const authStore = useAuthStore()

      if (!uiStore.isOffline && authStore.isAuthenticated && hasPendingChanges.value) {
        await fullSync().catch(console.error)
      }
    }, intervalMinutes * 60 * 1000)

    console.log(`✓ Periodic sync started (every ${intervalMinutes} minutes)`)
  }

  /**
   * Stop periodic sync
   */
  function stopPeriodicSync(): void {
    if (syncInterval.value) {
      clearInterval(syncInterval.value)
      syncInterval.value = null
    }
    isPolling.value = false
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null
    if (status.value === 'error') {
      status.value = 'idle'
    }
  }

  /**
   * Cleanup sync engine
   */
  async function cleanup(): Promise<void> {
    stopPeriodicSync()
    if (syncEngine.value) {
      await syncEngine.value.cleanup()
    }
    isInitialized.value = false
    syncEngine.value = null
  }

  return {
    // State
    status,
    pendingChanges,
    conflicts,
    lastSyncAt,
    syncToken,
    progress,
    error,
    isInitialized,
    isPolling,
    totalPushed,
    totalPulled,
    // Getters
    isSyncing,
    hasPendingChanges,
    pendingCount,
    conflictCount,
    resolvedConflictCount,
    highPriorityCount,
    syncStatusText,
    syncStatusColor,
    lastSyncTimeAgo,
    // Actions
    initialize,
    initializeSync, // Alias for boot/sync.ts
    loadPendingChanges,
    loadConflicts,
    addPendingChange,
    pushChanges,
    pullChanges,
    fullSync,
    resolveConflict,
    startPeriodicSync,
    stopPeriodicSync,
    clearError,
    cleanup,
  }
})
