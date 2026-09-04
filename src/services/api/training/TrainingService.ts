// ============================================
// Training Service - API Layer
// ============================================

import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import type {
    TrainingCourse,
    UserCourseProgress,
    Certification,
    AttestationDocument,
    UserAttestation,
    CourseFilters,
    ProgressFilters,
    AttestationFilters,
    CreateTrainingCourseRequest,
    UpdateTrainingCourseRequest,
    EnrollCourseRequest,
    UpdateProgressRequest,
    CreateCertificationRequest,
    UpdateCertificationRequest,
    CreateAttestationDocumentRequest,
    UpdateAttestationDocumentRequest,
    AcknowledgeAttestationRequest,
    CreateUserAttestationRequest,
} from '../../../models/entities/training/training.entity'
import type { PaginatedResponse } from '../../../shared/types/common.types'

/**
 * Training Service
 * Handles all training-related API calls
 */
export class TrainingService extends BaseService {
    // ============================================
    // Course Operations
    // ============================================

    /**
     * Get all courses with pagination and filters
     * GET /training/courses
     */
    async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<TrainingCourse>> {
        const params: Record<string, any> = {
            ...filters,
        }
        const response = await this.getPaginated<TrainingCourse>(
            API_ENDPOINTS.TRAINING.COURSES.BASE,
            params
        )
        return response
    }

    /**
     * Get course by ID
     * GET /training/courses/:id
     */
    async getCourseById(id: string): Promise<TrainingCourse> {
        const response = await this.get<TrainingCourse>(
            API_ENDPOINTS.TRAINING.COURSES.BY_ID(id)
        )
        return this.extractData(response)
    }

