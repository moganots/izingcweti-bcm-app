import Dexie, { Table } from "dexie";

// ============================================
// Import all entity types - Aligned with new structure
// ============================================

// Core
import type { BaseEntity } from "../../core/base/base.entity";

// Settings
import type { Settings } from "../../models/settings/settings.entity";

// User & Auth
import type {
  User,
  AuthToken,
} from "../../models/user/user.entity";

// Organisation
import type {
  Organisation,
  BusinessUnit,
  Department,
} from "../../models/organisation/organisation.entity";

// Tenant
import type {
  Tenant,
  TenantAuditLog,
} from "../../models/tenant/tenant.entity";

// Report
import type { Report } from "../../models/report/report.entity";

// Document
import type {
  Document,
  DocumentTemplate,
} from "../../models/document/document.entity";

// Notification
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
} from "../../models/notification/notification.entity";

// Audit
import type {
  AuditLog,
  AuditRetentionPolicy,
  ActivityHistory,
  Attachment,
  Comment,
} from "../../models/audit/audit.entity";

// BCM
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  BCPTemplate,
  RecoveryStrategy,
  ExerciseTest,
  Incident,
  BCMLifecycleStatus,
} from "../../models/bcm/bcm.entity";

// Risk
import type { Risk } from "../../models/risk/risk.entity";

// Workflow
import type { Workflow } from "../../models/workflow/workflow.entity";

// Compliance
import type { ComplianceRecord } from "../../models/compliance/compliance.entity";

// Rule
import type {
  Rule,
  RuleExecutionLog,
} from "../../models/rule/rule.entity";

// Cache
import type { Cache } from "../../models/cache/cache.entity";

// Feature Toggle
import type {
  FeatureToggle,
  FeatureToggleOverride,
  FeatureToggleAuditLog,
} from "../../models/feature-toggle/feature-toggle.entity";

// Sync
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
} from "../../models/sync/sync.entity";

// Training
import type {
  TrainingCourse,
  UserCourseProgress,
  Certification,
  AttestationDocument,
  UserAttestation,
} from "../../models/training/training.entity";

// Governance
import type {
  GovernancePolicy,
  MaturityAssessment,
  GovernanceActivity,
} from "../../models/governance/governance.entity";

// Improvements (Lesson)
import type { LessonEntity } from "../../models/improvements/lesson.entity";

// Dashboard
import type { DashboardConfig } from "../../models/dashboard/dashboard.entity";

// ============================================
// Sync Status (Local to this file)
// ============================================
export const SyncStatus = {
  PENDING: "PENDING",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
  CONFLICT: "CONFLICT",
} as const;

export type SyncStatusType = (typeof SyncStatus)[keyof typeof SyncStatus];

// ============================================
// Sync Repository Interface
// ============================================

export interface SyncRepository<T = any> {
  findById: (id: string) => Promise<T | undefined>;
  findAll: () => Promise<T[]>;
  findOne: (filter: Record<string, any>) => Promise<T | undefined>;
  findMany: (filter: Record<string, any>) => Promise<T[]>;
  findWhere: (filter: Record<string, any>) => Promise<T[]>;
  findWithPagination: (
    filter: Record<string, any>,
    page?: number,
    limit?: number
  ) => Promise<{ data: T[]; total: number; page: number; limit: number }>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  upsert: (data: T) => Promise<T>;
  delete: (id: string) => Promise<void>;
  softDelete: (id: string, deletedBy?: string) => Promise<T | undefined>;
  restore: (id: string) => Promise<T | undefined>;
  exists: (id: string) => Promise<boolean>;
  count: () => Promise<number>;
  clearAll: () => Promise<void>;
  bulkCreate: (items: Partial<T>[]) => Promise<T[]>;
  bulkUpdate: (items: Array<{ uuid: string; data: Partial<T> }>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  getPending: () => Promise<T[]>;
  getSynced: () => Promise<T[]>;
  getDeleted: () => Promise<T[]>;
  markSynced: (id: string) => Promise<void>;
  markPending: (id: string) => Promise<void>;

  // ---- Sync-specific (only present for certain tables) ----
  incrementAttempts?: (id: string) => Promise<void>;
  getOrderedByPriority?: () => Promise<T[]>;
  getPendingCount?: () => Promise<number>;
  getFailedChanges?: () => Promise<T[]>;
  getLastSyncToken?: () => Promise<string | null>;
  setLastSyncToken?: (token: string) => Promise<void>;
  getLastSyncTime?: () => Promise<string | null>;
  setLastSyncTime?: (time: string) => Promise<void>;
  getByKey?: (key: string) => Promise<T | undefined>;
}

// ============================================
// BCMDatabase Class
// ============================================

export class BCMDatabase extends Dexie {
  // ==========================================
  // Tenant & Organisation Tables
  // ==========================================
  tenants!: Table<Tenant, string>;
  tenantAuditLogs!: Table<TenantAuditLog, string>;
  organisations!: Table<Organisation, string>;
  businessUnits!: Table<BusinessUnit, string>;
  departments!: Table<Department, string>;

