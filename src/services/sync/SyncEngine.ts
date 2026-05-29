import { apiClient } from './../../boot/axios'
import { BCMDatabase } from '../db/Database'
import { NetworkMonitor } from './NetworkMonitor'
import { ConflictResolver } from './ConflictResolver'
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
  SyncPullResponse,
  SyncPushResponse,
  SyncChange,
  NetworkInfo,
  ConflictResolutionStrategy,
} from './../../models/entities'
import { SyncPriority, OperationType, SyncStatus } from './../../models/entities'
import { API_ENDPOINTS } from 'src/core/constants/api.constants'

/**
 * Sync Engine Service
 * Core synchronization engine for offline-first data management
 * Aligned with backend sync routes from API_ENDPOINTS.SYNC
 */
export class SyncEngine {
  private db: BCMDatabase
  private networkMonitor: NetworkMonitor
  private conflictResolver: ConflictResolver
  private maxRetries: number = 5
  private batchSize: number
  private syncInProgress: boolean = false

  constructor(db?: BCMDatabase) {
    this.db = db || BCMDatabase.getInstance()
    this.networkMonitor = NetworkMonitor.getInstance()
    this.conflictResolver = new ConflictResolver()
    this.maxRetries = parseInt(import.meta.env.VITE_SYNC_MAX_RETRIES || '5')
    this.batchSize = parseInt(import.meta.env.VITE_SYNC_BATCH_SIZE || '50')
  }

  // ============================================
  // Initialization
  // ============================================

  async initialize(): Promise<void> {
    await this.networkMonitor.startMonitoring()
    console.log('✓ Sync engine initialized')
  }

  async cleanup(): Promise<void> {
    this.networkMonitor.stopMonitoring()
    console.log('✓ Sync engine cleaned up')
  }

  // ============================================
  // Network Status
  // ============================================

  async getNetworkStatus(): Promise<NetworkInfo> {
    return this.networkMonitor.getNetworkStatus()
  }

  // ============================================
  // Pending Changes Management
  // ============================================

  async getPendingChanges(): Promise<PendingChange[]> {
    const repo = this.db.getRepository('pendingChanges')
    return repo.getOrderedByPriority()
  }

  async addPendingChange(change: {
    entityType: string
    entityId: string
    operationType: OperationType
    data: Record<string, any>
    priority?: SyncPriority
  }): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    const now = new Date().toISOString()

