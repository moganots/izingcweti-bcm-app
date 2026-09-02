import { BaseService } from './../BaseService';
import { API_ENDPOINTS } from './../../core/constants/api.constants';
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
  SyncPullResponse,
  SyncPushResponse,
  SyncPushRequest,
  ConflictResolutionStrategy,
} from './../../models/entities/sync/sync.entity';
import type { PaginatedResponse } from './../../shared/types/common.types';

/**
 * Sync Progress Interface
 * Matches the backend SyncProgressDto
 */
export interface SyncProgress {
  lastSyncToken: string | null;
  lastSyncTime: string | Date | null;
  totalProcessed: number;
  pendingItems: number;
  failedItems: number;
}

export class SyncService extends BaseService {
  // ============================================
  // Pull/Push Operations
  // ============================================

  /**
   * Pull changes from server
   * GET /sync/pull
   */
  async pullChanges(sinceToken?: string | null): Promise<SyncPullResponse> {
    const response = await this.get<SyncPullResponse>(API_ENDPOINTS.SYNC.PULL, {
      since: sinceToken,
    });
    return this.extractData(response);
  }

  /**
   * Push changes to server
   * POST /sync/push
   */
  async pushChanges(request: SyncPushRequest): Promise<SyncPushResponse> {
    const response = await this.post<SyncPushResponse>(API_ENDPOINTS.SYNC.PUSH, request);
    return this.extractData(response);
  }

  /**
   * Perform full sync (pull then push)
   */
  async fullSync(): Promise<{
    pullSuccess: boolean;
    pushSuccess: boolean;
    conflicts: SyncConflict[];
    newSyncToken: string;
  }> {
    let pullSuccess = false;
    let pushSuccess = false;
    let conflicts: SyncConflict[] = [];
    let newSyncToken = '';

    try {
      const pullResult = await this.pullChanges();
      pullSuccess = true;
      newSyncToken = pullResult.syncToken;

      const pendingChanges = await this.getPendingChanges();
      if (pendingChanges.length > 0) {
        const pushResult = await this.pushChanges({ changes: pendingChanges });
        pushSuccess = pushResult.success;
        conflicts = pushResult.conflicts || [];
        if (pushResult.syncToken) {
          newSyncToken = pushResult.syncToken;
        }
      } else {
        pushSuccess = true;
      }
    } catch (error) {
      console.error('Full sync failed:', error);
    }

    return { pullSuccess, pushSuccess, conflicts, newSyncToken };
  }

  // ============================================
  // Pending Changes Operations
  // ============================================

