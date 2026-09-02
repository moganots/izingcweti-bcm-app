import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  PendingChange,
  SyncConflict,
  SyncMetadata,
  SyncPriority,
  OperationType,
  SyncStatus,
  ConflictType,
  ConflictResolutionStrategy,
} from './../../../../models/entities'

/**
 * Pending Change Repository
 * Handles CRUD operations for PendingChange entities with camelCase field names
 * Aligned with sync.entity.ts
 */
export class PendingChangeRepository extends BaseRepository<PendingChange> {
  constructor(table: Table<PendingChange, string>) {
    super(table, 'pending_changes')
  }

  /**
   * Find pending changes by entity type and ID
   */
  async findByEntity(entityType: string, entityId: string): Promise<PendingChange[]> {
    return this.table
      .filter((c) => c.entityType === entityType && c.entityId === entityId)
      .toArray()
  }

  /**
   * Find pending changes by entity type
   */
  async findByEntityType(entityType: string): Promise<PendingChange[]> {
    return this.findMany({ entityType } as Partial<PendingChange>)
  }

  /**
   * Find pending changes by entity ID
   */
  async findByEntityId(entityId: string): Promise<PendingChange[]> {
    return this.findMany({ entityId } as Partial<PendingChange>)
  }

  /**
   * Find pending changes by priority
   */
  async findByPriority(priority: SyncPriority): Promise<PendingChange[]> {
    return this.findMany({ priority } as Partial<PendingChange>)
  }

  /**
   * Find pending changes by operation type
   */
  async findByOperationType(operationType: OperationType): Promise<PendingChange[]> {
    return this.findMany({ operationType } as Partial<PendingChange>)
  }

  /**
   * Find pending changes by sync status
   */
  async findBySyncStatus(status: SyncStatus): Promise<PendingChange[]> {
    return this.findMany({ syncStatus: status } as Partial<PendingChange>)
  }

  /**
   * Get pending changes ordered by priority (highest first)
   */
  async getOrderedByPriority(): Promise<PendingChange[]> {
    const changes = await this.table.toCollection().toArray()
    // Sort by priority ascending (1 = highest priority)
    changes.sort((a, b) => {
      const priorityA = typeof a.priority === 'number' ? a.priority : 999
      const priorityB = typeof b.priority === 'number' ? b.priority : 999
      return priorityA - priorityB
    })
    return changes
  }

