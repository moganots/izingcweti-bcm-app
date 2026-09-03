import Dexie, { Table } from 'dexie'

// ============================================
// Import all entity types
// ============================================

// Settings
import type { Settings } from '../../models/entities/settings/settings.entity'

// User & Auth
import {
  type User,
  type AuthTokenEntity,
} from '../../models/entities/user/user.entity'

// Organisation
import {
  type Organisation,
  type BusinessUnit,
  type Department,
} from '../../models/entities/organisation/organisation.entity'

// Document
import {
  type Document,
  type DocumentTemplate,
} from '../../models/entities/document/document.entity'

// Notification
import {
  type Notification,
  type NotificationPreference,
  type NotificationTemplate,
  type UserNotificationSettings,
} from '../../models/entities/notification/notification.entity'

// Audit
import {
  type AuditLog,
  type AuditRetentionPolicy,
} from '../../models/entities/audit/audit.entity'

// BCM
import {
  type CriticalFunction,
  type BusinessImpactAssessment,
  type BusinessContinuityPlan,
  type BCPTemplate,
  type RecoveryStrategy,
  type ExerciseTest,
  type BCMLifecycleStatus,
} from '../../models/entities/bcm/bcm.entity'

// Risk
import {
  type Risk,
} from '../../models/entities/risk/risk.entity'

// Incident
import {
  type Incident,
  type IncidentResponsePlan,
} from '../../models/entities/incident/incident.entity'

// Workflow
import {
  type Workflow,
} from '../../models/entities/workflow/workflow.entity'

// Compliance
import {
  type ComplianceRecord,
} from '../../models/entities/compliance/compliance.entity'

// Rules Engine
import {
  type Rule,
  type RuleExecutionLog,
} from '../../models/entities/rules/rule.entity'

// Cache
import {
  type CacheEntry,
} from '../../models/entities/cache/cache.entity'

// Feature Toggle
import {
  type FeatureToggle,
  type FeatureToggleOverride,
  type FeatureToggleAuditLog,
} from '../../models/entities/feature-toggle/feature-toggle.entity'

// Sync
import {
  SyncStatus,
  type PendingChange,
  type SyncConflict,
  type SyncMetadata,
} from '../../models/entities/sync/sync.entity'

// ============================================
// BCMDatabase Class
// ============================================

export class BCMDatabase extends Dexie {
  // User & Auth Tables
  users!: Table<User, string>
  authTokens!: Table<AuthTokenEntity, string>

  // Organisation Structure Tables
  organisations!: Table<Organisation, string>
  businessUnits!: Table<BusinessUnit, string>
  departments!: Table<Department, string>

  // Document Tables
  documents!: Table<Document, string>
  documentTemplates!: Table<DocumentTemplate, string>

  // Notification Tables
  notifications!: Table<Notification, string>
  notificationPreferences!: Table<NotificationPreference, string>
  notificationTemplates!: Table<NotificationTemplate, string>
  userNotificationSettings!: Table<UserNotificationSettings, string>

  // Audit Tables
  auditLogs!: Table<AuditLog, string>
  auditRetentionPolicies!: Table<AuditRetentionPolicy, string>

  // BCM Tables
  criticalFunctions!: Table<CriticalFunction, string>
  businessImpactAssessments!: Table<BusinessImpactAssessment, string>
  businessContinuityPlans!: Table<BusinessContinuityPlan, string>
  bcpTemplates!: Table<BCPTemplate, string>
  recoveryStrategies!: Table<RecoveryStrategy, string>
  exerciseTests!: Table<ExerciseTest, string>
  bcmLifecycleStatuses!: Table<BCMLifecycleStatus, string>

  // Risk Tables
  risks!: Table<Risk, string>

  // Incident Tables
  incidents!: Table<Incident, string>
  incidentResponsePlans!: Table<IncidentResponsePlan, string>

  // Workflow Tables
  workflows!: Table<Workflow, string>

  // Compliance Tables
  complianceRecords!: Table<ComplianceRecord, string>

  // Rules Engine Tables
  rules!: Table<Rule, string>
  ruleExecutionLogs!: Table<RuleExecutionLog, string>

  // Cache Tables
  cache!: Table<CacheEntry, string>

