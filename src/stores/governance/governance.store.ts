import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    GovernancePolicy,
    MaturityAssessment,
    GovernanceActivity,
} from '../../models/governance/governance.entity'
import { PolicyStatus } from '../../models/governance/governance.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'

export const useGovernancePolicyStore = createOfflineCrudStore<GovernancePolicy>({
    storeId: 'governance-policies',
    tableName: 'governancePolicies',
})

export const useMaturityAssessmentStore = createOfflineCrudStore<MaturityAssessment>({
    storeId: 'maturity-assessments',
    tableName: 'maturityAssessments',
})

export const useGovernanceActivityStore = createOfflineCrudStore<GovernanceActivity>({
    storeId: 'governance-activities',
    tableName: 'governanceActivities',
})

export const useGovernanceStore = defineStore('governance', () => {
    const policyStore = useGovernancePolicyStore()
    const maturityStore = useMaturityAssessmentStore()
    const activityStore = useGovernanceActivityStore()

    const isSaving = ref(false)

    const policies = policyStore.items
    const maturityAssessments = maturityStore.items
    const activities = activityStore.items

    // ============================================
    // Getters
    // ============================================
    const activePolicies = computed(() =>
        policies?.filter((p) => p.status === PolicyStatus.ACTIVE)
    )

    const draftPolicies = computed(() =>
        policies?.filter((p) => p.status === PolicyStatus.DRAFT)
    )

    const archivedPolicies = computed(() =>
        policies?.filter((p) => p.status === PolicyStatus.ARCHIVED)
    )

    const averageMaturityScore = computed(() => {
        if (maturityAssessments?.length === 0) return 0
        const sum = maturityAssessments?.reduce((acc, m) => acc + m.score, 0)
        return Math.round((sum / maturityAssessments?.length) * 10) / 10
    })

    const latestMaturityScore = computed(() => {
        if (maturityAssessments?.length === 0) return 0
        const sorted = [...maturityAssessments].sort(
            (a, b) => new Date(b.assessedDate).getTime() - new Date(a.assessedDate).getTime()
        )
        return sorted[0]?.score || 0
    })

    const latestMaturityLevel = computed(() => {
        if (maturityAssessments?.length === 0) return null
        const sorted = [...maturityAssessments].sort(
            (a, b) => new Date(b.assessedDate).getTime() - new Date(a.assessedDate).getTime()
        )
        return sorted[0]?.level || null
    })

    const recentActivities = computed(() =>
        [...activities]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
    )

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        await Promise.all([
            policyStore.initialize(),
            maturityStore.initialize(),
            activityStore.initialize(),
        ])
    }

    async function activatePolicy(id: string): Promise<GovernancePolicy | null> {
        return policyStore.update(id, { status: PolicyStatus.ACTIVE } as Partial<GovernancePolicy>)
    }

    async function deactivatePolicy(id: string): Promise<GovernancePolicy | null> {
        return policyStore.update(id, { status: PolicyStatus.INACTIVE } as Partial<GovernancePolicy>)
    }

    async function logActivity(data: Partial<GovernanceActivity>): Promise<GovernanceActivity | null> {
        return activityStore.create(data)
    }

    return {
        // State
        policies,
        maturityAssessments,
        activities,
        isLoading: policyStore.loading,
        isSaving,
        error: policyStore.error,

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
        activatePolicy,
        deactivatePolicy,
        logActivity,

        // Sub-stores
        policyStore,
        maturityStore,
        activityStore,
    }
})