import { computed } from 'vue'
import { useNetwork } from './useNetwork'
import { useSyncStore } from '../stores/sync/sync.store'
import { db } from '../services/db/Database'

/**
 * Composable for offline-first operations
 * Aligned with useSyncStore + BCMDatabase.getRepository
 */
export function useOffline() {
  const { isOnline } = useNetwork()
  const syncStore = useSyncStore()

  const isOfflineMode = computed(() => !isOnline.value)
  const pendingChangesCount = computed(() => syncStore.pendingCount)
  const hasPendingChanges = computed(() => syncStore.hasPending)

  /**
   * Save data locally and queue for sync
   */
  async function saveOffline<T extends { uuid: string }>(
    entityType: string,
    data: T,
    operation: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE'
  ): Promise<void> {
    const repository = db.getRepository(entityType)
    if (!repository) throw new Error(`Repository not found: ${entityType}`)

    if (operation === 'DELETE') {
      await repository.softDelete(data.uuid, 'offline-user')
    } else {
      await repository.upsert(data)
    }
  }

  async function getOfflineData<T>(entityType: string, id: string): Promise<T | undefined> {
    const repository = db.getRepository(entityType)
    if (!repository) return undefined
    return (await repository.findById(id)) as T | undefined
  }

  async function getAllOfflineData<T>(entityType: string): Promise<T[]> {
    const repository = db.getRepository(entityType)
    if (!repository) return []
    return (await repository.findAll()) as T[]
  }

  async function syncWhenOnline(): Promise<void> {
    if (isOnline.value && hasPendingChanges.value) {
      await syncStore.sync()
    }
  }

  async function existsLocally(entityType: string, id: string): Promise<boolean> {
    const repository = db.getRepository(entityType)
    if (!repository) return false
    return repository.exists(id)
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
  }
}

export default useOffline