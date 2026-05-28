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

export interface RuleTestRequest {
  rule_id: string
  test_data: Record<string, any>
  context: Record<string, any>
}

export interface RuleTestResult {
  triggered: boolean
  matched_conditions: RuleConditionMatch[]
  actions_executed: RuleActionExecution[]
  execution_time_ms: number
  logs: string[]
}

export interface RuleConditionMatch {
  condition: RuleCondition
  matched: boolean
  actual_value: any
  expected_value: any
}

export interface RuleActionExecution {
  action: RuleAction
  success: boolean
  result?: any
  error?: string
  execution_time_ms: number
}

export interface RuleValidationRequest {
  rule: Rule
  validate_syntax: boolean
  validate_logic: boolean
  test_with_sample?: Record<string, any>
}

export interface RuleValidationResult {
  valid: boolean
  syntax_errors: string[]
  logic_errors: string[]
  warnings: string[]
  performance_estimate_ms?: number
}

export interface RuleExecutionSchedule {
  rule_id: string
  cron_expression: string
  timezone: string
  last_run?: string
  next_run?: string
  is_active: boolean
  run_history: RuleScheduleRun[]
}

export interface RuleScheduleRun {
  scheduled_at: string
  executed_at?: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'
  error_message?: string
  execution_id?: string
}

export interface RuleQueryParams {
  rule_type?: string
  rule_trigger?: string
  status?: string
  entity_type?: string
  organisation_id?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export interface RuleExecutionQueryParams {
  rule_id?: string
  entity_id?: string
  entity_type?: string
  success?: boolean
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export interface RuleStatistics {
  total_rules: number
  active_rules: number
  by_type: Record<string, number>
  by_trigger: Record<string, number>
  total_executions: number
  success_rate: number
  average_execution_time_ms: number
}
