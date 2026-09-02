import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuth } from './useAuth';
import { syncService } from './../services/sync/SyncService';
import type {
    PendingChange,
    SyncConflict,
    SyncProgress,
    SyncPullResponse,
    SyncPushResponse,
    ConflictResolutionStrategy,
    OperationType,
    SyncStatistics,
} from '../types/sync.types';

export interface UseSyncOptions {
    autoSyncInterval?: number; // minutes
    maxRetries?: number;
    batchSize?: number;
}

/**
 * Composable for sync operations
 * Uses auth composable for authentication
 */
export function useSync(options: UseSyncOptions = {}) {
    const {
        autoSyncInterval = 15,
        // maxRetries = 5,
        // batchSize = 50,
    } = options;

    const auth = useAuth();

    // ============================================
    // State
    // ============================================

    const isSyncing = ref(false);
    const lastSyncError = ref<string | null>(null);
    const lastSyncAt = ref<string | null>(null);
    const syncToken = ref<string | null>(null);
    const pendingChanges = ref<PendingChange[]>([]);
    const conflicts = ref<SyncConflict[]>([]);
    const syncProgress = ref<SyncProgress | null>(null);
    const isOnline = ref(navigator.onLine);
    let syncInterval: ReturnType<typeof setInterval> | null = null;

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
    // Methods - Pending Changes
    // ============================================

    /**
     * Add a pending change to the queue
     */
    async function addPendingChange(params: {
        entityType: string;
        entityId: string;
        operationType: OperationType;
        data: Record<string, any>;
        priority?: number;
    }): Promise<PendingChange> {
        if (!auth.isAuthenticated.value) {
            throw new Error('User must be authenticated to add pending changes');
        }

        const change = await syncService.createPendingChange(params);
        const normalizedChange = {
            ...change,
            status: (change.status ?? 'pending') as PendingChange['status'],
        } as PendingChange;

        await refreshPendingChanges();
        return normalizedChange;
    }

    /**
     * Add multiple pending changes
     */
    async function addPendingChanges(
        changes: Array<{
            entityType: string;
            entityId: string;
            operationType: OperationType;
            data: Record<string, any>;
            priority?: number;
        }>
    ): Promise<PendingChange[]> {
        if (!auth.isAuthenticated.value) {
            throw new Error('User must be authenticated to add pending changes');
        }

        const results = await syncService.bulkCreatePendingChanges(changes);
        const normalizedResults = results.map((change) => ({
            ...change,
            status: (change.status ?? 'pending') as PendingChange['status'],
        })) as PendingChange[];

        await refreshPendingChanges();
        return normalizedResults;
    }

    /**
     * Refresh pending changes from server
     */
    async function refreshPendingChanges(): Promise<void> {
        if (!auth.isAuthenticated.value) {
            pendingChanges.value = [];
            return;
        }

        try {
            const changes = await syncService.getPendingChanges();
            pendingChanges.value = changes.map((change) => ({
                ...change,
                status: (change.status ?? 'pending') as PendingChange['status'],
            })) as PendingChange[];
        } catch (error) {
            console.error('Failed to refresh pending changes:', error);
        }
    }

    /**
     * Process a pending change manually
     */
    async function processPendingChange(uuid: string): Promise<boolean> {
        const success = await syncService.processPendingChange(uuid);
        if (success) {
            await refreshPendingChanges();
        }
        return success;
    }

    /**
     * Retry all failed pending changes
     */
    async function retryFailedChanges(): Promise<number> {
        const result = await syncService.retryFailedChanges();
        await refreshPendingChanges();
        return result.retriedCount;
    }

    /**
     * Delete a pending change
     */
    async function deletePendingChange(uuid: string): Promise<boolean> {
        const success = await syncService.deletePendingChange(uuid);
        if (success) {
            await refreshPendingChanges();
        }
        return success;
    }

    /**
     * Clear all pending changes
     */
    async function clearPendingChanges(): Promise<void> {
        const changes = pendingChanges.value;
        for (const change of changes) {
            await syncService.deletePendingChange(change.uuid);
        }
        await refreshPendingChanges();
    }

    // ============================================
    // Methods - Conflicts
    // ============================================

    function normalizeConflict(conflict: any): SyncConflict {
        const normalizedConflictType = String(conflict?.conflictType ?? '')
            .replace(/-/g, '_')
            .replace(/\s+/g, '_')
            .toUpperCase();

        const normalizedResolutionStrategy = String(conflict?.resolutionStrategy ?? '')
            .replace(/-/g, '_')
            .replace(/\s+/g, '_')
            .toUpperCase();

        return {
            ...conflict,
            conflictType: normalizedConflictType as SyncConflict['conflictType'],
            resolutionStrategy:
                normalizedResolutionStrategy as SyncConflict['resolutionStrategy'],
            resolved: Boolean(conflict?.resolved),
        } as SyncConflict;
    }

    /**
     * Refresh conflicts from server
     */
    async function refreshConflicts(): Promise<void> {
        if (!auth.isAuthenticated.value) {
            conflicts.value = [];
            return;
        }

        try {
            const allConflicts = await syncService.getConflicts();
            conflicts.value = allConflicts.map((conflict) =>
                normalizeConflict(conflict)
            );
        } catch (error) {
            console.error('Failed to refresh conflicts:', error);
        }
    }

    /**
     * Resolve a conflict
     */
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
        return normalizeConflict(resolved);
    }

    /**
     * Bulk resolve conflicts
     */
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

    /**
     * Delete a conflict
     */
    async function deleteConflict(uuid: string): Promise<boolean> {
        const success = await syncService.deleteConflict(uuid);
        if (success) {
            await refreshConflicts();
        }
        return success;
    }

    // ============================================
    // Methods - Sync Operations
    // ============================================

    /**
     * Perform a full sync (pull + push)
     */
    async function fullSync(): Promise<{
        success: boolean;
        conflicts: SyncConflict[];
        changesApplied: number;
    }> {
        if (!auth.isAuthenticated.value) {
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
            // Get pending changes first
            await refreshPendingChanges();

            // Perform pull
            const pullResult = await syncService.pullChanges(syncToken.value);

            // Update sync token
            syncToken.value = pullResult.syncToken;
            lastSyncAt.value = new Date().toISOString();

            // Push pending changes
            const pushResult = await syncService.pushChanges({
                changes: pendingChanges.value,
                lastSyncToken: syncToken.value,
            });

            // Update sync token again
            if (pushResult.syncToken) {
                syncToken.value = pushResult.syncToken;
                await syncService.updateLastSyncToken(syncToken.value);
            }

            // Handle conflicts
            if (pushResult.conflicts && pushResult.conflicts.length > 0) {
                const normalizedConflicts = pushResult.conflicts.map((conflict) =>
                    normalizeConflict(conflict)
                );
                conflicts.value = normalizedConflicts;
                await syncService.updateLastSyncToken(syncToken.value);
                return {
                    success: false,
                    conflicts: normalizedConflicts,
                    changesApplied: pushResult.appliedChanges,
                };
            }

            // Refresh state
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

    /**
     * Pull changes from server only
     */
    async function pullChanges(): Promise<SyncPullResponse> {
        if (!auth.isAuthenticated.value) {
            throw new Error('User must be authenticated to pull changes');
        }

        const result = await syncService.pullChanges(syncToken.value);
        if (result.syncToken) {
            syncToken.value = result.syncToken;
            lastSyncAt.value = new Date().toISOString();
            await syncService.updateLastSyncToken(syncToken.value);
        }
        await refreshPendingChanges();
        await refreshConflicts();
        return result;
    }

    /**
     * Push changes to server only
     */
    async function pushChanges(): Promise<SyncPushResponse> {
        if (!auth.isAuthenticated.value) {
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
            lastSyncToken: syncToken.value!,
        });

        const normalizedResult: SyncPushResponse = {
            ...result,
            conflicts: (result.conflicts ?? []).map((conflict) =>
                normalizeConflict(conflict)
            ),
        };

        if (normalizedResult.syncToken) {
            syncToken.value = normalizedResult.syncToken;
            await syncService.updateLastSyncToken(syncToken.value);
        }

        if (normalizedResult.conflicts.length > 0) {
            conflicts.value = normalizedResult.conflicts;
        }

        await refreshPendingChanges();
        await refreshConflicts();
        return normalizedResult;
    }

    /**
     * Get sync progress
     */
    async function getSyncProgress(): Promise<SyncProgress> {
        const progress = await syncService.getSyncProgress();
        syncProgress.value = progress;
        return progress;
    }

    // ============================================
    // Methods - Network Status
    // ============================================

    /**
     * Update online status
     */
    function updateOnlineStatus(online: boolean): void {
        isOnline.value = online;
        if (online && hasPendingChanges.value) {
            // Auto-sync when coming online
            fullSync().catch(console.error);
        }
    }

    // ============================================
    // Methods - Sync Token
    // ============================================

    /**
     * Get current sync token
     */
    async function getSyncToken(): Promise<string | null> {
        const token = await syncService.getLastSyncToken();
        if (token) {
            syncToken.value = token;
        }
        return token;
    }

    /**
     * Update sync token
     */
    async function updateSyncToken(token: string): Promise<void> {
        await syncService.updateLastSyncToken(token);
        syncToken.value = token;
    }

    // ============================================
    // Initialization
    // ============================================

    async function initialize(): Promise<void> {
        if (!auth.isAuthenticated.value) {
            return;
        }

        try {
            // Get sync token
            await getSyncToken();

            // Load pending changes
            await refreshPendingChanges();

            // Load conflicts
            await refreshConflicts();

            // Get sync progress
            await getSyncProgress();
        } catch (error) {
            console.error('Failed to initialize sync:', error);
        }
    }

    // ============================================
    // Lifecycle
    // ============================================

    // Watch for online status
    watch(isOnline, (online) => {
        if (online && hasPendingChanges.value) {
            fullSync().catch(console.error);
        }
    });

    // Watch for authentication changes
    watch(
        () => auth.isAuthenticated.value,
        (authenticated) => {
            if (authenticated) {
                initialize().catch(console.error);
            } else {
                // Clear data on logout
                pendingChanges.value = [];
                conflicts.value = [];
                syncToken.value = null;
                lastSyncAt.value = null;
                syncProgress.value = null;
            }
        }
    );

    // Start auto-sync interval
    function startAutoSync(): void {
        if (syncInterval) {
            clearInterval(syncInterval);
        }
        syncInterval = setInterval(() => {
            if (auth.isAuthenticated.value && isOnline.value && !isSyncing.value) {
                fullSync().catch(console.error);
            }
        }, autoSyncInterval * 60 * 1000);
    }

    // Stop auto-sync interval
    function stopAutoSync(): void {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    }

    // Start/stop based on authentication
    watch(
        () => auth.isAuthenticated.value,
        (authenticated) => {
            if (authenticated) {
                startAutoSync();
            } else {
                stopAutoSync();
            }
        },
        { immediate: true }
    );

    // ============================================
    // Mount/Unmount
    // ============================================

    onMounted(() => {
        // Set up online/offline listeners
        window.addEventListener('online', () => updateOnlineStatus(true));
        window.addEventListener('offline', () => updateOnlineStatus(false));

        if (auth.isAuthenticated.value) {
            initialize().catch(console.error);
        }
    });

    onUnmounted(() => {
        window.removeEventListener('online', () => updateOnlineStatus(true));
        window.removeEventListener('offline', () => updateOnlineStatus(false));
        stopAutoSync();
    });

    // ============================================
    // Return API
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
        isIdle,

        // Computed
        pendingCount,
        hasPendingChanges,
        unresolvedConflictsCount,
        hasConflicts,
        statistics,

        // Pending Changes
        addPendingChange,
        addPendingChanges,
        refreshPendingChanges,
        processPendingChange,
        retryFailedChanges,
        deletePendingChange,
        clearPendingChanges,

        // Conflicts
        refreshConflicts,
        resolveConflict,
        bulkResolveConflicts,
        deleteConflict,

        // Sync Operations
        fullSync,
        pullChanges,
        pushChanges,
        getSyncProgress,

        // Sync Token
        getSyncToken,
        updateSyncToken,

        // Utilities
        initialize,
        startAutoSync,
        stopAutoSync,
    };
}

export default useSync;