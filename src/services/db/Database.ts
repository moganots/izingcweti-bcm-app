// src/services/db/Database.ts

import Dexie, { type Table } from 'dexie'
import { importDB, exportDB } from 'dexie-export-import'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
} from '../../models/entities/bcm.entity'
import type { Incident } from '../../models/entities/incident.entity'
import type { Risk } from '../../models/entities/risk.entity'
import type { User } from '../../models/entities/user.entity'
import type {
  Organisation,
  BusinessUnit,
  Department,
  Document,
} from '../../models/entities/organisation.entity'
import type { Workflow } from '../../models/entities/workflow.entity'
import type {
  Notification,
  NotificationPreference,
} from '../../models/entities/notification.entity'
import type { PendingChange, SyncConflict, SyncMetadata } from '../../models/entities/sync.entity'
import type { AuditLog } from '../../models/entities/audit.entity'
import type { Rule, RuleExecutionLog } from '../../models/entities/rules.entity'
import { MIGRATIONS } from './migrations'

import {
  CriticalFunctionRepository,
  BIARepository,
  BCPRepository,
  RecoveryStrategyRepository,
  ExerciseTestRepository,
  ComplianceRecordRepository,
} from './repositories/BcmRepository'
import { IncidentRepository } from './repositories/IncidentRepository'
import { RiskRepository } from './repositories/RiskRepository'
import { UserRepository } from './repositories/UserRepository'
import { WorkflowRepository } from './repositories/WorkflowRepository'
import {
  NotificationRepository,
  NotificationPreferenceRepository,
} from './repositories/NotificationRepository'
import {
  PendingChangeRepository,
  SyncConflictRepository,
  SyncMetadataRepository,
} from './repositories/SyncRepository'
import {
  OrganisationRepository,
  BusinessUnitRepository,
  DepartmentRepository,
} from './repositories/OrganisationRepository'
import { DocumentRepository } from './repositories/DocumentRepository'
import { AuditLogRepository } from './repositories/AuditRepository'
import { RuleRepository, RuleExecutionLogRepository } from './repositories/RuleRepository'
import { CacheRepository } from './repositories/CacheRepository'

/**
 * BCM Database
 * Extends Dexie to provide a complete local database for offline storage
 */
export class Database extends Dexie {
  // ============================================
  // Table Declarations
  // ============================================

  // Organisation Structure
  organisations!: Table<Organisation, string>
  businessUnits!: Table<BusinessUnit, string>
  departments!: Table<Department, string>

  // Users
  users!: Table<User, string>

  // BCM Core
  criticalFunctions!: Table<CriticalFunction, string>
  businessImpactAssessments!: Table<BusinessImpactAssessment, string>
  businessContinuityPlans!: Table<BusinessContinuityPlan, string>
  recoveryStrategies!: Table<RecoveryStrategy, string>
  exerciseTests!: Table<ExerciseTest, string>

  // Risk & Compliance
  risks!: Table<Risk, string>
  complianceRecords!: Table<ComplianceRecord, string>

  // Incidents
  incidents!: Table<Incident, string>

  // Workflows
  workflows!: Table<Workflow, string>

  // Notifications
  notifications!: Table<Notification, string>
  notificationPreferences!: Table<NotificationPreference, string>

  // Documents
  documents!: Table<Document, string>

  // Audit
  auditLogs!: Table<AuditLog, string>

  // Rules
  rules!: Table<Rule, string>
  ruleExecutionLogs!: Table<RuleExecutionLog, string>

  // Sync
  pendingChanges!: Table<PendingChange, string>
  syncConflicts!: Table<SyncConflict, string>
  syncMetadata!: Table<SyncMetadata, string>

  // Cache
  cache!: Table<
    { key: string; value: any; expiresAt?: number; tags?: string; createdAt: number },
    string
  >

  // ============================================
  // Repository Instances
  // ============================================
  private _repositories: Map<string, any> = new Map()

  // Database metadata
  private _initialized = false
  private static _instance: Database | null = null

