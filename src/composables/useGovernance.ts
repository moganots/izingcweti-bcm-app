import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGovernanceStore } from '../stores/governance/governance.store'

export interface UseGovernanceOptions {
    autoLoad?: boolean
    autoRefreshInterval?: number
}

/**
 * Governance composable
 * Aligned with useGovernanceStore
 */
export function useGovernance(options: UseGovernanceOptions = {}) {
    const { autoLoad = true, autoRefreshInterval = 30000 } = options

    const store = useGovernanceStore()
    const {
        policies,
        maturityAssessments,
        activities,
        isLoading,
        isSaving,
        error,
        activePolicies,
        draftPolicies,
        archivedPolicies,
        averageMaturityScore,
        latestMaturityScore,
        latestMaturityLevel,
        recentActivities,
    } = storeToRefs(store)

    const isReady = ref(false)
    const isPolling = ref(false)
    let refreshInterval: number | null = null

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        if (isReady.value) return
        await store.initialize()
        isReady.value = true
    }

    async function refresh(): Promise<void> {
        await store.initialize()
    }

    function startPolling(): void {
        if (isPolling.value) return
        if (refreshInterval) clearInterval(refreshInterval)

        isPolling.value = true
        refreshInterval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                refresh().catch(console.error)
            }
        }, autoRefreshInterval)
    }

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
        if (autoLoad) await initialize()
        startPolling()
    })

    onUnmounted(() => stopPolling())

    watch(
        () => document.visibilityState,
        (state) => {
            if (state === 'visible' && isPolling.value) {
                refresh().catch(console.error)
            }
        }
    )

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        policies,
        maturityAssessments,
        activities,
        isLoading,
        isSaving,
        error,
        isReady,
        isPolling,

        // Getters
        activePolicies,
        draftPolicies,
        archivedPolicies,
        averageMaturityScore,
        latestMaturityScore,
        latestMaturityLevel,
        recentActivities,

        // Actions
        initialize,
        refresh,
        activatePolicy: store.activatePolicy,
        deactivatePolicy: store.deactivatePolicy,
        logActivity: store.logActivity,

        // Sub-stores
        policyStore: store.policyStore,
        maturityStore: store.maturityStore,
        activityStore: store.activityStore,

        // Polling
        startPolling,
        stopPolling,
    }
}

export default useGovernance