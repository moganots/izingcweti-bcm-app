// ============================================
// Sync (Core - used by all entities)
// ============================================
export {
  SyncStatus,
  SyncPriority,
  OperationType,
  ConflictType,
  ConflictResolutionStrategy,
  NetworkStatus,
  type PendingChange,
  type SyncConflict,
  type SyncMetadata,
  type SyncState,
  type SyncPullResponse,
  type SyncChange,
  type SyncPushRequest,
  type SyncPushResponse,
  type NetworkInfo,
} from './sync/sync.entity'

// ============================================
// User & Auth
// ============================================
export {
  UserRole,
  type User,
  type LoginCredentials,
  type AuthTokens,
  type LoginResponse,
  type AuthState,
} from './user/user.entity'

// ============================================
// Organisation Structure
// ============================================
export {
  type Organisation,
  type BusinessUnit,
  type Department,
  type Document,
  type DocumentVersion,
  DocumentType,
  DocumentStatus,
  AccessLevel,
} from './organisation/organisation.entity'

// ============================================
// Settings
// ============================================
export {
  type UserPreferences,
  type NotificationSettings,
  type NotificationChannelSettings,
  type ThemeSettings,
  type LanguageSettings,
  type DisplaySettings,
  type SecuritySettings,
  type SyncSettings,
  type PrivacySettings,
  type Settings,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_LANGUAGE_SETTINGS,
  DEFAULT_DISPLAY_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
} from './settings/settings.entity'

// ============================================
// BCM (Business Continuity Management)
// ============================================
export {
  IndustryType,
  MaturityScore,
  CriticalityScore,
  BCMPlanStatus,
  RecoveryStrategyType,
  ExerciseTestType,
  ReputationalImpact,
  AuditAction,
  type CriticalFunction,
  type BusinessImpactAssessment,
  type BusinessContinuityPlan,
  type EmergencyContact,
  type RecoveryStrategy,
  type ExerciseTest,
  type ComplianceRecord as BCMComplianceRecord,
  ComplianceStandard as BCMComplianceStandard,
  ComplianceStatus as BCMComplianceStatus,
} from './bcm/bcm.entity'

// ============================================
// Risk Management
// ============================================
export {
  RiskCategory,
  ImpactSeverity,
  type Risk,
  type RiskMatrixCell,
  type RiskAssessment,
  type RiskStats,
} from './risk/risk.entity'

// ============================================
// Incident Management
// ============================================
export {
  IncidentSeverity,
  IncidentStatus,
  type Incident,
  type CreateIncidentDTO,
  type UpdateIncidentDTO,
  type CloseIncidentDTO,
  type IncidentStats,
} from './incident/incident.entity'

// ============================================
// Workflow
// ============================================
export {
  WorkflowState,
  WorkflowType,
  WorkflowPriority,
  type Workflow,
  type ApprovalStep,
  type WorkflowComment,
  type WorkflowStats,
  type CreateWorkflowRequest,
  type UpdateWorkflowRequest,
  type SubmitWorkflowRequest,
  type ApproveWorkflowRequest,
  type RejectWorkflowRequest,
  type EscalateWorkflowRequest,
  type ReassignWorkflowRequest,
  type AddCommentRequest,
  type WorkflowFilterParams,
  VALID_WORKFLOW_TRANSITIONS,
  WORKFLOW_STATE_LABELS,
  WORKFLOW_STATE_COLORS,
  WORKFLOW_TYPE_LABELS,
  WORKFLOW_PRIORITY_LABELS,
  WORKFLOW_PRIORITY_COLORS,
} from './workflow/workflow.entity'

// ============================================
// Notifications
// ============================================
export {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  type Notification,
  type NotificationPreference,
  type NotificationCounts,
  type CreateNotificationDTO,
} from './notification/notification.entity'

// ============================================
// Audit Logging
// ============================================
export {
  AuditSeverity,
  AuditCategory,
  type AuditLog,
  type AuditQueryParams,
  type AuditStats,
  type AuditRetentionPolicy,
} from './audit/audit.entity'

// ============================================
// Business Rules Engine
// ============================================
export {
  RuleType,
  RuleTrigger,
  RuleStatus,
  RulePriority,
  ComparisonOperator,
  LogicalOperator,
  type Rule,
  type RuleCondition,
  type RuleAction,
  type RuleError,
  type RuleExecutionLog,
  type CreateRuleDTO,
  type TestRuleDTO,
  type TestRuleResult,
  type RuleActionResult,
  type RuleStats,
} from './rules/rules.entity'

// ============================================
// Cache
// ============================================
export {
  type CacheEntry,
  type CacheStats,
  type CreateCacheDTO,
  type CacheQueryParams,
} from './cache/cache.entity'

