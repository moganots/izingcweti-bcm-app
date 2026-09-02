import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './../auth/auth.store';
import { syncService } from './../../services/sync/SyncService';
import type {
  SyncProgress,
  SyncStatistics,
  OperationType,
  ConflictResolutionStrategy,
} from '../../types/sync.types';
import { SyncConflict } from 'src/models/entities/sync/sync.entity';

export const useSyncStore = defineStore('sync', () => {
  const auth = useAuthStore();

  type PendingChangeState = Awaited<
    ReturnType<typeof syncService.getPendingChanges>
  >[number];

  type SyncConflictState = Awaited<
    ReturnType<typeof syncService.getConflicts>
  >[number];

  // ============================================
  // State
  // ============================================

  const isSyncing = ref(false);
  const lastSyncError = ref<string | null>(null);
  const lastSyncAt = ref<string | null>(null);
  const syncToken = ref<string | null>(null);
  const pendingChanges = ref<PendingChangeState[]>([]);
  const conflicts = ref<SyncConflictState[]>([]);
  const syncProgress = ref<SyncProgress | null>(null);
  const isOnline = ref(navigator.onLine);

  // ============================================
  // Computed
  // ============================================

  const pendingCount = computed(() => pendingChanges.value.length);
  const hasPendingChanges = computed(() => pendingChanges.value.length > 0);
  const unresolvedConflictsCount = computed(() =>
    conflicts.value.filter((c) => !c.resolved).length
  );
  const hasConflicts = computed(() => unresolvedConflictsCount.value > 0);
  const isIdle = computed(() => !isSyncing.value && !lastSyncError.value);

  const statistics = computed<SyncStatistics>(() => ({
    pendingChanges: pendingCount.value,
    conflicts: conflicts.value.length,
    unresolvedConflicts: unresolvedConflictsCount.value,
    lastSyncTime: lastSyncAt.value,
    lastSyncToken: syncToken.value,
    isOnline: isOnline.value,
    syncInProgress: isSyncing.value,
  }));

  // ============================================
  // Actions - Pending Changes
  // ============================================

  async function addPendingChange(params: {
    entityType: string;
    entityId: string;
    operationType: OperationType;
    data: Record<string, any>;
    priority?: number;
  }): Promise<Awaited<ReturnType<typeof syncService.createPendingChange>>> {
    if (!auth.isAuthenticated) {
      throw new Error('User must be authenticated to add pending changes');
    }

    const change: Awaited<
      ReturnType<typeof syncService.createPendingChange>
    > = await syncService.createPendingChange(params);
    await refreshPendingChanges();
    return change;
  }

  async function addPendingChanges(
    changes: Array<{
      entityType: string;
      entityId: string;
      operationType: OperationType;
      data: Record<string, any>;
      priority?: number;
    }>
  ): Promise<Awaited<ReturnType<typeof syncService.bulkCreatePendingChanges>>> {
    if (!auth.isAuthenticated) {
      throw new Error('User must be authenticated to add pending changes');
    }

    const results: Awaited<
      ReturnType<typeof syncService.bulkCreatePendingChanges>
    > = await syncService.bulkCreatePendingChanges(changes);
    await refreshPendingChanges();
    return results;
  }

  async function refreshPendingChanges(): Promise<void> {
    if (!auth.isAuthenticated) {
      pendingChanges.value = [];
      return;
    }

    try {
      const changes = await syncService.getPendingChanges();
      pendingChanges.value = changes;
    } catch (error) {
      console.error('Failed to refresh pending changes:', error);
    }
  }

  async function processPendingChange(uuid: string): Promise<boolean> {
    const success = await syncService.processPendingChange(uuid);
    if (success) {
      await refreshPendingChanges();
    }
    return success;
  }

  async function retryFailedChanges(): Promise<number> {
    const result = await syncService.retryFailedChanges();
    await refreshPendingChanges();
    return result.retriedCount;
  }

  async function deletePendingChange(uuid: string): Promise<boolean> {
    const success = await syncService.deletePendingChange(uuid);
    if (success) {
      await refreshPendingChanges();
    }
    return success;
  }

  async function clearPendingChanges(): Promise<void> {
    const changes = pendingChanges.value;
    for (const change of changes) {
      await syncService.deletePendingChange(change.uuid);
    }
    await refreshPendingChanges();
  }

  // ============================================
  // Actions - Conflicts
  // ============================================

  async function refreshConflicts(): Promise<void> {
    if (!auth.isAuthenticated) {
      conflicts.value = [];
      return;
    }

    try {
      const allConflicts = await syncService.getConflicts();
      conflicts.value = allConflicts;
    } catch (error) {
      console.error('Failed to refresh conflicts:', error);
    }
  }

  async function resolveConflict(
    uuid: string,
    data: {
      resolutionStrategy: ConflictResolutionStrategy;
      resolvedData?: Record<string, any>;
      notes?: string;
    }
  ): Promise<SyncConflict> {
    const resolved = await syncService.resolveConflict(uuid, data);
    await refreshConflicts();
    return resolved;
  }

  async function bulkResolveConflicts(
    conflictIds: string[],
    resolutionStrategy: ConflictResolutionStrategy,
    resolvedData?: Record<string, any>
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    const result = await syncService.bulkResolveConflicts(
      conflictIds,
      resolutionStrategy,
      resolvedData
    );
    await refreshConflicts();
    return result;
  }

  async function deleteConflict(uuid: string): Promise<boolean> {
    const success = await syncService.deleteConflict(uuid);
    if (success) {
      await refreshConflicts();
    }
    return success;
  }

  // ============================================
  // Actions - Sync Operations
  // ============================================

  async function fullSync(): Promise<{
    success: boolean;
    conflicts: SyncConflict[];
    changesApplied: number;
  }> {
    if (!auth.isAuthenticated) {
      throw new Error('User must be authenticated to sync');
    }

    if (!isOnline.value) {
      throw new Error('Cannot sync while offline');
    }

    if (isSyncing.value) {
      throw new Error('Sync already in progress');
    }

    isSyncing.value = true;
    lastSyncError.value = null;

    try {
      await refreshPendingChanges();

      const pullResult = await syncService.pullChanges(syncToken.value);
      syncToken.value = pullResult.syncToken;
      lastSyncAt.value = new Date().toISOString();

      const pushResult = await syncService.pushChanges({
        changes: pendingChanges.value,
        lastSyncToken: syncToken.value ?? '',
      });

      if (pushResult.syncToken) {
        syncToken.value = pushResult.syncToken;
        await syncService.updateLastSyncToken(syncToken.value!);
      }

      if (pushResult.conflicts && pushResult.conflicts.length > 0) {
        conflicts.value = pushResult.conflicts;
        return {
          success: false,
          conflicts: pushResult.conflicts,
          changesApplied: pushResult.appliedChanges,
        };
      }

      await refreshPendingChanges();
      await refreshConflicts();

      return {
        success: true,
        conflicts: [],
        changesApplied: pushResult.appliedChanges,
      };
    } catch (error: any) {
      lastSyncError.value = error.message || 'Sync failed';
      return {
        success: false,
        conflicts: conflicts.value,
        changesApplied: 0,
      };
    } finally {
      isSyncing.value = false;
    }
  }

  async function pullChanges() {
    if (!auth.isAuthenticated) {
      throw new Error('User must be authenticated to pull changes');
    }

    const result = await syncService.pullChanges(syncToken.value);
    if (result.syncToken) {
      syncToken.value = result.syncToken;
      lastSyncAt.value = new Date().toISOString();
      await syncService.updateLastSyncToken(syncToken.value!);
    }
    await refreshPendingChanges();
    await refreshConflicts();
    return result;
  }

  async function pushChanges() {
    if (!auth.isAuthenticated) {
      throw new Error('User must be authenticated to push changes');
    }

    await refreshPendingChanges();

    if (pendingChanges.value.length === 0) {
      return {
        success: true,
        appliedChanges: 0,
        conflicts: [],
        syncToken: syncToken.value || '',
      };
    }

    const result = await syncService.pushChanges({
      changes: pendingChanges.value,
      lastSyncToken: syncToken.value || '',
    });

    if (result.syncToken) {
      syncToken.value = result.syncToken;
      await syncService.updateLastSyncToken(syncToken.value!);
    }

    if (result.conflicts && result.conflicts.length > 0) {
      conflicts.value = result.conflicts;
    }

    await refreshPendingChanges();
    await refreshConflicts();
    return result;
  }

  async function getSyncProgress(): Promise<SyncProgress> {
    const progress = await syncService.getSyncProgress();
    syncProgress.value = progress;
    return progress;
  }

  async function getSyncToken(): Promise<string | null> {
    const token = await syncService.getLastSyncToken();
    if (token) {
      syncToken.value = token;
    }
    return token;
  }

  async function updateSyncToken(token: string): Promise<void> {
    await syncService.updateLastSyncToken(token);
    syncToken.value = token;
  }

  // ============================================
  // Actions - Initialization
  // ============================================

  async function initialize(): Promise<void> {
    if (!auth.isAuthenticated) {
      return;
    }

    try {
      await getSyncToken();
      await refreshPendingChanges();
      await refreshConflicts();
      await getSyncProgress();
    } catch (error) {
      console.error('Failed to initialize sync:', error);
    }
  }

  function reset(): void {
    isSyncing.value = false;
    lastSyncError.value = null;
    lastSyncAt.value = null;
    syncToken.value = null;
    pendingChanges.value = [];
    conflicts.value = [];
    syncProgress.value = null;
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    isSyncing,
    lastSyncError,
    lastSyncAt,
    syncToken,
    pendingChanges,
    conflicts,
    syncProgress,
    isOnline,

    // Computed
    pendingCount,
    hasPendingChanges,
    unresolvedConflictsCount,
    hasConflicts,
    isIdle,
    statistics,

    // Actions
    addPendingChange,
    addPendingChanges,
    refreshPendingChanges,
    processPendingChange,
    retryFailedChanges,
    deletePendingChange,
    clearPendingChanges,
    refreshConflicts,
    resolveConflict,
    bulkResolveConflicts,
    deleteConflict,
    fullSync,
    pullChanges,
    pushChanges,
    getSyncProgress,
    getSyncToken,
    updateSyncToken,
    initialize,
    reset,
  };
});

export default useSyncStore;