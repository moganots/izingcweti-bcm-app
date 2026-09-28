import type { BaseEntity } from "../../core/base/base.entity";
import type { User } from "../user/user.entity";
import type { Tenant } from "../tenant/tenant.entity";
import type { ComplianceRecord } from "../compliance/compliance.entity";
import type { BCPTemplate, CriticalFunction, CriticalityScore, Incident, MaturityScore } from "../bcm/bcm.entity";
import type { Document } from "../document/document.entity";
import type { Risk } from "../risk/risk.entity";
import type { TrainingCourse } from "../training/training.entity";
import type { GovernancePolicy, MaturityAssessment, GovernanceActivity } from "../governance/governance.entity";
import type { Report } from "../report/report.entity";
import type { LessonEntity } from "../improvements/lesson.entity";
import type { Notification, NotificationTemplate } from "../notification/notification.entity";
import type { FeatureToggle } from "../feature-toggle/feature-toggle.entity";
import type { DashboardConfig } from "../dashboard/dashboard.entity";
import type { Rule } from "../rule/rule.entity";
import type { Workflow } from "../workflow/workflow.entity";
import type { AuditLog, AuditRetentionPolicy } from "../audit/audit.entity";

// ============================================
// Organisation Module - Enums (Aligned with Backend)
// ============================================

export enum IndustryType {
  FINANCE = "Finance",
  HEALTHCARE = "Healthcare",
  TECH = "Tech",
  MANUFACTURING = "Manufacturing",
  RETAIL = "Retail",
  GOVERNMENT = "Government",
  EDUCATION = "Education",
  TRANSPORTATION = "Transportation",
  ENERGY = "Energy",
  TELECOMMUNICATIONS = "Telecommunications",
  TECHNOLOGY = "Technology",
  OTHER = "Other",
}

// ============================================
// Organisation Entity - Aligned with Backend
// Backend: src/modules/organisation/models/entities/organisation.entity.ts
// ============================================

export interface Organisation extends BaseEntity {
  tenantId: string;
  name: string;
  description?: string;
  industryType: IndustryType;
  bcmPolicyVersion?: string;
  maturityScore?: MaturityScore;
  employeeCount?: number;
  annualRevenue?: number;
  region?: string;
  isActive: boolean;
  lastAssessmentDate?: Date;
  nextAssessmentDate?: Date;

  // Relationships
  tenant?: Tenant;
  businessUnits?: BusinessUnit[];
  users?: User[];
  risks?: Risk[];
  incidents?: Incident[];
  complianceRecords?: ComplianceRecord[];
  documents?: Document[];
  trainingCourses?: TrainingCourse[];
  governancePolicies?: GovernancePolicy[];
  maturityAssessments?: MaturityAssessment[];
  governanceActivities?: GovernanceActivity[];
  reports?: Report[];
  lessons?: LessonEntity[];
  notifications?: Notification[];
  notificationTemplates?: NotificationTemplate[];
  featureToggles?: FeatureToggle[];
  dashboards?: DashboardConfig[];
  rules?: Rule[];
  bcpTemplates?: BCPTemplate[];
  workflows?: Workflow[];
  auditLogs?: AuditLog[];
  auditRetentionPolicies?: AuditRetentionPolicy[];
}

// ============================================
// Business Unit Entity - Aligned with Backend
// Backend: src/modules/organisation/models/entities/business-unit.entity.ts
// ============================================

export interface BusinessUnit extends BaseEntity {
  organisationId: string;
  name: string;
  description?: string;
  criticalityScore: CriticalityScore;
  headUserId?: string;
  isActive: boolean;
  employeeCount?: number;
  budget?: number;

  // Relationships
  organisation?: Organisation;
  departments?: Department[];
  lessons?: LessonEntity[];
  reports?: Report[];
  notifications?: Notification[];
  dashboards?: DashboardConfig[];
  documents?: Document[];
  headUser?: User;
}

// ============================================
// Department Entity - Aligned with Backend
// Backend: src/modules/organisation/models/entities/department.entity.ts
// ============================================

export interface Department extends BaseEntity {
  businessUnitId: string;
  parentDepartmentId?: string;
  name: string;
  description?: string;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  order: number;
  isActive: boolean;
  employeeCount?: number;
  budget?: number;

  // Relationships
  businessUnit?: BusinessUnit;
  parentDepartment?: Department;
  subDepartments?: Department[];
  notifications?: Notification[];
  dashboards?: DashboardConfig[];
  documents?: Document[];
  governancePolicies?: GovernancePolicy[];
  maturityAssessments?: MaturityAssessment[];
  governanceActivities?: GovernanceActivity[];
  criticalFunctions?: CriticalFunction[];
  users?: User[];
  lessons?: LessonEntity[];
  reports?: Report[];
}