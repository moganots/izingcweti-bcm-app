import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRiskStore } from '@/stores/risk/risk.store';
import { useAuth } from '@/composables/auth/useAuth';
import type {
    Risk,
    CreateRiskDto,
    UpdateRiskDto,
    AssessRiskDto,
    ApproveRiskDto,
    AssignRiskDto,
    AddControlDto,
    RiskQueryDto,
} from '@/types/risk';
import { getRiskScoreLevel, getRiskColor } from '@/types/risk/enums';

export function useRisk() {
    const store = useRiskStore();
    const auth = useAuth();

    // Auth state
    const { isAuthenticated, isAdmin, isGlobalAdmin, userId, organisationId: userOrgId } = auth;

    // Store refs
    const {
        risks,
        selectedRisk,
        stats,
        comprehensiveAnalytics,
        riskMatrix,
        riskTrends,
        isLoading,
        isSaving,
        error,
        pagination,
        filters,
        criticalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        openRisks,
        closedRisks,
        pendingApprovalRisks,
        overdueReviewRisks,
        myAssignedRisks,
        risksByCategory,
        risksByStatus,
        averageInherentScore,
        averageResidualScore,
        riskReduction,
        riskReductionPercentage,
        hasCriticalRisks,
        hasHighRisks,
    } = storeToRefs(store);

    // ============================================
    // Composable: useRisks
    // ============================================
    function useRisks(initialParams?: RiskQueryDto) {
        const params = ref<RiskQueryDto>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const canFetch = computed(() => isAuthenticated.value);
        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const fetchRisks = async () => {
            if (!canFetch.value) {
                console.warn('Cannot fetch risks: User not authenticated');
                return null;
            }
            return store.fetchRisks({
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateRiskDto) => {
            if (!canManage.value) {
                console.warn('Cannot create risk: Insufficient permissions');
                return null;
            }
            return store.createRisk(data);
        };

        const update = async (uuid: string, data: UpdateRiskDto) => {
            if (!canManage.value) {
                console.warn('Cannot update risk: Insufficient permissions');
                return null;
            }
            return store.updateRisk(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete risk: Insufficient permissions');
                return;
            }
            return store.deleteRisk(uuid);
        };

        const getById = async (uuid: string) => {
            return store.fetchRiskById(uuid);
        };

        const assess = async (uuid: string, data: AssessRiskDto) => {
            if (!canManage.value) {
                console.warn('Cannot assess risk: Insufficient permissions');
                return null;
            }
            return store.assessRisk(uuid, data);
        };

        const approve = async (uuid: string, data: ApproveRiskDto) => {
            if (!canManage.value) {
                console.warn('Cannot approve risk: Insufficient permissions');
                return null;
            }
            return store.approveRisk(uuid, data);
        };

        const assign = async (uuid: string, data: AssignRiskDto) => {
            if (!canManage.value) {
                console.warn('Cannot assign risk: Insufficient permissions');
                return null;
            }
            return store.assignRisk(uuid, data);
        };

        const close = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot close risk: Insufficient permissions');
                return null;
            }
            return store.closeRisk(uuid);
        };

        const addControl = async (uuid: string, data: AddControlDto) => {
            if (!canManage.value) {
                console.warn('Cannot add control: Insufficient permissions');
                return null;
            }
            return store.addControl(uuid, data);
        };

        const removeControl = async (uuid: string, controlId: string) => {
            if (!canManage.value) {
                console.warn('Cannot remove control: Insufficient permissions');
                return null;
            }
            return store.removeControl(uuid, controlId);
        };

        // Auto-fetch on param changes
        watch([params, page, limit], () => {
            if (canFetch.value) {
                fetchRisks();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated) {
                fetchRisks();
            }
        }, { immediate: false });

        return {
            // State
            risks,
            selectedRisk,
            isLoading,
            error,
            pagination,
            criticalRisks,
            highRisks,
            mediumRisks,
            lowRisks,
            openRisks,
            closedRisks,
            pendingApprovalRisks,
            overdueReviewRisks,
            myAssignedRisks,
            risksByCategory,
            risksByStatus,
            averageInherentScore,
            averageResidualScore,
            riskReduction,
            riskReductionPercentage,
            hasCriticalRisks,
            hasHighRisks,
            canFetch,
            canManage,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchRisks,
            getById,
            create,
            update,
            remove,
            assess,
            approve,
            assign,
            close,
            addControl,
            removeControl,

            // Utilities
            getRiskScoreLevel,
            getRiskColor,
        };
    }

    // ============================================
    // Composable: useRiskStats
    // ============================================
    function useRiskStats(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrgId.value);
        const canFetch = computed(() => isAuthenticated.value);

        const fetchStats = async () => {
            if (!canFetch.value || !targetOrgId.value) {
                console.warn('Cannot fetch stats: User not authenticated or no organisation');
                return null;
            }
            return store.fetchStats(targetOrgId.value);
        };

        const fetchAnalytics = async () => {
            if (!canFetch.value || !targetOrgId.value) {
                console.warn('Cannot fetch analytics: User not authenticated or no organisation');
                return null;
            }
            return store.fetchComprehensiveAnalytics(targetOrgId.value);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canFetch.value && targetOrgId.value) {
                await Promise.all([fetchStats(), fetchAnalytics()]);
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
            stats,
            comprehensiveAnalytics,
            isLoading,
            error,
            canFetch,

            // Actions
            fetchStats,
            fetchAnalytics,
            initialize,
        };
    }

    // ============================================
    // Composable: useRiskMatrix
    // ============================================
    function useRiskMatrix(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrgId.value);
        const canFetch = computed(() => isAuthenticated.value);

        const fetchMatrix = async () => {
            if (!canFetch.value || !targetOrgId.value) {
                console.warn('Cannot fetch matrix: User not authenticated or no organisation');
                return null;
            }
            return store.fetchRiskMatrix(targetOrgId.value);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canFetch.value && targetOrgId.value) {
                await fetchMatrix();
                initialized.value = true;
            }
        };

        watch(isAuthenticated, async (authenticated) => {
            if (authenticated && targetOrgId.value && !initialized.value) {
                await initialize();
            }
        });

        return {
            // State
            riskMatrix,
            isLoading,
            error,
            canFetch,

            // Actions
            fetchMatrix,
            initialize,
        };
    }

    // ============================================
    // Composable: useRiskTrends
    // ============================================
    function useRiskTrends(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrgId.value);
        const from = ref<Date>();
        const to = ref<Date>();
        const canFetch = computed(() => isAuthenticated.value);

        const fetchTrends = async () => {
            if (!canFetch.value || !targetOrgId.value) {
                console.warn('Cannot fetch trends: User not authenticated or no organisation');
                return null;
            }
            return store.fetchRiskTrends(targetOrgId.value, from.value, to.value);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canFetch.value && targetOrgId.value) {
                await fetchTrends();
                initialized.value = true;
            }
        };

        watch(isAuthenticated, async (authenticated) => {
            if (authenticated && targetOrgId.value && !initialized.value) {
                await initialize();
            }
        });

        return {
            // State
            riskTrends,
            isLoading,
            error,
            canFetch,

            // Params
            from,
            to,

            // Actions
            fetchTrends,
            initialize,
        };
    }

    // ============================================
    // Composable: useMyRisks
    // ============================================
    function useMyRisks() {
        const canFetch = computed(() => isAuthenticated.value);

        const fetchMyAssigned = async () => {
            if (!canFetch.value) {
                console.warn('Cannot fetch assigned risks: User not authenticated');
                return null;
            }
            return store.fetchMyAssignedRisks();
        };

        const fetchOverdue = async () => {
            if (!canFetch.value) {
                console.warn('Cannot fetch overdue risks: User not authenticated');
                return null;
            }
            return store.fetchOverdueReviews();
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canFetch.value) {
                await Promise.all([fetchMyAssigned(), fetchOverdue()]);
                initialized.value = true;
            }
        };

        watch(isAuthenticated, async (authenticated) => {
            if (authenticated && !initialized.value) {
                await initialize();
            }
        });

        return {
            // State
            myAssignedRisks,
            overdueReviewRisks,
            isLoading,
            error,
            canFetch,

            // Actions
            fetchMyAssigned,
            fetchOverdue,
            initialize,
        };
    }

    // ============================================
    // Utility Functions
    // ============================================
    const clearError = () => store.clearError();
    const clearSelection = () => store.clearSelection();
    const resetState = () => store.resetState();

    return {
        // Main store access
        store,

        // Auth state
        isAuthenticated,
        isAdmin,
        isGlobalAdmin,
        organisationId: userOrgId,
        userId,

        // Specialized composables
        useRisks,
        useRiskStats,
        useRiskMatrix,
        useRiskTrends,
        useMyRisks,

        // Utility
        clearError,
        clearSelection,
        resetState,

        // Helpers
        getRiskScoreLevel,
        getRiskColor,
    };
}

export default useRisk;