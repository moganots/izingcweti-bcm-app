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
  AuthTokenType,
  AuthTokenStatus,
  type User,
  type AuthTokenEntity,
  type SessionInfo,
  type LoginCredentials,
  type AuthTokens,
  type LoginResponse,
  type RegistrationData,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type AuthToken,
  type AuthState,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserQueryParams,
  type PaginatedResponse,
  type UserStats,
  type CreateAuthTokenRequest,
  type UpdateAuthTokenRequest,
  type BulkImportResult,
  type BulkUserUpdateRequest,
  type LockAccountRequest,
} from './user/user.entity'

// ============================================
// Organisation Structure
// ============================================
export {
  IndustryType,
  MaturityScore,
  CriticalityScore,
  type Organisation,
  type BusinessUnit,
  type Department,
  type OrganisationDto,
  type CreateOrganisationDto,
  type UpdateOrganisationDto,
  type OrganisationStatsDto,
  type BusinessUnitDto,
  type CreateBusinessUnitDto,
  type UpdateBusinessUnitDto,
  type BusinessUnitStatsDto,
  type DepartmentDto,
  type CreateDepartmentDto,
  type UpdateDepartmentDto,
  type ReorderDepartmentsDto,
  type DepartmentStatsDto,
  type OrganisationQueryParams,
  type BusinessUnitQueryParams,
  type DepartmentQueryParams,
  type DepartmentTreeNode,
  type OrganisationHierarchy,
  type OrganisationTree,
} from './organisation/organisation.entity'

// ============================================
// Document Management
// ============================================
export {
  DocumentType,
  DocumentStatus,
  AccessLevel,
  type Document,
  type ReviewHistoryEntry,
  type DocumentVersion,
  type DocumentTemplate,
  type DocumentStats,
  type CreateDocumentRequest,
  type UpdateDocumentRequest,
  type ApproveDocumentRequest,
  type RejectDocumentRequest,
  type DocumentVersionRequest,
  type DocumentSearchParams,
  type DocumentQueryParams,
  type DocumentBulkOperationRequest,
  type DocumentBulkOperationResult,
  type GenerateDocumentFromTemplateRequest,
  type DocumentVerificationResult,
  type DocumentUploadProgress,
} from './document/document.entity'

// ============================================
// Settings
// ============================================
export {
  type NotificationChannelSettings,
  type DisplaySettings,
  type UserPreferences,
  type NotificationSettings,
  type ThemeSettings,
  type LanguageSettings,
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
  BCMPlanStatus,
  RecoveryStrategyType,
  ExerciseTestType,
  ReputationalImpact,
  RecoveryPriority,
  BCPTemplateCategory,
  BCMLifecyclePhase,
  type CriticalFunction,
  type CriticalFunctionDependency,
  type ResourceRequirement,
  type KeyPersonnel,
  type BusinessImpactAssessment,
  type SeasonalVariation,
  type ThirdPartyDependency,
  type ImpactAssessmentDetails,
  type BusinessContinuityPlan,
  type EmergencyContactList,
  type EmergencyContact,
  type ExternalContact,
  type RecoveryProcedure,
  type VersionHistoryEntry,
  type BCPTemplate,
  type BCPTemplateSection,
  type RecoveryStrategy,
  type ResourceRequirements,
  type StrategyDependency,
  type ValidationEvidence,
  type ImplementationStep,
  type ExerciseTest,
  type ParticipantDetail,
  type TestScenario,
  type TestObservation,
  type BCMLifecycleStatus,
  type LifecycleTask,
  type CreateCriticalFunctionRequest,
  type UpdateCriticalFunctionRequest,
  type CreateBIARequest,
  type UpdateBIARequest,
  type CreateBCPRequest,
  type UpdateBCPRequest,
  type CreateRecoveryStrategyRequest,
  type UpdateRecoveryStrategyRequest,
  type CreateExerciseTestRequest,
  type UpdateExerciseTestRequest,
  type RecordTestResultRequest,
  type CreateBCPTemplateRequest,
  type UpdateBCPTemplateRequest,
  type ApplyTemplateRequest,
  type CriticalFunctionQueryParams,
  type BIAQueryParams,
  type BCPQueryParams,
  type ExerciseTestQueryParams,
  type RecoveryStrategyQueryParams,
  type BIASummary,
  type BCPProgress,
  type TestStatistics,
  type StrategyComparison,
  type MaturityAssessment,
  type BCMMetrics,
  type BCMDashboardData,
  type UpcomingReview,
  type ExpiringPlan,
} from './bcm/bcm.entity'

