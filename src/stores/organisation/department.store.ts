import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Department } from './../../models/entities'
import { departmentService } from './../../services/api'
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQueryParams,
  BulkImportResult,
} from './../../types'

export const useDepartmentStore = defineStore('department', () => {
  // ============================================
  // State
  // ============================================
  const departments = ref<Department[]>([])
  const selectedDepartment = ref<Department | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  const filters = ref<DepartmentQueryParams>({})

  // ============================================
  // Getters
  // ============================================
  const hasDepartments = computed(() => departments.value.length > 0)

  const departmentsWithRTO = computed(() =>
    departments.value.filter((dept) => dept.recovery_time_objective)
  )

  const departmentsWithRPO = computed(() =>
    departments.value.filter((dept) => dept.recovery_point_objective)
  )

  const departmentsWithoutBIA = computed(() =>
    departments.value.filter(
      (dept) => !dept.recovery_time_objective && !dept.recovery_point_objective
    )
  )

  const departmentsByBusinessUnit = computed(() => {
    const grouped: Record<string, Department[]> = {}
    departments.value.forEach((dept) => {
      const businessId = dept.business_id || 'Unknown'
      if (!grouped[businessId]) grouped[businessId] = []
      grouped[businessId].push(dept)
    })
    return grouped
  })

  // ============================================
  // Actions
  // ============================================

  async function loadDepartments(params?: DepartmentQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await departmentService.getDepartments(queryParams)

      departments.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0

      if (params) filters.value = { ...filters.value, ...params }
    } catch (err: any) {
      console.error('Failed to load departments:', err)
      error.value = err.message || 'Failed to load departments'
    } finally {
      isLoading.value = false
    }
  }

  async function loadDepartment(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedDepartment.value = await departmentService.getDepartment(id)
    } catch (err: any) {
      console.error('Failed to load department:', err)
      error.value = err.message || 'Failed to load department'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadDepartmentsByBusinessUnit(
    businessUnitId: string,
    params?: DepartmentQueryParams
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await departmentService.getDepartmentsByBusinessUnit(businessUnitId, {
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })

      departments.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load departments by business unit:', err)
      error.value = err.message || 'Failed to load departments'
    } finally {
      isLoading.value = false
    }
  }

  async function loadDepartmentsWithoutBIA(organisationId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await departmentService.getDepartmentsWithoutBIA(organisationId)
      departments.value = response
    } catch (err: any) {
      console.error('Failed to load departments without BIA:', err)
      error.value = err.message || 'Failed to load departments'
    } finally {
      isLoading.value = false
    }
  }

  async function createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    isSaving.value = true
    error.value = null

    try {
      const created = await departmentService.createDepartment(data)
      departments.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create department:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create department'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await departmentService.updateDepartment(id, data)
      const index = departments.value.findIndex((dept) => dept.uuid === id)
      if (index !== -1) {
        departments.value[index] = updated
      }
      if (selectedDepartment.value?.uuid === id) {
        selectedDepartment.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update department:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update department'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteDepartment(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await departmentService.deleteDepartment(id)
      departments.value = departments.value.filter((dept) => dept.uuid !== id)
      if (selectedDepartment.value?.uuid === id) {
        selectedDepartment.value = null
      }
    } catch (err: any) {
      console.error('Failed to delete department:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete department'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function searchDepartments(query: string, businessUnitId?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await departmentService.searchDepartments(query, businessUnitId)
      departments.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to search departments'
    } finally {
      isLoading.value = false
    }
  }

  async function bulkImportDepartments(
    businessUnitId: string,
    departmentsData: CreateDepartmentRequest[]
  ): Promise<BulkImportResult> {
    isSaving.value = true
    error.value = null

    try {
      const result = await departmentService.bulkImportDepartments(businessUnitId, departmentsData)
      await loadDepartmentsByBusinessUnit(businessUnitId)
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to import departments'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function exportDepartments(
    businessUnitId: string,
    format: 'csv' | 'json' = 'csv'
  ): Promise<void> {
    try {
      await departmentService.exportDepartments(businessUnitId, format)
    } catch (err: any) {
      console.error('Failed to export departments:', err)
      error.value = err.message || 'Failed to export departments'
      throw err
    }
  }

  function clearSelection(): void {
    selectedDepartment.value = null
  }

  function clearAll(): void {
    departments.value = []
    selectedDepartment.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    filters.value = {}
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadDepartments()
  }

  return {
    // State
    departments,
    selectedDepartment,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,

    // Getters
    hasDepartments,
    departmentsWithRTO,
    departmentsWithRPO,
    departmentsWithoutBIA,
    departmentsByBusinessUnit,

    // Actions
    loadDepartments,
    loadDepartment,
    loadDepartmentsByBusinessUnit,
    loadDepartmentsWithoutBIA,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    searchDepartments,
    bulkImportDepartments,
    exportDepartments,
    clearSelection,
    clearAll,
    setPage,
  }
})