  // Feature Toggle Tables
  featureToggles!: Table<FeatureToggle, string>
  featureToggleOverrides!: Table<FeatureToggleOverride, string>
  featureToggleAuditLogs!: Table<FeatureToggleAuditLog, string>

  // Sync Tables
  pendingChanges!: Table<PendingChange, string>
  syncConflicts!: Table<SyncConflict, string>
  syncMetadata!: Table<SyncMetadata, string>

  // Settings Table
  settings!: Table<Settings, string>

  private static instance: BCMDatabase | null = null

  constructor() {
    super('BCMDatabase')

    // Version 1: Initial schema - Core entities
    this.version(1).stores({
      // User & Auth
      users: 'uuid, email, organisationId, role, isActive, syncStatus, deletedAt',
      authTokens: 'uuid, userId, organisationId, tokenType, status, expiresAt, syncStatus, deletedAt',

      // Organisation
      organisations: 'uuid, name, tenantId, industryType, maturityScore, isActive, syncStatus, deletedAt',
      businessUnits: 'uuid, name, organisationId, criticalityScore, isActive, syncStatus, deletedAt',
      departments: 'uuid, name, businessUnitId, parentDepartmentId, isActive, syncStatus, deletedAt',

      // Documents
      documents: 'uuid, title, documentType, status, accessLevel, organisationId, uploadedBy, syncStatus, deletedAt',
      documentTemplates: 'uuid, name, documentType, organisationId, isActive, syncStatus, deletedAt',

      // Notifications
      notifications: 'uuid, recipientId, organisationId, notificationType, priority, status, isRead, syncStatus, deletedAt',
      notificationPreferences: 'uuid, userId, notificationType, syncStatus, deletedAt',
      notificationTemplates: 'uuid, organisationId, notificationType, isActive, syncStatus, deletedAt',
      userNotificationSettings: 'uuid, userId, timezone, syncStatus, deletedAt',

      // Audit
      auditLogs: 'uuid, userId, organisationId, action, auditCategory, severity, entityType, entityId, createdAt, syncStatus, deletedAt',
      auditRetentionPolicies: 'uuid, organisationId, auditCategory, isActive, syncStatus, deletedAt',

      // BCM
      criticalFunctions: 'uuid, organisationId, departmentId, name, recoveryPriority, isActive, syncStatus, deletedAt',
      businessImpactAssessments: 'uuid, organisationId, criticalFunctionId, assessedDate, syncStatus, deletedAt',
      businessContinuityPlans: 'uuid, organisationId, criticalFunctionId, planName, planStatus, reviewDueDate, isActive, syncStatus, deletedAt',
      bcpTemplates: 'uuid, organisationId, templateName, category, isSystemTemplate, syncStatus, deletedAt',
      recoveryStrategies: 'uuid, organisationId, businessContinuityPlanId, recoveryStrategyType, isPrimary, isActive, syncStatus, deletedAt',
      exerciseTests: 'uuid, organisationId, businessContinuityPlanId, exerciseTestType, scheduledDate, passed, syncStatus, deletedAt',
      bcmLifecycleStatuses: 'uuid, organisationId, phase, status, syncStatus, deletedAt',

      // Risks
      risks: 'uuid, organisationId, title, riskCategory, status, assignedTo, inherentRiskScore, residualRiskScore, syncStatus, deletedAt',

      // Incidents
      incidents: 'uuid, organisationId, incidentTitle, incidentSeverity, incidentStatus, escalationLevel, assignedTo, syncStatus, deletedAt',
      incidentResponsePlans: 'uuid, incidentId, planId, status, syncStatus, deletedAt',

      // Workflows
      workflows: 'uuid, organisationId, workflowType, workflowState, priority, initiatedBy, assignedTo, entityId, syncStatus, deletedAt',

      // Compliance
      complianceRecords: 'uuid, organisationId, complianceStandard, complianceStatus, lastAuditDate, nextAuditDate, syncStatus, deletedAt',

      // Rules
      rules: 'uuid, organisationId, name, ruleType, triggerEvent, status, priority, isActive, syncStatus, deletedAt',
      ruleExecutionLogs: 'uuid, ruleId, entityId, entityType, success, executedAt, syncStatus, deletedAt',

      // Cache
      cache: 'key, value, expiresAt, tags, hitCount, sizeBytes, syncStatus',

      // Feature Toggles
      featureToggles: 'uuid, organisationId, name, status, environment, toggleType, syncStatus, deletedAt',
      featureToggleOverrides: 'uuid, featureToggleId, organisationId, value, syncStatus, deletedAt',
      featureToggleAuditLogs: 'uuid, featureToggleId, action, auditedBy, syncStatus, deletedAt',

      // Sync
      pendingChanges: 'uuid, entityType, entityId, operationType, priority, attempts, syncStatus, status',
      syncConflicts: 'uuid, entityId, entityType, conflictType, resolved, syncStatus',
      syncMetadata: 'key, value, syncStatus',

      // Settings
      settings: 'uuid, userId, organisationId, category, isSystemDefault, syncStatus',
    })

    // Version 2: Add compound indexes for better query performance
    this.version(2).stores({
      users: 'uuid, email, organisationId, role, isActive, syncStatus, [organisationId+role], [organisationId+isActive], deletedAt',
      documents: 'uuid, title, documentType, status, organisationId, uploadedBy, syncStatus, [organisationId+status], [documentType+status], deletedAt',
      risks: 'uuid, organisationId, title, riskCategory, status, assignedTo, syncStatus, [organisationId+status], [riskCategory+status], deletedAt',
      incidents: 'uuid, organisationId, incidentTitle, incidentSeverity, incidentStatus, syncStatus, [organisationId+incidentStatus], [incidentSeverity+incidentStatus], deletedAt',
      workflows: 'uuid, organisationId, workflowType, workflowState, assignedTo, syncStatus, [workflowType+workflowState], [assignedTo+workflowState], deletedAt',
      pendingChanges: 'uuid, entityType, entityId, operationType, priority, attempts, syncStatus, [entityType+syncStatus], [priority+syncStatus]',
      syncConflicts: 'uuid, entityId, entityType, conflictType, resolved, syncStatus, [entityType+resolved]',
      cache: 'key, value, expiresAt, tags, hitCount, sizeBytes, syncStatus, [tags+expiresAt]',
      notifications: 'uuid, recipientId, organisationId, notificationType, status, isRead, syncStatus, [recipientId+status], [organisationId+notificationType], deletedAt',
      auditLogs: 'uuid, userId, organisationId, action, auditCategory, severity, entityType, entityId, createdAt, syncStatus, [userId+auditCategory], [organisationId+action], deletedAt',
      businessContinuityPlans: 'uuid, organisationId, criticalFunctionId, planName, planStatus, reviewDueDate, isActive, syncStatus, [organisationId+planStatus], [criticalFunctionId+isActive], deletedAt',
    })

    // Version 3: Add compound indexes for better query performance for risk
    this.version(3).stores({
      risks: 'uuid, organisationId, title, riskCategory, status, assignedTo, inherentRiskScore, residualRiskScore, syncStatus, [organisationId+status], [riskCategory+status], [assignedTo+status], deletedAt',
    })

    // Version 4: Add feature toggle overrides and audit logs indexes
    this.version(4).stores({
      featureToggles: 'uuid, organisationId, name, status, environment, toggleType, syncStatus, [organisationId+status], [environment+status], deletedAt',
      featureToggleOverrides: 'uuid, featureToggleId, organisationId, value, syncStatus, [featureToggleId+organisationId], deletedAt',
      featureToggleAuditLogs: 'uuid, featureToggleId, action, auditedBy, syncStatus, [featureToggleId+action], deletedAt',
    })

    // Version 5: Add BCM lifecycle and document template indexes
    this.version(5).stores({
      bcmLifecycleStatuses: 'uuid, organisationId, phase, status, syncStatus, [organisationId+phase], [phase+status], deletedAt',
      documentTemplates: 'uuid, name, documentType, organisationId, isActive, syncStatus, [organisationId+documentType], [documentType+isActive], deletedAt',
      criticalFunctions: 'uuid, organisationId, departmentId, name, recoveryPriority, isActive, syncStatus, [organisationId+departmentId], [departmentId+isActive], deletedAt',
    })

    // Version 6: Add rule execution logs indexes
    this.version(6).stores({
      ruleExecutionLogs: 'uuid, ruleId, entityId, entityType, success, executedAt, syncStatus, [ruleId+success], [entityType+entityId], deletedAt',
      rules: 'uuid, organisationId, name, ruleType, triggerEvent, status, priority, isActive, syncStatus, [organisationId+ruleType], [ruleType+status], deletedAt',
    })

    // Version 7: Add notification preferences and user settings
    this.version(7).stores({
      notificationPreferences: 'uuid, userId, notificationType, syncStatus, [userId+notificationType], deletedAt',
      userNotificationSettings: 'uuid, userId, timezone, syncStatus, [userId+timezone], deletedAt',
      auditRetentionPolicies: 'uuid, organisationId, auditCategory, isActive, syncStatus, [organisationId+auditCategory], deletedAt',
    })

    // Version 8: Add incident response plans and auth tokens indexes
    this.version(8).stores({
      incidentResponsePlans: 'uuid, incidentId, planId, status, syncStatus, [incidentId+status], [planId+status], deletedAt',
      authTokens: 'uuid, userId, organisationId, tokenType, status, expiresAt, syncStatus, [userId+status], [organisationId+tokenType], deletedAt',
    })
  }

