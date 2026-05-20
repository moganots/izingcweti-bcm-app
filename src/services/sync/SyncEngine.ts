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
} from './../../models/entities'
import { SyncPriority, OperationType, SyncStatus } from './../../models/entities'

/**
 * Sync Engine Service
 * Core synchronization engine for offline-first data management
 */
export class SyncEngine {
  private db: BCMDatabase
  private networkMonitor: NetworkMonitor
  private conflictResolver: ConflictResolver
  private maxRetries: number
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

  private async pushBatch(batch: PendingChange[]): Promise<{
    appliedChanges: number
    conflicts: SyncConflict[]
  }> {
    const response = await apiClient.post('/sync/push', {
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

  async pullChanges(since?: string | null): Promise<SyncPullResponse> {
    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    try {
      const response = await apiClient.get('/sync/pull', {
        params: {
          since: since || (await this.getSyncToken()),
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

  async saveConflict(conflictData: Partial<SyncConflict>): Promise<SyncConflict> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    return conflictRepo.create({
      uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      ...conflictData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: SyncStatus.CONFLICT,
    })
  }

  async getConflicts(): Promise<SyncConflict[]> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    return conflictRepo.findAll()
  }

  async resolveConflict(conflictId: string, resolution: any): Promise<void> {
    await this.conflictResolver.resolve(conflictId, {
      strategy: resolution.strategy,
      resolvedData: resolution.resolvedData,
      userId: resolution.userId || 'system',
      notes: resolution.notes,
    })
  }

  // ============================================
  // Sync Token Management
  // ============================================

  async getSyncToken(): Promise<string | null> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    return metadataRepo.getLastSyncToken()
  }

  async setSyncToken(token: string): Promise<void> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    await metadataRepo.setLastSyncToken(token)
  }

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
  }

  // ============================================
  // Helpers
  // ============================================

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  async getStats(): Promise<{
    pendingChanges: number
    conflicts: number
    unresolvedConflicts: number
    lastSyncTime: string | null
    lastSyncToken: string | null
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
    }
  }
}
