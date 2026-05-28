import { BaseEntity } from '../../../core/base/base.entity'
import { WorkflowType, WorkflowState, WorkflowPriority } from '../enums/workflow.enum'

export interface ApprovalStep {
  approver_id: string
  level: number
  status: 'pending' | 'approved' | 'rejected'
  approved_at?: string
  comments?: string
}

export interface WorkflowComment {
  user_id: string
  comment: string
  timestamp: string
  action?: string
}

export interface Workflow extends BaseEntity {
  workflow_type: WorkflowType
  workflow_state: WorkflowState
  priority: WorkflowPriority
  title: string
  description?: string
  initiated_by: string
  assigned_to?: string
  entity_id?: string
  entity_type?: string
  workflow_data?: Record<string, any>
  approval_chain?: ApprovalStep[]
  comments?: WorkflowComment[]
  due_date?: string
  completed_at?: string
  escalation_level: number
  rejection_reason?: string
  metadata?: Record<string, any>
}

export interface CreateWorkflowRequest {
  workflow_type: WorkflowType
  title: string
  description?: string
  priority?: WorkflowPriority
  assigned_to?: string
  entity_id?: string
  entity_type?: string
  due_date?: string
  approval_chain?: Omit<ApprovalStep, 'status'>[]
}

export interface ApproveWorkflowRequest {
  comments?: string
}

export interface RejectWorkflowRequest {
  rejection_reason: string
  comments?: string
}

export interface EscalateWorkflowRequest {
  escalation_level: number
  reason: string
}

export interface WorkflowTemplate extends BaseEntity {
  name: string
  description?: string
  workflow_type: string
  version: number
  is_active: boolean
  steps: WorkflowStep[]
  approval_rules: ApprovalRule[]
  notification_triggers: NotificationTrigger[]
  metadata?: Record<string, any>
}

export interface WorkflowStep {
  id: string
  name: string
  order: number
  type: 'APPROVAL' | 'REVIEW' | 'NOTIFICATION' | 'TASK' | 'AUTOMATION'
  assignee_type: 'USER' | 'ROLE' | 'MANAGER' | 'DYNAMIC'
  assignee_value?: string
  required_approvals: number
  timeout_hours?: number
  escalation_step_id?: string
  conditions?: WorkflowCondition[]
}

export interface WorkflowCondition {
  field: string
  operator: string
  value: any
}

export interface ApprovalRule {
  id: string
  name: string
  priority: number
  approvers: string[]
  requires_all: boolean
  conditions?: WorkflowCondition[]
}

export interface NotificationTrigger {
  id: string
  event: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'COMPLETED'
  recipients: string[]
  template_id: string
  delay_minutes?: number
}

export interface WorkflowActionResponse {
  workflow_id: string
  action: string
  success: boolean
  message?: string
  next_state?: string
  timestamp: string
}

export interface WorkflowMetrics {
  total_workflows: number
  active_workflows: number
  completed_workflows: number
  rejected_workflows: number
  average_completion_days: number
  average_approval_time_hours: number
  overdue_count: number
  escalation_count: number
  by_type: Record<string, WorkflowTypeMetrics>
}

export interface WorkflowTypeMetrics {
  total: number
  active: number
  completed: number
  rejected: number
  avg_completion_days: number
}

export interface WorkflowQueryParams {
  workflow_type?: string
  workflow_state?: string
  priority?: number
  assigned_to?: string
  initiated_by?: string
  entity_type?: string
  entity_id?: string
  due_before?: string
  due_after?: string
  my_approvals?: boolean
  my_workflows?: boolean
  overdue_only?: boolean
  escalated_only?: boolean
  escalation_level?: number
  page?: number
  limit?: number
}

export interface WorkflowStats {
  total: number
  by_state: Record<string, number>
  by_type: Record<string, number>
  by_priority: Record<string, number>
  average_completion_hours: number
  overdue_count: number
  escalated_count: number
  approval_rate: number
}
