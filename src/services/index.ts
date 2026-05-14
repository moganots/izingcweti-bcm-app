// src/services/index.ts

// Database
export { Database, db } from './db/Database'
export { MIGRATIONS, MigrationHelpers } from './db/migrations'

// Repositories
export { BaseRepository } from './db/repositories/BaseRepository'
export {
  CriticalFunctionRepository,
  BIARepository,
  BCPRepository,
  RecoveryStrategyRepository,
  ExerciseTestRepository,
  ComplianceRecordRepository,
} from './db/repositories/BcmRepository'
export { IncidentRepository } from './db/repositories/IncidentRepository'
export { RiskRepository } from './db/repositories/RiskRepository'
export { UserRepository } from './db/repositories/UserRepository'
export { WorkflowRepository } from './db/repositories/WorkflowRepository'
export {
  NotificationRepository,
  NotificationPreferenceRepository,
} from './db/repositories/NotificationRepository'
export {
  PendingChangeRepository,
  SyncConflictRepository,
  SyncMetadataRepository,
} from './db/repositories/SyncRepository'
export {
  OrganisationRepository,
  BusinessUnitRepository,
  DepartmentRepository,
} from './db/repositories/OrganisationRepository'
export { DocumentRepository } from './db/repositories/DocumentRepository'
export { AuditLogRepository } from './db/repositories/AuditRepository'
export { RuleRepository, RuleExecutionLogRepository } from './db/repositories/RuleRepository'
export { CacheRepository } from './db/repositories/CacheRepository'

// Sync Services
export { SyncEngine } from './sync/SyncEngine'
export { ConflictResolver } from './sync/ConflictResolver'
export { NetworkMonitor, networkMonitor } from './sync/NetworkMonitor'
export { OfflineQueue } from './sync/OfflineQueue'

// API Services
export { BaseService } from './api/BaseService'
export { ApiService, apiService } from './api/ApiService'
export { AuthService, authService } from './api/AuthService'
export { BcmService, bcmService } from './api/BcmService'
export { IncidentService, incidentService } from './api/IncidentService'
export { RiskService, riskService } from './api/RiskService'
export { SyncService, syncService } from './api/SyncService'
export { WorkflowService, workflowService } from './api/WorkflowService'

// Document Services
export { DocumentService, documentService } from './api/DocumentService'
