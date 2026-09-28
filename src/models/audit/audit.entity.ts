import type { BaseEntity } from "../../core/base/base.entity";
import type { User } from "../user/user.entity";
import type { Organisation } from "../organisation/organisation.entity";

// ============================================
// Audit Module - Enums (Aligned with Backend)
// ============================================

export enum AuditAction {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete",
  APPROVE = "Approve",
  REJECT = "Reject",
  SYNC = "Sync",
  CONFLICT_RESOLVE = "ConflictResolve",
  VIEW = "View",
  LOGIN = "Login",
  EXPORT = "Export",
  LOGOUT = "Logout",
  SOFT_DELETE = "SoftDelete",
  RESTORE = "Restore",
  PERMANENT_DELETE = "PermanentDelete",
  BULK_CREATE = "BulkCreate",
  BULK_UPDATE = "BulkUpdate",
  BULK_DELETE = "BulkDelete",
  LOG_ACTIVITY = "LogActivity",
}

export enum AuditSeverity {
  INFO = "Info",
  WARNING = "Warning",
  ERROR = "Error",
  CRITICAL = "Critical",
}

export enum AuditCategory {
  USER_ACTIVITY = "UserActivity",
  SYSTEM_EVENT = "SystemEvent",
  SECURITY = "Security",
  DATA_CHANGE = "DataChange",
  ACCESS_CONTROL = "AccessControl",
  WORKFLOW = "Workflow",
  COMPLIANCE = "Compliance",
  SYNC = "Sync",
  CONFIGURATION = "Configuration",
  PERFORMANCE = "Performance",
  SYSTEM_CONFIG = "SystemConfig",
  DOCUMENT_MANAGEMENT = "DocumentManagement",
  USER_MANAGEMENT = "UserManagement",
  BUSINESS_CONTINUITY = "BusinessContinuity",
  RISK_MANAGEMENT = "RiskManagement",
}

export enum AuditStatus {
  SUCCESS = "Success",
  FAILURE = "Failure",
  PENDING = "Pending",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum AuditSource {
  API = "API",
  WEB = "Web",
  MOBILE = "Mobile",
  SYSTEM = "System",
  SCHEDULED_TASK = "ScheduledTask",
  MANUAL = "Manual",
  THIRD_PARTY = "ThirdParty",
}

export enum EntityType {
  USER = "User",
  ORGANISATION = "Organisation",
  DEPARTMENT = "Department",
  WORKFLOW = "Workflow",
  RISK = "Risk",
  CONTROL = "Control",
  DOCUMENT = "Document",
  CERTIFICATION = "Certification",
  ATTESTATION = "Attestation",
  COURSE = "Course",
  AUDIT_LOG = "AuditLog",
  COMMENT = "Comment",
  ATTACHMENT = "Attachment",
  INCIDENT = "Incident",
  BCP = "BusinessContinuityPlan",
  BIA = "BusinessImpactAssessment",
  CRITICAL_FUNCTION = "CriticalFunction",
  RECOVERY_STRATEGY = "RecoveryStrategy",
  EXERCISE_TEST = "ExerciseTest",
  BCP_TEMPLATE = "BCPTemplate",
  COMPLIANCE_RECORD = "ComplianceRecord",
  GOVERNANCE_POLICY = "GovernancePolicy",
  MATURITY_ASSESSMENT = "MaturityAssessment",
  LESSON = "Lesson",
  FEATURE_TOGGLE = "FeatureToggle",
}

// ============================================
// Audit Log Entity - Aligned with Backend
// Backend: src/modules/audit/models/entities/audit.entity.ts
// ============================================

export interface AuditLog extends BaseEntity {
  organisationId: string;
  userId: string;
  action: AuditAction;
  auditCategory: AuditCategory;
  severity: AuditSeverity;
  entityType: EntityType;
  entityId: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestMethod?: string;
  requestPath?: string;
  responseStatus?: number;
  executionTimeMs?: number;
  isSensitive: boolean;
  userEmail?: string;
  organisationName?: string;

  // Relationships
  user?: User;
  organisation?: Organisation;
}

/**
 * Audit Retention Policy Entity
 * Backend: src/modules/audit/models/entities/audit.entity.ts
 */
export interface AuditRetentionPolicy extends BaseEntity {
  organisationId: string;
  auditCategory: AuditCategory;
  retentionDays: number;
  isActive: boolean;

  // Relationships
  organisation?: Organisation;
}

/**
 * Activity History Entity
 * Backend: src/modules/audit/models/entities/audit.entity.ts
 */
export interface ActivityHistory extends BaseEntity {
  entityId: string;
  entityType: EntityType;
  userId: string;
  action: string;
  changes?: Record<string, any>;
  description?: string;
  activityType?: string;
  metadata?: any;
  durationSeconds?: number;
  ipAddress?: string;
  userAgent?: string;

  // Relationships
  user?: User;
}

/**
 * Attachment Entity
 * Backend: src/modules/audit/models/entities/audit.entity.ts
 */
export interface Attachment extends BaseEntity {
  entityId: string;
  entityType: EntityType;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl?: string;
  metadata?: any;

  // Relationships
  uploader?: User;
}

/**
 * Comment Entity
 * Backend: src/modules/audit/models/entities/audit.entity.ts
 */
export interface Comment extends BaseEntity {
  entityId: string;
  entityType: EntityType;
  userId: string;
  content: string;
  parentCommentId?: string;
  isEdited?: boolean;
  isDeleted?: boolean;

  // Relationships
  user?: User;
}