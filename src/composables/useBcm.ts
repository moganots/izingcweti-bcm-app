import { computed, onMounted, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBcmStore } from '../stores/bcm/bcm.store'
import { useAuth } from './useAuth'

export interface UseBcmOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
}

/**
 * BCM composable
 * Aligned with useBcmStore
 */
export function useBcm(options: UseBcmOptions = {}) {
    const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

    const bcmStore = useBcmStore()
    const { userOrganisationId, isAuthenticated } = useAuth()

    // Only refs / computeds via storeToRefs
    const {
        criticalFunctions,
        bias,
        bcps,
        bcpTemplates,
        recoveryStrategies,
        exerciseTests,
        incidents,
        functionsByPriority,
        functionsRequiringBCP,
        activeFunctions,
        activeBCPs,
        draftBCPs,
        approvedBCPs,
        overdueBCPs,
        upcomingTests,
        passedTests,
        failedTests,
        activeIncidents,
        criticalIncidents,
    } = storeToRefs(bcmStore)

    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)

    const currentOrganisationId = computed(
        () => defaultOrgId || userOrganisationId.value
    )

    // ============================================
    // Derived Metrics
    // ============================================
    const totalCriticalFunctions = computed(() => criticalFunctions.value?.length ?? 0)
    const totalBCPs = computed(() => bcps.value?.length ?? 0)
    const totalExerciseTests = computed(() => exerciseTests.value?.length ?? 0)
    const totalRecoveryStrategies = computed(() => recoveryStrategies.value?.length ?? 0)

    const bcpCompletionRate = computed(() => {
        const total = bcps.value?.length ?? 0
        if (total === 0) return 0
        return Math.round(((activeBCPs.value?.length ?? 0) / total) * 100)
    })

    const testPassRate = computed(() => {
        const total = exerciseTests.value?.length ?? 0
        if (total === 0) return 0
        return Math.round(((passedTests.value?.length ?? 0) / total) * 100)
    })

    // ============================================
    // Actions
    // ============================================
    async function loadAll(): Promise<void> {
        await bcmStore.initialize()
    }

    async function refresh(): Promise<void> {
        await loadAll()
    }

    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()
        refreshTimer.value = window.setInterval(() => refresh().catch(console.error), intervalMs)
    }

    function stopAutoRefresh(): void {
        if (refreshTimer.value) {
            clearInterval(refreshTimer.value)
            refreshTimer.value = null
        }
    }

    // ============================================
    // Lifecycle
    // ============================================
    onMounted(async () => {
        if (autoLoad && isAuthenticated.value) {
            await loadAll()
            isInitialLoad.value = false
            if (refreshInterval) startAutoRefresh(refreshInterval)
        }
    })

    watch(isAuthenticated, async (auth) => {
        if (auth) {
            await loadAll()
            if (refreshInterval) startAutoRefresh(refreshInterval)
        } else {
            stopAutoRefresh()
        }
    })

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        criticalFunctions,
        bias,
        bcps,
        bcpTemplates,
        recoveryStrategies,
        exerciseTests,
        incidents,

        // Getters
        functionsByPriority,
        functionsRequiringBCP,
        activeFunctions,
        activeBCPs,
        draftBCPs,
        approvedBCPs,
        overdueBCPs,
        upcomingTests,
        passedTests,
        failedTests,
        activeIncidents,
        criticalIncidents,

        // Derived
        totalCriticalFunctions,
        totalBCPs,
        totalExerciseTests,
        totalRecoveryStrategies,
        bcpCompletionRate,
        testPassRate,

        // Actions
        loadAll,
        refresh,
        startAutoRefresh,
        stopAutoRefresh,

        // Store pass-through actions
        approveBCP: bcmStore.approveBCP,
        archiveBCP: bcmStore.archiveBCP,
        recordTestResult: bcmStore.recordTestResult,
        closeIncident: bcmStore.closeIncident,
        escalateIncident: bcmStore.escalateIncident,

        // Sub-stores
        criticalFunctionStore: bcmStore.criticalFunctionStore,
        biaStore: bcmStore.biaStore,
        bcpStore: bcmStore.bcpStore,
        templateStore: bcmStore.templateStore,
        strategyStore: bcmStore.strategyStore,
        testStore: bcmStore.testStore,
        incidentStore: bcmStore.incidentStore,

        isInitialLoad,
        currentOrganisationId,
    }
}

export default useBcm