import type { BaseEntity } from './../../../core/base/base.entity';
import type { Organisation } from './../organisation/organisation.entity'

// ============================================
// Feature Toggle Module - Enums (Aligned with Backend)
// ============================================

export enum FeatureToggleType {
  RELEASE = 'Release',
  EXPERIMENT = 'Experiment',
  OPERATIONAL = 'Operational',
  PERMISSION = 'Permission',
  KILL_SWITCH = 'KillSwitch',
}

export enum FeatureToggleStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ARCHIVED = 'Archived',
  SCHEDULED = 'Scheduled',
}

export enum ToggleEnvironment {
  DEVELOPMENT = 'Development',
  STAGING = 'Staging',
  INTEGRATION = "Integration",
  PRODUCTION = 'Production',
  TESTING = 'Testing',
}

export enum TargetingType {
  USER_ID = 'UserId',
  ORGANISATION_ID = 'OrganisationId',
  ROLE = 'Role',
  PERCENTAGE = 'Percentage',
  CUSTOM = 'Custom',
  ALL_USERS = 'AllUsers',
  CUSTOM_RULE = 'CustomRule',
}

// ============================================
// Feature Toggle Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

export interface TargetingCondition {
    operator: 'IN' | 'NOT_IN' | 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS'
    values: any[]
    customRule?: string
}

export interface TargetingRule {
    id: string
    type: TargetingType
    condition: TargetingCondition
    value: boolean
    order: number
}

/**
 * Feature Toggle - Matches backend FeatureToggle entity
 */
export interface FeatureToggle extends BaseEntity {
    organisationId: string
    name: string
    description?: string
    toggleType: FeatureToggleType
    status: FeatureToggleStatus
    environment: ToggleEnvironment
    defaultValue: boolean
    targetingRules?: TargetingRule[]
    metadata?: Record<string, any>
    activatedAt?: string | Date
    deactivatedAt?: string | Date
    scheduledFor?: string | Date
    evaluationCount: number
    trueEvaluationCount: number
    organisation?: Organisation
}

/**
 * Feature Toggle Override - Matches backend FeatureToggleOverride entity
 */
export interface FeatureToggleOverride extends BaseEntity {
    organisationId: string
    featureToggleId: string
    overriddenBy?: string
    value: boolean
    expiresAt?: string | Date
    reason?: string
    featureToggle?: FeatureToggle
    overriddenByUser?: { uuid: string; email: string }
    organisation?: Organisation
}

/**
 * Feature Toggle Audit Log - Matches backend FeatureToggleAuditLog entity
 */
