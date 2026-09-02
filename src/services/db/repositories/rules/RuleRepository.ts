import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  Rule,
  RuleExecutionLog,
  RuleType,
  RuleTrigger,
  RuleStatus,
  RulePriority,
  RuleStatsDto,
  RuleExecutionStatsDto,
  RuleExecutionSummaryDto,
  GlobalExecutionStatsDto,
} from '../../../../models/entities'

/**
 * Rule Repository
 * Handles CRUD operations for Rule entities with camelCase field names
 * Aligned with rules.entity.ts
 */
export class RuleRepository extends BaseRepository<Rule> {
  constructor(table: Table<Rule, string>) {
    super(table, 'rules')
  }

  /**
   * Find rules by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Rule[]> {
    return this.findMany({ organisationId } as Partial<Rule>)
  }

  /**
   * Find rules by type
   */
  async findByType(ruleType: RuleType): Promise<Rule[]> {
    return this.findMany({ ruleType } as Partial<Rule>)
  }

  /**
   * Find rules by trigger event
   */
  async findByTrigger(triggerEvent: RuleTrigger): Promise<Rule[]> {
    return this.findMany({ triggerEvent } as Partial<Rule>)
  }

  /**
   * Find rules by status
   */
  async findByStatus(status: RuleStatus): Promise<Rule[]> {
    return this.findMany({ status } as Partial<Rule>)
  }

  /**
   * Find rules by priority
   */
  async findByPriority(priority: RulePriority): Promise<Rule[]> {
    return this.findMany({ priority } as Partial<Rule>)
  }

  /**
   * Find active rules
   */
  async findActive(): Promise<Rule[]> {
    return this.findMany({ isActive: true, status: RuleStatus.ACTIVE } as Partial<Rule>)
  }

  /**
   * Find rules by tags
   */
  async findByTags(tags: string[]): Promise<Rule[]> {
    const all = await this.findAll()
    return all.filter((rule) => {
      if (!rule.tags) return false
      return tags.some((tag) => rule.tags!.includes(tag))
    })
  }

  /**
   * Find rules by tag (single tag)
   */
  async findByTag(tag: string): Promise<Rule[]> {
    const all = await this.findAll()
    return all.filter((rule) => {
      if (!rule.tags) return false
      return rule.tags.includes(tag)
    })
  }

  /**
   * Find rules by name search
   */
  async searchByName(query: string): Promise<Rule[]> {
    const lower = query.toLowerCase()
    const all = await this.findAll()
    return all.filter((rule) =>
      rule.name?.toLowerCase().includes(lower) ||
      rule.description?.toLowerCase().includes(lower)
    )
  }

  /**
   * Get active rules by trigger and entity type
   */
  async getActiveByTriggerAndEntityType(
    triggerEvent: RuleTrigger,
    entityType: string
  ): Promise<Rule[]> {
    return this.table
      .filter((rule) => {
        return rule.triggerEvent === triggerEvent &&
          rule.entityType === entityType &&
          rule.isActive === true &&
          rule.status === RuleStatus.ACTIVE
      })
      .toArray()
  }

  /**
   * Get rules with execution count above threshold
   */
  async findByExecutionCount(minCount: number): Promise<Rule[]> {
    return this.table
      .filter((rule) => (rule.executionCount || 0) >= minCount)
      .toArray()
  }

  /**
   * Get rules with high failure rate
   */
  async findHighFailureRate(threshold: number = 0.3): Promise<Rule[]> {
    const all = await this.findAll()
    return all.filter((rule) => {
      const total = rule.executionCount || 0
      const failures = rule.failureCount || 0
      if (total === 0) return false
      return (failures / total) >= threshold
    })
  }

  /**
   * Get rules that haven't executed in a while
   */
  async findInactiveRules(days: number = 30): Promise<Rule[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return this.table
      .filter((rule) => {
        if (!rule.lastExecutedAt) return true
        const lastExec = rule.lastExecutedAt instanceof Date ? rule.lastExecutedAt : new Date(rule.lastExecutedAt)
        return lastExec < cutoff
      })
      .toArray()
  }

