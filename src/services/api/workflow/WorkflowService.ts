import { BaseService } from '../../BaseService'
import {
  // Enums
  WorkflowType,
  WorkflowState,
  WorkflowPriority,
  // Types
  type Workflow,
  type ApprovalStep,
  type WorkflowComment,
  type WorkflowTemplate,
  type WorkflowMetrics,
  type CreateWorkflowRequest,
  type ApproveWorkflowRequest,
  type RejectWorkflowRequest,
  type EscalateWorkflowRequest,
  type WorkflowQueryParams,
  type WorkflowStats,
  // Shared Types
  type PaginatedResponse,
} from '../../../modules'

/**
 * Submit Workflow Request
 */
export interface SubmitWorkflowRequest {
  comments?: string
}

/**
 * Reassign Workflow Request
 */
export interface ReassignWorkflowRequest {
  assigned_to: string
  reason?: string
}

/**
 * Add Comment Request
 */
export interface AddCommentRequest {
  comment: string
  action?: string
}

/**
 * Update Workflow Request
 */
export interface UpdateWorkflowRequest {
  title?: string
  description?: string
  priority?: WorkflowPriority
  assigned_to?: string
  due_date?: string
  workflow_data?: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Workflow API Service
 * Uses consolidated module types and enums
 */
export class WorkflowService extends BaseService {
  /**
   * Get all workflows with pagination
   */
  async getWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>('/workflows', params as Record<string, any>)
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.get<Workflow>(`/workflows/${id}`)
    return this.extractData(response)
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    const response = await this.post<Workflow>('/workflows', data)
    return this.extractData(response)
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await this.put<Workflow>(`/workflows/${id}`, data)
    return this.extractData(response)
  }

  /**
   * Delete a workflow (soft delete)
   */
  async deleteWorkflow(id: string): Promise<void> {
    await this.delete(`/workflows/${id}`)
  }

  /**
   * Permanently delete a workflow
   */
  async permanentlyDeleteWorkflow(id: string): Promise<void> {
    await this.delete(`/workflows/${id}/permanent`)
  }

  /**
   * Restore a deleted workflow
   */
  async restoreWorkflow(id: string): Promise<Workflow> {
    const response = await this.post<Workflow>(`/workflows/${id}/restore`)
    return this.extractData(response)
  }

  /**
   * Get pending approvals for current user
   */
  async getPendingApprovals(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(
      '/workflows/pending/approvals',
      params as Record<string, any>
    )
  }

