// src/services/db/repositories/WorkflowRepository.ts

import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { Workflow } from './../../../../models/entities'

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
        const state = w.workflow_state
        return state === 'Draft' || state === 'Submitted' || state === 'InReview'
      })
      .toArray()
  }

  async findPendingApprovals(userId: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return (
          w.assigned_to === userId &&
          (w.workflow_state === 'Submitted' || w.workflow_state === 'InReview')
        )
      })
      .toArray()
  }

  async findOverdue(): Promise<Workflow[]> {
    const now = new Date().toISOString()

    return this.table
      .filter((w) => {
        const dueDate = w.due_date
        const completedAt = w.completed_at
        const state = w.workflow_state

        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }

        const isPastDue = dueDate < now
        const isNotCompleted = completedAt === null || completedAt === undefined
        const isNotTerminal = state !== 'Completed' && state !== 'Archived' && state !== 'Cancelled'

        return isPastDue && isNotCompleted && isNotTerminal
      })
      .toArray()
  }

  async findByPriority(priority: number): Promise<Workflow[]> {
    return this.findMany({ priority } as Partial<Workflow>)
  }

  async findByEntity(entityType: string, entityId: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return w.entity_type === entityType && w.entity_id === entityId
      })
      .toArray()
  }

  async findDueInDateRange(startDate: string, endDate: string): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        const dueDate = w.due_date
        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        return dueDate >= startDate && dueDate <= endDate
      })
      .toArray()
  }

  async findEscalated(): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        const level = w.escalation_level
        return typeof level === 'number' && level > 0
      })
      .toArray()
  }

  async findByEscalationLevel(level: number): Promise<Workflow[]> {
    return this.table
      .filter((w) => {
        return typeof w.escalation_level === 'number' && w.escalation_level === level
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
  async updateState(uuid: string, newState: string): Promise<void> {
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
    await this.updateState(uuid, 'Submitted')
  }

  /**
   * Start reviewing a workflow
   */
  async startReview(uuid: string, userId: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: 'InReview',
      assigned_to: userId,
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Approve a workflow
   */
  async approveWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, 'Approved')
  }

  /**
   * Reject a workflow with reason
   */
  async rejectWorkflow(uuid: string, reason: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: 'Rejected',
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
      workflow_state: 'Completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await this.table.update(uuid, updateData as any)
  }

  /**
   * Archive a workflow
   */
  async archiveWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, 'Archived')
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(uuid: string): Promise<void> {
    await this.updateState(uuid, 'Cancelled')
  }

  /**
   * Escalate a workflow
   */
  async escalateWorkflow(uuid: string, level: number): Promise<void> {
    const updateData: Record<string, unknown> = {
      workflow_state: 'Escalated',
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
      workflow_state: 'AwaitingInput',
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
    await this.updateState(uuid, 'Expired')
  }

  /**
   * Set workflow as awaiting input
   */
  async setAwaitingInput(uuid: string): Promise<void> {
    await this.updateState(uuid, 'AwaitingInput')
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
      if (w.workflow_type) {
        byType[w.workflow_type] = (byType[w.workflow_type] || 0) + 1
      }
      if (w.workflow_state) {
        byState[w.workflow_state] = (byState[w.workflow_state] || 0) + 1
      }
      if (typeof w.priority === 'number') {
        const key = String(w.priority)
        byPriority[key] = (byPriority[key] || 0) + 1
      }
    })

    return {
      total: all.length,
      pending: all.filter((w) => {
        const state = w.workflow_state
        return state === 'Submitted' || state === 'InReview'
      }).length,
      approved: all.filter((w) => w.workflow_state === 'Approved').length,
      rejected: all.filter((w) => w.workflow_state === 'Rejected').length,
      completed: all.filter((w) => w.workflow_state === 'Completed').length,
      overdue: all.filter((w) => {
        const dueDate = w.due_date
        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        const isPastDue = dueDate < now
        const isNotCompleted = w.completed_at === null || w.completed_at === undefined
        const isNotTerminal =
          w.workflow_state !== 'Completed' &&
          w.workflow_state !== 'Archived' &&
          w.workflow_state !== 'Cancelled'
        return isPastDue && isNotCompleted && isNotTerminal
      }).length,
      escalated: all.filter((w) => {
        return typeof w.escalation_level === 'number' && w.escalation_level > 0
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
        const state = w.workflow_state
        return state === 'Submitted' || state === 'InReview'
      }).length,
      approved: workflows.filter((w) => w.workflow_state === 'Approved').length,
      rejected: workflows.filter((w) => w.workflow_state === 'Rejected').length,
      overdue: workflows.filter((w) => {
        const dueDate = w.due_date
        if (typeof dueDate !== 'string' || dueDate.length === 0) {
          return false
        }
        const isPastDue = dueDate < now
        const isNotCompleted = w.completed_at === null || w.completed_at === undefined
        return isPastDue && isNotCompleted
      }).length,
    }
  }

  // ============================================
  // Count Methods
  // ============================================

  async getCountByState(state: string): Promise<number> {
    const results = await this.table.filter((w) => w.workflow_state === state).toArray()
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
    const results = await this.table.filter((w) => w.workflow_type === type).toArray()
    return results.length
  }

  async getCountByPriority(priority: number): Promise<number> {
    const results = await this.table.filter((w) => w.priority === priority).toArray()
    return results.length
  }
}
