import { computed } from 'vue';
import { useNetwork } from './useNetwork';
import { useSyncStore } from './../stores';
import { db } from '../services/db/Database';

/**
 * Composable for offline-first operations
 */
export function useOffline() {
  const { isOnline } = useNetwork();
  const syncStore = useSyncStore();

  const isOfflineMode = computed(() => !isOnline.value);
  const pendingChangesCount = computed(() => syncStore.pendingCount);
  const hasPendingChanges = computed(() => syncStore.hasPendingChanges);

  /**
   * Save data locally and queue for sync
   */
  async function saveOffline<T extends { uuid: string }>(
    entityType: string,
    data: T,
    operation: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE',
  ): Promise<void> {
    // Save to local database
    const repository = db.getRepository(entityType);

    if (operation === 'DELETE') {
      await repository.softDelete(data.uuid, 'offline-user');
    } else {
      await repository.upsert(data);
    }

    // Queue for sync
    await syncStore.addPendingChange({
      entityType,
      entityId: data.uuid,
      operationType: operation,
      data: data as unknown as Record<string, unknown>,
    });
  }

  /**
   * Get data from local database
   */
  async function getOfflineData<T>(entityType: string, id: string): Promise<T | undefined> {
    const repository = db.getRepository(entityType);
    return repository.findById(id);
  }

  /**
   * Get all local data for an entity type
   */
  async function getAllOfflineData<T>(entityType: string): Promise<T[]> {
    const repository = db.getRepository(entityType);
    return repository.findAll();
  }

  /**
   * Sync when coming back online
   */
  async function syncWhenOnline(): Promise<void> {
    if (isOnline.value && hasPendingChanges.value) {
      await syncStore.fullSync();
    }
  }

  /**
   * Check if entity exists locally
   */
  async function existsLocally(entityType: string, id: string): Promise<boolean> {
    const repository = db.getRepository(entityType);
    return repository.exists(id);
  }

  return {
    isOfflineMode,
    pendingChangesCount,
    hasPendingChanges,
    saveOffline,
    getOfflineData,
    getAllOfflineData,
    syncWhenOnline,
    existsLocally,
  };
}