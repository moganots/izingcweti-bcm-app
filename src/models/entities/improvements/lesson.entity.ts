// ============================================
// Improvements Module - Lesson Entity Types
// Aligned with Backend DTOs (camelCase)
// ============================================

import { BaseEntity } from 'src/core/base/base.entity'
import type { Organisation, BusinessUnit, Department } from '../organisation/organisation.entity'
import type { User } from '../user/user.entity'

// ============================================
// Enums - Aligned with Backend
// ============================================

export enum LessonStatus {
    DRAFT = "Draft",
    UNDER_REVIEW = "Under Review",
    ACTION_PLANNED = "Action Planned",
    IMPLEMENTED = "Implemented",
    CLOSED = "Closed",
    REJECTED = "Rejected",
}

export enum LessonSource {
    INCIDENT = "Incident",
    EXERCISE = "Exercise",
    AUDIT = "Audit",
    EXTERNAL_BENCHMARK = "External Benchmark",
    AFTER_ACTION_REVIEW = "After Action Review",
    STAKEHOLDER_FEEDBACK = "Stakeholder Feedback",
    OTHER = "Other",
}

export enum LessonPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    CRITICAL = "Critical",
}

export enum LessonCategory {
    PROCESS = "Process",
    TECHNOLOGY = "Technology",
    PEOPLE = "People",
    COMMUNICATION = "Communication",
    LEADERSHIP = "Leadership",
    TRAINING = "Training",
    CULTURE = "Culture",
    RESOURCES = "Resources",
    COMPLIANCE = "Compliance",
    OTHER = "Other",
}


// ============================================
// Entity Interface
// ============================================

/**
 * Lesson Entity
 */
export interface Lesson extends BaseEntity {
    organisationId: string
    businessUnitId?: string
    departmentId?: string
    title: string
    description?: string
    whatHappened: string
    lesson: string
    recommendedActions: string
    status: LessonStatus
    source: LessonSource
    priority: LessonPriority
    category: LessonCategory
    sourceId?: string
    sourceType?: string
    identifiedBy: string
    identifiedAt: string | Date
    implementedAt?: string | Date
    closedAt?: string | Date
    effectivenessRating?: number
    tags: string[]
    relatedActions: string[]
    attachments: string[]
    reviewNotes?: string
    reviewedBy?: string
    reviewedAt?: string | Date
    metadata?: Record<string, any>

    // Relationships (populated by API)
    organisation?: Organisation
    businessUnit?: BusinessUnit
    department?: Department
    identifiedByUser?: User
    reviewedByUser?: User
    createdByUser?: User
    updatedByUser?: User
}

// ============================================
// DTOs - Request/Response
// ============================================

/**
 * Create Lesson Request
 */
export interface CreateLessonRequest {
    title: string
    description?: string
    whatHappened: string
    lesson: string
    recommendedActions: string
    source: LessonSource
    priority: LessonPriority
    category: LessonCategory
    sourceId?: string
    sourceType?: string
    tags?: string[]
    attachments?: string[]
    metadata?: Record<string, any>
    status?: LessonStatus
    organisationId?: string
    departmentId?: string
}

/**
 * Update Lesson Request
 */
export interface UpdateLessonRequest {
    title?: string
    description?: string
    whatHappened?: string
    lesson?: string
    recommendedActions?: string
    status?: LessonStatus
    priority?: LessonPriority
    category?: LessonCategory
    tags?: string[]
    attachments?: string[]
    metadata?: Record<string, any>
    reviewNotes?: string
    effectivenessRating?: number
    sourceId?: string
    source?: LessonSource
    implementedAt?: string | Date
    closedAt?: string | Date
}

/**
 * Lesson Filters
 */
