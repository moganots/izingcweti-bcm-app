import type { Transaction } from "dexie";

/**
 * Database Migration Interface
 *
 * Each migration defines schema changes for a specific version.
 * Migrations are applied sequentially and are additive only.
 *
 * IMPORTANT: Never modify existing migrations - only add new ones.
 *
 * Field naming follows the entity conventions (camelCase).
 */
export interface DatabaseMigration {
  version: number;
  stores: Record<string, string>;
  description?: string;
  upgrade?: (tx: Transaction) => Promise<void>;
}

/**
 * Database Migrations - Aligned with Frontend Entities
 */
export const MIGRATIONS: DatabaseMigration[] = [
  // ============================================
  // Version 1: Initial Schema
  // ============================================
  {
    version: 1,
    description: "Initial database schema with all core tables",
    stores: {
      // Tenant & Organisation
      tenants:
        "uuid, name, domainPrefix, email, status, tier, primaryRegion, [status+tier], deletedAt",
      tenantAuditLogs:
        "uuid, tenantId, action, performedBy, createdAt, [tenantId+createdAt], [action+createdAt], deletedAt",
      organisations:
        "uuid, tenantId, name, industryType, maturityScore, isActive, [tenantId+name], [tenantId+isActive], deletedAt",
      businessUnits:
        "uuid, organisationId, name, criticalityScore, isActive, [organisationId+name], [organisationId+isActive], deletedAt",
      departments:
        "uuid, businessUnitId, parentDepartmentId, name, isActive, [businessUnitId+name], [businessUnitId+isActive], deletedAt",

      // User & Auth
      users:
        "uuid, organisationId, departmentId, email, role, isActive, managerId, [organisationId+isActive], [departmentId+isActive], [role+isActive], deletedAt",
      authTokens:
        "uuid, organisationId, userId, tokenType, status, expiresAt, [userId+status], [organisationId+status], [token+status], deletedAt",
      settings:
        "uuid, userId, organisationId, category, isSystemDefault, deletedAt",

      // BCM
      criticalFunctions:
        "uuid, organisationId, departmentId, name, recoveryPriority, isActive, [departmentId+name], [organisationId+recoveryPriority], [departmentId+isActive], deletedAt",
      businessImpactAssessments:
        "uuid, organisationId, criticalFunctionId, assessedDate, [organisationId+assessedDate], deletedAt",
      businessContinuityPlans:
        "uuid, organisationId, criticalFunctionId, planName, planStatus, reviewDueDate, isActive, parentBcpId, [organisationId+planStatus], [organisationId+createdAt], deletedAt",
      bcpTemplates:
        "uuid, organisationId, templateName, category, isSystemTemplate, [organisationId+category], deletedAt",
      recoveryStrategies:
        "uuid, organisationId, businessContinuityPlanId, recoveryStrategyType, isPrimary, isActive, [organisationId+recoveryStrategyType], deletedAt",
      exerciseTests:
        "uuid, organisationId, businessContinuityPlanId, exerciseTestType, scheduledDate, executedDate, passed, [businessContinuityPlanId+scheduledDate], [organisationId+exerciseTestType], [passed+executedDate], deletedAt",
      incidents:
        "uuid, organisationId, businessContinuityPlanIdActivated, incidentTitle, incidentSeverity, incidentStatus, escalationLevel, escalationStatus, assignedTo, [organisationId+declaredAt], [organisationId+createdAt], [incidentSeverity+incidentStatus], [escalationStatus+escalatedAt], deletedAt",
      bcmLifecycleStatuses:
        "uuid, organisationId, phase, status, [organisationId+phase], deletedAt",

      // Risk
      risks:
        "uuid, organisationId, title, riskCategory, status, assignedTo, inherentRiskScore, residualRiskScore, [organisationId+status], [organisationId+createdAt], [riskCategory+inherentImpactLevel], [assignedTo+status], deletedAt",

      // Compliance
      complianceRecords:
        "uuid, organisationId, complianceStandard, complianceStatus, lastAuditDate, nextAuditDate, [organisationId+complianceStandard], [organisationId+complianceStatus], [organisationId+createdAt], deletedAt",

      // Workflow
      workflows:
        "uuid, organisationId, workflowType, workflowState, priority, initiatedBy, assignedTo, entityId, entityType, [organisationId+workflowState], [organisationId+createdAt], [workflowType+workflowState], [initiatedBy+createdAt], [assignedTo+workflowState], [entityId+entityType], deletedAt",

      // Documents
      documents:
        "uuid, organisationId, businessUnitId, departmentId, title, documentType, status, accessLevel, uploadedBy, [organisationId+documentType], [status+createdAt], [uploadedBy+createdAt], [organisationId+status], deletedAt",
      documentTemplates:
        "uuid, organisationId, name, documentType, category, isActive, deletedAt",

      // Notifications
      notifications:
        "uuid, organisationId, businessUnitId, departmentId, recipientId, senderId, notificationType, priority, status, entityId, entityType, isRead, [recipientId+createdAt], [status+createdAt], [notificationType+createdAt], [recipientId+status], [organisationId+createdAt], [entityId+entityType], deletedAt",
      notificationPreferences:
        "uuid, userId, notificationType, [userId+notificationType], deletedAt",
      notificationTemplates:
        "uuid, organisationId, notificationType, isActive, [organisationId+notificationType], [organisationId+isActive], deletedAt",

      // Audit
      auditLogs:
        "uuid, organisationId, userId, action, auditCategory, severity, entityType, entityId, isSensitive, createdAt, [entityType+entityId], [userId+action], [organisationId+createdAt], [action+createdAt], [auditCategory+createdAt], [severity+createdAt], deletedAt",
      auditRetentionPolicies:
        "uuid, organisationId, auditCategory, isActive, [organisationId+auditCategory], deletedAt",
      activityHistory:
        "uuid, entityId, entityType, userId, action, activityType, [entityId+entityType], [userId+createdAt], [action+createdAt], deletedAt",
      attachments:
        "uuid, entityId, entityType, uploadedBy, [entityId+entityType], [uploadedBy+createdAt], deletedAt",
      comments:
        "uuid, entityId, entityType, userId, parentCommentId, [entityId+entityType], [userId+createdAt], deletedAt",

      // Rules
      rules:
        "uuid, organisationId, name, ruleType, triggerEvent, status, priority, isActive, [organisationId+status], [ruleType+isActive], [priority+createdAt], [triggerEvent+isActive], [organisationId+name], deletedAt",
      ruleExecutionLogs:
        "uuid, ruleId, entityId, entityType, success, executedAt, [ruleId+executedAt], [entityId+entityType], [success+executedAt], deletedAt",

      // Cache
      cache:
        "key, expiresAt, tags, hitCount, sizeBytes, isCompressed, deletedAt",

      // Feature Toggles
      featureToggles:
        "uuid, organisationId, name, toggleType, status, environment, isActive, [name+environment+organisationId], [status+environment], [organisationId+createdAt], [organisationId+status], deletedAt",
      featureToggleOverrides:
        "uuid, organisationId, featureToggleId, overriddenBy, [featureToggleId+overriddenBy+organisationId], [featureToggleId+organisationId], [organisationId+overriddenBy], deletedAt",
      featureToggleAuditLogs:
        "uuid, featureToggleId, auditedBy, action, [featureToggleId+createdAt], [auditedBy+createdAt], [featureToggleId+action], deletedAt",

      // Sync
      pendingChanges:
        "uuid, entityType, entityId, operationType, priority, attempts, status, [entityType+entityId], [status+priority], [status+createdAt], deletedAt",
      syncConflicts:
        "uuid, entityId, entityType, conflictType, resolved, autoResolvable, detectedAt, [entityId+entityType], [resolved+detectedAt], [autoResolvable+resolved], deletedAt",
      syncMetadata: "uuid, key, deletedAt",

      // Training
      trainingCourses:
        "uuid, organisationId, name, level, status, category, isPublished, isMandatory, instructorId, [organisationId+name], [status+level], [isPublished+publishedAt], deletedAt",
      userCourseProgress:
        "uuid, userId, courseId, status, lastModuleId, [userId+courseId], [userId+status], [courseId+status], [userId+lastAccessedAt], deletedAt",
      certifications:
        "uuid, userId, certificationName, issueDate, expiryDate, isVerified, verifiedBy, [userId+certificationName], [userId+issueDate], deletedAt",
      attestationDocuments:
        "uuid, title, attestationVersion, isActive, [title+attestationVersion], deletedAt",
      userAttestations:
        "uuid, userId, attestationId, status, dueDate, [userId+attestationId], [userId+status], [attestationId+status], [userId+acknowledgedAt], [dueDate+status], deletedAt",

      // Governance
      governancePolicies:
        "uuid, organisationId, departmentId, name, category, status, ownerId, nextReviewDate, [organisationId+name], [organisationId+status], [organisationId+category], deletedAt",
      maturityAssessments:
        "uuid, organisationId, departmentId, assessedBy, assessedDate, level, [organisationId+assessedBy], [organisationId+assessedDate], [organisationId+level], [organisationId+departmentId+assessedDate], deletedAt",
      governanceActivities:
        "uuid, organisationId, departmentId, userId, action, targetType, targetId, [organisationId+createdAt], [userId+createdAt], [targetType+targetId], [organisationId+action], deletedAt",

      // Improvements
      lessons:
        "uuid, organisationId, businessUnitId, departmentId, status, source, priority, category, sourceId, sourceType, identifiedBy, [organisationId+status], [organisationId+source], [organisationId+priority], [organisationId+identifiedBy], [sourceId+sourceType], deletedAt",

      // Dashboard
      dashboardConfigs:
        "uuid, organisationId, userId, role, businessUnitId, departmentId, isActive, [organisationId+userId], [organisationId+isActive], deletedAt",

      // Reports
      reports:
        "uuid, organisationId, businessUnitId, departmentId, name, reportType, format, status, frequency, createdBy, [reportType+createdAt], [status+createdBy], [organisationId+status], deletedAt",
    },
  },

  // ============================================
  // Version 2: Add compound indexes for performance
  // ============================================
  {
    version: 2,
    description: "Add performance indexes for high-traffic tables",
    stores: {
      users:
        "uuid, organisationId, departmentId, email, role, isActive, managerId, [organisationId+isActive], [departmentId+isActive], [role+isActive], [organisationId+role], deletedAt",
      documents:
        "uuid, organisationId, businessUnitId, departmentId, title, documentType, status, accessLevel, uploadedBy, [organisationId+documentType], [status+createdAt], [uploadedBy+createdAt], [organisationId+status], [documentType+status], deletedAt",
      risks:
        "uuid, organisationId, title, riskCategory, status, assignedTo, inherentRiskScore, residualRiskScore, [organisationId+status], [organisationId+createdAt], [riskCategory+inherentImpactLevel], [assignedTo+status], [organisationId+riskCategory], deletedAt",
      incidents:
        "uuid, organisationId, businessContinuityPlanIdActivated, incidentTitle, incidentSeverity, incidentStatus, escalationLevel, escalationStatus, assignedTo, [organisationId+declaredAt], [organisationId+createdAt], [incidentSeverity+incidentStatus], [escalationStatus+escalatedAt], [organisationId+incidentStatus], deletedAt",
      workflows:
        "uuid, organisationId, workflowType, workflowState, priority, initiatedBy, assignedTo, entityId, entityType, [organisationId+workflowState], [organisationId+createdAt], [workflowType+workflowState], [initiatedBy+createdAt], [assignedTo+workflowState], [entityId+entityType], [organisationId+workflowType], deletedAt",
    },
  },

  // ============================================
  // Version 3: Add tenant audit log indexes
  // ============================================
  {
    version: 3,
    description: "Add tenant audit log indexes",
    stores: {
      tenantAuditLogs:
        "uuid, tenantId, action, performedBy, createdAt, [tenantId+createdAt], [action+createdAt], [performedBy+createdAt], [tenantId+action], deletedAt",
    },
  },

  // ============================================
  // Version 4: Add training and certification indexes
  // ============================================
  {
    version: 4,
    description: "Add training and certification indexes",
    stores: {
      trainingCourses:
        "uuid, organisationId, name, level, status, category, isPublished, isMandatory, instructorId, [organisationId+name], [status+level], [isPublished+publishedAt], [organisationId+isPublished], deletedAt",
      userCourseProgress:
        "uuid, userId, courseId, status, lastModuleId, [userId+courseId], [userId+status], [courseId+status], [userId+lastAccessedAt], [status+completedAt], deletedAt",
      certifications:
        "uuid, userId, certificationName, issueDate, expiryDate, isVerified, verifiedBy, [userId+certificationName], [userId+issueDate], [isVerified+expiryDate], deletedAt",
    },
  },

  // ============================================
  // Version 5: Add governance and lesson indexes
  // ============================================
  {
    version: 5,
    description: "Add governance and lesson indexes",
    stores: {
      governancePolicies:
        "uuid, organisationId, departmentId, name, category, status, ownerId, nextReviewDate, [organisationId+name], [organisationId+status], [organisationId+category], [organisationId+nextReviewDate], deletedAt",
      lessons:
        "uuid, organisationId, businessUnitId, departmentId, status, source, priority, category, sourceId, sourceType, identifiedBy, [organisationId+status], [organisationId+source], [organisationId+priority], [organisationId+identifiedBy], [sourceId+sourceType], [organisationId+priority+status], deletedAt",
    },
  },

  // ============================================
  // Version 6: Add dashboard and report indexes
  // ============================================
  {
    version: 6,
    description: "Add dashboard and report indexes",
    stores: {
      dashboardConfigs:
        "uuid, organisationId, userId, role, businessUnitId, departmentId, isActive, [organisationId+userId], [organisationId+isActive], [organisationId+role], [userId+isActive], deletedAt",
      reports:
        "uuid, organisationId, businessUnitId, departmentId, name, reportType, format, status, frequency, createdBy, [reportType+createdAt], [status+createdBy], [organisationId+status], [organisationId+reportType], [status+frequency], deletedAt",
    },
  },

  // ============================================
  // Version 7: Add audit activity history and comments indexes
  // ============================================
  {
    version: 7,
    description: "Add activity history and comments indexes",
    stores: {
      activityHistory:
        "uuid, entityId, entityType, userId, action, activityType, [entityId+entityType], [userId+createdAt], [action+createdAt], [activityType+createdAt], deletedAt",
      comments:
        "uuid, entityId, entityType, userId, parentCommentId, [entityId+entityType], [userId+createdAt], [parentCommentId+createdAt], deletedAt",
      attachments:
        "uuid, entityId, entityType, uploadedBy, [entityId+entityType], [uploadedBy+createdAt], [entityType+fileType], deletedAt",
    },
  },

  // ============================================
  // Version 8: Add BCM lifecycle and feature toggle audit indexes
  // ============================================
  {
    version: 8,
    description: "Add BCM lifecycle and feature toggle audit indexes",
    stores: {
      bcmLifecycleStatuses:
        "uuid, organisationId, phase, status, assignedTo, [organisationId+phase], [phase+status], [organisationId+status], deletedAt",
      featureToggleAuditLogs:
        "uuid, featureToggleId, auditedBy, action, [featureToggleId+createdAt], [auditedBy+createdAt], [featureToggleId+action], [action+createdAt], deletedAt",
    },
  },
];

