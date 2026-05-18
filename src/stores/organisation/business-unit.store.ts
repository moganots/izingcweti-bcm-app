import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BusinessUnit, Department } from './../../models/entities'
import { businessUnitService, departmentService } from './../../services/api'
import type {
  CreateBusinessUnitRequest,
  UpdateBusinessUnitRequest,
  BusinessUnitQueryParams,
  BulkImportResult,
} from './../../types'

export const useBusinessUnitStore = defineStore('businessUnit', () => {
  // ============================================
  // State
  // ============================================
  const businessUnits = ref<BusinessUnit[]>([])
  const selectedBusinessUnit = ref<(BusinessUnit & { departments?: Department[] }) | null>(null)
  const departments = ref<Department[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  const filters = ref<BusinessUnitQueryParams>({})
  const criticalityScores = ref<{ value: string; label: string; description: string }[]>([])

  // ============================================
  // Getters
  // ============================================
  const hasBusinessUnits = computed(() => businessUnits.value.length > 0)

  const criticalBusinessUnits = computed(() =>
    businessUnits.value.filter(
      (bu) => bu.criticality_score === 'CRITICAL' || bu.criticality_score === 'HIGH'
    )
  )

  const mediumBusinessUnits = computed(() =>
    businessUnits.value.filter((bu) => bu.criticality_score === 'MEDIUM')
  )

  const lowBusinessUnits = computed(() =>
    businessUnits.value.filter((bu) => bu.criticality_score === 'LOW')
  )

  const businessUnitsByCriticality = computed(() => {
    const grouped: Record<string, BusinessUnit[]> = {}
    businessUnits.value.forEach((bu) => {
      const score = bu.criticality_score || 'Unknown'
      if (!grouped[score]) grouped[score] = []
      grouped[score].push(bu)
    })
    return grouped
  })

  const businessUnitsByOrganisation = computed(() => {
    const grouped: Record<string, BusinessUnit[]> = {}
    businessUnits.value.forEach((bu) => {
      const orgId = bu.organisation_id || 'Unknown'
      if (!grouped[orgId]) grouped[orgId] = []
      grouped[orgId].push(bu)
    })
    return grouped
  })

  // ============================================
  // Actions
  // ============================================

  async function loadBusinessUnits(params?: BusinessUnitQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await businessUnitService.getBusinessUnits(queryParams)

      businessUnits.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0

      if (params) filters.value = { ...filters.value, ...params }
    } catch (err: any) {
      console.error('Failed to load business units:', err)
      error.value = err.message || 'Failed to load business units'
    } finally {
      isLoading.value = false
    }
  }

  async function loadBusinessUnit(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedBusinessUnit.value = await businessUnitService.getBusinessUnit(id)

      // Load departments for this business unit
      if (selectedBusinessUnit.value) {
        const deptResponse = await departmentService.getDepartmentsByBusinessUnit(id)
        departments.value = deptResponse.data || []
        selectedBusinessUnit.value.departments = departments.value
      }
    } catch (err: any) {
      console.error('Failed to load business unit:', err)
      error.value = err.message || 'Failed to load business unit'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadBusinessUnitsByOrganisation(
    organisationId: string,
    params?: BusinessUnitQueryParams
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await businessUnitService.getBusinessUnitsByOrganisation(organisationId, {
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })

      businessUnits.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load business units by organisation:', err)
      error.value = err.message || 'Failed to load business units'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCriticalBusinessUnits(organisationId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await businessUnitService.getCriticalBusinessUnits(organisationId)
      businessUnits.value = response
    } catch (err: any) {
      console.error('Failed to load critical business units:', err)
      error.value = err.message || 'Failed to load critical business units'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCriticalityScores(): Promise<void> {
    try {
      criticalityScores.value = await businessUnitService.getCriticalityScores()
    } catch (err: any) {
      console.error('Failed to load criticality scores:', err)
    }
  }

  async function createBusinessUnit(data: CreateBusinessUnitRequest): Promise<BusinessUnit> {
    isSaving.value = true
    error.value = null

    try {
      const created = await businessUnitService.createBusinessUnit(data)
      businessUnits.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create business unit:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create business unit'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateBusinessUnit(
    id: string,
    data: UpdateBusinessUnitRequest
  ): Promise<BusinessUnit> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await businessUnitService.updateBusinessUnit(id, data)
      const index = businessUnits.value.findIndex((bu) => bu.uuid === id)
      if (index !== -1) {
        businessUnits.value[index] = updated
      }
      if (selectedBusinessUnit.value?.uuid === id) {
        selectedBusinessUnit.value = { ...selectedBusinessUnit.value, ...updated }
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update business unit:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update business unit'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteBusinessUnit(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await businessUnitService.deleteBusinessUnit(id)
      businessUnits.value = businessUnits.value.filter((bu) => bu.uuid !== id)
      if (selectedBusinessUnit.value?.uuid === id) {
        selectedBusinessUnit.value = null
        departments.value = []
      }
    } catch (err: any) {
      console.error('Failed to delete business unit:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete business unit'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function searchBusinessUnits(query: string, organisationId?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await businessUnitService.searchBusinessUnits(query, organisationId)
      businessUnits.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to search business units'
    } finally {
      isLoading.value = false
    }
  }

  async function bulkImportBusinessUnits(
    organisationId: string,
    businessUnitsData: CreateBusinessUnitRequest[]
  ): Promise<BulkImportResult> {
    isSaving.value = true
    error.value = null

    try {
      const result = await businessUnitService.bulkImportBusinessUnits(
        organisationId,
        businessUnitsData
      )
      await loadBusinessUnitsByOrganisation(organisationId)
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to import business units'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function exportBusinessUnits(
    organisationId: string,
    format: 'csv' | 'json' = 'csv'
  ): Promise<void> {
    try {
      await businessUnitService.exportBusinessUnits(organisationId, format)
    } catch (err: any) {
      console.error('Failed to export business units:', err)
      error.value = err.message || 'Failed to export business units'
      throw err
    }
  }

  function clearSelection(): void {
    selectedBusinessUnit.value = null
    departments.value = []
  }

  function clearAll(): void {
    businessUnits.value = []
    selectedBusinessUnit.value = null
    departments.value = []
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    filters.value = {}
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadBusinessUnits()
  }

  return {
    // State
    businessUnits,
    selectedBusinessUnit,
    departments,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    criticalityScores,

    // Getters
    hasBusinessUnits,
    criticalBusinessUnits,
    mediumBusinessUnits,
    lowBusinessUnits,
    businessUnitsByCriticality,
    businessUnitsByOrganisation,

    // Actions
    loadBusinessUnits,
    loadBusinessUnit,
    loadBusinessUnitsByOrganisation,
    loadCriticalBusinessUnits,
    loadCriticalityScores,
    createBusinessUnit,
    updateBusinessUnit,
    deleteBusinessUnit,
    searchBusinessUnits,
    bulkImportBusinessUnits,
    exportBusinessUnits,
    clearSelection,
    clearAll,
    setPage,
  }
})
