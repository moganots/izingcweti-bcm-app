import { BaseEntity } from '../../../core/base/base.entity'
import {
  RuleType,
  RuleTrigger,
  RuleStatus,
  RulePriority,
  LogicalOperator,
  ComparisonOperator,
} from '../enums/rule.enum'

export interface RuleCondition {
  field: string
  operator: ComparisonOperator
  value: any
  logicalOperator?: LogicalOperator
}

export interface RuleAction {
  type: string
  parameters: Record<string, any>
  delay?: number
}

export interface RuleSchedule {
  cron: string
  timezone: string
  startDate?: string
  endDate?: string
}

export interface Rule extends BaseEntity {
  name: string
  description?: string
  organisation_id: string
  rule_type: RuleType
  trigger_event: RuleTrigger
  status: RuleStatus
  priority: RulePriority
  conditions: RuleCondition[]
  actions: RuleAction[]
  schedule?: RuleSchedule
  is_active: boolean
  execution_count: number
  success_count: number
  failure_count: number
  last_executed_at?: string
  execution_history?: RuleExecutionHistory[]
  timeout_seconds: number
  retry_count: number
  retry_delay_seconds: number
  tags?: string[]
  metadata?: Record<string, any>
  created_by_user?: string
  updated_by_user?: string
}

export interface RuleExecutionHistory {
  executed_at: string
  success: boolean
  message?: string
  duration_ms: number
}

export interface RuleExecutionLog extends BaseEntity {
  rule_id: string
  entity_id: string
  entity_type: string
  success: boolean
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  execution_time_ms: number
  executed_at: string
}

export interface CreateRuleRequest {
  name: string
  description?: string
  organisation_id: string
  rule_type: RuleType
  trigger_event: RuleTrigger
  priority?: RulePriority
  conditions: RuleCondition[]
  actions: RuleAction[]
  schedule?: RuleSchedule
  timeout_seconds?: number
  retry_count?: number
  retry_delay_seconds?: number
  tags?: string[]
}

export interface UpdateRuleRequest {
  name?: string
  description?: string
  rule_type?: RuleType
  trigger_event?: RuleTrigger
  priority?: RulePriority
  conditions?: RuleCondition[]
  actions?: RuleAction[]
  schedule?: RuleSchedule
  timeout_seconds?: number
  retry_count?: number
  retry_delay_seconds?: number
  tags?: string[]
}