  /**
   * Get workflows assigned to current user
   */
  async getMyWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, my_workflows: true })
  }

  /**
   * Get workflows awaiting my approval
   */
  async getAwaitingMyApproval(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, my_approvals: true })
  }

  /**
   * Get overdue workflows
   */
  async getOverdueWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, overdue_only: true })
  }

  /**
   * Get escalated workflows
   */
  async getEscalatedWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, escalated_only: true })
  }

  /**
   * Submit workflow for review
   */
  async submitWorkflow(id: string, data?: SubmitWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/submit`, data || {})
    return this.extractData(response)
  }

  /**
   * Start reviewing a workflow
   */
  async startReview(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/start-review`)
    return this.extractData(response)
  }

  /**
   * Approve a workflow
   */
  async approveWorkflow(id: string, data: ApproveWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/approve`, data)
    return this.extractData(response)
  }

  /**
   * Reject a workflow
   */
  async rejectWorkflow(id: string, data: RejectWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/reject`, data)
    return this.extractData(response)
  }

  /**
   * Escalate a workflow
   */
  async escalateWorkflow(id: string, data: EscalateWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/escalate`, data)
    return this.extractData(response)
  }

  /**
   * Reassign a workflow to another user
   */
  async reassignWorkflow(id: string, data: ReassignWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/reassign`, data)
    return this.extractData(response)
  }

  /**
   * Add comment to workflow
   */
  async addComment(id: string, data: AddCommentRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/comment`, data)
    return this.extractData(response)
  }

  /**
   * Complete a workflow
   */
  async completeWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/complete`)
    return this.extractData(response)
  }

  /**
   * Archive a workflow
   */
  async archiveWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/archive`)
    return this.extractData(response)
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/cancel`)
    return this.extractData(response)
  }

  /**
   * Get workflow statistics
   */
  async getStats(): Promise<WorkflowStats> {
    const response = await this.get<WorkflowStats>('/workflows/stats')
    return this.extractData(response)
  }

  /**
   * Get workflow metrics for dashboard
   */
  async getMetrics(organisationId?: string): Promise<WorkflowMetrics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<WorkflowMetrics>('/workflows/metrics', params)
    return this.extractData(response)
  }

  /**
   * Get workflows by entity
   */
  async getWorkflowsByEntity(
    entityType: string,
    entityId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, entity_type: entityType, entity_id: entityId })
  }

  /**
   * Get workflows by type
   */
  async getWorkflowsByType(
    workflowType: WorkflowType,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, workflow_type: workflowType })
  }

  /**
   * Get workflows by state
   */
  async getWorkflowsByState(
    state: WorkflowState,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, workflow_state: state })
  }

  /**
   * Get workflows by priority
   */
  async getWorkflowsByPriority(
    priority: WorkflowPriority,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, priority })
  }

  /**
   * Get workflows by assignee
   */
  async getWorkflowsByAssignee(
    assigneeId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, assigned_to: assigneeId })
  }

  /**
   * Get workflows by initiator
   */
  async getWorkflowsByInitiator(
    initiatorId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, initiated_by: initiatorId })
  }

  /**
   * Get workflow templates
   */
  async getWorkflowTemplates(workflowType?: WorkflowType): Promise<WorkflowTemplate[]> {
    const params = workflowType ? { workflow_type: workflowType } : undefined
    const response = await this.get<WorkflowTemplate[]>('/workflows/templates', params)
    return this.extractData(response)
  }

  /**
   * Get workflow template by ID
   */
  async getWorkflowTemplate(id: string): Promise<WorkflowTemplate> {
    const response = await this.get<WorkflowTemplate>(`/workflows/templates/${id}`)
    return this.extractData(response)
  }

  /**
   * Create workflow from template
   */
  async createWorkflowFromTemplate(
    templateId: string,
    data: Omit<CreateWorkflowRequest, 'workflow_type'>
  ): Promise<Workflow> {
    const response = await this.post<Workflow>(`/workflows/templates/${templateId}/create`, data)
    return this.extractData(response)
  }

  /**
   * Export workflows
   */
  async exportWorkflows(params?: {
    workflow_type?: WorkflowType
    workflow_state?: WorkflowState
    start_date?: string
    end_date?: string
    format?: 'csv' | 'json'
  }): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      '/workflows/export',
      `workflows_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  /**
   * Bulk approve workflows
   */
  async bulkApprove(
    ids: string[],
    comments?: string
  ): Promise<{ approved: number; failed: number }> {
    const response = await this.post<{ approved: number; failed: number }>(
      '/workflows/bulk-approve',
      { ids, comments }
    )
    return this.extractData(response)
  }

  /**
   * Bulk reject workflows
   */
  async bulkReject(
    ids: string[],
    rejectionReason: string
  ): Promise<{ rejected: number; failed: number }> {
    const response = await this.post<{ rejected: number; failed: number }>(
      '/workflows/bulk-reject',
      { ids, rejection_reason: rejectionReason }
    )
    return this.extractData(response)
  }

  /**
   * Bulk reassign workflows
   */
  async bulkReassign(
    ids: string[],
    assignedTo: string
  ): Promise<{ reassigned: number; failed: number }> {
    const response = await this.post<{ reassigned: number; failed: number }>(
      '/workflows/bulk-reassign',
      { ids, assigned_to: assignedTo }
    )
    return this.extractData(response)
  }

  /**
   * Get workflow approval chain
   */
  async getApprovalChain(workflowId: string): Promise<ApprovalStep[]> {
    const response = await this.get<ApprovalStep[]>(`/workflows/${workflowId}/approval-chain`)
    return this.extractData(response)
  }

  /**
   * Update approval chain (admin)
   */
  async updateApprovalChain(
    workflowId: string,
    approvalChain: Omit<ApprovalStep, 'status'>[]
  ): Promise<Workflow> {
    const response = await this.put<Workflow>(`/workflows/${workflowId}/approval-chain`, {
      approval_chain: approvalChain,
    })
    return this.extractData(response)
  }

  /**
   * Get workflow comments
   */
  async getComments(workflowId: string): Promise<WorkflowComment[]> {
    const response = await this.get<WorkflowComment[]>(`/workflows/${workflowId}/comments`)
    return this.extractData(response)
  }
}

// Export singleton
export const workflowService = new WorkflowService()
