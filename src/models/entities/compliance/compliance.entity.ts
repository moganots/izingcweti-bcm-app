import { BaseEntity } from '../../core/base/base.entity'
import { Organisation } from '../organisation'

// ============================================
// Compliance Module - Enums (Aligned with Backend)
// ============================================

export enum ComplianceStandard {
    ISO22301 = 'ISO22301',
    NIST800_34 = 'NIST800-34',
    FFIEC = 'FFIEC',
    COBIT_2019 = 'COBIT2019',
    SOC2 = 'SOC2',
    GDPR = 'GDPR',
    HIPAA = 'HIPAA',
    PCI_DSS = 'PCI_DSS',
}

export enum ComplianceStatus {
    COMPLIANT = 'COMPLIANT',
    PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
    NON_COMPLIANT = 'NON_COMPLIANT',
    NOT_ASSESSED = 'NOT_ASSESSED',
}

// ============================================
// Compliance Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * Compliance Record - Matches backend ComplianceRecord entity
 */
export interface ComplianceRecord extends BaseEntity {
    organisationId: string
    complianceStandard: ComplianceStandard
    complianceStatus: ComplianceStatus
    lastAuditDate: string | Date
    nextAuditDate: string | Date
    evidenceLinks?: string[]
    notes?: string
    gapDescription?: string
    recommendation?: string
    organisation?: Organisation
}

/**
 * Create Compliance Record DTO - Matches backend CreateComplianceRecordDto
 */
export interface CreateComplianceRecordRequest {
    organisationId: string
    complianceStandard: ComplianceStandard
    complianceStatus: ComplianceStatus
    lastAuditDate: string | Date
    nextAuditDate: string | Date
    evidenceLinks?: string[]
    notes?: string
    gapDescription?: string
    recommendation?: string
}

/**
 * Update Compliance Record DTO - Matches backend UpdateComplianceRecordDto
 */
export interface UpdateComplianceRecordRequest {
    complianceStatus?: ComplianceStatus
    lastAuditDate?: string | Date
    nextAuditDate?: string | Date
    evidenceLinks?: string[]
    notes?: string
    gapDescription?: string
    recommendation?: string
}

/**
 * Update Compliance Status Request
 */
export interface UpdateComplianceStatusRequest {
    complianceStatus: ComplianceStatus
    lastAuditDate?: string | Date
    nextAuditDate?: string | Date
}

/**
 * Add Evidence Request
 */
export interface AddEvidenceRequest {
    evidenceLinks: string[]
}

/**
 * Remove Evidence Request
 */
export interface RemoveEvidenceRequest {
    index: number
}

/**
 * Schedule Audit Request
 */
export interface ScheduleAuditRequest {
    nextAuditDate: string | Date
}

/**
 * Bulk Update Status Request
 */
export interface BulkUpdateStatusRequest {
    ids: string[]
    complianceStatus: ComplianceStatus
}

/**
 * Compliance Query Parameters - Matches backend query params
 */
