import type { BaseEntity } from '../../../core/base/base.entity';

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
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
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
// Core Types (camelCase aligned with backend)
// ============================================

export interface RuleCondition {
  field: string;
  operator: ComparisonOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export interface RuleAction {
  type: string;
  parameters: Record<string, any>;
  delay?: number;
}

export interface RuleSchedule {
  cron: string;
  timezone: string;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Rule Entity (camelCase aligned with backend)
// ============================================

export interface Rule extends BaseEntity {
  organisationId: string;
  name: string;
  description?: string;
  ruleType: RuleType;
  entityType?: string;
  triggerEvent: RuleTrigger;
  status: RuleStatus;
  priority: RulePriority;
  conditions: RuleCondition[];
  actions: RuleAction[];
  schedule?: RuleSchedule;
  isActive: boolean;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: Date;
  executionHistory?: Array<{
    executedAt: Date;
    success: boolean;
    message?: string;
    durationMs: number;
  }>;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================
// Execution Log Entity (camelCase aligned with backend)
// ============================================

export interface RuleExecutionLog extends BaseEntity {
  ruleId: string;
  entityId: string;
  entityType: string;
  success: boolean;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  executionTimeMs: number;
  executedAt: Date;
}

// ============================================
// DTOs (camelCase aligned with backend)
// ============================================

export interface RuleDto extends BaseEntity {
  name: string;
  description?: string;
  ruleType: RuleType;
  triggerEvent: RuleTrigger;
  status: RuleStatus;
  priority: RulePriority;
  conditions: RuleCondition[];
  actions: RuleAction[];
  schedule?: RuleSchedule;
  isActive: boolean;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  organisationId: string;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
}

export interface CreateRuleDto {
  name: string;
  description?: string;
  ruleType: RuleType;
  triggerEvent: RuleTrigger;
  priority?: RulePriority;
  conditions: RuleCondition[];
  actions: RuleAction[];
  schedule?: RuleSchedule;
  tags?: string[];
  metadata?: Record<string, any>;
  organisationId: string;
  timeoutSeconds?: number;
  retryCount?: number;
  retryDelaySeconds?: number;
}

export interface UpdateRuleDto {
  name?: string;
  description?: string;
  ruleType?: RuleType;
  triggerEvent?: RuleTrigger;
  priority?: RulePriority;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
  schedule?: RuleSchedule;
  isActive?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  timeoutSeconds?: number;
  retryCount?: number;
  retryDelaySeconds?: number;
}

export interface ExecuteRuleDto {
  context?: Record<string, any>;
  async?: boolean;
}

export interface RuleTestDto {
  context: Record<string, any>;
}

export interface RuleTestResultDto {
  matches: boolean;
  matchedConditions: RuleCondition[];
  failedConditions: RuleCondition[];
  actionsToExecute: RuleAction[];
  evaluationTimeMs: number;
}

export interface RuleQueryDto {
  organisationId?: string;
  ruleType?: RuleType;
  triggerEvent?: RuleTrigger;
  status?: RuleStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================
// Execution Log DTOs
// ============================================

export interface RuleExecutionLogDto extends BaseEntity {
  ruleId: string;
  entityId: string;
  entityType: string;
  success: boolean;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  executionTimeMs: number;
  executedAt: Date;
}

export interface CreateRuleExecutionLogDto {
  ruleId: string;
  entityId: string;
  entityType: string;
  success: boolean;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  executionTimeMs: number;
  executedAt?: Date;
}

export interface ExecutionLogQueryDto {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  entityId?: string;
  entityType?: string;
}

// ============================================
// Statistics DTOs
// ============================================

export interface RuleStatsDto {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  activeCount: number;
  inactiveCount: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTimeMs: number;
}

export interface RuleExecutionStatsDto {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  minExecutionTimeMs: number;
  lastExecutionAt: Date | null;
  executionsByDay: Array<{ date: string; count: number }>;
}

export interface RuleExecutionSummaryDto {
  ruleId: string;
  periodDays: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgExecutionTimeMs: number;
  executionTrend: Array<{
    date: string;
    successCount: number;
    failureCount: number;
  }>;
}

export interface GlobalExecutionStatsDto {
  totalExecutions: number;
  totalSuccessful: number;
  totalFailed: number;
  overallSuccessRate: number;
  avgExecutionTimeMs: number;
  executionsByRule: Array<{ ruleId: string; count: number }>;
  executionsByEntityType: Record<string, number>;
}

// ============================================
// Helper Functions
// ============================================

export function getRuleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VALIDATION: 'Validation',
    NOTIFICATION: 'Notification',
    APPROVAL: 'Approval',
    ESCALATION: 'Escalation',
    COMPLIANCE: 'Compliance',
    RISK_CALCULATION: 'Risk Calculation',
    BCM_AUTOMATION: 'BCM Automation',
    DOCUMENT_LIFECYCLE: 'Document Lifecycle',
    WORKFLOW_AUTOMATION: 'Workflow Automation',
    SYNC_VALIDATION: 'Sync Validation',
    ACCESS_CONTROL: 'Access Control',
    DATA_RETENTION: 'Data Retention',
    CUSTOM: 'Custom',
    ALERT: 'Alert',
    AUTOMATION: 'Automation',
    REMINDER: 'Reminder',
    SCHEDULED: 'Scheduled',
  };
  return labels[type] || type;
}

export function getRuleTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VALIDATION: 'blue',
    NOTIFICATION: 'green',
    APPROVAL: 'purple',
    ESCALATION: 'orange',
    COMPLIANCE: 'red',
    RISK_CALCULATION: 'brown',
    BCM_AUTOMATION: 'teal',
    WORKFLOW_AUTOMATION: 'deep-orange',
    CUSTOM: 'grey',
    ALERT: 'yellow',
    AUTOMATION: 'cyan',
    REMINDER: 'indigo',
    SCHEDULED: 'blue-grey',
  };
  return colors[type] || 'grey';
}