  static getInstance(): BCMDatabase {
    if (!BCMDatabase.instance) {
      BCMDatabase.instance = new BCMDatabase()
    }
    return BCMDatabase.instance
  }

  async initialize(): Promise<void> {
    await this.open()
  }

  isDbOpen(): boolean {
    return this.isOpen()
  }

  getName(): string {
    return this.name
  }

  getVersion(): number {
    return this.verno
  }

  getTableNames(): string[] {
    return Object.keys(this._allTables)
  }

  // ============================================
  // Repository Factory
  // ============================================

  /**
   * Create a repository wrapper with common CRUD operations
   */
  private createRepository<T extends Record<string, any>>(table: Table<T, string>) {
    return {
      table,
      findById: async (id: string): Promise<T | undefined> => await table.get(id),
      findAll: async (): Promise<T[]> => await table.toArray(),
      findOne: async (filter: Record<string, any>): Promise<T | undefined> => {
        const [key, value] = Object.entries(filter)[0]!
        return await table.where(key).equals(value).first()
      },
      findMany: async (filter: Record<string, any>): Promise<T[]> => {
        const [key, value] = Object.entries(filter)[0]!
        return await table.where(key).equals(value).toArray()
      },
      findWhere: async (filter: Record<string, any>): Promise<T[]> => {
        let collection: Dexie.Collection<T, any> | null = null
        for (const [key, value] of Object.entries(filter)) {
          if (collection === null) {
            collection = table.where(key).equals(value)
          } else {
            collection = collection.and((item: any) => item[key] === value)
          }
        }
        return collection ? await collection.toArray() : []
      },
      findWithPagination: async (
        filter: Record<string, any>,
        page: number = 1,
        limit: number = 20
      ): Promise<{ data: T[]; total: number; page: number; limit: number }> => {
        const offset = (page - 1) * limit
        let collection: Dexie.Collection<T, any> | null = null

        for (const [key, value] of Object.entries(filter)) {
          if (collection === null) {
            collection = table.where(key).equals(value)
          } else {
            collection = collection.and((item: any) => item[key] === value)
          }
        }

        const total = collection ? await collection.count() : await table.count()
        const data = collection
          ? await collection.offset(offset).limit(limit).toArray()
          : await table.offset(offset).limit(limit).toArray()

        return { data, total, page, limit }
      },
      create: async (data: Partial<T>): Promise<T> => {
        const id = data.uuid || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
        const record = { ...data, uuid: id } as unknown as T
        await table.add(record)
        return record
      },
      update: async (id: string, data: Partial<T>): Promise<T | undefined> => {
        await table.update(id, data as any)
        return await table.get(id)
      },
      upsert: async (data: T): Promise<T> => {
        const existing = await table.get(data.uuid)
        if (existing) {
          await table.update(data.uuid, data as any)
          return await table.get(data.uuid) as T
        } else {
          await table.add(data)
          return data
        }
      },
      delete: async (id: string): Promise<void> => {
        await table.delete(id)
      },
      softDelete: async (id: string, deletedBy: string = 'system'): Promise<T | undefined> => {
        const record = await table.get(id)
        if (record) {
          const now = new Date().toISOString()
          await table.update(id, {
            deletedAt: now,
            deletedBy: deletedBy,
            syncStatus: 'PENDING',
          } as any)
          return await table.get(id)
        }
        return undefined
      },
      exists: async (id: string): Promise<boolean> => {
        const record = await table.get(id)
        return !!record && !record.deletedAt
      },
      count: async (): Promise<number> => await table.count(),
      clearAll: async (): Promise<void> => await table.clear(),
      bulkCreate: async (items: Partial<T>[]): Promise<T[]> => {
        const records = items.map((item) => ({
          ...item,
          uuid: item.uuid || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        })) as unknown as T[]
        await table.bulkAdd(records)
        return records
      },
      bulkUpdate: async (items: Array<{ uuid: string; data: Partial<T> }>): Promise<void> => {
        for (const item of items) {
          await table.update(item.uuid, item.data as any)
        }
      },
      // Sync-specific methods
      getPending: async (): Promise<T[]> => {
        return await table.where('syncStatus').equals(SyncStatus.PENDING).toArray()
      },
      getSynced: async (): Promise<T[]> => {
        return await table.where('syncStatus').equals(SyncStatus.SYNCED).toArray()
      },
      getDeleted: async (): Promise<T[]> => {
        return await table.filter((record: T) => record.deletedAt != null).toArray()
      },
      markSynced: async (id: string): Promise<void> => {
        await table.update(id, { syncStatus: SyncStatus.SYNCED } as any)
      },
      markPending: async (id: string): Promise<void> => {
        await table.update(id, { syncStatus: SyncStatus.PENDING } as any)
      },
    }
  }