// ============================================
// Risk Management
// ============================================
export {
  RiskCategory,
  RiskStatus,
  RiskTreatment,
  RiskLikelihoodLevel,
  RiskImpactLevel,
  RiskScoreLevel,
  getRiskScoreLevel,
  getRiskColor,
  type MitigatingControlDto,
  type RiskFactorDto,
  type ActionHistoryDto,
  type Risk,
  type RiskDto,
  type CreateRiskDto,
  type UpdateRiskDto,
  type AssessRiskDto,
  type ApproveRiskDto,
  type AssignRiskDto,
  type AddControlDto,
  type RiskQueryDto,
  type RiskStatsDto,
  type RiskComprehensiveAnalytics,
  type RiskMatrixData,
  type RiskSummary,
  type RiskHeatmapCell,
  type RiskHeatmapData,
  type RiskTrendData,
  type RiskTrendAnalysis,
} from './risk/risk.entity'

// ============================================
// Incident Management
// ============================================
export {
  IncidentSeverity,
  IncidentStatus,
  EscalationLevel,
  EscalationStatus,
  type EscalationHistoryEntry,
  type IncidentUpdate,
  type Incident,
  type ImpactAnalysis,
  type IncidentResponsePlan,
  type ResponseTeamMember,
  type ResponseAction,
  type IncidentRecoveryMetrics,
  type IncidentReport,
  type IncidentTimeline,
  type IncidentTimelineEvent,
  type IncidentDashboardStats,
  type CreateIncidentRequest,
  type UpdateIncidentRequest,
  type CloseIncidentRequest,
  type EscalateIncidentRequest,
  type AssignIncidentRequest,
  type AcknowledgeIncidentRequest,
  type AddIncidentUpdateRequest,
  type IncidentQueryParams,
  type IncidentStats,
  getIncidentSeverityLabel,
  getIncidentSeverityColor,
  getIncidentSeverityIcon,
  getIncidentStatusLabel,
  getIncidentStatusColor,
  getEscalationLevelLabel,
  getEscalationLevelColor,
  calculateResolutionTime,
} from './incident/incident.entity'

// ============================================
// Workflow
// ============================================
export {
  WorkflowState,
  WorkflowType,
  WorkflowPriority,
  WorkflowApprovalStatus,
  type WorkflowComment,
  type ApprovalChainItem,
  type Workflow,
  type WorkflowDto,
  type CreateWorkflowDto,
  type UpdateWorkflowDto,
  type SubmitWorkflowDto,
  type ApproveWorkflowDto,
  type RejectWorkflowDto,
  type AddCommentDto,
  type EscalateWorkflowDto,
  type ReassignWorkflowDto,
  type WorkflowQueryDto,
  type WorkflowStatsDto,
  type WorkflowAnalyticsDto,
  type WorkflowResponseDto,
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
  type NotificationTemplate,
  type CreateNotificationRequest,
  type BulkCreateNotificationRequest,
  type UpdateNotificationRequest,
  type NotificationQueryParams,
  type NotificationCountResponse,
  type NotificationStats,
  type NotificationSummary,
  type NotificationDailyStats,
  type TemplateStats,
  getNotificationTypeLabel,
  getNotificationTypeIcon,
  getNotificationTypeColor,
  getNotificationPriorityLabel,
  getNotificationPriorityColor,
  getNotificationStatusLabel,
  getNotificationStatusColor,
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
  LogicalOperator,
  ComparisonOperator,
  type RuleCondition,
  type RuleAction,
  type RuleSchedule,
  type Rule,
  type RuleExecutionLog,
  type RuleDto,
  type CreateRuleDto,
  type UpdateRuleDto,
  type ExecuteRuleDto,
  type RuleTestDto,
  type RuleTestResultDto,
  type RuleQueryDto,
  type RuleExecutionLogDto,
  type CreateRuleExecutionLogDto,
  type ExecutionLogQueryDto,
  type RuleStatsDto,
  type RuleExecutionStatsDto,
  type RuleExecutionSummaryDto,
  type GlobalExecutionStatsDto,
} from './rules/rule.entity'

// ============================================
// Cache
// ============================================
export {
  CacheEvictionPolicy,
  CacheCompressionAlgorithm,
  type CacheEntry,
  type CacheStats,
  type CreateCacheRequest,
  type UpdateCacheRequest,
  type BulkCacheRequest,
  type CacheQueryParams,
  type CacheEntryMetadata,
  type CacheCleanupResult,
  type BulkCacheResponse,
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
  type ComplianceQueryParams,
  type ComplianceStats,
  type ComplianceSummary,
  type ComplianceGap,
  type ComplianceAuditEntry,
  type ComplianceExportRequest,
  type ComplianceVerificationResult,
  type ComplianceReport,
  // Display constants
  COMPLIANCE_STANDARD_LABELS,
  COMPLIANCE_STANDARD_COLORS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_COLORS,
  COMPLIANCE_STATUS_PROGRESS,
  GAP_PRIORITY_LABELS,
  GAP_PRIORITY_COLORS,
  // Helper functions
  getComplianceStandardLabel,
  getComplianceStandardColor,
  getComplianceStatusLabel,
  getComplianceStatusColor,
  getComplianceStatusProgress,
  isAuditOverdue,
  isAuditDueSoon,
  calculateComplianceRate,
  formatComplianceStandard,
  getDaysUntilAudit,
} from './compliance/compliance.entity'