export interface ComplianceQueryParams {
    organisationId?: string
    complianceStandard?: ComplianceStandard
    complianceStatus?: ComplianceStatus
    days?: number
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Compliance Statistics - Matches backend Stats response
 */
export interface ComplianceStats {
    total: number
    compliant: number
    partiallyCompliant: number
    nonCompliant: number
    notAssessed: number
    complianceRate: number
    overdueAudits: number
    upcomingAudits: number
    byStandard: Record<string, { total: number; compliant: number; rate: number }>
    byStatus: Record<string, number>
}

/**
 * Compliance Summary - For dashboard
 */
export interface ComplianceSummary {
    totalRecords: number
    compliant: number
    partiallyCompliant: number
    nonCompliant: number
    notAssessed: number
    overdueAudits: number
    upcomingAudits: number
    complianceRate: number
    byStandard: Array<{ standard: string; status: string; count: number }>
}

/**
 * Compliance Gap Item
 */
export interface ComplianceGap {
    requirement: string
    currentStatus: string
    targetStatus: string
    actionItems: string[]
    priority: 'high' | 'medium' | 'low'
}

/**
 * Compliance Audit History Entry
 */
export interface ComplianceAuditEntry {
    id: string
    title: string
    date: string | Date
    description: string
    status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'FAILED'
    auditor?: string
    findings?: string
}

/**
 * Compliance Export Request
 */
export interface ComplianceExportRequest {
    standard?: ComplianceStandard
    status?: ComplianceStatus
    startDate?: string | Date
    endDate?: string | Date
    format?: 'csv' | 'json'
}

/**
 * Compliance Verification Result
 */
export interface ComplianceVerificationResult {
    verified: boolean
    score: number
    missingRequirements: string[]
    recommendations: string[]
}

/**
 * Compliance Report
 */
export interface ComplianceReport {
    reportUrl: string
    generatedAt: string | Date
}

// ============================================
// Display Constants & Helpers
// ============================================

export const COMPLIANCE_STANDARD_LABELS: Record<string, string> = {
    ISO22301: 'ISO 22301',
    NIST800_34: 'NIST 800-34',
    FFIEC: 'FFIEC',
    COBIT_2019: 'COBIT 2019',
    SOC2: 'SOC 2',
    GDPR: 'GDPR',
    HIPAA: 'HIPAA',
    PCI_DSS: 'PCI DSS',
}

export const COMPLIANCE_STANDARD_COLORS: Record<string, string> = {
    ISO22301: 'blue',
    NIST800_34: 'green',
    FFIEC: 'orange',
    COBIT_2019: 'purple',
    SOC2: 'teal',
    GDPR: 'indigo',
    HIPAA: 'red',
    PCI_DSS: 'yellow',
}

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
    COMPLIANT: 'Compliant',
    PARTIALLY_COMPLIANT: 'Partially Compliant',
    NON_COMPLIANT: 'Non-Compliant',
    NOT_ASSESSED: 'Not Assessed',
}

export const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
    COMPLIANT: 'positive',
    PARTIALLY_COMPLIANT: 'warning',
    NON_COMPLIANT: 'negative',
    NOT_ASSESSED: 'grey',
}

export const COMPLIANCE_STATUS_PROGRESS: Record<string, number> = {
    COMPLIANT: 100,
    PARTIALLY_COMPLIANT: 50,
    NON_COMPLIANT: 10,
    NOT_ASSESSED: 0,
}

export const GAP_PRIORITY_LABELS: Record<string, string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
}

export const GAP_PRIORITY_COLORS: Record<string, string> = {
    high: 'negative',
    medium: 'warning',
    low: 'info',
}

/**
 * Helper Functions
 */
export function getComplianceStandardLabel(standard: string): string {
    return COMPLIANCE_STANDARD_LABELS[standard] || standard
}

export function getComplianceStandardColor(standard: string): string {
    return COMPLIANCE_STANDARD_COLORS[standard] || 'grey'
}

export function getComplianceStatusLabel(status: string): string {
    return COMPLIANCE_STATUS_LABELS[status] || status
}

export function getComplianceStatusColor(status: string): string {
    return COMPLIANCE_STATUS_COLORS[status] || 'grey'
}

export function getComplianceStatusProgress(status: string): number {
    return COMPLIANCE_STATUS_PROGRESS[status] || 0
}

export function isAuditOverdue(nextAuditDate: string | Date): boolean {
    if (!nextAuditDate) return false
    return new Date(nextAuditDate) < new Date()
}

export function isAuditDueSoon(nextAuditDate: string | Date, days: number = 30): boolean {
    if (!nextAuditDate) return false
    const due = new Date(nextAuditDate)
    const now = new Date()
    const future = new Date()
    future.setDate(now.getDate() + days)
    return due <= future && due > now
}

export function calculateComplianceRate(compliant: number, total: number): number {
    if (total === 0) return 0
    return Math.round((compliant / total) * 100)
}

export function formatComplianceStandard(standard: string): string {
    if (!standard) return ''
    return standard
        .replace(/([A-Z]+)(\d+)/, '$1 $2')
        .replace(/(\d+)-(\d+)/, '$1-$2')
        .replace(/_/g, ' ')
}

export function getDaysUntilAudit(nextAuditDate: string | Date): number {
    if (!nextAuditDate) return 0
    const due = new Date(nextAuditDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}