import { db } from '../db/Database'
import { NetworkMonitor } from '../sync/NetworkMonitor'
import { SyncEngine } from '../sync/SyncEngine'
import type { BaseEntity } from '../../core/base/base.entity'
import {
  OperationType,
  SyncPriority,
} from '../../types/sync.types'

/**
 * Offline-First CRUD Service
 *
 * Provides a unified interface for CRUD operations that:
 * 1. Always writes to local IndexedDB first (offline-first)
 * 2. Queues changes for sync when online
 * 3. Attempts immediate sync if online
 * 4. Handles soft deletes and conflict detection
 * 
 * IMPORTANT: All entity field names use camelCase to match frontend entities.
 */
export class OfflineCrudService {
  private networkMonitor: NetworkMonitor
  private syncEngine: SyncEngine | null = null

  constructor(networkMonitor: NetworkMonitor) {
    this.networkMonitor = networkMonitor
  }

  /**
   * Inject the sync engine (avoids circular dependency)
   */
  setSyncEngine(syncEngine: SyncEngine): void {
    this.syncEngine = syncEngine
  }

    /**
   * Fire-and-forget sync attempt after a local write.
   */
  private triggerSync(): void {
    if (!this.networkMonitor.isOnline || !this.syncEngine) return
    // Push in the background; full sync handled by the app shell.
    this.syncEngine
      .pushChanges()
      .catch((err) => console.warn('[OfflineCrudService] Background push failed:', err))
  }

  // ============================================
  // READ OPERATIONS (Local-first)
  // ============================================

