// ============================================
// Governance Service - API Layer
// ============================================

import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from './../../../core/constants/api.constants'
import type {
    GovernancePolicy,
    GovernanceActivity,
    MaturityAssessment,
    GovernanceMetrics,
    ComplianceOverview,
    GovernanceHealth,
    PolicyStats,
    MaturityStats,
    ActivityStats,
    CreatePolicyRequest,
    UpdatePolicyRequest,
    CreateMaturityAssessmentRequest,
    UpdateMaturityAssessmentRequest,
    CreateActivityRequest,
    PolicyQueryParams,
    MaturityQueryParams,
    ActivityQueryParams,
} from './../../../models/entities/governance/governance.entity'
import { PaginatedResponse } from './../../../shared/types/common.types'

/**
 * Governance Service
 * Handles all governance-related API calls
 */
export class GovernanceService extends BaseService {
    // ============================================
    // Policy Operations
    // ============================================

    /**
     * Get all policies with pagination and filters
     * GET /governance/policies
     */
    async getPolicies(params?: PolicyQueryParams): Promise<PaginatedResponse<GovernancePolicy>> {
        const response = await this.getPaginated<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.BASE,
            params as Record<string, any>
        )
        return response
    }

    /**
     * Get policy by ID
     * GET /governance/policies/:uuid
     */
    async getPolicyById(uuid: string): Promise<GovernancePolicy> {
        const response = await this.get<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.BY_ID(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Create a new policy
     * POST /governance/policies
     */
    async createPolicy(data: CreatePolicyRequest): Promise<GovernancePolicy> {
        const response = await this.post<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.CREATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update an existing policy
     * PUT /governance/policies/:uuid
     */
    async updatePolicy(uuid: string, data: UpdatePolicyRequest): Promise<GovernancePolicy> {
        const response = await this.put<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.UPDATE(uuid),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete a policy
     * DELETE /governance/policies/:uuid
     */
    async deletePolicy(uuid: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.DELETE(uuid)
        )
        return this.extractData(response).success
    }

    /**
     * Activate a policy
     * POST /governance/policies/:uuid/activate
     */
    async activatePolicy(uuid: string): Promise<GovernancePolicy> {
        const response = await this.post<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.ACTIVATE(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Deactivate a policy
     * POST /governance/policies/:uuid/deactivate
     */
    async deactivatePolicy(uuid: string): Promise<GovernancePolicy> {
        const response = await this.post<GovernancePolicy>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.DEACTIVATE(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Get policy statistics
     * GET /governance/policies/stats
     */
    async getPolicyStats(): Promise<PolicyStats> {
        const response = await this.get<PolicyStats>(
            API_ENDPOINTS.GOVERNANCE.POLICIES.STATS
        )
        return this.extractData(response)
    }

    // ============================================
    // Maturity Assessment Operations
    // ============================================

    /**
     * Get all maturity assessments with pagination
     * GET /governance/maturity
     */
    async getMaturityAssessments(params?: MaturityQueryParams): Promise<PaginatedResponse<MaturityAssessment>> {
        const response = await this.getPaginated<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.BASE,
            params as Record<string, any>
        )
        return response
    }

    /**
     * Get latest maturity assessment
     * GET /governance/maturity/latest
     */
    async getLatestMaturityAssessment(): Promise<MaturityAssessment | null> {
        try {
            const response = await this.get<MaturityAssessment>(
                API_ENDPOINTS.GOVERNANCE.MATURITY.LATEST
            )
            return this.extractData(response)
        } catch {
            return null
        }
    }

    /**
     * Get maturity assessment by ID
     * GET /governance/maturity/:uuid
     */
    async getMaturityAssessmentById(uuid: string): Promise<MaturityAssessment> {
        const response = await this.get<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.BY_ID(uuid)
        )
        return this.extractData(response)
    }

    /**
     * Create a new maturity assessment
     * POST /governance/maturity
     */
    async createMaturityAssessment(data: CreateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        const response = await this.post<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.CREATE,
            data
        )
        return this.extractData(response)
    }

    /**
     * Update a maturity assessment
     * PUT /governance/maturity/:uuid
     */
    async updateMaturityAssessment(uuid: string, data: UpdateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        const response = await this.put<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.UPDATE(uuid),
            data
        )
        return this.extractData(response)
    }

    /**
     * Delete a maturity assessment
     * DELETE /governance/maturity/:uuid
     */
    async deleteMaturityAssessment(uuid: string): Promise<boolean> {
        const response = await this.delete<{ success: boolean }>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.DELETE(uuid)
        )
        return this.extractData(response).success
    }

    /**
     * Get maturity trend - Uses the base endpoint with sorting
     * GET /governance/maturity?sortBy=assessedDate&sortOrder=DESC
     */
    async getMaturityTrend(limit: number = 6): Promise<Array<{ date: string; score: number; level: string }>> {
        // Use the base maturity endpoint with sorting to get trend data
        const response = await this.getPaginated<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.BASE,
            {
                sortBy: 'assessedDate',
                sortOrder: 'DESC',
                limit: limit,
            } as Record<string, any>
        )

        // Transform the data to match the expected format
        const assessments = response.data || []
        return assessments
            .map((assessment: MaturityAssessment) => ({
                date: typeof assessment.assessedDate === 'string'
                    ? assessment.assessedDate
                    : assessment.assessedDate?.toISOString?.() || '',
                score: assessment.score || 0,
                level: assessment.level || '',
            }))
            .reverse() // Reverse to show chronological order
    }

    /**
     * Get maturity statistics
     * GET /governance/maturity?limit=1&sortBy=assessedDate&sortOrder=DESC
     * Also uses the base endpoint with aggregation
     */
    async getMaturityStats(): Promise<MaturityStats> {
        // Get all assessments to calculate stats
        const response = await this.getPaginated<MaturityAssessment>(
            API_ENDPOINTS.GOVERNANCE.MATURITY.BASE,
            {
                limit: 100, // Get enough to calculate stats
                sortBy: 'assessedDate',
                sortOrder: 'DESC',
            } as Record<string, any>
        )

        const assessments = response.data || []

        if (assessments.length === 0) {
            return {
                total: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                latestScore: 0,
                latestLevel: '',
                trend: [],
            }
        }

        let totalScore = 0
        let highestScore = 0
        let lowestScore = 100
        let latestScore = 0
        let latestLevel = ''
        const trend: Array<{ date: string; score: number }> = []

        for (const assessment of assessments) {
            const score = assessment.score || 0
            totalScore += score
            if (score > highestScore) highestScore = score
            if (score < lowestScore) lowestScore = score
            if (!latestScore) {
                latestScore = score
                latestLevel = assessment.level || ''
            }

            const date = typeof assessment.assessedDate === 'string'
                ? assessment.assessedDate
                : assessment.assessedDate?.toISOString?.() || ''

            trend.push({
                date: date.split('T')[0]!,
                score: score,
            })
        }

        return {
            total: assessments.length,
            averageScore: Math.round((totalScore / assessments.length) * 10) / 10,
            highestScore,
            lowestScore,
            latestScore,
            latestLevel,
            trend: trend.reverse(),
        }
    }

    // ============================================
    // Activity Operations
    // ============================================

    /**
     * Get all activities with pagination
     * GET /governance/activities
     */
    async getActivities(params?: ActivityQueryParams): Promise<PaginatedResponse<GovernanceActivity>> {
        const response = await this.getPaginated<GovernanceActivity>(
            API_ENDPOINTS.GOVERNANCE.ACTIVITIES.BASE,
            params as Record<string, any>
        )
        return response
    }

    /**
     * Get recent activities
     * GET /governance/activities/recent
     */
    async getRecentActivities(limit: number = 10): Promise<GovernanceActivity[]> {
        const response = await this.get<GovernanceActivity[]>(
            API_ENDPOINTS.GOVERNANCE.ACTIVITIES.RECENT,
            { limit }
        )
        return this.extractData(response)
    }

    /**
     * Log an activity
     * POST /governance/activities
     */
    async logActivity(data: CreateActivityRequest): Promise<GovernanceActivity> {
        const response = await this.post<GovernanceActivity>(
            API_ENDPOINTS.GOVERNANCE.ACTIVITIES.LOG,
            data
        )
        return this.extractData(response)
    }

    /**
     * Get activity statistics - Uses the base endpoint with aggregation
     * GET /governance/activities
     */
    async getActivityStats(): Promise<ActivityStats> {
        // Get all activities to calculate stats
        const response = await this.getPaginated<GovernanceActivity>(
            API_ENDPOINTS.GOVERNANCE.ACTIVITIES.BASE,
            {
                limit: 100,
            } as Record<string, any>
        )

        const activities = response.data || []

        const byAction: Record<string, number> = {}
        const byTarget: Record<string, number> = {}
        let recentCount = 0
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        for (const activity of activities) {
            // Count by action
            byAction[activity.action] = (byAction[activity.action] || 0) + 1

            // Count by target type
            if (activity.targetType) {
                byTarget[activity.targetType] = (byTarget[activity.targetType] || 0) + 1
            }

            // Count recent activities
            const createdAt = typeof activity.createdAt === 'string'
                ? new Date(activity.createdAt)
                : activity.createdAt
            if (createdAt && createdAt >= sevenDaysAgo) {
                recentCount++
            }
        }

        return {
            total: activities.length,
            byAction,
            byTarget,
            recentCount,
        }
    }

    // ============================================
    // Metrics Operations
    // ============================================

    /**
     * Get governance metrics
     * GET /governance/metrics
     */
    async getMetrics(): Promise<GovernanceMetrics> {
        const response = await this.get<GovernanceMetrics>(
            API_ENDPOINTS.GOVERNANCE.METRICS.BASE
        )
        return this.extractData(response)
    }

    /**
     * Get compliance overview
     * GET /governance/compliance-overview
     */
    async getComplianceOverview(): Promise<ComplianceOverview> {
        const response = await this.get<ComplianceOverview>(
            API_ENDPOINTS.GOVERNANCE.METRICS.COMPLIANCE_OVERVIEW
        )
        return this.extractData(response)
    }

    /**
     * Get governance health - Uses metrics endpoint
     * GET /governance/metrics (with health calculation)
     */
    async getGovernanceHealth(): Promise<GovernanceHealth> {
        // The health endpoint doesn't exist yet, so we use metrics and calculate health
        try {
            const metrics = await this.getMetrics()

            // Calculate health from metrics
            const complianceRate = metrics.policyStats?.total > 0
                ? (metrics.policyStats.active / metrics.policyStats.total) * 100
                : 0

            const policyCoverage = metrics.policyStats?.total > 0
                ? ((metrics.policyStats.active + metrics.policyStats.draft) / metrics.policyStats.total) * 100
                : 0

            const maturityScore = metrics.maturityStats?.latestScore || 0
            const recentActivity = metrics.recentActivities?.length || 0
            const issuesCount = (metrics.policyStats?.expired || 0) + (metrics.policyStats?.archived || 0)

            // Determine overall health
            let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy'
            if (complianceRate < 50 || maturityScore < 30) {
                overallHealth = 'critical'
            } else if (complianceRate < 70 || maturityScore < 50) {
                overallHealth = 'warning'
            }

            return {
                overallHealth,
                complianceRate: Math.round(complianceRate * 100) / 100,
                policyCoverage: Math.round(policyCoverage * 100) / 100,
                maturityScore,
                recentActivity,
                issuesCount,
            }
        } catch {
            // Fallback if metrics fails
            return {
                overallHealth: 'warning',
                complianceRate: 0,
                policyCoverage: 0,
                maturityScore: 0,
                recentActivity: 0,
                issuesCount: 0,
            }
        }
    }
}

// Export singleton instance
export const governanceService = new GovernanceService()