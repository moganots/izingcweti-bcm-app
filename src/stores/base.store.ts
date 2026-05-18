import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface BaseStoreState<T> {
  items: T[]
  selectedItem: T | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface BaseStoreGetters<T> {
  hasItems: ComputedRef<boolean>
  itemCount: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
}

export interface BaseStoreActions<T, C, U> {
  loadItems(params?: Record<string, any>): Promise<void>
  loadItem(id: string): Promise<void>
  createItem(data: C): Promise<T>
  updateItem(id: string, data: U): Promise<T>
  deleteItem(id: string): Promise<void>
  clearSelection(): void
  clearAll(): void
  setPage(page: number): Promise<void>
}

/**
 * Base Store Factory
 * Creates a reusable store pattern with common CRUD operations
 */
export function createBaseStore<T, C = Partial<T>, U = Partial<T>>(
  storeName: string,
  service: {
    getItems: (
      params?: Record<string, any>
    ) => Promise<{ data: T[]; totalPages: number; total: number }>
    getItem: (id: string) => Promise<T>
    createItem: (data: C) => Promise<T>
    updateItem: (id: string, data: U) => Promise<T>
    deleteItem: (id: string) => Promise<void>
  },
  options?: {
    idField?: string
    onError?: (error: Error) => void
    onSuccess?: (action: string, data?: any) => void
  }
) {
  const idField = options?.idField || 'uuid'

  // State
  const state: Ref<BaseStoreState<T>> = ref({
    items: [],
    selectedItem: null,
    isLoading: false,
    isSaving: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  })

  // Getters
  const hasItems = computed(() => state.value.items.length > 0)
  const itemCount = computed(() => state.value.items.length)
  const isEmpty = computed(() => state.value.items.length === 0)

  // Actions
  async function loadItems(params?: Record<string, any>): Promise<void> {
    state.value.isLoading = true
    state.value.error = null

    try {
      const response = await service.getItems({
        ...params,
        page: state.value.currentPage,
        limit: state.value.itemsPerPage,
      })

      state.value.items = response.data || []
      state.value.totalPages = response.totalPages || 1
      state.value.totalItems = response.total || 0
    } catch (err: any) {
      state.value.error = err.message || `Failed to load ${storeName}`
      options?.onError?.(err)
    } finally {
      state.value.isLoading = false
    }
  }

  async function loadItem(id: string): Promise<void> {
    state.value.isLoading = true
    state.value.error = null

    try {
      state.value.selectedItem = await service.getItem(id)
      options?.onSuccess?.('load', state.value.selectedItem)
    } catch (err: any) {
      state.value.error = err.message || `Failed to load ${storeName} item`
      options?.onError?.(err)
      throw err
    } finally {
      state.value.isLoading = false
    }
  }

  async function createItem(data: C): Promise<T> {
    state.value.isSaving = true
    state.value.error = null

    try {
      const created = await service.createItem(data)
      state.value.items.unshift(created)
      options?.onSuccess?.('create', created)
      return created
    } catch (err: any) {
      state.value.error = err.message || `Failed to create ${storeName} item`
      options?.onError?.(err)
      throw err
    } finally {
      state.value.isSaving = false
    }
  }

  async function updateItem(id: string, data: U): Promise<T> {
    state.value.isSaving = true
    state.value.error = null

    try {
      const updated = await service.updateItem(id, data)
      const index = state.value.items.findIndex((item: any) => item[idField] === id)
      if (index !== -1) {
        state.value.items[index] = updated
      }
      if ((state.value.selectedItem as any)?.[idField] === id) {
        state.value.selectedItem = updated
      }
      options?.onSuccess?.('update', updated)
      return updated
    } catch (err: any) {
      state.value.error = err.message || `Failed to update ${storeName} item`
      options?.onError?.(err)
      throw err
    } finally {
      state.value.isSaving = false
    }
  }

  async function deleteItem(id: string): Promise<void> {
    state.value.isSaving = true
    state.value.error = null

    try {
      await service.deleteItem(id)
      state.value.items = state.value.items.filter((item: any) => item[idField] !== id)
      if ((state.value.selectedItem as any)?.[idField] === id) {
        state.value.selectedItem = null
      }
      options?.onSuccess?.('delete', { id })
    } catch (err: any) {
      state.value.error = err.message || `Failed to delete ${storeName} item`
      options?.onError?.(err)
      throw err
    } finally {
      state.value.isSaving = false
    }
  }

  function clearSelection(): void {
    state.value.selectedItem = null
  }

  function clearAll(): void {
    state.value.items = []
    state.value.selectedItem = null
    state.value.error = null
    state.value.currentPage = 1
    state.value.totalPages = 1
    state.value.totalItems = 0
  }

  async function setPage(page: number): Promise<void> {
    state.value.currentPage = page
    await loadItems()
  }

  function reset(): void {
    clearAll()
    state.value.isLoading = false
    state.value.isSaving = false
  }

  return {
    // State
    state,
    // Getters
    hasItems,
    itemCount,
    isEmpty,
    // Actions
    loadItems,
    loadItem,
    createItem,
    updateItem,
    deleteItem,
    clearSelection,
    clearAll,
    setPage,
    reset,
  }
}

export type BaseStore = ReturnType<typeof createBaseStore>
