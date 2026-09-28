import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import type { BaseEntity } from '../../core/base/base.entity'
import { NetworkMonitor } from '../../services/sync/NetworkMonitor'
import { SyncEngine } from '../../services/sync/SyncEngine'
import { getOfflineCrudService } from '../../services/offline/OfflineCrudService'

export interface OfflineStoreConfig<T extends BaseEntity> {
  storeId: string
  tableName: string
  idField?: keyof T
}

export interface OfflineStoreState<T extends BaseEntity> {
  items: T[]
  selected: T | null
  loading: boolean
  saving: boolean
  error: string | null
  page: number
  limit: number
  total: number
  totalPages: number
  filters: Record<string, any>
}

/**
 * Creates a Pinia store with offline-first CRUD operations
 */
export function createOfflineCrudStore<T extends BaseEntity>(
  config: OfflineStoreConfig<T>
) {
  return defineStore(config.storeId, () => {
    const { tableName, idField = 'uuid' as keyof T } = config

    // ============================================
    // Dependencies
    // ============================================
    const networkMonitor = NetworkMonitor.getInstance()
    const syncEngine = new SyncEngine()
    const crud = getOfflineCrudService(networkMonitor)
    crud.setSyncEngine(syncEngine)

    // ============================================
    // State
    // ============================================
    const items = ref<T[]>([]) as Ref<T[]>
    const selected = ref<T | null>(null) as Ref<T | null>
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    const page = ref(1)
    const limit = ref(20)
    const total = ref(0)
    const totalPages = ref(1)
    const filters = ref<Record<string, any>>({})
    const initialized = ref(false)
    const pendingCount = ref(0)

    // ============================================
    // Getters
    // ============================================
    const hasItems = computed(() => items.value.length > 0)
    const isEmpty = computed(() => items.value.length === 0 && !loading.value)
    const count = computed(() => items.value.length)
    const isOnline = computed(() => networkMonitor.isOnline)

    // ============================================
    // Actions - Load
    // ============================================

    async function loadAll(): Promise<void> {
      loading.value = true
      error.value = null
      try {
        items.value = await crud.getAll<T>(tableName)
        total.value = items.value.length
        totalPages.value = Math.ceil(items.value.length / limit.value) || 1
      } catch (e: any) {
        error.value = e.message
        console.error(`Failed to load ${tableName}:`, e)
      } finally {
        loading.value = false
      }
    }

    async function loadQuery(filter: Record<string, any>): Promise<void> {
      loading.value = true
      error.value = null
      try {
        items.value = await crud.query<T>(tableName, filter)
        total.value = items.value.length
        filters.value = { ...filters.value, ...filter }
      } catch (e: any) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    async function loadPaginated(
      filter: Record<string, any> = {},
      pageNum?: number,
      limitNum?: number
    ): Promise<void> {
      loading.value = true
      error.value = null
      try {
        const p = pageNum ?? page.value
        const l = limitNum ?? limit.value
        const result = await crud.paginate<T>(tableName, filter, p, l)
        items.value = result.data
        total.value = result.total
        page.value = result.page
        limit.value = result.limit
        totalPages.value = Math.ceil(result.total / result.limit) || 1
      } catch (e: any) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    async function loadById(id: string): Promise<T | null> {
      loading.value = true
      error.value = null
      try {
        const item = await crud.getById<T>(tableName, id)
        selected.value = item
        return item
      } catch (e: any) {
        error.value = e.message
        return null
      } finally {
        loading.value = false
      }
    }

    // ============================================
    // Actions - Write (offline-first)
    // ============================================

    async function create(data: Partial<T>): Promise<T | null> {
      saving.value = true
      error.value = null
      try {
        const created = await crud.create<T>(tableName, data)
        items.value = [created, ...items.value]
        total.value++
        selected.value = created
        await refreshPendingCount()
        return created
      } catch (e: any) {
        error.value = e.message
        return null
      } finally {
        saving.value = false
      }
    }

    async function update(id: string, data: Partial<T>): Promise<T | null> {
      saving.value = true
      error.value = null
      try {
        const updated = await crud.update<T>(tableName, id, data)
        if (updated) {
          const index = items.value.findIndex((i) => (i as any)[idField] === id)
          if (index >= 0) {
            items.value[index] = updated
          }
          selected.value = updated
        }
        await refreshPendingCount()
        return updated
      } catch (e: any) {
        error.value = e.message
        return null
      } finally {
        saving.value = false
      }
    }

    async function remove(id: string, hard: boolean = false): Promise<boolean> {
      saving.value = true
      error.value = null
      try {
        const deleted = await crud.delete(tableName, id, { hard })
        if (deleted) {
          items.value = items.value.filter((i) => (i as any)[idField] !== id)
          total.value = Math.max(0, total.value - 1)
          if ((selected.value as any)?.[idField] === id) {
            selected.value = null
          }
        }
        await refreshPendingCount()
        return deleted
      } catch (e: any) {
        error.value = e.message
        return false
      } finally {
        saving.value = false
      }
    }

    async function restore(id: string): Promise<T | null> {
      saving.value = true
      try {
        return await crud.restore<T>(tableName, id)
      } catch (e: any) {
        error.value = e.message
        return null
      } finally {
        saving.value = false
      }
    }

    // ============================================
    // Actions - Bulk
    // ============================================

    async function bulkCreate(dataList: Partial<T>[]): Promise<T[]> {
      saving.value = true
      try {
        const created = await crud.bulkCreate<T>(tableName, dataList)
        items.value = [...created, ...items.value]
        total.value += created.length
        await refreshPendingCount()
        return created
      } catch (e: any) {
        error.value = e.message
        return []
      } finally {
        saving.value = false
      }
    }

    async function bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<void> {
      saving.value = true
      try {
        await crud.bulkUpdate<T>(
          tableName,
          updates.map((u) => ({ uuid: u.id, data: u.data }))
        )
        await loadAll()
        await refreshPendingCount()
      } catch (e: any) {
        error.value = e.message
      } finally {
        saving.value = false
      }
    }

    // ============================================
    // Actions - Utility
    // ============================================

    async function refreshPendingCount(): Promise<void> {
      try {
        pendingCount.value = await crud.getPendingCount(tableName)
      } catch {
        pendingCount.value = 0
      }
    }

    async function hasPending(id: string): Promise<boolean> {
      return crud.hasPendingChanges(tableName, id)
    }

    function clearSelection(): void {
      selected.value = null
    }

    function clearError(): void {
      error.value = null
    }

    function reset(): void {
      items.value = []
      selected.value = null
      error.value = null
      page.value = 1
      total.value = 0
      totalPages.value = 1
      filters.value = {}
      pendingCount.value = 0
    }

    async function initialize(): Promise<void> {
      if (initialized.value) return
      await loadAll()
      await refreshPendingCount()
      initialized.value = true
    }

    // ============================================
    // Return Store Interface
    // ============================================
    return {
      // State
      items,
      selected,
      loading,
      saving,
      error,
      page,
      limit,
      total,
      totalPages,
      filters,
      pendingCount,
      initialized,

      // Getters
      hasItems,
      isEmpty,
      count,
      isOnline,

      // Actions - Read
      loadAll,
      loadQuery,
      loadPaginated,
      loadById,

      // Actions - Write
      create,
      update,
      remove,
      restore,

      // Actions - Bulk
      bulkCreate,
      bulkUpdate,

      // Actions - Utility
      refreshPendingCount,
      hasPending,
      clearSelection,
      clearError,
      reset,
      initialize,
    }
  })
}