// ============================================
// Governance Module - Entity Types
// Aligned with Backend DTOs (camelCase)
// ============================================

import { BaseEntity } from 'src/core/base/base.entity'
import type { Organisation, Department } from '../organisation/organisation.entity'
import type { User } from '../user/user.entity'

// ============================================
// Enums - Aligned with Backend
// ============================================

/**
 * Policy Status Enum
 */
export enum PolicyStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    ARCHIVED = 'Archived',
    UNDER_REVIEW = 'Under Review',
    APPROVED = 'Approved',
    SUSPENDED = 'Suspended',
    UNDER_REVISION = 'Under Revision',
    REVIEW_REQUIRED = 'Review Required',
    SUPERSEDED = 'Superseded',
    EXPIRED = 'Expired',
    REJECTED = 'Rejected',
    WITHDRAWN = 'Withdrawn',
    OBSOLETE = 'Obsolete',
    INACTIVE = 'Inactive',
}

/**
 * Policy Category Enum
 */
export enum PolicyCategory {
    BCM = 'BCM',
    RISK_MANAGEMENT = 'Risk Management',
    COMPLIANCE = 'Compliance',
    IT_SECURITY = 'IT Security',
    HR = 'Human Resources',
    OPERATIONS = 'Operations',
    FINANCE = 'Finance',
    DATA_PRIVACY = 'Data Privacy',
    INCIDENT_MANAGEMENT = 'Incident Management',
    CRISIS_COMMUNICATION = 'Crisis Communication',
    BUSINESS_CONTINUITY = 'Business Continuity',
    DISASTER_RECOVERY = 'Disaster Recovery',
    QUALITY = 'Quality',
    ENVIRONMENTAL = 'Environmental',
    HEALTH_SAFETY = 'Health & Safety',
    SUPPLY_CHAIN = 'Supply Chain',
    LEGAL = 'Legal',
    OTHER = 'Other',
}

/**
 * Activity Action Enum
 */
export enum ActivityAction {
    POLICY_CREATED = 'Policy Created',
    POLICY_UPDATED = 'Policy Updated',
    POLICY_ACTIVATED = 'Policy Activated',
    POLICY_DEACTIVATED = 'Policy Deactivated',
    POLICY_ARCHIVED = 'Policy Archived',
    POLICY_REVIEWED = 'Policy Reviewed',
    POLICY_APPROVED = 'Policy Approved',
    POLICY_REJECTED = 'Policy Rejected',
    ASSESSMENT_CREATED = 'Assessment Created',
    ASSESSMENT_UPDATED = 'Assessment Updated',
    ASSESSMENT_DELETED = 'Assessment Deleted',
    MaturityLevel_CHANGED = 'Maturity Level Changed',
    COMPLIANCE_CHECK = 'Compliance Check',
    AUDIT_COMPLETED = 'Audit Completed',
    REVIEW_COMPLETED = 'Review Completed',
    USER_LOGGED_IN = 'User Logged In',
    USER_LOGGED_OUT = 'User Logged Out',
    USER_CREATED = 'User Created',
    USER_UPDATED = 'User Updated',
    USER_DELETED = 'User Deleted',
    PERMISSION_CHANGED = 'Permission Changed',
    SETTINGS_CHANGED = 'Settings Changed',
    SYSTEM_CONFIGURED = 'System Configured',
    EXPORT_COMPLETED = 'Export Completed',
    REPORT_GENERATED = 'Report Generated',
    IMPORT_COMPLETED = 'Import Completed',
    WORKFLOW_TRIGGERED = 'Workflow Triggered',
    NOTIFICATION_SENT = 'Notification Sent',
    SYNC_COMPLETED = 'Sync Completed',
    BACKUP_CREATED = 'Backup Created',
    RESTORE_COMPLETED = 'Restore Completed',
}

/**
 * Maturity Level Enum
 */
export enum MaturityLevel {
    INITIAL = 'Initial',
    MANAGED = 'Managed',
    DEFINED = 'Defined',
    QUANTITATIVELY_MANAGED = 'Quantitatively Managed',
    OPTIMISED = 'Optimised',
    DEVELOPING = 'Developing',
    REPEATABLE = 'Repeatable',
    ESTABLISHED = 'Established',
    ADVANCED = 'Advanced',
    OPTIMISING = 'Optimising',
}

// ============================================
// Entity Interfaces
// ============================================

/**
 * Governance Policy Entity
 */
