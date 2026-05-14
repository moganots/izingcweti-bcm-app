import { defineStore } from 'pinia'
import { Workflow, WorkflowStats, CreateWorkflowRequest, UpdateWorkflowRequest, SubmitWorkflowRequest, ApproveWorkflowRequest, RejectWorkflowRequest, EscalateWorkflowRequest, ReassignWorkflowRequest, AddCommentRequest } from 'src/models/entities'
import { workflowService } from 'src/services'
import { WorkflowQueryParams } from 'src/types'
import { ref, computed } from 'vue'
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

  /**
   * Load workflows with optional filters
   */
  async function loadWorkflows(filters?: WorkflowQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await workflowService.getWorkflows({
        ...filters,
        page: currentPage.value,
      })

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

  /**
   * Load a single workflow by ID
   */
  async function loadWorkflow(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await workflowService.getWorkflow(id)
      selectedWorkflow.value = data
    } catch (err: any) {
      console.error('Failed to load workflow:', err)
      error.value = err.message || 'Failed to load workflow'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load workflow statistics
   */
  async function loadStats(): Promise<void> {
    try {
      const data = await workflowService.getStats()
      stats.value = data
    } catch (err: any) {
      console.error('Failed to load workflow stats:', err)
    }
  }

  /**
   * Load pending approvals for current user
   */
  async function loadPendingApprovals(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await workflowService.getPendingApprovals()
      workflows.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      console.error('Failed to load pending approvals:', err)
      error.value = err.message || 'Failed to load pending approvals'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new workflow
   */
  async function createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const created = await workflowService.createWorkflow(data)
      // Add to local list
      workflows.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update a workflow
   */
  async function updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await workflowService.updateWorkflow(id, data)
      // Update in local list
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = updated
      }
      // Update selected if viewing
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete a workflow
   */
  async function deleteWorkflow(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await workflowService.deleteWorkflow(id)
      // Remove from local list
      workflows.value = workflows.value.filter((w) => w.uuid !== id)
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = null
      }
    } catch (err: any) {
      console.error('Failed to delete workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Submit workflow for review
   */
  async function submitWorkflow(id: string, data?: SubmitWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const submitted = await workflowService.submitWorkflow(id, data)
      // Update in local list
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = submitted
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = submitted
      }
      return submitted
    } catch (err: any) {
      console.error('Failed to submit workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to submit workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Start reviewing a workflow
   */
  async function startReview(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const reviewed = await workflowService.startReview(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = reviewed
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = reviewed
      }
      return reviewed
    } catch (err: any) {
      console.error('Failed to start review:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to start review'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Approve a workflow
   */
  async function approveWorkflow(id: string, data: ApproveWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const approved = await workflowService.approveWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = approved
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = approved
      }
      await loadStats()
      return approved
    } catch (err: any) {
      console.error('Failed to approve workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to approve workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Reject a workflow
   */
  async function rejectWorkflow(id: string, data: RejectWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const rejected = await workflowService.rejectWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = rejected
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = rejected
      }
      return rejected
    } catch (err: any) {
      console.error('Failed to reject workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reject workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Escalate a workflow
   */
  async function escalateWorkflow(id: string, data: EscalateWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const escalated = await workflowService.escalateWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = escalated
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = escalated
      }
      return escalated
    } catch (err: any) {
      console.error('Failed to escalate workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to escalate workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Reassign a workflow
   */
  async function reassignWorkflow(id: string, data: ReassignWorkflowRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const reassigned = await workflowService.reassignWorkflow(id, data)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = reassigned
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = reassigned
      }
      return reassigned
    } catch (err: any) {
      console.error('Failed to reassign workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reassign workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Add comment to workflow
   */
  async function addComment(id: string, data: AddCommentRequest): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await workflowService.addComment(id, data)
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to add comment:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to add comment'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Complete a workflow
   */
  async function completeWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const completed = await workflowService.completeWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = completed
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = completed
      }
      await loadStats()
      return completed
    } catch (err: any) {
      console.error('Failed to complete workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to complete workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Archive a workflow
   */
  async function archiveWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const archived = await workflowService.archiveWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = archived
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = archived
      }
      return archived
    } catch (err: any) {
      console.error('Failed to archive workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to archive workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Cancel a workflow
   */
  async function cancelWorkflow(id: string): Promise<Workflow> {
    isSaving.value = true
    error.value = null

    try {
      const cancelled = await workflowService.cancelWorkflow(id)
      const index = workflows.value.findIndex((w) => w.uuid === id)
      if (index !== -1) {
        workflows.value[index] = cancelled
      }
      if (selectedWorkflow.value?.uuid === id) {
        selectedWorkflow.value = cancelled
      }
      return cancelled
    } catch (err: any) {
      console.error('Failed to cancel workflow:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to cancel workflow'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Set current page and reload
   */
  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadWorkflows()
  }

  /**
   * Clear selected workflow
   */
  function clearSelection(): void {
    selectedWorkflow.value = null
  }

  /**
   * Clear all workflow data
   */
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
    // State
    workflows,
    selectedWorkflow,
    stats,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    // Getters
    pendingWorkflows,
    myWorkflows,
    pendingApprovals,
    pendingApprovalCount,
    overdueWorkflows,
    overdueCount,
    workflowsByType,
    workflowsByState,
    escalatedWorkflows,
    // Actions
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
