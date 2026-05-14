// src/services/db/migrations.ts

import type { Transaction } from 'dexie'

/**
 * Database Migration Interface
 */
export interface DatabaseMigration {
  version: number
  stores: Record<string, string>
  description?: string
  upgrade?: (tx: Transaction) => Promise<void>
}

/**
 * Database Migrations
 *
 * Each migration defines schema changes for a specific version.
 * Migrations are applied sequentially and are additive only.
 *
 * IMPORTANT: Never modify existing migrations - only add new ones.
 */
export const MIGRATIONS: DatabaseMigration[] = [
  // ============================================
  // Version 1: Initial Schema
  // ============================================
  {
    version: 1,
    description: 'Initial database schema with all core tables',
    stores: {
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
    },
  },

  // ============================================
  // Version 2: Add indexes for performance
  // ============================================
  {
    version: 2,
    description: 'Add performance indexes',
    stores: {
      // Add compound indexes for common queries
      criticalFunctions: 'uuid, name, department_id, created_at, sync_status, *department_created',
      risks:
        'uuid, organisation_id, risk_category, impact_severity, inherent_risk_score, residual_risk_score, created_at, sync_status, *organisation_category',
      incidents:
        'uuid, organisation_id, incident_severity, declared_at, closed_at, created_at, sync_status, *organisation_severity, *severity_declared',
      pendingChanges:
        'uuid, entity_type, entity_id, operation_type, priority, created_at, sync_status, *priority_created',
    },
  },

  // ============================================
  // Version 3: Add cache management
  // ============================================
  {
    version: 3,
    description: 'Enhanced cache management',
    stores: {
      cache: 'key, expiresAt, tags, createdAt',
    },
    upgrade: async (tx: Transaction) => {
      // Migrate existing cache entries to add createdAt
      const cacheTable = tx.table('cache')
      const entries = await cacheTable.toArray()

      for (const entry of entries) {
        if (!entry.createdAt) {
          await cacheTable.update(entry.key, { createdAt: Date.now() })
        }
      }
    },
  },

  // ============================================
  // Version 4: Add search indexes
  // ============================================
  {
    version: 4,
    description: 'Add full-text search indexes',
    stores: {
      documents:
        'uuid, organisation_id, document_type, status, uploaded_by, created_at, sync_status, *title_search, *tags_search',
      workflows:
        'uuid, workflow_type, workflow_state, priority, assigned_to, initiated_by, due_date, created_at, sync_status, *title_search, *state_priority',
      notifications:
        'uuid, recipient_id, notification_type, is_read, status, created_at, sync_status, *recipient_read, *recipient_type',
    },
  },

  // ============================================
  // Version 5: Add offline support enhancements
  // ============================================
  {
    version: 5,
    description: 'Enhanced offline support with retry tracking',
    stores: {
      pendingChanges:
        'uuid, entity_type, entity_id, operation_type, priority, attempts, created_at, sync_status, *priority_created, *entity_type_status',
    },
    upgrade: async (tx: Transaction) => {
      // Add attempts field to existing pending changes
      const pendingTable = tx.table('pendingChanges')
      const changes = await pendingTable.toArray()

      for (const change of changes) {
        if (change.attempts === undefined) {
          await pendingTable.update(change.uuid, { attempts: 0 })
        }
      }
    },
  },

  // ============================================
  // Version 6: Add user preferences
  // ============================================
  {
    version: 6,
    description: 'Add user preferences and settings storage',
    stores: {
      userPreferences: 'key, userId, value, updatedAt',
      appSettings: 'key, value',
    },
  },

  // ============================================
  // Version 7: Add audit trail enhancements
  // ============================================
  {
    version: 7,
    description: 'Enhanced audit logging with request context',
    stores: {
      auditLogs:
        'uuid, user_id, organisation_id, action, audit_category, severity, entity_type, entity_id, ip_address, session_id, created_at, sync_status, *user_action, *entity_changes',
    },
  },

  // ============================================
  // Version 8: Add data compression support
  // ============================================
  {
    version: 8,
    description: 'Add support for compressed storage',
    stores: {
      compressedData:
        'uuid, key, compressedValue, algorithm, originalSize, compressedSize, createdAt',
    },
  },
]

/**
 * Migration helper functions
 */
export const MigrationHelpers = {
  /**
   * Log migration progress
   */
  logMigration(version: number, description: string): void {
    console.log(`🔄 Migrating to v${version}: ${description}`)
  },

  /**
   * Check if migration should run
   */
  async shouldRunMigration(db: any, version: number): Promise<boolean> {
    const currentVersion = db.verno
    return currentVersion < version
  },

  /**
   * Get pending migrations
   */
  getPendingMigrations(currentVersion: number): DatabaseMigration[] {
    return MIGRATIONS.filter((m) => m.version > currentVersion)
  },

  /**
   * Get migration by version
   */
  getMigration(version: number): DatabaseMigration | undefined {
    return MIGRATIONS.find((m) => m.version === version)
  },

  /**
   * Get latest migration version
   */
  getLatestVersion(): number {
    return MIGRATIONS[MIGRATIONS.length - 1]?.version || 1
  },
}