export interface LessonFilters {
    page?: number
    limit?: number
    status?: LessonStatus[]
    source?: LessonSource[]
    priority?: LessonPriority[]
    category?: LessonCategory[]
    dateFrom?: string | Date
    dateTo?: string | Date
    search?: string
    identifiedBy?: string
    implemented?: boolean
    hasActions?: boolean
    effectivenessRating?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Bulk Lesson Action
 */
export interface BulkLessonAction {
    lessonIds: string[]
    status?: LessonStatus
    tags?: string[]
    reviewNotes?: string
}

/**
 * Lesson Statistics
 */
export interface LessonStats {
    total: number
    byStatus: Record<LessonStatus, number>
    bySource: Record<LessonSource, number>
    byPriority: Record<LessonPriority, number>
    byCategory: Record<LessonCategory, number>
    implemented: number
    pending: number
    rejected: number
    averageEffectiveness?: number
}

/**
 * Lesson Analytics
 */
export interface LessonAnalytics {
    total: number
    byStatus: Record<LessonStatus, number>
    bySource: Record<LessonSource, number>
    byPriority: Record<LessonPriority, number>
    byCategory: Record<LessonCategory, number>
    implemented: number
    pending: number
    rejected: number
    averageEffectiveness?: number
    withActions: number
    reviewed: number
    overdueReview: number
}

// ============================================
// Display Constants & Helpers
// ============================================

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
    [LessonStatus.DRAFT]: 'Draft',
    [LessonStatus.UNDER_REVIEW]: 'Under Review',
    [LessonStatus.ACTION_PLANNED]: 'Action Planned',
    [LessonStatus.IMPLEMENTED]: 'Implemented',
    [LessonStatus.CLOSED]: 'Closed',
    [LessonStatus.REJECTED]: 'Rejected',
}

export const LESSON_STATUS_COLORS: Record<LessonStatus, string> = {
    [LessonStatus.DRAFT]: 'grey',
    [LessonStatus.UNDER_REVIEW]: 'warning',
    [LessonStatus.ACTION_PLANNED]: 'info',
    [LessonStatus.IMPLEMENTED]: 'positive',
    [LessonStatus.CLOSED]: 'grey-7',
    [LessonStatus.REJECTED]: 'negative',
}

export const LESSON_STATUS_ICONS: Record<LessonStatus, string> = {
    [LessonStatus.DRAFT]: 'edit',
    [LessonStatus.UNDER_REVIEW]: 'visibility',
    [LessonStatus.ACTION_PLANNED]: 'playlist_add_check',
    [LessonStatus.IMPLEMENTED]: 'check_circle',
    [LessonStatus.CLOSED]: 'done_all',
    [LessonStatus.REJECTED]: 'cancel',
}

export const LESSON_SOURCE_LABELS: Record<LessonSource, string> = {
    [LessonSource.INCIDENT]: 'Incident',
    [LessonSource.EXERCISE]: 'Exercise',
    [LessonSource.AUDIT]: 'Audit',
    [LessonSource.EXTERNAL_BENCHMARK]: 'External Benchmark',
    [LessonSource.AFTER_ACTION_REVIEW]: 'After Action Review',
    [LessonSource.STAKEHOLDER_FEEDBACK]: 'Stakeholder Feedback',
    [LessonSource.OTHER]: 'Other',
}

export const LESSON_SOURCE_COLORS: Record<LessonSource, string> = {
    [LessonSource.INCIDENT]: 'negative',
    [LessonSource.EXERCISE]: 'purple',
    [LessonSource.AUDIT]: 'orange',
    [LessonSource.EXTERNAL_BENCHMARK]: 'blue',
    [LessonSource.AFTER_ACTION_REVIEW]: 'teal',
    [LessonSource.STAKEHOLDER_FEEDBACK]: 'green',
    [LessonSource.OTHER]: 'grey',
}

export const LESSON_PRIORITY_LABELS: Record<LessonPriority, string> = {
    [LessonPriority.LOW]: 'Low',
    [LessonPriority.MEDIUM]: 'Medium',
    [LessonPriority.HIGH]: 'High',
    [LessonPriority.CRITICAL]: 'Critical',
}

export const LESSON_PRIORITY_COLORS: Record<LessonPriority, string> = {
    [LessonPriority.LOW]: 'grey',
    [LessonPriority.MEDIUM]: 'info',
    [LessonPriority.HIGH]: 'orange',
    [LessonPriority.CRITICAL]: 'negative',
}

export const LESSON_PRIORITY_ICONS: Record<LessonPriority, string> = {
    [LessonPriority.LOW]: 'arrow_downward',
    [LessonPriority.MEDIUM]: 'remove',
    [LessonPriority.HIGH]: 'arrow_upward',
    [LessonPriority.CRITICAL]: 'warning',
}

