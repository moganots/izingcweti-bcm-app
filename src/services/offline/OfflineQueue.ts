import { NetworkMonitor } from './NetworkMonitor'
import { SyncEngine } from './SyncEngine'
import { OperationType, SyncPriority, PendingChangeStatus } from '../../types/sync.types'

/**
 * Offline Queue Service
 * 
 * Manages operations performed while offline:
 * - Persists them to IndexedDB
 * - Processes them in priority order when back online
 * - Handles retries and failures
 * 
 */
export class OfflineQueue {
  private networkMonitor: NetworkMonitor
  private syncEngine: SyncEngine
  private processing = false
  private removeListener: (() => void) | null = null

  constructor(networkMonitor?: NetworkMonitor, syncEngine?: SyncEngine) {
    this.networkMonitor = networkMonitor || NetworkMonitor.getInstance()
    this.syncEngine = syncEngine || new SyncEngine()

    // Auto-process when connection returns
    this.removeListener = this.networkMonitor.addListener(() => {
      if (this.networkMonitor.isOnline && !this.processing) {
        this.process().catch(console.error)
      }
    })
  }

  setSyncEngine(syncEngine: SyncEngine): void {
    this.syncEngine = syncEngine
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
    await this.syncEngine.addPendingChange({
      entityType: operation.entityType,
      entityId: operation.entityId,
      operationType: operation.operationType,
      data: operation.data,
      priority: operation.priority || this.getOperationPriority(operation.operationType),
    })

    // If online, try to process immediately
    if (this.networkMonitor.isOnline) {
      this.process().catch(console.error)
    }
  }

  /**
   * Process the offline queue
   */
    async process(): Promise<void> {
    if (this.processing || !this.syncEngine || !this.networkMonitor.isOnline) {
      return
    }
    this.processing = true
    try {
      const changes = await this.syncEngine.getPendingChanges()
      if (changes.length === 0) {
        console.log('[OfflineQueue] ✓ No pending changes')
        return
      }
      console.log(`[OfflineQueue] 🔄 Processing ${changes.length} changes...`)

      const sorted = [...changes].sort(
        (a, b) => (a.priority ?? 3) - (b.priority ?? 3),
      )

      for (const change of sorted) {
        try {
          const result = await this.syncEngine.processChange(change)
          if (result.success) {
            await this.syncEngine.removePendingChange(change.uuid)
            console.log(
              `[OfflineQueue]   ✓ ${change.operationType} ${change.entityType}/${change.entityId}`,
            )
          } else {
            await this.handleError(change, { message: result.error ?? 'Unknown error' })
          }
        } catch (error: any) {
          await this.handleError(change, error)
        }
      }
      console.log('[OfflineQueue] ✓ Queue processing completed')
    } finally {
      this.processing = false
    }
  }

  /**
   * Handle errors during queue processing.
   */
  private async handleError(change: any, error: any): Promise<void> {
    // 1. Conflict (HTTP 409) → save conflict record, remove from queue.
    if (error?.status === 409 || error?.response?.status === 409) {
      try {
        await this.syncEngine.saveConflict({
          entityId: change.entityId,
          entityType: change.entityType,
          clientVersion: change.data,
          serverVersion: error?.response?.data ?? error?.details ?? {},
          conflictType: 'UPDATE_UPDATE' as any,
          detectedAt: new Date().toISOString(),
          resolved: false,
          autoResolvable: false,
          autoResolved: false,
        } as any)
      } catch (saveErr) {
        console.error('[OfflineQueue] Failed to save conflict:', saveErr)
      }
      await this.syncEngine.removePendingChange(change.uuid)
      return
    }

    // 2. Increment attempt counter.
    const attempts = (change.attempts ?? 0) + 1
    const maxAttempts = 5

    if (attempts >= maxAttempts) {
      console.warn(
        `[OfflineQueue] Max retries exceeded for ${change.entityType}/${change.entityId}`,
      )
      await this.syncEngine.markFailed(
        change.uuid,
        error?.message ?? 'Unknown error',
      )
      return
    }

    await this.syncEngine.incrementAttempts(change.uuid)

    // 3. Schedule retry with exponential backoff.
    const delay = Math.min(1_000 * 2 ** attempts, 30_000)
    setTimeout(() => this.process().catch(console.error), delay)
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number
    pending: number
    failed: number
    byPriority: Record<number, number>
    byType: Record<string, number>
  }> {
    if (!this.syncEngine) {
      return { total: 0, pending: 0, failed: 0, byPriority: {}, byType: {} }
    }

    const changes = await this.syncEngine.getPendingChanges()

    const byPriority: Record<number, number> = {}
    const byType: Record<string, number> = {}
    let failed = 0

    for (const change of changes) {
      const priority = change.priority || 3
      byPriority[priority] = (byPriority[priority] || 0) + 1
      byType[change.operationType] = (byType[change.operationType] || 0) + 1

      if ((change.attempts || 0) >= 5) {
        failed++
      }
    }

    return {
      total: changes.length,
      pending: changes.length - failed,
      failed,
      byPriority,
      byType,
    }
  }

  /**
   * Clear all failed changes (exceeded max retries)
   */
  async clearFailed(): Promise<number> {
    if (!this.syncEngine) return 0

    const changes = await this.syncEngine.getPendingChanges()
    const failed = changes.filter((c) => (c.attempts || 0) >= 5)

    for (const change of failed) {
      await this.syncEngine.removePendingChange(change.uuid)
    }

    return failed.length
  }

  /**
   * Retry all failed changes
   */
    async retryFailed(): Promise<void> {
    if (!this.syncEngine) return
    const changes = await this.syncEngine.getPendingChanges()
    const failed = changes.filter((c) => (c.attempts ?? 0) >= 5)
    for (const change of failed) {
      await this.syncEngine.resetAttempts(change.uuid)
    }
    await this.process()
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

  destroy(): void {
    if (this.removeListener) {
      this.removeListener()
      this.removeListener = null
    }
  }
}

// Export singleton
export const offlineQueue = new OfflineQueue()