export interface GovernancePolicy extends BaseEntity {
    organisationId: string
    departmentId?: string
    name: string
    description?: string
    category?: PolicyCategory
    status: PolicyStatus
    policyVersion: string
    effectiveDate?: string | Date
    nextReviewDate?: string | Date
    ownerId?: string
    tags?: string[]
    organisation?: Organisation
    department?: Department
    owner?: User
}

/**
 * Maturity Assessment Entity
 */
export interface MaturityAssessment extends BaseEntity {
    organisationId: string
    departmentId?: string
    assessedDate: string | Date
    score: number
    level: MaturityLevel
    findings?: string
    recommendations?: string
    assessedBy?: string
    domainScores?: Record<string, number>
    organisation?: Organisation
    department?: Department
    assessor?: User
}

/**
 * Governance Activity Entity
 */
export interface GovernanceActivity extends BaseEntity {
    organisationId: string
    departmentId?: string
    action: ActivityAction
    userId?: string
    targetType?: string
    targetId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    organisation?: Organisation
    department?: Department
    user?: User
}

// ============================================
// DTOs - Request/Response
// ============================================

/**
 * Create Policy Request
 */
export interface CreatePolicyRequest {
    organisationId: string
    departmentId?: string
    name: string
    description?: string
    category?: PolicyCategory
    status?: PolicyStatus
    policyVersion?: string
    effectiveDate?: string | Date
    nextReviewDate?: string | Date
    ownerId?: string
    tags?: string[]
}

/**
 * Update Policy Request
 */
export interface UpdatePolicyRequest {
    name?: string
    description?: string
    category?: PolicyCategory
    status?: PolicyStatus
    policyVersion?: string
    effectiveDate?: string | Date
    nextReviewDate?: string | Date
    ownerId?: string
    tags?: string[]
}

/**
 * Create Maturity Assessment Request
 */
export interface CreateMaturityAssessmentRequest {
    organisationId: string
    departmentId?: string
    assessedDate: string | Date
    score: number
    level: MaturityLevel
    findings?: string
    recommendations?: string
    assessedBy?: string
    domainScores?: Record<string, number>
}

/**
 * Update Maturity Assessment Request
 */
export interface UpdateMaturityAssessmentRequest {
    assessedDate?: string | Date
    score?: number
    level?: MaturityLevel
    findings?: string
    recommendations?: string
    assessedBy?: string
    domainScores?: Record<string, number>
}

/**
 * Create Activity Request
 */
