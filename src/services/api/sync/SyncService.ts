import { BaseService } from '../BaseService'
import type { PendingChange, SyncConflict, SyncMetadata } from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import type { PaginatedResponse } from './../../../types'

/**
 * Push Changes Request
 */
export interface PushChangesRequest {
  changes: Array<{
    entityType: string
    entityId: string
    operationType: string
    data: Record<string, unknown>
    version?: number
  }>
  lastSyncToken?: string
}

/**
 * Pull Changes Request
 */
export interface PullChangesRequest {
  since?: string
  entityTypes?: string[]
  limit?: number
}

/**
 * Pull Changes Response
 */
export interface PullChangesResponse {
  changes: Array<{
    entityType: string
    entityId: string
    operationType: string
    data: Record<string, unknown>
    timestamp: string
    version: number
  }>
  syncToken: string
  serverTimestamp: string
}

/**
 * Push Changes Response
 */
export interface PushChangesResponse {
  success: boolean
  appliedIds?: string[]
  failedIds?: string[]
  conflicts?: SyncConflict[]
  appliedChanges: number
  syncToken: string
}

/**
 * Resolve Conflict Request
 */
export interface ResolveConflictRequest {
  strategy: string
  resolvedData?: Record<string, unknown>
}

/**
 * Sync API Service
 */
export class SyncService extends BaseService {
  /**
   * Push local changes to server
   */
  async pushChanges(data: PushChangesRequest): Promise<PushChangesResponse> {
    const response = await this.post<PushChangesResponse>(API_ENDPOINTS.SYNC.PUSH, data)
    return this.extractData(response)
  }

  /**
   * Pull changes from server
   */
  async pullChanges(params?: PullChangesRequest): Promise<PullChangesResponse> {
    const response = await this.get<PullChangesResponse>(
      API_ENDPOINTS.SYNC.PULL,
      params as Record<string, unknown>
    )
    return this.extractData(response)
  }

  /**
   * Get pending changes from server
   */
  async getPendingChanges(): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(API_ENDPOINTS.SYNC.PENDING_CHANGES)
    return this.extractData(response)
  }

  /**
   * Get sync conflicts
   */
  async getConflicts(): Promise<PaginatedResponse<SyncConflict>> {
    return this.getPaginated<SyncConflict>(API_ENDPOINTS.SYNC.CONFLICTS)
  }

  /**
   * Get unresolved conflicts
   * Fixed: Use query parameter on CONFLICTS endpoint instead of missing UNRESOLVED constant
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(
      `${API_ENDPOINTS.SYNC.CONFLICTS}?resolved=false`
    )
    return this.extractData(response)
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflictId: string, data: ResolveConflictRequest): Promise<SyncConflict> {
    const response = await this.patch<SyncConflict>(
      API_ENDPOINTS.SYNC.RESOLVE_CONFLICT(conflictId),
      data
    )
    return this.extractData(response)
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(key?: string): Promise<SyncMetadata[] | SyncMetadata | null> {
    if (key) {
      const response = await this.get<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key))
      return this.extractData(response)
    }
    const response = await this.get<SyncMetadata[]>(API_ENDPOINTS.SYNC.METADATA)
    return this.extractData(response)
  }

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(key: string, value: string): Promise<SyncMetadata> {
    const response = await this.put<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key), {
      value,
    })
    return this.extractData(response)
  }

  /**
   * Create sync metadata
   */
  async createSyncMetadata(key: string, value: string): Promise<SyncMetadata> {
    const response = await this.post<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA, {
      key,
      value,
    })
    return this.extractData(response)
  }

  /**
   * Delete sync metadata
   */
  async deleteSyncMetadata(key: string): Promise<void> {
    await this.delete(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key))
  }

  /**
   * Get last sync token
   * Fixed: Use METADATA_BY_KEY to get the sync token from metadata
   */
  async getLastSyncToken(): Promise<string | null> {
    try {
      const metadata = (await this.getSyncMetadata('last_sync_token')) as SyncMetadata | null
      return metadata?.value || null
    } catch {
      return null
    }
  }

  /**
   * Update last sync token
   * Fixed: Use METADATA_BY_KEY to update the sync token in metadata
   */
  async updateLastSyncToken(token: string): Promise<void> {
    const existing = await this.getSyncMetadata('last_sync_token')
    if (existing) {
      await this.updateSyncMetadata('last_sync_token', token)
    } else {
      await this.createSyncMetadata('last_sync_token', token)
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    pendingChanges: number
    conflicts: number
    unresolvedConflicts: number
    lastSyncTime: string | null
  }> {
    const response = await this.get<{
      pendingChanges: number
      conflicts: number
      unresolvedConflicts: number
      lastSyncTime: string | null
    }>(API_ENDPOINTS.SYNC.STATUS)
    return this.extractData(response)
  }

  /**
   * Clear pending changes
   */
  async clearPendingChanges(): Promise<{ cleared: number }> {
    const response = await this.post<{ cleared: number }>(API_ENDPOINTS.SYNC.CLEAR_PENDING)
    return this.extractData(response)
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    isSyncing: boolean
    lastSyncAt: string | null
    pendingCount: number
    conflictCount: number
  }> {
    const response = await this.get<{
      isSyncing: boolean
      lastSyncAt: string | null
      pendingCount: number
      conflictCount: number
    }>(API_ENDPOINTS.SYNC.STATUS)
    return this.extractData(response)
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(): Promise<{ success: boolean; changesProcessed: number }> {
    const response = await this.post<{ success: boolean; changesProcessed: number }>(
      `${API_ENDPOINTS.SYNC.PUSH}/trigger`
    )
    return this.extractData(response)
  }

  /**
   * Get conflict by ID
   */
  async getConflict(conflictId: string): Promise<SyncConflict> {
    const response = await this.get<SyncConflict>(`${API_ENDPOINTS.SYNC.CONFLICTS}/${conflictId}`)
    return this.extractData(response)
  }

  /**
   * Bulk resolve conflicts
   */
  async bulkResolveConflicts(
    resolutions: Array<{
      conflictId: string
      strategy: string
      resolvedData?: Record<string, unknown>
    }>
  ): Promise<{ resolved: number; failed: number }> {
    const response = await this.post<{ resolved: number; failed: number }>(
      `${API_ENDPOINTS.SYNC.CONFLICTS}/bulk-resolve`,
      { resolutions }
    )
    return this.extractData(response)
  }
}

// Export singleton
export const syncService = new SyncService()
