import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Organisation, BusinessUnit, Department } from './../../models/entities'
import { organisationService, departmentService, businessUnitService } from './../../services/api'
import type {
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  OrganisationStats,
  OrganisationDashboard,
  OrganisationQueryParams,
  BulkImportResult,
  ExportOptions,
} from './../../types'

export const useOrganisationStore = defineStore('organisation', () => {
  // ============================================
  // State - Organisations
  // ============================================
  const organisations = ref<Organisation[]>([])
  const selectedOrganisation = ref<Organisation | null>(null)
  const organisationHierarchy = ref<{
    organisation: Organisation
    business_units: Array<{
      business_unit: BusinessUnit
      departments: Department[]
    }>
  } | null>(null)
  const organisationStats = ref<OrganisationStats | null>(null)
  const organisationDashboard = ref<OrganisationDashboard | null>(null)

  // ============================================
  // State - Business Units (Cached)
  // ============================================
  const businessUnitsCache = ref<Map<string, BusinessUnit[]>>(new Map())
  const selectedBusinessUnit = ref<BusinessUnit | null>(null)

  // ============================================
  // State - Departments (Cached)
  // ============================================
  const departmentsCache = ref<Map<string, Department[]>>(new Map())
  const selectedDepartment = ref<Department | null>(null)

  // ============================================
  // State - UI & Pagination
  // ============================================
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  // ============================================
  // State - Filters
  // ============================================
  const organisationFilters = ref<OrganisationQueryParams>({})

  // ============================================
  // Getters - Organisations
  // ============================================
  const hasOrganisations = computed(() => organisations.value.length > 0)

  const organisationsByIndustry = computed(() => {
    const grouped: Record<string, Organisation[]> = {}
    organisations.value.forEach((org) => {
      const industry = org.industry_type || 'Unknown'
      if (!grouped[industry]) grouped[industry] = []
      grouped[industry].push(org)
    })
    return grouped
  })

  const highMaturityOrganisations = computed(() =>
    organisations.value.filter((org) => (org.maturity_score || 0) >= 70)
  )

  const lowMaturityOrganisations = computed(() =>
    organisations.value.filter((org) => (org.maturity_score || 0) < 50)
  )

  const averageMaturityScore = computed(() => {
    if (organisations.value.length === 0) return 0
    const sum = organisations.value.reduce((acc, org) => acc + (org.maturity_score || 0), 0)
    return Math.round(sum / organisations.value.length)
  })

  // ============================================
  // Getters - Business Units
  // ============================================
  const getBusinessUnitsForOrganisation = (organisationId: string) => {
    return businessUnitsCache.value.get(organisationId) || []
  }

  const hasBusinessUnits = (organisationId: string) => {
    return (businessUnitsCache.value.get(organisationId)?.length || 0) > 0
  }

  // ============================================
  // Getters - Departments
  // ============================================
  const getDepartmentsForBusinessUnit = (businessUnitId: string) => {
    return departmentsCache.value.get(businessUnitId) || []
  }

  const hasDepartments = (businessUnitId: string) => {
    return (departmentsCache.value.get(businessUnitId)?.length || 0) > 0
  }

  // ============================================
  // Actions - Organisations
  // ============================================

  async function loadOrganisations(params?: OrganisationQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...organisationFilters.value,
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await organisationService.getOrganisations(queryParams)

      organisations.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0

      if (params) organisationFilters.value = { ...organisationFilters.value, ...params }
    } catch (err: any) {
      console.error('Failed to load organisations:', err)
      error.value = err.message || 'Failed to load organisations'
    } finally {
      isLoading.value = false
    }
  }

  async function loadOrganisation(id: string, include?: string[]): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedOrganisation.value = await organisationService.getOrganisation(id, include)
    } catch (err: any) {
      console.error('Failed to load organisation:', err)
      error.value = err.message || 'Failed to load organisation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadOrganisationDashboard(organisationId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      organisationDashboard.value = await organisationService.getDashboard(organisationId)
    } catch (err: any) {
      console.error('Failed to load organisation dashboard:', err)
      error.value = err.message || 'Failed to load dashboard'
    } finally {
      isLoading.value = false
    }
  }

  async function loadOrganisationStats(organisationId?: string): Promise<void> {
    try {
      organisationStats.value = await organisationService.getStats(organisationId)
    } catch (err: any) {
      console.error('Failed to load organisation stats:', err)
    }
  }

  async function loadOrganisationHierarchy(organisationId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      organisationHierarchy.value = await organisationService.getOrganisationHierarchy(
        organisationId
      )

      // Cache business units
      if (organisationHierarchy.value) {
        const bus = organisationHierarchy.value.business_units.map((bu) => bu.business_unit)
        businessUnitsCache.value.set(organisationId, bus)

        // Cache departments
        for (const bu of organisationHierarchy.value.business_units) {
          departmentsCache.value.set(bu.business_unit.uuid, bu.departments)
        }
      }
    } catch (err: any) {
      console.error('Failed to load organisation hierarchy:', err)
      error.value = err.message || 'Failed to load organisation structure'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createOrganisation(data: CreateOrganisationRequest): Promise<Organisation> {
    isSaving.value = true
    error.value = null

    try {
      const created = await organisationService.createOrganisation(data)
      organisations.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create organisation:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create organisation'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateOrganisation(
    id: string,
    data: UpdateOrganisationRequest
  ): Promise<Organisation> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await organisationService.updateOrganisation(id, data)
      const index = organisations.value.findIndex((org) => org.uuid === id)
      if (index !== -1) {
        organisations.value[index] = updated
      }
      if (selectedOrganisation.value?.uuid === id) {
        selectedOrganisation.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update organisation:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update organisation'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteOrganisation(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await organisationService.deleteOrganisation(id)
      organisations.value = organisations.value.filter((org) => org.uuid !== id)
      if (selectedOrganisation.value?.uuid === id) {
        selectedOrganisation.value = null
      }
      // Clear cached data
      businessUnitsCache.value.delete(id)
    } catch (err: any) {
      console.error('Failed to delete organisation:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete organisation'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function restoreOrganisation(id: string): Promise<Organisation> {
    isSaving.value = true
    error.value = null

    try {
      const restored = await organisationService.restoreOrganisation(id)
      organisations.value.unshift(restored)
      return restored
    } catch (err: any) {
      console.error('Failed to restore organisation:', err)
      error.value = err.message || 'Failed to restore organisation'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function searchOrganisations(query: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await organisationService.searchOrganisations(query)
      organisations.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to search organisations'
    } finally {
      isLoading.value = false
    }
  }

  async function bulkImportOrganisations(
    organisationsData: CreateOrganisationRequest[]
  ): Promise<BulkImportResult> {
    isSaving.value = true
    error.value = null

    try {
      const result = await organisationService.bulkImportOrganisations(organisationsData)
      await loadOrganisations()
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to import organisations'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function exportOrganisations(options?: ExportOptions): Promise<void> {
    try {
      await organisationService.exportOrganisations(options)
    } catch (err: any) {
      console.error('Failed to export organisations:', err)
      error.value = err.message || 'Failed to export organisations'
      throw err
    }
  }

  async function loadBusinessUnitsForOrganisation(organisationId: string): Promise<void> {
    isLoading.value = true

    try {
      const response = await businessUnitService.getBusinessUnitsByOrganisation(organisationId)
      businessUnitsCache.value.set(organisationId, response.data || [])
    } catch (err: any) {
      console.error('Failed to load business units:', err)
      error.value = err.message || 'Failed to load business units'
    } finally {
      isLoading.value = false
    }
  }

  async function loadDepartmentsForBusinessUnit(businessUnitId: string): Promise<void> {
    isLoading.value = true

    try {
      const response = await departmentService.getDepartmentsByBusinessUnit(businessUnitId)
      departmentsCache.value.set(businessUnitId, response.data || [])
    } catch (err: any) {
      console.error('Failed to load departments:', err)
      error.value = err.message || 'Failed to load departments'
    } finally {
      isLoading.value = false
    }
  }

  function clearOrganisationSelection(): void {
    selectedOrganisation.value = null
  }

  function clearBusinessUnitSelection(): void {
    selectedBusinessUnit.value = null
  }

  function clearDepartmentSelection(): void {
    selectedDepartment.value = null
  }

  function clearAll(): void {
    organisations.value = []
    selectedOrganisation.value = null
    organisationHierarchy.value = null
    organisationStats.value = null
    organisationDashboard.value = null
    businessUnitsCache.value.clear()
    selectedBusinessUnit.value = null
    departmentsCache.value.clear()
    selectedDepartment.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadOrganisations()
  }

  return {
    // State
    organisations,
    selectedOrganisation,
    organisationHierarchy,
    organisationStats,
    organisationDashboard,
    businessUnitsCache,
    selectedBusinessUnit,
    departmentsCache,
    selectedDepartment,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    organisationFilters,

    // Getters
    hasOrganisations,
    organisationsByIndustry,
    highMaturityOrganisations,
    lowMaturityOrganisations,
    averageMaturityScore,
    getBusinessUnitsForOrganisation,
    hasBusinessUnits,
    getDepartmentsForBusinessUnit,
    hasDepartments,

    // Actions
    loadOrganisations,
    loadOrganisation,
    loadOrganisationDashboard,
    loadOrganisationStats,
    loadOrganisationHierarchy,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    restoreOrganisation,
    searchOrganisations,
    bulkImportOrganisations,
    exportOrganisations,
    loadBusinessUnitsForOrganisation,
    loadDepartmentsForBusinessUnit,
    clearOrganisationSelection,
    clearBusinessUnitSelection,
    clearDepartmentSelection,
    clearAll,
    setPage,
  }
})
