// ============================================
// Training Module - Entity Types
// Aligned with Backend DTOs (camelCase)
// ============================================

import { BaseEntity } from 'src/core/base/base.entity'
import type { Organisation } from '../organisation/organisation.entity'
import type { User } from '../user/user.entity'

// ============================================
// Enums - Aligned with Backend
// ============================================

export enum CourseLevel {
    BEGINNER = "Beginner",
    INTERMEDIATE = "Intermediate",
    ADVANCED = "Advanced",
    EXPERT = "EXPERT",
}

export enum CourseStatus {
    DRAFT = "Draft",
    PUBLISHED = "Published",
    ARCHIVED = "Archived",
    UNDER_REVIEW = "UNDER_REVIEW",
    SUSPENDED = "SUSPENDED",
}

export enum ProgressStatus {
    NOT_STARTED = "NotStarted",
    IN_PROGRESS = "InProgress",
    COMPLETED = "Completed",
}

export enum AttestationStatus {
    PENDING = "Pending",
    ACKNOWLEDGED = "Acknowledged",
    EXPIRED = "Expired",
    DECLINED = "Declined",
    OVERDUE = "Overdue",
}

// ============================================
// Entity Interfaces
// ============================================

/**
 * Course Prerequisite
 */
export interface CoursePrerequisite {
    courseId: string
    courseName: string
    required: boolean
}

/**
 * Course Learning Objective
 */
export interface CourseLearningObjective {
    id: string
    description: string
    order: number
}

/**
 * Course Module
 */
export interface CourseModule {
    id: string
    title: string
    description?: string
    order: number
    durationMinutes: number
    contentUrl?: string
    quizId?: string
}

/**
 * Training Course Entity
 */
export interface TrainingCourse extends BaseEntity {
    organisationId: string
    name: string
    description?: string
    level: CourseLevel
    status: CourseStatus
    durationHours: number
    durationMinutes: number
    estimatedCompletionDays?: number
    contentUrl?: string
    thumbnailUrl?: string
    videoUrl?: string
    resourceUrl?: string
    category?: string
    tags?: string[]
    prerequisites?: CoursePrerequisite[]
    learningObjectives?: CourseLearningObjective[]
    modules?: CourseModule[]
    isPublished: boolean
    publishedAt?: string | Date
    publishedBy?: string
    isFeatured: boolean
    isMandatory: boolean
    order: number
    certificationId?: string
    passingScore?: number
    isCertificationRequired: boolean
    certificationValidityDays?: number
    enrollmentCount: number
    completionCount: number
    averageRating: number
    ratingCount: number
    lastAccessedAt?: string | Date
    allowSelfEnrollment: boolean
    requireApproval: boolean
    maxAttempts: number
    instructorId?: string

    // Relationships
    organisation?: Organisation
    instructor?: User
    publisher?: User
    userProgress?: UserCourseProgress[]
}

/**
 * User Course Progress Entity
 */
export interface UserCourseProgress extends BaseEntity {
    userId: string
    courseId: string
    progressPercentage: number
    status: ProgressStatus
    startedAt?: string | Date
    completedAt?: string | Date
    lastAccessedAt?: string | Date
    timeSpentMinutes: number
    lastModuleId?: string
    completedModules?: string[]
    quizScores?: Record<string, number>
    certificateIssued: boolean
    certificateIssuedAt?: string | Date
    certificateUrl?: string

    // Relationships
    user?: User
    course?: TrainingCourse
}

/**
 * Certification Entity
 */
export interface Certification extends BaseEntity {
    userId: string
    certificationName: string
    issueDate: string | Date
    expiryDate?: string | Date
    certificateUrl?: string
    issuingBody: string
    credentialId?: string
    certificationCode?: string
    grade?: string
    score?: number
    isVerified: boolean
    verifiedAt?: string | Date
    verifiedBy?: string
    notes?: string

    // Relationships
    user?: User
    verifier?: User

    // Computed
    isExpired: boolean
    isActive: boolean
    daysUntilExpiry: number | null
    displayName: string
}

/**
 * Attestation Document Entity
 */
export interface AttestationDocument extends BaseEntity {
    title: string
    attestationVersion: string
    content: string
    dueDays: number
    requiredForRoles?: string[]
    isActive: boolean
    userAttestations?: UserAttestation[]
}

