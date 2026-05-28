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
