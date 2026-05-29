// ============================================
// Base Service
// ============================================
export { BaseService } from './BaseService'

// ============================================
// Core Services
// ============================================
export { ApiService, apiService } from './api/ApiService'
export { AuthService, authService } from './api/auth/AuthService'
export { UserService, userService } from './api/user/UserService'
export { SettingsService, settingsService } from './api/settings/SettingsService'

// ============================================
// Organisation Services
// ============================================
export { OrganisationService, organisationService } from './api/organisation/OrganisationService'
export { BusinessUnitService, businessUnitService } from './api/organisation/BusinessUnitService'
export { DepartmentService, departmentService } from './api/organisation/DeparmentService'

// ============================================
// BCM Services
// ============================================
export { BcmService, bcmService } from './api/bcm/BcmService'

// ============================================
// Risk & Compliance Services
// ============================================
export { RiskService, riskService } from './api/risk/RiskService'
export { ComplianceService, complianceService } from './api/compliance/ComplianceService'

// ============================================
// Incident Management Services
// ============================================
export { IncidentService, incidentService } from './api/incident/IncidentService'

// ============================================
// Workflow & Rules Services
// ============================================
export { WorkflowService, workflowService } from './api/workflow/WorkflowService'
export { RulesService, rulesService } from './api/rules/RulesService'

// ============================================
// Document Management Services
// ============================================
export { DocumentService, documentService } from './api/documents/DocumentService'

// ============================================
// Notification Services
// ============================================
export { NotificationService, notificationService } from './api/notification/NotificationService'

// ============================================
// Synchronization Services
// ============================================
export { SyncService, syncService } from './sync/SyncService'

// ============================================
// Audit Services
// ============================================
export { AuditService, auditService } from './api/audit/AuditService'

// ============================================
// Dashboard Services
// ============================================
export { DashboardService, dashboardService } from './api/dashboard/DashboardService'

// ============================================
// Cache Services
// ============================================
export { CacheService, cacheService } from './api/cache/CacheService'

// ============================================
// Sync Engine & Utilities (for offline-first)
// ============================================
export { SyncEngine } from './sync/SyncEngine'
export { ConflictResolver } from './sync/ConflictResolver'
export { NetworkMonitor, networkMonitor } from './sync/NetworkMonitor'
export { OfflineQueue } from './sync/OfflineQueue'

// ============================================
// Database & Repositories
// ============================================
export { db, BCMDatabase } from './db/Database'
export { MIGRATIONS } from './db/migrations'

// Base Repository
export { BaseRepository } from './db/repositories/BaseRepository'

// Audit Repository
export { AuditLogRepository } from './db/repositories/audit/AuditRepository'

// BCM Repositories
export {
  CriticalFunctionRepository,
  BIARepository,
  BCPRepository,
  RecoveryStrategyRepository,
  ExerciseTestRepository,
  ComplianceRecordRepository,
} from './db/repositories/bcm/BcmRepository'

// Cache Repository
export { CacheRepository } from './db/repositories/cache/CacheRepository'

// Incident Repository
export { IncidentRepository } from './db/repositories/incident/IncidentRepository'

// Notification Repositories
export {
  NotificationRepository,
  NotificationPreferenceRepository,
} from './db/repositories/notification/NotificationRepository'

// Organisation Repositories
export {
  OrganisationRepository,
  BusinessUnitRepository,
  DepartmentRepository,
  DocumentRepository,
} from './db/repositories/organisation/OrganisationRepository'

// Risk Repository
export { RiskRepository } from './db/repositories/risk/RiskRepository'

// Rules Repositories
export {
  RulesRepository,
  RuleExecutionLogRepository,
} from './db/repositories/rules/RulesRepository'

// Settings Repository
export { SettingsRepository } from './db/repositories/settings/SettingsRepository'

// Sync Repositories
export {
  PendingChangeRepository,
  SyncConflictRepository,
  SyncMetadataRepository,
} from './db/repositories/sync/SyncRepository'

// User Repository
export { UserRepository } from './db/repositories/user/UserRepository'

// Workflow Repository
export { WorkflowRepository } from './db/repositories/workflow/WorkflowRepository'
