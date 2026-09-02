import type { BaseEntity } from './../../../core/base/base.entity';
import type { Organisation, BusinessUnit, Department } from './../organisation/organisation.entity'
import { QueryParams } from 'src/shared/types/common.types'

// ============================================
// Document Module - Enums (Aligned with Backend)
// ============================================

export enum DocumentType {
    BCM_POLICY = 'BCM_POLICY',
    RISK_ASSESSMENT = 'RISK_ASSESSMENT',
    BIA_REPORT = 'BIA_REPORT',
    BCP_DOCUMENT = 'BCP_DOCUMENT',
    RECOVERY_STRATEGY = 'RECOVERY_STRATEGY',
    TEST_RESULTS = 'TEST_RESULTS',
    INCIDENT_REPORT = 'INCIDENT_REPORT',
    COMPLIANCE_EVIDENCE = 'COMPLIANCE_EVIDENCE',
    TRAINING_MATERIAL = 'TRAINING_MATERIAL',
    AUDIT_REPORT = 'AUDIT_REPORT',
    EXERCISE_REPORT = 'EXERCISE_REPORT',
    MEETING_MINUTES = 'MEETING_MINUTES',
    PROCEDURE = 'PROCEDURE',
    WORK_INSTRUCTION = 'WORK_INSTRUCTION',
    CONTACT_LIST = 'CONTACT_LIST',
    VENDOR_CONTRACT = 'VENDOR_CONTRACT',
    SLA_DOCUMENT = 'SLA_DOCUMENT',
    REGULATORY_DOCUMENT = 'REGULATORY_DOCUMENT',
    CERTIFICATE = 'CERTIFICATE',
    GAP_ANALYSIS = 'GAP_ANALYSIS',
    IMPROVEMENT_PLAN = 'IMPROVEMENT_PLAN',
    OTHER = 'OTHER',
}

export enum DocumentStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    UNDER_REVISION = 'UNDER_REVISION',
    SUPERSEDED = 'SUPERSEDED',
}

export enum AccessLevel {
    PUBLIC = 'PUBLIC',
    INTERNAL = 'INTERNAL',
    CONFIDENTIAL = 'CONFIDENTIAL',
    RESTRICTED = 'RESTRICTED',
    PRIVATE = 'PRIVATE',
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