/**
 * Migration helper functions
 */
export const MigrationHelpers = {
  /**
   * Log migration progress
   */
  logMigration(version: number, description: string): void {
    console.log(`🔄 Migrating to v${version}: ${description}`);
  },

  /**
   * Check if migration should run
   */
  async shouldRunMigration(db: any, version: number): Promise<boolean> {
    const currentVersion = db.verno;
    return currentVersion < version;
  },

  /**
   * Get pending migrations
   */
  getPendingMigrations(currentVersion: number): DatabaseMigration[] {
    return MIGRATIONS.filter((m) => m.version > currentVersion);
  },

  /**
   * Get migration by version
   */
  getMigration(version: number): DatabaseMigration | undefined {
    return MIGRATIONS.find((m) => m.version === version);
  },

  /**
   * Get latest migration version
   */
  getLatestVersion(): number {
    return MIGRATIONS[MIGRATIONS.length - 1]?.version || 1;
  },

  /**
   * Get total table count from latest migration
   */
  getTableCount(): number {
    const latest = MIGRATIONS[MIGRATIONS.length - 1];
    return latest ? Object.keys(latest.stores).length : 0;
  },

  /**
   * Get all table names from latest migration
   */
  getTableNames(): string[] {
    const latest = MIGRATIONS[MIGRATIONS.length - 1];
    return latest ? Object.keys(latest.stores) : [];
  },
};