import type { BaseEntity } from '@/types/common/base.entity';

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