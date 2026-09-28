import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, Department } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";

// ============================================
// Governance Module - Enums (Aligned with Backend)
// ============================================

export enum PolicyStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  ARCHIVED = "Archived",
  UNDER_REVIEW = "Under Review",
  APPROVED = "Approved",
  SUSPENDED = "Suspended",
  UNDER_REVISION = "Under Revision",
  REVIEW_REQUIRED = "Review Required",
  SUPERSEDED = "Superseded",
  EXPIRED = "Expired",
  REJECTED = "Rejected",
  WITHDRAWN = "Withdrawn",
  OBSOLETE = "Obsolete",
  INACTIVE = "Inactive",
}

export enum PolicyCategory {
  BCM = "BCM",
  RISK_MANAGEMENT = "Risk Management",
  COMPLIANCE = "Compliance",
  IT_SECURITY = "IT Security",
  HR = "Human Resources",
  OPERATIONS = "Operations",
  FINANCE = "Finance",
  DATA_PRIVACY = "Data Privacy",
  INCIDENT_MANAGEMENT = "Incident Management",
  CRISIS_COMMUNICATION = "Crisis Communication",
  BUSINESS_CONTINUITY = "Business Continuity",
  DISASTER_RECOVERY = "Disaster Recovery",
  QUALITY = "Quality",
  ENVIRONMENTAL = "Environmental",
  HEALTH_SAFETY = "Health & Safety",
  SUPPLY_CHAIN = "Supply Chain",
  LEGAL = "Legal",
  OTHER = "Other",
}

export enum ActivityAction {
  POLICY_CREATED = "Policy Created",
  POLICY_UPDATED = "Policy Updated",
  POLICY_ACTIVATED = "Policy Activated",
  POLICY_DEACTIVATED = "Policy Deactivated",
  POLICY_ARCHIVED = "Policy Archived",
  POLICY_REVIEWED = "Policy Reviewed",
  POLICY_APPROVED = "Policy Approved",
  POLICY_REJECTED = "Policy Rejected",
  ASSESSMENT_CREATED = "Assessment Created",
  ASSESSMENT_UPDATED = "Assessment Updated",
  ASSESSMENT_DELETED = "Assessment Deleted",
  MATURITY_LEVEL_CHANGED = "Maturity Level Changed",
  COMPLIANCE_CHECK = "Compliance Check",
  AUDIT_COMPLETED = "Audit Completed",
  REVIEW_COMPLETED = "Review Completed",
  USER_LOGGED_IN = "User Logged In",
  USER_LOGGED_OUT = "User Logged Out",
  USER_CREATED = "User Created",
  USER_UPDATED = "User Updated",
  USER_DELETED = "User Deleted",
  PERMISSION_CHANGED = "Permission Changed",
  SETTINGS_CHANGED = "Settings Changed",
  SYSTEM_CONFIGURED = "System Configured",
  EXPORT_COMPLETED = "Export Completed",
  REPORT_GENERATED = "Report Generated",
  IMPORT_COMPLETED = "Import Completed",
  WORKFLOW_TRIGGERED = "Workflow Triggered",
  NOTIFICATION_SENT = "Notification Sent",
  SYNC_COMPLETED = "Sync Completed",
  BACKUP_CREATED = "Backup Created",
  RESTORE_COMPLETED = "Restore Completed",
}

export enum MaturityLevel {
  INITIAL = "Initial",
  MANAGED = "Managed",
  DEFINED = "Defined",
  QUANTITATIVELY_MANAGED = "Quantitatively Managed",
  OPTIMISED = "Optimised",
  DEVELOPING = "Developing",
  REPEATABLE = "Repeatable",
  ESTABLISHED = "Established",
  ADVANCED = "Advanced",
  OPTIMISING = "Optimising",
}

// ============================================
// Governance Entity Interfaces - Aligned with Backend
// ============================================

/**
 * Governance Policy Entity
 * Backend: src/modules/governance/models/entities/governance-policy.entity.ts
 */
export interface GovernancePolicy extends BaseEntity {
  organisationId: string;
  departmentId?: string;
  name: string;
  description?: string;
  category?: PolicyCategory;
  status: PolicyStatus;
  policyVersion: string;
  effectiveDate?: Date;
  nextReviewDate?: Date;
  ownerId?: string;
  tags?: string[];

  // Relationships
  organisation?: Organisation;
  department?: Department;
  owner?: User;
}

/**
 * Maturity Assessment Entity
 * Backend: src/modules/governance/models/entities/maturity-assessment.entity.ts
 */
export interface MaturityAssessment extends BaseEntity {
  organisationId: string;
  departmentId?: string;
  assessedDate: Date;
  score: number;
  level: MaturityLevel;
  findings?: string;
  recommendations?: string;
  assessedBy?: string;
  domainScores?: Record<string, number>;

  // Relationships
  organisation?: Organisation;
  department?: Department;
  assessor?: User;
}