  /**
   * Get pending changes ordered by creation date (oldest first)
   */
  async getOrderedByDate(): Promise<PendingChange[]> {
    const changes = await this.table.toCollection().toArray()
    changes.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt ?? '')
      const dateB = b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? '')
      return dateA.localeCompare(dateB)
    })
    return changes
  }

  /**
   * Get pending changes with pagination
   */
  async getWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      entityType?: string
      entityId?: string
      operationType?: OperationType
      syncStatus?: SyncStatus
      priority?: SyncPriority
    }
  ): Promise<{ data: PendingChange[]; total: number; page: number; limit: number }> {
    let results = await this.findAll()

    // Apply filters
    if (filters?.entityType) {
      results = results.filter((c) => c.entityType === filters.entityType)
    }
    if (filters?.entityId) {
      results = results.filter((c) => c.entityId === filters.entityId)
    }
    if (filters?.operationType) {
      results = results.filter((c) => c.operationType === filters.operationType)
    }
    if (filters?.syncStatus) {
      results = results.filter((c) => c.syncStatus === filters.syncStatus)
    }
    if (filters?.priority) {
      results = results.filter((c) => c.priority === filters.priority)
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    // Sort by priority then createdAt
    const sorted = results.sort((a, b) => {
      const priorityDiff = (a.priority || 999) - (b.priority || 999)
      if (priorityDiff !== 0) return priorityDiff
      const dateA =
        a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt ?? '')
      const dateB =
        b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? '')
      return dateA.localeCompare(dateB)
    })

    const data = sorted.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Get failed changes that have exceeded max retry attempts
   */
  async getFailedChanges(maxAttempts: number = 5): Promise<PendingChange[]> {
    return this.table
      .filter((c) => {
        const attempts = c.attempts
        return typeof attempts === 'number' && attempts >= maxAttempts
      })
      .toArray()
  }

  /**
   * Get retryable changes (failed but under max attempts)
   */
  async getRetryableChanges(maxAttempts: number = 5): Promise<PendingChange[]> {
    return this.table
      .filter((c) => {
        const attempts = c.attempts
        return (
          typeof attempts === 'number' &&
          attempts > 0 &&
          attempts < maxAttempts &&
          c.syncStatus === SyncStatus.PENDING
        )
      })
      .toArray()
  }

  /**
   * Increment the retry attempts counter for a pending change
   */
  async incrementAttempts(uuid: string): Promise<void> {
    const change = await this.findById(uuid)
    if (!change) return

    const currentAttempts = typeof change.attempts === 'number' ? change.attempts : 0

    await this.update(uuid, {
      attempts: currentAttempts + 1,
      updatedAt: new Date().toISOString(),
    } as Partial<PendingChange>)
  }

  /**
   * Reset retry attempts for a pending change
   */
  async resetAttempts(uuid: string): Promise<void> {
    await this.update(uuid, {
      attempts: 0,
      updatedAt: new Date().toISOString(),
    } as Partial<PendingChange>)
  }

  /**
   * Update sync status of a pending change
   */
  async updateSyncStatus(uuid: string, status: SyncStatus): Promise<void> {
    await this.update(uuid, {
      syncStatus: status,
      updatedAt: new Date().toISOString(),
    } as Partial<PendingChange>)
  }

  /**
   * Get total count of pending changes
   */
  async getCount(): Promise<number> {
    return this.table.count()
  }

  /**
   * Get count of pending (not yet processed) changes
   */
  async getPendingCount(): Promise<number> {
    const pendingChanges = await this.table
      .filter((c) => c.syncStatus === SyncStatus.PENDING)
      .toArray()
    return pendingChanges.length
  }

  /**
   * Get count of changes by entity type
   */
  async getCountByEntityType(entityType: string): Promise<number> {
    const changes = await this.table
      .filter((c) => c.entityType === entityType)
      .toArray()
    return changes.length
  }

  /**
   * Get count of changes by operation type
   */
  async getCountByOperationType(operationType: OperationType): Promise<number> {
    const changes = await this.table
      .filter((c) => c.operationType === operationType)
      .toArray()
    return changes.length
  }

  /**
   * Get statistics for pending changes
   */
  async getStats(): Promise<{
    total: number
    pending: number
    synced: number
    conflict: number
    failed: number
    byEntityType: Record<string, number>
    byOperationType: Record<OperationType, number>
    byPriority: Record<SyncPriority, number>
  }> {
    const all = await this.table.toCollection().toArray()
    const byEntityType: Record<string, number> = {}
    const byOperationType: Record<OperationType, number> = {
      [OperationType.CREATE]: 0,
      [OperationType.UPDATE]: 0,
      [OperationType.DELETE]: 0,
    }
    const byPriority: Record<SyncPriority, number> = {
      [SyncPriority.HIGHEST]: 0,
      [SyncPriority.HIGH]: 0,
      [SyncPriority.MEDIUM]: 0,
      [SyncPriority.LOW]: 0,
    }

    for (const c of all) {
      // Count by entity type
      if (c.entityType) {
        byEntityType[c.entityType] = (byEntityType[c.entityType] || 0) + 1
      }
      // Count by operation type
      if (c.operationType) {
        byOperationType[c.operationType] = (byOperationType[c.operationType] || 0) + 1
      }
      // Count by priority
      if (typeof c.priority === 'number') {
        byPriority[c.priority] = (byPriority[c.priority] || 0) + 1
      }
    }

    return {
      total: all.length,
      pending: all.filter((c) => c.syncStatus === SyncStatus.PENDING).length,
      synced: all.filter((c) => c.syncStatus === SyncStatus.SYNCED).length,
      conflict: all.filter((c) => c.syncStatus === SyncStatus.CONFLICT).length,
      failed: all.filter((c) => typeof c.attempts === 'number' && c.attempts >= 5).length,
      byEntityType,
      byOperationType,
      byPriority,
    }
  }

  /**
   * Delete pending changes older than days
   */
  async cleanupOld(daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)

    const all = await this.findAll()
    const oldChanges = all.filter((c) => {
      const date = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt)
      return date < cutoff
    })

    if (oldChanges.length > 0) {
      const ids = oldChanges.map((c) => c.uuid)
      await this.deleteMany(ids)
    }

    return oldChanges.length
  }

  /**
   * Find changes by sync token
   */
  async findBySyncToken(_syncToken: string): Promise<PendingChange[]> {
    // This would require a syncToken field on PendingChange
    // For now, return all pending changes
    return this.findBySyncStatus(SyncStatus.PENDING)
  }
}

