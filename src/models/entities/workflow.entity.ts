/**
 * Workflow State Enum
 */
export enum WorkflowState {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'InReview',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
  AWAITING_INPUT = 'AwaitingInput',
  PARALLEL_REVIEW = 'ParallelReview',
}

/**
 * Workflow Type Enum
 */
export enum WorkflowType {
  POLICY_APPROVAL = 'PolicyApproval',
  RISK_ASSESSMENT = 'RiskAssessment',
  BIA_REVIEW = 'BIAReview',
  BCP_APPROVAL = 'BCPApproval',
  STRATEGY_APPROVAL = 'StrategyApproval',
  TEST_REVIEW = 'TestReview',
  INCIDENT_MANAGEMENT = 'IncidentManagement',
  IMPROVEMENT_TRACKING = 'ImprovementTracking',
  TRAINING_ATTESTATION = 'TrainingAttestation',
  COMPLIANCE_REVIEW = 'ComplianceReview',
}

/**
 * Workflow Priority Enum
 */
export enum WorkflowPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  BACKGROUND = 5,
}

/**
 * Workflow Entity (Flat version for IndexedDB)
 * Only contains primitive values and IDs - no nested entity relationships
 */
export interface Workflow {
  uuid: string
  workflow_type: string
  workflow_state: string
  priority: number
  title: string
  description?: string | null
  initiated_by: string
  assigned_to?: string | null
  entity_id?: string | null
  entity_type?: string | null
  workflow_data?: Record<string, unknown> | null
  approval_chain?: ApprovalStep[] | null
  comments?: WorkflowComment[] | null
  due_date?: string | null
  completed_at?: string | null
  escalation_level: number
  rejection_reason?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
}

/**
 * Approval Step in a workflow's approval chain
 */
export interface ApprovalStep {
  /** Order of this step in the chain */
  order: number
  /** User ID of the approver */
  approver_id: string
  /** Name of the approver (denormalized for display) */
  approver_name?: string
  /** Status of this approval step */
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  /** When this step was actioned */
  timestamp?: string
  /** Comments from the approver */
  comments?: string
  /** Role required for this step */
  required_role?: string
}

/**
 * Comment on a workflow
 */
export interface WorkflowComment {
  /** User ID who made the comment */
  user_id: string
  /** User name (denormalized for display) */
  user_name?: string
  /** The comment text */
  comment: string
  /** When the comment was made */
  timestamp: string
  /** The action associated with this comment */
  action: 'COMMENT' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REASSIGN' | 'CANCEL'
  /** Rejection reason if action was REJECT */
  rejection_reason?: string
}

/**
 * Workflow Statistics
 */
export interface WorkflowStats {
  /** Total number of workflows */
  total: number
  /** Number of workflows in pending state */
  pending: number
  /** Number of workflows in submitted state */
  submitted: number
  /** Number of workflows in review state */
  inReview: number
  /** Number of approved workflows */
  approved: number
  /** Number of rejected workflows */
  rejected: number
  /** Number of completed workflows */
  completed: number
  /** Number of archived workflows */
  archived: number
  /** Number of cancelled workflows */
  cancelled: number
  /** Number of expired workflows */
  expired: number
  /** Number of overdue workflows */
  overdue: number
  /** Number of escalated workflows */
  escalated: number
  /** Average completion time in hours */
  averageCompletionTime: number
  /** Workflows grouped by type */
  byType: Record<string, number>
  /** Workflows grouped by state */
  byState: Record<string, number>
  /** Workflows grouped by priority */
  byPriority: Record<string, number>
  /** Workflows due this week */
  dueThisWeek: number
  /** Workflows overdue by more than 7 days */
  severelyOverdue: number
}

/**
 * Workflow Activity (for timeline display)
 */
export interface WorkflowActivity {
  /** Activity ID */
  id: string
  /** Workflow ID */
  workflow_id: string
  /** Type of activity */
  activity_type:
    | 'created'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'commented'
    | 'escalated'
    | 'reassigned'
    | 'completed'
    | 'cancelled'
  /** User who performed the action */
  user_id: string
  /** User name */
  user_name?: string
  /** Description of the activity */
  description: string
  /** Additional data */
  metadata?: Record<string, unknown>
  /** When the activity occurred */
  timestamp: string
}

