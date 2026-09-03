import type { BaseEntity } from './../../../core/base/base.entity';
import type { Organisation, BusinessUnit, Department } from './../organisation/organisation.entity'
import { QueryParams } from 'src/shared/types/common.types'

// ============================================
// Document Module - Enums (Aligned with Backend)
// ============================================

/**
 * Document Type Enum
 */
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

/**
 * Document Status Enum
 */
export enum DocumentStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'UnderReview',
  APPROVED = 'Approved',
  PUBLISHED = 'Published',
  ACTIVE = 'Active',
  REVIEW_REQUIRED = 'ReviewRequired',
  UNDER_REVISION = 'UnderRevision',
  SUPERSEDED = 'Superceded',
  ARCHIVED = 'Archived',
  EXPIRED = 'Expired',
  REJECTED = 'Rejected',
  OBSOLETE = 'Obsolete',
  PENDING_APPROVAL = "PendingApproval"
}

/**
 * Access Level Enum
 */
export enum AccessLevel {
  PUBLIC = "Public",
  INTERNAL = "Internal",
  CONFIDENTIAL = "Confidential",
  RESTRICTED = "Restricted",
  PRIVATE = "Private",
}

// ============================================
// Document Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * Document - Matches backend Document entity
 */
export interface Document extends BaseEntity {
    organisationId: string
    title: string
    description?: string
    documentType: DocumentType
    status: DocumentStatus
    accessLevel: AccessLevel
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    thumbnailPath?: string
    uploadedBy: string
    approvedBy?: string
    approvedAt?: string | Date
    approvalNotes?: string
    versionNumber: number
    previousVersions?: DocumentVersion[]
    tags?: string[]
    metadata?: Record<string, any>
    checksum?: string
    expiresAt?: string | Date
    downloadCount: number
    publishedBy?: string
    publishedAt?: string | Date
    rejectedBy?: string
    rejectedAt?: string | Date
    rejectionReason?: string
    workflowId?: string
    businessUnitId?: string
    departmentId?: string
    currentReviewerId?: string
    reviewHistory?: ReviewHistoryEntry[]
    organisation?: Organisation
    businessUnit?: BusinessUnit
    department?: Department
    uploader?: { uuid: string; email: string }
    approver?: { uuid: string; email: string }
    currentReviewer?: { uuid: string; email: string }
}

export interface ReviewHistoryEntry {
    reviewerId: string
    reviewedAt: Date
    status: string
    comments?: string
}

export interface DocumentVersion {
    versionNumber: number
    fileName: string
    fileSize: number
    filePath?: string
    checksum: string
    archivedAt?: string | Date
    isCurrent?: boolean
}

/**
 * Document Template - Matches backend
 */
export interface DocumentTemplate extends BaseEntity {
    name: string
    description?: string
    documentType: DocumentType
    templateContent: string
    variables: string[]
    category: string
    version: number
    isActive: boolean
    organisationId?: string
    createdBy: string
}

/**
 * Document Stats - Matches backend DocumentStatsDto
 */
export interface DocumentStats {
    totalDocuments: number
    totalSizeBytes: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    byAccessLevel: Record<string, number>
    activeDocuments: number
    archivedDocuments: number
    totalDownloads: number
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

export interface CreateDocumentRequest {
    title: string
    description?: string
    documentType: DocumentType
    accessLevel?: AccessLevel
    organisationId: string
    tags?: string[]
    metadata?: Record<string, any>
    expiresAt?: string | Date
}

export interface UpdateDocumentRequest {
    title?: string
    description?: string
    documentType?: DocumentType
    accessLevel?: AccessLevel
    tags?: string[]
    metadata?: Record<string, any>
    expiresAt?: string | Date
}

export interface ApproveDocumentRequest {
    comments?: string | undefined
}

export interface RejectDocumentRequest {
    rejectionReason: string
    comments?: string | undefined
}

export interface DocumentVersionRequest {
    title: string
    description?: string
    tags?: string[]
}

export interface DocumentSearchParams {
    query?: string
    documentType?: DocumentType | DocumentType[]
    status?: DocumentStatus | DocumentStatus[]
    tags?: string[]
    uploadedBy?: string
    organisationId?: string
    uploadedAfter?: string | Date
    uploadedBefore?: string | Date
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface DocumentQueryParams extends QueryParams {
    documentType?: string
    status?: string
    organisationId?: string
    uploadedBy?: string
    tags?: string | string[]
    accessLevel?: string
    fileType?: string
    uploadedAfter?: string | Date
    uploadedBefore?: string | Date
    minSize?: number
    maxSize?: number
    pendingApproval?: boolean
    expired?: boolean
    hasVersions?: boolean
    search?: string
}

export interface DocumentBulkOperationRequest {
    documentIds: string[]
    operation: 'DELETE' | 'ARCHIVE' | 'PUBLISH' | 'TAG' | 'STATUS'
    parameters?: Record<string, any>
}

export interface DocumentBulkOperationResult {
    total: number
    successful: number
    failed: number
    errors: Array<{ documentId: string; error: string }>
}

export interface GenerateDocumentFromTemplateRequest {
    templateId: string
    variables: Record<string, any>
    outputFormat: 'PDF' | 'DOCX' | 'HTML'
    documentTitle: string
    saveToLibrary?: boolean
}

export interface DocumentVerificationResult {
    verified: boolean
    checksumMatch: boolean
    message?: string
}

export interface DocumentUploadProgress {
    loaded: number
    total: number
    percent: number
}