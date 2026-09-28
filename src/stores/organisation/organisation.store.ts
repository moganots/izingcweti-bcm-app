import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Organisation,
  BusinessUnit,
  Department,
} from '../../models/organisation/organisation.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { MaturityScore } from 'src/models/bcm/bcm.entity'

export const useOrganisationItemStore = createOfflineCrudStore<Organisation>({
  storeId: 'organisations',
  tableName: 'organisations',
})

export const useBusinessUnitStore = createOfflineCrudStore<BusinessUnit>({
  storeId: 'business-units',
  tableName: 'businessUnits',
})

export const useDepartmentStore = createOfflineCrudStore<Department>({
  storeId: 'departments',
  tableName: 'departments',
})

export const useOrganisationStore = defineStore('organisation', () => {
  const orgStore = useOrganisationItemStore()
  const buStore = useBusinessUnitStore()
  const deptStore = useDepartmentStore()

  const isSaving = ref(false)

  const organisations = orgStore.items
  const businessUnits = buStore.items
  const departments = deptStore.items

  // ============================================
  // Getters - Organisations
  // ============================================
  const hasOrganisations = computed(() => organisations?.length > 0)

  const organisationsByIndustry = computed(() => {
    const grouped: Record<string, Organisation[]> = {}
    organisations?.forEach((org) => {
      const industry = org.industryType || 'Unknown'
      if (!grouped[industry]) grouped[industry] = []
      grouped[industry].push(org)
    })
    return grouped
  })

  const highMaturityOrganisations = computed(() =>
    organisations?.filter(
      (org) =>
        org.maturityScore === MaturityScore.OPTIMISING ||
        org.maturityScore === MaturityScore.OPTIMISED ||
        org.maturityScore === MaturityScore.QUANTITATIVELY_MANAGED
    )
  )

  // ============================================
  // Getters - Business Units
  // ============================================
  const getBusinessUnitsForOrganisation = (organisationId: string) =>
    businessUnits?.filter((bu) => bu.organisationId === organisationId)

  const businessUnitsByCriticality = computed(() => {
    const grouped: Record<string, BusinessUnit[]> = {}
    businessUnits?.forEach((bu) => {
      const score = bu.criticalityScore || 'Unknown'
      if (!grouped[score]) grouped[score] = []
      grouped[score].push(bu)
    })
    return grouped
  })

  // ============================================
  // Getters - Departments
  // ============================================
  const getDepartmentsForBusinessUnit = (businessUnitId: string) =>
    departments?.filter((d) => d.businessUnitId === businessUnitId)

  const departmentsWithRTO = computed(() =>
    departments?.filter((d) => d.recoveryTimeObjectiveHours)
  )

  const departmentsWithRPO = computed(() =>
    departments?.filter((d) => d.recoveryPointObjectiveHours)
  )

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await Promise.all([orgStore.initialize(), buStore.initialize(), deptStore.initialize()])
  }

  function getDepartmentTree(businessUnitId: string) {
    const depts = getDepartmentsForBusinessUnit(businessUnitId)

    const buildTree = (parentId?: string): any[] => {
      return depts
        .filter((d) => d.parentDepartmentId === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((d) => ({
          ...d,
          children: buildTree(d.uuid),
        }))
    }

    return buildTree(undefined)
  }

  return {
    // State
    organisations,
    businessUnits,
    departments,
    selectedOrganisation: orgStore.selected,
    selectedBusinessUnit: buStore.selected,
    selectedDepartment: deptStore.selected,
    isLoading: orgStore.loading,
    isSaving,
    error: orgStore.error,

    // Getters - Organisations
    hasOrganisations,
    organisationsByIndustry,
    highMaturityOrganisations,

    // Getters - Business Units
    getBusinessUnitsForOrganisation,
    businessUnitsByCriticality,

    // Getters - Departments
    getDepartmentsForBusinessUnit,
    departmentsWithRTO,
    departmentsWithRPO,

    // Actions
    initialize,
    getDepartmentTree,

    // Sub-stores
    orgStore,
    buStore,
    deptStore,
  }
})