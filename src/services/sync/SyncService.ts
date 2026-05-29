import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../core/constants/api.constants'
import {
  PendingChangeStatus,
  SyncPriority,
  ConflictType,
  ResolutionStrategy,
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
  type PaginatedResponse,
} from './../../modules'

export class SyncService extends BaseService {
  async pullChanges(params?: PullChangesRequest): Promise<PullChangesResponse> {
    const response = await this.get<PullChangesResponse>(
      API_ENDPOINTS.SYNC.PULL,
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async pushChanges(data: PushChangesRequest): Promise<PushChangesResponse> {
    const response = await this.post<PushChangesResponse>(API_ENDPOINTS.SYNC.PUSH, data)
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
    const response = await this.get<SyncProgress>(API_ENDPOINTS.SYNC.SYNC_PROGRESS)
    return this.extractData(response)
  }

  async getPendingChanges(params?: {
    status?: PendingChangeStatus
    limit?: number
  }): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES,
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async getPendingChangesByEntity(entityType: string, entityId: string): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_BY_ENTITY(entityId)
    )
    return this.extractData(response)
  }

  async createPendingChange(data: CreatePendingChangeRequest): Promise<PendingChange> {
    const response = await this.post<PendingChange>(API_ENDPOINTS.SYNC.PENDING_CHANGES, data)
    return this.extractData(response)
  }

  async retryFailedChanges(
    changeIds?: string[]
  ): Promise<{ retried: number; succeeded: number; failed: number }> {
    const response = await this.post<{ retried: number; succeeded: number; failed: number }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_RETRY_FAILED,
      { change_ids: changeIds }
    )
    return this.extractData(response)
  }

  async clearPendingChanges(changeIds?: string[]): Promise<{ cleared: number }> {
    const response = await this.post<{ cleared: number }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_CLEANUP,
      {
        change_ids: changeIds,
      }
    )
    return this.extractData(response)
  }

  async getPendingChangesCount(): Promise<{
    total: number
    byPriority: Record<SyncPriority, number>
  }> {
    const response = await this.get<{ total: number; byPriority: Record<SyncPriority, number> }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_STATS
    )
    return this.extractData(response)
  }

  async getConflicts(params?: {
    resolved?: boolean
    entity_type?: string
    limit?: number
  }): Promise<PaginatedResponse<SyncConflict>> {
    return this.getPaginated<SyncConflict>(
      API_ENDPOINTS.SYNC.CONFLICTS,
      params as Record<string, any>
    )
  }

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(API_ENDPOINTS.SYNC.CONFLICTS_UNRESOLVED)
    return this.extractData(response)
  }

  async getConflict(conflictId: string): Promise<SyncConflict> {
    const response = await this.get<SyncConflict>(API_ENDPOINTS.SYNC.CONFLICT_BY_ID(conflictId))
    return this.extractData(response)
  }

  async getConflictsByEntity(entityType: string, entityId: string): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(
      API_ENDPOINTS.SYNC.CONFLICTS_BY_ENTITY(entityId)
    )
    return this.extractData(response)
  }

  async resolveConflict(conflictId: string, data: ResolveConflictRequest): Promise<SyncConflict> {
    const response = await this.post<SyncConflict>(
      API_ENDPOINTS.SYNC.CONFLICT_RESOLVE(conflictId),
      data
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
    }>(API_ENDPOINTS.SYNC.CONFLICTS_RESOLVE, { resolutions })
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
    }>(API_ENDPOINTS.SYNC.CONFLICTS_STATS)
    return this.extractData(response)
  }

  async getSyncMetadata(key?: string): Promise<SyncMetadata | SyncMetadata[] | null> {
    if (key) {
      const response = await this.get<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key))
      return this.extractData(response)
    }
    const response = await this.get<SyncMetadata[]>(API_ENDPOINTS.SYNC.METADATA)
    return this.extractData(response)
  }

  async setSyncMetadata(key: string, value: string): Promise<SyncMetadata> {
    const existing = await this.getSyncMetadata(key)
    if (existing) {
      const response = await this.put<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key), {
        value,
      })
      return this.extractData(response)
    }
    const response = await this.post<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA, { key, value })
    return this.extractData(response)
  }

  async deleteSyncMetadata(key: string): Promise<void> {
    await this.delete(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key))
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
    }>(API_ENDPOINTS.SYNC.SYNC_PROGRESS)
    return this.extractData(response)
  }

  async triggerSync(): Promise<{ success: boolean; changesProcessed: number }> {
    const response = await this.post<{ success: boolean; changesProcessed: number }>(
      API_ENDPOINTS.SYNC.TRIGGER
    )
    return this.extractData(response)
  }

  async getConflictPreview(conflictId: string): Promise<ConflictResolutionPreview> {
    const response = await this.get<ConflictResolutionPreview>(
      API_ENDPOINTS.SYNC.CONFLICT_PREVIEW(conflictId)
    )
    return this.extractData(response)
  }

  async getSyncConfig(): Promise<SyncConfig> {
    const response = await this.get<SyncConfig>(API_ENDPOINTS.SYNC.CONFIG)
    return this.extractData(response)
  }

  async updateSyncConfig(config: Partial<SyncConfig>): Promise<SyncConfig> {
    const response = await this.put<SyncConfig>(API_ENDPOINTS.SYNC.CONFIG, config)
    return this.extractData(response)
  }

  async getTombstones(params?: {
    entity_type?: string
    since?: string
    limit?: number
  }): Promise<Tombstone[]> {
    const response = await this.get<Tombstone[]>(
      API_ENDPOINTS.SYNC.TOMBSTONES,
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async cleanupTombstones(daysOld?: number): Promise<{ cleaned: number }> {
    const response = await this.post<{ cleaned: number }>(API_ENDPOINTS.SYNC.TOMBSTONES_CLEANUP, {
      days_old: daysOld || 90,
    })
    return this.extractData(response)
  }

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
    }>(API_ENDPOINTS.SYNC.STATS)
    return this.extractData(response)
  }
}

export const syncService = new SyncService()