/**
 * User Attestation Entity
 */
export interface UserAttestation extends BaseEntity {
    userId: string
    attestationId: string
    status: AttestationStatus
    acknowledgedAt?: string | Date
    dueDate: string | Date

    // Relationships
    user?: User
    document?: AttestationDocument
}

// ============================================
// DTOs - Request/Response
// ============================================

/**
 * Create Training Course Request
 */
export interface CreateTrainingCourseRequest {
    name: string
    description?: string
    durationHours?: number
    level?: CourseLevel
    contentUrl?: string
    thumbnailUrl?: string
    status?: CourseStatus
    order?: number
    organisationId?: string
    category?: string
    tags?: string[]
    prerequisites?: CoursePrerequisite[]
    learningObjectives?: CourseLearningObjective[]
    modules?: CourseModule[]
    isPublished?: boolean
    isFeatured?: boolean
    isMandatory?: boolean
    certificationId?: string
    passingScore?: number
    isCertificationRequired?: boolean
    certificationValidityDays?: number
    allowSelfEnrollment?: boolean
    requireApproval?: boolean
    maxAttempts?: number
}

/**
 * Update Training Course Request
 */
export interface UpdateTrainingCourseRequest {
    name?: string
    description?: string
    durationHours?: number
    level?: CourseLevel
    contentUrl?: string
    thumbnailUrl?: string
    status?: CourseStatus
    order?: number
    category?: string
    tags?: string[]
    prerequisites?: CoursePrerequisite[]
    learningObjectives?: CourseLearningObjective[]
    modules?: CourseModule[]
    isPublished?: boolean
    isFeatured?: boolean
    isMandatory?: boolean
    certificationId?: string
    passingScore?: number
    isCertificationRequired?: boolean
    certificationValidityDays?: number
    allowSelfEnrollment?: boolean
    requireApproval?: boolean
    maxAttempts?: number
}

/**
 * Course Filters
 */
export interface CourseFilters {
    level?: CourseLevel
    status?: CourseStatus
    isPublished?: boolean
    organisationId?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Enroll Course Request
 */
export interface EnrollCourseRequest {
    userId: string
    courseId: string
}

/**
 * Update Progress Request
 */
export interface UpdateProgressRequest {
    progressPercentage: number
    status?: ProgressStatus
}

/**
 * Progress Filters
 */
export interface ProgressFilters {
    userId?: string
    courseId?: string
    status?: ProgressStatus
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

/**
 * Create Certification Request
 */
export interface CreateCertificationRequest {
    userId: string
    certificationName: string
    issueDate: string | Date
    expiryDate?: string | Date
    certificateUrl?: string
    issuingBody: string
    credentialId?: string
    certificationCode?: string
    grade?: string
    score?: number
    isVerified?: boolean
    notes?: string
}

/**
 * Update Certification Request
 */
export interface UpdateCertificationRequest {
    certificationName?: string
    expiryDate?: string | Date
    certificateUrl?: string
    credentialId?: string
    certificationCode?: string
    grade?: string
    score?: number
    isVerified?: boolean
    notes?: string
}

/**
 * Create Attestation Document Request
 */
export interface CreateAttestationDocumentRequest {
    title: string
    attestationVersion: string
    content: string
    dueDays?: number
    requiredForRoles?: string[]
    isActive?: boolean
}

/**
 * Update Attestation Document Request
 */
export interface UpdateAttestationDocumentRequest {
    title?: string
    attestationVersion?: string
    content?: string
    dueDays?: number
    requiredForRoles?: string[]
    isActive?: boolean
}

/**
 * Acknowledge Attestation Request
 */
export interface AcknowledgeAttestationRequest {
    userId: string
    attestationId: string
    acknowledgedAt?: string | Date
}

/**
 * Create User Attestation Request
 */
export interface CreateUserAttestationRequest {
    userId: string
    attestationId: string
    dueDate: string | Date
    status?: AttestationStatus
}

/**
 * Attestation Filters
 */
export interface AttestationFilters {
    status?: AttestationStatus
    userId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

// ============================================
// Statistics Types
// ============================================

/**
 * Course Statistics
 */
export interface CourseStatistics {
    total: number
    published: number
    draft: number
    byLevel: Record<string, number>
    totalEnrollments: number
    totalCompletions: number
    averageRating: number
}

/**
 * User Progress Statistics
 */
export interface UserProgressStats {
    total: number
    inProgress: number
    completed: number
    notStarted: number
    averageProgress: number
}

/**
 * Certification Statistics
 */
export interface CertificationStats {
    total: number
    active: number
    expired: number
    pendingVerification: number
}

/**
 * Attestation Statistics
 */
export interface AttestationStats {
    total: number
    pending: number
    acknowledged: number
    expired: number
    overdue: number
}

// ============================================
// Display Constants & Helpers
// ============================================

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: 'Beginner',
    [CourseLevel.INTERMEDIATE]: 'Intermediate',
    [CourseLevel.ADVANCED]: 'Advanced',
    [CourseLevel.EXPERT]: 'Expert',
}

export const COURSE_LEVEL_COLORS: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: 'green',
    [CourseLevel.INTERMEDIATE]: 'orange',
    [CourseLevel.ADVANCED]: 'purple',
    [CourseLevel.EXPERT]: 'red',
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
    [CourseStatus.DRAFT]: 'Draft',
    [CourseStatus.PUBLISHED]: 'Published',
    [CourseStatus.ARCHIVED]: 'Archived',
    [CourseStatus.UNDER_REVIEW]: 'Under Review',
    [CourseStatus.SUSPENDED]: 'Suspended',
}

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
    [CourseStatus.DRAFT]: 'grey',
    [CourseStatus.PUBLISHED]: 'positive',
    [CourseStatus.ARCHIVED]: 'grey-7',
    [CourseStatus.UNDER_REVIEW]: 'warning',
    [CourseStatus.SUSPENDED]: 'orange',
}

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
    [ProgressStatus.NOT_STARTED]: 'Not Started',
    [ProgressStatus.IN_PROGRESS]: 'In Progress',
    [ProgressStatus.COMPLETED]: 'Completed',
}

