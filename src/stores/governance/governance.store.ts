// ============================================
// Governance Store - Pinia Store
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { governanceService } from 'src/services/api/governance/GovernanceService'
import {
    type GovernancePolicy,
    type GovernanceActivity,
    type MaturityAssessment,
    type GovernanceMetrics,
    type ComplianceOverview,
    type GovernanceHealth,
    type PolicyStats,
    type MaturityStats,
    type ActivityStats,
    type CreatePolicyRequest,
    type UpdatePolicyRequest,
    type CreateMaturityAssessmentRequest,
    type UpdateMaturityAssessmentRequest,
    type CreateActivityRequest,
    type PolicyQueryParams,
    type MaturityQueryParams,
    type ActivityQueryParams,
    PolicyStatus,
} from 'src/models/entities/governance/governance.entity'

export const useGovernanceStore = defineStore('governance', () => {
    // ============================================
    // State
    // ============================================

    // Policies
    const policies = ref<GovernancePolicy[]>([])
    const selectedPolicy = ref<GovernancePolicy | null>(null)
    const policyStats = ref<PolicyStats | null>(null)
    const policiesLoading = ref(false)
    const policiesTotal = ref(0)
    const policiesPage = ref(1)
    const policiesLimit = ref(10)

    // Maturity Assessments
    const maturityAssessments = ref<MaturityAssessment[]>([])
    const selectedMaturityAssessment = ref<MaturityAssessment | null>(null)
    const maturityStats = ref<MaturityStats | null>(null)
    const maturityTrend = ref<Array<{ date: string; score: number; level: string }>>([])
    const maturityLoading = ref(false)
    const maturityTotal = ref(0)
    const maturityPage = ref(1)
    const maturityLimit = ref(10)

    // Activities
    const activities = ref<GovernanceActivity[]>([])
    const recentActivities = ref<GovernanceActivity[]>([])
    const activityStats = ref<ActivityStats | null>(null)
    const activitiesLoading = ref(false)
    const activitiesTotal = ref(0)
    const activitiesPage = ref(1)
    const activitiesLimit = ref(10)

    // Metrics
    const metrics = ref<GovernanceMetrics | null>(null)
    const complianceOverview = ref<ComplianceOverview | null>(null)
    const governanceHealth = ref<GovernanceHealth | null>(null)
    const metricsLoading = ref(false)

    // Error state
    const error = ref<string | null>(null)

    // ============================================
    // Getters
    // ============================================

    const hasPolicies = computed(() => policies.value.length > 0)
    const hasMaturityAssessments = computed(() => maturityAssessments.value.length > 0)
    const hasActivities = computed(() => activities.value.length > 0)
    const hasRecentActivities = computed(() => recentActivities.value.length > 0)

    const activePolicies = computed(() =>
        policies.value.filter((p) => p.status === PolicyStatus.ACTIVE)
    )

    const draftPolicies = computed(() =>
        policies.value.filter((p) => p.status === PolicyStatus.DRAFT)
    )

    const archivedPolicies = computed(() =>
        policies.value.filter((p) => p.status === PolicyStatus.ARCHIVED)
    )

    const averageMaturityScore = computed(() => {
        if (maturityAssessments.value.length === 0) return 0
        const sum = maturityAssessments.value.reduce((acc, m) => acc + m.score, 0)
        return Math.round((sum / maturityAssessments.value.length) * 10) / 10
    })

    const latestMaturityScore = computed(() => {
        if (maturityAssessments.value.length === 0) return 0
        const sorted = [...maturityAssessments.value].sort(
            (a, b) => new Date(b.assessedDate).getTime() - new Date(a.assessedDate).getTime()
        )
        return sorted[0]?.score || 0
    })

    const latestMaturityLevel = computed(() => {
        if (maturityAssessments.value.length === 0) return null
        const sorted = [...maturityAssessments.value].sort(
            (a, b) => new Date(b.assessedDate).getTime() - new Date(a.assessedDate).getTime()
        )
        return sorted[0]?.level || null
    })

    const complianceRate = computed(() => {
        if (!policyStats.value) return 0
        return policyStats.value.total > 0
            ? Math.round((policyStats.value.active / policyStats.value.total) * 100)
            : 0
    })

    // ============================================
    // Actions
    // ============================================

    // ----- Policy Actions -----

    /**
     * Load policies with pagination and filters
     */
    async function loadPolicies(params?: PolicyQueryParams): Promise<void> {
        policiesLoading.value = true
        error.value = null

        try {
            const response = await governanceService.getPolicies(params)
            policies.value = response.data ?? []
            policiesTotal.value = response.total
            policiesPage.value = response.page
            policiesLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load policies'
            console.error('Failed to load policies:', err)
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Load a single policy by ID
     */
    async function loadPolicyById(uuid: string): Promise<void> {
        policiesLoading.value = true
        error.value = null

        try {
            selectedPolicy.value = await governanceService.getPolicyById(uuid)
        } catch (err: any) {
            error.value = err.message || 'Failed to load policy'
            console.error('Failed to load policy:', err)
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Create a new policy
     */
    async function createPolicy(data: CreatePolicyRequest): Promise<GovernancePolicy> {
        policiesLoading.value = true
        error.value = null

        try {
            const policy = await governanceService.createPolicy(data)
            policies.value.unshift(policy)
            return policy
        } catch (err: any) {
            error.value = err.message || 'Failed to create policy'
            console.error('Failed to create policy:', err)
            throw err
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Update an existing policy
     */
    async function updatePolicy(uuid: string, data: UpdatePolicyRequest): Promise<GovernancePolicy> {
        policiesLoading.value = true
        error.value = null

        try {
            const policy = await governanceService.updatePolicy(uuid, data)
            const index = policies.value.findIndex((p) => p.uuid === uuid)
            if (index !== -1) {
                policies.value[index] = policy
            }
            if (selectedPolicy.value?.uuid === uuid) {
                selectedPolicy.value = policy
            }
            return policy
        } catch (err: any) {
            error.value = err.message || 'Failed to update policy'
            console.error('Failed to update policy:', err)
            throw err
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Delete a policy
     */
    async function deletePolicy(uuid: string): Promise<boolean> {
        policiesLoading.value = true
        error.value = null

        try {
            const success = await governanceService.deletePolicy(uuid)
            if (success) {
                policies.value = policies.value.filter((p) => p.uuid !== uuid)
                if (selectedPolicy.value?.uuid === uuid) {
                    selectedPolicy.value = null
                }
            }
            return success
        } catch (err: any) {
            error.value = err.message || 'Failed to delete policy'
            console.error('Failed to delete policy:', err)
            throw err
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Activate a policy
     */
    async function activatePolicy(uuid: string): Promise<GovernancePolicy> {
        policiesLoading.value = true
        error.value = null

        try {
            const policy = await governanceService.activatePolicy(uuid)
            const index = policies.value.findIndex((p) => p.uuid === uuid)
            if (index !== -1) {
                policies.value[index] = policy
            }
            return policy
        } catch (err: any) {
            error.value = err.message || 'Failed to activate policy'
            console.error('Failed to activate policy:', err)
            throw err
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Deactivate a policy
     */
    async function deactivatePolicy(uuid: string): Promise<GovernancePolicy> {
        policiesLoading.value = true
        error.value = null

        try {
            const policy = await governanceService.deactivatePolicy(uuid)
            const index = policies.value.findIndex((p) => p.uuid === uuid)
            if (index !== -1) {
                policies.value[index] = policy
            }
            return policy
        } catch (err: any) {
            error.value = err.message || 'Failed to deactivate policy'
            console.error('Failed to deactivate policy:', err)
            throw err
        } finally {
            policiesLoading.value = false
        }
    }

    /**
     * Load policy statistics
     */
    async function loadPolicyStats(): Promise<void> {
        policiesLoading.value = true
        error.value = null

        try {
            policyStats.value = await governanceService.getPolicyStats()
        } catch (err: any) {
            error.value = err.message || 'Failed to load policy statistics'
            console.error('Failed to load policy statistics:', err)
        } finally {
            policiesLoading.value = false
        }
    }

    // ----- Maturity Assessment Actions -----

    /**
     * Load maturity assessments with pagination
     */
    async function loadMaturityAssessments(params?: MaturityQueryParams): Promise<void> {
        maturityLoading.value = true
        error.value = null

        try {
            const response = await governanceService.getMaturityAssessments(params)
            maturityAssessments.value = response.data ?? []
            maturityTotal.value = response.total
            maturityPage.value = response.page
            maturityLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load maturity assessments'
            console.error('Failed to load maturity assessments:', err)
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Load latest maturity assessment
     */
    async function loadLatestMaturityAssessment(): Promise<void> {
        maturityLoading.value = true
        error.value = null

        try {
            selectedMaturityAssessment.value = await governanceService.getLatestMaturityAssessment()
        } catch (err: any) {
            error.value = err.message || 'Failed to load latest maturity assessment'
            console.error('Failed to load latest maturity assessment:', err)
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Create a new maturity assessment
     */
    async function createMaturityAssessment(data: CreateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        maturityLoading.value = true
        error.value = null

        try {
            const assessment = await governanceService.createMaturityAssessment(data)
            maturityAssessments.value.unshift(assessment)
            return assessment
        } catch (err: any) {
            error.value = err.message || 'Failed to create maturity assessment'
            console.error('Failed to create maturity assessment:', err)
            throw err
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Update a maturity assessment
     */
    async function updateMaturityAssessment(uuid: string, data: UpdateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        maturityLoading.value = true
        error.value = null

        try {
            const assessment = await governanceService.updateMaturityAssessment(uuid, data)
            const index = maturityAssessments.value.findIndex((m) => m.uuid === uuid)
            if (index !== -1) {
                maturityAssessments.value[index] = assessment
            }
            if (selectedMaturityAssessment.value?.uuid === uuid) {
                selectedMaturityAssessment.value = assessment
            }
            return assessment
        } catch (err: any) {
            error.value = err.message || 'Failed to update maturity assessment'
            console.error('Failed to update maturity assessment:', err)
            throw err
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Delete a maturity assessment
     */
    async function deleteMaturityAssessment(uuid: string): Promise<boolean> {
        maturityLoading.value = true
        error.value = null

        try {
            const success = await governanceService.deleteMaturityAssessment(uuid)
            if (success) {
                maturityAssessments.value = maturityAssessments.value.filter((m) => m.uuid !== uuid)
                if (selectedMaturityAssessment.value?.uuid === uuid) {
                    selectedMaturityAssessment.value = null
                }
            }
            return success
        } catch (err: any) {
            error.value = err.message || 'Failed to delete maturity assessment'
            console.error('Failed to delete maturity assessment:', err)
            throw err
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Load maturity trend
     */
    async function loadMaturityTrend(limit: number = 6): Promise<void> {
        maturityLoading.value = true
        error.value = null

        try {
            maturityTrend.value = await governanceService.getMaturityTrend(limit)
        } catch (err: any) {
            error.value = err.message || 'Failed to load maturity trend'
            console.error('Failed to load maturity trend:', err)
        } finally {
            maturityLoading.value = false
        }
    }

    /**
     * Load maturity statistics
     */
    async function loadMaturityStats(): Promise<void> {
        maturityLoading.value = true
        error.value = null

        try {
            maturityStats.value = await governanceService.getMaturityStats()
        } catch (err: any) {
            error.value = err.message || 'Failed to load maturity statistics'
            console.error('Failed to load maturity statistics:', err)
        } finally {
            maturityLoading.value = false
        }
    }

    // ----- Activity Actions -----

    /**
     * Load activities with pagination
     */
    async function loadActivities(params?: ActivityQueryParams): Promise<void> {
        activitiesLoading.value = true
        error.value = null

        try {
            const response = await governanceService.getActivities(params)
            activities.value = response.data ?? []
            activitiesTotal.value = response.total
            activitiesPage.value = response.page
            activitiesLimit.value = response.limit
        } catch (err: any) {
            error.value = err.message || 'Failed to load activities'
            console.error('Failed to load activities:', err)
        } finally {
            activitiesLoading.value = false
        }
    }

    /**
     * Load recent activities
     */
    async function loadRecentActivities(limit: number = 10): Promise<void> {
        activitiesLoading.value = true
        error.value = null

        try {
            recentActivities.value = await governanceService.getRecentActivities(limit)
        } catch (err: any) {
            error.value = err.message || 'Failed to load recent activities'
            console.error('Failed to load recent activities:', err)
        } finally {
            activitiesLoading.value = false
        }
    }

    /**
     * Log an activity
     */
    async function logActivity(data: CreateActivityRequest): Promise<GovernanceActivity> {
        activitiesLoading.value = true
        error.value = null

        try {
            const activity = await governanceService.logActivity(data)
            activities.value.unshift(activity)
            recentActivities.value.unshift(activity)
            return activity
        } catch (err: any) {
            error.value = err.message || 'Failed to log activity'
            console.error('Failed to log activity:', err)
            throw err
        } finally {
            activitiesLoading.value = false
        }
    }

    /**
     * Load activity statistics
     */
    async function loadActivityStats(): Promise<void> {
        activitiesLoading.value = true
        error.value = null

        try {
            activityStats.value = await governanceService.getActivityStats()
        } catch (err: any) {
            error.value = err.message || 'Failed to load activity statistics'
            console.error('Failed to load activity statistics:', err)
        } finally {
            activitiesLoading.value = false
        }
    }

    // ----- Metrics Actions -----

    /**
     * Load all governance metrics
     */
    async function loadMetrics(): Promise<void> {
        metricsLoading.value = true
        error.value = null

        try {
            metrics.value = await governanceService.getMetrics()
        } catch (err: any) {
            error.value = err.message || 'Failed to load governance metrics'
            console.error('Failed to load governance metrics:', err)
        } finally {
            metricsLoading.value = false
        }
    }

    /**
     * Load compliance overview
     */
    async function loadComplianceOverview(): Promise<void> {
        metricsLoading.value = true
        error.value = null

        try {
            complianceOverview.value = await governanceService.getComplianceOverview()
        } catch (err: any) {
            error.value = err.message || 'Failed to load compliance overview'
            console.error('Failed to load compliance overview:', err)
        } finally {
            metricsLoading.value = false
        }
    }

    /**
     * Load governance health
     */
    async function loadGovernanceHealth(): Promise<void> {
        metricsLoading.value = true
        error.value = null

        try {
            governanceHealth.value = await governanceService.getGovernanceHealth()
        } catch (err: any) {
            error.value = err.message || 'Failed to load governance health'
            console.error('Failed to load governance health:', err)
        } finally {
            metricsLoading.value = false
        }
    }

    /**
     * Clear all errors
     */
    function clearError(): void {
        error.value = null
    }

    /**
     * Reset all state
     */
    function reset(): void {
        policies.value = []
        selectedPolicy.value = null
        policyStats.value = null
        policiesLoading.value = false
        policiesTotal.value = 0
        policiesPage.value = 1
        policiesLimit.value = 10

        maturityAssessments.value = []
        selectedMaturityAssessment.value = null
        maturityStats.value = null
        maturityTrend.value = []
        maturityLoading.value = false
        maturityTotal.value = 0
        maturityPage.value = 1
        maturityLimit.value = 10

        activities.value = []
        recentActivities.value = []
        activityStats.value = null
        activitiesLoading.value = false
        activitiesTotal.value = 0
        activitiesPage.value = 1
        activitiesLimit.value = 10

        metrics.value = null
        complianceOverview.value = null
        governanceHealth.value = null
        metricsLoading.value = false

        error.value = null
    }

    // ============================================
    // Return
    // ============================================

    return {
        // State - Policies
        policies,
        selectedPolicy,
        policyStats,
        policiesLoading,
        policiesTotal,
        policiesPage,
        policiesLimit,

        // State - Maturity
        maturityAssessments,
        selectedMaturityAssessment,
        maturityStats,
        maturityTrend,
        maturityLoading,
        maturityTotal,
        maturityPage,
        maturityLimit,

        // State - Activities
        activities,
        recentActivities,
        activityStats,
        activitiesLoading,
        activitiesTotal,
        activitiesPage,
        activitiesLimit,

        // State - Metrics
        metrics,
        complianceOverview,
        governanceHealth,
        metricsLoading,

        // State - Error
        error,

        // Getters
        hasPolicies,
        hasMaturityAssessments,
        hasActivities,
        hasRecentActivities,
        activePolicies,
        draftPolicies,
        archivedPolicies,
        averageMaturityScore,
        latestMaturityScore,
        latestMaturityLevel,
        complianceRate,

        // Actions - Policies
        loadPolicies,
        loadPolicyById,
        createPolicy,
        updatePolicy,
        deletePolicy,
        activatePolicy,
        deactivatePolicy,
        loadPolicyStats,

        // Actions - Maturity
        loadMaturityAssessments,
        loadLatestMaturityAssessment,
        createMaturityAssessment,
        updateMaturityAssessment,
        deleteMaturityAssessment,
        loadMaturityTrend,
        loadMaturityStats,

        // Actions - Activities
        loadActivities,
        loadRecentActivities,
        logActivity,
        loadActivityStats,

        // Actions - Metrics
        loadMetrics,
        loadComplianceOverview,
        loadGovernanceHealth,

        // Utilities
        clearError,
        reset,
    }
})