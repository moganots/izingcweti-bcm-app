import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";
import type { EntityType } from "../audit/audit.entity";

// ============================================
// Rule Module - Enums (Aligned with Backend)
// ============================================

export enum RuleType {
  VALIDATION = "Validation",
  NOTIFICATION = "Notification",
  APPROVAL = "Approval",
  ESCALATION = "Escalation",
  COMPLIANCE = "Compliance",
  RISK_CALCULATION = "RiskCalculation",
  BCM_AUTOMATION = "BcmAutomation",
  DOCUMENT_LIFECYCLE = "DocumentLifecycle",
  WORKFLOW_AUTOMATION = "WorkflowAutomation",
  SYNC_VALIDATION = "SyncValidation",
  ACCESS_CONTROL = "AccessControl",
  DATA_RETENTION = "DataRetention",
  CUSTOM = "Custom",
  ALERT = "Alert",
  AUTOMATION = "Automation",
  REMINDER = "Reminder",
  SCHEDULED = "Scheduled",
}

export enum RuleTrigger {
  ON_CREATE = "OnCreate",
  ON_UPDATE = "OnUpdate",
  ON_DELETE = "OnDelete",
  ON_STATUS_CHANGE = "OnStatusChange",
  ON_SCHEDULE = "OnSchedule",
  ON_THRESHOLD_BREACH = "OnThresholdBreach",
  ON_APPROVAL = "OnApproval",
  ON_REJECTION = "OnRejection",
  ON_ESCALATION = "OnEscalation",
  ON_SYNC = "OnSync",
  ON_MANUAL = "OnManual",
  ON_SAVE = "OnSave",
  SCHEDULED = "Scheduled",
  ENTITY_CREATED = "EntityCreated",
  TIME_BASED = "TimeBased",
  ENTITY_UPDATED = "EntityUpdated",
}

export enum RuleStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  DRAFT = "Draft",
  TESTING = "Testing",
  ARCHIVED = "Archived",
  DEPRECATED = "Deprecated",
}

export enum RulePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export enum LogicalOperator {
  AND = "And",
  OR = "Or",
  NOT = "Not",
}

export enum ComparisonOperator {
  EQUALS = "Equals",
  NOT_EQUALS = "NotEquals",
  GREATER_THAN = "GreaterThan",
  LESS_THAN = "LessThan",
  GREATER_THAN_OR_EQUAL = "GreaterThanOrEqual",
  LESS_THAN_OR_EQUAL = "LessThanOrEqual",
  CONTAINS = "Contains",
  NOT_CONTAINS = "NotContains",
  IN = "In",
  NOT_IN = "NotIn",
  BETWEEN = "Between",
  EXISTS = "Exists",
  MATCHES_REGEX = "MatchesRegex",
}

// ============================================
// Rule Entity - Aligned with Backend
// Backend: src/modules/rules/models/entities/rule.entity.ts
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

export interface ExecutionHistoryEntry {
  executedAt: Date;
  success: boolean;
  message?: string;
  durationMs: number;
}

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
  executionHistory?: ExecutionHistoryEntry[];
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  tags?: string[];
  metadata?: Record<string, any>;

  // Relationships
  organisation?: Organisation;
  creator?: User;
  updater?: User;
}

// ============================================
// Rule Execution Log Entity - Aligned with Backend
// Backend: src/modules/rules/models/entities/rule-execution-log.entity.ts
// ============================================

export interface RuleExecutionLog extends BaseEntity {
  ruleId: string;
  entityId: string;
  entityType: EntityType;
  success: boolean;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  executionTimeMs: number;
  executedAt: Date;

  // Relationships
  rule?: Rule;
}

// ============================================
// Helper Functions
// ============================================

export function getRuleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VALIDATION: "Validation",
    NOTIFICATION: "Notification",
    APPROVAL: "Approval",
    ESCALATION: "Escalation",
    COMPLIANCE: "Compliance",
    RISK_CALCULATION: "Risk Calculation",
    BCM_AUTOMATION: "BCM Automation",
    DOCUMENT_LIFECYCLE: "Document Lifecycle",
    WORKFLOW_AUTOMATION: "Workflow Automation",
    SYNC_VALIDATION: "Sync Validation",
    ACCESS_CONTROL: "Access Control",
    DATA_RETENTION: "Data Retention",
    CUSTOM: "Custom",
    ALERT: "Alert",
    AUTOMATION: "Automation",
    REMINDER: "Reminder",
    SCHEDULED: "Scheduled",
  };
  return labels[type] || type;
}

export function getRuleTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VALIDATION: "blue",
    NOTIFICATION: "green",
    APPROVAL: "purple",
    ESCALATION: "orange",
    COMPLIANCE: "red",
    RISK_CALCULATION: "brown",
    BCM_AUTOMATION: "teal",
    WORKFLOW_AUTOMATION: "deep-orange",
    CUSTOM: "grey",
    ALERT: "yellow",
    AUTOMATION: "cyan",
    REMINDER: "indigo",
    SCHEDULED: "blue-grey",
  };
  return colors[type] || "grey";
}

export function getRuleStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DRAFT: "Draft",
    TESTING: "Testing",
    ARCHIVED: "Archived",
    DEPRECATED: "Deprecated",
  };
  return labels[status] || status;
}

export function getRuleStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "green",
    INACTIVE: "grey",
    DRAFT: "orange",
    TESTING: "blue",
    ARCHIVED: "brown",
    DEPRECATED: "red",
  };
  return colors[status] || "grey";
}

export function getRuleTriggerLabel(trigger: string): string {
  const labels: Record<string, string> = {
    ON_CREATE: "On Create",
    ON_UPDATE: "On Update",
    ON_DELETE: "On Delete",
    ON_STATUS_CHANGE: "On Status Change",
    ON_SCHEDULE: "On Schedule",
    ON_THRESHOLD_BREACH: "On Threshold Breach",
    ON_APPROVAL: "On Approval",
    ON_REJECTION: "On Rejection",
    ON_ESCALATION: "On Escalation",
    ON_SYNC: "On Sync",
    ON_MANUAL: "Manual",
    ON_SAVE: "On Save",
    SCHEDULED: "Scheduled",
    ENTITY_CREATED: "Entity Created",
    TIME_BASED: "Time Based",
    ENTITY_UPDATED: "Entity Updated",
  };
  return labels[trigger] || trigger;
}

export function getRulePriorityLabel(priority: string | number): string {
  const labels: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  };
  return labels[String(priority)] || String(priority);
}

export function getRulePriorityColor(priority: string | number): string {
  const colors: Record<string, string> = {
    LOW: "grey",
    MEDIUM: "blue",
    HIGH: "orange",
    CRITICAL: "red",
  };
  return colors[String(priority)] || "grey";
}

export function getRuleActionTypeLabel(actionType: string): string {
  const labels: Record<string, string> = {
    SET_FIELD: "Set Field",
    SEND_NOTIFICATION: "Send Notification",
    CHANGE_STATUS: "Change Status",
    CALCULATE_RISK: "Calculate Risk",
    TRIGGER_WORKFLOW: "Trigger Workflow",
    LOG_EVENT: "Log Event",
    ESCALATE: "Escalate",
  };
  return labels[actionType] || actionType;
}