  /**
   * Get an entity by UUID
   */
  async getById<T extends BaseEntity>(
    tableName: string,
    uuid: string
  ): Promise<T | null> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)
    return (await repo.findById(uuid)) as T | null
  }

  /**
   * Get all entities from a table
   */
  async getAll<T extends BaseEntity>(tableName: string): Promise<T[]> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)
    return (await repo.findAll()) as T[]
  }

  /**
   * Query entities with filters
   */
  async query<T extends BaseEntity>(
    tableName: string,
    filter: Record<string, any>
  ): Promise<T[]> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)
    return (await repo.findWhere(filter)) as T[]
  }

  /**
   * Get entities with pagination
   */
  async paginate<T extends BaseEntity>(
    tableName: string,
    filter: Record<string, any>,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)
    return (await repo.findWithPagination(filter, page, limit)) as any
  }

  // ============================================
  // WRITE OPERATIONS (Offline-first)
  // ============================================

  /**
   * Create an entity locally and queue for sync
   */
  async create<T extends BaseEntity>(
    tableName: string,
    data: Partial<T>,
    options?: { syncNow?: boolean; priority?: SyncPriority }
  ): Promise<T> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    // 1. Write to local database (camelCase fields)
    const entity = (await repo.create({
      ...data,
      uuid: data.uuid || this.generateUuid(),
      syncStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    })) as T

    // 2. Queue for sync
    await this.queueOperation({
      entityType: tableName,
      entityId: entity.uuid,
      operationType: OperationType.CREATE,
      data: entity,
      priority: options?.priority ?? SyncPriority.MEDIUM,
    })

    // 3. Attempt sync if online
    if (options?.syncNow !== false) {
      this.triggerSync()
    }

    return entity
  }

  /**
   * Update an entity locally and queue for sync
   */
  async update<T extends BaseEntity>(
    tableName: string,
    uuid: string,
    data: Partial<T>,
    options?: { syncNow?: boolean; priority?: SyncPriority }
  ): Promise<T | null> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    // 1. Check entity exists
    const existing = await repo.findById(uuid)
    if (!existing) return null

    // 2. Write to local database (camelCase fields)
    const entity = (await repo.update(uuid, {
      ...data,
      syncStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
    })) as T

    // 3. Queue for sync
    await this.queueOperation({
      entityType: tableName,
      entityId: uuid,
      operationType: OperationType.UPDATE,
      data: entity,
      priority: options?.priority ?? SyncPriority.HIGH,
    })

    // 4. Attempt sync if online
    if (options?.syncNow !== false) {
      this.triggerSync()
    }

    return entity
  }

  /**
   * Soft delete an entity locally and queue for sync
   */
  async delete(
    tableName: string,
    uuid: string,
    options?: { syncNow?: boolean; hard?: boolean; priority?: SyncPriority }
  ): Promise<boolean> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    // 1. Check entity exists
    const existing = await repo.findById(uuid)
    if (!existing) return false

    if (options?.hard) {
      // Hard delete - remove immediately
      await repo.delete(uuid)
    } else {
      // Soft delete - mark as deleted (camelCase fields)
      await repo.softDelete(uuid, 'system')
    }

    // 2. Queue for sync
    await this.queueOperation({
      entityType: tableName,
      entityId: uuid,
      operationType: OperationType.DELETE,
      data: existing,
      priority: options?.priority ?? SyncPriority.HIGHEST,
    })

    // 3. Attempt sync if online
    if (options?.syncNow !== false) {
      this.triggerSync()
    }

    return true
  }

  /**
   * Restore a soft-deleted entity
   */
  async restore<T extends BaseEntity>(
    tableName: string,
    uuid: string
  ): Promise<T | null> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    const existing = await repo.findById(uuid)
    if (!existing || !existing.deletedAt) return null

    return (await repo.restore(uuid)) as T | null
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk create entities
   */
  async bulkCreate<T extends BaseEntity>(
    tableName: string,
    items: Partial<T>[]
  ): Promise<T[]> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    // 1. Bulk create locally
    const entities = (await repo.bulkCreate(items)) as T[]

    // 2. Queue each for sync
    for (const entity of entities) {
      await this.queueOperation({
        entityType: tableName,
        entityId: entity.uuid,
        operationType: OperationType.CREATE,
        data: entity,
        priority: SyncPriority.MEDIUM,
      })
    }

    // 3. Attempt sync if online
    if (options?.syncNow !== false) {
      this.triggerSync()
    }

    return entities
  }

  /**
   * Bulk update entities
   */
  async bulkUpdate<T extends BaseEntity>(
    tableName: string,
    updates: Array<{ uuid: string; data: Partial<T> }>
  ): Promise<void> {
    const repo = db.getRepository(tableName)
    if (!repo) throw new Error(`Table not found: ${tableName}`)

    // 1. Bulk update locally
    await repo.bulkUpdate(updates)

    // 2. Queue each for sync
    for (const { uuid, data } of updates) {
      await this.queueOperation({
        entityType: tableName,
        entityId: uuid,
        operationType: OperationType.UPDATE,
        data,
        priority: SyncPriority.HIGH,
      })
    }

    // 3. Attempt sync if online
    if (options?.syncNow !== false) {
      this.triggerSync()
    }
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  /**
   * Queue an operation for sync
   */
  private async queueOperation(operation: {
    entityType: string
    entityId: string
    operationType: OperationType
    data: Record<string, any>
    priority: SyncPriority
  }): Promise<void> {
    if (!this.syncEngine) {
      console.warn('[OfflineCrudService] SyncEngine not set — change queued locally only')
      return
    }
    await this.syncEngine.addPendingChange({
      entityType: operation.entityType,
      entityId: operation.entityId,
      operationType: operation.operationType,
      data: operation.data,
      priority: operation.priority,
    })
  }

  /**
   * Check if an entity has pending changes
   */
  async hasPendingChanges(
    tableName: string,
    uuid: string
  ): Promise<boolean> {
    if (!this.syncEngine || !this.syncEngine.getPendingChanges) return false

    const changes = await this.syncEngine.getPendingChanges()
    return changes.some(
      (c: any) => c.entityType === tableName && c.entityId === uuid
    )
  }

  /**
   * Get count of pending changes for a table
   */
  async getPendingCount(tableName: string): Promise<number> {
    if (!this.syncEngine || !this.syncEngine.getPendingChanges) return 0

    const changes = await this.syncEngine.getPendingChanges()
    return changes.filter((c: any) => c.entityType === tableName).length
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }
}

// ============================================
// Singleton Factory
// ============================================

let offlineCrudServiceInstance: OfflineCrudService | null = null

export function getOfflineCrudService(
  networkMonitor: NetworkMonitor
): OfflineCrudService {
  if (!offlineCrudServiceInstance) {
    offlineCrudServiceInstance = new OfflineCrudService(networkMonitor)
  }
  return offlineCrudServiceInstance
}