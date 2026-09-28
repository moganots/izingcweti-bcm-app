import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRiskStore } from '../stores/risk/risk.store'
import { useAuth } from './useAuth'
import { RiskStatus } from '../models/risk/risk.entity'

/**
 * Risk composable
 * Aligned with useRiskStore
 */
export function useRisk() {
    const store = useRiskStore()
    const auth = useAuth()

    const { isAuthenticated, isAdmin, userId, userOrganisationId } = auth

    const {
        risks,
        selectedRisk,
        isLoading,
        isSaving,
        error,
        criticalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        openRisks,
        closedRisks,
        pendingApprovalRisks,
        overdueReviewRisks,
        myAssignedRisks,
        risksByCategory,
        averageInherentScore,
        averageResidualScore,
        riskReduction,
        riskReductionPercentage,
        riskMatrix,
    } = storeToRefs(store)

    function useRisks() {
        const canFetch = computed(() => isAuthenticated.value)

        return {
            risks,
            selectedRisk,
            isLoading,
            isSaving,
            error,
            criticalRisks,
            highRisks,
            mediumRisks,
            lowRisks,
            openRisks,
            closedRisks,
            pendingApprovalRisks,
            overdueReviewRisks,
            myAssignedRisks,
            risksByCategory,
            averageInherentScore,
            averageResidualScore,
            riskReduction,
            riskReductionPercentage,
            riskMatrix,
            canFetch,
        }
    }

    function useRiskStats() {
        return {
            risks,
            criticalRisks,
            highRisks,
            mediumRisks,
            lowRisks,
            openRisks,
            closedRisks,
            averageInherentScore,
            averageResidualScore,
            riskReduction,
            riskReductionPercentage,
            riskMatrix,
        }
    }

    function useMyRisks() {
        const canFetch = computed(() => isAuthenticated.value)
        return {
            myAssignedRisks,
            overdueReviewRisks,
            isLoading,
            error,
            canFetch,
        }
    }

    return {
        store,
        isAuthenticated,
        isAdmin,
        userId,
        userOrganisationId,

        useRisks,
        useRiskStats,
        useMyRisks,

        // Pass-through actions
        initialize: store.initialize,
        assessRisk: store.assessRisk,
        approveRisk: store.approveRisk,
        assignRisk: store.assignRisk,
        closeRisk: store.closeRisk,
        addControl: store.addControl,

        RiskStatus,
    }
}

export default useRisk