  /**
   * Get a repository wrapper for a table
   */
  getRepository(tableName: string): any {
    const table = (this as any)[tableName]
    if (!table) {
      console.warn(`Table ${tableName} not found`)
      return null
    }
    return this.createRepository(table)
  }

  // ============================================
  // Repository Factory Methods
  // ============================================

  getUserRepository() {
    return this.createRepository(this.users)
  }

  getAuthTokenRepository() {
    return this.createRepository(this.authTokens)
  }

  getOrganisationRepository() {
    return this.createRepository(this.organisations)
  }

  getBusinessUnitRepository() {
    return this.createRepository(this.businessUnits)
  }

  getDepartmentRepository() {
    return this.createRepository(this.departments)
  }

  getDocumentRepository() {
    return this.createRepository(this.documents)
  }

  getDocumentTemplateRepository() {
    return this.createRepository(this.documentTemplates)
  }

  getNotificationRepository() {
    return this.createRepository(this.notifications)
  }

  getNotificationPreferenceRepository() {
    return this.createRepository(this.notificationPreferences)
  }

  getNotificationTemplateRepository() {
    return this.createRepository(this.notificationTemplates)
  }

  getUserNotificationSettingsRepository() {
    return this.createRepository(this.userNotificationSettings)
  }

  getAuditLogRepository() {
    return this.createRepository(this.auditLogs)
  }