  // ==========================================
  // User & Auth Tables
  // ==========================================
  users!: Table<User, string>;
  authTokens!: Table<AuthToken, string>;
  settings!: Table<Settings, string>;

  // ==========================================
  // BCM Tables
  // ==========================================
  criticalFunctions!: Table<CriticalFunction, string>;
  businessImpactAssessments!: Table<BusinessImpactAssessment, string>;
  businessContinuityPlans!: Table<BusinessContinuityPlan, string>;
  bcpTemplates!: Table<BCPTemplate, string>;
  recoveryStrategies!: Table<RecoveryStrategy, string>;
  exerciseTests!: Table<ExerciseTest, string>;
  incidents!: Table<Incident, string>;
  bcmLifecycleStatuses!: Table<BCMLifecycleStatus, string>;

  // ==========================================
  // Risk & Compliance Tables
  // ==========================================
  risks!: Table<Risk, string>;
  complianceRecords!: Table<ComplianceRecord, string>;

  // ==========================================
  // Workflow Tables
  // ==========================================
  workflows!: Table<Workflow, string>;

  // ==========================================
  // Document Tables
  // ==========================================
  documents!: Table<Document, string>;
  documentTemplates!: Table<DocumentTemplate, string>;

  // ==========================================
  // Notification Tables
  // ==========================================
  notifications!: Table<Notification, string>;
  notificationPreferences!: Table<NotificationPreference, string>;
  notificationTemplates!: Table<NotificationTemplate, string>;

  // ==========================================
  // Audit Tables
  // ==========================================
  auditLogs!: Table<AuditLog, string>;
  auditRetentionPolicies!: Table<AuditRetentionPolicy, string>;
  activityHistory!: Table<ActivityHistory, string>;
  attachments!: Table<Attachment, string>;
  comments!: Table<Comment, string>;

  // ==========================================
  // Rules Engine Tables
  // ==========================================
  rules!: Table<Rule, string>;
  ruleExecutionLogs!: Table<RuleExecutionLog, string>;

  // ==========================================
  // Cache Tables
  // ==========================================
  cache!: Table<Cache, string>;

  // ==========================================
  // Feature Toggle Tables
  // ==========================================
  featureToggles!: Table<FeatureToggle, string>;
  featureToggleOverrides!: Table<FeatureToggleOverride, string>;
  featureToggleAuditLogs!: Table<FeatureToggleAuditLog, string>;

  // ==========================================
  // Sync Tables
  // ==========================================
  pendingChanges!: Table<PendingChange, string>;
  syncConflicts!: Table<SyncConflict, string>;
  syncMetadata!: Table<SyncMetadata, string>;

  // ==========================================
  // Training Tables
  // ==========================================
  trainingCourses!: Table<TrainingCourse, string>;
  userCourseProgress!: Table<UserCourseProgress, string>;
  certifications!: Table<Certification, string>;
  attestationDocuments!: Table<AttestationDocument, string>;
  userAttestations!: Table<UserAttestation, string>;

  // ==========================================
  // Governance Tables
  // ==========================================
  governancePolicies!: Table<GovernancePolicy, string>;
  maturityAssessments!: Table<MaturityAssessment, string>;
  governanceActivities!: Table<GovernanceActivity, string>;

  // ==========================================
  // Improvements Tables
  // ==========================================
  lessons!: Table<LessonEntity, string>;

  // ==========================================
  // Dashboard Tables
  // ==========================================
  dashboardConfigs!: Table<DashboardConfig, string>;

  // ==========================================
  // Report Tables
  // ==========================================
  reports!: Table<Report, string>;

  private static instance: BCMDatabase | null = null;

