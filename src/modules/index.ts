// ============================================
// Shared System
// ============================================
export * from '../shared/enums/system.enum'
export * from '../shared/types/common.types'
export * from '../shared/types/bulk-operations.types'

// ============================================
// Core Module
// ============================================
export * from '../core/base/base.entity'

// ============================================
// Auth Module
// ============================================
export * from './auth/enums/auth.enum'
export type {
  AuthTokens,
  LoginCredentials,
  DeviceInfo,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SessionInfo,
  AuthToken as AuthTokenType,
} from './auth/types/auth.types'

// ============================================
// Auth Token Module
// ============================================
export * from './auth-token/types/auth-token.types'

// ============================================
// Organisation Module
// ============================================
export * from './organisation/enums/organisation.enum'
export type {
  Organisation,
  BusinessUnit,
  Department,
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  CreateBusinessUnitRequest,
  CreateDepartmentRequest,
} from './organisation/types/organisation.types'

// ============================================
// User Module
// ============================================
export * from './user/enums/user.enum'
export type {
  User,
  UserPreferences,
  CreateUserRequest,
  UpdateUserRequest,
} from './user/types/user.types'

// ============================================
// BCM Module
// ============================================
export * from './bcm/enums/bcm.enum'
export type {
  // Core BCM Types
  CriticalFunction,
  CriticalFunctionDependency,
  ResourceRequirement,
  BusinessImpactAssessment,
  SeasonalVariation,
  ThirdPartyDependency,
  BusinessContinuityPlan,
  EmergencyContact,
  KeyPersonnel,
  RecoveryStrategy,
  StrategyDependency,
  ValidationEvidence,
  ExerciseTest,
  // Request Types
  CreateBCPRequest,
  CreateBIARequest,
  CreateRecoveryStrategyRequest,
  RecordTestResultRequest,
  ValidateBCPRequest,
  BIAAnalysisRequest,
  // Response/Analysis Types
  BIASummary,
  BCPProgress,
  TestStatistics,
  StrategyComparison,
  ComplianceGap,
  MaturityAssessment,
  LifecycleProgress,
  BCPValidationResult,
  BIAAnalysisResult,
  ThirdPartyRisk,
  BCMMetrics,
  BCMLifecycleStatus,
  LifecycleTask,
  BCMDashboardData,
  UpcomingReview,
  ExpiringPlan,
  // Query Parameter Types
  CriticalFunctionQueryParams,
  BIAQueryParams,
  BCPQueryParams,
  RecoveryStrategyQueryParams,
  ExerciseTestQueryParams,
} from './bcm/types/bcm.types'

// ============================================
// Risk Module
// ============================================
export * from './risk/enums/risk.enum'
export type {
  Risk,
  MitigatingControl,
  RiskFactor,
  RiskActionHistory,
  RiskAssessmentWorkflow,
  RiskAssessmentData,
  RiskMitigationPlan,
  RiskMitigationAction,
  RiskSummary,
  RiskHeatmapSummary,
  RiskMatrixData,
  RiskHeatmapData,
  RiskTrendData,
  RiskHeatmapCell,
  RiskTrendAnalysis,
  CreateRiskRequest,
  UpdateRiskRequest,
  AssessRiskRequest,
  RiskQueryParams,
} from './risk/types/risk.types'

// ============================================
// Incident Module
// ============================================
export * from './incident/enums/incident.enum'
export type {
  Incident,
  EscalationHistoryEntry,
  IncidentUpdate,
  IncidentResponsePlan,
  ResponseTeamMember,
  ResponseAction,
  IncidentRecoveryMetrics,
  IncidentReport,
  IncidentTimeline,
  IncidentTimelineEvent,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  EscalateIncidentRequest,
  CloseIncidentRequest,
  IncidentQueryParams,
  IncidentDashboardStats,
} from './incident/types/incident.types'

// ============================================
// Workflow Module
// ============================================
export * from './workflow/enums/workflow.enum'
export type {
  Workflow,
  ApprovalStep,
  WorkflowComment,
  WorkflowTemplate,
  WorkflowStep,
  WorkflowCondition,
  ApprovalRule,
  NotificationTrigger,
  WorkflowActionResponse,
  WorkflowMetrics,
  WorkflowTypeMetrics,
  CreateWorkflowRequest,
  ApproveWorkflowRequest,
  RejectWorkflowRequest,
  EscalateWorkflowRequest,
  WorkflowQueryParams,
  WorkflowStats,
} from './workflow/types/workflow.types'

// ============================================
// Document Module
// ============================================
export * from './document/enums/document.enum'
export type {
  Document,
  DocumentVersion,
  DocumentApprovalHistory,
  DocumentTemplate,
  UploadDocumentRequest,
  UpdateDocumentRequest,
  ApproveDocumentRequest,
  RejectDocumentRequest,
  GenerateDocumentFromTemplateRequest,
  DocumentSearchParams,
  DocumentBulkOperationRequest,
  DocumentBulkOperationResult,
  DocumentQueryParams,
  DocumentStats,
} from './document/types/document.types'

// ============================================
// Notification Module
// ============================================
export * from './notification/enums/notification.enum'
export type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  UserNotificationSettings,
  UserChannelSettings,
  NotificationClickTracking,
  NotificationSummary,
  NotificationDailyStats,
  CreateNotificationRequest,
  UpdatePreferencesRequest,
  NotificationBatchRequest,
  NotificationBatchResult,
  NotificationQueryParams,
  NotificationCounts,
} from './notification/types/notification.types'

