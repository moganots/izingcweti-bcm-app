import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation } from "../organisation/organisation.entity";
import type { LessonEntity } from "../improvements/lesson.entity";
import type { Workflow } from "../workflow/workflow.entity";

// ============================================
// Compliance Module - Enums (Aligned with Backend)
// ============================================

export enum ComplianceStatus {
  NOT_ASSESSED = "NOT_ASSESSED",
  NON_COMPLIANT = "NON_COMPLIANT",
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  UNDER_REVIEW = "UNDER_REVIEW",
  PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
  COMPLIANT = "COMPLIANT",
}

export enum ComplianceStandard {
  ISO22301 = "ISO22301",
  NIST80034 = "NIST80034",
  FFIEC = "FFIEC",
  COBIT2019 = "COBIT2019",
  SOC2 = "SOC2",
  GDPR = "GDPR",
  POPIA = "POPIA",
  PCIDSS = "PCIDSS",
  HIPAA = "HIPAA",
}

// ============================================
// Compliance Record Entity - Aligned with Backend
// Backend: src/modules/compliance/models/entities/compliance-record.entity.ts
// ============================================

export interface ComplianceRecord extends BaseEntity {
  organisationId: string;
  complianceStandard: ComplianceStandard;
  complianceStatus: ComplianceStatus;
  lastAuditDate: Date;
  nextAuditDate: Date;
  evidenceLinks?: string[];
  notes?: string;
  gapDescription?: string;
  recommendation?: string;

  // Relationships
  organisation?: Organisation;
  lessons?: LessonEntity[];
  workflows?: Workflow[];
}

// ============================================
// Compliance Stats - API Response Type
// ============================================

export interface ComplianceStats {
  total: number;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  notAssessed: number;
  planned: number;
  inProgress: number;
  underReview: number;
  complianceRate: number;
  overdueAudits: number;
  upcomingAudits: number;
  byStandard: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============================================
// Display Constants & Helpers
// ============================================

export const COMPLIANCE_STANDARD_LABELS: Record<string, string> = {
  ISO22301: "ISO 22301",
  NIST80034: "NIST 800-34",
  FFIEC: "FFIEC",
  COBIT2019: "COBIT 2019",
  SOC2: "SOC 2",
  GDPR: "GDPR",
  POPIA: "POPIA",
  PCIDSS: "PCI DSS",
  HIPAA: "HIPAA",
};

export const COMPLIANCE_STANDARD_COLORS: Record<string, string> = {
  ISO22301: "blue",
  NIST80034: "green",
  FFIEC: "orange",
  COBIT2019: "purple",
  SOC2: "teal",
  GDPR: "indigo",
  POPIA: "pink",
  PCIDSS: "yellow",
  HIPAA: "red",
};

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  COMPLIANT: "Compliant",
  PARTIALLY_COMPLIANT: "Partially Compliant",
  NON_COMPLIANT: "Non-Compliant",
  NOT_ASSESSED: "Not Assessed",
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
};

export const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
  COMPLIANT: "positive",
  PARTIALLY_COMPLIANT: "warning",
  NON_COMPLIANT: "negative",
  NOT_ASSESSED: "grey",
  PLANNED: "info",
  IN_PROGRESS: "blue",
  UNDER_REVIEW: "orange",
};

export const COMPLIANCE_STATUS_PROGRESS: Record<string, number> = {
  COMPLIANT: 100,
  PARTIALLY_COMPLIANT: 50,
  NON_COMPLIANT: 10,
  NOT_ASSESSED: 0,
  PLANNED: 5,
  IN_PROGRESS: 25,
  UNDER_REVIEW: 75,
};

export function getComplianceStandardLabel(standard: string): string {
  return COMPLIANCE_STANDARD_LABELS[standard] || standard;
}

export function getComplianceStandardColor(standard: string): string {
  return COMPLIANCE_STANDARD_COLORS[standard] || "grey";
}

export function getComplianceStatusLabel(status: string): string {
  return COMPLIANCE_STATUS_LABELS[status] || status;
}

export function getComplianceStatusColor(status: string): string {
  return COMPLIANCE_STATUS_COLORS[status] || "grey";
}

export function getComplianceStatusProgress(status: string): number {
  return COMPLIANCE_STATUS_PROGRESS[status] || 0;
}

export function isAuditOverdue(nextAuditDate: Date): boolean {
  if (!nextAuditDate) return false;
  return new Date(nextAuditDate) < new Date();
}

export function isAuditDueSoon(nextAuditDate: Date, days: number = 30): boolean {
  if (!nextAuditDate) return false;
  const due = new Date(nextAuditDate);
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + days);
  return due <= future && due > now;
}

export function calculateComplianceRate(compliant: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((compliant / total) * 100);
}

export function getDaysUntilAudit(nextAuditDate: Date): number {
  if (!nextAuditDate) return 0;
  const due = new Date(nextAuditDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}