  constructor() {
    super("BCMDatabase");

    // ==========================================
    // Version 1: Initial schema - Core entities
    // ==========================================
    this.version(1).stores({
      // Tenant & Organisation
      tenants:
        "uuid, name, domainPrefix, email, status, tier, primaryRegion, [status+tier], deletedAt",
      tenantAuditLogs:
        "uuid, tenantId, action, performedBy, createdAt, [tenantId+createdAt], [action+createdAt]",
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
      cache: "key, expiresAt, tags, hitCount, sizeBytes, isCompressed, deletedAt",

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
    });

    // ==========================================
    // Version 2: Add compound indexes for performance
    // ==========================================
    this.version(2).stores({
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
    });

    // ==========================================
    // Version 3: Add tenant audit log indexes
    // ==========================================
    this.version(3).stores({
      tenantAuditLogs:
        "uuid, tenantId, action, performedBy, createdAt, [tenantId+createdAt], [action+createdAt], [performedBy+createdAt], [tenantId+action], deletedAt",
    });

    // ==========================================
    // Version 4: Add training and certification indexes
    // ==========================================
    this.version(4).stores({
      trainingCourses:
        "uuid, organisationId, name, level, status, category, isPublished, isMandatory, instructorId, [organisationId+name], [status+level], [isPublished+publishedAt], [organisationId+isPublished], deletedAt",
      userCourseProgress:
        "uuid, userId, courseId, status, lastModuleId, [userId+courseId], [userId+status], [courseId+status], [userId+lastAccessedAt], [status+completedAt], deletedAt",
      certifications:
        "uuid, userId, certificationName, issueDate, expiryDate, isVerified, verifiedBy, [userId+certificationName], [userId+issueDate], [isVerified+expiryDate], deletedAt",
    });

    // ==========================================
    // Version 5: Add governance and lesson indexes
    // ==========================================
    this.version(5).stores({
      governancePolicies:
        "uuid, organisationId, departmentId, name, category, status, ownerId, nextReviewDate, [organisationId+name], [organisationId+status], [organisationId+category], [organisationId+nextReviewDate], deletedAt",
      lessons:
        "uuid, organisationId, businessUnitId, departmentId, status, source, priority, category, sourceId, sourceType, identifiedBy, [organisationId+status], [organisationId+source], [organisationId+priority], [organisationId+identifiedBy], [sourceId+sourceType], [organisationId+priority+status], deletedAt",
    });

    // ==========================================
    // Version 6: Add dashboard and report indexes
    // ==========================================
    this.version(6).stores({
      dashboardConfigs:
        "uuid, organisationId, userId, role, businessUnitId, departmentId, isActive, [organisationId+userId], [organisationId+isActive], [organisationId+role], [userId+isActive], deletedAt",
      reports:
        "uuid, organisationId, businessUnitId, departmentId, name, reportType, format, status, frequency, createdBy, [reportType+createdAt], [status+createdBy], [organisationId+status], [organisationId+reportType], [status+frequency], deletedAt",
    });

    // ==========================================
    // Version 7: Add audit activity history and comments indexes
    // ==========================================
    this.version(7).stores({
      activityHistory:
        "uuid, entityId, entityType, userId, action, activityType, [entityId+entityType], [userId+createdAt], [action+createdAt], [activityType+createdAt], deletedAt",
      comments:
        "uuid, entityId, entityType, userId, parentCommentId, [entityId+entityType], [userId+createdAt], [parentCommentId+createdAt], deletedAt",
      attachments:
        "uuid, entityId, entityType, uploadedBy, [entityId+entityType], [uploadedBy+createdAt], [entityType+fileType], deletedAt",
    });

    // ==========================================
    // Version 8: Add BCM lifecycle and feature toggle audit indexes
    // ==========================================
    this.version(8).stores({
      bcmLifecycleStatuses:
        "uuid, organisationId, phase, status, assignedTo, [organisationId+phase], [phase+status], [organisationId+status], deletedAt",
      featureToggleAuditLogs:
        "uuid, featureToggleId, auditedBy, action, [featureToggleId+createdAt], [auditedBy+createdAt], [featureToggleId+action], [action+createdAt], deletedAt",
    });
  }

  static getInstance(): BCMDatabase {
    if (!BCMDatabase.instance) {
      BCMDatabase.instance = new BCMDatabase();
    }
    return BCMDatabase.instance;
  }

  async initialize(): Promise<void> {
    await this.open();
  }

  isDbOpen(): boolean {
    return this.isOpen();
  }

  getName(): string {
    return this.name;
  }

  getVersion(): number {
    return this.verno;
  }

  getTableNames(): string[] {
    return Object.keys(this._allTables);
  }

