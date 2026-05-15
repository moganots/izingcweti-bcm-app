import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Workflow,
  WorkflowStats,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  SubmitWorkflowRequest,
  ApproveWorkflowRequest,
  RejectWorkflowRequest,
  EscalateWorkflowRequest,
  ReassignWorkflowRequest,
  AddCommentRequest,
} from '../models/entities/workflow.entity'
import { workflowService } from '../services/api/WorkflowService'
import type { WorkflowQueryParams } from '../types/bcm.types'
import { useAuthStore } from './auth.store'

export const useWorkflowStore = defineStore('workflow', () => {
  // ============================================
  // State
  // ============================================
  const workflows = ref<Workflow[]>([])
  const selectedWorkflow = ref<Workflow | null>(null)
  const stats = ref<WorkflowStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // ============================================
  // Getters
  // ============================================
  const pendingWorkflows = computed(() =>
    workflows.value.filter((w) => {
      const state = w.workflow_state
      return state === 'Draft' || state === 'Submitted' || state === 'InReview'
    })
  )

  const myWorkflows = computed(() => {
    const authStore = useAuthStore()
    const myId = authStore.userId
    return workflows.value.filter((w) => w.assigned_to === myId || w.initiated_by === myId)
  })

  const pendingApprovals = computed(() =>
    myWorkflows.value.filter(
      (w) => w.workflow_state === 'Submitted' || w.workflow_state === 'InReview'
    )
  )

  const pendingApprovalCount = computed(() => pendingApprovals.value.length)

  const overdueWorkflows = computed(() =>
    workflows.value.filter((w) => {
      const dueDate = w.due_date
      if (typeof dueDate !== 'string' || dueDate.length === 0) return false
      const isPastDue = new Date(dueDate) < new Date()
      const isNotCompleted = w.completed_at === null || w.completed_at === undefined
      return isPastDue && isNotCompleted
    })
  )

  const overdueCount = computed(() => overdueWorkflows.value.length)

  const workflowsByType = computed(() => {
    const grouped: Record<string, Workflow[]> = {}
    workflows.value.forEach((w) => {
      const type = w.workflow_type || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(w)
    })
    return grouped
  })

  const workflowsByState = computed(() => {
    const grouped: Record<string, Workflow[]> = {}
    workflows.value.forEach((w) => {
      const state = w.workflow_state || 'Unknown'
      if (!grouped[state]) grouped[state] = []
      grouped[state].push(w)
    })
    return grouped
  })

  const escalatedWorkflows = computed(() =>
    workflows.value.filter((w) => typeof w.escalation_level === 'number' && w.escalation_level > 0)
  )

  // ============================================
  // Actions
  // ============================================

  async function loadWorkflows(filters?: WorkflowQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await workflowService.getWorkflows({
        ...filters,
        page: currentPage.value,
      } as any)
      workflows.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load workflows:', err)
      error.value = err.message || 'Failed to load workflows'
    } finally {
      isLoading.value = false
    }
  }

  async function loadWorkflow(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      selectedWorkflow.value = await workflowService.getWorkflow(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to load workflow'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadStats(): Promise<void> {
    try {
      stats.value = await workflowService.getStats()
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  async function loadPendingApprovals(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await workflowService.getPendingApprovals()
      workflows.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to load pending approvals'
    } finally {
      isLoading.value = false
    }
  }

  async function createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const created = await workflowService.createWorkflow(data)
      workflows.value.unshift(created)
      return created
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const updated = await workflowService.updateWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = updated
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = updated
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteWorkflow(id: string): Promise<void> {
    isSaving.value = true
    error.value = null
    try {
      await workflowService.deleteWorkflow(id)
      workflows.value = workflows.value.filter((w) => w.uuid !== id)
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = null
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function submitWorkflow(id: string, data?: SubmitWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const submitted = await workflowService.submitWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = submitted
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = submitted
      return submitted
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to submit'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function startReview(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const reviewed = await workflowService.startReview(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = reviewed
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = reviewed
      return reviewed
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to start review'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function approveWorkflow(id: string, data: ApproveWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const approved = await workflowService.approveWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = approved
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = approved
      await loadStats()
      return approved
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to approve'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function rejectWorkflow(id: string, data: RejectWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const rejected = await workflowService.rejectWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = rejected
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = rejected
      return rejected
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to reject'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function escalateWorkflow(id: string, data: EscalateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const escalated = await workflowService.escalateWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = escalated
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = escalated
      return escalated
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to escalate'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function reassignWorkflow(id: string, data: ReassignWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const reassigned = await workflowService.reassignWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = reassigned
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = reassigned
      return reassigned
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to reassign'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function addComment(id: string, data: AddCommentRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const updated = await workflowService.addComment(id, data)
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = updated
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to add comment'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function completeWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const completed = await workflowService.completeWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = completed
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = completed
      await loadStats()
      return completed
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to complete'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function archiveWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const archived = await workflowService.archiveWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = archived
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = archived
      return archived
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to archive'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function cancelWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null
    try {
      const cancelled = await workflowService.cancelWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) workflows.value[index] = cancelled
      if (selectedWorkflow.value?.uuid === id) selectedWorkflow.value = cancelled
      return cancelled
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to cancel'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadWorkflows()
  }

  function clearSelection(): void {
    selectedWorkflow.value = null
  }

  function clearAll(): void {
    workflows.value = []
    selectedWorkflow.value = null
    stats.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  return {
    workflows,
    selectedWorkflow,
    stats,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    pendingWorkflows,
    myWorkflows,
    pendingApprovals,
    pendingApprovalCount,
    overdueWorkflows,
    overdueCount,
    workflowsByType,
    workflowsByState,
    escalatedWorkflows,
    loadWorkflows,
    loadWorkflow,
    loadStats,
    loadPendingApprovals,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    submitWorkflow,
    startReview,
    approveWorkflow,
    rejectWorkflow,
    escalateWorkflow,
    reassignWorkflow,
    addComment,
    completeWorkflow,
    archiveWorkflow,
    cancelWorkflow,
    setPage,
    clearSelection,
    clearAll,
  }
})
