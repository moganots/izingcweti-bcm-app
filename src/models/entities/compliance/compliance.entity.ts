/**
 * Compliance Standard Enum
 */
export enum ComplianceStandard {
    ISO_22301 = 'ISO22301',
    NIST_800_34 = 'NIST800-34',
    FFIEC = 'FFIEC',
    COBIT_2019 = 'COBIT2019',
}

/**
 * Compliance Status Enum
 */
export enum ComplianceStatus {
    COMPLIANT = 'Compliant',
    PARTIALLY = 'Partially',
    NON_COMPLIANT = 'NonCompliant',
}

/**
 * Compliance Record Entity (Flat version for IndexedDB)
 */
export interface ComplianceRecord {
    uuid: string
    organisation_id: string
    compliance_standard: string
    compliance_status: string
    last_audit_date: string
    next_audit_due: string
    evidence_links?: string[]
    organisation?: {
        uuid: string
        name: string
    }
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
    version: number
    sync_status: string
}

/**
 * Create Compliance Record Request
 */
export interface CreateComplianceRecordRequest {
    organisation_id: string
    compliance_standard: string
    compliance_status: string
    last_audit_date: string
    next_audit_due: string
    evidence_links?: string[]
}

/**
 * Update Compliance Record Request
 */
export interface UpdateComplianceRecordRequest {
    compliance_status?: string
    last_audit_date?: string
    next_audit_due?: string
    evidence_links?: string[]
}

/**
 * Update Compliance Status Request
 */
export interface UpdateComplianceStatusRequest {
    compliance_status: string
    last_audit_date?: string
}

/**
 * Add Evidence Request
 */
export interface AddEvidenceRequest {
    evidence_links: string[]
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
    next_audit_due: string
    auditor?: string
}

/**
 * Bulk Update Status Request
 */
export interface BulkUpdateStatusRequest {
    ids: string[]
    compliance_status: string
}

/**
 * Compliance Statistics
 */
export interface ComplianceStats {
    /** Total number of records */
    total: number
    /** Number of compliant records */
    compliant: number
    /** Number of partially compliant records */
    partially: number
    /** Number of non-compliant records */
    nonCompliant: number
    /** Number of overdue audits */
    overdueAudits: number
    /** Number of audits due within 30 days */
    upcomingAudits: number
    /** Overall compliance rate (percentage) */
    complianceRate: number
    /** Records grouped by standard */
    byStandard: Record<string, number>
    /** Records grouped by status */
    byStatus: Record<string, number>
}

/**
 * Compliance Gap Item
 */
export interface ComplianceGap {
    /** The requirement that needs to be met */
    requirement: string
    /** Current compliance status */
    currentStatus: string
    /** Target compliance status */
    targetStatus: string
    /** Action items to close the gap */
    actionItems: string[]
    /** Priority level */
    priority: 'high' | 'medium' | 'low'
}

/**
 * Compliance Audit History Entry
 */
export interface ComplianceAuditEntry {
    /** Title of the audit */
    title: string
    /** Date of the audit */
    date: string
    /** Description of the audit */
    description: string
    /** Status of the audit */
    status: 'Completed' | 'In Progress' | 'Scheduled' | 'Failed'
    /** Name of the auditor */
    auditor?: string
    /** Findings from the audit */
    findings?: string
}

/**
 * Compliance Export Request
 */
export interface ComplianceExportRequest {
    standard?: string
    status?: string
    start_date?: string
    end_date?: string
    format?: 'csv' | 'json'
}

/**
 * Compliance Filter Parameters
 */
export interface ComplianceFilterParams {
    /** Search term */
    search?: string
    /** Filter by compliance standard */
    standard?: string
    /** Filter by compliance status */
    status?: string
    /** Filter by organisation ID */
    organisation_id?: string
    /** Filter overdue audits only */
    overdue_only?: boolean
    /** Filter upcoming audits within days */
    days?: number
    /** Filter audits due before date */
    audit_due_before?: string
    /** Filter audits due after date */
    audit_due_after?: string
    /** Page number */
    page?: number
    /** Items per page */
    limit?: number
    /** Sort field */
    sortBy?: string
    /** Sort direction */
    sortOrder?: 'ASC' | 'DESC'
}

// ============================================
// Display Constants
// ============================================

/**
 * Compliance Standard Labels (for display)
 */
export const COMPLIANCE_STANDARD_LABELS: Record<string, string> = {
    ISO22301: 'ISO 22301',
    'NIST800-34': 'NIST 800-34',
    FFIEC: 'FFIEC',
    COBIT2019: 'COBIT 2019',
}

/**
 * Compliance Standard Colors (for display)
 */
export const COMPLIANCE_STANDARD_COLORS: Record<string, string> = {
    ISO22301: 'blue',
    'NIST800-34': 'green',
    FFIEC: 'orange',
    COBIT2019: 'purple',
}

/**
 * Compliance Standard Icons (for display)
 */
export const COMPLIANCE_STANDARD_ICONS: Record<string, string> = {
    ISO22301: 'verified',
    'NIST800-34': 'security',
    FFIEC: 'account_balance',
    COBIT2019: 'assessment',
}

/**
 * Compliance Status Labels (for display)
 */
export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
    Compliant: 'Compliant',
    Partially: 'Partially Compliant',
    NonCompliant: 'Non-Compliant',
}

/**
 * Compliance Status Colors (for display)
 */
export const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
    Compliant: 'green',
    Partially: 'orange',
    NonCompliant: 'red',
}

/**
 * Compliance Status Icons (for display)
 */
