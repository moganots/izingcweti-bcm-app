// src/composables/useOffline.ts
import { ref, computed } from 'vue';
import { useNetwork } from './useNetwork';
import { useSyncStore } from '../stores/sync.store';
import { Database } from '../services/db/Database';

export function useOffline() {
  const { isOnline } = useNetwork();
  const syncStore = useSyncStore();
  const db = new Database();
  const isOfflineMode = computed(() => !isOnline.value);

  async function saveOffline(entityType: string, data: any): Promise<void> {
    const repository = db.getRepository(entityType);
    await repository.upsert(data.id, data);
    
    await syncStore.addPendingChange({
      entityType,
      entityId: data.id,
      operationType: 'UPDATE',
      data,
    });
  }

  async function getOfflineData(entityType: string): Promise<any[]> {
    const repository = db.getRepository(entityType);
    return repository.findAll();
  }

  async function syncWhenOnline(): Promise<void> {
    if (isOnline.value && syncStore.hasPendingChanges) {
      await syncStore.pushChanges();
      await syncStore.pullChanges();
    }
  }

  return {
    isOfflineMode,
    saveOffline,
    getOfflineData,
    syncWhenOnline,
  };
}