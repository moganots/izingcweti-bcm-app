import { EntityType } from 'src/shared/enums/system.enum';
import type { BaseEntity } from './../../../core/base/base.entity';

export enum WorkflowState {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  IN_REVIEW = "InReview",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  COMPLETED = "Completed",
  ARCHIVED = "Archived",
  CANCELLED = "Cancelled",
  EXPIRED = "Expired",
  AWAITING_INPUT = "AwaitingInput",
  PARALLEL_REVIEW = "ParallelReview",
  ESCALATED = "Escalated",
  IN_PROGRESS = "InProgress",
  PENDING = "Pending",
  UNDER_REVIEW = "UnderReview",
  PENDING_APPROVAL = "PendingApproval",
}

export enum WorkflowType {
  POLICY_APPROVAL = "PolicyApproval",
  RISK_ASSESSMENT = "RiskAssessment",
  BIA_REVIEW = "BIAReview",
  BCP_APPROVAL = "BCPApproval",
  STRATEGY_APPROVAL = "StrategyApproval",
  TEST_REVIEW = "TestReview",
  INCIDENT_MANAGEMENT = "IncidentManagement",
  IMPROVEMENT_TRACKING = "ImprovementTracking",
  TRAINING_ATTESTATION = "TrainingAttestation",
  COMPLIANCE_REVIEW = "ComplianceReview",
  INCIDENT_RESPONSE = "IncidentResponse",
  DOCUMENT_REVIEW = "DocumentReview",
  COMPLIANCE_AUDIT = "ComplianceAudit",
  RISK_REVIEW = "RiskReview",
  APPROVAL = "Approval",
  REVIEW = "Review",
  ESCALATION = "Escalation",
  NOTIFICATION = "Notification",
  AUTOMATION = "Automation",
  TEST_APPROVAL = "TestApproval",
  TRAINING_COMPLETION = "TrainingCompletion",
  COMPLIANCE_CHECK = "ComplianceCheck",
  AUDIT_REVIEW = "AuditReview",
  INVESTIGATION = "Investigation",
  CORRECTIVE_ACTION = "CorrectiveAction",
  BUDGET_APPROVAL = "BudgetApproval",
  PROCESS_CHANGE = "ProcessChange",
  OTHER = "Other",
}

export enum WorkflowPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  BACKGROUND = 5,
}

export enum WorkflowApprovalStatus {
  PENDING = "Pending",
  IN_REVIEW = "InReview",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  RETURNED = "Returned",
  CANCELLED = "Cancelled",
  EXPIRED = "Expired",
  DEFERRED = "Deferred",
  ESCALATED = "Escalated",
  SKIPPED = "Skipped",
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