export const LESSON_CATEGORY_LABELS: Record<LessonCategory, string> = {
    [LessonCategory.PROCESS]: 'Process',
    [LessonCategory.TECHNOLOGY]: 'Technology',
    [LessonCategory.PEOPLE]: 'People',
    [LessonCategory.COMMUNICATION]: 'Communication',
    [LessonCategory.LEADERSHIP]: 'Leadership',
    [LessonCategory.TRAINING]: 'Training',
    [LessonCategory.CULTURE]: 'Culture',
    [LessonCategory.RESOURCES]: 'Resources',
    [LessonCategory.COMPLIANCE]: 'Compliance',
    [LessonCategory.OTHER]: 'Other',
}

export const LESSON_CATEGORY_COLORS: Record<LessonCategory, string> = {
    [LessonCategory.PROCESS]: 'blue',
    [LessonCategory.TECHNOLOGY]: 'deep-purple',
    [LessonCategory.PEOPLE]: 'green',
    [LessonCategory.COMMUNICATION]: 'teal',
    [LessonCategory.LEADERSHIP]: 'indigo',
    [LessonCategory.TRAINING]: 'orange',
    [LessonCategory.CULTURE]: 'pink',
    [LessonCategory.RESOURCES]: 'brown',
    [LessonCategory.COMPLIANCE]: 'red',
    [LessonCategory.OTHER]: 'grey',
}

/**
 * Get lesson status label
 */
export function getLessonStatusLabel(status: LessonStatus): string {
    return LESSON_STATUS_LABELS[status] || status
}

/**
 * Get lesson status color
 */
export function getLessonStatusColor(status: LessonStatus): string {
    return LESSON_STATUS_COLORS[status] || 'grey'
}

/**
 * Get lesson status icon
 */
export function getLessonStatusIcon(status: LessonStatus): string {
    return LESSON_STATUS_ICONS[status] || 'help'
}

/**
 * Get lesson source label
 */
export function getLessonSourceLabel(source: LessonSource): string {
    return LESSON_SOURCE_LABELS[source] || source
}

/**
 * Get lesson source color
 */
export function getLessonSourceColor(source: LessonSource): string {
    return LESSON_SOURCE_COLORS[source] || 'grey'
}

/**
 * Get lesson priority label
 */
export function getLessonPriorityLabel(priority: LessonPriority): string {
    return LESSON_PRIORITY_LABELS[priority] || priority
}

/**
 * Get lesson priority color
 */
export function getLessonPriorityColor(priority: LessonPriority): string {
    return LESSON_PRIORITY_COLORS[priority] || 'grey'
}

/**
 * Get lesson priority icon
 */
export function getLessonPriorityIcon(priority: LessonPriority): string {
    return LESSON_PRIORITY_ICONS[priority] || 'help'
}

/**
 * Get lesson category label
 */
export function getLessonCategoryLabel(category: LessonCategory): string {
    return LESSON_CATEGORY_LABELS[category] || category
}

/**
 * Get lesson category color
 */
export function getLessonCategoryColor(category: LessonCategory): string {
    return LESSON_CATEGORY_COLORS[category] || 'grey'
}

/**
 * Check if lesson is actionable
 */
export function isLessonActionable(lesson: Lesson): boolean {
    return lesson.status === LessonStatus.DRAFT ||
        lesson.status === LessonStatus.UNDER_REVIEW ||
        lesson.status === LessonStatus.ACTION_PLANNED
}

/**
 * Check if lesson is completed
 */
export function isLessonCompleted(lesson: Lesson): boolean {
    return lesson.status === LessonStatus.IMPLEMENTED ||
        lesson.status === LessonStatus.CLOSED
}

/**
 * Get status badge props
 */
export function getLessonStatusBadge(status: LessonStatus): { label: string; color: string; icon: string } {
    return {
        label: getLessonStatusLabel(status),
        color: getLessonStatusColor(status),
        icon: getLessonStatusIcon(status),
    }
}

/**
 * Get priority badge props
 */
export function getLessonPriorityBadge(priority: LessonPriority): { label: string; color: string; icon: string } {
    return {
        label: getLessonPriorityLabel(priority),
        color: getLessonPriorityColor(priority),
        icon: getLessonPriorityIcon(priority),
    }
}