    private generateUuid(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ============================================
  // Repository Factory
  // ============================================

  /**
   * Create a repository wrapper with common CRUD operations
   */
  private createRepository<T extends BaseEntity>(table: Table<T, string>) {
    return {
      table,

      // ==========================================
      // Basic CRUD
      // ==========================================
      findById: async (id: string): Promise<T | undefined> => {
        const record = await table.get(id);
        if (record && (record as any).deletedAt) return undefined;
        return record;
      },

      findAll: async (): Promise<T[]> => {
        const records = await table.toArray();
        return records.filter((r) => !(r as any).deletedAt);
      },

      findOne: async (filter: Record<string, any>): Promise<T | undefined> => {
        const [key, value] = Object.entries(filter)[0]!;
        const record = await table.where(key).equals(value).first();
        if (record && (record as any).deletedAt) return undefined;
        return record;
      },

      findMany: async (filter: Record<string, any>): Promise<T[]> => {
        const [key, value] = Object.entries(filter)[0]!;
        const records = await table.where(key).equals(value).toArray();
        return records.filter((r) => !(r as any).deletedAt);
      },

      findWhere: async (filter: Record<string, any>): Promise<T[]> => {
        let collection: Dexie.Collection<T, any> | null = null;
        for (const [key, value] of Object.entries(filter)) {
          if (collection === null) {
            collection = table.where(key).equals(value);
          } else {
            collection = collection.and((item: any) => item[key] === value);
          }
        }
        const records = collection ? await collection.toArray() : [];
        return records.filter((r) => !(r as any).deletedAt);
      },

      findWithPagination: async (
        filter: Record<string, any>,
        page: number = 1,
        limit: number = 20
      ): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
      }> => {
        const offset = (page - 1) * limit;
        let collection: Dexie.Collection<T, any> | null = null;

        for (const [key, value] of Object.entries(filter)) {
          if (collection === null) {
            collection = table.where(key).equals(value);
          } else {
            collection = collection.and((item: any) => item[key] === value);
          }
        }

        const allRecords = collection
          ? await collection.toArray()
          : await table.toArray();
        const activeRecords = allRecords.filter(
          (r) => !(r as any).deletedAt
        );
        const total = activeRecords.length;
        const data = activeRecords.slice(offset, offset + limit);

        return { data, total, page, limit };
      },

      // ==========================================
      // Create / Update / Delete
      // ==========================================
      create: async (data: Partial<T>): Promise<T> => {
        const now = new Date();
        const id = this.generateUuid();

        const record = {
          ...data,
          uuid: id,
          createdAt: (data as any).createdAt || now,
          updatedAt: now,
          version: (data as any).version || 1,
          syncStatus: SyncStatus.PENDING,
        } as unknown as T;

        await table.add(record);
        return record;
      },

      update: async (id: string, data: Partial<T>): Promise<T | undefined> => {
        const now = new Date();
        await table.update(id, {
          ...data,
          updatedAt: now,
          syncStatus: SyncStatus.PENDING,
        } as any);
        return await table.get(id);
      },

      upsert: async (data: T): Promise<T> => {
        const existing = await table.get(data.uuid);
        const now = new Date();

        if (existing) {
          await table.update(data.uuid, {
            ...data,
            updatedAt: now,
            syncStatus: SyncStatus.PENDING,
          } as any);
          return (await table.get(data.uuid)) as T;
        } else {
          const record = {
            ...data,
            createdAt: data.createdAt || now,
            updatedAt: now,
            version: data.version || 1,
            syncStatus: SyncStatus.PENDING,
          } as T;
          await table.add(record);
          return record;
        }
      },

      delete: async (id: string): Promise<void> => {
        await table.delete(id);
      },

      softDelete: async (
        id: string,
        deletedBy: string = "system"
      ): Promise<T | undefined> => {
        const record = await table.get(id);
        if (record) {
          const now = new Date();
          await table.update(id, {
            deletedAt: now,
            deletedBy: deletedBy,
            updatedAt: now,
            syncStatus: SyncStatus.PENDING,
          } as any);
          return await table.get(id);
        }
        return undefined;
      },

      restore: async (id: string): Promise<T | undefined> => {
        const record = await table.get(id);
        if (record) {
          const now = new Date();
          await table.update(id, {
            deletedAt: undefined,
            deletedBy: undefined,
            updatedAt: now,
            syncStatus: SyncStatus.PENDING,
          } as any);
          return await table.get(id);
        }
        return undefined;
      },

      exists: async (id: string): Promise<boolean> => {
        const record = await table.get(id);
        return !!record && !(record as any).deletedAt;
      },

      // ==========================================
      // Count / Bulk Operations
      // ==========================================
      count: async (): Promise<number> => {
        const records = await table.toArray();
        return records.filter((r) => !(r as any).deletedAt).length;
      },

      clearAll: async (): Promise<void> => {
        await table.clear();
      },

      bulkCreate: async (items: Partial<T>[]): Promise<T[]> => {
        const now = new Date();
        const records = items.map((item) => ({
          ...item,
          uuid:
            (item as any).uuid || this.generateUuid(),
          createdAt: (item as any).createdAt || now,
          updatedAt: now,
          version: (item as any).version || 1,
          syncStatus: SyncStatus.PENDING,
        })) as unknown as T[];

        await table.bulkAdd(records);
        return records;
      },

      bulkUpdate: async (
        items: Array<{ uuid: string; data: Partial<T> }>
      ): Promise<void> => {
        const now = new Date();
        for (const item of items) {
          await table.update(item.uuid, {
            ...item.data,
            updatedAt: now,
            syncStatus: SyncStatus.PENDING,
          } as any);
        }
      },

      bulkDelete: async (ids: string[]): Promise<void> => {
        await table.bulkDelete(ids);
      },

      // ==========================================
      // Sync-specific
      // ==========================================
      getPending: async (): Promise<T[]> => {
        const records = await table.toArray();
        return records.filter(
          (r) =>
            (r as any).syncStatus === SyncStatus.PENDING &&
            !(r as any).deletedAt
        );
      },

      getSynced: async (): Promise<T[]> => {
        const records = await table.toArray();
        return records.filter(
          (r) =>
            (r as any).syncStatus === SyncStatus.SYNCED &&
            !(r as any).deletedAt
        );
      },

      getDeleted: async (): Promise<T[]> => {
        const records = await table.toArray();
        return records.filter((r) => (r as any).deletedAt != null);
      },

      markSynced: async (id: string): Promise<void> => {
        await table.update(id, { syncStatus: SyncStatus.SYNCED } as any);
      },

      markPending: async (id: string): Promise<void> => {
        await table.update(id, { syncStatus: SyncStatus.PENDING } as any);
      },
    };
  }