  /**
   * Get rules with schedule
   */
  async findWithSchedule(): Promise<Rule[]> {
    return this.table
      .filter((rule) => rule.schedule !== undefined && rule.schedule !== null)
      .toArray()
  }

  /**
   * Get rules by schedule cron pattern
   */
  async findByScheduleCron(cron: string): Promise<Rule[]> {
    return this.table
      .filter((rule) => rule.schedule?.cron === cron)
      .toArray()
  }

  /**
   * Get rule statistics
   * Returns stats matching RuleStatsDto
   */
  async getStats(organisationId?: string): Promise<RuleStatsDto> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    let totalExecutions = 0
    let totalSuccess = 0
    let totalFailure = 0
    let totalTime = 0
    let rulesWithTime = 0

    for (const rule of all) {
      // By type
      const type = rule.ruleType || 'UNKNOWN'
      byType[type] = (byType[type] || 0) + 1

      // By status
      const status = rule.status || RuleStatus.DRAFT
      byStatus[status] = (byStatus[status] || 0) + 1

      // By priority
      const priority = rule.priority || RulePriority.MEDIUM
      byPriority[priority] = (byPriority[priority] || 0) + 1

      // Execution stats
      totalExecutions += rule.executionCount || 0
      totalSuccess += rule.successCount || 0
      totalFailure += rule.failureCount || 0

      // Execution time (from execution history)
      if (rule.executionHistory && rule.executionHistory.length > 0) {
        for (const history of rule.executionHistory) {
          totalTime += history.durationMs || 0
          rulesWithTime++
        }
      }
    }

    const activeCount = all.filter((r) => r.isActive && r.status === RuleStatus.ACTIVE).length
    const inactiveCount = all.length - activeCount
    const successRate = totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 0
    const averageExecutionTime = rulesWithTime > 0 ? totalTime / rulesWithTime : 0