/**
 * Sync Conflict Repository
 * Handles CRUD operations for SyncConflict entities with camelCase field names
 */
export class SyncConflictRepository extends BaseRepository<SyncConflict> {
  constructor(table: Table<SyncConflict, string>) {
    super(table, 'sync_conflicts')
  }

  /**
   * Find conflicts by entity ID
   */
  async findByEntity(entityId: string): Promise<SyncConflict[]> {
    return this.findMany({ entityId } as Partial<SyncConflict>)
  }

  /**
   * Find conflicts by entity type
   */
  async findByEntityType(entityType: string): Promise<SyncConflict[]> {
    return this.findMany({ entityType } as Partial<SyncConflict>)
  }

  /**
   * Find conflicts by conflict type
   */
  async findByConflictType(conflictType: ConflictType): Promise<SyncConflict[]> {
    return this.findMany({ conflictType } as Partial<SyncConflict>)
  }

  /**
   * Find unresolved conflicts
   */
  async findUnresolved(): Promise<SyncConflict[]> {
    return this.table.filter((c) => c.resolved !== true).toArray()
  }

  /**
   * Find resolved conflicts
   */
  async findResolved(): Promise<SyncConflict[]> {
    return this.table.filter((c) => c.resolved === true).toArray()
  }

  /**
   * Find conflicts by sync status
   */
  async findBySyncStatus(status: SyncStatus): Promise<SyncConflict[]> {
    return this.findMany({ syncStatus: status } as Partial<SyncConflict>)
  }

  /**
   * Get count of unresolved conflicts
   */
  async getUnresolvedCount(): Promise<number> {
    const unresolved = await this.table.filter((c) => c.resolved !== true).toArray()
    return unresolved.length
  }

  /**
   * Get count of resolved conflicts
   */
  async getResolvedCount(): Promise<number> {
    const resolved = await this.table.filter((c) => c.resolved === true).toArray()
    return resolved.length
  }

  /**
   * Resolve a conflict with a strategy and resolved data
   */
  async resolve(
    uuid: string,
    strategy: ConflictResolutionStrategy,
    resolvedData?: Record<string, any>,
    userId: string = 'system'
  ): Promise<void> {
    await this.update(uuid, {
      resolved: true,
      resolutionStrategy: strategy,
      resolvedData: resolvedData,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    } as Partial<SyncConflict>)
  }

  /**
   * Mark conflict as auto-resolved
   */
  async autoResolve(uuid: string, strategy: ConflictResolutionStrategy): Promise<void> {
    await this.resolve(uuid, strategy, undefined, 'system')
  }

  /**
   * Find conflicts by date range
   */
  async findByDateRange(startDate: string | Date, endDate: string | Date): Promise<SyncConflict[]> {
    const start = startDate instanceof Date ? startDate.toISOString() : startDate
    const end = endDate instanceof Date ? endDate.toISOString() : endDate

    return this.table
      .filter((c) => {
        const detectedAt = c.detectedAt
        if (!detectedAt) return false
        const dateStr = detectedAt instanceof Date ? detectedAt.toISOString() : String(detectedAt)
        return dateStr >= start && dateStr <= end
      })
      .toArray()
  }

