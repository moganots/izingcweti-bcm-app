// ============================================
// useGovernance Composable
// ============================================

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGovernanceStore } from 'src/stores/governance/governance.store'
import type {
    GovernancePolicy,
    GovernanceActivity,
    MaturityAssessment,
    CreatePolicyRequest,
    UpdatePolicyRequest,
    CreateMaturityAssessmentRequest,
    UpdateMaturityAssessmentRequest,
    CreateActivityRequest,
    PolicyQueryParams,
    MaturityQueryParams,
    ActivityQueryParams,
} from '../models/entities/governance/governance.entity'

export interface UseGovernanceOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
}

/**
 * Governance composable
 * Provides reactive governance data and operations
 */
export function useGovernance(options: UseGovernanceOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000 } = options

    const store = useGovernanceStore()
    const {
        policies,
        selectedPolicy,
        policyStats,
        policiesLoading,
        policiesTotal,
        policiesPage,
        policiesLimit,
        maturityAssessments,
        selectedMaturityAssessment,
        maturityStats,
        maturityTrend,
        maturityLoading,
        maturityTotal,
        maturityPage,
        maturityLimit,
        activities,
        recentActivities,
        activityStats,
        activitiesLoading,
        activitiesTotal,
        activitiesPage,
        activitiesLimit,
        metrics,
        complianceOverview,
        governanceHealth,
        metricsLoading,
        error,
    } = storeToRefs(store)

    // ============================================
    // Local State
    // ============================================

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    // ============================================
    // Getters
    // ============================================

    const hasPolicies = computed(() => store.hasPolicies)
    const hasMaturityAssessments = computed(() => store.hasMaturityAssessments)
    const hasActivities = computed(() => store.hasActivities)
    const hasRecentActivities = computed(() => store.hasRecentActivities)

    const activePolicies = computed(() => store.activePolicies)
    const draftPolicies = computed(() => store.draftPolicies)
    const archivedPolicies = computed(() => store.archivedPolicies)

    const averageMaturityScore = computed(() => store.averageMaturityScore)
    const latestMaturityScore = computed(() => store.latestMaturityScore)
    const latestMaturityLevel = computed(() => store.latestMaturityLevel)
    const complianceRate = computed(() => store.complianceRate)

    // ============================================
    // Methods
    // ============================================

    // ----- Initialization -----

    /**
     * Initialize governance data
     */
    async function initialize(): Promise<void> {
        if (isReady.value) return

        await loadAllData()
        isReady.value = true
    }

    /**
     * Load all governance data
     */
    async function loadAllData(): Promise<void> {
        await Promise.all([
            store.loadPolicies(),
            store.loadPolicyStats(),
            store.loadMaturityAssessments(),
            store.loadMaturityStats(),
            store.loadMaturityTrend(),
            store.loadLatestMaturityAssessment(),
            store.loadRecentActivities(),
            store.loadActivityStats(),
            store.loadMetrics(),
            store.loadComplianceOverview(),
            store.loadGovernanceHealth(),
        ])
    }

    /**
     * Refresh all governance data
     */
    async function refreshData(): Promise<void> {
        await loadAllData()
    }

    // ----- Policy Operations -----

    /**
     * Load policies with filters
     */
    async function loadPolicies(params?: PolicyQueryParams): Promise<void> {
        await store.loadPolicies(params)
    }

    /**
     * Load a single policy by ID
     */
    async function loadPolicyById(uuid: string): Promise<void> {
        await store.loadPolicyById(uuid)
    }

    /**
     * Create a policy
     */
    async function createPolicy(data: CreatePolicyRequest): Promise<GovernancePolicy> {
        const policy = await store.createPolicy(data)
        await store.loadPolicyStats()
        return policy
    }

    /**
     * Update a policy
     */
    async function updatePolicy(uuid: string, data: UpdatePolicyRequest): Promise<GovernancePolicy> {
        const policy = await store.updatePolicy(uuid, data)
        await store.loadPolicyStats()
        return policy
    }

    /**
     * Delete a policy
     */
    async function deletePolicy(uuid: string): Promise<boolean> {
        const success = await store.deletePolicy(uuid)
        if (success) {
            await store.loadPolicyStats()
        }
        return success
    }

    /**
     * Activate a policy
     */
    async function activatePolicy(uuid: string): Promise<GovernancePolicy> {
        const policy = await store.activatePolicy(uuid)
        await store.loadPolicyStats()
        return policy
    }

    /**
     * Deactivate a policy
     */
    async function deactivatePolicy(uuid: string): Promise<GovernancePolicy> {
        const policy = await store.deactivatePolicy(uuid)
        await store.loadPolicyStats()
        return policy
    }

    // ----- Maturity Operations -----

    /**
     * Load maturity assessments
     */
    async function loadMaturityAssessments(params?: MaturityQueryParams): Promise<void> {
        await store.loadMaturityAssessments(params)
    }

    /**
     * Create a maturity assessment
     */
    async function createMaturityAssessment(data: CreateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        const assessment = await store.createMaturityAssessment(data)
        await store.loadMaturityStats()
        await store.loadMaturityTrend()
        return assessment
    }

    /**
     * Update a maturity assessment
     */
    async function updateMaturityAssessment(uuid: string, data: UpdateMaturityAssessmentRequest): Promise<MaturityAssessment> {
        const assessment = await store.updateMaturityAssessment(uuid, data)
        await store.loadMaturityStats()
        await store.loadMaturityTrend()
        return assessment
    }

    /**
     * Delete a maturity assessment
     */
    async function deleteMaturityAssessment(uuid: string): Promise<boolean> {
        const success = await store.deleteMaturityAssessment(uuid)
        if (success) {
            await store.loadMaturityStats()
            await store.loadMaturityTrend()
        }
        return success
    }

    // ----- Activity Operations -----

    /**
     * Load activities
     */
    async function loadActivities(params?: ActivityQueryParams): Promise<void> {
        await store.loadActivities(params)
    }

    /**
     * Log an activity
     */
    async function logActivity(data: CreateActivityRequest): Promise<GovernanceActivity> {
        return await store.logActivity(data)
    }

    // ----- Polling -----

    /**
     * Start auto-refresh interval
     */
    function startPolling(): void {
        if (isPolling.value) return
        if (refreshInterval) {
            clearInterval(refreshInterval)
        }

        isPolling.value = true
        refreshInterval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshData().catch(console.error)
            }
        }, autoRefreshInterval)
    }

    /**
     * Stop auto-refresh interval
     */
    function stopPolling(): void {
        isPolling.value = false
        if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
        }
    }

    // ============================================
    // Lifecycle
    // ============================================

    onMounted(async () => {
        if (autoLoad) {
            await initialize()
        }
        startPolling()
    })

    onUnmounted(() => {
        stopPolling()
    })

    // Watch for visibility change to pause/start polling
    watch(
        () => document.visibilityState,
        (state) => {
            if (state === 'visible' && isPolling.value) {
                refreshData().catch(console.error)
            }
        }
    )

    // ============================================
    // Return
    // ============================================

    return {
        // State
        policies,
        selectedPolicy,
        policyStats,
        policiesLoading,
        policiesTotal,
        policiesPage,
        policiesLimit,

        maturityAssessments,
        selectedMaturityAssessment,
        maturityStats,
        maturityTrend,
        maturityLoading,
        maturityTotal,
        maturityPage,
        maturityLimit,

        activities,
        recentActivities,
        activityStats,
        activitiesLoading,
        activitiesTotal,
        activitiesPage,
        activitiesLimit,

        metrics,
        complianceOverview,
        governanceHealth,
        metricsLoading,

        error,
        isReady,
        isPolling,

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

        // Methods
        initialize,
        refreshData,
        loadAllData,

        // Policy methods
        loadPolicies,
        loadPolicyById,
        createPolicy,
        updatePolicy,
        deletePolicy,
        activatePolicy,
        deactivatePolicy,

        // Maturity methods
        loadMaturityAssessments,
        createMaturityAssessment,
        updateMaturityAssessment,
        deleteMaturityAssessment,

        // Activity methods
        loadActivities,
        logActivity,

        // Polling
        startPolling,
        stopPolling,

        // Utilities
        clearError: store.clearError,
        reset: store.reset,
    }
}