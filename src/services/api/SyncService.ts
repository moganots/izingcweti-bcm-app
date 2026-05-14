import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { PendingChange, SyncConflict, SyncMetadata } from '../../models/entities/sync.entity'

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
    const response = await this.post<PushChangesResponse>(API_ENDPOINTS.SYNC.PENDING_CHANGES, data)
    return this.extractData(response)
  }

  /**
   * Pull changes from server
   */
  async pullChanges(params?: PullChangesRequest): Promise<PullChangesResponse> {
    const response = await this.get<PullChangesResponse>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES,
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
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(API_ENDPOINTS.SYNC.UNRESOLVED)
    return this.extractData(response)
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflictId: string, data: ResolveConflictRequest): Promise<SyncConflict> {
    const response = await this.patch<SyncConflict>(
      `${API_ENDPOINTS.SYNC.CONFLICTS}/${conflictId}/resolve`,
      data
    )
    return this.extractData(response)
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(): Promise<SyncMetadata[]> {
    const response = await this.get<SyncMetadata[]>(API_ENDPOINTS.SYNC.METADATA)
    return this.extractData(response)
  }

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(key: string, value: string): Promise<SyncMetadata> {
    const response = await this.put<SyncMetadata>(`${API_ENDPOINTS.SYNC.METADATA}/${key}`, {
      value,
    })
    return this.extractData(response)
  }

  /**
   * Get last sync token
   */
  async getLastSyncToken(): Promise<string | null> {
    const response = await this.get<{ token: string | null }>(API_ENDPOINTS.SYNC.LAST_TOKEN)
    const data = this.extractData(response)
    return data?.token || null
  }

  /**
   * Update last sync token
   */
  async updateLastSyncToken(token: string): Promise<void> {
    await this.patch(API_ENDPOINTS.SYNC.LAST_TOKEN, { token })
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
    }>('/sync/stats')
    return this.extractData(response)
  }
}

// Export singleton
export const syncService = new SyncService()
