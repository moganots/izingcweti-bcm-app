import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '../stores/workflow/workflow.store'
import { useAuth } from './useAuth'
import { WorkflowState, WorkflowPriority } from '../models/workflow/workflow.entity'

/**
 * Workflow composable
 * Aligned with useWorkflowStore
 */
export function useWorkflow() {
    const store = useWorkflowStore()
    const auth = useAuth()

    const { isAuthenticated, isAdmin, userId } = auth

    const {
        workflows,
        selectedWorkflow,
        isLoading,
        isSaving,
        error,
        pendingWorkflows,
        activeWorkflows,
        overdueWorkflows,
        escalatedWorkflows,
        myAssignedWorkflows,
        myInitiatedWorkflows,
        workflowsByState,
        workflowsByType,
        workflowsByPriority,
        totalPendingApprovals,
        totalOverdue,
        totalEscalated,
    } = storeToRefs(store)

    function useWorkflowList() {
        const canView = computed(() => isAuthenticated.value)

        return {
            workflows,
            selectedWorkflow,
            isLoading,
            isSaving,
            error,
            pendingWorkflows,
            activeWorkflows,
            overdueWorkflows,
            escalatedWorkflows,
            myAssignedWorkflows,
            myInitiatedWorkflows,
            workflowsByState,
            workflowsByType,
            workflowsByPriority,
            totalPendingApprovals,
            totalOverdue,
            totalEscalated,
            canView,
        }
    }

    function useMyWorkflows() {
        return {
            myAssignedWorkflows,
            myInitiatedWorkflows,
            isLoading,
            error,
        }
    }

    return {
        store,
        isAuthenticated,
        isAdmin,
        userId,

        useWorkflowList,
        useMyWorkflows,

        // Actions
        initialize: store.initialize,
        submitWorkflow: store.submitWorkflow,
        approveWorkflow: store.approveWorkflow,
        rejectWorkflow: store.rejectWorkflow,
        completeWorkflow: store.completeWorkflow,
        addComment: store.addComment,
        escalateWorkflow: store.escalateWorkflow,
        reassignWorkflow: store.reassignWorkflow,
        archiveWorkflow: store.archiveWorkflow,
        cancelWorkflow: store.cancelWorkflow,

        // Helpers
        WorkflowState,
        WorkflowPriority,
    }
}

export default useWorkflow