  // ============================================
  // Repository Getters
  // ============================================

    /**
   * Get a repository by table name.
   * The returned object is always fully typed.
   */
  getRepository(tableName: string): SyncRepository | null {
    const table = (this as any)[tableName] as Table<any, string> | undefined;
    if (!table) {
      console.warn(`Table not found: ${tableName}`);
      return null;
    }

    const baseRepo = this.createRepository(table) as SyncRepository;

    // ---- pendingChanges extra methods ----
    if (tableName === 'pendingChanges') {
      return {
        ...baseRepo,
        incrementAttempts: async (id: string) => {
          const record = await table.get(id);
          if (record) {
            await table.update(id, {
              attempts: ((record as any).attempts ?? 0) + 1,
              updatedAt: new Date().toISOString(),
            } as any);
          }
        },
        getOrderedByPriority: async () => {
          const records = await table.toArray();
          return records
            .filter((r: any) => !r.deletedAt)
            .sort(
              (a: any, b: any) => (a.priority ?? 3) - (b.priority ?? 3),
            );
        },
        getPendingCount: async () => {
          const records = await table.toArray();
          return records.filter(
            (r: any) => r.status === 'Pending' && !r.deletedAt,
          ).length;
        },
        getFailedChanges: async () => {
          const records = await table.toArray();
          return records.filter(
            (r: any) =>
              r.status === 'Failed' || (r.attempts ?? 0) >= 5,
          );
        },
      };
    }

    // ---- syncMetadata extra methods ----
    if (tableName === 'syncMetadata') {
      return {
        ...baseRepo,
        getByKey: async (key: string) =>
          await table.where('key').equals(key).first(),
        getLastSyncToken: async () => {
          const record = await table.where('key').equals('last_sync_token').first();
          return (record as any)?.value ?? null;
        },
        setLastSyncToken: async (token: string) =>
          this.setSyncMetadata('last_sync_token', token),
        getLastSyncTime: async () => {
          const record = await table.where('key').equals('last_sync_time').first();
          return (record as any)?.value ?? null;
        },
        setLastSyncTime: async (time: string) =>
          this.setSyncMetadata('last_sync_time', time),
      };
    }

    return baseRepo;
  }

  // Tenant & Organisation
  getTenantRepository() {
    return this.createRepository(this.tenants);
  }

  getTenantAuditLogRepository() {
    return this.createRepository(this.tenantAuditLogs);
  }

  getOrganisationRepository() {
    return this.createRepository(this.organisations);
  }