    /**
     * Create a new course
     * POST /training/courses
     */
    async createCourse(data: CreateTrainingCourseRequest): Promise<TrainingCourse> {
        const response = await this.post<TrainingCourse>(
            API_ENDPOINTS.TRAINING.COURSES.CREATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update a course
     * PUT /training/courses/:id
     */
    async updateCourse(id: string, data: UpdateTrainingCourseRequest): Promise<TrainingCourse> {
        const response = await this.put<TrainingCourse>(
            API_ENDPOINTS.TRAINING.COURSES.UPDATE(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete a course
     * DELETE /training/courses/:id
     */
    async deleteCourse(id: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.TRAINING.COURSES.DELETE(id)
        )
        return this.extractData(response).success
    }

    // ============================================
    // Progress Operations
    // ============================================

    /**
     * Get user progress with filters
     * GET /training/progress
     */
    async getUserProgress(filters?: ProgressFilters): Promise<PaginatedResponse<UserCourseProgress>> {
        const params: Record<string, any> = {
            ...filters,
        }
        const response = await this.getPaginated<UserCourseProgress>(
            API_ENDPOINTS.TRAINING.PROGRESS.BASE,
            params
        )
        return response
    }

    /**
     * Get user progress for a specific course
     * GET /training/progress/user/:userId/course/:courseId
     */
    async getUserProgressForCourse(userId: string, courseId: string): Promise<UserCourseProgress> {
        const response = await this.get<UserCourseProgress>(
            API_ENDPOINTS.TRAINING.PROGRESS.BY_USER_AND_COURSE(userId, courseId)
        )
        return this.extractData(response)
    }

    /**
     * Enroll in a course
     * POST /training/enroll
     */
    async enrollInCourse(data: EnrollCourseRequest): Promise<UserCourseProgress> {
        const response = await this.post<UserCourseProgress>(
            API_ENDPOINTS.TRAINING.PROGRESS.ENROLL,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update progress
     * PATCH /training/progress/:progressId
     */
    async updateProgress(progressId: string, data: UpdateProgressRequest): Promise<UserCourseProgress> {
        const response = await this.patch<UserCourseProgress>(
            API_ENDPOINTS.TRAINING.PROGRESS.UPDATE(progressId),
            data
        )
        return this.extractData(response)
    }

    // ============================================
    // Certification Operations
    // ============================================

    /**
     * Get user certifications
     * GET /training/certifications/user/:userId
     */
    async getUserCertifications(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<Certification>> {
        const params: Record<string, any> = {}
        if (page) params.page = page
        if (limit) params.limit = limit

        const response = await this.getPaginated<Certification>(
            API_ENDPOINTS.TRAINING.CERTIFICATIONS.BY_USER(userId),
            params
        )
        return response
    }

    /**
     * Create a certification
     * POST /training/certifications
     */
    async createCertification(data: CreateCertificationRequest): Promise<Certification> {
        const response = await this.post<Certification>(
            API_ENDPOINTS.TRAINING.CERTIFICATIONS.CREATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update a certification
     * PATCH /training/certifications/:id
     */
    async updateCertification(id: string, data: UpdateCertificationRequest): Promise<Certification> {
        const response = await this.patch<Certification>(
            API_ENDPOINTS.TRAINING.CERTIFICATIONS.UPDATE(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete a certification
     * DELETE /training/certifications/:id
     */
    async deleteCertification(id: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.TRAINING.CERTIFICATIONS.DELETE(id)
        )
        return this.extractData(response).success
    }

    // ============================================
    // Attestation Operations
    // ============================================

    /**
     * Get attestation documents
     * GET /attestation/documents
     */
    async getAttestationDocuments(filters?: AttestationFilters): Promise<PaginatedResponse<AttestationDocument>> {
        const params: Record<string, any> = {
            ...filters,
        }
        const response = await this.getPaginated<AttestationDocument>(
            API_ENDPOINTS.ATTESTATION.DOCUMENTS.BASE,
            params
        )
        return response
    }

    /**
     * Get attestation document by ID
     * GET /attestation/documents/:id
     */
    async getAttestationDocumentById(id: string): Promise<AttestationDocument> {
        const response = await this.get<AttestationDocument>(
            API_ENDPOINTS.ATTESTATION.DOCUMENTS.BY_ID(id)
        )
        return this.extractData(response)
    }

    /**
     * Create attestation document
     * POST /attestation/documents
     */
    async createAttestationDocument(data: CreateAttestationDocumentRequest): Promise<AttestationDocument> {
        const response = await this.post<AttestationDocument>(
            API_ENDPOINTS.ATTESTATION.DOCUMENTS.CREATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update attestation document
     * PUT /attestation/documents/:id
     */
    async updateAttestationDocument(id: string, data: UpdateAttestationDocumentRequest): Promise<AttestationDocument> {
        const response = await this.put<AttestationDocument>(
            API_ENDPOINTS.ATTESTATION.DOCUMENTS.UPDATE(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete attestation document
     * DELETE /attestation/documents/:id
     */
    async deleteAttestationDocument(id: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.ATTESTATION.DOCUMENTS.DELETE(id)
        )
        return this.extractData(response).success
    }

    /**
     * Get user attestations
     * GET /attestation/user/:userId
     */
    async getUserAttestations(userId: string, filters?: AttestationFilters): Promise<PaginatedResponse<UserAttestation>> {
        const params: Record<string, any> = {
            ...filters,
        }
        const response = await this.getPaginated<UserAttestation>(
            API_ENDPOINTS.ATTESTATION.USER.BASE(userId),
            params
        )
        return response
    }

    /**
     * Get user attestation
     * GET /attestation/user/:userId/attestation/:attestationId
     */
    async getUserAttestation(userId: string, attestationId: string): Promise<UserAttestation> {
        const response = await this.get<UserAttestation>(
            API_ENDPOINTS.ATTESTATION.USER.ATTESTATION(userId, attestationId)
        )
        return this.extractData(response)
    }

    /**
     * Acknowledge attestation
     * POST /attestation/acknowledge
     */
    async acknowledgeAttestation(data: AcknowledgeAttestationRequest): Promise<UserAttestation> {
        const response = await this.post<UserAttestation>(
            API_ENDPOINTS.ATTESTATION.ACKNOWLEDGE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Create user attestation
     * POST /attestation/user-attestations
     */
    async createUserAttestation(data: CreateUserAttestationRequest): Promise<UserAttestation> {
        const response = await this.post<UserAttestation>(
            API_ENDPOINTS.ATTESTATION.USER_ATTESTATIONS.CREATE,
            data
        )
        return this.extractData(response)
    }
}

// Export singleton instance
export const trainingService = new TrainingService()