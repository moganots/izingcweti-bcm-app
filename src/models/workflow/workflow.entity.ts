import type { BaseEntity } from "../../core/base/base.entity";
import type { User } from "../user/user.entity";
import type { Organisation } from "../organisation/organisation.entity";
import type { EntityType } from "../audit/audit.entity";

// ============================================
// Workflow Module - Enums (Aligned with Backend)
// ============================================

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
// Workflow Entity - Aligned with Backend
// Backend: src/modules/workflow/models/entities/workflow.entity.ts
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

  // Relationships
  organisation?: Organisation;
  initiator?: User;
  assignee?: User;
  parentWorkflow?: Workflow;
  subWorkflows?: Workflow[];
}

// ============================================
// Workflow Helper Functions (Computed Properties)
// ============================================

export const WorkflowHelpers = {
  isActive: (workflow: Workflow): boolean => {
    const activeStates = [
      WorkflowState.DRAFT,
      WorkflowState.SUBMITTED,
      WorkflowState.IN_REVIEW,
      WorkflowState.PENDING_APPROVAL,
      WorkflowState.AWAITING_INPUT,
      WorkflowState.IN_PROGRESS,
    ];
    return activeStates.includes(workflow.workflowState);
  },

  isOverdue: (workflow: Workflow): boolean => {
    if (!workflow.dueDate) return false;
    const activeStates = [
      WorkflowState.DRAFT,
      WorkflowState.SUBMITTED,
      WorkflowState.IN_REVIEW,
      WorkflowState.PENDING_APPROVAL,
    ];
    return (
      activeStates.includes(workflow.workflowState) &&
      workflow.dueDate < new Date()
    );
  },

  completionTimeHours: (workflow: Workflow): number | null => {
    if (!workflow.completedAt) return null;
    const ms = workflow.completedAt.getTime() - workflow.createdAt.getTime();
    return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
  },
};