    return {
      total: all.length,
      byType,
      byStatus,
      byPriority,
      activeCount,
      inactiveCount,
      totalExecutions,
      successRate: Math.round(successRate * 100) / 100,
      averageExecutionTimeMs: Math.round(averageExecutionTime * 100) / 100,
    }
  }

  /**
   * Get rule execution statistics for a specific rule
   */
  async getRuleExecutionStats(ruleId: string): Promise<RuleExecutionStatsDto | null> {
    const rule = await this.findById(ruleId)
    if (!rule) return null

    const executionHistory = rule.executionHistory || []
    const totalExecutions = executionHistory.length
    const successfulExecutions = executionHistory.filter((h) => h.success).length
    const failedExecutions = totalExecutions - successfulExecutions
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0

    let totalTime = 0
    let maxTime = 0
    let minTime = Infinity

    for (const history of executionHistory) {
      const duration = history.durationMs || 0
      totalTime += duration
      if (duration > maxTime) maxTime = duration
      if (duration < minTime) minTime = duration
    }

    const avgTime = totalExecutions > 0 ? totalTime / totalExecutions : 0

    // Get last execution
    const sortedHistory = [...executionHistory].sort((a, b) => {
      const aDate = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime()
      const bDate = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime()
      return bDate - aDate
    })
    const lastExecutionAt = sortedHistory.length > 0 ? sortedHistory[0]!.executedAt : null

    // Group by day
    const executionsByDay: Record<string, number> = {}
    for (const history of executionHistory) {
      const date = history.executedAt instanceof Date ? history.executedAt : new Date(history.executedAt)
      const dayKey = date.toISOString().split('T')[0]!
      executionsByDay[dayKey] = (executionsByDay[dayKey] || 0) + 1
    }

    const executionsByDayArray = Object.entries(executionsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: Math.round(successRate * 100) / 100,
      avgExecutionTimeMs: Math.round(avgTime * 100) / 100,
      maxExecutionTimeMs: maxTime === Infinity ? 0 : maxTime,
      minExecutionTimeMs: minTime === Infinity ? 0 : minTime,
      lastExecutionAt: lastExecutionAt instanceof Date ? lastExecutionAt : (lastExecutionAt ? new Date(lastExecutionAt) : null),
      executionsByDay: executionsByDayArray,
    }
  }

  /**
   * Get execution summary for a rule over a period
   */
  async getRuleExecutionSummary(
    ruleId: string,
    periodDays: number = 30
  ): Promise<RuleExecutionSummaryDto | null> {
    const rule = await this.findById(ruleId)
    if (!rule) return null

    const executionHistory = rule.executionHistory || []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - periodDays)

    // Filter history within period
    const periodHistory = executionHistory.filter((h) => {
      const date = h.executedAt instanceof Date ? h.executedAt : new Date(h.executedAt)
      return date >= cutoff
    })

    const total = periodHistory.length
    const successful = periodHistory.filter((h) => h.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0

    let totalTime = 0
    for (const history of periodHistory) {
      totalTime += history.durationMs || 0
    }
    const avgTime = total > 0 ? totalTime / total : 0

    // Build trend
    const trendMap: Record<string, { successCount: number; failureCount: number }> = {}
    for (const history of periodHistory) {
      const date = history.executedAt instanceof Date ? history.executedAt : new Date(history.executedAt)
      const dayKey = date.toISOString().split('T')[0]!
      if (!trendMap[dayKey]) {
        trendMap[dayKey] = { successCount: 0, failureCount: 0 }
      }
      if (history.success) {
        trendMap[dayKey]!.successCount++
      } else {
        trendMap[dayKey]!.failureCount++
      }
    }

    const executionTrend = Object.entries(trendMap)
      .map(([date, counts]) => ({
        date,
        successCount: counts.successCount,
        failureCount: counts.failureCount
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      ruleId,
      periodDays,
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate: Math.round(successRate * 100) / 100,
      avgExecutionTimeMs: Math.round(avgTime * 100) / 100,
      executionTrend,
    }
  }

  /**
   * Get global execution statistics
   */
  async getGlobalExecutionStats(organisationId?: string): Promise<GlobalExecutionStatsDto> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    let totalExecutions = 0
    let totalSuccessful = 0
    let totalFailed = 0
    let totalTime = 0
    let executionsWithTime = 0

    const executionsByRule: Array<{ ruleId: string; count: number }> = []
    const executionsByEntityType: Record<string, number> = {}

    for (const rule of all) {
      const execCount = rule.executionCount || 0
      const successCount = rule.successCount || 0
      const failCount = rule.failureCount || 0

      totalExecutions += execCount
      totalSuccessful += successCount
      totalFailed += failCount

      if (execCount > 0) {
        executionsByRule.push({ ruleId: rule.uuid, count: execCount })
      }

      // Get entity type from rule (if available)
      // This would need to be stored on the rule or derived from execution logs
    }

    // Sort executions by rule
    executionsByRule.sort((a, b) => b.count - a.count)

    const overallSuccessRate = totalExecutions > 0 ? (totalSuccessful / totalExecutions) * 100 : 0
    const avgExecutionTime = executionsWithTime > 0 ? totalTime / executionsWithTime : 0

    return {
      totalExecutions,
      totalSuccessful,
      totalFailed,
      overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
      avgExecutionTimeMs: Math.round(avgExecutionTime * 100) / 100,
      executionsByRule: executionsByRule.slice(0, 20), // Top 20 rules
      executionsByEntityType,
    }
  }

  /**
   * Get rule execution history with pagination
   */
  async getExecutionHistory(
    ruleId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Rule['executionHistory']; total: number; page: number; limit: number }> {
    const rule = await this.findById(ruleId)
    if (!rule) {
      return { data: [], total: 0, page, limit }
    }

    const history = rule.executionHistory || []
    const total = history.length
    const start = (page - 1) * limit
    const end = start + limit

    // Sort by executedAt descending
    const sorted = [...history].sort((a, b) => {
      const aDate = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime()
      const bDate = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime()
      return bDate - aDate
    })

    const data = sorted.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Update rule execution statistics
   */
  async updateExecutionStats(
    ruleId: string,
    success: boolean,
    durationMs: number,
    message?: string
  ): Promise<Rule | null> {
    const rule = await this.findById(ruleId)
    if (!rule) return null

    const executionCount = (rule.executionCount || 0) + 1
    const successCount = success ? (rule.successCount || 0) + 1 : rule.successCount || 0
    const failureCount = !success ? (rule.failureCount || 0) + 1 : rule.failureCount || 0

    const historyEntry: {
      executedAt: Date
      success: boolean
      message?: string
      durationMs: number
    } = {
      executedAt: new Date(),
      success,
      durationMs,
      ...(message !== undefined ? { message } : {}),
    }

    const executionHistory = rule.executionHistory || []
    executionHistory.push(historyEntry)

    // Keep only last 1000 entries for performance
    if (executionHistory.length > 1000) {
      executionHistory.splice(0, executionHistory.length - 1000)
    }

    const updatedRule = await this.update(ruleId, {
      executionCount,
      successCount,
      failureCount,
      lastExecutedAt: new Date(),
      executionHistory,
    } as Partial<Rule>)

    return updatedRule ?? null
  }

  /**
   * Increment execution count (simple increment without history)
   */
  async incrementExecutionCount(ruleId: string, success: boolean): Promise<void> {
    const rule = await this.findById(ruleId)
    if (!rule) return

    const executionCount = (rule.executionCount || 0) + 1
    const successCount = success ? (rule.successCount || 0) + 1 : rule.successCount || 0
    const failureCount = !success ? (rule.failureCount || 0) + 1 : rule.failureCount || 0

    await this.update(ruleId, {
      executionCount,
      successCount,
      failureCount,
      lastExecutedAt: new Date(),
    } as Partial<Rule>)
  }

  /**
   * Clear execution history for a rule
   */
  async clearExecutionHistory(ruleId: string): Promise<Rule | null> {
    const updatedRule = await this.update(ruleId, {
      executionHistory: [],
    } as Partial<Rule>)

    return updatedRule ?? null
  }

  /**
   * Get rules by execution time range
   */
  async findByExecutionTimeRange(minMs: number, maxMs: number): Promise<Rule[]> {
    const all = await this.findAll()
    return all.filter((rule) => {
      if (!rule.executionHistory || rule.executionHistory.length === 0) return false
      const avgTime = rule.executionHistory.reduce((sum, h) => sum + (h.durationMs || 0), 0) / rule.executionHistory.length
      return avgTime >= minMs && avgTime <= maxMs
    })
  }

  /**
   * Get rules by success rate
   */
  async findBySuccessRateRange(minRate: number, maxRate: number): Promise<Rule[]> {
    const all = await this.findAll()
    return all.filter((rule) => {
      const total = rule.executionCount || 0
      if (total === 0) return false
      const rate = (rule.successCount || 0) / total
      return rate >= minRate && rate <= maxRate
    })
  }

  /**
   * Activate a rule
   */
  async activate(ruleId: string, userId: string = 'system'): Promise<Rule | null> {
    const result = await this.update(ruleId, {
      status: RuleStatus.ACTIVE,
      isActive: true,
      updatedBy: userId,
      updatedAt: new Date(),
    } as unknown as Partial<Rule>)
    return result || null
  }

  /**
   * Deactivate a rule
   */
  async deactivate(ruleId: string, userId: string = 'system'): Promise<Rule | null> {
    const result = await this.update(ruleId, {
      status: RuleStatus.INACTIVE,
      isActive: false,
      updatedBy: userId,
      updatedAt: new Date(),
    } as unknown as Partial<Rule>)
    return result || null
  }

  /**
   * Archive a rule
   */
  async archive(ruleId: string, userId: string = 'system'): Promise<Rule | null> {
    const result = await this.update(ruleId, {
      status: RuleStatus.ARCHIVED,
      isActive: false,
      updatedBy: userId,
      updatedAt: new Date(),
    } as unknown as Partial<Rule>)
    return result || null
  }

  /**
   * Get rules count by type
   */
  async countByType(): Promise<Record<RuleType, number>> {
    const all = await this.findAll()
    const counts: Record<RuleType, number> = {
      [RuleType.VALIDATION]: 0,
      [RuleType.NOTIFICATION]: 0,
      [RuleType.APPROVAL]: 0,
      [RuleType.ESCALATION]: 0,
      [RuleType.COMPLIANCE]: 0,
      [RuleType.RISK_CALCULATION]: 0,
      [RuleType.BCM_AUTOMATION]: 0,
      [RuleType.DOCUMENT_LIFECYCLE]: 0,
      [RuleType.WORKFLOW_AUTOMATION]: 0,
      [RuleType.SYNC_VALIDATION]: 0,
      [RuleType.ACCESS_CONTROL]: 0,
      [RuleType.DATA_RETENTION]: 0,
      [RuleType.CUSTOM]: 0,
      [RuleType.ALERT]: 0,
      [RuleType.AUTOMATION]: 0,
      [RuleType.REMINDER]: 0,
      [RuleType.SCHEDULED]: 0,
    }

    for (const rule of all) {
      const type = rule.ruleType || RuleType.CUSTOM
      counts[type] = (counts[type] || 0) + 1
    }

    return counts
  }

  /**
   * Get rules count by status
   */
  async countByStatus(): Promise<Record<RuleStatus, number>> {
    const all = await this.findAll()
    const counts: Record<RuleStatus, number> = {
      [RuleStatus.ACTIVE]: 0,
      [RuleStatus.INACTIVE]: 0,
      [RuleStatus.DRAFT]: 0,
      [RuleStatus.TESTING]: 0,
      [RuleStatus.ARCHIVED]: 0,
      [RuleStatus.DEPRECATED]: 0,
    }

    for (const rule of all) {
      const status = rule.status || RuleStatus.DRAFT
      counts[status] = (counts[status] || 0) + 1
    }

    return counts
  }

  /**
   * Get rules by priority distribution
   */
  async getPriorityDistribution(): Promise<Record<RulePriority, number>> {
    const all = await this.findAll()
    const counts: Record<RulePriority, number> = {
      [RulePriority.LOW]: 0,
      [RulePriority.MEDIUM]: 0,
      [RulePriority.HIGH]: 0,
      [RulePriority.CRITICAL]: 0,
    }

    for (const rule of all) {
      const priority = rule.priority || RulePriority.MEDIUM
      counts[priority] = (counts[priority] || 0) + 1
    }

    return counts
  }
}

/**
 * Rule Execution Log Repository
 * Handles CRUD operations for RuleExecutionLog entities with camelCase field names
 */
export class RuleExecutionLogRepository extends BaseRepository<RuleExecutionLog> {
  constructor(table: Table<RuleExecutionLog, string>) {
    super(table, 'rule_execution_logs')
  }

  /**
   * Find logs by rule ID
   */
  async findByRule(ruleId: string): Promise<RuleExecutionLog[]> {
    return this.findMany({ ruleId } as Partial<RuleExecutionLog>)
  }

  /**
   * Find logs by entity ID
   */
  async findByEntity(entityId: string): Promise<RuleExecutionLog[]> {
    return this.findMany({ entityId } as Partial<RuleExecutionLog>)
  }

  /**
   * Find logs by entity type
   */
  async findByEntityType(entityType: string): Promise<RuleExecutionLog[]> {
    return this.findMany({ entityType } as Partial<RuleExecutionLog>)
  }

  /**
   * Find successful logs
   */
  async findSuccessful(): Promise<RuleExecutionLog[]> {
    return this.findMany({ success: true } as Partial<RuleExecutionLog>)
  }

  /**
   * Find failed logs
   */
  async findFailed(): Promise<RuleExecutionLog[]> {
    return this.findMany({ success: false } as Partial<RuleExecutionLog>)
  }

  /**
   * Find logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<RuleExecutionLog[]> {
    const all = await this.findAll()
    return all.filter((log) => {
      const date = log.executedAt instanceof Date ? log.executedAt : new Date(log.executedAt)
      return date >= startDate && date <= endDate
    })
  }

  /**
   * Get recent logs
   */
  async getRecent(limit: number = 50): Promise<RuleExecutionLog[]> {
    const all = await this.findAll()
    return all
      .sort((a, b) => {
        const aDate = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime()
        const bDate = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime()
        return bDate - aDate
      })
      .slice(0, limit)
  }

  /**
   * Get logs by execution time range
   */
  async findByExecutionTimeRange(minMs: number, maxMs: number): Promise<RuleExecutionLog[]> {
    const all = await this.findAll()
    return all.filter((log) => {
      const time = log.executionTimeMs || 0
      return time >= minMs && time <= maxMs
    })
  }

  /**
   * Get logs with errors
   */
  async findWithErrors(): Promise<RuleExecutionLog[]> {
    return this.table
      .filter((log) => log.errorMessage !== undefined && log.errorMessage !== null && log.errorMessage.length > 0)
      .toArray()
  }

  /**
   * Get execution statistics
   */
  async getStats(ruleId?: string): Promise<{
    total: number
    successful: number
    failed: number
    successRate: number
    avgExecutionTimeMs: number
  }> {
    let all = await this.findAll()
    if (ruleId) {
      all = all.filter((log) => log.ruleId === ruleId)
    }

    const total = all.length
    const successful = all.filter((log) => log.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0

    let totalTime = 0
    for (const log of all) {
      totalTime += log.executionTimeMs || 0
    }
    const avgExecutionTime = total > 0 ? totalTime / total : 0

    return {
      total,
      successful,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      avgExecutionTimeMs: Math.round(avgExecutionTime * 100) / 100,
    }
  }

  /**
   * Delete logs older than days
   */
  async cleanup(daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)

    const all = await this.findAll()
    const oldLogs = all.filter((log) => {
      const date = log.executedAt instanceof Date ? log.executedAt : new Date(log.executedAt)
      return date < cutoff
    })

    if (oldLogs.length > 0) {
      const ids = oldLogs.map((log) => log.uuid)
      await this.deleteMany(ids)
    }

    return oldLogs.length
  }

  /**
   * Get logs by rule and date range
   */
  async findByRuleAndDateRange(
    ruleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RuleExecutionLog[]> {
    const all = await this.findAll()
    return all.filter((log) => {
      const date = log.executedAt instanceof Date ? log.executedAt : new Date(log.executedAt)
      return log.ruleId === ruleId && date >= startDate && date <= endDate
    })
  }

  /**
   * Get logs with pagination
   */
  async getWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      ruleId?: string
      entityId?: string
      entityType?: string
      success?: boolean
      startDate?: Date
      endDate?: Date
    }
  ): Promise<{ data: RuleExecutionLog[]; total: number; page: number; limit: number }> {
    let results = await this.findAll()

    // Apply filters
    if (filters?.ruleId) {
      results = results.filter((log) => log.ruleId === filters.ruleId)
    }
    if (filters?.entityId) {
      results = results.filter((log) => log.entityId === filters.entityId)
    }
    if (filters?.entityType) {
      results = results.filter((log) => log.entityType === filters.entityType)
    }
    if (filters?.success !== undefined) {
      results = results.filter((log) => log.success === filters.success)
    }
    if (filters?.startDate) {
      results = results.filter((log) => {
        const date = log.executedAt instanceof Date ? log.executedAt : new Date(log.executedAt)
        return date >= filters.startDate!
      })
    }
    if (filters?.endDate) {
      results = results.filter((log) => {
        const date = log.executedAt instanceof Date ? log.executedAt : new Date(log.executedAt)
        return date <= filters.endDate!
      })
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    // Sort by executedAt descending
    const sorted = results.sort((a, b) => {
      const aDate = a.executedAt instanceof Date ? a.executedAt.getTime() : new Date(a.executedAt).getTime()
      const bDate = b.executedAt instanceof Date ? b.executedAt.getTime() : new Date(b.executedAt).getTime()
      return bDate - aDate
    })

    const data = sorted.slice(start, end)

    return { data, total, page, limit }
  }
}