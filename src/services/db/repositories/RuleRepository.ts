import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type { Rule, RuleExecutionLog } from '../../../models/entities/rules.entity'

/**
 * Rule Repository
 */
export class RuleRepository extends BaseRepository<Rule> {
  constructor(table: Table<Rule, string>) {
    super(table, 'rules')
  }

  async findByType(ruleType: string): Promise<Rule[]> {
    return this.findMany({ rule_type: ruleType } as Partial<Rule>)
  }

  async findByTrigger(trigger: string): Promise<Rule[]> {
    return this.findMany({ rule_trigger: trigger } as Partial<Rule>)
  }

  async findByEntityType(entityType: string): Promise<Rule[]> {
    return this.findMany({ entity_type: entityType } as Partial<Rule>)
  }

  async findActive(): Promise<Rule[]> {
    return this.findMany({ is_active: true, status: 'ACTIVE' } as Partial<Rule>)
  }

  async findByOrganisation(orgId: string): Promise<Rule[]> {
    return this.findMany({ organisation_id: orgId } as Partial<Rule>)
  }

  async getActiveByTriggerAndEntity(trigger: string, entityType: string): Promise<Rule[]> {
    return this.table
      .filter(
        (rule) =>
          rule.rule_trigger === trigger &&
          rule.entity_type === entityType &&
          rule.is_active &&
          rule.status === 'ACTIVE'
      )
      .toArray()
  }
}

/**
 * Rule Execution Log Repository
 */
export class RuleExecutionLogRepository extends BaseRepository<RuleExecutionLog> {
  constructor(table: Table<RuleExecutionLog, string>) {
    super(table, 'rule_execution_logs')
  }

  async findByRule(ruleId: string): Promise<RuleExecutionLog[]> {
    return this.findMany({ rule_id: ruleId } as Partial<RuleExecutionLog>)
  }

  async findByEntity(entityId: string): Promise<RuleExecutionLog[]> {
    return this.findMany({ entity_id: entityId } as Partial<RuleExecutionLog>)
  }

  async findSuccessful(): Promise<RuleExecutionLog[]> {
    return this.findMany({ success: true } as Partial<RuleExecutionLog>)
  }

  async findFailed(): Promise<RuleExecutionLog[]> {
    return this.findMany({ success: false } as Partial<RuleExecutionLog>)
  }

  async getRecent(limit: number = 50): Promise<RuleExecutionLog[]> {
    return this.table.orderBy('executed_at').reverse().limit(limit).toArray()
  }

  async cleanup(daysOld: number = 30): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)
    const cutoffStr = cutoff.toISOString()

    const oldLogs = await this.table.filter((log) => log.executed_at < cutoffStr).toArray()

    const ids = oldLogs.map((log) => log.uuid)
    await this.deleteMany(ids)

    return ids.length
  }
}