  /**
   * Get all pending changes
   * GET /sync/pending-changes
   */
  async getPendingChanges(params?: { status?: string; limit?: number }): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(API_ENDPOINTS.SYNC.PENDING_CHANGES, params);
    return this.extractData(response);
  }

  /**
   * Get pending changes with pagination
   * GET /sync/pending-changes with pagination params
   */
  async getPendingChangesPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<PendingChange>> {
    return this.getPaginated<PendingChange>(API_ENDPOINTS.SYNC.PENDING_CHANGES, { page, limit });
  }

  /**
   * Get pending changes by entity ID
   * GET /sync/pending-changes/entity/:entityId
   */
  async getPendingChangesByEntity(entityId: string): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_BY_ENTITY(entityId)
    );
    return this.extractData(response);
  }

  /**
   * Get pending changes by entity type
   * GET /sync/pending-changes/type/:entityType
   */
  async getPendingChangesByType(entityType: string): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_BY_TYPE(entityType)
    );
    return this.extractData(response);
  }

  /**
   * Get pending changes with status PENDING
   * GET /sync/pending-changes/pending
   */
  async getPendingChangesPending(): Promise<PendingChange[]> {
    const response = await this.get<PendingChange[]>(API_ENDPOINTS.SYNC.PENDING_CHANGES_PENDING);
    return this.extractData(response);
  }

  /**
   * Get pending change by ID
   * GET /sync/pending-changes/:uuid
   */
  async getPendingChangeById(uuid: string): Promise<PendingChange> {
    const response = await this.get<PendingChange>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_BY_ID(uuid)
    );
    return this.extractData(response);
  }

  /**
   * Create a pending change
   * POST /sync/pending-changes
   */
  async createPendingChange(change: {
    entityType: string;
    entityId: string;
    operationType: string;
    data: Record<string, any>;
    priority?: number;
  }): Promise<PendingChange> {
    const response = await this.post<PendingChange>(API_ENDPOINTS.SYNC.PENDING_CHANGES, change);
    return this.extractData(response);
  }

  /**
   * Create multiple pending changes
   * POST /sync/pending-changes/bulk
   */
  async bulkCreatePendingChanges(changes: Array<{
    entityType: string;
    entityId: string;
    operationType: string;
    data: Record<string, any>;
    priority?: number;
  }>): Promise<PendingChange[]> {
    const response = await this.post<PendingChange[]>(API_ENDPOINTS.SYNC.PENDING_CHANGES_BULK, {
      changes,
    });
    return this.extractData(response);
  }

  /**
   * Process a pending change
   * POST /sync/pending-changes/:uuid/process
   */
  async processPendingChange(uuid: string): Promise<boolean> {
    const response = await this.post<{ success: boolean }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_PROCESS(uuid)
    );
    return this.extractData(response).success;
  }

  /**
   * Retry failed pending changes
   * POST /sync/pending-changes/retry-failed
   */
  async retryFailedChanges(): Promise<{ retriedCount: number }> {
    const response = await this.post<{ retriedCount: number }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_RETRY_FAILED
    );
    return this.extractData(response);
  }

  /**
   * Delete a pending change
   * DELETE /sync/pending-changes/:uuid
   */
  async deletePendingChange(uuid: string): Promise<boolean> {
    const response = await this.delete<{ success: boolean }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_DELETE(uuid)
    );
    return this.extractData(response).success;
  }

  /**
   * Cleanup old pending changes
   * DELETE /sync/pending-changes/cleanup
   */
  async cleanupPendingChanges(days: number = 30): Promise<{ cleanedCount: number }> {
    const response = await this.delete<{ cleanedCount: number }>(
      API_ENDPOINTS.SYNC.PENDING_CHANGES_CLEANUP,
      { days }
    );
    return this.extractData(response);
  }

  /**
   * Get pending changes statistics
   * GET /sync/pending-changes/stats
   */
  async getPendingChangesStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byPriority: Record<number, number>;
  }> {
    const response = await this.get(API_ENDPOINTS.SYNC.PENDING_CHANGES_STATS);
    return this.extractData(response);
  }

  // ============================================
  // Sync Conflicts Operations
  // ============================================

  /**
   * Get all conflicts
   * GET /sync/conflicts
   */
  async getConflicts(params?: { resolved?: boolean; limit?: number }): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(API_ENDPOINTS.SYNC.CONFLICTS, params);
    return this.extractData(response);
  }

  /**
   * Get conflicts with pagination
   * GET /sync/conflicts with pagination params
   */
  async getConflictsPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<SyncConflict>> {
    return this.getPaginated<SyncConflict>(API_ENDPOINTS.SYNC.CONFLICTS, { page, limit });
  }

  /**
   * Get unresolved conflicts
   * GET /sync/conflicts/unresolved
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(API_ENDPOINTS.SYNC.CONFLICTS_UNRESOLVED);
    return this.extractData(response);
  }

  /**
   * Get conflicts by entity ID
   * GET /sync/conflicts/entity/:entityId
   */
  async getConflictsByEntity(entityId: string): Promise<SyncConflict[]> {
    const response = await this.get<SyncConflict[]>(
      API_ENDPOINTS.SYNC.CONFLICTS_BY_ENTITY(entityId)
    );
    return this.extractData(response);
  }

  /**
   * Get conflict by ID
   * GET /sync/conflicts/:uuid
   */
  async getConflictById(uuid: string): Promise<SyncConflict> {
    const response = await this.get<SyncConflict>(API_ENDPOINTS.SYNC.CONFLICT_BY_ID(uuid));
    return this.extractData(response);
  }

  /**
   * Resolve a conflict
   * POST /sync/conflicts/:uuid/resolve
   */
  async resolveConflict(
    uuid: string,
    data: {
      resolutionStrategy: ConflictResolutionStrategy;
      resolvedData?: Record<string, any>;
      notes?: string;
    }
  ): Promise<SyncConflict> {
    const response = await this.post<SyncConflict>(
      API_ENDPOINTS.SYNC.CONFLICT_RESOLVE(uuid),
      data
    );
    return this.extractData(response);
  }

  /**
   * Bulk resolve conflicts
   * POST /sync/conflicts/resolve
   */
  async bulkResolveConflicts(
    conflictIds: string[],
    resolutionStrategy: ConflictResolutionStrategy,
    resolvedData?: Record<string, any>
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    const response = await this.post<{ updated: number; failed: number; errors: string[] }>(
      API_ENDPOINTS.SYNC.CONFLICTS_RESOLVE,
      { conflictIds, resolutionStrategy, resolvedData }
    );
    return this.extractData(response);
  }

  /**
   * Delete a conflict
   * DELETE /sync/conflicts/:uuid
   */
  async deleteConflict(uuid: string): Promise<boolean> {
    const response = await this.delete<{ success: boolean }>(
      API_ENDPOINTS.SYNC.CONFLICT_DELETE(uuid)
    );
    return this.extractData(response).success;
  }

  /**
   * Cleanup old conflicts
   * DELETE /sync/conflicts/cleanup
   */
  async cleanupConflicts(days: number = 90): Promise<{ cleanedCount: number }> {
    const response = await this.delete<{ cleanedCount: number }>(
      API_ENDPOINTS.SYNC.CONFLICTS_CLEANUP,
      { days }
    );
    return this.extractData(response);
  }

  /**
   * Get conflict statistics
   * GET /sync/conflicts/stats
   */
  async getConflictStats(): Promise<{
    total: number;
    resolved: number;
    unresolved: number;
    byType: Record<string, number>;
    averageResolutionHours: number;
  }> {
    const response = await this.get(API_ENDPOINTS.SYNC.CONFLICTS_STATS);
    return this.extractData(response);
  }

  // ============================================
  // Sync Metadata Operations
  // ============================================

  /**
   * Get all metadata
   * GET /sync/metadata
   */
  async getAllMetadata(): Promise<SyncMetadata[]> {
    const response = await this.get<SyncMetadata[]>(API_ENDPOINTS.SYNC.METADATA);
    return this.extractData(response);
  }

  /**
   * Get metadata by key
   * GET /sync/metadata/:key
   */
  async getMetadataByKey(key: string): Promise<SyncMetadata | null> {
    try {
      const response = await this.get<SyncMetadata>(API_ENDPOINTS.SYNC.METADATA_BY_KEY(key));
      return this.extractData(response);
    } catch {
      return null;
    }
  }

  /**
   * Get metadata by prefix
   * GET /sync/metadata/prefix/:prefix
   */
  async getMetadataByPrefix(prefix: string): Promise<SyncMetadata[]> {
    const response = await this.get<SyncMetadata[]>(
      API_ENDPOINTS.SYNC.METADATA_BY_PREFIX(prefix)
    );
    return this.extractData(response);
  }

  /**
   * Get metadata by pattern
   * GET /sync/metadata/pattern/:pattern
   */
  async getMetadataByPattern(pattern: string): Promise<SyncMetadata[]> {
    const response = await this.get<SyncMetadata[]>(
      API_ENDPOINTS.SYNC.METADATA_BY_PATTERN(pattern)
    );
    return this.extractData(response);
  }

  /**
   * Create or update metadata
   * PUT /sync/metadata/:key/upsert
   */
  async upsertMetadata(key: string, value: string): Promise<SyncMetadata> {
    const response = await this.put<SyncMetadata>(
      API_ENDPOINTS.SYNC.METADATA_UPSERT(key),
      { value }
    );
    return this.extractData(response);
  }

  /**
   * Update metadata
   * PUT /sync/metadata/:key
   */
  async updateMetadata(key: string, value: string): Promise<SyncMetadata> {
    const response = await this.put<SyncMetadata>(
      API_ENDPOINTS.SYNC.METADATA_UPDATE(key),
      { value }
    );
    return this.extractData(response);
  }

  /**
   * Delete metadata
   * DELETE /sync/metadata/:key
   */
  async deleteMetadata(key: string): Promise<boolean> {
    const response = await this.delete<{ success: boolean }>(
      API_ENDPOINTS.SYNC.METADATA_DELETE(key)
    );
    return this.extractData(response).success;
  }

  /**
   * Get last sync token
   * GET /sync/metadata/last-sync-token
   */
  async getLastSyncToken(): Promise<string | null> {
    try {
      const response = await this.get<{ token: string }>(
        API_ENDPOINTS.SYNC.LAST_SYNC_TOKEN
      );
      return this.extractData(response).token;
    } catch {
      return null;
    }
  }

  /**
   * Update last sync token
   * PATCH /sync/metadata/last-sync-token
   */
  async updateLastSyncToken(token: string): Promise<void> {
    await this.patch(API_ENDPOINTS.SYNC.METADATA_UPDATE_TOKEN, { token });
  }

  /**
   * Get sync progress
   * GET /sync/metadata/sync-progress
   */
  async getSyncProgress(): Promise<SyncProgress> {
    const response = await this.get<SyncProgress>(API_ENDPOINTS.SYNC.SYNC_PROGRESS);
    return this.extractData(response);
  }

  /**
   * Get metadata map
   * GET /sync/metadata/map
   */
  async getMetadataMap(prefix?: string): Promise<Record<string, string>> {
    const response = await this.get<Record<string, string>>(
      API_ENDPOINTS.SYNC.METADATA_MAP,
      { prefix }
    );
    return this.extractData(response);
  }

  /**
   * Get metadata statistics
   * GET /sync/metadata/stats
   */
  async getMetadataStats(): Promise<{
    totalKeys: number;
    byCategory: Record<string, number>;
    totalSizeBytes: number;
  }> {
    const response = await this.get(API_ENDPOINTS.SYNC.METADATA_STATS);
    return this.extractData(response);
  }

  /**
   * Increment a counter
   * POST /sync/metadata/:key/increment
   */
  async incrementCounter(key: string, increment: number = 1): Promise<number> {
    const response = await this.post<{ value: number }>(
      API_ENDPOINTS.SYNC.METADATA_INCREMENT(key),
      { increment }
    );
    return this.extractData(response).value;
  }

  /**
   * Backup metadata
   * POST /sync/metadata/backup
   */
  async backupMetadata(): Promise<{ backupKey: string }> {
    const response = await this.post<{ backupKey: string }>(
      API_ENDPOINTS.SYNC.METADATA_BACKUP
    );
    return this.extractData(response);
  }

  /**
   * Restore metadata from backup
   * POST /sync/metadata/restore/:backupKey
   */
  async restoreMetadata(backupKey: string): Promise<{ restoredCount: number }> {
    const response = await this.post<{ restoredCount: number }>(
      API_ENDPOINTS.SYNC.METADATA_RESTORE(backupKey)
    );
    return this.extractData(response);
  }

  /**
   * Clear metadata by prefix
   * DELETE /sync/metadata/prefix/:prefix
   */
  async clearMetadataByPrefix(prefix: string): Promise<{ deletedCount: number }> {
    const response = await this.delete<{ deletedCount: number }>(
      API_ENDPOINTS.SYNC.METADATA_CLEAR_PREFIX(prefix)
    );
    return this.extractData(response);
  }
}

export const syncService = new SyncService();