  /**
   * Constructor - Defines database schema
   */
  constructor() {
    super('bcm_database')

    // Define database schema (version 1)
    this.version(1).stores({
      // Organisation Structure
      organisations: 'uuid, name, industry_type, maturity_score, created_at, sync_status',
      businessUnits: 'uuid, name, organisation_id, criticality_score, created_at, sync_status',
      departments: 'uuid, name, business_id, created_at, sync_status',

      // Users
      users: 'uuid, email, organisation_id, role, is_active, created_at, sync_status',

      // BCM Core
      criticalFunctions: 'uuid, name, department_id, created_at, sync_status',
      businessImpactAssessments:
        'uuid, function_id, reputational_impact, assessed_date, created_at, sync_status',
      businessContinuityPlans:
        'uuid, function_id, plan_status, version, review_due_date, created_at, sync_status',
      recoveryStrategies:
        'uuid, business_continuity_plan_id, recovery_strategy_type, created_at, sync_status',
      exerciseTests:
        'uuid, business_continuity_plan_id, exercise_test_type, date, passed, created_at, sync_status',

      // Risk & Compliance
      risks:
        'uuid, organisation_id, risk_category, impact_severity, inherent_risk_score, residual_risk_score, created_at, sync_status',
      complianceRecords:
        'uuid, organisation_id, compliance_standard, compliance_status, next_audit_due, created_at, sync_status',

      // Incidents
      incidents:
        'uuid, organisation_id, incident_severity, declared_at, closed_at, created_at, sync_status',

      // Workflows
      workflows:
        'uuid, workflow_type, workflow_state, priority, assigned_to, initiated_by, due_date, created_at, sync_status',

      // Notifications
      notifications:
        'uuid, recipient_id, notification_type, is_read, status, created_at, sync_status',
      notificationPreferences: 'uuid, user_id, notification_type',

      // Documents
      documents:
        'uuid, organisation_id, document_type, status, uploaded_by, created_at, sync_status',

      // Audit
      auditLogs:
        'uuid, user_id, organisation_id, action, audit_category, entity_type, entity_id, created_at, sync_status',

      // Rules
      rules:
        'uuid, rule_type, rule_trigger, status, entity_type, is_active, created_at, sync_status',
      ruleExecutionLogs: 'uuid, rule_id, entity_id, executed_at',

      // Sync
      pendingChanges:
        'uuid, entity_type, entity_id, operation_type, priority, created_at, sync_status',
      syncConflicts: 'uuid, entity_id, entity_type, resolved, detected_at',
      syncMetadata: 'uuid, key',

      // Cache
      cache: 'key, expiresAt, tags',
    })

    // Apply migrations
    this.applyMigrations()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Database {
    if (!Database._instance) {
      Database._instance = new Database()
    }
    return Database._instance
  }

  /**
   * Reset singleton (for testing)
   */
  static resetInstance(): void {
    if (Database._instance) {
      Database._instance.close()
      Database._instance = null
    }
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this._initialized) return

    try {
      // Open database connection
      await this.open()
      console.log('✓ Database connection opened')

      // Initialize repositories
      this.initializeRepositories()

      // Check database health
      await this.checkHealth()

      this._initialized = true
      console.log('✓ Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error(`Database initialization failed: ${(error as Error).message}`)
    }
  }

  /**
   * Initialize all repositories
   */
  private initializeRepositories(): void {
    this._repositories.set(
      'criticalFunctions',
      new CriticalFunctionRepository(this.criticalFunctions)
    )
    this._repositories.set('bia', new BIARepository(this.businessImpactAssessments))
    this._repositories.set('bcp', new BCPRepository(this.businessContinuityPlans))
    this._repositories.set(
      'recoveryStrategies',
      new RecoveryStrategyRepository(this.recoveryStrategies)
    )
    this._repositories.set('exerciseTests', new ExerciseTestRepository(this.exerciseTests))
    this._repositories.set(
      'complianceRecords',
      new ComplianceRecordRepository(this.complianceRecords)
    )
    this._repositories.set('incidents', new IncidentRepository(this.incidents))
    this._repositories.set('risks', new RiskRepository(this.risks))
    this._repositories.set('users', new UserRepository(this.users))
    this._repositories.set('workflows', new WorkflowRepository(this.workflows))
    this._repositories.set('notifications', new NotificationRepository(this.notifications))
    this._repositories.set(
      'notificationPreferences',
      new NotificationPreferenceRepository(this.notificationPreferences)
    )
    this._repositories.set('pendingChanges', new PendingChangeRepository(this.pendingChanges))
    this._repositories.set('syncConflicts', new SyncConflictRepository(this.syncConflicts))
    this._repositories.set('syncMetadata', new SyncMetadataRepository(this.syncMetadata))
    this._repositories.set('organisations', new OrganisationRepository(this.organisations))
    this._repositories.set('businessUnits', new BusinessUnitRepository(this.businessUnits))
    this._repositories.set('departments', new DepartmentRepository(this.departments))
    this._repositories.set('documents', new DocumentRepository(this.documents))
    this._repositories.set('auditLogs', new AuditLogRepository(this.auditLogs))
    this._repositories.set('rules', new RuleRepository(this.rules))
    this._repositories.set(
      'ruleExecutionLogs',
      new RuleExecutionLogRepository(this.ruleExecutionLogs)
    )
    this._repositories.set('cache', new CacheRepository(this.cache))
  }

  /**
   * Get repository by entity type
   */
  getRepository(entityType: string): any {
    const repo = this._repositories.get(entityType)
    if (!repo) {
      throw new Error(`Repository not found for entity type: ${entityType}`)
    }
    return repo
  }

  /**
   * Apply database migrations
   */
  private applyMigrations(): void {
    MIGRATIONS.forEach((migration) => {
      this.version(migration.version).stores(migration.stores)

      if (migration.upgrade) {
        this.version(migration.version).upgrade(async (tx) => {
          await migration.upgrade!(tx)
        })
      }
    })
  }

  /**
   * Check database health
   */
  private async checkHealth(): Promise<void> {
    try {
      const tableNames = this.tables.map((t) => t.name)
      console.log(`  Tables: ${tableNames.join(', ')}`)

      // Check if tables are accessible
      const count = await this.organisations.count()
      console.log(`  Organisation records: ${count}`)

      // Check storage usage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        if (estimate.usage && estimate.quota) {
          const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2)
          const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2)
          const percentage = ((estimate.usage / estimate.quota) * 100).toFixed(1)
          console.log(`  Storage: ${usageMB}MB / ${quotaMB}MB (${percentage}%)`)
        }
      }
    } catch (error) {
      console.warn('Database health check warning:', error)
    }
  }

  /**
   * Get database name
   */
  getName(): string {
    return this.name
  }

  /**
   * Get database version
   */
  getVersion(): number {
    return this.verno
  }

  /**
   * Get all table names
   */
  getTableNames(): string[] {
    return this.tables.map((t) => t.name)
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this._initialized && this.isOpen()
  }

  /**
   * Export database to JSON
   */
  async exportData(): Promise<Blob> {
    if (!this.isOpen()) {
      throw new Error('Database is not open')
    }
    return exportDB(this, { prettyJson: true })
  }

  /**
   * Import database from JSON
   */
  async importData(blob: Blob): Promise<void> {
    if (!this.isOpen()) {
      throw new Error('Database is not open')
    }
    await importDB(blob)
    console.log('✓ Database imported successfully')
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    tables: Array<{ name: string; count: number }>
    totalRecords: number
    storageUsed: string
    storageQuota: string
    storagePercentage: string
  }> {
    const tableStats: Array<{ name: string; count: number }> = []
    let totalRecords = 0

    for (const table of this.tables) {
      const count = await table.count()
      tableStats.push({ name: table.name, count })
      totalRecords += count
    }

    let storageUsed = '0'
    let storageQuota = '0'
    let storagePercentage = '0'

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      if (estimate.usage) storageUsed = (estimate.usage / (1024 * 1024)).toFixed(2)
      if (estimate.quota) storageQuota = (estimate.quota / (1024 * 1024)).toFixed(2)
      if (estimate.usage && estimate.quota) {
        storagePercentage = ((estimate.usage / estimate.quota) * 100).toFixed(1)
      }
    }

    return {
      tables: tableStats,
      totalRecords,
      storageUsed,
      storageQuota,
      storagePercentage,
    }
  }

  /**
   * Clear all data from all tables
   */
  async clearAll(): Promise<void> {
    const tableNames = this.tables.map((t) => t.name)
    for (const name of tableNames) {
      await this.table(name).clear()
    }
    console.log('✓ All database tables cleared')
  }

  /**
   * Clear specific tables
   */
  async clearTables(tableNames: string[]): Promise<void> {
    for (const name of tableNames) {
      if (this.tables.some((t) => t.name === name)) {
        await this.table(name).clear()
      }
    }
    console.log(`✓ Cleared tables: ${tableNames.join(', ')}`)
  }

  /**
   * Close database connection
   */
  async closeDatabase(): Promise<void> {
    if (this.isOpen()) {
      this.close()
      this._initialized = false
      console.log('✓ Database connection closed')
    }
  }

  /**
   * Delete database
   */
  async deleteDatabase(): Promise<void> {
    await this.closeDatabase()
    await Dexie.delete(this.name)
    Database._instance = null
    console.log('✓ Database deleted')
  }

  /**
   * Check if a table exists
   */
  tableExists(name: string): boolean {
    return this.tables.some((t) => t.name === name)
  }
}

// Export singleton instance
export const db = Database.getInstance()
