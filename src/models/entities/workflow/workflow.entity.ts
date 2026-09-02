import { EntityType } from 'src/shared/enums/system.enum';
import type { BaseEntity } from './../../../core/base/base.entity';

export enum WorkflowType {
  POLICY_APPROVAL = 'POLICY_APPROVAL',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  BIA_REVIEW = 'BIA_REVIEW',
  BCP_APPROVAL = 'BCP_APPROVAL',
  STRATEGY_APPROVAL = 'STRATEGY_APPROVAL',
  TEST_REVIEW = 'TEST_REVIEW',
  INCIDENT_MANAGEMENT = 'INCIDENT_MANAGEMENT',
  IMPROVEMENT_TRACKING = 'IMPROVEMENT_TRACKING',
  TRAINING_ATTESTATION = 'TRAINING_ATTESTATION',
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
}

export enum WorkflowState {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  AWAITING_INPUT = 'AWAITING_INPUT',
  PARALLEL_REVIEW = 'PARALLEL_REVIEW',
  ESCALATED = 'ESCALATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum WorkflowPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  BACKGROUND = 'BACKGROUND',
}

export enum WorkflowApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
}

// ============================================
// Core Types (camelCase aligned with backend)
// ============================================

export interface WorkflowComment {
  userId: string;
  comment: string;
  timestamp: Date;
  action?: string;
}

export interface ApprovalChainItem {
  approverId: string;
  level: number;
  status: WorkflowApprovalStatus;
  approvedAt?: Date;
  comments?: string;
}

// ============================================
// Workflow Entity (camelCase aligned with backend)
// ============================================

export interface Workflow extends BaseEntity {
  organisationId: string;
  workflowType: WorkflowType;
  workflowState: WorkflowState;
  priority: WorkflowPriority;
  title: string;
  description?: string;
  initiatedBy: string;
  assignedTo?: string;
  entityId?: string;
  entityType?: EntityType;
  workflowData?: Record<string, any>;
  approvalChain?: ApprovalChainItem[];
  comments?: WorkflowComment[];
  dueDate?: Date;
  completedAt?: Date;
  escalationLevel: number;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  parentWorkflowId?: string;
}

// ============================================
// DTOs (camelCase aligned with backend)
// ============================================

export interface WorkflowDto extends BaseEntity {
  workflowType: WorkflowType;
  workflowState: WorkflowState;
  priority: WorkflowPriority;
  title: string;
  description?: string;
  initiatedBy: string;
  assignedTo?: string;
  entityId?: string;
  entityType?: EntityType;
  workflowData?: Record<string, any>;
  approvalChain?: ApprovalChainItem[];
  comments?: WorkflowComment[];
  dueDate?: Date;
  completedAt?: Date;
  escalationLevel: number;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

export interface CreateWorkflowDto {
  workflowType: WorkflowType;
  title: string;
  description?: string;
  priority?: WorkflowPriority;
  assignedTo?: string;
  entityId?: string;
  entityType?: EntityType;
  workflowData?: Record<string, any>;
  approvalChain?: Omit<ApprovalChainItem, 'status'>[];
  dueDate?: Date;
  metadata?: Record<string, any>;
  organisationId?: string;
}

export interface UpdateWorkflowDto {
  title?: string;
  description?: string;
  priority?: WorkflowPriority;
  assignedTo?: string;
  workflowData?: Record<string, any>;
  approvalChain?: ApprovalChainItem[];
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface SubmitWorkflowDto {
  comments?: string;
}

export interface ApproveWorkflowDto {
  comments?: string;
}

export interface RejectWorkflowDto {
  rejectionReason: string;
  comments?: string;
}

export interface AddCommentDto {
  comment: string;
}

export interface EscalateWorkflowDto {
  escalationLevel: number;
  reason: string;
}

export interface ReassignWorkflowDto {
  assignedTo: string;
  reason?: string;
}

export interface WorkflowQueryDto {
  workflowType?: WorkflowType;
  workflowState?: WorkflowState;
  priority?: WorkflowPriority;
  initiatedBy?: string;
  assignedTo?: string;
  entityId?: string;
  entityType?: EntityType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  organisationId?: string;
}

// ============================================
// Statistics DTOs
// ============================================

export interface WorkflowStatsDto {
  total: number;
  byState: Record<WorkflowState, number>;
  byPriority: Record<WorkflowPriority, number>;
  byType: Record<WorkflowType, number>;
  avgCompletionTimeHours: number;
  overdueCount: number;
}

export interface WorkflowAnalyticsDto {
  total: number;
  byState: Record<WorkflowState, number>;
  byPriority: Record<WorkflowPriority, number>;
  byType: Record<WorkflowType, number>;
  avgCompletionTimeHours: number;
  overdueCount: number;
  activeCount: number;
  completedCount: number;
  pendingApprovals: number;
  escalatedCount: number;
}

// ============================================
// Response DTOs
// ============================================

export interface WorkflowResponseDto {
  uuid: string;
  workflowType: WorkflowType;
  workflowState: WorkflowState;
  priority: WorkflowPriority;
  title: string;
  description?: string;
  initiatedBy: string;
  assignedTo?: string;
  entityId?: string;
  entityType?: EntityType;
  workflowData?: Record<string, any>;
  approvalChain?: ApprovalChainItem[];
  comments?: WorkflowComment[];
  dueDate?: Date;
  completedAt?: Date;
  escalationLevel: number;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy?: string;
}