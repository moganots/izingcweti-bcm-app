// ============================================
// Lesson Service - API Layer
// ============================================

import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import type {
    Lesson,
    LessonStats,
    LessonFilters,
    CreateLessonRequest,
    UpdateLessonRequest,
    BulkLessonAction,
} from '../../../models/entities/improvements/lesson.entity'
import type { PaginatedResponse } from '../../../shared/types/common.types'

/**
 * Lesson Service
 * Handles all lesson-related API calls
 */
export class LessonService extends BaseService {
    // ============================================
    // CRUD Operations
    // ============================================

    /**
     * Get all lessons with pagination and filters
     * GET /improvements/lessons
     */
    async getLessons(
        filters?: LessonFilters,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<Lesson>> {
        const params: Record<string, any> = {
            page,
            limit,
            ...filters,
        }

        // Handle array filters
        if (filters?.status) {
            params.status = filters.status.join(',')
        }
        if (filters?.source) {
            params.source = filters.source.join(',')
        }
        if (filters?.priority) {
            params.priority = filters.priority.join(',')
        }
        if (filters?.category) {
            params.category = filters.category.join(',')
        }

        const response = await this.getPaginated<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BASE,
            params
        )
        return response
    }

    /**
     * Get lesson by ID
     * GET /improvements/lessons/:uuid
     */
    async getLessonById(uuid: string): Promise<Lesson> {
        const response = await this.get<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BY_ID(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Get lesson details with user enrichment
     * GET /improvements/lessons/:uuid/detail
     */
    async getLessonDetail(uuid: string): Promise<Lesson> {
        const response = await this.get<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.DETAIL(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Create a new lesson
     * POST /improvements/lessons
     */
    async createLesson(data: CreateLessonRequest): Promise<Lesson> {
        const response = await this.post<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BASE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update a lesson
     * PUT /improvements/lessons/:uuid
     */
    async updateLesson(uuid: string, data: UpdateLessonRequest): Promise<Lesson> {
        const response = await this.put<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.UPDATE(uuid),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete a lesson
     * DELETE /improvements/lessons/:uuid
     */
    async deleteLesson(uuid: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.DELETE(uuid)
        )
        return this.extractData(response).success
    }

    // ============================================
    // Bulk Operations
    // ============================================

    /**
     * Bulk update lessons
     * POST /improvements/lessons/bulk
     */
    async bulkUpdateLessons(data: BulkLessonAction): Promise<{
        success: number
        failed: number
        errors: string[]
    }> {
        const response = await this.post<{
            success: number
            failed: number
            errors: string[]
        }>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BULK,
            data
        )
        return this.extractData(response)
    }

    // ============================================
    // Query Operations
    // ============================================

    /**
     * Get lessons by source
     * GET /improvements/lessons/source/:source
     */
    async getLessonsBySource(source: string, sourceId?: string): Promise<Lesson[]> {
        const params = sourceId ? { source_id: sourceId } : undefined
        const response = await this.get<Lesson[]>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BY_SOURCE(source),
            params
        )
        return this.extractData(response)
    }

    /**
     * Get lessons with related actions
     * GET /improvements/lessons/with-actions
     */
    async getLessonsWithActions(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Lesson>> {
        const response = await this.getPaginated<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.WITH_ACTIONS,
            { page, limit }
        )
        return response
    }

    /**
     * Get lessons identified by user
     * GET /improvements/lessons/identified-by/:userId
     */
    async getLessonsByIdentifiedBy(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Lesson>> {
        const response = await this.getPaginated<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.BY_IDENTIFIED_BY(userId),
            { page, limit }
        )
        return response
    }

    // ============================================
    // Statistics
    // ============================================

    /**
     * Get lesson statistics
     * GET /improvements/lessons/stats
     */
    async getLessonStats(): Promise<LessonStats> {
        const response = await this.get<LessonStats>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.STATS
        )
        return this.extractData(response)
    }

    // ============================================
    // Related Actions
    // ============================================

    /**
     * Add related action to lesson
     * POST /improvements/lessons/:uuid/actions
     */
    async addRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        const response = await this.post<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.ACTIONS.ADD(uuid),
            { actionId }
        )
        return this.extractData(response)
    }

    /**
     * Remove related action from lesson
     * DELETE /improvements/lessons/:uuid/actions/:actionId
     */
    async removeRelatedAction(uuid: string, actionId: string): Promise<Lesson> {
        const response = await this.delete<Lesson>(
            API_ENDPOINTS.IMPROVEMENTS.LESSONS.ACTIONS.REMOVE(uuid, actionId)
        )
        return this.extractData(response)
    }
}

// Export singleton instance
export const lessonService = new LessonService()