/**
 * Governance Activity Entity
 * Backend: src/modules/governance/models/entities/governance-activity.entity.ts
 */
export interface GovernanceActivity extends BaseEntity {
  organisationId: string;
  departmentId?: string;
  action: ActivityAction;
  userId?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;

  // Relationships
  organisation?: Organisation;
  department?: Department;
  user?: User;
}

// ============================================
// Display Constants & Helpers
// ============================================

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  [PolicyStatus.DRAFT]: "Draft",
  [PolicyStatus.ACTIVE]: "Active",
  [PolicyStatus.ARCHIVED]: "Archived",
  [PolicyStatus.UNDER_REVIEW]: "Under Review",
  [PolicyStatus.APPROVED]: "Approved",
  [PolicyStatus.SUSPENDED]: "Suspended",
  [PolicyStatus.UNDER_REVISION]: "Under Revision",
  [PolicyStatus.REVIEW_REQUIRED]: "Review Required",
  [PolicyStatus.SUPERSEDED]: "Superseded",
  [PolicyStatus.EXPIRED]: "Expired",
  [PolicyStatus.REJECTED]: "Rejected",
  [PolicyStatus.WITHDRAWN]: "Withdrawn",
  [PolicyStatus.OBSOLETE]: "Obsolete",
  [PolicyStatus.INACTIVE]: "Inactive",
};

export const POLICY_STATUS_COLORS: Record<PolicyStatus, string> = {
  [PolicyStatus.DRAFT]: "grey",
  [PolicyStatus.ACTIVE]: "success",
  [PolicyStatus.ARCHIVED]: "grey-7",
  [PolicyStatus.UNDER_REVIEW]: "warning",
  [PolicyStatus.APPROVED]: "success",
  [PolicyStatus.SUSPENDED]: "orange",
  [PolicyStatus.UNDER_REVISION]: "info",
  [PolicyStatus.REVIEW_REQUIRED]: "orange",
  [PolicyStatus.SUPERSEDED]: "grey-6",
  [PolicyStatus.EXPIRED]: "danger",
  [PolicyStatus.REJECTED]: "danger",
  [PolicyStatus.WITHDRAWN]: "grey",
  [PolicyStatus.OBSOLETE]: "grey-8",
  [PolicyStatus.INACTIVE]: "grey-5",
};

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  [PolicyCategory.BCM]: "Business Continuity Management",
  [PolicyCategory.RISK_MANAGEMENT]: "Risk Management",
  [PolicyCategory.COMPLIANCE]: "Compliance",
  [PolicyCategory.IT_SECURITY]: "IT Security",
  [PolicyCategory.HR]: "Human Resources",
  [PolicyCategory.OPERATIONS]: "Operations",
  [PolicyCategory.FINANCE]: "Finance",
  [PolicyCategory.DATA_PRIVACY]: "Data Privacy",
  [PolicyCategory.INCIDENT_MANAGEMENT]: "Incident Management",
  [PolicyCategory.CRISIS_COMMUNICATION]: "Crisis Communication",
  [PolicyCategory.BUSINESS_CONTINUITY]: "Business Continuity",
  [PolicyCategory.DISASTER_RECOVERY]: "Disaster Recovery",
  [PolicyCategory.QUALITY]: "Quality",
  [PolicyCategory.ENVIRONMENTAL]: "Environmental",
  [PolicyCategory.HEALTH_SAFETY]: "Health & Safety",
  [PolicyCategory.SUPPLY_CHAIN]: "Supply Chain",
  [PolicyCategory.LEGAL]: "Legal",
  [PolicyCategory.OTHER]: "Other",
};

export const MATURITY_LEVEL_LABELS: Record<MaturityLevel, string> = {
  [MaturityLevel.INITIAL]: "Initial",
  [MaturityLevel.MANAGED]: "Managed",
  [MaturityLevel.DEFINED]: "Defined",
  [MaturityLevel.QUANTITATIVELY_MANAGED]: "Quantitatively Managed",
  [MaturityLevel.OPTIMISED]: "Optimised",
  [MaturityLevel.DEVELOPING]: "Developing",
  [MaturityLevel.REPEATABLE]: "Repeatable",
  [MaturityLevel.ESTABLISHED]: "Established",
  [MaturityLevel.ADVANCED]: "Advanced",
  [MaturityLevel.OPTIMISING]: "Optimising",
};

export function getPolicyStatusLabel(status: PolicyStatus): string {
  return POLICY_STATUS_LABELS[status] || status;
}

export function getPolicyStatusColor(status: PolicyStatus): string {
  return POLICY_STATUS_COLORS[status] || "grey";
}

export function getPolicyCategoryLabel(category: PolicyCategory): string {
  return POLICY_CATEGORY_LABELS[category] || category;
}

export function getMaturityLevelLabel(level: MaturityLevel): string {
  return MATURITY_LEVEL_LABELS[level] || level;
}