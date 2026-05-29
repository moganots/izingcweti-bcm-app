import { BaseService } from '../BaseService'
import {
  // Enums
  PendingChangeStatus,
  SyncPriority,
  ConflictType,
  ResolutionStrategy,
  // Types
  type PendingChange,
  type SyncConflict,
  type SyncMetadata,
  type SyncConfig,
  type Tombstone,
  type PushChangesRequest,
  type PushChangesResponse,
  type PullChangesRequest,
  type PullChangesResponse,
  type ResolveConflictRequest,
  type SyncProgress,
  type ConflictResolutionPreview,
  type CreatePendingChangeRequest,
  // Shared Types
  type PaginatedResponse,
} from './../../modules'

export class SyncService extends BaseService {
  // Core Sync Operations
  async pullChanges(params?: PullChangesRequest): Promise<PullChangesResponse> {
    const response = await this.get<PullChangesResponse>(
      '/sync/pull',
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async pushChanges(data: PushChangesRequest): Promise<PushChangesResponse> {
    const response = await this.post<PushChangesResponse>('/sync/push', data)
    return this.extractData(response)
  }

  async fullSync(): Promise<{
    pullSuccess: boolean
    pushSuccess: boolean
    conflicts: SyncConflict[]
  }> {
    let pullSuccess = false
    let pushSuccess = false
    let conflicts: SyncConflict[] = []

    try {
      await this.pullChanges()
      pullSuccess = true
    } catch (error) {
      console.error('Pull failed:', error)
    }

    try {
      const pendingChanges = await this.getPendingChanges()
      if (pendingChanges.length > 0) {
        const pushResult = await this.pushChanges({ changes: pendingChanges })
        pushSuccess = pushResult.success
        conflicts = pushResult.conflicts || []
      } else {
        pushSuccess = true
      }
    } catch (error) {
      console.error('Push failed:', error)
    }

    return { pullSuccess, pushSuccess, conflicts }
  }

  async getSyncStatus(): Promise<SyncProgress> {
    const response = await this.get<SyncProgress>('/sync/status')
    return this.extractData(response)
  }

  async triggerSync(): Promise<{ success: boolean; changesProcessed: number }> {
    const response = await this.post<{ success: boolean; changesProcessed: number }>(
      '/sync/trigger'
    )
    return this.extractData(response)
  }

  // Pending Changes
  async getPendingChanges(params?: {
    status?: PendingChangeStatus
    limit?: number
  }): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      '/sync/pending-changes',
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async getPendingChangesByEntity(entityType: string, entityId: string): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      `/sync/pending-changes/entity/${entityType}/${entityId}`
    )
    return this.extractData(response)
  }

  async createPendingChange(data: CreatePendingChangeRequest): Promise<PendingChange> {
    const response = await this.post<PendingChange>('/sync/pending-changes', data)
    return this.extractData(response)
  }

  async retryFailedChanges(
    changeIds?: string[]
  ): Promise<{ retried: number; succeeded: number; failed: number }> {
    const response = await this.post<{ retried: number; succeeded: number; failed: number }>(
      '/sync/pending-changes/retry-failed',
      { change_ids: changeIds }
    )
    return this.extractData(response)
  }

  async clearPendingChanges(changeIds?: string[]): Promise<{ cleared: number }> {
    const response = await this.post<{ cleared: number }>('/sync/pending-changes/clear', {
      change_ids: changeIds,
    })
    return this.extractData(response)
  }

  async getPendingChangesCount(): Promise<{
    total: number
    byPriority: Record<SyncPriority, number>
  }> {
    const response = await this.get<{ total: number; byPriority: Record<SyncPriority, number> }>(
      '/sync/pending-changes/count'
    )
    return this.extractData(response)
  }