export const PROGRESS_STATUS_COLORS: Record<ProgressStatus, string> = {
    [ProgressStatus.NOT_STARTED]: 'grey',
    [ProgressStatus.IN_PROGRESS]: 'warning',
    [ProgressStatus.COMPLETED]: 'positive',
}

export const ATTESTATION_STATUS_LABELS: Record<AttestationStatus, string> = {
    [AttestationStatus.PENDING]: 'Pending',
    [AttestationStatus.ACKNOWLEDGED]: 'Acknowledged',
    [AttestationStatus.EXPIRED]: 'Expired',
    [AttestationStatus.OVERDUE]: 'Overdue',
    [AttestationStatus.DECLINED]: 'Declined'
}

export const ATTESTATION_STATUS_COLORS: Record<AttestationStatus, string> = {
    [AttestationStatus.PENDING]: 'warning',
    [AttestationStatus.ACKNOWLEDGED]: 'positive',
    [AttestationStatus.EXPIRED]: 'red',
    [AttestationStatus.OVERDUE]: 'negative',
    [AttestationStatus.DECLINED]: 'orange'
}

/**
 * Get course level label
 */
export function getCourseLevelLabel(level: CourseLevel): string {
    return COURSE_LEVEL_LABELS[level] || level
}

/**
 * Get course level color
 */
export function getCourseLevelColor(level: CourseLevel): string {
    return COURSE_LEVEL_COLORS[level] || 'grey'
}

/**
 * Get course status label
 */
export function getCourseStatusLabel(status: CourseStatus): string {
    return COURSE_STATUS_LABELS[status] || status
}

/**
 * Get course status color
 */
export function getCourseStatusColor(status: CourseStatus): string {
    return COURSE_STATUS_COLORS[status] || 'grey'
}

/**
 * Get progress status label
 */
export function getProgressStatusLabel(status: ProgressStatus): string {
    return PROGRESS_STATUS_LABELS[status] || status
}

/**
 * Get progress status color
 */
export function getProgressStatusColor(status: ProgressStatus): string {
    return PROGRESS_STATUS_COLORS[status] || 'grey'
}

/**
 * Get attestation status label
 */
export function getAttestationStatusLabel(status: AttestationStatus): string {
    return ATTESTATION_STATUS_LABELS[status] || status
}

/**
 * Get attestation status color
 */
export function getAttestationStatusColor(status: AttestationStatus): string {
    return ATTESTATION_STATUS_COLORS[status] || 'grey'
}