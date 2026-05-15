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
 */
export interface Workflow {
  uuid: string
  workflow_type: string
  workflow_state: string
  priority: number
  title: string
  description?: string | null
  initiated_by: string
  initiator_name?: string | null
  assigned_to?: string | null
  assignee_name?: string | null
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
  order: number
  approver_id: string
  approver_name?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  timestamp?: string
  comments?: string
  required_role?: string
}

/**
 * Comment on a workflow
 */
export interface WorkflowComment {
  user_id: string
  user_name?: string
  comment: string
  timestamp: string
  action: 'COMMENT' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REASSIGN' | 'CANCEL'
  rejection_reason?: string
}

/**
 * Workflow Statistics
 */
export interface WorkflowStats {
  total: number
  pending: number
  submitted: number
  inReview: number
  approved: number
  rejected: number
  completed: number
  archived: number
  cancelled: number
  expired: number
  overdue: number
  escalated: number
  averageCompletionTime: number
  byType: Record<string, number>
  byState: Record<string, number>
  byPriority: Record<string, number>
  dueThisWeek: number
  severelyOverdue: number
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
  search?: string
  workflow_type?: string
  workflow_state?: string
  priority?: number
  assigned_to?: string
  initiated_by?: string
  entity_type?: string
  entity_id?: string
  due_before?: string
  due_after?: string
  my_workflows?: boolean
  pending_approvals?: boolean
  overdue_only?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

/**
 * Workflow State Transition Map
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