export interface CreateActivityRequest {
    organisationId: string
    departmentId?: string
    action: ActivityAction
    userId?: string
    targetType?: string
    targetId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

/**
 * Policy Query Params
 */
export interface PolicyQueryParams {
    status?: PolicyStatus
    category?: PolicyCategory
    ownerId?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Maturity Query Params
 */
export interface MaturityQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Activity Query Params
 */
export interface ActivityQueryParams {
    targetType?: string
    targetId?: string
    userId?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

// ============================================
// Statistics & Response Types
// ============================================

/**
 * Policy Statistics
 */
export interface PolicyStats {
    total: number
    active: number
    draft: number
    archived: number
    underReview: number
    expired: number
}

/**
 * Maturity Statistics
 */
export interface MaturityStats {
    total: number
    averageScore: number
    highestScore: number
    lowestScore: number
    latestScore: number
    latestLevel: string
    trend: Array<{ date: string; score: number }>
}

/**
 * Activity Statistics
 */
export interface ActivityStats {
    total: number
    byAction: Record<string, number>
    byTarget: Record<string, number>
    recentCount: number
}

/**
 * Governance Metrics
 */
export interface GovernanceMetrics {
    policyStats: PolicyStats
    maturityTrend: Array<{ date: string; score: number; level: string }>
    recentActivities: GovernanceActivity[]
    maturityStats: {
        latestScore: number
        latestLevel: string
        averageScore: number
    }
}

/**
 * Compliance Overview
 */
export interface ComplianceOverview {
    complianceRate: number
    dueReviews: number
    totalPolicies: number
    activePolicies: number
}

/**
 * Governance Health
 */
export interface GovernanceHealth {
    overallHealth: 'healthy' | 'warning' | 'critical'
    complianceRate: number
    policyCoverage: number
    maturityScore: number
    recentActivity: number
    issuesCount: number
}

// ============================================
// Display Constants & Helpers
// ============================================

// Policy Status Labels
export const PolicyStatus_LABELS: Record<PolicyStatus, string> = {
    [PolicyStatus.DRAFT]: 'Draft',
    [PolicyStatus.ACTIVE]: 'Active',
    [PolicyStatus.ARCHIVED]: 'Archived',
    [PolicyStatus.UNDER_REVIEW]: 'Under Review',
    [PolicyStatus.APPROVED]: 'Approved',
    [PolicyStatus.SUSPENDED]: 'Suspended',
    [PolicyStatus.UNDER_REVISION]: 'Under Revision',
    [PolicyStatus.REVIEW_REQUIRED]: 'Review Required',
    [PolicyStatus.SUPERSEDED]: 'Superseded',
    [PolicyStatus.EXPIRED]: 'Expired',
    [PolicyStatus.REJECTED]: 'Rejected',
    [PolicyStatus.WITHDRAWN]: 'Withdrawn',
    [PolicyStatus.OBSOLETE]: 'Obsolete',
    [PolicyStatus.INACTIVE]: 'Inactive',
}

// Policy Status Colors
export const PolicyStatus_COLORS: Record<PolicyStatus, string> = {
    [PolicyStatus.DRAFT]: 'grey',
    [PolicyStatus.ACTIVE]: 'success',
    [PolicyStatus.ARCHIVED]: 'grey-7',
    [PolicyStatus.UNDER_REVIEW]: 'warning',
    [PolicyStatus.APPROVED]: 'success',
    [PolicyStatus.SUSPENDED]: 'orange',
    [PolicyStatus.UNDER_REVISION]: 'info',
    [PolicyStatus.REVIEW_REQUIRED]: 'orange',
    [PolicyStatus.SUPERSEDED]: 'grey-6',
    [PolicyStatus.EXPIRED]: 'danger',
    [PolicyStatus.REJECTED]: 'danger',
    [PolicyStatus.WITHDRAWN]: 'grey',
    [PolicyStatus.OBSOLETE]: 'grey-8',
    [PolicyStatus.INACTIVE]: 'grey-5',
}

// Policy Category Labels
export const PolicyCategory_LABELS: Record<PolicyCategory, string> = {
    [PolicyCategory.BCM]: 'Business Continuity Management',
    [PolicyCategory.RISK_MANAGEMENT]: 'Risk Management',
    [PolicyCategory.COMPLIANCE]: 'Compliance',
    [PolicyCategory.IT_SECURITY]: 'IT Security',
    [PolicyCategory.HR]: 'Human Resources',
    [PolicyCategory.OPERATIONS]: 'Operations',
    [PolicyCategory.FINANCE]: 'Finance',
    [PolicyCategory.DATA_PRIVACY]: 'Data Privacy',
    [PolicyCategory.INCIDENT_MANAGEMENT]: 'Incident Management',
    [PolicyCategory.CRISIS_COMMUNICATION]: 'Crisis Communication',
    [PolicyCategory.BUSINESS_CONTINUITY]: 'Business Continuity',
    [PolicyCategory.DISASTER_RECOVERY]: 'Disaster Recovery',
    [PolicyCategory.QUALITY]: 'Quality',
    [PolicyCategory.ENVIRONMENTAL]: 'Environmental',
    [PolicyCategory.HEALTH_SAFETY]: 'Health & Safety',
    [PolicyCategory.SUPPLY_CHAIN]: 'Supply Chain',
    [PolicyCategory.LEGAL]: 'Legal',
    [PolicyCategory.OTHER]: 'Other',
}

// Policy Category Colors
export const PolicyCategory_COLORS: Record<PolicyCategory, string> = {
    [PolicyCategory.BCM]: 'deep-purple',
    [PolicyCategory.RISK_MANAGEMENT]: 'orange',
    [PolicyCategory.COMPLIANCE]: 'blue',
    [PolicyCategory.IT_SECURITY]: 'cyan',
    [PolicyCategory.HR]: 'pink',
    [PolicyCategory.OPERATIONS]: 'teal',
    [PolicyCategory.FINANCE]: 'green',
    [PolicyCategory.DATA_PRIVACY]: 'indigo',
    [PolicyCategory.INCIDENT_MANAGEMENT]: 'red',
    [PolicyCategory.CRISIS_COMMUNICATION]: 'amber',
    [PolicyCategory.BUSINESS_CONTINUITY]: 'deep-green',
    [PolicyCategory.DISASTER_RECOVERY]: 'brown',
    [PolicyCategory.QUALITY]: 'light-blue',
    [PolicyCategory.ENVIRONMENTAL]: 'green',
    [PolicyCategory.HEALTH_SAFETY]: 'lime',
    [PolicyCategory.SUPPLY_CHAIN]: 'purple',
    [PolicyCategory.LEGAL]: 'grey',
    [PolicyCategory.OTHER]: 'grey-7',
}

// Activity Action Labels
export const ActivityAction_LABELS: Record<ActivityAction, string> = {
    [ActivityAction.POLICY_CREATED]: 'Policy Created',
    [ActivityAction.POLICY_UPDATED]: 'Policy Updated',
    [ActivityAction.POLICY_ACTIVATED]: 'Policy Activated',
    [ActivityAction.POLICY_DEACTIVATED]: 'Policy Deactivated',
    [ActivityAction.POLICY_ARCHIVED]: 'Policy Archived',
    [ActivityAction.POLICY_REVIEWED]: 'Policy Reviewed',
    [ActivityAction.POLICY_APPROVED]: 'Policy Approved',
    [ActivityAction.POLICY_REJECTED]: 'Policy Rejected',
    [ActivityAction.ASSESSMENT_CREATED]: 'Assessment Created',
    [ActivityAction.ASSESSMENT_UPDATED]: 'Assessment Updated',
    [ActivityAction.ASSESSMENT_DELETED]: 'Assessment Deleted',
    [ActivityAction.MaturityLevel_CHANGED]: 'Maturity Level Changed',
    [ActivityAction.COMPLIANCE_CHECK]: 'Compliance Check',
    [ActivityAction.AUDIT_COMPLETED]: 'Audit Completed',
    [ActivityAction.REVIEW_COMPLETED]: 'Review Completed',
    [ActivityAction.USER_LOGGED_IN]: 'User Logged In',
    [ActivityAction.USER_LOGGED_OUT]: 'User Logged Out',
    [ActivityAction.USER_CREATED]: 'User Created',
    [ActivityAction.USER_UPDATED]: 'User Updated',
    [ActivityAction.USER_DELETED]: 'User Deleted',
    [ActivityAction.PERMISSION_CHANGED]: 'Permission Changed',
    [ActivityAction.SETTINGS_CHANGED]: 'Settings Changed',
    [ActivityAction.SYSTEM_CONFIGURED]: 'System Configured',
    [ActivityAction.EXPORT_COMPLETED]: 'Export Completed',
    [ActivityAction.REPORT_GENERATED]: 'Report Generated',
    [ActivityAction.IMPORT_COMPLETED]: 'Import Completed',
    [ActivityAction.WORKFLOW_TRIGGERED]: 'Workflow Triggered',
    [ActivityAction.NOTIFICATION_SENT]: 'Notification Sent',
    [ActivityAction.SYNC_COMPLETED]: 'Sync Completed',
    [ActivityAction.BACKUP_CREATED]: 'Backup Created',
    [ActivityAction.RESTORE_COMPLETED]: 'Restore Completed',
}

// Activity Action Colors
export const ActivityAction_COLORS: Record<ActivityAction, string> = {
    [ActivityAction.POLICY_CREATED]: 'success',
    [ActivityAction.POLICY_UPDATED]: 'info',
    [ActivityAction.POLICY_ACTIVATED]: 'success',
    [ActivityAction.POLICY_DEACTIVATED]: 'warning',
    [ActivityAction.POLICY_ARCHIVED]: 'grey',
    [ActivityAction.POLICY_REVIEWED]: 'info',
    [ActivityAction.POLICY_APPROVED]: 'success',
    [ActivityAction.POLICY_REJECTED]: 'danger',
    [ActivityAction.ASSESSMENT_CREATED]: 'success',
    [ActivityAction.ASSESSMENT_UPDATED]: 'info',
    [ActivityAction.ASSESSMENT_DELETED]: 'danger',
    [ActivityAction.MaturityLevel_CHANGED]: 'warning',
    [ActivityAction.COMPLIANCE_CHECK]: 'info',
    [ActivityAction.AUDIT_COMPLETED]: 'success',
    [ActivityAction.REVIEW_COMPLETED]: 'success',
    [ActivityAction.USER_LOGGED_IN]: 'success',
    [ActivityAction.USER_LOGGED_OUT]: 'warning',
    [ActivityAction.USER_CREATED]: 'success',
    [ActivityAction.USER_UPDATED]: 'info',
    [ActivityAction.USER_DELETED]: 'danger',
    [ActivityAction.PERMISSION_CHANGED]: 'warning',
    [ActivityAction.SETTINGS_CHANGED]: 'info',
    [ActivityAction.SYSTEM_CONFIGURED]: 'info',
    [ActivityAction.EXPORT_COMPLETED]: 'success',
    [ActivityAction.REPORT_GENERATED]: 'success',
    [ActivityAction.IMPORT_COMPLETED]: 'success',
    [ActivityAction.WORKFLOW_TRIGGERED]: 'info',
    [ActivityAction.NOTIFICATION_SENT]: 'info',
    [ActivityAction.SYNC_COMPLETED]: 'success',
    [ActivityAction.BACKUP_CREATED]: 'info',
    [ActivityAction.RESTORE_COMPLETED]: 'success',
}

// Activity Action Icons
export const ActivityAction_ICONS: Record<ActivityAction, string> = {
    [ActivityAction.POLICY_CREATED]: 'add_circle',
    [ActivityAction.POLICY_UPDATED]: 'edit',
    [ActivityAction.POLICY_ACTIVATED]: 'check_circle',
    [ActivityAction.POLICY_DEACTIVATED]: 'cancel',
    [ActivityAction.POLICY_ARCHIVED]: 'archive',
    [ActivityAction.POLICY_REVIEWED]: 'rate_review',
    [ActivityAction.POLICY_APPROVED]: 'approval',
    [ActivityAction.POLICY_REJECTED]: 'block',
    [ActivityAction.ASSESSMENT_CREATED]: 'assessment',
    [ActivityAction.ASSESSMENT_UPDATED]: 'edit_note',
    [ActivityAction.ASSESSMENT_DELETED]: 'delete',
    [ActivityAction.MaturityLevel_CHANGED]: 'trending_up',
    [ActivityAction.COMPLIANCE_CHECK]: 'verified',
    [ActivityAction.AUDIT_COMPLETED]: 'fact_check',
    [ActivityAction.REVIEW_COMPLETED]: 'done_all',
    [ActivityAction.USER_LOGGED_IN]: 'login',
    [ActivityAction.USER_LOGGED_OUT]: 'logout',
    [ActivityAction.USER_CREATED]: 'person_add',
    [ActivityAction.USER_UPDATED]: 'person_edit',
    [ActivityAction.USER_DELETED]: 'person_remove',
    [ActivityAction.PERMISSION_CHANGED]: 'security',
    [ActivityAction.SETTINGS_CHANGED]: 'settings',
    [ActivityAction.SYSTEM_CONFIGURED]: 'build',
    [ActivityAction.EXPORT_COMPLETED]: 'file_download',
    [ActivityAction.REPORT_GENERATED]: 'description',
    [ActivityAction.IMPORT_COMPLETED]: 'file_upload',
    [ActivityAction.WORKFLOW_TRIGGERED]: 'play_arrow',
    [ActivityAction.NOTIFICATION_SENT]: 'notifications',
    [ActivityAction.SYNC_COMPLETED]: 'sync',
    [ActivityAction.BACKUP_CREATED]: 'backup',
    [ActivityAction.RESTORE_COMPLETED]: 'restore',
}

// Maturity Level Labels
export const MaturityLevel_LABELS: Record<MaturityLevel, string> = {
    [MaturityLevel.INITIAL]: 'Initial',
    [MaturityLevel.MANAGED]: 'Managed',
    [MaturityLevel.DEFINED]: 'Defined',
    [MaturityLevel.QUANTITATIVELY_MANAGED]: 'Quantitatively Managed',
    [MaturityLevel.OPTIMISED]: 'Optimised',
    [MaturityLevel.DEVELOPING]: 'Developing',
    [MaturityLevel.REPEATABLE]: 'Repeatable',
    [MaturityLevel.ESTABLISHED]: 'Established',
    [MaturityLevel.ADVANCED]: 'Advanced',
    [MaturityLevel.OPTIMISING]: 'Optimising',
}

// Maturity Level Colors
export const MaturityLevel_COLORS: Record<MaturityLevel, string> = {
    [MaturityLevel.INITIAL]: 'grey',
    [MaturityLevel.MANAGED]: 'blue',
    [MaturityLevel.DEFINED]: 'info',
    [MaturityLevel.QUANTITATIVELY_MANAGED]: 'success',
    [MaturityLevel.OPTIMISED]: 'green',
    [MaturityLevel.DEVELOPING]: 'purple',
    [MaturityLevel.REPEATABLE]: 'orange',
    [MaturityLevel.ESTABLISHED]: 'teal',
    [MaturityLevel.ADVANCED]: 'deep-purple',
    [MaturityLevel.OPTIMISING]: 'deep-green',
}

// Maturity Level Score Ranges
export const MaturityLevel_RANGES: Record<MaturityLevel, { min: number; max: number }> = {
    [MaturityLevel.INITIAL]: { min: 0, max: 20 },
    [MaturityLevel.MANAGED]: { min: 21, max: 40 },
    [MaturityLevel.DEFINED]: { min: 41, max: 60 },
    [MaturityLevel.QUANTITATIVELY_MANAGED]: { min: 61, max: 80 },
    [MaturityLevel.OPTIMISED]: { min: 81, max: 100 },
    [MaturityLevel.DEVELOPING]: { min: 0, max: 25 },
    [MaturityLevel.REPEATABLE]: { min: 26, max: 45 },
    [MaturityLevel.ESTABLISHED]: { min: 46, max: 65 },
    [MaturityLevel.ADVANCED]: { min: 66, max: 85 },
    [MaturityLevel.OPTIMISING]: { min: 86, max: 100 },
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get policy status label
 */
export function getPolicyStatusLabel(status: PolicyStatus): string {
    return PolicyStatus_LABELS[status] || status
}

/**
 * Get policy status color
 */
export function getPolicyStatusColor(status: PolicyStatus): string {
    return PolicyStatus_COLORS[status] || 'grey'
}

/**
 * Get policy category label
 */
export function getPolicyCategoryLabel(category: PolicyCategory): string {
    return PolicyCategory_LABELS[category] || category
}

/**
 * Get policy category color
 */
export function getPolicyCategoryColor(category: PolicyCategory): string {
    return PolicyCategory_COLORS[category] || 'grey'
}

/**
 * Get activity action label
 */
export function getActivityActionLabel(action: ActivityAction): string {
    return ActivityAction_LABELS[action] || action
}

/**
 * Get activity action color
 */
export function getActivityActionColor(action: ActivityAction): string {
    return ActivityAction_COLORS[action] || 'grey'
}

/**
 * Get activity action icon
 */
export function getActivityActionIcon(action: ActivityAction): string {
    return ActivityAction_ICONS[action] || 'event_note'
}

/**
 * Get maturity level label
 */
export function getMaturityLevelLabel(level: MaturityLevel): string {
    return MaturityLevel_LABELS[level] || level
}

/**
 * Get maturity level color
 */
export function getMaturityLevelColor(level: MaturityLevel): string {
    return MaturityLevel_COLORS[level] || 'grey'
}

/**
 * Get maturity level score range
 */
export function getMaturityLevelRange(level: MaturityLevel): { min: number; max: number } {
    return MaturityLevel_RANGES[level] || { min: 0, max: 100 }
}

/**
 * Get maturity level from score
 */
export function getMaturityLevelFromScore(score: number): MaturityLevel {
    for (const [level, range] of Object.entries(MaturityLevel_RANGES)) {
        if (score >= range.min && score <= range.max) {
            return level as MaturityLevel
        }
    }
    return MaturityLevel.INITIAL
}

/**
 * Get all policy statuses as select options
 */
export function getPolicyStatusOptions(): Array<{ label: string; value: PolicyStatus }> {
    return Object.values(PolicyStatus).map((status) => ({
        label: getPolicyStatusLabel(status),
        value: status,
    }))
}

/**
 * Get all policy categories as select options
 */
export function getPolicyCategoryOptions(): Array<{ label: string; value: PolicyCategory }> {
    return Object.values(PolicyCategory).map((category) => ({
        label: getPolicyCategoryLabel(category),
        value: category,
    }))
}

/**
 * Get all maturity levels as select options
 */
export function getMaturityLevelOptions(): Array<{ label: string; value: MaturityLevel }> {
    return Object.values(MaturityLevel).map((level) => ({
        label: getMaturityLevelLabel(level),
        value: level,
    }))
}

/**
 * Get all activity actions as select options
 */
export function getActivityActionOptions(): Array<{ label: string; value: ActivityAction }> {
    return Object.values(ActivityAction).map((action) => ({
        label: getActivityActionLabel(action),
        value: action,
    }))
}