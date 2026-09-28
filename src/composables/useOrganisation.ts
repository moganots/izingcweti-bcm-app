import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrganisationStore } from '../stores/organisation/organisation.store'
import { useAuth } from './useAuth'

/**
 * Organisation composable
 * Aligned with useOrganisationStore
 */
export function useOrganisation() {
    const store = useOrganisationStore()
    const auth = useAuth()

    const { isAuthenticated, isAdmin, isGlobalAdmin, userId, userOrganisationId } = auth

    const {
        organisations,
        selectedOrganisation,
        selectedBusinessUnit,
        selectedDepartment,
        isLoading,
        error,
        hasOrganisations,
        organisationsByIndustry,
        highMaturityOrganisations,
        businessUnitsByCriticality,
        departmentsWithRTO,
        departmentsWithRPO,
    } = storeToRefs(store)

    // ============================================
    // Organisations
    // ============================================
    function useOrganisations() {
        const canView = computed(() => isAuthenticated.value)
        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value)

        return {
            organisations,
            selectedOrganisation,
            isLoading,
            error,
            hasOrganisations,
            organisationsByIndustry,
            highMaturityOrganisations,
            canView,
            canManage,
            getBusinessUnitsForOrganisation: store.getBusinessUnitsForOrganisation,
            getDepartmentsForBusinessUnit: store.getDepartmentsForBusinessUnit,
        }
    }

    // ============================================
    // Business Units
    // ============================================
    function useBusinessUnits(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrganisationId.value)

        const businessUnitsForOrg = computed(() => {
            if (!targetOrgId.value) return []
            return store.getBusinessUnitsForOrganisation(targetOrgId.value)
        })

        return {
            businessUnits: businessUnitsForOrg,
            selectedBusinessUnit,
            isLoading,
            error,
            businessUnitsByCriticality,
            targetOrgId,
        }
    }

    // ============================================
    // Departments
    // ============================================
    function useDepartments(businessUnitId?: string) {
        const targetBuId = computed(() => businessUnitId)

        const departmentsForBu = computed(() => {
            if (!targetBuId.value) return []
            return store.getDepartmentsForBusinessUnit(targetBuId.value)
        })

        return {
            departments: departmentsForBu,
            selectedDepartment,
            isLoading,
            error,
            departmentsWithRTO,
            departmentsWithRPO,
            targetBuId,
            getDepartmentTree: store.getDepartmentTree,
        }
    }

    // ============================================
    // Return API
    // ============================================
    return {
        store,
        isAuthenticated,
        isAdmin,
        isGlobalAdmin,
        userId,
        userOrganisationId,

        // Sub-composables
        useOrganisations,
        useBusinessUnits,
        useDepartments,
    }
}

export default useOrganisation