  /**
   * Get conflicts with pagination
   */
  async getWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      entityType?: string
      entityId?: string
      conflictType?: ConflictType
      resolved?: boolean
    }
  ): Promise<{ data: SyncConflict[]; total: number; page: number; limit: number }> {
    let results = await this.findAll()

    // Apply filters
    if (filters?.entityType) {
      results = results.filter((c) => c.entityType === filters.entityType)
    }
    if (filters?.entityId) {
      results = results.filter((c) => c.entityId === filters.entityId)
    }
    if (filters?.conflictType) {
      results = results.filter((c) => c.conflictType === filters.conflictType)
    }
    if (filters?.resolved !== undefined) {
      results = results.filter((c) => c.resolved === filters.resolved)
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    // Sort by detectedAt descending
    const sorted = results.sort((a, b) => {
      const dateA = a.detectedAt instanceof Date ? a.detectedAt.getTime() : new Date(a.detectedAt).getTime()
      const dateB = b.detectedAt instanceof Date ? b.detectedAt.getTime() : new Date(b.detectedAt).getTime()
      return dateB - dateA
    })

    const data = sorted.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Get conflict statistics
   */
  async getStats(): Promise<{
    total: number
    unresolved: number
    resolved: number
    autoResolved: number
    byType: Record<ConflictType, number>
    byEntityType: Record<string, number>
    byResolutionStrategy: Record<string, number>
  }> {
    const all = await this.table.toCollection().toArray()
    const byType: Record<ConflictType, number> = {
      [ConflictType.UPDATE_UPDATE]: 0,
      [ConflictType.DELETE_UPDATE]: 0,
      [ConflictType.UNIQUE_CONSTRAINT]: 0,
      [ConflictType.VERSION_SKEW]: 0,
    }
    const byEntityType: Record<string, number> = {}
    const byResolutionStrategy: Record<string, number> = {}

    let autoResolved = 0

    for (const c of all) {
      // Count by conflict type
      if (c.conflictType) {
        byType[c.conflictType] = (byType[c.conflictType] || 0) + 1
      }
      // Count by entity type
      if (c.entityType) {
        byEntityType[c.entityType] = (byEntityType[c.entityType] || 0) + 1
      }
      // Count by resolution strategy
      if (c.resolutionStrategy) {
        byResolutionStrategy[c.resolutionStrategy] = (byResolutionStrategy[c.resolutionStrategy] || 0) + 1
      }
      // Count auto-resolved
      if (c.resolved && c.resolutionStrategy === ConflictResolutionStrategy.LAST_WRITE_WINS) {
        autoResolved++
      }
    }

    return {
      total: all.length,
      unresolved: all.filter((c) => c.resolved !== true).length,
      resolved: all.filter((c) => c.resolved === true).length,
      autoResolved,
      byType,
      byEntityType,
      byResolutionStrategy,
    }
  }

  /**
   * Delete resolved conflicts older than days
   */
  async cleanupOld(daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)

    const all = await this.findAll()
    const oldResolved = all.filter((c) => {
      if (!c.resolved) return false
      if (!c.resolvedAt) return false
      const date = c.resolvedAt instanceof Date ? c.resolvedAt : new Date(c.resolvedAt)
      return date < cutoff
    })

    if (oldResolved.length > 0) {
      const ids = oldResolved.map((c) => c.uuid)
      await this.deleteMany(ids)
    }

    return oldResolved.length
  }

  /**
   * Update conflict sync status
   */
  async updateSyncStatus(uuid: string, status: SyncStatus): Promise<void> {
    await this.update(uuid, {
      syncStatus: status,
      updatedAt: new Date().toISOString(),
    } as Partial<SyncConflict>)
  }
}

/**
 * Sync Metadata Repository
 * Handles CRUD operations for SyncMetadata entities with camelCase field names
 */
export class SyncMetadataRepository extends BaseRepository<SyncMetadata> {
  constructor(table: Table<SyncMetadata, string>) {
    super(table, 'sync_metadata')
  }

  /**
   * Get metadata value by key
   */
  async getValue(key: string): Promise<string | null> {
    const results = await this.table.filter((m) => m.key === key).toArray()
    if (results.length === 0) return null
    return results[0]?.value || null
  }

  /**
   * Set metadata value by key (create or update)
   */
  async setValue(key: string, value: string, userId: string = 'system'): Promise<void> {
    const results = await this.table.filter((m) => m.key === key).toArray()
    const now = new Date().toISOString()

    if (results.length > 0) {
      const existing = results[0]
      if (existing) {
        await this.update(existing.uuid, {
          value,
          updatedAt: now,
          updatedBy: userId,
        } as Partial<SyncMetadata>)
      }
    } else {
      await this.create({
        key,
        value,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        syncStatus: SyncStatus.SYNCED,
        version: 1,
      } as Partial<SyncMetadata>)
    }
  }

  /**
   * Delete metadata by key
   */
  async deleteByKey(key: string): Promise<void> {
    const results = await this.table.filter((m) => m.key === key).toArray()
    if (results && results.length > 0) {
      await this.delete(results[0]!.uuid)
    }
  }

