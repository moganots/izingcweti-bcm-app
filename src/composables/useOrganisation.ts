import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrganisationStore } from './../stores/organisation/organisation.store';
import { useAuth } from './useAuth';
import type {
    CreateOrganisationDto,
    UpdateOrganisationDto,
    CreateBusinessUnitDto,
    UpdateBusinessUnitDto,
    CreateDepartmentDto,
    UpdateDepartmentDto,
    OrganisationQueryParams,
    BusinessUnitQueryParams,
    DepartmentQueryParams,
} from './../models/entities/organisation/organisation.entity';

export function useOrganisation() {
    const store = useOrganisationStore();
    const auth = useAuth();

    // Auth state
    const { isAuthenticated, isAdmin, isGlobalAdmin, userId, userOrganisationId } = auth;

    // Store refs
    const {
        organisations,
        selectedOrganisation,
        organisationStats,
        organisationHierarchy,
        selectedBusinessUnit,
        businessUnitStats,
        selectedDepartment,
        departmentStats,
        isLoading,
        error,
        pagination,
        hasOrganisations,
        organisationsByIndustry,
        organisationsByMaturity,
        highMaturityOrganisations,
        businessUnitsByCriticality,
        departmentsWithRTO,
        departmentsWithRPO,
    } = storeToRefs(store);

    // ============================================
    // Composable: useOrganisations
    // ============================================
    function useOrganisations(initialParams?: OrganisationQueryParams) {
        const params = ref<OrganisationQueryParams>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const canFetch = computed(() => isAuthenticated.value);
        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const fetchOrganisations = async () => {
            if (!canFetch.value) {
                console.warn('Cannot fetch organisations: User not authenticated');
                return null;
            }
            return store.fetchOrganisations({
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateOrganisationDto) => {
            if (!canManage.value) {
                console.warn('Cannot create organisation: Insufficient permissions');
                return null;
            }
            return store.createOrganisation(data);
        };

        const update = async (uuid: string, data: UpdateOrganisationDto) => {
            if (!canManage.value) {
                console.warn('Cannot update organisation: Insufficient permissions');
                return null;
            }
            return store.updateOrganisation(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete organisation: Insufficient permissions');
                return;
            }
            return store.deleteOrganisation(uuid);
        };

        const getById = async (uuid: string) => {
            return store.fetchOrganisationById(uuid);
        };

        const getStats = async (organisationId?: string) => {
            return store.fetchOrganisationStats(organisationId);
        };

        const search = async (query: string) => {
            return store.searchOrganisations(query);
        };

        // Auto-fetch on param changes
        watch([params, page, limit], () => {
            if (canFetch.value) {
                fetchOrganisations();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated) {
                fetchOrganisations();
            }
        }, { immediate: false });

        return {
            // State
            organisations,
            selectedOrganisation,
            organisationStats,
            isLoading,
            error,
            pagination,
            hasOrganisations,
            organisationsByIndustry,
            organisationsByMaturity,
            highMaturityOrganisations,
            canFetch,
            canManage,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchOrganisations,
            getById,
            create,
            update,
            remove,
            search,
            getStats,
        };
    }

    // ============================================
    // Composable: useBusinessUnits
    // ============================================
    function useBusinessUnits(organisationId?: string, initialParams?: BusinessUnitQueryParams) {
        const params = ref<BusinessUnitQueryParams>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const targetOrgId = computed(() => organisationId || userOrganisationId.value);

        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);
        const canView = computed(() => isAuthenticated.value);

        const fetchBusinessUnits = async () => {
            if (!canView.value || !targetOrgId.value) {
                console.warn('Cannot fetch business units: User not authenticated or no organisation');
                return null;
            }
            return store.fetchBusinessUnitsForOrganisation(targetOrgId.value, {
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateBusinessUnitDto) => {
            if (!canManage.value) {
                console.warn('Cannot create business unit: Insufficient permissions');
                return null;
            }
            return store.createBusinessUnit(data);
        };

        const update = async (uuid: string, data: UpdateBusinessUnitDto) => {
            if (!canManage.value) {
                console.warn('Cannot update business unit: Insufficient permissions');
                return null;
            }
            return store.updateBusinessUnit(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete business unit: Insufficient permissions');
                return;
            }
            return store.deleteBusinessUnit(uuid);
        };

        const getStats = async (orgId?: string) => {
            return store.fetchBusinessUnitStats(orgId || targetOrgId.value);
        };

        // Auto-fetch on param changes
        watch([params, page, limit, targetOrgId], () => {
            if (canView.value && targetOrgId.value) {
                fetchBusinessUnits();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated && targetOrgId.value) {
                fetchBusinessUnits();
            }
        }, { immediate: false });

        const getBusinessUnits = computed(() => {
            if (!targetOrgId.value) return [];
            return store.getBusinessUnitsForOrganisation(targetOrgId.value);
        });

        return {
            // State
            businessUnits: getBusinessUnits,
            selectedBusinessUnit,
            businessUnitStats,
            isLoading,
            error,
            pagination,
            businessUnitsByCriticality,
            canManage,
            canView,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchBusinessUnits,
            create,
            update,
            remove,
            getStats,
        };
    }

    // ============================================
    // Composable: useDepartments
    // ============================================
    function useDepartments(businessUnitId?: string, initialParams?: DepartmentQueryParams) {
        const params = ref<DepartmentQueryParams>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const targetBuId = computed(() => businessUnitId);

        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);
        const canView = computed(() => isAuthenticated.value);

        const fetchDepartments = async () => {
            if (!canView.value || !targetBuId.value) {
                console.warn('Cannot fetch departments: User not authenticated or no business unit');
                return null;
            }
            return store.fetchDepartmentsForBusinessUnit(targetBuId.value, {
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateDepartmentDto) => {
            if (!canManage.value) {
                console.warn('Cannot create department: Insufficient permissions');
                return null;
            }
            return store.createDepartment(data);
        };

        const update = async (uuid: string, data: UpdateDepartmentDto) => {
            if (!canManage.value) {
                console.warn('Cannot update department: Insufficient permissions');
                return null;
            }
            return store.updateDepartment(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete department: Insufficient permissions');
                return;
            }
            return store.deleteDepartment(uuid);
        };

        const reorder = async (departmentIds: string[]) => {
            if (!canManage.value) {
                console.warn('Cannot reorder departments: Insufficient permissions');
                return;
            }
            return store.reorderDepartments(departmentIds);
        };

        const getTree = async (buId: string) => {
            return store.getDepartmentTree(buId);
        };

        const getStats = async (buId?: string) => {
            return store.fetchDepartmentStats(buId || targetBuId.value);
        };

        // Auto-fetch on param changes
        watch([params, page, limit, targetBuId], () => {
            if (canView.value && targetBuId.value) {
                fetchDepartments();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated && targetBuId.value) {
                fetchDepartments();
            }
        }, { immediate: false });

        const getDepartments = computed(() => {
            if (!targetBuId.value) return [];
            return store.getDepartmentsForBusinessUnit(targetBuId.value);
        });

        return {
            // State
            departments: getDepartments,
            selectedDepartment,
            departmentStats,
            isLoading,
            error,
            pagination,
            departmentsWithRTO,
            departmentsWithRPO,
            canManage,
            canView,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchDepartments,
            create,
            update,
            remove,
            reorder,
            getTree,
            getStats,
        };
    }

    // ============================================
    // Composable: useOrganisationHierarchy
    // ============================================
    function useOrganisationHierarchy(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrganisationId.value);

        const canView = computed(() => isAuthenticated.value);

        const fetchHierarchy = async () => {
            if (!canView.value || !targetOrgId.value) {
                console.warn('Cannot fetch hierarchy: User not authenticated or no organisation');
                return null;
            }
            return store.fetchOrganisationHierarchy(targetOrgId.value);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canView.value && targetOrgId.value) {
                await fetchHierarchy();
                initialized.value = true;
            }
        };

        // Watch authentication and fetch if needed
        watch(isAuthenticated, async (authenticated) => {
            if (authenticated && targetOrgId.value && !initialized.value) {
                await initialize();
            }
        });

        return {
            // State
            organisationHierarchy,
            isLoading,
            error,
            canView,

            // Actions
            fetchHierarchy,
            initialize,
        };
    }

    // ============================================
    // Utility Functions
    // ============================================
    const clearError = () => store.clearError();
    const resetState = () => store.resetState();

    return {
        // Main store access
        store,

        // Auth state
        isAuthenticated,
        isAdmin,
        isGlobalAdmin,
        organisationId: userOrganisationId,
        userId,

        // Specialized composables
        useOrganisations,
        useBusinessUnits,
        useDepartments,
        useOrganisationHierarchy,

        // Utility
        clearError,
        resetState,
    };
}

export default useOrganisation;