  getBusinessUnitRepository() {
    return this.createRepository(this.businessUnits);
  }

  getDepartmentRepository() {
    return this.createRepository(this.departments);
  }

  // User & Auth
  getUserRepository() {
    return this.createRepository(this.users);
  }

  getAuthTokenRepository() {
    return this.createRepository(this.authTokens);
  }

  getSettingsRepository() {
    return this.createRepository(this.settings);
  }

  // BCM
  getCriticalFunctionRepository() {
    return this.createRepository(this.criticalFunctions);
  }

  getBusinessImpactAssessmentRepository() {
    return this.createRepository(this.businessImpactAssessments);
  }

  getBusinessContinuityPlanRepository() {
    return this.createRepository(this.businessContinuityPlans);
  }

  getBCPTemplateRepository() {
    return this.createRepository(this.bcpTemplates);
  }

  getRecoveryStrategyRepository() {
    return this.createRepository(this.recoveryStrategies);
  }

  getExerciseTestRepository() {
    return this.createRepository(this.exerciseTests);
  }

  getIncidentRepository() {
    return this.createRepository(this.incidents);
  }

  getBCMLifecycleStatusRepository() {
    return this.createRepository(this.bcmLifecycleStatuses);
  }

  // Risk & Compliance
  getRiskRepository() {
    return this.createRepository(this.risks);
  }

  getComplianceRecordRepository() {
    return this.createRepository(this.complianceRecords);
  }

  // Workflow
  getWorkflowRepository() {
    return this.createRepository(this.workflows);
  }

  // Documents
  getDocumentRepository() {
    return this.createRepository(this.documents);
  }

  getDocumentTemplateRepository() {
    return this.createRepository(this.documentTemplates);
  }

  // Notifications
  getNotificationRepository() {
    return this.createRepository(this.notifications);
  }

  getNotificationPreferenceRepository() {
    return this.createRepository(this.notificationPreferences);
  }

  getNotificationTemplateRepository() {
    return this.createRepository(this.notificationTemplates);
  }

  // Audit
  getAuditLogRepository() {
    return this.createRepository(this.auditLogs);
  }

  getAuditRetentionPolicyRepository() {
    return this.createRepository(this.auditRetentionPolicies);
  }

  getActivityHistoryRepository() {
    return this.createRepository(this.activityHistory);
  }

  getAttachmentRepository() {
    return this.createRepository(this.attachments);
  }

  getCommentRepository() {
    return this.createRepository(this.comments);
  }

  // Rules
  getRuleRepository() {
    return this.createRepository(this.rules);
  }

  getRuleExecutionLogRepository() {
    return this.createRepository(this.ruleExecutionLogs);
  }

  // Cache
  getCacheRepository() {
    return this.createRepository(this.cache);
  }

  // Feature Toggles
  getFeatureToggleRepository() {
    return this.createRepository(this.featureToggles);
  }

  getFeatureToggleOverrideRepository() {
    return this.createRepository(this.featureToggleOverrides);
  }

  getFeatureToggleAuditLogRepository() {
    return this.createRepository(this.featureToggleAuditLogs);
  }

  // Sync
  getPendingChangeRepository() {
    return this.createRepository(this.pendingChanges);
  }

  getSyncConflictRepository() {
    return this.createRepository(this.syncConflicts);
  }

  getSyncMetadataRepository() {
    return this.createRepository(this.syncMetadata);
  }

  // Training
  getTrainingCourseRepository() {
    return this.createRepository(this.trainingCourses);
  }

  getUserCourseProgressRepository() {
    return this.createRepository(this.userCourseProgress);
  }

  getCertificationRepository() {
    return this.createRepository(this.certifications);
  }

  getAttestationDocumentRepository() {
    return this.createRepository(this.attestationDocuments);
  }

  getUserAttestationRepository() {
    return this.createRepository(this.userAttestations);
  }

  // Governance
  getGovernancePolicyRepository() {
    return this.createRepository(this.governancePolicies);
  }

  getMaturityAssessmentRepository() {
    return this.createRepository(this.maturityAssessments);
  }

  getGovernanceActivityRepository() {
    return this.createRepository(this.governanceActivities);
  }

  // Improvements
  getLessonRepository() {
    return this.createRepository(this.lessons);
  }

  // Dashboard
  getDashboardConfigRepository() {
    return this.createRepository(this.dashboardConfigs);
  }

  // Reports
  getReportRepository() {
    return this.createRepository(this.reports);
  }

  // ============================================
  // Specialized Methods
  // ============================================