export interface FeatureToggleAuditLog extends BaseEntity {
    featureToggleId: string
    auditedBy: string
    action: string
    oldValue?: any
    newValue?: any
    reason?: string
    ipAddress?: string
    featureToggle?: FeatureToggle
    auditedByUser?: { uuid: string; email: string }
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

export interface CreateFeatureToggleRequest {
    name: string
    description?: string
    toggleType: FeatureToggleType
    environment: ToggleEnvironment
    organisationId: string
    defaultValue?: boolean
    targetingRules?: TargetingRule[]
    metadata?: Record<string, any>
    scheduledFor?: string | Date
}

export interface UpdateFeatureToggleRequest {
    description?: string
    status?: FeatureToggleStatus
    defaultValue?: boolean
    targetingRules?: TargetingRule[]
    metadata?: Record<string, any>
    scheduledFor?: string | Date
}

export interface CreateFeatureToggleOverrideRequest {
    featureToggleId: string
    userId?: string
    organisationId: string
    value: boolean
    expiresAt?: string | Date
    reason?: string
}

export interface UpdateFeatureToggleOverrideRequest {
    value?: boolean
    expiresAt?: string | Date
    reason?: string
    overriddenBy?: string
}

export interface EvaluateFeatureRequest {
    featureName: string
    userId?: string
    organisationId: string
    userRole?: string
    context?: Record<string, any>
}

export interface FeatureEvaluationResponse {
    featureName: string
    enabled: boolean
    reason: string
    matchedRule?: string
    evaluationTimeMs: number
}

export interface BatchFeatureEvaluationRequest {
    features: EvaluateFeatureRequest[]
}

export interface BatchFeatureEvaluationResponse {
    results: Record<string, FeatureEvaluationResponse>
}

export interface FeatureToggleQueryParams {
    organisationId?: string
    environment?: ToggleEnvironment
    status?: FeatureToggleStatus
    toggleType?: FeatureToggleType
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface FeatureToggleStats {
    total: number
    byStatus: Record<FeatureToggleStatus, number>
    byEnvironment: Record<ToggleEnvironment, number>
    byType: Record<string, number>
    evaluationStats: {
        totalEvaluations: number
        trueEvaluations: number
        averageTrueRate: number
    }
}

export interface FeatureToggleAuditQueryParams {
    featureToggleId?: string
    userId?: string
    action?: string
    startDate?: string | Date
    endDate?: string | Date
    page?: number
    limit?: number
}

// ============================================
// Feature Toggle Rollout Types
// ============================================

export interface FeatureToggleSchedule {
    featureToggleId: string
    action: 'ACTIVATE' | 'DEACTIVATE'
    scheduledAt: string | Date
    status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED'
    executedAt?: string | Date
    errorMessage?: string
    createdBy: string
}

export interface FeatureToggleRollout {
    featureToggleId: string
    rolloutPercentage: number
    currentPercentage: number
    targetPercentage: number
    increments: RolloutIncrement[]
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ROLLED_BACK'
    startedAt: string | Date
    completedAt?: string | Date
}

export interface RolloutIncrement {
    percentage: number
    scheduledAt: string | Date
    executedAt?: string | Date
    status: 'PENDING' | 'EXECUTED' | 'FAILED'
}

// ============================================
// Helper Functions
// ============================================

export function getFeatureToggleStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        DRAFT: 'Draft',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        ARCHIVED: 'Archived',
        SCHEDULED: 'Scheduled',
    }
    return labels[status] || status
}

export function getFeatureToggleStatusColor(status: string): string {
    const colors: Record<string, string> = {
        DRAFT: 'grey',
        ACTIVE: 'positive',
        INACTIVE: 'warning',
        ARCHIVED: 'grey',
        SCHEDULED: 'info',
    }
    return colors[status] || 'grey'
}

export function getFeatureToggleStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        DRAFT: 'edit',
        ACTIVE: 'check_circle',
        INACTIVE: 'pause_circle',
        ARCHIVED: 'archive',
        SCHEDULED: 'event',
    }
    return icons[status] || 'help'
}

export function getToggleEnvironmentLabel(environment: string): string {
    const labels: Record<string, string> = {
        DEVELOPMENT: 'Development',
        STAGING: 'Staging',
        PRODUCTION: 'Production',
        TESTING: 'Testing',
        INTEGRATION: 'Integration',
    }
    return labels[environment] || environment
}

export function getToggleEnvironmentColor(environment: string): string {
    const colors: Record<string, string> = {
        DEVELOPMENT: 'blue',
        STAGING: 'orange',
        PRODUCTION: 'positive',
        TESTING: 'purple',
        INTEGRATION: 'teal',
    }
    return colors[environment] || 'grey'
}

export function getFeatureToggleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        RELEASE: 'Release Toggle',
        EXPERIMENT: 'Experiment',
        OPERATIONAL: 'Operational',
        PERMISSION: 'Permission',
        KILL_SWITCH: 'Kill Switch',
    }
    return labels[type] || type
}

export function getTargetingTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        USER_ID: 'User ID',
        ORGANISATION_ID: 'Organisation',
        ROLE: 'Role',
        PERCENTAGE: 'Percentage',
        CUSTOM: 'Custom',
        ALL_USERS: 'All Users',
        CUSTOM_RULE: 'Custom Rule',
    }
    return labels[type] || type
}