// ============================================
// Audit Module
// ============================================
export * from './audit/enums/audit.enum'
export type {
  AuditLog,
  AuditRetentionPolicy,
  AuditStats,
  AuditCleanupResult,
  AuditExportOptions,
  AuditReplayRequest,
  AuditReplayResult,
  AuditAnomalyDetection,
  AuditAnomaly,
  CreateAuditLogRequest,
  GetAuditLogsParams,
  AuditRetentionPolicyRequest,
  AuditQueryParams,
  ExportAuditRequest,
  AuditSummary,
} from './audit/types/audit.types'

// ============================================
// Compliance Module
// ============================================
export * from './compliance/enums/compliance.enum'
export type {
  ComplianceRecord,
  CreateComplianceRecordRequest,
  UpdateComplianceRecordRequest,
} from './compliance/types/compliance.types'

// ============================================
// Training Module
// ============================================
export * from './training/enums/training.enum'
export type {
  TrainingCourse,
  TrainingModule,
  TrainingQuiz,
  QuizQuestion,
  UserTraining,
  UserModuleProgress,
  TrainingAssignment,
  TrainingCertificate,
  QuizResult,
  QuizAnswerResult,
  TrainingProgressSummary,
  CreateTrainingCourseRequest,
  EnrollTrainingRequest,
  SubmitQuizRequest,
  TrainingQueryParams,
} from './training/types/training.types'

// ============================================
// Report Module
// ============================================
export * from './report/enums/report.enum'
export type {
  Report,
  ReportRecipient,
  ReportDataSource,
  ReportQuery,
  ReportVisualization,
  ReportDashboard,
  ReportSubscription,
  ReportGenerationJob,
  ReportComparison,
  ComparisonMetric,
  CreateReportRequest,
  GenerateReportRequest,
} from './report/types/report.types'

// ============================================
// Dashboard Module
// ============================================
export * from './dashboard/enums/dashboard.enum'
export type {
  DashboardWidget,
  DashboardConfig,
  DashboardKPIs,
  ComplianceOverview,
  RiskTrend,
  IncidentTrend,
  DashboardData,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  UpcomingTask,
  MaturityProgress,
  MaturityDomain,
  DashboardQueryParams,
} from './dashboard/types/dashboard.types'

// ============================================
// Settings Module
// ============================================
export * from './settings/enums/settings.enum'
export type {
  UserPreferences as SettingsUserPreferences,
  NotificationSettings,
  ThemeSettings,
  LanguageSettings,
  DisplaySettings,
  SecuritySettings,
  SyncSettings as SettingsSyncSettings,
  PrivacySettings,
  Settings,
  UpdateSettingsRequest,
  SettingsQueryParams,
  BulkUpdateSettingsRequest,
  SettingsExportOptions,
  SettingsImportResult,
  SettingsValidationResult,
  DefaultSettingsTemplate,
} from './settings/types/settings.types'

// ============================================
// Tenant Module
// ============================================
export * from './tenant/enums/tenant.enum'
export type {
  Tenant,
  AwsResources,
  TenantResourceQuotas,
  TenantPasswordPolicy,
  TenantMaintenanceWindow,
  TenantConfig,
  TenantAuditLog,
  TenantResourceUsage,
  TenantMetrics,
  TenantBackup,
  TenantBillingInfo,
  TenantInvoice,
  InvoiceItem,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRestoreRequest,
  TenantRestoreResult,
} from './tenant/types/tenant.types'

// ============================================
// Rule Module
// ============================================
export * from './rule/enums/rule.enum'
export type {
  Rule,
  RuleCondition,
  RuleAction,
  RuleSchedule,
  RuleExecutionHistory,
  RuleExecutionLog,
  RuleExecutionSchedule,
  RuleScheduleRun,
  RuleConditionMatch,
  RuleActionExecution,
  CreateRuleRequest,
  UpdateRuleRequest,
  RuleTestRequest,
  RuleTestResult,
  RuleValidationRequest,
  RuleValidationResult,
  RuleQueryParams,
  RuleExecutionQueryParams,
  RuleStatistics,
} from './rule/types/rule.types'

// ============================================
// Feature Toggle Module
// ============================================
export * from './feature-toggle/enums/feature-toggle.enum'
export type {
  FeatureToggle,
  FeatureToggleOverride,
  TargetingRule,
  TargetingCondition,
  FeatureToggleAuditLog,
  FeatureToggleSchedule,
  FeatureToggleRollout,
  RolloutIncrement,
  CreateFeatureToggleRequest,
  EvaluateFeatureRequest,
  FeatureToggleEvaluation,
  BatchFeatureEvaluationRequest,
  BatchFeatureEvaluationResult,
} from './feature-toggle/types/feature-toggle.types'

// ============================================
// Sync Module
// ============================================
export * from './sync/enums/sync.enum'
export type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
  SyncConfig,
  Tombstone,
  PushChangesRequest,
  PullChangesRequest,
  PullChangesResponse,
  ResolveConflictRequest,
} from './sync/types/sync.types'

// ============================================
// Cache Module
// ============================================
export * from './cache/enums/cache.enum'
export type {
  CacheEntry,
  CacheStats,
  SetCacheRequest,
  GetCacheParams,
  BulkCacheRequest,
  CacheCleanupResult,
} from './cache/types/cache.types'

// ============================================
// Utility Types (Re-exports with aliases where needed)
// ============================================

// Re-export BaseEntity from core for convenience
export type { BaseEntity } from '../core/base/base.entity'