  /**
   * Get all metadata keys
   */
  async getAllKeys(): Promise<string[]> {
    const all = await this.table.toCollection().toArray()
    return all.map((m) => m.key).filter((k): k is string => typeof k === 'string')
  }

  /**
   * Get all metadata as key-value pairs
   */
  async getAllValues(): Promise<Record<string, string>> {
    const all = await this.table.toCollection().toArray()
    const result: Record<string, string> = {}
    for (const m of all) {
      if (m.key && m.value) {
        result[m.key] = m.value
      }
    }
    return result
  }

  /**
   * Get all metadata entries
   */
  async getAllMetadata(): Promise<SyncMetadata[]> {
    return this.table.toCollection().toArray()
  }

  /**
   * Bulk set multiple metadata values
   */
  async setMultipleValues(values: Record<string, string>, userId: string = 'system'): Promise<void> {
    const entries = Object.entries(values)
    for (const [key, value] of entries) {
      await this.setValue(key, value, userId)
    }
  }

  /**
   * Get metadata value by key with default
   */
  async getValueOrDefault(key: string, defaultValue: string): Promise<string> {
    const value = await this.getValue(key)
    return value || defaultValue
  }

  /**
   * Check if metadata key exists
   */
  async hasKey(key: string): Promise<boolean> {
    const value = await this.getValue(key)
    return value !== null
  }

  /**
   * Get the last sync token
   */
  async getLastSyncToken(): Promise<string | null> {
    return this.getValue('lastSyncToken')
  }

  /**
   * Set the last sync token
   */
  async setLastSyncToken(token: string, userId: string = 'system'): Promise<void> {
    await this.setValue('lastSyncToken', token, userId)
  }

  /**
   * Get the last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    return this.getValue('lastSyncTime')
  }

  /**
   * Set the last sync time
   */
  async setLastSyncTime(time: string, userId: string = 'system'): Promise<void> {
    await this.setValue('lastSyncTime', time, userId)
  }

  /**
   * Get sync version
   */
  async getSyncVersion(): Promise<string | null> {
    return this.getValue('syncVersion')
  }

  /**
   * Set sync version
   */
  async setSyncVersion(version: string, userId: string = 'system'): Promise<void> {
    await this.setValue('syncVersion', version, userId)
  }

  /**
   * Get client ID (unique identifier for this device)
   */
  async getClientId(): Promise<string | null> {
    return this.getValue('clientId')
  }

  /**
   * Set client ID
   */
  async setClientId(clientId: string, userId: string = 'system'): Promise<void> {
    await this.setValue('clientId', clientId, userId)
  }

  /**
   * Get user ID (current authenticated user)
   */
  async getUserId(): Promise<string | null> {
    return this.getValue('userId')
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string): Promise<void> {
    await this.setValue('userId', userId, 'system')
  }

  /**
   * Get total processed sync count
   */
  async getTotalProcessed(): Promise<number> {
    const value = await this.getValue('totalProcessed')
    return value ? parseInt(value, 10) : 0
  }

  /**
   * Increment total processed count
   */
  async incrementTotalProcessed(userId: string = 'system'): Promise<number> {
    const current = await this.getTotalProcessed()
    const newValue = current + 1
    await this.setValue('totalProcessed', String(newValue), userId)
    return newValue
  }

  /**
   * Clear all sync metadata
   */
  async clearAll(): Promise<void> {
    await this.table.clear()
  }

  /**
   * Get metadata with pagination
   */
  async getWithPagination(
    page: number = 1,
    limit: number = 20,
    filter?: string
  ): Promise<{ data: SyncMetadata[]; total: number; page: number; limit: number }> {
    let results = await this.table.toCollection().toArray()

    if (filter) {
      const lower = filter.toLowerCase()
      results = results.filter((m) =>
        m.key.toLowerCase().includes(lower) ||
        m.value.toLowerCase().includes(lower)
      )
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    const data = results.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Get metadata by key prefix
   */
  async getByPrefix(prefix: string): Promise<SyncMetadata[]> {
    const all = await this.table.toCollection().toArray()
    return all.filter((m) => m.key.startsWith(prefix))
  }

  /**
   * Get metadata by key pattern
   */
  async getByPattern(pattern: string): Promise<SyncMetadata[]> {
    const all = await this.table.toCollection().toArray()
    return all.filter((m) => m.key.includes(pattern))
  }
}