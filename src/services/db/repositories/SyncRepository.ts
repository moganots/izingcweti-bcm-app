import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
} from '../../../models/entities/sync.entity'

/**
 * Pending Change Repository
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
      .filter((c) => c.entity_type === entityType && c.entity_id === entityId)
      .toArray()
  }

  /**
   * Find pending changes by priority
   */
  async findByPriority(priority: number): Promise<PendingChange[]> {
    return this.findMany({ priority } as Partial<PendingChange>)
  }

  /**
   * Get pending changes ordered by priority (highest first)
   * Fixed: Use toCollection() then manual sort since orderBy().reverse()
   * requires the field to be indexed
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
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      return dateA.localeCompare(dateB)
    })

    return changes
  }

  /**
   * Find pending changes by entity type
   */
  async getByEntityType(entityType: string): Promise<PendingChange[]> {
    return this.findMany({ entity_type: entityType } as Partial<PendingChange>)
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
   * Increment the retry attempts counter for a pending change
   * Fixed: Use plain object to avoid circular type inference
   */
  async incrementAttempts(id: string): Promise<void> {
    const change = await this.findById(id)
    if (!change) return

    const currentAttempts = typeof change.attempts === 'number' ? change.attempts : 0

    const updateData: Record<string, unknown> = {
      attempts: currentAttempts + 1,
      updated_at: new Date().toISOString(),
    }

    await this.table.update(id, updateData as any)
  }

  /**
   * Reset retry attempts for a pending change
   */
  async resetAttempts(id: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      attempts: 0,
      updated_at: new Date().toISOString(),
    }

    await this.table.update(id, updateData as any)
  }

  /**
   * Get total count of pending changes
   * Fixed: Table.count() is available directly
   */
  async getCount(): Promise<number> {
    return this.table.count()
  }

  /**
   * Get count of pending (not yet processed) changes
   * Fixed: Collection.filter().count() is not available, use toArray().length
   */
  async getPendingCount(): Promise<number> {
    const pendingChanges = await this.table.filter((c) => c.sync_status === 'PENDING').toArray()

    return pendingChanges.length
  }

  /**
   * Get count of changes by entity type
   */
  async getCountByEntityType(entityType: string): Promise<number> {
    const changes = await this.table.filter((c) => c.entity_type === entityType).toArray()

    return changes.length
  }

  /**
   * Get count of changes by operation type
   */
  async getCountByOperationType(operationType: string): Promise<number> {
    const changes = await this.table.filter((c) => c.operation_type === operationType).toArray()

    return changes.length
  }

  /**
   * Get changes that are ready to retry (failed but under max attempts)
   */
  async getRetryableChanges(maxAttempts: number = 5): Promise<PendingChange[]> {
    return this.table
      .filter((c) => {
        const attempts = c.attempts
        return (
          typeof attempts === 'number' &&
          attempts > 0 &&
          attempts < maxAttempts &&
          c.sync_status === 'PENDING'
        )
      })
      .toArray()
  }

  /**
   * Get statistics for pending changes
   */
  async getStats(): Promise<{
    total: number
    pending: number
    failed: number
    byEntityType: Record<string, number>
    byOperationType: Record<string, number>
    byPriority: Record<number, number>
  }> {
    const all = await this.table.toCollection().toArray()
    const byEntityType: Record<string, number> = {}
    const byOperationType: Record<string, number> = {}
    const byPriority: Record<number, number> = {}

    all.forEach((c) => {
      // Count by entity type
      if (c.entity_type) {
        byEntityType[c.entity_type] = (byEntityType[c.entity_type] || 0) + 1
      }
      // Count by operation type
      if (c.operation_type) {
        byOperationType[c.operation_type] = (byOperationType[c.operation_type] || 0) + 1
      }
      // Count by priority
      if (typeof c.priority === 'number') {
        byPriority[c.priority] = (byPriority[c.priority] || 0) + 1
      }
    })

    return {
      total: all.length,
      pending: all.filter((c) => c.sync_status === 'PENDING').length,
      failed: all.filter((c) => typeof c.attempts === 'number' && c.attempts >= 5).length,
      byEntityType,
      byOperationType,
      byPriority,
    }
  }
}

/**
 * Sync Conflict Repository
 */
export class SyncConflictRepository extends BaseRepository<SyncConflict> {
  constructor(table: Table<SyncConflict, string>) {
    super(table, 'sync_conflicts')
  }

