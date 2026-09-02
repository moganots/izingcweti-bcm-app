import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
    type FeatureToggle,
    type FeatureToggleOverride,
    type FeatureToggleAuditLog,
    type CreateFeatureToggleRequest,
    type UpdateFeatureToggleRequest,
    type CreateFeatureToggleOverrideRequest,
    type UpdateFeatureToggleOverrideRequest,
    type EvaluateFeatureRequest,
    type FeatureEvaluationResponse,
    type BatchFeatureEvaluationRequest,
    type BatchFeatureEvaluationResponse,
    type FeatureToggleQueryParams,
    type FeatureToggleStats,
    type FeatureToggleAuditQueryParams,
} from './../../../models/entities/feature-toggle/feature-toggle.entity'
import { PaginatedResponse } from './../../../shared/types/common.types'

/**
 * Feature Toggle Service - Aligned with Backend DTOs (camelCase)
 */
export class FeatureToggleService extends BaseService {
    // ============================================
    // Feature Toggle CRUD Operations
    // ============================================

    /**
     * Get feature toggles - GET /feature-toggles
     */
    async getFeatureToggles(params?: FeatureToggleQueryParams): Promise<PaginatedResponse<FeatureToggle>> {
        const response = await this.getPaginated<FeatureToggle>(
            API_ENDPOINTS.FEATURE_TOGGLES.BASE,
            params as Record<string, any>
        )
        return {
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
        }
    }

    /**
     * Get feature toggle by ID - GET /feature-toggles/:uuid
     */
    async getFeatureToggle(id: string): Promise<FeatureToggle> {
        const response = await this.get<FeatureToggle>(API_ENDPOINTS.FEATURE_TOGGLES.BY_ID(id))
        return this.extractData(response)
    }

    /**
     * Create feature toggle - POST /feature-toggles
     */
    async createFeatureToggle(data: CreateFeatureToggleRequest): Promise<FeatureToggle> {
        const response = await this.post<FeatureToggle>(API_ENDPOINTS.FEATURE_TOGGLES.BASE, data)
        return this.extractData(response)
    }

    /**
     * Update feature toggle - PUT /feature-toggles/:uuid
     */
    async updateFeatureToggle(id: string, data: UpdateFeatureToggleRequest): Promise<FeatureToggle> {
        const response = await this.put<FeatureToggle>(API_ENDPOINTS.FEATURE_TOGGLES.BY_ID(id), data)
        return this.extractData(response)
    }

    /**
     * Delete feature toggle - DELETE /feature-toggles/:uuid
     */
    async deleteFeatureToggle(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.FEATURE_TOGGLES.BY_ID(id))
    }

    /**
     * Get feature toggle statistics - GET /feature-toggles/stats
     */
    async getFeatureToggleStats(organisationId: string): Promise<FeatureToggleStats> {
        const response = await this.get<FeatureToggleStats>(
            API_ENDPOINTS.FEATURE_TOGGLES.STATS,
            { organisationId } as Record<string, any>
        )
        return this.extractData(response)
    }

    // ============================================
    // Feature Evaluation
    // ============================================

    /**
     * Evaluate feature - POST /feature-toggles/evaluate
     */
    async evaluateFeature(data: EvaluateFeatureRequest): Promise<FeatureEvaluationResponse> {
        const response = await this.post<FeatureEvaluationResponse>(
            API_ENDPOINTS.FEATURE_TOGGLES.EVALUATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Batch evaluate features - POST /feature-toggles/evaluate/batch
     */
    async batchEvaluateFeatures(data: BatchFeatureEvaluationRequest): Promise<BatchFeatureEvaluationResponse> {
        const response = await this.post<BatchFeatureEvaluationResponse>(
            API_ENDPOINTS.FEATURE_TOGGLES.BATCH_EVALUATE,
            data
        )
        return this.extractData(response)
    }

    // ============================================
    // Feature Toggle Overrides
    // ============================================

    /**
     * Create override - POST /feature-toggles/overrides
     */
    async createOverride(data: CreateFeatureToggleOverrideRequest): Promise<FeatureToggleOverride> {
        const response = await this.post<FeatureToggleOverride>(
            API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDES,
            data
        )
        return this.extractData(response)
    }

    /**
     * Get overrides - GET /feature-toggles/overrides
     */
    async getOverrides(organisationId: string): Promise<PaginatedResponse<FeatureToggleOverride>> {
        const response = await this.getPaginated<FeatureToggleOverride>(
            API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDES,
            { organisationId }
        )
        return {
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
        }
    }

    /**
     * Get override by ID - GET /feature-toggles/overrides/:uuid
     */
    async getOverride(id: string): Promise<FeatureToggleOverride> {
        const response = await this.get<FeatureToggleOverride>(
            API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDE_BY_ID(id)
        )
        return this.extractData(response)
    }

    /**
     * Update override - PUT /feature-toggles/overrides/:uuid
     */
    async updateOverride(id: string, data: UpdateFeatureToggleOverrideRequest): Promise<FeatureToggleOverride> {
        const response = await this.put<FeatureToggleOverride>(
            API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDE_BY_ID(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete override - DELETE /feature-toggles/overrides/:uuid
     */
    async deleteOverride(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDE_BY_ID(id))
    }

    /**
     * Get active overrides - GET /feature-toggles/overrides/active
     */
    async getActiveOverrides(organisationId: string): Promise<FeatureToggleOverride[]> {
        const response = await this.get<FeatureToggleOverride[]>(
            API_ENDPOINTS.FEATURE_TOGGLES.ACTIVE_OVERRIDES,
            { organisationId }
        )
        return this.extractData(response)
    }

    /**
     * Delete expired overrides - DELETE /feature-toggles/overrides/expired
     */
    async deleteExpiredOverrides(): Promise<{ count: number }> {
        const response = await this.delete<{ count: number }>(
            API_ENDPOINTS.FEATURE_TOGGLES.DELETE_EXPIRED_OVERRIDES
        )
        return this.extractData(response)
    }

    /**
     * Get overrides by feature toggle - GET /feature-toggles/overrides/feature-toggle/:featureToggleId
     */
    async getOverridesByFeatureToggle(featureToggleId: string): Promise<FeatureToggleOverride[]> {
        const response = await this.get<FeatureToggleOverride[]>(
            `/feature-toggles/overrides/feature-toggle/${featureToggleId}`
        )
        return this.extractData(response)
    }

    /**
     * Get overrides by user - GET /feature-toggles/overrides/user/:userId
     */
    async getOverridesByUser(userId: string): Promise<FeatureToggleOverride[]> {
        const response = await this.get<FeatureToggleOverride[]>(
            `/feature-toggles/overrides/user/${userId}`
        )
        return this.extractData(response)
    }

    // ============================================
    // Audit Logs
    // ============================================

    /**
     * Get audit logs for feature toggle - GET /feature-toggles/:featureToggleId/audit-logs
     */
    async getAuditLogs(
        featureToggleId: string,
        params?: FeatureToggleAuditQueryParams
    ): Promise<PaginatedResponse<FeatureToggleAuditLog>> {
        const response = await this.getPaginated<FeatureToggleAuditLog>(
            API_ENDPOINTS.FEATURE_TOGGLES.AUDIT_LOGS(featureToggleId),
            params as Record<string, any>
        )
        return {
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
        }
    }
}

export const featureToggleService = new FeatureToggleService()