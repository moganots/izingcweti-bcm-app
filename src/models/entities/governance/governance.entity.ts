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
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    SUSPENDED = 'SUSPENDED',
    UNDER_REVISION = 'UNDER_REVISION',
    REVIEW_REQUIRED = 'REVIEW_REQUIRED',
    SUPERSEDED = 'SUPERSEDED',
    EXPIRED = 'EXPIRED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
    OBSOLETE = 'OBSOLETE',
    INACTIVE = 'INACTIVE',
}

/**
 * Policy Category Enum
 */
export enum PolicyCategory {
    BCM = 'BCM',
    RISK_MANAGEMENT = 'RISK_MANAGEMENT',
    COMPLIANCE = 'COMPLIANCE',
    IT_SECURITY = 'IT_SECURITY',
    HR = 'HR',
    OPERATIONS = 'OPERATIONS',
    FINANCE = 'FINANCE',
    DATA_PRIVACY = 'DATA_PRIVACY',
    INCIDENT_MANAGEMENT = 'INCIDENT_MANAGEMENT',
    CRISIS_COMMUNICATION = 'CRISIS_COMMUNICATION',
    BUSINESS_CONTINUITY = 'BUSINESS_CONTINUITY',
    DISASTER_RECOVERY = 'DISASTER_RECOVERY',
    QUALITY = 'QUALITY',
    ENVIRONMENTAL = 'ENVIRONMENTAL',
    HEALTH_SAFETY = 'HEALTH_SAFETY',
    SUPPLY_CHAIN = 'SUPPLY_CHAIN',
    LEGAL = 'LEGAL',
    OTHER = 'OTHER',
}

/**
 * Activity Action Enum
 */
export enum ActivityAction {
    POLICY_CREATED = 'POLICY_CREATED',
    POLICY_UPDATED = 'POLICY_UPDATED',
    POLICY_ACTIVATED = 'POLICY_ACTIVATED',
    POLICY_DEACTIVATED = 'POLICY_DEACTIVATED',
    POLICY_ARCHIVED = 'POLICY_ARCHIVED',
    POLICY_REVIEWED = 'POLICY_REVIEWED',
    POLICY_APPROVED = 'POLICY_APPROVED',
    POLICY_REJECTED = 'POLICY_REJECTED',
    ASSESSMENT_CREATED = 'ASSESSMENT_CREATED',
    ASSESSMENT_UPDATED = 'ASSESSMENT_UPDATED',
    ASSESSMENT_DELETED = 'ASSESSMENT_DELETED',
    MATURITY_LEVEL_CHANGED = 'MATURITY_LEVEL_CHANGED',
    COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
    AUDIT_COMPLETED = 'AUDIT_COMPLETED',
    REVIEW_COMPLETED = 'REVIEW_COMPLETED',
    USER_LOGGED_IN = 'USER_LOGGED_IN',
    USER_LOGGED_OUT = 'USER_LOGGED_OUT',
    USER_CREATED = 'USER_CREATED',
    USER_UPDATED = 'USER_UPDATED',
    USER_DELETED = 'USER_DELETED',
    PERMISSION_CHANGED = 'PERMISSION_CHANGED',
    SETTINGS_CHANGED = 'SETTINGS_CHANGED',
    SYSTEM_CONFIGURED = 'SYSTEM_CONFIGURED',
    EXPORT_COMPLETED = 'EXPORT_COMPLETED',
    REPORT_GENERATED = 'REPORT_GENERATED',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED',
    WORKFLOW_TRIGGERED = 'WORKFLOW_TRIGGERED',
    NOTIFICATION_SENT = 'NOTIFICATION_SENT',
    SYNC_COMPLETED = 'SYNC_COMPLETED',
    BACKUP_CREATED = 'BACKUP_CREATED',
    RESTORE_COMPLETED = 'RESTORE_COMPLETED',
}

/**
 * Maturity Level Enum
 */
export enum MaturityLevel {
    INITIAL = 'INITIAL',
    MANAGED = 'MANAGED',
    DEFINED = 'DEFINED',
    QUANTITATIVELY_MANAGED = 'QUANTITATIVELY_MANAGED',
    OPTIMISED = 'OPTIMISED',
    DEVELOPING = 'DEVELOPING',
    REPEATABLE = 'REPEATABLE',
    ESTABLISHED = 'ESTABLISHED',
    ADVANCED = 'ADVANCED',
    OPTIMISING = 'OPTIMISING',
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

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
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

export const POLICY_STATUS_COLORS: Record<PolicyStatus, string> = {
    [PolicyStatus.DRAFT]: 'grey',
    [PolicyStatus.ACTIVE]: 'positive',
    [PolicyStatus.ARCHIVED]: 'grey-7',
    [PolicyStatus.UNDER_REVIEW]: 'warning',
    [PolicyStatus.APPROVED]: 'green',
    [PolicyStatus.SUSPENDED]: 'orange',
    [PolicyStatus.UNDER_REVISION]: 'blue',
    [PolicyStatus.REVIEW_REQUIRED]: 'orange',
    [PolicyStatus.SUPERSEDED]: 'grey-6',
    [PolicyStatus.EXPIRED]: 'red',
    [PolicyStatus.REJECTED]: 'negative',
    [PolicyStatus.WITHDRAWN]: 'grey',
    [PolicyStatus.OBSOLETE]: 'grey-8',
    [PolicyStatus.INACTIVE]: 'grey-5',
}

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
    [PolicyCategory.BCM]: 'BCM',
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

export const MATURITY_LEVEL_LABELS: Record<MaturityLevel, string> = {
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

export const MATURITY_LEVEL_COLORS: Record<MaturityLevel, string> = {
    [MaturityLevel.INITIAL]: 'grey',
    [MaturityLevel.MANAGED]: 'blue',
    [MaturityLevel.DEFINED]: 'info',
    [MaturityLevel.QUANTITATIVELY_MANAGED]: 'positive',
    [MaturityLevel.OPTIMISED]: 'green',
    [MaturityLevel.DEVELOPING]: 'purple',
    [MaturityLevel.REPEATABLE]: 'orange',
    [MaturityLevel.ESTABLISHED]: 'teal',
    [MaturityLevel.ADVANCED]: 'deep-purple',
    [MaturityLevel.OPTIMISING]: 'deep-green',
}

/**
 * Get policy status label
 */
export function getPolicyStatusLabel(status: PolicyStatus): string {
    return POLICY_STATUS_LABELS[status] || status
}

/**
 * Get policy status color
 */
export function getPolicyStatusColor(status: PolicyStatus): string {
    return POLICY_STATUS_COLORS[status] || 'grey'
}

/**
 * Get policy category label
 */
export function getPolicyCategoryLabel(category: PolicyCategory): string {
    return POLICY_CATEGORY_LABELS[category] || category
}

/**
 * Get maturity level label
 */
export function getMaturityLevelLabel(level: MaturityLevel): string {
    return MATURITY_LEVEL_LABELS[level] || level
}

/**
 * Get maturity level color
 */
export function getMaturityLevelColor(level: MaturityLevel): string {
    return MATURITY_LEVEL_COLORS[level] || 'grey'
}

/**
 * Get maturity level score range
 */
export function getMaturityLevelRange(level: MaturityLevel): { min: number; max: number } {
    const ranges: Record<MaturityLevel, { min: number; max: number }> = {
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
    return ranges[level] || { min: 0, max: 100 }
}