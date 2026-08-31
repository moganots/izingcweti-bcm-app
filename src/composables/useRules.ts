import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRulesStore } from '@/stores/rules/rules.store';
import { useAuth } from '@/composables/auth/useAuth';
import type {
    Rule,
    RuleExecutionLog,
    CreateRuleDto,
    UpdateRuleDto,
    ExecuteRuleDto,
    RuleTestDto,
    RuleQueryDto,
    ExecutionLogQueryDto,
} from '@/types/rules';
import { RuleStatus, RulePriority } from '@/types/rules/enums';

export function useRules() {
    const store = useRulesStore();
    const auth = useAuth();

    // Auth state
    const { isAuthenticated, isAdmin, isGlobalAdmin, userId, organisationId: userOrgId } = auth;

    // Store refs
    const {
        rules,
        selectedRule,
        stats,
        executionStats,
        executionSummary,
        executionLogs,
        selectedLog,
        isLoading,
        isSaving,
        isLoadingLogs,
        error,
        pagination,
        logsPagination,
        filters,
        activeRules,
        inactiveRules,
        draftRules,
        archivedRules,
        rulesByType,
        rulesByStatus,
        rulesByPriority,
        totalRules,
        totalActiveRules,
        totalDraftRules,
        successRate,
        averageExecutionTime,
        highPriorityRules,
    } = storeToRefs(store);

    // ============================================
    // Composable: useRulesList
    // ============================================
    function useRulesList(initialParams?: RuleQueryDto) {
        const params = ref<RuleQueryDto>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const fetchRules = async () => {
            if (!canManage.value) {
                console.warn('Cannot fetch rules: Insufficient permissions');
                return null;
            }
            return store.fetchRules({
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateRuleDto) => {
            if (!canManage.value) {
                console.warn('Cannot create rule: Insufficient permissions');
                return null;
            }
            return store.createRule(data);
        };

        const update = async (uuid: string, data: UpdateRuleDto) => {
            if (!canManage.value) {
                console.warn('Cannot update rule: Insufficient permissions');
                return null;
            }
            return store.updateRule(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete rule: Insufficient permissions');
                return;
            }
            return store.deleteRule(uuid);
        };

        const getById = async (uuid: string) => {
            return store.fetchRuleById(uuid);
        };

        const activate = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot activate rule: Insufficient permissions');
                return null;
            }
            return store.activateRule(uuid);
        };

        const deactivate = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot deactivate rule: Insufficient permissions');
                return null;
            }
            return store.deactivateRule(uuid);
        };

        const archive = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot archive rule: Insufficient permissions');
                return null;
            }
            return store.archiveRule(uuid);
        };

        const duplicate = async (uuid: string, name: string) => {
            if (!canManage.value) {
                console.warn('Cannot duplicate rule: Insufficient permissions');
                return null;
            }
            return store.duplicateRule(uuid, name);
        };

        const execute = async (uuid: string, data: ExecuteRuleDto) => {
            if (!canManage.value) {
                console.warn('Cannot execute rule: Insufficient permissions');
                return null;
            }
            return store.executeRule(uuid, data);
        };

        const test = async (uuid: string, data: RuleTestDto) => {
            if (!canManage.value) {
                console.warn('Cannot test rule: Insufficient permissions');
                return null;
            }
            return store.testRule(uuid, data);
        };

        // Auto-fetch on param changes
        watch([params, page, limit], () => {
            if (canManage.value) {
                fetchRules();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated && canManage.value) {
                fetchRules();
            }
        }, { immediate: false });

        return {
            // State
            rules,
            selectedRule,
            isLoading,
            isSaving,
            error,
            pagination,
            activeRules,
            inactiveRules,
            draftRules,
            archivedRules,
            rulesByType,
            rulesByStatus,
            rulesByPriority,
            totalRules,
            totalActiveRules,
            totalDraftRules,
            highPriorityRules,
            canManage,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchRules,
            getById,
            create,
            update,
            remove,
            activate,
            deactivate,
            archive,
            duplicate,
            execute,
            test,
        };
    }

    // ============================================
    // Composable: useRuleStats
    // ============================================
    function useRuleStats(organisationId?: string) {
        const targetOrgId = computed(() => organisationId || userOrgId.value);
        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const fetchStats = async () => {
            if (!canManage.value) {
                console.warn('Cannot fetch stats: Insufficient permissions');
                return null;
            }
            return store.fetchStats(targetOrgId.value);
        };

        const fetchExecutionStats = async (ruleId: string, days?: number) => {
            if (!canManage.value) {
                console.warn('Cannot fetch execution stats: Insufficient permissions');
                return null;
            }
            return store.fetchExecutionStats(ruleId, days);
        };

        const fetchExecutionSummary = async (ruleId: string, days: number = 30) => {
            if (!canManage.value) {
                console.warn('Cannot fetch execution summary: Insufficient permissions');
                return null;
            }
            return store.fetchExecutionSummary(ruleId, days);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canManage.value && targetOrgId.value) {
                await fetchStats();
                initialized.value = true;
            }
        };

        watch(isAuthenticated, async (authenticated) => {
            if (authenticated && canManage.value && targetOrgId.value && !initialized.value) {
                await initialize();
            }
        });

        return {
            // State
            stats,
            executionStats,
            executionSummary,
            successRate,
            averageExecutionTime,
            isLoading,
            error,
            canManage,

            // Actions
            fetchStats,
            fetchExecutionStats,
            fetchExecutionSummary,
            initialize,
        };
    }

    // ============================================
    // Composable: useExecutionLogs
    // ============================================
    function useExecutionLogs(ruleId: string, initialParams?: ExecutionLogQueryDto) {
        const params = ref<ExecutionLogQueryDto>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const fetchLogs = async () => {
            if (!canManage.value) {
                console.warn('Cannot fetch execution logs: Insufficient permissions');
                return null;
            }
            return store.fetchExecutionLogs(ruleId, {
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const cleanup = async (days: number = 90) => {
            if (!canManage.value) {
                console.warn('Cannot cleanup logs: Insufficient permissions');
                return null;
            }
            return store.cleanupExecutionLogs(days);
        };

        const remove = async (uuid: string) => {
            if (!canManage.value) {
                console.warn('Cannot delete log: Insufficient permissions');
                return;
            }
            return store.deleteExecutionLog(uuid);
        };

        // Auto-fetch on param changes
        watch([params, page, limit], () => {
            if (canManage.value) {
                fetchLogs();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated && canManage.value) {
                fetchLogs();
            }
        }, { immediate: false });

        return {
            // State
            executionLogs,
            selectedLog,
            isLoadingLogs,
            error,
            logsPagination,
            canManage,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchLogs,
            cleanup,
            remove,
        };
    }

    // ============================================
    // Composable: useRuleValidation
    // ============================================
    function useRuleValidation() {
        const canManage = computed(() => isAdmin.value || isGlobalAdmin.value);

        const validate = async (data: Partial<Rule>) => {
            if (!canManage.value) {
                console.warn('Cannot validate rule: Insufficient permissions');
                return null;
            }
            return store.validateRule(data);
        };

        const testDefinition = async (data: {
            conditions: any[];
            actions: any[];
            testData: any;
        }) => {
            if (!canManage.value) {
                console.warn('Cannot test rule definition: Insufficient permissions');
                return null;
            }
            return store.testRuleDefinition(data);
        };

        return {
            isLoading,
            error,
            canManage,

            // Actions
            validate,
            testDefinition,
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
        useRulesList,
        useRuleStats,
        useExecutionLogs,
        useRuleValidation,

        // Utility
        clearError,
        clearSelection,
        resetState,

        // Helpers
        RuleStatus,
        RulePriority,
    };
}

export default useRules;