export const COMPLIANCE_STATUS_ICONS: Record<string, string> = {
    Compliant: 'check_circle',
    Partially: 'warning',
    NonCompliant: 'error',
}

/**
 * Compliance Status Progress Values
 */
export const COMPLIANCE_STATUS_PROGRESS: Record<string, number> = {
    Compliant: 1,
    Partially: 0.5,
    NonCompliant: 0.1,
}

/**
 * Compliance Status Descriptions
 */
export const COMPLIANCE_STATUS_DESCRIPTIONS: Record<string, string> = {
    Compliant: 'Fully compliant with all requirements',
    Partially: 'Partially compliant - some gaps identified',
    NonCompliant: 'Non-compliant - immediate action required',
}

/**
 * Audit Status Labels
 */
export const AUDIT_STATUS_LABELS: Record<string, string> = {
    Completed: 'Completed',
    'In Progress': 'In Progress',
    Scheduled: 'Scheduled',
    Failed: 'Failed',
}

/**
 * Audit Status Colors
 */
export const AUDIT_STATUS_COLORS: Record<string, string> = {
    Completed: 'green',
    'In Progress': 'orange',
    Scheduled: 'blue',
    Failed: 'red',
}

/**
 * Audit Status Icons
 */
export const AUDIT_STATUS_ICONS: Record<string, string> = {
    Completed: 'check_circle',
    'In Progress': 'hourglass_top',
    Scheduled: 'event',
    Failed: 'error',
}

/**
 * Gap Priority Labels
 */
export const GAP_PRIORITY_LABELS: Record<string, string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
}

/**
 * Gap Priority Colors
 */
export const GAP_PRIORITY_COLORS: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
}

/**
 * Gap Priority Icons
 */
export const GAP_PRIORITY_ICONS: Record<string, string> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get display label for a compliance standard
 */
export function getComplianceStandardLabel(standard: string): string {
    return COMPLIANCE_STANDARD_LABELS[standard] || standard
}

/**
 * Get color for a compliance standard
 */
export function getComplianceStandardColor(standard: string): string {
    return COMPLIANCE_STANDARD_COLORS[standard] || 'grey'
}

/**
 * Get icon for a compliance standard
 */
export function getComplianceStandardIcon(standard: string): string {
    return COMPLIANCE_STANDARD_ICONS[standard] || 'help'
}

/**
 * Get display label for a compliance status
 */
export function getComplianceStatusLabel(status: string): string {
    return COMPLIANCE_STATUS_LABELS[status] || status
}

/**
 * Get color for a compliance status
 */
export function getComplianceStatusColor(status: string): string {
    return COMPLIANCE_STATUS_COLORS[status] || 'grey'
}

/**
 * Get icon for a compliance status
 */
export function getComplianceStatusIcon(status: string): string {
    return COMPLIANCE_STATUS_ICONS[status] || 'help'
}

/**
 * Get progress value for a compliance status
 */
export function getComplianceStatusProgress(status: string): number {
    return COMPLIANCE_STATUS_PROGRESS[status] || 0
}

/**
 * Get description for a compliance status
 */
export function getComplianceStatusDescription(status: string): string {
    return COMPLIANCE_STATUS_DESCRIPTIONS[status] || ''
}

/**
 * Check if an audit is overdue
 */
export function isAuditOverdue(nextAuditDue: string): boolean {
    if (!nextAuditDue) return false
    return new Date(nextAuditDue) < new Date()
}

/**
 * Check if an audit is due soon (within specified days)
 */
export function isAuditDueSoon(nextAuditDue: string, days: number = 30): boolean {
    if (!nextAuditDue) return false
    const due = new Date(nextAuditDue)
    const now = new Date()
    const future = new Date()
    future.setDate(now.getDate() + days)
    return due <= future && due > now
}

/**
 * Calculate compliance rate
 */
export function calculateComplianceRate(compliant: number, total: number): number {
    if (total === 0) return 0
    return Math.round((compliant / total) * 100)
}

/**
 * Format compliance standard for display
 */
export function formatComplianceStandard(standard: string): string {
    if (!standard) return ''
    // Handle formats like ISO22301 -> ISO 22301
    return standard
        .replace(/([A-Z]+)(\d+)/, '$1 $2')
        .replace(/(\d+)-(\d+)/, '$1-$2')
        .replace(/_/g, ' ')
}

/**
 * Create Compliance Record Request
 */
export interface CreateComplianceRecordRequest {
    organisation_id: string
    compliance_standard: string
    compliance_status: string
    last_audit_date: string
    next_audit_due: string
    evidence_links?: string[]
}

/**
 * Update Compliance Record Request
 */
export interface UpdateComplianceRecordRequest {
    compliance_status?: string
    last_audit_date?: string
    next_audit_due?: string
    evidence_links?: string[]
}

/**
 * Update Compliance Status Request
 */
export interface UpdateComplianceStatusRequest {
    compliance_status: string
    last_audit_date?: string
}

/**
 * Add Evidence Request
 */
export interface AddEvidenceRequest {
    evidence_links: string[]
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
    next_audit_due: string
    auditor?: string
}

/**
 * Bulk Update Status Request
 */
export interface BulkUpdateStatusRequest {
    ids: string[]
    compliance_status: string
}

/**
 * Compliance Statistics
 */
export interface ComplianceStats {
    total: number
    compliant: number
    partially: number
    nonCompliant: number
    overdueAudits: number
    upcomingAudits: number
    complianceRate: number
    byStandard: Record<string, number>
    byStatus: Record<string, number>
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
export interface ComplianceAuditHistoryEntry {
    title: string
    date: string
    description: string
    status: string
    auditor?: string
    findings?: string
}
