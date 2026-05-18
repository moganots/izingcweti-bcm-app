import { Database } from '..'
import { OperationType, SyncPriority, SyncStatus } from './../../models/entities'
import type { PendingChange } from './../../models/entities'
import { NetworkMonitor } from './NetworkMonitor'
import { SyncEngine } from './SyncEngine'

/**
 * Offline Queue Service
 * Manages the queue of operations performed while offline
 */
export class OfflineQueue {
  private db: Database
  private networkMonitor: NetworkMonitor
  private syncEngine: SyncEngine
  private processingQueue: boolean = false

  constructor() {
    this.db = Database.getInstance()
    this.networkMonitor = new NetworkMonitor()
    this.syncEngine = new SyncEngine()

    // Listen for online status to process queue
    this.networkMonitor.addListener((status) => {
      if (status.isOnline) {
        this.processQueue()
      }
    })
  }

  /**
   * Add an operation to the offline queue
   */
  async enqueue(operation: {
    entityType: string
    entityId: string
    operationType: OperationType
    data: Record<string, any>
    priority?: SyncPriority
  }): Promise<void> {
    // Save to local database first
    await this.saveLocally(operation)

    // Add to pending changes queue
    await this.syncEngine.addPendingChange({
      entityType: operation.entityType,
      entityId: operation.entityId,
      operationType: operation.operationType,
      data: operation.data,
      priority: operation.priority || this.getOperationPriority(operation.operationType),
    })

    // If online, try to process immediately
    if (this.networkMonitor.isOnline) {
      this.processQueue().catch(console.error)
    }
  }

  /**
   * Process the offline queue
   */
  async processQueue(): Promise<void> {
    if (this.processingQueue) return
    if (!this.networkMonitor.isOnline) return

    this.processingQueue = true

    try {
      const pendingChanges = await this.syncEngine.getPendingChanges()

      if (pendingChanges.length === 0) {
        console.log('✓ No pending changes to process')
        return
      }

      console.log(`🔄 Processing ${pendingChanges.length} pending changes...`)

      // Process changes in priority order
      const sorted = pendingChanges.sort((a, b) => a.priority - b.priority)

      for (const change of sorted) {
        try {
          await this.syncEngine.processChange(change)
          await this.syncEngine.removePendingChange(change.uuid)
          console.log(
            `  ✓ Processed ${change.operation_type} for ${change.entity_type}/${change.entity_id}`
          )
        } catch (error: any) {
          console.error(`  ✗ Failed to process change:`, error.message)

          // Handle conflicts
          if (error.response?.status === 409) {
            await this.syncEngine.saveConflict({
              entity_id: change.entity_id,
              entity_type: change.entity_type,
              client_version: change.data,
              server_version: error.response.data,
              conflict_type: 'UPDATE_UPDATE',
              detected_at: new Date().toISOString(),
              resolved: false,
            } as any)
            await this.syncEngine.removePendingChange(change.uuid)
          } else {
            // Increment retry count
            await this.syncEngine.incrementAttempts(change.uuid)

            // If max retries exceeded, mark as failed
            if (change.attempts >= 5) {
              console.warn(`  ⚠ Max retries exceeded for ${change.entity_type}/${change.entity_id}`)
            }
          }
        }
      }

      console.log('✓ Queue processing completed')
    } finally {
      this.processingQueue = false
    }
  }

  /**
   * Save operation to local database before syncing
   */
  private async saveLocally(operation: {
    entityType: string
    entityId: string
    operationType: OperationType
    data: Record<string, any>
  }): Promise<void> {
    try {
      const repository = this.db.getRepository(operation.entityType)
      if (!repository) return

      switch (operation.operationType) {
        case OperationType.CREATE:
          await repository.create({
            uuid: operation.entityId,
            ...operation.data,
            sync_status: SyncStatus.PENDING,
          })
          break

        case OperationType.UPDATE:
          await repository.upsert({
            uuid: operation.entityId,
            ...operation.data,
            sync_status: SyncStatus.PENDING,
          })
          break

        case OperationType.DELETE:
          const now = new Date().toISOString()
          await repository.update(operation.entityId, {
            deleted_at: now,
            sync_status: SyncStatus.PENDING,
          } as any)
          break
      }
    } catch (error) {
      console.error('Failed to save locally:', error)
    }
  }

  /**
   * Get priority for an operation type
   */
  private getOperationPriority(operationType: OperationType): SyncPriority {
    switch (operationType) {
      case OperationType.DELETE:
        return SyncPriority.HIGHEST
      case OperationType.UPDATE:
        return SyncPriority.HIGH
      case OperationType.CREATE:
        return SyncPriority.MEDIUM
      default:
        return SyncPriority.LOW
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number
    byPriority: Record<number, number>
    byType: Record<string, number>
    failed: number
  }> {
    const changes = await this.syncEngine.getPendingChanges()
    const byPriority: Record<number, number> = {}
    const byType: Record<string, number> = {}

    changes.forEach((c) => {
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1
      byType[c.operation_type] = (byType[c.operation_type] || 0) + 1
    })

    return {
      total: changes.length,
      byPriority,
      byType,
      failed: changes.filter((c) => c.attempts >= 5).length,
    }
  }

  /**
   * Clear all failed changes (exceeded max retries)
   */
  async clearFailed(): Promise<number> {
    const changes = await this.syncEngine.getPendingChanges()
    const failed = changes.filter((c) => c.attempts >= 5)

    for (const change of failed) {
      await this.syncEngine.removePendingChange(change.uuid)
    }

    return failed.length
  }

  /**
   * Retry all failed changes
   */
  async retryFailed(): Promise<void> {
    const changes = await this.syncEngine.getPendingChanges()
    const failed = changes.filter((c) => c.attempts >= 5)

    for (const change of failed) {
      const repo = this.db.getRepository('pendingChanges')
      await repo.update(change.uuid, { attempts: 0 } as Partial<PendingChange>)
    }

    await this.processQueue()
  }
}