  getAuditRetentionPolicyRepository() {
    return this.createRepository(this.auditRetentionPolicies)
  }

  getCriticalFunctionRepository() {
    return this.createRepository(this.criticalFunctions)
  }

  getBusinessImpactAssessmentRepository() {
    return this.createRepository(this.businessImpactAssessments)
  }

  getBusinessContinuityPlanRepository() {
    return this.createRepository(this.businessContinuityPlans)
  }

  getBCPTemplateRepository() {
    return this.createRepository(this.bcpTemplates)
  }

  getRecoveryStrategyRepository() {
    return this.createRepository(this.recoveryStrategies)
  }

  getExerciseTestRepository() {
    return this.createRepository(this.exerciseTests)
  }

  getBCMLifecycleStatusRepository() {
    return this.createRepository(this.bcmLifecycleStatuses)
  }

  getRiskRepository() {
    return this.createRepository(this.risks)
  }

  getIncidentRepository() {
    return this.createRepository(this.incidents)
  }

  getIncidentResponsePlanRepository() {
    return this.createRepository(this.incidentResponsePlans)
  }

  getWorkflowRepository() {
    return this.createRepository(this.workflows)
  }

  getComplianceRecordRepository() {
    return this.createRepository(this.complianceRecords)
  }

  getRuleRepository() {
    return this.createRepository(this.rules)
  }