  /**
   * Find conflicts by entity ID
   */
  async findByEntity(entityId: string): Promise<SyncConflict[]> {
    return this.findMany({ entity_id: entityId } as Partial<SyncConflict>)
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
   * Get count of unresolved conflicts
   * Fixed: Use filter().toArray().length instead of where().count()
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
   * Fixed: Use plain object to avoid circular type inference
   */
  async resolve(id: string, strategy: string, data: any): Promise<void> {
    const updateData: Record<string, unknown> = {
      resolved: true,
      resolution_strategy: strategy,
      resolved_data: data,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await this.table.update(id, updateData as any)
  }

  /**
   * Find conflicts by entity type
   */
  async findByEntityType(entityType: string): Promise<SyncConflict[]> {
    return this.table.filter((c) => c.entity_type === entityType).toArray()
  }

  /**
   * Find conflicts detected within a date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<SyncConflict[]> {
    return this.table
      .filter((c) => {
        const detectedAt = c.detected_at
        if (typeof detectedAt !== 'string') return false
        return detectedAt >= startDate && detectedAt <= endDate
      })
      .toArray()
  }

  /**
   * Find conflicts by type
   */
  async findByConflictType(conflictType: string): Promise<SyncConflict[]> {
    return this.table.filter((c) => c.conflict_type === conflictType).toArray()
  }

  /**
   * Get conflict statistics
   */
  async getStats(): Promise<{
    total: number
    unresolved: number
    resolved: number
    byType: Record<string, number>
    byEntityType: Record<string, number>
  }> {
    const all = await this.table.toCollection().toArray()
    const byType: Record<string, number> = {}
    const byEntityType: Record<string, number> = {}

    all.forEach((c) => {
      // Count by conflict type
      if (c.conflict_type) {
        byType[c.conflict_type] = (byType[c.conflict_type] || 0) + 1
      }
      // Count by entity type
      if (c.entity_type) {
        byEntityType[c.entity_type] = (byEntityType[c.entity_type] || 0) + 1
      }
    })

    return {
      total: all.length,
      unresolved: all.filter((c) => c.resolved !== true).length,
      resolved: all.filter((c) => c.resolved === true).length,
      byType,
      byEntityType,
    }
  }
}

/**
 * Sync Metadata Repository
 */
export class SyncMetadataRepository extends BaseRepository<SyncMetadata> {
  constructor(table: Table<SyncMetadata, string>) {
    super(table, 'sync_metadata')
  }

  /**
   * Get metadata value by key
   * Fixed: Use filter() to find by key since findOne uses where() which needs indexed field
   */
  async getValue(key: string): Promise<string | null> {
    const results = await this.table.filter((m) => m.key === key).toArray()

    if (results.length === 0) return null
    return results[0]?.value || null
  }

  /**
   * Set metadata value by key (create or update)
   * Fixed: Use plain object for update to avoid circular type inference
   */
  async setValue(key: string, value: string): Promise<void> {
    const results = await this.table.filter((m) => m.key === key).toArray()

    const now = new Date().toISOString()

    if (results.length > 0) {
      // Update existing
      const existing = results[0]
      const updateData: Record<string, unknown> = {
        value,
        updated_at: now,
      }
      if (existing) {
        await this.table.update(existing.uuid, updateData as any)
      }
    } else {
      // Create new
      await this.create({
        key,
        value,
        created_at: now,
        updated_at: now,
      } as Partial<SyncMetadata>)
    }
  }

  /**
   * Delete metadata by key
   */
  async deleteByKey(key: string): Promise<void> {
    const results = await this.table.filter((m) => m.key === key).toArray()

    if (results && results.length > 0) {
      await this.delete(results[0]!?.uuid)
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

    all.forEach((m) => {
      if (m.key && m.value) {
        result[m.key] = m.value
      }
    })

    return result
  }

  /**
   * Bulk set multiple metadata values
   */
  async setMultipleValues(values: Record<string, string>): Promise<void> {
    const entries = Object.entries(values)

    for (const [key, value] of entries) {
      await this.setValue(key, value)
    }
  }

  /**
   * Get the last sync token
   */
  async getLastSyncToken(): Promise<string | null> {
    return this.getValue('last_sync_token')
  }

  /**
   * Set the last sync token
   */
  async setLastSyncToken(token: string): Promise<void> {
    await this.setValue('last_sync_token', token)
  }

  /**
   * Get the last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    return this.getValue('last_sync_time')
  }

  /**
   * Set the last sync time
   */
  async setLastSyncTime(time: string): Promise<void> {
    await this.setValue('last_sync_time', time)
  }

  /**
   * Get sync version
   */
  async getSyncVersion(): Promise<string | null> {
    return this.getValue('sync_version')
  }

  /**
   * Set sync version
   */
  async setSyncVersion(version: string): Promise<void> {
    await this.setValue('sync_version', version)
  }

  /**
   * Get client ID (unique identifier for this device)
   */
  async getClientId(): Promise<string | null> {
    return this.getValue('client_id')
  }

  /**
   * Set client ID
   */
  async setClientId(clientId: string): Promise<void> {
    await this.setValue('client_id', clientId)
  }

  /**
   * Clear all sync metadata
   */
  async clearAll(): Promise<void> {
    await this.table.clear()
  }
}
