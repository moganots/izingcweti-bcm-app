import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { Workflow, WorkflowPriority, WorkflowState } from './../../../../models/entities'

/**
 * Workflow Repository
 */
export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor(table: Table<Workflow, string>) {
    super(table, 'workflows')
  }

  // ============================================
  // Find Methods
  // ============================================

  async findByType(type: string): Promise<Workflow[]> {
    return this.findMany({ workflow_type: type } as Partial<Workflow>)
  }

  async findByState(state: string): Promise<Workflow[]> {
    return this.findMany({ workflow_state: state } as Partial<Workflow>)
  }

  async findByAssignee(userId: string): Promise<Workflow[]> {
    return this.findMany({ assigned_to: userId } as Partial<Workflow>)
  }

  async findByInitiator(userId: string): Promise<Workflow[]> {
    return this.findMany({ initiated_by: userId } as Partial<Workflow>)
  }

  async findPending(): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        const state = w.workflowState
        return state === WorkflowState.DRAFT || state === WorkflowState.SUBMITTED || state === WorkflowState.IN_REVIEW
      })
      .toArray()
  }

  async findPendingApprovals(userId: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return (
          w.assignedTo === userId &&
          (w.workflowState === WorkflowState.SUBMITTED || w.workflowState === WorkflowState.IN_REVIEW)
        )
      })
      .toArray()
  }

  async findOverdue(): Promise<Workflow[]> {
    const now = new Date().toISOString()

    return this.table
      .filter((w) => {
        const dueDate = (w as any)?.dueDate as string | null | undefined
        const completedAt = w.completedAt
        const state = w.workflowState

        if (!dueDate || typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }

        const isPastDue = dueDate < now
        const isNotCompleted = completedAt === null || completedAt === undefined
        const isNotTerminal = state !== WorkflowState.COMPLETED && state !== WorkflowState.ARCHIVED && state !== WorkflowState.CANCELLED

        return isPastDue && isNotCompleted && isNotTerminal
      })
      .toArray()
  }

  async findByPriority(priority: WorkflowPriority): Promise<Workflow[]> {
    return this.findMany({ priority } as Partial<Workflow>)
  }

  async findByEntity(entityType: string, entityId: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return w.entityType === entityType && w.entityId === entityId
      })
      .toArray()
  }

  async findDueInDateRange(startDate: string, endDate: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        const dueDate = (w as any)?.dueDate as string | undefined
        if (!dueDate || typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        return dueDate >= startDate && dueDate <= endDate
      })
      .toArray()
  }

  async findEscalated(): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        const level = w.escalationLevel
        return typeof level === 'number' && level > 0
      })
      .toArray()
  }

  async findByEscalationLevel(level: number): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return typeof w.escalationLevel === 'number' && w.escalationLevel === level
      })
      .toArray()
  }

  // ============================================
  // State Management Methods
  // ============================================
  // FIXED: Use Record<string, unknown> with as any to avoid circular type inference

  /**
   * Update workflow state
   */
  async updateState(uuid: string, newState: WorkflowState): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: newState,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Submit workflow for review
   */
  async submitWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.SUBMITTED)
  }

  /**
   * Start reviewing a workflow
   */
  async startReview(uuid: string, userId: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: WorkflowState.IN_REVIEW,
      assigned_to: userId,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Approve a workflow
   */
  async approveWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.APPROVED)
  }

  /**
   * Reject a workflow with reason
   */
  async rejectWorkflow(uuid: string, reason: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: WorkflowState.REJECTED,
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Complete a workflow
   */
  async completeWorkflow(uuid: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: WorkflowState.COMPLETED,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Archive a workflow
   */
  async archiveWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.ARCHIVED)
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.CANCELLED)
  }

  /**
   * Escalate a workflow
   */
  async escalateWorkflow(uuid: string, level: number): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: WorkflowState.ESCALATED,
      escalation_level: level,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Reassign a workflow to another user
   */
  async reassignWorkflow(uuid: string, newAssigneeId: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      assigned_to: newAssigneeId,
      workflow_state: WorkflowState.AWAITING_INPUT,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Add a comment to a workflow
   */
  async addComment(uuid: string, comment: Record<string, unknown>): Promise<void> {
    const workflow = await this.findById(uuid)
    if (!workflow) return

    const existingComments = Array.isArray(workflow.comments) ? workflow.comments : []
    const updatedComments = [...existingComments, comment]

    const updateData: Record<string, unknown> = {
      comments: updatedComments,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Update workflow priority
   */
  async updatePriority(uuid: string, priority: number): Promise<void> {
    const updateData: Record<string, unknown> = {
      priority,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Update workflow due date
   */
  async updateDueDate(uuid: string, dueDate: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      due_date: dueDate,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Set workflow as expired
   */
  async expireWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.EXPIRED)
  }

  /**
   * Set workflow as awaiting input
   */
  async setAwaitingInput(uuid: string): Promise<void> {
    await this.updateState(uuid, WorkflowState.AWAITING_INPUT)
  }

  /**
   * Update workflow data
   */
  async updateWorkflowData(uuid: string, data: Record<string, unknown>): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_data: data,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Update approval chain
   */
  async updateApprovalChain(uuid: string, approvalChain: Record<string, unknown>[]): Promise<void> {
    const updateData: Record<string, unknown> = {
      approval_chain: approvalChain,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  // ============================================
  // Statistics Methods
  // ============================================

  async getStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    completed: number
    overdue: number
    escalated: number
    byType: Record<string, number>
    byState: Record<string, number>
    byPriority: Record<string, number>
  }> {
    const all = await this.findAll()
    const now = new Date().toISOString()

    const byType: Record<string, number> = {}
    const byState: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    all.forEach((w) => {
      if (w.workflowType) {
        byType[w.workflowType] = (byType[w.workflowType] || 0) + 1
      }
      if (w.workflowState) {
        byState[w.workflowState] = (byState[w.workflowState] || 0) + 1
      }
      if (typeof w.priority === 'number') {
        const key = String(w.priority)
        byPriority[key] = (byPriority[key] || 0) + 1
      }
    })

    return {
      total: all.length,
      pending: all.filter((w) => {
        const state = w.workflowState
        return state === WorkflowState.SUBMITTED || state === WorkflowState.IN_REVIEW
      }).length,
      approved: all.filter((w) => w.workflowState === WorkflowState.APPROVED).length,
      rejected: all.filter((w) => w.workflowState === WorkflowState.REJECTED).length,
      completed: all.filter((w) => w.workflowState === WorkflowState.COMPLETED).length,
      overdue: all.filter((w) => {
        const dueDate = (w as any)?.dueDate as string | null | undefined
        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        const isPastDue = dueDate < now
        const isNotCompleted = w.completedAt === null || w.completedAt === undefined
        const isNotTerminal =
          w.workflowState !== WorkflowState.COMPLETED &&
          w.workflowState !== WorkflowState.ARCHIVED &&
          w.workflowState !== WorkflowState.CANCELLED
        return isPastDue && isNotCompleted && isNotTerminal
      }).length,
      escalated: all.filter((w) => {
        return typeof w.escalationLevel === 'number' && w.escalationLevel > 0
      }).length,
      byType,
      byState,
      byPriority,
    }
  }

  async getStatsByAssignee(userId: string): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    overdue: number
  }> {
    const workflows = await this.findByAssignee(userId)
    const now = new Date().toISOString()

    return {
      total: workflows.length,
      pending: workflows.filter((w) => {
        const state = w.workflowState
        return state === WorkflowState.SUBMITTED || state === WorkflowState.IN_REVIEW
      }).length,
      approved: workflows.filter((w) => w.workflowState === WorkflowState.APPROVED).length,
      rejected: workflows.filter((w) => w.workflowState === WorkflowState.REJECTED).length,
      overdue: workflows.filter((w) => {
        const dueDate = (w as any)?.dueDate as string | null | undefined
        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        const isPastDue = dueDate < now
        const isNotCompleted = w.completedAt === null || w.completedAt === undefined
        return isPastDue && isNotCompleted
      }).length,
    }
  }

  // ============================================
  // Count Methods
  // ============================================

  async getCountByState(state: WorkflowState): Promise<number> {
    const results = await this.table.filter((w) => w.workflowState === state).toArray()
    return results.length
  }

  async getPendingApprovalCount(userId: string): Promise<number> {
    const results = await this.findPendingApprovals(userId)
    return results.length
  }

  async getOverdueCount(): Promise<number> {
    const results = await this.findOverdue()
    return results.length
  }

  async getCountByType(type: string): Promise<number> {
    const results = await this.table.filter((w) => w.workflowType === type).toArray()
    return results.length
  }

  async getCountByPriority(priority: WorkflowPriority): Promise<number> {
    const results = await this.table.filter((w) => w.priority === priority).toArray()
    return results.length
  }
}