  getRuleExecutionLogRepository() {
    return this.createRepository(this.ruleExecutionLogs)
  }

  getCacheRepository() {
    return this.createRepository(this.cache)
  }

  getFeatureToggleRepository() {
    return this.createRepository(this.featureToggles)
  }

  getFeatureToggleOverrideRepository() {
    return this.createRepository(this.featureToggleOverrides)
  }

  getFeatureToggleAuditLogRepository() {
    return this.createRepository(this.featureToggleAuditLogs)
  }

  getPendingChangeRepository() {
    return this.createRepository(this.pendingChanges)
  }

  getSyncConflictRepository() {
    return this.createRepository(this.syncConflicts)
  }

  getSyncMetadataRepository() {
    return this.createRepository(this.syncMetadata)
  }

  getSettingsRepository() {
    return this.createRepository(this.settings)
  }

  // ============================================
  // Pending Changes Specific Methods
  // ============================================

  async getPendingChangesByPriority(): Promise<PendingChange[]> {
    return await this.pendingChanges.orderBy('priority').toArray()
  }

  async getPendingChangesByEntity(entityType: string): Promise<PendingChange[]> {
    return await this.pendingChanges.where('entityType').equals(entityType).toArray()
  }

  async getPendingChangesByEntityId(entityId: string): Promise<PendingChange[]> {
    return await this.pendingChanges.where('entityId').equals(entityId).toArray()
  }

  async getPendingCount(): Promise<number> {
    return await this.pendingChanges.where('syncStatus').equals('PENDING').count()
  }

  async getFailedChanges(): Promise<PendingChange[]> {
    return await this.pendingChanges.where('status').equals('FAILED').toArray()
  }

  async incrementAttempts(id: string): Promise<void> {
    const record = await this.pendingChanges.get(id)
    if (record) {
      const attempts = (record.attempts || 0) + 1
      await this.pendingChanges.update(id, { attempts })
    }
  }

  // ============================================
  // Sync Metadata Specific Methods
  // ============================================

  async getLastSyncToken(): Promise<string | null> {
    const record = await this.syncMetadata.where('key').equals('last_sync_token').first()
    return record?.value || null
  }

  async setLastSyncToken(token: string): Promise<void> {
    const existing = await this.syncMetadata.where('key').equals('last_sync_token').first()
    const now = new Date().toISOString()
    if (existing) {
      await this.syncMetadata.update(existing.uuid, {
        value: token,
        updatedAt: now,
        updatedBy: 'system',
      })
    } else {
      await this.syncMetadata.add({
        uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        key: 'last_sync_token',
        value: token,
        syncStatus: 'SYNCED' as SyncMetadata['syncStatus'],
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
      })
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    const record = await this.syncMetadata.where('key').equals('last_sync_time').first()
    return record?.value || null
  }

  async setLastSyncTime(time: string): Promise<void> {
    const existing = await this.syncMetadata.where('key').equals('last_sync_time').first()
    const now = new Date().toISOString()
    if (existing) {
      await this.syncMetadata.update(existing.uuid, {
        value: time,
        updatedAt: now,
        updatedBy: 'system',
      })
    } else {
      await this.syncMetadata.add({
        uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        key: 'last_sync_time',
        value: time,
        syncStatus: 'SYNCED' as SyncMetadata['syncStatus'],
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
      })
    }
  }

  async getSyncMetadataByKey(key: string): Promise<SyncMetadata | undefined> {
    return await this.syncMetadata.where('key').equals(key).first()
  }

  async setSyncMetadata(key: string, value: string): Promise<void> {
    const existing = await this.syncMetadata.where('key').equals(key).first()
    const now = new Date().toISOString()
    if (existing) {
      await this.syncMetadata.update(existing.uuid, {
        value,
        updatedAt: now,
        updatedBy: 'system',
      })
    } else {
      await this.syncMetadata.add({
        uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        key,
        value,
        syncStatus: 'SYNCED' as SyncMetadata['syncStatus'],
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
      })
    }
  }

  // ============================================
  // Sync Conflicts Specific Methods
  // ============================================

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    return await this.syncConflicts.filter((conflict) => !conflict.resolved).toArray()
  }

  async getConflictsByEntity(entityType: string, entityId: string): Promise<SyncConflict[]> {
    return await this.syncConflicts
      .where('[entityType+entityId]')
      .equals([entityType, entityId])
      .toArray()
  }