  // Conflict Management
  async getConflicts(params?: {
    resolved?: boolean
    entity_type?: string
    limit?: number
  }): Promise<PaginatedResponse<SyncConflict>> {
    return this.getPaginated<SyncConflict>('/sync/conflicts', params as Record<string, any>)
  }

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>('/sync/conflicts/unresolved')
    return this.extractData(response)
  }

  async getConflict(conflictId: string): Promise<SyncConflict> {
    const response = await this.get<SyncConflict>(`/sync/conflicts/${conflictId}`)
    return this.extractData(response)
  }

  async getConflictsByEntity(entityType: string, entityId: string): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(
      `/sync/conflicts/entity/${entityType}/${entityId}`
    )
    return this.extractData(response)
  }

  async resolveConflict(conflictId: string, data: ResolveConflictRequest): Promise<SyncConflict> {
    const response = await this.post<SyncConflict>(`/sync/conflicts/${conflictId}/resolve`, data)
    return this.extractData(response)
  }

  async getConflictPreview(conflictId: string): Promise<ConflictResolutionPreview> {
    const response = await this.get<ConflictResolutionPreview>(
      `/sync/conflicts/${conflictId}/preview`
    )
    return this.extractData(response)
  }

  async bulkResolveConflicts(
    resolutions: Array<{
      conflictId: string
      strategy: ResolutionStrategy
      resolution?: Record<string, any>
      notes?: string
    }>
  ): Promise<{
    resolved: number
    failed: number
    errors: Array<{ conflictId: string; error: string }>
  }> {
    const response = await this.post<{
      resolved: number
      failed: number
      errors: Array<{ conflictId: string; error: string }>
    }>('/sync/conflicts/bulk-resolve', { resolutions })
    return this.extractData(response)
  }

  async getConflictStats(): Promise<{
    total: number
    resolved: number
    unresolved: number
    byType: Record<ConflictType, number>
    autoResolvable: number
  }> {
    const response = await this.get<{
      total: number
      resolved: number
      unresolved: number
      byType: Record<ConflictType, number>
      autoResolvable: number
    }>('/sync/conflicts/stats')
    return this.extractData(response)
  }

  // Sync Metadata
  async getSyncMetadata(key?: string): Promise<SyncMetadata | SyncMetadata[] | null> {
    if (key) {
      const response = await this.get<SyncMetadata>(`/sync/metadata/${key}`)
      return this.extractData(response)
    }
    const response = await this.get<SyncMetadata[]>('/sync/metadata')
    return this.extractData(response)
  }

  async setSyncMetadata(key: string, value: string): Promise<SyncMetadata> {
    const existing = await this.getSyncMetadata(key)
    if (existing) {
      const response = await this.put<SyncMetadata>(`/sync/metadata/${key}`, { value })
      return this.extractData(response)
    }
    const response = await this.post<SyncMetadata>('/sync/metadata', { key, value })
    return this.extractData(response)
  }

  async deleteSyncMetadata(key: string): Promise<void> {
    await this.delete(`/sync/metadata/${key}`)
  }

  async getLastSyncToken(): Promise<string | null> {
    try {
      const metadata = (await this.getSyncMetadata('last_sync_token')) as SyncMetadata | null
      return metadata?.value || null
    } catch {
      return null
    }
  }

  async updateLastSyncToken(token: string): Promise<void> {
    await this.setSyncMetadata('last_sync_token', token)
  }

  async getInitialSyncProgress(): Promise<{
    completed: boolean
    total_entities: number
    synced_entities: number
    percentage: number
  }> {
    const response = await this.get<{
      completed: boolean
      total_entities: number
      synced_entities: number
      percentage: number
    }>('/sync/initial-sync-progress')
    return this.extractData(response)
  }

  // Sync Configuration
  async getSyncConfig(): Promise<SyncConfig> {
    const response = await this.get<SyncConfig>('/sync/config')
    return this.extractData(response)
  }

  async updateSyncConfig(config: Partial<SyncConfig>): Promise<SyncConfig> {
    const response = await this.put<SyncConfig>('/sync/config', config)
    return this.extractData(response)
  }

  // Tombstones
  async getTombstones(params?: {
    entity_type?: string
    since?: string
    limit?: number
  }): Promise<Tombstone[]> {
    const response = await this.get<Tombstone[]>('/sync/tombstones', params as Record<string, any>)
    return this.extractData(response)
  }

  async cleanupTombstones(daysOld?: number): Promise<{ cleaned: number }> {
    const response = await this.post<{ cleaned: number }>('/sync/tombstones/cleanup', {
      days_old: daysOld || 90,
    })
    return this.extractData(response)
  }

  // Sync Statistics
  async getSyncStats(): Promise<{
    totalSyncs: number
    successfulSyncs: number
    failedSyncs: number
    averageSyncTimeMs: number
    totalConflictsResolved: number
    lastSyncAt: string | null
  }> {
    const response = await this.get<{
      totalSyncs: number
      successfulSyncs: number
      failedSyncs: number
      averageSyncTimeMs: number
      totalConflictsResolved: number
      lastSyncAt: string | null
    }>('/sync/stats')
    return this.extractData(response)
  }
}

export const syncService = new SyncService()
