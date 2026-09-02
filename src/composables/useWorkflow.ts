import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkflowStore } from './../stores/workflow/workflow.store';
import { useAuth } from './useAuth';
import type {
    CreateWorkflowDto,
    UpdateWorkflowDto,
    WorkflowQueryDto,
} from './../models/entities/workflow/workflow.entity';
import { WorkflowState, WorkflowPriority } from './../models/entities/workflow/workflow.entity';

export function useWorkflow() {
    const store = useWorkflowStore();
    const auth = useAuth();

    // Auth state
    const { isAuthenticated, isAdmin, isGlobalAdmin, userId, userOrganisationId } = auth;

    // Store refs
    const {
        workflows,
        selectedWorkflow,
        stats,
        analytics,
        isLoading,
        error,
        pagination,
        pendingWorkflows,
        activeWorkflows,
        overdueWorkflows,
        escalatedWorkflows,
        myAssignedWorkflows,
        myInitiatedWorkflows,
        workflowsByType,
        workflowsByState,
        workflowsByPriority,
        totalWorkflows,
        totalPendingApprovals,
        totalOverdue,
        totalEscalated,
    } = storeToRefs(store);

    // ============================================
    // Composable: useWorkflowList
    // ============================================
    function useWorkflowList(initialParams?: WorkflowQueryDto) {
        const params = ref<WorkflowQueryDto>(initialParams || {});
        const page = ref(1);
        const limit = ref(20);

        const canView = computed(() => isAuthenticated.value);

        const fetchWorkflows = async () => {
            if (!canView.value) {
                console.warn('Cannot fetch workflows: User not authenticated');
                return null;
            }
            return store.fetchWorkflows({
                ...params.value,
                page: page.value,
                limit: limit.value,
            });
        };

        const create = async (data: CreateWorkflowDto) => {
            if (!canView.value) {
                console.warn('Cannot create workflow: User not authenticated');
                return null;
            }
            return store.createWorkflow(data);
        };

        const update = async (uuid: string, data: UpdateWorkflowDto) => {
            if (!canView.value) {
                console.warn('Cannot update workflow: User not authenticated');
                return null;
            }
            return store.updateWorkflow(uuid, data);
        };

        const remove = async (uuid: string) => {
            if (!canView.value) {
                console.warn('Cannot delete workflow: User not authenticated');
                return;
            }
            return store.deleteWorkflow(uuid);
        };

        const getById = async (uuid: string) => {
            return store.fetchWorkflowById(uuid);
        };

        // Auto-fetch on param changes
        watch([params, page, limit], () => {
            if (canView.value) {
                fetchWorkflows();
            }
        }, { immediate: false });

        // Auto-fetch on authentication
        watch(isAuthenticated, (authenticated) => {
            if (authenticated) {
                fetchWorkflows();
            }
        }, { immediate: false });

        return {
            // State
            workflows,
            selectedWorkflow,
            isLoading,
            error,
            pagination,
            pendingWorkflows,
            activeWorkflows,
            overdueWorkflows,
            escalatedWorkflows,
            myAssignedWorkflows,
            myInitiatedWorkflows,
            workflowsByType,
            workflowsByState,
            workflowsByPriority,
            totalWorkflows,
            totalPendingApprovals,
            totalOverdue,
            totalEscalated,
            canView,

            // Params
            params,
            page,
            limit,

            // Actions
            fetchWorkflows,
            getById,
            create,
            update,
            remove,

            // Workflow Actions
            submit: store.submitWorkflow,
            approve: store.approveWorkflow,
            reject: store.rejectWorkflow,
            complete: store.completeWorkflow,
            addComment: store.addComment,
            escalate: store.escalateWorkflow,
            reassign: store.reassignWorkflow,
            archive: store.archiveWorkflow,
            cancel: store.cancelWorkflow,
        };
    }

    // ============================================
    // Composable: useWorkflowStats
    // ============================================
    function useWorkflowStats() {
        const canView = computed(() => isAuthenticated.value);

        const fetchStats = async () => {
            if (!canView.value) {
                console.warn('Cannot fetch stats: User not authenticated');
                return null;
            }
            return store.fetchStats();
        };

        const fetchAnalytics = async (organisationId?: string) => {
            if (!canView.value) {
                console.warn('Cannot fetch analytics: User not authenticated');
                return null;
            }
            return store.fetchAnalytics(organisationId);
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canView.value) {
                await Promise.all([fetchStats(), fetchAnalytics()]);
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
            stats,
            analytics,
            isLoading,
            error,
            canView,

            // Actions
            fetchStats,
            fetchAnalytics,
            initialize,
        };
    }

    // ============================================
    // Composable: useMyWorkflows
    // ============================================
    function useMyWorkflows() {
        const canView = computed(() => isAuthenticated.value);

        const fetchMyAssigned = async () => {
            if (!canView.value) {
                console.warn('Cannot fetch assigned workflows: User not authenticated');
                return null;
            }
            return store.fetchMyAssignedWorkflows();
        };

        const fetchPendingApprovals = async () => {
            if (!canView.value) {
                console.warn('Cannot fetch pending approvals: User not authenticated');
                return null;
            }
            return store.fetchPendingApprovals();
        };

        // Auto-fetch on mount if authenticated
        const initialized = ref(false);
        const initialize = async () => {
            if (!initialized.value && canView.value) {
                await Promise.all([fetchMyAssigned(), fetchPendingApprovals()]);
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
            myAssignedWorkflows,
            pendingWorkflows,
            isLoading,
            error,
            canView,

            // Actions
            fetchMyAssigned,
            fetchPendingApprovals,
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
        organisationId: userOrganisationId,
        userId,

        // Specialized composables
        useWorkflowList,
        useWorkflowStats,
        useMyWorkflows,

        // Utility
        clearError,
        clearSelection,
        resetState,

        // Helpers
        WorkflowState,
        WorkflowPriority,
    };
}

export default useWorkflow;