// Base Service
export { BaseService } from './BaseService'

// Core Services
export { ApiService, apiService } from './ApiService'
export { AuthService, authService } from './auth/AuthService'
export { UserService, userService } from './user/UserService'
export { SettingsService, settingsService } from './settings/SettingsService'

// Organisation Services
export { OrganisationService, organisationService } from './organisation/OrganisationService'
export { BusinessUnitService, businessUnitService } from './organisation/BusinessUnitService'
export { DepartmentService, departmentService } from './organisation/DeparmentService'

// BCM Services
export { BcmService, bcmService } from './bcm/BcmService'

// Risk & Compliance
export { RiskService, riskService } from './risk/RiskService'
export { ComplianceService, complianceService } from './compliance/ComplianceService'

// Incident Management
export { IncidentService, incidentService } from './incident/IncidentService'

// Workflow & Rules
export { WorkflowService, workflowService } from './workflow/WorkflowService'
export { RulesService, rulesService } from './rules/RulesService'

// Document Management
export { DocumentService, documentService } from './documents/DocumentService'

// Notifications
export { NotificationService, notificationService } from './notification/NotificationService'

// Synchronization
export { SyncService, syncService } from './sync/SyncService'

// Audit
export { AuditService, auditService } from './audit/AuditService'

// Dashboard
export { DashboardService, dashboardService } from './dashboard/DashboardService'

// Cache
export { CacheService, cacheService } from './cache/CacheService'

/**
 * Export types
 */

// Incident Management
export type {
    CreateIncidentDTO,
    UpdateIncidentDTO,
    CloseIncidentDTO,
} from './incident/IncidentService'

// Document Management
export type {
    DocumentUploadProgress,
    DocumentVerificationResult,
} from './documents/DocumentService'

// Notifications
export type { UpdatePreferencesRequest } from './notification/NotificationService'