  async resolveConflict(
    id: string,
    resolutionData: Record<string, any>,
    resolutionNotes?: string
  ): Promise<void> {
    const now = new Date().toISOString()
    await this.syncConflicts.update(id, {
      resolved: true,
      resolutionData,
      ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
      resolvedAt: now,
      resolvedBy: 'system',
    })
  }

  // ============================================
  // Cache Specific Methods
  // ============================================

  async getCacheByTags(tags: string[]): Promise<CacheEntry[]> {
    const all = await this.cache.toArray()
    return all.filter((entry) => {
      if (!entry.tags) return false
      const entryTags = Array.isArray(entry.tags) ? entry.tags : entry.tags.split(',')
      return tags.some((tag) => entryTags.includes(tag))
    })
  }

  async deleteCacheByTags(tags: string[]): Promise<number> {
    const entries = await this.getCacheByTags(tags)
    for (const entry of entries) {
      await this.cache.delete(entry.uuid)
    }
    return entries.length
  }

  async incrementCacheHit(key: string): Promise<void> {
    const entry = await this.cache.where('key').equals(key).first()
    if (entry) {
      const hitCount = (entry.hitCount || 0) + 1
      await this.cache.update(entry.uuid, {
        hitCount,
        lastAccessedAt: new Date().toISOString(),
      })
    }
  }

  async cleanupExpiredCache(): Promise<number> {
    const now = new Date().toISOString()
    const expired = await this.cache
      .where('expiresAt')
      .below(now)
      .toArray()
    for (const entry of expired) {
      await this.cache.delete(entry.uuid)
    }
    return expired.length
  }

  // ============================================
  // Feature Toggle Specific Methods
  // ============================================

  async getActiveFeatureToggles(organisationId: string): Promise<FeatureToggle[]> {
    return await this.featureToggles
      .where('[organisationId+status]')
      .equals([organisationId, 'ACTIVE'])
      .toArray()
  }

  async getFeatureToggleByName(name: string, organisationId: string): Promise<FeatureToggle | undefined> {
    return await this.featureToggles
      .where('[organisationId+name]')
      .equals([organisationId, name])
      .first()
  }

  async getFeatureToggleOverrides(featureToggleId: string): Promise<FeatureToggleOverride[]> {
    return await this.featureToggleOverrides
      .where('featureToggleId')
      .equals(featureToggleId)
      .toArray()
  }

  // ============================================
  // Health Check
  // ============================================

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    version: number
    tableCount: number
    open: boolean
    tableSizes?: Record<string, number>
  }> {
    try {
      const isOpen = this.isOpen()
      const tableCount = Object.keys(this._allTables).length

      // Get table sizes
      const tableSizes: Record<string, number> = {}
      for (const [name, table] of Object.entries(this._allTables)) {
        try {
          tableSizes[name] = await (table as Table<any, string>).count()
        } catch {
          tableSizes[name] = 0
        }
      }

      return {
        status: isOpen ? 'healthy' : 'unhealthy',
        version: this.verno,
        tableCount,
        open: isOpen,
        tableSizes,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        version: this.verno,
        tableCount: 0,
        open: false,
      }
    }
  }

  // ============================================
  // Database Maintenance
  // ============================================

  async vacuum(): Promise<void> {
    // Dexie doesn't have a built-in vacuum, but we can clear deleted records
    // This is a soft vacuum that removes soft-deleted records older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const tables = Object.values(this._allTables) as Table<any, string>[]
    for (const table of tables) {
      try {
        const deleted = await table
          .where('deletedAt')
          .below(thirtyDaysAgo.toISOString())
          .toArray()
        for (const record of deleted) {
          await table.delete(record.uuid)
        }
      } catch {
        // Table may not have deletedAt column
        continue
      }
    }
  }

  async getDatabaseSize(): Promise<number> {
    // Estimate database size by counting records
    let totalSize = 0
    const tables = Object.values(this._allTables) as Table<any, string>[]
    for (const table of tables) {
      try {
        const count = await table.count()
        totalSize += count * 1024 // Rough estimate: 1KB per record
      } catch {
        continue
      }
    }
    return totalSize
  }
}

// Export singleton instance
export const db = BCMDatabase.getInstance()