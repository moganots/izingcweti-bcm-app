import { BaseService } from './../../BaseService';
import { API_ENDPOINTS } from './../../../core/constants/api.constants';
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
} from './../../../models/entities/workflow/workflow.entity';
import { PaginatedResponse } from './../../../shared/types/common.types'

export class WorkflowService extends BaseService {
  constructor() {
    super();
  }

  // ============================================
  // CRUD Operations
  // ============================================

  async getWorkflows(params?: WorkflowQueryDto): Promise<PaginatedResponse<Workflow>> {
    return this.getPaginated<Workflow>(
      API_ENDPOINTS.WORKFLOWS.BASE,
      params as Record<string, any>
    );
  }

  async getWorkflow(uuid: string): Promise<Workflow> {
    const response = await this.get<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(uuid));
    return this.extractData(response);
  }

  async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(API_ENDPOINTS.WORKFLOWS.BASE, data);
    return this.extractData(response);
  }

  async updateWorkflow(uuid: string, data: UpdateWorkflowDto): Promise<Workflow> {
    const response = await this.put<Workflow>(API_ENDPOINTS.WORKFLOWS.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteWorkflow(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.WORKFLOWS.BY_ID(uuid));
  }

  // ============================================
  // Query Operations
  // ============================================

  async getWorkflowsByType(workflowType: string): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.BY_TYPE(workflowType)
    );
    return this.extractData(response);
  }

  async getWorkflowsByState(workflowState: string): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.BY_STATE(workflowState)
    );
    return this.extractData(response);
  }

  async getWorkflowsByInitiatedBy(userId: string): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.BY_INITIATED_BY(userId)
    );
    return this.extractData(response);
  }

  async getWorkflowsByAssignedTo(userId: string): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.BY_ASSIGNED_TO(userId)
    );
    return this.extractData(response);
  }

  async getPendingApprovals(): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.PENDING_APPROVALS
    );
    return this.extractData(response);
  }

  async getOverdueWorkflows(): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.OVERDUE
    );
    return this.extractData(response);
  }

  async getActiveWorkflows(): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.ACTIVE
    );
    return this.extractData(response);
  }

  async getEscalatedWorkflows(): Promise<Workflow[]> {
    const response = await this.get<Workflow[]>(
      API_ENDPOINTS.WORKFLOWS.ESCALATED
    );
    return this.extractData(response);
  }

  // ============================================
  // Workflow Actions
  // ============================================

  async submitWorkflow(uuid: string, data: SubmitWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.SUBMIT(uuid),
      data
    );
    return this.extractData(response);
  }

  async approveWorkflow(uuid: string, data: ApproveWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.APPROVE(uuid),
      data
    );
    return this.extractData(response);
  }

  async rejectWorkflow(uuid: string, data: RejectWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.REJECT(uuid),
      data
    );
    return this.extractData(response);
  }

  async completeWorkflow(uuid: string): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.COMPLETE(uuid)
    );
    return this.extractData(response);
  }

  async addComment(uuid: string, data: AddCommentDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.ADD_COMMENT(uuid),
      data
    );
    return this.extractData(response);
  }

  async escalateWorkflow(uuid: string, data: EscalateWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.ESCALATE(uuid),
      data
    );
    return this.extractData(response);
  }

  async reassignWorkflow(uuid: string, data: ReassignWorkflowDto): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.REASSIGN(uuid),
      data
    );
    return this.extractData(response);
  }

  async archiveWorkflow(uuid: string): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.ARCHIVE(uuid)
    );
    return this.extractData(response);
  }

  async cancelWorkflow(uuid: string): Promise<Workflow> {
    const response = await this.post<Workflow>(
      API_ENDPOINTS.WORKFLOWS.CANCEL(uuid)
    );
    return this.extractData(response);
  }

  // ============================================
  // Statistics
  // ============================================

  async getStats(): Promise<WorkflowStatsDto> {
    const response = await this.get<WorkflowStatsDto>(
      API_ENDPOINTS.WORKFLOWS.STATS
    );
    return this.extractData(response);
  }

  async getAnalytics(organisationId?: string): Promise<WorkflowAnalyticsDto> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<WorkflowAnalyticsDto>(
      '/workflows/analytics',
      params
    );
    return this.extractData(response);
  }
}

export const workflowService = new WorkflowService();