// ============================================
// Feature Toggle
// ============================================
export {
  FeatureToggleType,
  FeatureToggleStatus,
  ToggleEnvironment,
  TargetingType,
  type TargetingCondition,
  type TargetingRule,
  type FeatureToggle,
  type FeatureToggleOverride,
  type FeatureToggleAuditLog,
  type CreateFeatureToggleRequest,
  type UpdateFeatureToggleRequest,
  type CreateFeatureToggleOverrideRequest,
  type UpdateFeatureToggleOverrideRequest,
  type EvaluateFeatureRequest,
  type FeatureEvaluationResponse,
  type BatchFeatureEvaluationRequest,
  type BatchFeatureEvaluationResponse,
  type FeatureToggleQueryParams,
  type FeatureToggleStats,
  type FeatureToggleAuditQueryParams,
  type FeatureToggleSchedule,
  type FeatureToggleRollout,
  type RolloutIncrement,
  getFeatureToggleStatusLabel,
  getFeatureToggleStatusColor,
  getFeatureToggleStatusIcon,
  getToggleEnvironmentLabel,
  getToggleEnvironmentColor,
  getFeatureToggleTypeLabel,
  getTargetingTypeLabel,
} from './feature-toggle/feature-toggle.entity'

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
  FEATURE_TOGGLE: 'FeatureToggle',
  FEATURE_TOGGLE_OVERRIDE: 'FeatureToggleOverride',
  FEATURE_TOGGLE_AUDIT_LOG: 'FeatureToggleAuditLog',
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
    [ENTITY_TYPES.FEATURE_TOGGLE]: 'feature_toggles',
    [ENTITY_TYPES.FEATURE_TOGGLE_OVERRIDE]: 'feature_toggle_overrides',
    [ENTITY_TYPES.FEATURE_TOGGLE_AUDIT_LOG]: 'feature_toggle_audit_logs',
  }
  return tableMap[entityType] || entityType.toLowerCase()
}

/**
 * Get the entity type from a table name
 */
export function getEntityTypeFromTableName(tableName: string): EntityType | null {
  const reverseMap: Record<string, EntityType> = {
    users: ENTITY_TYPES.USER,
    organisations: ENTITY_TYPES.ORGANISATION,
    business_units: ENTITY_TYPES.BUSINESS_UNIT,
    departments: ENTITY_TYPES.DEPARTMENT,
    documents: ENTITY_TYPES.DOCUMENT,
    risks: ENTITY_TYPES.RISK,
    incidents: ENTITY_TYPES.INCIDENT,
    workflows: ENTITY_TYPES.WORKFLOW,
    notifications: ENTITY_TYPES.NOTIFICATION,
    audit_logs: ENTITY_TYPES.AUDIT_LOG,
    compliance_records: ENTITY_TYPES.COMPLIANCE_RECORD,
    settings: ENTITY_TYPES.SETTINGS,
    critical_functions: ENTITY_TYPES.CRITICAL_FUNCTION,
    business_impact_assessments: ENTITY_TYPES.BUSINESS_IMPACT_ASSESSMENT,
    business_continuity_plans: ENTITY_TYPES.BUSINESS_CONTINUITY_PLAN,
    recovery_strategies: ENTITY_TYPES.RECOVERY_STRATEGY,
    exercise_tests: ENTITY_TYPES.EXERCISE_TEST,
    rules: ENTITY_TYPES.RULE,
    cache: ENTITY_TYPES.CACHE_ENTRY,
    sync_conflicts: ENTITY_TYPES.SYNC_CONFLICT,
    pending_changes: ENTITY_TYPES.PENDING_CHANGE,
    sync_metadata: ENTITY_TYPES.SYNC_METADATA,
    feature_toggles: ENTITY_TYPES.FEATURE_TOGGLE,
    feature_toggle_overrides: ENTITY_TYPES.FEATURE_TOGGLE_OVERRIDE,
    feature_toggle_audit_logs: ENTITY_TYPES.FEATURE_TOGGLE_AUDIT_LOG,
  }
  return reverseMap[tableName] || null
}