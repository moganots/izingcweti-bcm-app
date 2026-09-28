import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Workflow } from '../../models/workflow/workflow.entity'
import { WorkflowState, WorkflowPriority } from '../../models/workflow/workflow.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { useAuthStore } from '../auth/auth.store'

export const useWorkflowItemStore = createOfflineCrudStore<Workflow>({
  storeId: 'workflows',
  tableName: 'workflows',
})

export const useWorkflowStore = defineStore('workflow', () => {
  const workflowStore = useWorkflowItemStore()
  const authStore = useAuthStore()
  const isSaving = ref(false)

  const workflows = workflowStore.items

  // ============================================
  // Getters
  // ============================================
  const pendingWorkflows = computed(() =>
    workflows?.filter((w) =>
      [
        WorkflowState.SUBMITTED,
        WorkflowState.IN_REVIEW,
        WorkflowState.PENDING_APPROVAL,
      ].includes(w.workflowState)
    )
  )

  const activeWorkflows = computed(() =>
    workflows?.filter((w) =>
      [
        WorkflowState.DRAFT,
        WorkflowState.SUBMITTED,
        WorkflowState.IN_REVIEW,
        WorkflowState.PENDING_APPROVAL,
        WorkflowState.AWAITING_INPUT,
        WorkflowState.IN_PROGRESS,
      ].includes(w.workflowState)
    )
  )

  const overdueWorkflows = computed(() => {
    const now = new Date()
    return workflows?.filter(
      (w) =>
        w.dueDate &&
        new Date(w.dueDate) < now &&
        w.workflowState !== WorkflowState.COMPLETED
    )
  })

  const escalatedWorkflows = computed(() =>
    workflows?.filter((w) => (w.escalationLevel || 0) > 0)
  )

  const myAssignedWorkflows = computed(() =>
    workflows?.filter((w) => w.assignedTo === authStore.userId)
  )

  const myInitiatedWorkflows = computed(() =>
    workflows?.filter((w) => w.initiatedBy === authStore.userId)
  )

  const workflowsByState = computed(() => {
    const grouped: Record<string, Workflow[]> = {}
    workflows?.forEach((w) => {
      const state = w.workflowState || 'Unknown'
      if (!grouped[state]) grouped[state] = []
      grouped[state].push(w)
    })
    return grouped
  })

  const workflowsByType = computed(() => {
    const grouped: Record<string, Workflow[]> = {}
    workflows?.forEach((w) => {
      const type = w.workflowType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(w)
    })
    return grouped
  })

  const workflowsByPriority = computed(() => {
    const grouped: Record<number, Workflow[]> = {}
    workflows?.forEach((w) => {
      const priority = w.priority || WorkflowPriority.MEDIUM
      if (!grouped[priority]) grouped[priority] = []
      grouped[priority].push(w)
    })
    return grouped
  })

  const totalPendingApprovals = computed(() => pendingWorkflows?.value?.length)
  const totalOverdue = computed(() => overdueWorkflows?.value?.length)
  const totalEscalated = computed(() => escalatedWorkflows?.value?.length)

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await workflowStore.initialize()
  }

  async function submitWorkflow(id: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.SUBMITTED,
    } as Partial<Workflow>)
  }

  async function approveWorkflow(id: string, _comments?: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.APPROVED,
      completedAt: new Date(),
    } as Partial<Workflow>)
  }

  async function rejectWorkflow(id: string, reason: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.REJECTED,
      rejectionReason: reason,
    } as Partial<Workflow>)
  }

  async function completeWorkflow(id: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.COMPLETED,
      completedAt: new Date(),
    } as Partial<Workflow>)
  }

  async function addComment(id: string, comment: string): Promise<Workflow | null> {
    const workflow = workflows?.find((w) => w.uuid === id)
    if (!workflow) return null

    const comments = workflow.comments || []
    comments.push({
      userId: authStore.userId,
      comment,
      timestamp: new Date(),
    })

    return workflowStore.update(id, { comments } as Partial<Workflow>)
  }

  async function escalateWorkflow(
    id: string,
    level: number,
    reason: string
  ): Promise<Workflow | null> {
    return workflowStore.update(id, {
      escalationLevel: level,
      metadata: { escalationReason: reason },
    } as Partial<Workflow>)
  }

  async function reassignWorkflow(id: string, assignedTo: string): Promise<Workflow | null> {
    return workflowStore.update(id, { assignedTo } as Partial<Workflow>)
  }

  async function archiveWorkflow(id: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.ARCHIVED,
    } as Partial<Workflow>)
  }

  async function cancelWorkflow(id: string): Promise<Workflow | null> {
    return workflowStore.update(id, {
      workflowState: WorkflowState.CANCELLED,
    } as Partial<Workflow>)
  }

  return {
    // State
    workflows,
    selectedWorkflow: workflowStore.selected,
    isLoading: workflowStore.loading,
    isSaving,
    error: workflowStore.error,

    // Getters
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

    // Actions
    initialize,
    submitWorkflow,
    approveWorkflow,
    rejectWorkflow,
    completeWorkflow,
    addComment,
    escalateWorkflow,
    reassignWorkflow,
    archiveWorkflow,
    cancelWorkflow,

    // Sub-store
    workflowStore,
  }
})