  // ==========================================
  // Pending Changes Specific
  // ==========================================
  async getPendingChangesByPriority(): Promise<PendingChange[]> {
    return await this.pendingChanges.orderBy("priority").toArray();
  }

  async getPendingChangesByEntity(
    entityType: string
  ): Promise<PendingChange[]> {
    return await this.pendingChanges
      .where("entityType")
      .equals(entityType)
      .toArray();
  }

  async getPendingChangesByEntityId(
    entityId: string
  ): Promise<PendingChange[]> {
    return await this.pendingChanges
      .where("entityId")
      .equals(entityId)
      .toArray();
  }

  async getPendingCount(): Promise<number> {
    return await this.pendingChanges
      .where("status")
      .equals("Pending")
      .count();
  }

  async getFailedChanges(): Promise<PendingChange[]> {
    return await this.pendingChanges
      .where("status")
      .equals("Failed")
      .toArray();
  }

  async incrementAttempts(id: string): Promise<void> {
    const record = await this.pendingChanges.get(id);
    if (record) {
      const attempts = (record.attempts || 0) + 1;
      await this.pendingChanges.update(id, { attempts });
    }
  }

  // ==========================================
  // Sync Metadata Specific
  // ==========================================
  async getLastSyncToken(): Promise<string | null> {
    const record = await this.syncMetadata
      .where("key")
      .equals("last_sync_token")
      .first();
    return record?.value || null;
  }

  async setLastSyncToken(token: string): Promise<void> {
    await this.setSyncMetadata("last_sync_token", token);
  }

  async getLastSyncTime(): Promise<string | null> {
    const record = await this.syncMetadata
      .where("key")
      .equals("last_sync_time")
      .first();
    return record?.value || null;
  }

  async setLastSyncTime(time: string): Promise<void> {
    await this.setSyncMetadata("last_sync_time", time);
  }

  async getSyncMetadataByKey(
    key: string
  ): Promise<SyncMetadata | undefined> {
    return await this.syncMetadata.where("key").equals(key).first();
  }

  async setSyncMetadata(key: string, value: string): Promise<void> {
    const existing = await this.syncMetadata
      .where("key")
      .equals(key)
      .first();
    const now = new Date();

    if (existing) {
      await this.syncMetadata.update(existing.uuid, {
        value,
        updatedAt: now,
        updatedBy: "system",
      });
    } else {
      await this.syncMetadata.add({
        uuid: this.generateUuid(),
        key,
        value,
        createdAt: now,
        updatedAt: now,
        createdBy: "system",
        updatedBy: "system",
        version: 1,
        syncStatus: SyncStatus.SYNCED,
      } as SyncMetadata);
    }
  }

  // ==========================================
  // Sync Conflicts Specific
  // ==========================================
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    return await this.syncConflicts
      .filter((conflict) => !conflict.resolved)
      .toArray();
  }

  async getConflictsByEntity(
    entityType: string,
    entityId: string
  ): Promise<SyncConflict[]> {
    return await this.syncConflicts
      .where("[entityId+entityType]")
      .equals([entityId, entityType])
      .toArray();
  }

  async resolveConflict(
    id: string,
    resolutionData: Record<string, any>,
    resolutionNotes?: string
  ): Promise<void> {
    const now = new Date();
    await this.syncConflicts.update(id, {
      resolved: true,
      resolutionData,
      ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
      resolvedAt: now,
      resolvedBy: "system",
    });
  }

  // ==========================================
  // Cache Specific
  // ==========================================
  async getCacheByTags(tags: string[]): Promise<Cache[]> {
    const all = await this.cache.toArray();
    return all.filter((entry) => {
      if (!entry.tags) return false;
      const entryTags = Array.isArray(entry.tags)
        ? entry.tags
        : entry.tags.split(",");
      return tags.some((tag) => entryTags.includes(tag));
    });
  }

  async deleteCacheByTags(tags: string[]): Promise<number> {
    const entries = await this.getCacheByTags(tags);
    for (const entry of entries) {
      await this.cache.delete(entry.uuid);
    }
    return entries.length;
  }

  async incrementCacheHit(key: string): Promise<void> {
    const entry = await this.cache.where("key").equals(key).first();
    if (entry) {
      const hitCount = (entry.hitCount || 0) + 1;
      await this.cache.update(entry.uuid, {
        hitCount,
        lastAccessedAt: new Date(),
      });
    }
  }

  async cleanupExpiredCache(): Promise<number> {
    const now = new Date();
    const expired = await this.cache
      .filter((entry) => !!entry.expiresAt && entry.expiresAt < now)
      .toArray();
    for (const entry of expired) {
      await this.cache.delete(entry.uuid);
    }
    return expired.length;
  }

