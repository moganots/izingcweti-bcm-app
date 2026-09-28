import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, BusinessUnit, Department } from "../organisation/organisation.entity";
import type { Workflow } from "../workflow/workflow.entity";

// ============================================
// Document Module - Enums (Aligned with Backend)
// ============================================

export enum DocumentType {
  BCM_POLICY = "BcmPolicy",
  RISK_ASSESSMENT = "RiskAssessment",
  BIA_REPORT = "BiaReport",
  BCP_DOCUMENT = "BcpDocument",
  RECOVERY_STRATEGY = "RecoveryStrategy",
  TEST_RESULTS = "TestResults",
  INCIDENT_REPORT = "IncidentReport",
  COMPLIANCE_EVIDENCE = "ComplianceEvidence",
  TRAINING_MATERIAL = "TrainingMaterial",
  AUDIT_REPORT = "AuditReport",
  EXERCISE_REPORT = "ExerciseReport",
  MEETING_MINUTES = "MeetingMinutes",
  PROCEDURE = "Procedure",
  WORK_INSTRUCTION = "WorkInstruction",
  CONTACT_LIST = "ContactList",
  VENDOR_CONTRACT = "VendorContract",
  SLA_DOCUMENT = "SlaDocument",
  REGULATORY_DOCUMENT = "RegulatoryDocument",
  CERTIFICATE = "Certificate",
  GAP_ANALYSIS = "GapAnalysis",
  IMPROVEMENT_PLAN = "ImprovementPlan",
  OTHER = "Other",
}

export enum DocumentStatus {
  DRAFT = "Draft",
  UNDER_REVIEW = "UnderReview",
  APPROVED = "Approved",
  PUBLISHED = "Published",
  ACTIVE = "Active",
  REVIEW_REQUIRED = "ReviewRequired",
  UNDER_REVISION = "UnderRevision",
  SUPERSEDED = "Superceded",
  ARCHIVED = "Archived",
  EXPIRED = "Expired",
  REJECTED = "Rejected",
  OBSOLETE = "Obsolete",
  PENDING_APPROVAL = "PendingApproval",
}

export enum AccessLevel {
  PUBLIC = "Public",
  INTERNAL = "Internal",
  CONFIDENTIAL = "Confidential",
  RESTRICTED = "Restricted",
  PRIVATE = "Private",
}

// ============================================
// Document Entity - Aligned with Backend
// Backend: src/modules/document/models/entities/document.entity.ts
// ============================================

export interface Document extends BaseEntity {
  organisationId: string;
  title: string;
  description?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string;
  uploadedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  versionNumber: number;
  previousVersions?: DocumentVersion[];
  tags?: string[];
  metadata?: Record<string, any>;
  checksum?: string;
  expiresAt?: Date;
  downloadCount: number;
  publishedBy?: string;
  publishedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  workflowId?: string;
  reviewHistory?: ReviewHistoryEntry[];
  currentReviewerId?: string;
  businessUnitId?: string;
  departmentId?: string;

  // Relationships
  organisation?: Organisation;
  businessUnit?: BusinessUnit;
  department?: Department;
  uploader?: { uuid: string; email: string };
  approver?: { uuid: string; email: string };
  currentReviewer?: { uuid: string; email: string };
  workflow?: Workflow;
}

export interface DocumentVersion {
  versionNumber: number;
  fileName: string;
  fileSize: number;
  filePath?: string;
  checksum: string;
  archivedAt?: Date;
  isCurrent?: boolean;
}

export interface ReviewHistoryEntry {
  reviewerId: string;
  reviewedAt: Date;
  status: string;
  comments?: string;
}

/**
 * Document Template Entity
 */
export interface DocumentTemplate extends BaseEntity {
  name: string;
  description?: string;
  documentType: DocumentType;
  templateContent: string;
  variables: string[];
  category: string;
  version: number;
  isActive: boolean;
  organisationId?: string;
  createdBy: string;
}

/**
 * Document Upload Progress
 * Used for tracking upload progress callbacks
 */
export interface DocumentUploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Document Statistics
 */
export interface DocumentStats {
  totalDocuments: number;
  totalSizeBytes: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byAccessLevel: Record<string, number>;
  activeDocuments: number;
  archivedDocuments: number;
  totalDownloads: number;
}

// ============================================
// Helper Functions
// ============================================

export function getDocumentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: "Draft",
    [DocumentStatus.UNDER_REVIEW]: "Under Review",
    [DocumentStatus.APPROVED]: "Approved",
    [DocumentStatus.PUBLISHED]: "Published",
    [DocumentStatus.ACTIVE]: "Active",
    [DocumentStatus.REVIEW_REQUIRED]: "Review Required",
    [DocumentStatus.UNDER_REVISION]: "Under Revision",
    [DocumentStatus.SUPERSEDED]: "Superseded",
    [DocumentStatus.ARCHIVED]: "Archived",
    [DocumentStatus.EXPIRED]: "Expired",
    [DocumentStatus.REJECTED]: "Rejected",
    [DocumentStatus.OBSOLETE]: "Obsolete",
    [DocumentStatus.PENDING_APPROVAL]: "Pending Approval",
  };
  return labels[status] || status;
}

export function getDocumentStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: "grey",
    [DocumentStatus.UNDER_REVIEW]: "warning",
    [DocumentStatus.APPROVED]: "positive",
    [DocumentStatus.PUBLISHED]: "info",
    [DocumentStatus.ACTIVE]: "positive",
    [DocumentStatus.REVIEW_REQUIRED]: "orange",
    [DocumentStatus.UNDER_REVISION]: "info",
    [DocumentStatus.SUPERSEDED]: "grey-6",
    [DocumentStatus.ARCHIVED]: "grey-7",
    [DocumentStatus.EXPIRED]: "negative",
    [DocumentStatus.REJECTED]: "negative",
    [DocumentStatus.OBSOLETE]: "grey-8",
    [DocumentStatus.PENDING_APPROVAL]: "orange",
  };
  return colors[status] || "grey";
}