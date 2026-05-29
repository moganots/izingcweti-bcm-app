// ============================================
// Rule Module - Enums
// ============================================

export enum RuleType {
  VALIDATION = 'VALIDATION',
  NOTIFICATION = 'NOTIFICATION',
  APPROVAL = 'APPROVAL',
  ESCALATION = 'ESCALATION',
  COMPLIANCE = 'COMPLIANCE',
  RISK_CALCULATION = 'RISK_CALCULATION',
  BCM_AUTOMATION = 'BCM_AUTOMATION',
  DOCUMENT_LIFECYCLE = 'DOCUMENT_LIFECYCLE',
  WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
  SYNC_VALIDATION = 'SYNC_VALIDATION',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  DATA_RETENTION = 'DATA_RETENTION',
  CUSTOM = 'CUSTOM',
  ALERT = 'ALERT',
  AUTOMATION = 'AUTOMATION',
  REMINDER = 'REMINDER',
  SCHEDULED = 'SCHEDULED',
}

export enum RuleTrigger {
  ON_CREATE = 'ON_CREATE',
  ON_UPDATE = 'ON_UPDATE',
  ON_DELETE = 'ON_DELETE',
  ON_STATUS_CHANGE = 'ON_STATUS_CHANGE',
  ON_SCHEDULE = 'ON_SCHEDULE',
  ON_THRESHOLD_BREACH = 'ON_THRESHOLD_BREACH',
  ON_APPROVAL = 'ON_APPROVAL',
  ON_REJECTION = 'ON_REJECTION',
  ON_ESCALATION = 'ON_ESCALATION',
  ON_SYNC = 'ON_SYNC',
  ON_MANUAL = 'ON_MANUAL',
  ON_SAVE = 'ON_SAVE',
  SCHEDULED = 'SCHEDULED',
  ENTITY_CREATED = 'ENTITY_CREATED',
  TIME_BASED = 'TIME_BASED',
  ENTITY_UPDATED = 'ENTITY_UPDATED',
}

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  TESTING = 'TESTING',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
}

export enum RulePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

export enum ComparisonOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
  EXISTS = 'EXISTS',
  MATCHES_REGEX = 'MATCHES_REGEX',
}

// ============================================
// Rule Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

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

export interface RuleStatistics {
  total_rules: number
  active_rules: number
  by_type: Record<string, number>
  by_trigger: Record<string, number>
  total_executions: number
  success_rate: number
  average_execution_time_ms: number
}

// Request Types
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