/**
 * Create Workflow Request
 */
export interface CreateWorkflowRequest {
  workflow_type: string
  title: string
  description?: string
  priority?: number
  assigned_to?: string
  entity_id?: string
  entity_type?: string
  workflow_data?: Record<string, unknown>
  approval_chain?: ApprovalStep[]
  due_date?: string
}

/**
 * Update Workflow Request
 */
export interface UpdateWorkflowRequest {
  title?: string
  description?: string
  priority?: number
  assigned_to?: string
  workflow_data?: Record<string, unknown>
  approval_chain?: ApprovalStep[]
  due_date?: string
}

/**
 * Submit Workflow Request
 */
export interface SubmitWorkflowRequest {
  comments?: string
}

/**
 * Approve Workflow Request
 */
export interface ApproveWorkflowRequest {
  comments: string
}

/**
 * Reject Workflow Request
 */
export interface RejectWorkflowRequest {
  rejection_reason: string
  comments?: string
}

/**
 * Escalate Workflow Request
 */
export interface EscalateWorkflowRequest {
  escalation_level: number
  reason: string
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
}

/**
 * Workflow Filter Parameters
 */
export interface WorkflowFilterParams {
  /** Search term */
  search?: string
  /** Filter by workflow type */
  workflow_type?: string
  /** Filter by workflow state */
  workflow_state?: string
  /** Filter by priority */
  priority?: number
  /** Filter by assignee */
  assigned_to?: string
  /** Filter by initiator */
  initiated_by?: string
  /** Filter by entity type */
  entity_type?: string
  /** Filter by entity ID */
  entity_id?: string
  /** Filter workflows due before date */
  due_before?: string
  /** Filter workflows due after date */
  due_after?: string
  /** Show only my workflows */
  my_workflows?: boolean
  /** Show only pending approvals */
  pending_approvals?: boolean
  /** Show only overdue workflows */
  overdue_only?: boolean
  /** Page number */
  page?: number
  /** Items per page */
  limit?: number
  /** Sort field */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'ASC' | 'DESC'
}

/**
 * Workflow State Transition Map
 * Defines valid transitions from each state
 */
export const VALID_WORKFLOW_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Submitted'],
  Submitted: ['InReview'],
  InReview: ['Approved', 'Rejected', 'Escalated', 'AwaitingInput'],
  Approved: ['Completed'],
  Rejected: ['Draft'],
  Completed: ['Archived'],
  Archived: [],
  Cancelled: [],
  Expired: [],
  AwaitingInput: ['InReview', 'Cancelled'],
  ParallelReview: ['Approved', 'Rejected'],
}

/**
 * Workflow State Labels (for display)
 */
export const WORKFLOW_STATE_LABELS: Record<string, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  InReview: 'In Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Completed: 'Completed',
  Archived: 'Archived',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
  AwaitingInput: 'Awaiting Input',
  ParallelReview: 'Parallel Review',
}

/**
 * Workflow State Colors (for display)
 */
export const WORKFLOW_STATE_COLORS: Record<string, string> = {
  Draft: 'grey',
  Submitted: 'blue',
  InReview: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Completed: 'green',
  Archived: 'brown',
  Cancelled: 'grey',
  Expired: 'red',
  AwaitingInput: 'yellow',
  ParallelReview: 'purple',
}

/**
 * Workflow Type Labels (for display)
 */
export const WORKFLOW_TYPE_LABELS: Record<string, string> = {
  PolicyApproval: 'Policy Approval',
  RiskAssessment: 'Risk Assessment',
  BIAReview: 'BIA Review',
  BCPApproval: 'BCP Approval',
  StrategyApproval: 'Strategy Approval',
  TestReview: 'Test Review',
  IncidentManagement: 'Incident Management',
  ImprovementTracking: 'Improvement Tracking',
  TrainingAttestation: 'Training Attestation',
  ComplianceReview: 'Compliance Review',
}

/**
 * Workflow Priority Labels (for display)
 */
export const WORKFLOW_PRIORITY_LABELS: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Background',
}

/**
 * Workflow Priority Colors (for display)
 */
export const WORKFLOW_PRIORITY_COLORS: Record<number, string> = {
  1: 'red',
  2: 'orange',
  3: 'yellow',
  4: 'blue',
  5: 'grey',
}
