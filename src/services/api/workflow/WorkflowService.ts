import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  WorkflowType,
  WorkflowState,
  WorkflowPriority,
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
  type PaginatedResponse,
} from '../../../modules'

export interface SubmitWorkflowRequest {
  comments?: string
}

export interface ReassignWorkflowRequest {
  assigned_to: string
  reason?: string
}

export interface AddCommentRequest {
  comment: string
  action?: string
}

export interface UpdateWorkflowRequest {
  title?: string
  description?: string
  priority?: WorkflowPriority
  assigned_to?: string
  due_date?: string
  workflow_data?: Record<string, any>
  metadata?: Record<string, any>
}

export class WorkflowService extends BaseService {
  async getWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, params as Record<string, any>)
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.get<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
    return this.extractData(response)
  }

  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    const response = await this.post<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, data)
    return this.extractData(response)
  }

  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await this.put<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
  }

  async permanentlyDeleteWorkflow(id: string): Promise<void> {
    await this.delete(`/workflows/${id}/permanent`)
  }

  async restoreWorkflow(id: string): Promise<Workflow> {
    const response = await this.post<Workflow>(`/workflows/${id}/restore`)
    return this.extractData(response)
  }

  async getPendingApprovals(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(
      API_ENDPOINTS.WORKFLOWS.PENDING_APPROVALS,
      params as Record<string, any>
    )
  }

  async getMyWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, my_workflows: true })
  }

  async getAwaitingMyApproval(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, my_approvals: true })
  }

  async getOverdueWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, overdue_only: true })
  }

  async getEscalatedWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, escalated_only: true })
  }

  async submitWorkflow(id: string, data?: SubmitWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.SUBMIT(id), data || {})
    return this.extractData(response)
  }

  async startReview(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(`/workflows/${id}/start-review`)
    return this.extractData(response)
  }

  async approveWorkflow(id: string, data: ApproveWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.APPROVE(id), data)
    return this.extractData(response)
  }

  async rejectWorkflow(id: string, data: RejectWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.REJECT(id), data)
    return this.extractData(response)
  }

  async escalateWorkflow(id: string, data: EscalateWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.ESCALATE(id), data)
    return this.extractData(response)
  }

  async reassignWorkflow(id: string, data: ReassignWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.REASSIGN(id), data)
    return this.extractData(response)
  }

  async addComment(id: string, data: AddCommentRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.ADD_COMMENT(id), data)
    return this.extractData(response)
  }

  async completeWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.COMPLETE(id))
    return this.extractData(response)
  }

  async archiveWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.ARCHIVE(id))
    return this.extractData(response)
  }

  async cancelWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.CANCEL(id))
    return this.extractData(response)
  }

  async getStats(): Promise<WorkflowStats> {
    const response = await this.get<WorkflowStats>(API_ENDPOINTS.WORKFLOWS.STATS)
    return this.extractData(response)
  }

  async getMetrics(organisationId?: string): Promise<WorkflowMetrics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<WorkflowMetrics>('/workflows/metrics', params)
    return this.extractData(response)
  }

  async getWorkflowsByEntity(
    entityType: string,
    entityId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, entity_type: entityType, entity_id: entityId })
  }

  async getWorkflowsByType(
    workflowType: WorkflowType,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, workflow_type: workflowType })
  }

  async getWorkflowsByState(
    state: WorkflowState,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, workflow_state: state })
  }

  async getWorkflowsByPriority(
    priority: WorkflowPriority,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, priority })
  }

  async getWorkflowsByAssignee(
    assigneeId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, assigned_to: assigneeId })
  }

  async getWorkflowsByInitiator(
    initiatorId: string,
    params?: WorkflowQueryParams
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getWorkflows({ ...params, initiated_by: initiatorId })
  }

  async getWorkflowTemplates(workflowType?: WorkflowType): Promise<WorkflowTemplate[]> {
    const params = workflowType ? { workflow_type: workflowType } : undefined
    const response = await this.get<WorkflowTemplate[]>('/workflows/templates', params)
    return this.extractData(response)
  }

  async getWorkflowTemplate(id: string): Promise<WorkflowTemplate> {
    const response = await this.get<WorkflowTemplate>(`/workflows/templates/${id}`)
    return this.extractData(response)
  }

  async createWorkflowFromTemplate(
    templateId: string,
    data: Omit<CreateWorkflowRequest, 'workflow_type'>
  ): Promise<Workflow> {
    const response = await this.post<Workflow>(`/workflows/templates/${templateId}/create`, data)
    return this.extractData(response)
  }

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

  async getApprovalChain(workflowId: string): Promise<ApprovalStep[]> {
    const response = await this.get<ApprovalStep[]>(`/workflows/${workflowId}/approval-chain`)
    return this.extractData(response)
  }

  async updateApprovalChain(
    workflowId: string,
    approvalChain: Omit<ApprovalStep, 'status'>[]
  ): Promise<Workflow> {
    const response = await this.put<Workflow>(`/workflows/${workflowId}/approval-chain`, {
      approval_chain: approvalChain,
    })
    return this.extractData(response)
  }

  async getComments(workflowId: string): Promise<WorkflowComment[]> {
    const response = await this.get<WorkflowComment[]>(`/workflows/${workflowId}/comments`)
    return this.extractData(response)
  }
}

export const workflowService = new WorkflowService()
