import { BaseService } from '../BaseService'
import {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  SubmitWorkflowRequest,
  ApproveWorkflowRequest,
  RejectWorkflowRequest,
  EscalateWorkflowRequest,
  ReassignWorkflowRequest,
  AddCommentRequest,
  WorkflowStats,
} from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import { WorkflowQueryParams, PaginatedResponse } from './../../../types'

/**
 * Workflow API Service
 */
export class WorkflowService extends BaseService {
  /**
   * Get all workflows with pagination
   */
  async getWorkflows(params?: WorkflowQueryParams): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, params)
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.get<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    const response = await this.post<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await this.put<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
  }

  /**
   * Get pending approvals for current user
   */
  async getPendingApprovals(): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(API_ENDPOINTS.WORKFLOWS.PENDING_APPROVALS)
  }

  /**
   * Submit workflow for review
   */
  async submitWorkflow(id: string, data?: SubmitWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.SUBMIT(id), data || {})
    return this.extractData(response)
  }

  /**
   * Start reviewing a workflow
   */
  async startReview(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id) + '/start-review')
    return this.extractData(response)
  }

  /**
   * Approve a workflow
   */
  async approveWorkflow(id: string, data: ApproveWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.APPROVE(id), data)
    return this.extractData(response)
  }

  /**
   * Reject a workflow
   */
  async rejectWorkflow(id: string, data: RejectWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.REJECT(id), data)
    return this.extractData(response)
  }

  /**
   * Escalate a workflow
   */
  async escalateWorkflow(id: string, data: EscalateWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.ESCALATE(id), data)
    return this.extractData(response)
  }

  /**
   * Reassign a workflow
   */
  async reassignWorkflow(id: string, data: ReassignWorkflowRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.REASSIGN(id), data)
    return this.extractData(response)
  }

  /**
   * Add comment to workflow
   */
  async addComment(id: string, data: AddCommentRequest): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.ADD_COMMENT(id), data)
    return this.extractData(response)
  }

  /**
   * Complete a workflow
   */
  async completeWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id) + '/complete')
    return this.extractData(response)
  }

  /**
   * Archive a workflow
   */
  async archiveWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id) + '/archive')
    return this.extractData(response)
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(id: string): Promise<Workflow> {
    const response = await this.patch<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(id) + '/cancel')
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
   * Get workflows by entity
   */
  async getWorkflowsByEntity(
    entityType: string,
    entityId: string
  ): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, {
      entity_type: entityType,
      entity_id: entityId,
    } as WorkflowQueryParams)
  }
}

// Export singleton
export const workflowService = new WorkflowService()