    await repo.create({
      uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      entity_type: change.entityType,
      entity_id: change.entityId,
      operation_type: change.operationType,
      data: change.data,
      priority: change.priority || SyncPriority.MEDIUM,
      attempts: 0,
      sync_status: SyncStatus.PENDING,
      created_at: now,
      updated_at: now,
    })
  }

  async removePendingChange(id: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    await repo.delete(id)
  }

  async incrementAttempts(id: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    await repo.incrementAttempts(id)
  }

  async clearPendingChanges(): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    await repo.clearAll()
  }

  // ============================================
  // Push Changes (Local → Server)
  // ============================================

  /**
   * Push local pending changes to server
   * Uses API_ENDPOINTS.SYNC.PUSH
   */
  async pushChanges(): Promise<SyncPushResponse> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    this.syncInProgress = true

    try {
      const pendingChanges = await this.getPendingChanges()

      if (pendingChanges.length === 0) {
        return {
          success: true,
          appliedChanges: 0,
          conflicts: [],
          syncToken: (await this.getSyncToken()) || '',
        }
      }

      const sorted = pendingChanges.sort((a, b) => a.priority - b.priority)
      const batches = this.createBatches(sorted, this.batchSize)
      let appliedChanges = 0
      const allConflicts: SyncConflict[] = []

      for (const batch of batches) {
        const result = await this.pushBatch(batch)
        appliedChanges += result.appliedChanges
        allConflicts.push(...result.conflicts)
      }

      return {
        success: allConflicts.length === 0,
        appliedChanges,
        conflicts: allConflicts,
        syncToken: new Date().toISOString(),
      }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Push a batch of changes to the server
   * Uses API_ENDPOINTS.SYNC.PUSH endpoint
   */
  private async pushBatch(batch: PendingChange[]): Promise<{
    appliedChanges: number
    conflicts: SyncConflict[]
  }> {
    const response = await apiClient.post(API_ENDPOINTS.SYNC.PUSH, {
      changes: batch.map((c) => ({
        entityType: c.entity_type,
        entityId: c.entity_id,
        operationType: c.operation_type,
        data: c.data,
        version: c.version,
      })),
      lastSyncToken: await this.getSyncToken(),
    })

    const result = response.data
    const conflicts: SyncConflict[] = []

    if (result.appliedIds) {
      for (const id of result.appliedIds) {
        await this.removePendingChange(id)
      }
    }

    if (result.conflicts) {
      for (const conflict of result.conflicts) {
        const saved = await this.saveConflict(conflict)
        conflicts.push(saved)
      }
    }

    if (result.failedIds) {
      for (const id of result.failedIds) {
        await this.incrementAttempts(id)
      }
    }

    return {
      appliedChanges: result.appliedIds?.length || 0,
      conflicts,
    }
  }

  /**
   * Process a single change (for retry or manual sync)
   */
  async processChange(change: PendingChange): Promise<void> {
    const { entity_type, entity_id, operation_type, data } = change

    switch (operation_type) {
      case OperationType.CREATE:
        await apiClient.post(`/${entity_type}`, data)
        break
      case OperationType.UPDATE:
        await apiClient.put(`/${entity_type}/${entity_id}`, data)
        break
      case OperationType.DELETE:
        await apiClient.delete(`/${entity_type}/${entity_id}`)
        break
      default:
        throw new Error(`Unknown operation type: ${operation_type}`)
    }
  }

  // ============================================
  // Pull Changes (Server → Local)
  // ============================================

  /**
   * Pull changes from server
   * Uses API_ENDPOINTS.SYNC.PULL endpoint
   */
  async pullChanges(since?: string | null): Promise<SyncPullResponse> {
    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    try {
      const syncToken = since || (await this.getSyncToken())

      const response = await apiClient.get(API_ENDPOINTS.SYNC.PULL, {
        params: {
          since: syncToken,
          limit: this.batchSize,
        },
      })

      const result: SyncPullResponse = response.data

      if (result.changes && result.changes.length > 0) {
        for (const change of result.changes) {
          await this.applyRemoteChange(change)
        }
      }

      if (result.syncToken) {
        await this.setSyncToken(result.syncToken)
      }

      return result
    } catch (error) {
      console.error('Pull changes failed:', error)
      throw error
    }
  }

  /**
   * Apply a remote change to local database
   */
  async applyRemoteChange(change: SyncChange): Promise<void> {
    try {
      const repository = this.db.getRepository(change.entityType)

      if (!repository) {
        console.warn(`No repository found for entity type: ${change.entityType}`)
        return
      }

      switch (change.operationType) {
        case OperationType.CREATE:
        case OperationType.UPDATE: {
          const existing = await repository.findById(change.entityId)

          if (existing && existing.sync_status === 'PENDING') {
            await this.handlePotentialConflict(existing, change)
          } else {
            await repository.upsert({
              uuid: change.entityId,
              ...change.data,
              sync_status: SyncStatus.SYNCED,
            })
          }
          break
        }

        case OperationType.DELETE:
          await repository.delete(change.entityId)
          break
      }
    } catch (error) {
      console.error(
        `Failed to apply remote change for ${change.entityType}/${change.entityId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Handle potential conflict between local and remote changes
   */
  private async handlePotentialConflict(localData: any, remoteChange: SyncChange): Promise<void> {
    const conflictType = this.conflictResolver.detectConflict(localData, remoteChange.data)

    if (conflictType) {
      await this.saveConflict({
        entity_id: remoteChange.entityId,
        entity_type: remoteChange.entityType,
        client_version: localData,
        server_version: remoteChange.data,
        conflict_type: conflictType,
        detected_at: new Date().toISOString(),
        resolved: false,
      })
    } else {
      const repository = this.db.getRepository(remoteChange.entityType)
      await repository.upsert({
        uuid: remoteChange.entityId,
        ...remoteChange.data,
        sync_status: SyncStatus.SYNCED,
      })
    }
  }

  // ============================================
  // Conflict Management
  // ============================================

  /**
   * Save a conflict record
   * Uses API_ENDPOINTS.SYNC.CONFLICTS for server sync
   */
  async saveConflict(conflictData: Partial<SyncConflict>): Promise<SyncConflict> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    const conflict = await conflictRepo.create({
      uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      ...conflictData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: SyncStatus.CONFLICT,
    })

    // If online, sync conflict to server immediately
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.CONFLICTS, conflict)
      } catch (error) {
        console.warn('Failed to sync conflict to server:', error)
      }
    }

    return conflict
  }

  /**
   * Get all conflicts from local database
   */
  async getConflicts(): Promise<SyncConflict[]> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    return conflictRepo.findAll()
  }

  /**
   * Get unresolved conflicts only
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    const all = await conflictRepo.findAll()
    return all.filter((c: SyncConflict) => !c.resolved)
  }

  /**
   * Resolve a conflict
   * Uses API_ENDPOINTS.SYNC.RESOLVE_CONFLICT
   */
  async resolveConflict(
    conflictId: string,
    resolution: {
      strategy: 'client-wins' | 'server-wins' | 'custom'
      resolvedData?: Record<string, any>
      userId?: string
      notes?: string
    }
  ): Promise<void> {
    // Resolve locally first
    await this.conflictResolver.resolve(conflictId, {
      strategy: resolution.strategy as ConflictResolutionStrategy,
      resolvedData: resolution.resolvedData,
      userId: resolution.userId || 'system',
      notes: resolution.notes,
    } as any)

    // If online, sync resolution to server
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.CONFLICT_RESOLVE(conflictId), {
          strategy: resolution.strategy,
          resolvedData: resolution.resolvedData,
          userId: resolution.userId || 'system',
          notes: resolution.notes,
        })
      } catch (error) {
        console.warn('Failed to sync conflict resolution to server:', error)
      }
    }
  }

  // ============================================
  // Sync Token Management
  // ============================================

  /**
   * Get current sync token
   * Uses API_ENDPOINTS.SYNC.METADATA for server sync
   */
  async getSyncToken(): Promise<string | null> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    return metadataRepo.getLastSyncToken()
  }

  /**
   * Set sync token
   */
  async setSyncToken(token: string): Promise<void> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    await metadataRepo.setLastSyncToken(token)

    // If online, sync token to server
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.METADATA, {
          key: 'last_sync_token',
          value: token,
        })
      } catch (error) {
        console.warn('Failed to sync token to server:', error)
      }
    }
  }

  /**
   * Get sync metadata by key
   */
  async getSyncMetadata(key?: string): Promise<SyncMetadata | null> {
    const metadataRepo = this.db.getRepository('syncMetadata')

    if (key) {
      return metadataRepo.getByKey(key)
    }

    const token = await metadataRepo.getLastSyncToken()
    const time = await metadataRepo.getLastSyncTime()

    if (token || time) {
      return {
        key: 'sync_state',
        value: JSON.stringify({ token, lastSyncTime: time }),
        uuid: 'sync_metadata',
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_by: 'system',
        updated_at: new Date().toISOString(),
        version: 1,
        sync_status: SyncStatus.SYNCED,
      }
    }

    return null
  }

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(key: string, value: string): Promise<void> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    const existing = await metadataRepo.getByKey(key)

    if (existing) {
      await metadataRepo.update(existing.uuid, { value, updated_at: new Date().toISOString() })
    } else {
      await metadataRepo.create({
        key,
        value,
        uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_by: 'system',
        updated_at: new Date().toISOString(),
        version: 1,
        sync_status: SyncStatus.SYNCED,
      })
    }

    // If online, sync metadata to server
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.METADATA, { key, value })
      } catch (error) {
        console.warn('Failed to sync metadata to server:', error)
      }
    }
  }

  /**
   * Get sync status from server
   * Uses API_ENDPOINTS.SYNC.STATUS
   */
  async getServerSyncStatus(): Promise<{
    lastSyncToken: string | null
    lastSyncTime: string | null
    pendingServerChanges: number
  } | null> {
    if (!this.networkMonitor.isOnline) {
      return null
    }

    try {
      const response = await apiClient.get(API_ENDPOINTS.SYNC.STATUS)
      return response.data
    } catch (error) {
      console.error('Failed to get server sync status:', error)
      return null
    }
  }

  // ============================================
  // Full Sync Operations
  // ============================================

  /**
   * Perform a full sync (push then pull)
   */
  async fullSync(): Promise<{
    pushResult: SyncPushResponse
    pullResult: SyncPullResponse | null
  }> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    this.syncInProgress = true

    try {
      // First push local changes
      const pushResult = await this.pushChanges()

      // Then pull remote changes
      let pullResult: SyncPullResponse | null = null
      if (pushResult.success) {
        pullResult = await this.pullChanges()
      } else {
        // If push had conflicts, still try to pull
        pullResult = await this.pullChanges()
      }

      // Update last sync time
      await this.updateSyncMetadata('last_sync_time', new Date().toISOString())

      return { pushResult, pullResult }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Clear all pending changes (use with caution)
   * Uses API_ENDPOINTS.SYNC.CLEAR_PENDING
   */
  async clearAllPendingChanges(): Promise<void> {
    await this.clearPendingChanges()

    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.PENDING_CHANGES_CLEANUP)
      } catch (error) {
        console.warn('Failed to clear pending changes on server:', error)
      }
    }
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * Create batches from array of items
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Get sync statistics
   */
  async getStats(): Promise<{
    pendingChanges: number
    conflicts: number
    unresolvedConflicts: number
    lastSyncTime: string | null
    lastSyncToken: string | null
    isOnline: boolean
    syncInProgress: boolean
  }> {
    const pendingRepo = this.db.getRepository('pendingChanges')
    const conflictRepo = this.db.getRepository('syncConflicts')
    const metadataRepo = this.db.getRepository('syncMetadata')

    const [pendingCount, conflicts, token, lastTime] = await Promise.all([
      pendingRepo.getPendingCount(),
      conflictRepo.findAll(),
      metadataRepo.getLastSyncToken(),
      metadataRepo.getLastSyncTime(),
    ])

    return {
      pendingChanges: pendingCount,
      conflicts: conflicts.length,
      unresolvedConflicts: conflicts.filter((c: SyncConflict) => !c.resolved).length,
      lastSyncTime: lastTime,
      lastSyncToken: token,
      isOnline: this.networkMonitor.isOnline,
      syncInProgress: this.syncInProgress,
    }
  }

  /**
   * Retry failed sync operations
   */
  async retryFailedSyncs(): Promise<number> {
    const pendingRepo = this.db.getRepository('pendingChanges')
    const failedChanges = await pendingRepo.getFailedChanges()

    if (failedChanges.length === 0) {
      return 0
    }

    let retried = 0
    for (const change of failedChanges) {
      try {
        await this.processChange(change)
        await this.removePendingChange(change.uuid)
        retried++
      } catch (error) {
        console.error(`Failed to retry change ${change.uuid}:`, error)
        await this.incrementAttempts(change.uuid)
      }
    }

    return retried
  }
}
