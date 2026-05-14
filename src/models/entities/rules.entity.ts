import { SyncStatus } from './sync.entity'

/**
 * Rule Type Enum
 */
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
}

/**
 * Rule Trigger Enum
 */
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
}

/**
 * Rule Status Enum
 */
export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  TESTING = 'TESTING',
  DEPRECATED = 'DEPRECATED',
}

/**
 * Rule Priority Enum
 */
export enum RulePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * Comparison Operator Enum
 */
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

/**
 * Logical Operator Enum
 */
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

/**
 * Rule Entity
 */
export interface Rule {
  uuid: string
  name: string
  description?: string | null
  rule_type: RuleType
  rule_trigger: RuleTrigger
  status: RuleStatus
  priority: RulePriority
  entity_type: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  is_active: boolean
  execution_count: number
  last_executed_at?: string | null
  failure_count: number
  organisation_id?: string | null
  error_log?: RuleError[]
  version: number
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  sync_status: SyncStatus
}

/**
 * Rule Condition
 */
export interface RuleCondition {
  field: string
  operator: ComparisonOperator
  value: any
  logical_operator?: LogicalOperator
  conditions?: RuleCondition[]
}

/**
 * Rule Action
 */
export interface RuleAction {
  type: string
  params: Record<string, any>
  order?: number
  condition?: RuleCondition
}

/**
 * Rule Error
 */
export interface RuleError {
  timestamp: string
  error: string
  entity_id: string
  entity_type: string
}

/**
 * Rule Execution Log
 */
export interface RuleExecutionLog {
  uuid: string
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

/**
 * Create Rule DTO
 */
export interface CreateRuleDTO {
  name: string
  description?: string
  rule_type: RuleType
  rule_trigger: RuleTrigger
  priority?: RulePriority
  entity_type: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  organisation_id?: string
  is_active?: boolean
}

/**
 * Test Rule DTO
 */
export interface TestRuleDTO {
  conditions: RuleCondition[]
  actions: RuleAction[]
  test_data: Record<string, any>
}

/**
 * Test Rule Result
 */
export interface TestRuleResult {
  success: boolean
  conditions_met: boolean
  execution_time_ms: number
  results: RuleActionResult[]
  error?: string
}

/**
 * Rule Action Result
 */
export interface RuleActionResult {
  action: string
  success: boolean
  result: any
}

/**
 * Rule Stats
 */
export interface RuleStats {
  total_rules: number
  active_rules: number
  total_executions: number
  total_failures: number
  success_rate: number
  by_type: Record<string, number>
  by_status: Record<string, number>
}