export function getRuleStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DRAFT: 'Draft',
    TESTING: 'Testing',
    ARCHIVED: 'Archived',
    DEPRECATED: 'Deprecated',
  };
  return labels[status] || status;
}

export function getRuleStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'grey',
    DRAFT: 'orange',
    TESTING: 'blue',
    ARCHIVED: 'brown',
    DEPRECATED: 'red',
  };
  return colors[status] || 'grey';
}

export function getRuleTriggerLabel(trigger: string): string {
  const labels: Record<string, string> = {
    ON_CREATE: 'On Create',
    ON_UPDATE: 'On Update',
    ON_DELETE: 'On Delete',
    ON_STATUS_CHANGE: 'On Status Change',
    ON_SCHEDULE: 'On Schedule',
    ON_THRESHOLD_BREACH: 'On Threshold Breach',
    ON_APPROVAL: 'On Approval',
    ON_REJECTION: 'On Rejection',
    ON_ESCALATION: 'On Escalation',
    ON_SYNC: 'On Sync',
    ON_MANUAL: 'Manual',
    ON_SAVE: 'On Save',
    SCHEDULED: 'Scheduled',
    ENTITY_CREATED: 'Entity Created',
    TIME_BASED: 'Time Based',
    ENTITY_UPDATED: 'Entity Updated',
  };
  return labels[trigger] || trigger;
}

export function getRulePriorityLabel(priority: string | number): string {
  const labels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[String(priority)] || String(priority);
}

export function getRulePriorityColor(priority: string | number): string {
  const colors: Record<string, string> = {
    LOW: 'grey',
    MEDIUM: 'blue',
    HIGH: 'orange',
    CRITICAL: 'red',
  };
  return colors[String(priority)] || 'grey';
}

export function getRuleActionTypeLabel(actionType: string): string {
  const labels: Record<string, string> = {
    SET_FIELD: 'Set Field',
    SEND_NOTIFICATION: 'Send Notification',
    CHANGE_STATUS: 'Change Status',
    CALCULATE_RISK: 'Calculate Risk',
    TRIGGER_WORKFLOW: 'Trigger Workflow',
    LOG_EVENT: 'Log Event',
    ESCALATE: 'Escalate',
  };
  return labels[actionType] || actionType;
}