  // ==========================================
  // Feature Toggle Specific
  // ==========================================
  async getActiveFeatureToggles(
    organisationId: string
  ): Promise<FeatureToggle[]> {
    return await this.featureToggles
      .where("[organisationId+status]")
      .equals([organisationId, "Active"])
      .toArray();
  }

  async getFeatureToggleByName(
    name: string,
    organisationId: string
  ): Promise<FeatureToggle | undefined> {
    return await this.featureToggles
      .filter(
        (toggle) =>
          toggle.name === name && toggle.organisationId === organisationId
      )
      .first();
  }

  async getFeatureToggleOverrides(
    featureToggleId: string
  ): Promise<FeatureToggleOverride[]> {
    return await this.featureToggleOverrides
      .where("featureToggleId")
      .equals(featureToggleId)
      .toArray();
  }

  // ==========================================
  // Training Specific
  // ==========================================
  async getPublishedCourses(organisationId: string): Promise<TrainingCourse[]> {
    return await this.trainingCourses
      .where("[organisationId+isPublished]")
      .equals([organisationId, 1])
      .toArray();
  }

  async getUserProgressByCourse(
    userId: string,
    courseId: string
  ): Promise<UserCourseProgress | undefined> {
    return await this.userCourseProgress
      .where("[userId+courseId]")
      .equals([userId, courseId])
      .first();
  }

  async getExpiringCertifications(
    daysAhead: number = 30
  ): Promise<Certification[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.certifications
      .filter(
        (cert) =>
          cert.expiryDate != null &&
          cert.expiryDate <= futureDate &&
          !cert.isVerified === false
      )
      .toArray();
  }

  // ==========================================
  // Governance Specific
  // ==========================================
  async getPoliciesByStatus(
    organisationId: string,
    status: string
  ): Promise<GovernancePolicy[]> {
    return await this.governancePolicies
      .where("[organisationId+status]")
      .equals([organisationId, status])
      .toArray();
  }

  async getMaturityTrend(
    organisationId: string,
    limit: number = 10
  ): Promise<MaturityAssessment[]> {
    return await this.maturityAssessments
      .where("organisationId")
      .equals(organisationId)
      .reverse()
      .limit(limit)
      .toArray();
  }

  // ==========================================
  // Dashboard Specific
  // ==========================================
  async getPersonalDashboard(
    organisationId: string,
    userId: string
  ): Promise<DashboardConfig | undefined> {
    return await this.dashboardConfigs
      .where("[organisationId+userId]")
      .equals([organisationId, userId])
      .first();
  }

  async getRoleDashboards(
    organisationId: string,
    role: string
  ): Promise<DashboardConfig[]> {
    return await this.dashboardConfigs
      .where("[organisationId+role]")
      .equals([organisationId, role])
      .toArray();
  }

  // ==========================================
  // Health Check
  // ==========================================
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    version: number;
    tableCount: number;
    open: boolean;
    tableSizes?: Record<string, number>;
  }> {
    try {
      const isOpen = this.isOpen();
      const tableCount = Object.keys(this._allTables).length;

      const tableSizes: Record<string, number> = {};
      for (const [name, table] of Object.entries(this._allTables)) {
        try {
          tableSizes[name] = await (table as Table<any, string>).count();
        } catch {
          tableSizes[name] = 0;
        }
      }

      return {
        status: isOpen ? "healthy" : "unhealthy",
        version: this.verno,
        tableCount,
        open: isOpen,
        tableSizes,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        version: this.verno,
        tableCount: 0,
        open: false,
      };
    }
  }

  // ==========================================
  // Database Maintenance
  // ==========================================
  async vacuum(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tables = Object.values(this._allTables) as Table<any, string>[];
    for (const table of tables) {
      try {
        const deleted = await table
          .filter(
            (record: any) =>
              record.deletedAt != null && record.deletedAt < thirtyDaysAgo
          )
          .toArray();

        for (const record of deleted) {
          await table.delete(record.uuid);
        }
      } catch {
        continue;
      }
    }
  }

  async getDatabaseSize(): Promise<number> {
    let totalSize = 0;
    const tables = Object.values(this._allTables) as Table<any, string>[];
    for (const table of tables) {
      try {
        const count = await table.count();
        totalSize += count * 1024;
      } catch {
        continue;
      }
    }
    return totalSize;
  }
}

// Export singleton instance
export const db = BCMDatabase.getInstance();