// ============================================
// Compliance
// ============================================
export {
  ComplianceStandard,
  ComplianceStatus,
  type ComplianceRecord,
  type CreateComplianceRecordRequest,
  type UpdateComplianceRecordRequest,
  type UpdateComplianceStatusRequest,
  type AddEvidenceRequest,
  type RemoveEvidenceRequest,
  type ScheduleAuditRequest,
  type BulkUpdateStatusRequest,
  type ComplianceStats,
  type ComplianceGap,
  type ComplianceAuditEntry,
  type ComplianceExportRequest,
  type ComplianceFilterParams,
  type ComplianceAuditHistoryEntry,
  // Display constants
  COMPLIANCE_STANDARD_LABELS,
  COMPLIANCE_STANDARD_COLORS,
  COMPLIANCE_STANDARD_ICONS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_COLORS,
  COMPLIANCE_STATUS_ICONS,
  COMPLIANCE_STATUS_PROGRESS,
  COMPLIANCE_STATUS_DESCRIPTIONS,
  AUDIT_STATUS_LABELS,
  AUDIT_STATUS_COLORS,
  AUDIT_STATUS_ICONS,
  GAP_PRIORITY_LABELS,
  GAP_PRIORITY_COLORS,
  GAP_PRIORITY_ICONS,
  // Helper functions
  getComplianceStandardLabel,
  getComplianceStandardColor,
  getComplianceStandardIcon,
  getComplianceStatusLabel,
  getComplianceStatusColor,
  getComplianceStatusIcon,
  getComplianceStatusProgress,
  getComplianceStatusDescription,
  isAuditOverdue,
  isAuditDueSoon,
  calculateComplianceRate,
  formatComplianceStandard,
} from './compliance/compliance.entity'

// ============================================
// Entity Type Maps
// ============================================

/**
 * Map of entity type names to their corresponding TypeScript interfaces
 * Useful for dynamic entity handling in repositories and services
 */
export const ENTITY_TYPES = {
  USER: 'User',
  ORGANISATION: 'Organisation',
  BUSINESS_UNIT: 'BusinessUnit',
  DEPARTMENT: 'Department',
  DOCUMENT: 'Document',
  RISK: 'Risk',
  INCIDENT: 'Incident',
  WORKFLOW: 'Workflow',
  NOTIFICATION: 'Notification',
  AUDIT_LOG: 'AuditLog',
  COMPLIANCE_RECORD: 'ComplianceRecord',
  SETTINGS: 'Settings',
  CRITICAL_FUNCTION: 'CriticalFunction',
  BUSINESS_IMPACT_ASSESSMENT: 'BusinessImpactAssessment',
  BUSINESS_CONTINUITY_PLAN: 'BusinessContinuityPlan',
  RECOVERY_STRATEGY: 'RecoveryStrategy',
  EXERCISE_TEST: 'ExerciseTest',
  RULE: 'Rule',
  CACHE_ENTRY: 'CacheEntry',
  SYNC_CONFLICT: 'SyncConflict',
  PENDING_CHANGE: 'PendingChange',
  SYNC_METADATA: 'SyncMetadata',
} as const

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES]

/**
 * Get table name for an entity type
 */
export function getTableName(entityType: EntityType): string {
  const tableMap: Record<EntityType, string> = {
    [ENTITY_TYPES.USER]: 'users',
    [ENTITY_TYPES.ORGANISATION]: 'organisations',
    [ENTITY_TYPES.BUSINESS_UNIT]: 'business_units',
    [ENTITY_TYPES.DEPARTMENT]: 'departments',
    [ENTITY_TYPES.DOCUMENT]: 'documents',
    [ENTITY_TYPES.RISK]: 'risks',
    [ENTITY_TYPES.INCIDENT]: 'incidents',
    [ENTITY_TYPES.WORKFLOW]: 'workflows',
    [ENTITY_TYPES.NOTIFICATION]: 'notifications',
    [ENTITY_TYPES.AUDIT_LOG]: 'audit_logs',
    [ENTITY_TYPES.COMPLIANCE_RECORD]: 'compliance_records',
    [ENTITY_TYPES.SETTINGS]: 'settings',
    [ENTITY_TYPES.CRITICAL_FUNCTION]: 'critical_functions',
    [ENTITY_TYPES.BUSINESS_IMPACT_ASSESSMENT]: 'business_impact_assessments',
    [ENTITY_TYPES.BUSINESS_CONTINUITY_PLAN]: 'business_continuity_plans',
    [ENTITY_TYPES.RECOVERY_STRATEGY]: 'recovery_strategies',
    [ENTITY_TYPES.EXERCISE_TEST]: 'exercise_tests',
    [ENTITY_TYPES.RULE]: 'rules',
    [ENTITY_TYPES.CACHE_ENTRY]: 'cache',
    [ENTITY_TYPES.SYNC_CONFLICT]: 'sync_conflicts',
    [ENTITY_TYPES.PENDING_CHANGE]: 'pending_changes',
    [ENTITY_TYPES.SYNC_METADATA]: 'sync_metadata',
  }
  return tableMap[entityType] || entityType.toLowerCase()
}
