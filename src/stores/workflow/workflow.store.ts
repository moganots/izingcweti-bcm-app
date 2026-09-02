import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { workflowService } from './../../services/api/workflow/WorkflowService';
import { useAuth } from './../../composables/useAuth';
import type {
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  SubmitWorkflowDto,
  ApproveWorkflowDto,
  RejectWorkflowDto,
  AddCommentDto,
  EscalateWorkflowDto,
  ReassignWorkflowDto,
  WorkflowQueryDto,
  WorkflowStatsDto,
  WorkflowAnalyticsDto,
} from './../../models/entities/workflow/workflow.entity';
import { WorkflowState } from './../../models/entities/workflow/workflow.entity';

export const useWorkflowStore = defineStore('workflow', () => {
  // ============================================
  // Dependencies - Auth Integration
  // ============================================
  const auth = useAuth();
  const { isAuthenticated, userId, userOrganisationId } = auth;

  // ============================================
  // State
  // ============================================
  const workflows = ref<Workflow[]>([]);
  const selectedWorkflow = ref<Workflow | null>(null);
  const stats = ref<WorkflowStatsDto | null>(null);
  const analytics = ref<WorkflowAnalyticsDto | null>(null);

  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const filters = ref<WorkflowQueryDto>({});

  // ============================================
  // Getters
  // ============================================

  // State-based groupings
  const pendingWorkflows = computed(() =>
    workflows.value.filter((w) =>
      [WorkflowState.SUBMITTED, WorkflowState.IN_REVIEW, WorkflowState.PENDING_APPROVAL].includes(
        w.workflowState
      )
    )
  );

  const activeWorkflows = computed(() =>
    workflows.value.filter((w) =>
      [
        WorkflowState.DRAFT,
        WorkflowState.SUBMITTED,
        WorkflowState.IN_REVIEW,
        WorkflowState.PENDING_APPROVAL,
        WorkflowState.AWAITING_INPUT,
        WorkflowState.IN_PROGRESS,
      ].includes(w.workflowState)
    )
  );

  const overdueWorkflows = computed(() => {
    const now = new Date();
    return workflows.value.filter(
      (w) => w.dueDate && new Date(w.dueDate) < now && w.workflowState !== WorkflowState.COMPLETED
    );
  });

  const escalatedWorkflows = computed(() =>
    workflows.value.filter((w) => (w.escalationLevel || 0) > 0)
  );

  const myAssignedWorkflows = computed(() =>
    workflows.value.filter((w) => w.assignedTo === userId.value)
  );

  const myInitiatedWorkflows = computed(() =>
    workflows.value.filter((w) => w.initiatedBy === userId.value)
  );

  // Groupings
  const workflowsByType = computed(() => {
    const grouped: Record<string, Workflow[]> = {};
    workflows.value.forEach((w) => {
      const type = w.workflowType || 'Unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(w);
    });
    return grouped;
  });

  const workflowsByState = computed(() => {
    const grouped: Record<string, Workflow[]> = {};
    workflows.value.forEach((w) => {
      const state = w.workflowState || 'Unknown';
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(w);
    });
    return grouped;
  });

  const workflowsByPriority = computed(() => {
    const grouped: Record<string, Workflow[]> = {};
    workflows.value.forEach((w) => {
      const priority = w.priority || 'MEDIUM';
      if (!grouped[priority]) grouped[priority] = [];
      grouped[priority].push(w);
    });
    return grouped;
  });

  // Aggregates
  const totalWorkflows = computed(() => workflows.value.length);
  const totalPendingApprovals = computed(() => pendingWorkflows.value.length);
  const totalOverdue = computed(() => overdueWorkflows.value.length);
  const totalEscalated = computed(() => escalatedWorkflows.value.length);

  // ============================================
  // Auth Check Helpers
  // ============================================
  const requireAuth = (): boolean => {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return false;
    }
    return true;
  };

  // ============================================
  // Actions - CRUD
  // ============================================

  async function fetchWorkflows(params?: WorkflowQueryDto) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        organisationId: params?.organisationId || userOrganisationId.value,
      };
      const response = await workflowService.getWorkflows(queryParams);
      workflows.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      if (params) filters.value = { ...filters.value, ...params };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch workflows';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchWorkflowById(uuid: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.getWorkflow(uuid);
      selectedWorkflow.value = workflow;
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch workflow';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createWorkflow(data: CreateWorkflowDto) {
    if (!requireAuth()) return null;

    if (!data.organisationId) {
      data.organisationId = userOrganisationId.value || '';
    }

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.createWorkflow(data);
      workflows.value.unshift(workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to create workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateWorkflow(uuid: string, data: UpdateWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.updateWorkflow(uuid, data);
      const index = workflows.value.findIndex((w) => w.uuid === uuid);
      if (index !== -1) {
        workflows.value[index] = workflow;
      }
      if (selectedWorkflow.value?.uuid === uuid) {
        selectedWorkflow.value = workflow;
      }
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to update workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteWorkflow(uuid: string) {
    if (!requireAuth()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await workflowService.deleteWorkflow(uuid);
      workflows.value = workflows.value.filter((w) => w.uuid !== uuid);
      if (selectedWorkflow.value?.uuid === uuid) {
        selectedWorkflow.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Workflow Operations
  // ============================================

  async function submitWorkflow(uuid: string, data: SubmitWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.submitWorkflow(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to submit workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function approveWorkflow(uuid: string, data: ApproveWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.approveWorkflow(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to approve workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function rejectWorkflow(uuid: string, data: RejectWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.rejectWorkflow(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to reject workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function completeWorkflow(uuid: string) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.completeWorkflow(uuid);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to complete workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function addComment(uuid: string, data: AddCommentDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.addComment(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to add comment';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function escalateWorkflow(uuid: string, data: EscalateWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.escalateWorkflow(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to escalate workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function reassignWorkflow(uuid: string, data: ReassignWorkflowDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.reassignWorkflow(uuid, data);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to reassign workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function archiveWorkflow(uuid: string) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.archiveWorkflow(uuid);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to archive workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function cancelWorkflow(uuid: string) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const workflow = await workflowService.cancelWorkflow(uuid);
      updateLocalWorkflow(uuid, workflow);
      return workflow;
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel workflow';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  async function fetchStats() {
    if (!requireAuth()) return null;

    try {
      const statsData = await workflowService.getStats();
      stats.value = statsData;
      return statsData;
    } catch (err: any) {
      console.error('Failed to fetch workflow stats:', err);
      throw err;
    }
  }

  async function fetchAnalytics(organisationId?: string) {
    if (!requireAuth()) return null;

    try {
      const analyticsData = await workflowService.getAnalytics(organisationId || userOrganisationId.value);
      analytics.value = analyticsData;
      return analyticsData;
    } catch (err: any) {
      console.error('Failed to fetch workflow analytics:', err);
      throw err;
    }
  }

  // ============================================
  // Actions - Query Helpers
  // ============================================

  async function fetchPendingApprovals() {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const pending = await workflowService.getPendingApprovals();
      return pending;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch pending approvals';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyAssignedWorkflows() {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const assigned = await workflowService.getWorkflowsByAssignedTo(userId.value);
      return assigned;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch assigned workflows';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  function updateLocalWorkflow(uuid: string, updated: Workflow): void {
    const index = workflows.value.findIndex((w) => w.uuid === uuid);
    if (index !== -1) {
      workflows.value[index] = updated;
    }
    if (selectedWorkflow.value?.uuid === uuid) {
      selectedWorkflow.value = updated;
    }
  }

  function clearError() {
    error.value = null;
  }

  function clearSelection() {
    selectedWorkflow.value = null;
  }

  function resetState() {
    workflows.value = [];
    selectedWorkflow.value = null;
    stats.value = null;
    analytics.value = null;
    isLoading.value = false;
    isSaving.value = false;
    error.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
    };
    filters.value = {};
  }

  return {
    // State
    workflows,
    selectedWorkflow,
    stats,
    analytics,
    isLoading,
    isSaving,
    error,
    pagination,
    filters,

    // Getters
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

    // Auth Helpers
    requireAuth,

    // CRUD Actions
    fetchWorkflows,
    fetchWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,

    // Workflow Actions
    submitWorkflow,
    approveWorkflow,
    rejectWorkflow,
    completeWorkflow,
    addComment,
    escalateWorkflow,
    reassignWorkflow,
    archiveWorkflow,
    cancelWorkflow,

    // Statistics
    fetchStats,
    fetchAnalytics,

    // Query Helpers
    fetchPendingApprovals,
    fetchMyAssignedWorkflows,

    // Utility
    clearError,
    clearSelection,
    resetState,
  };
});