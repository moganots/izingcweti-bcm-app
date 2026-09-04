<template>
    <q-page padding>
        <PageHeader :title="$t('governance.dashboard.title')" :subtitle="$t('governance.dashboard.subtitle')"
            show-refresh @refresh="refreshData">
            <template #actions>
                <q-btn color="primary" icon="add" :label="$t('governance.dashboard.new_policy')" unelevated
                    @click="showCreatePolicyDialog = true" />
            </template>
        </PageHeader>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-grey-7 q-mt-md">{{ $t('common.loading') }}</div>
        </div>

        <template v-else>
            <!-- Stats Cards -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-primary-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-primary">{{ metrics?.policyStats?.active || 0 }}</div>
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.active_policies') }}</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-orange-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-orange">{{ complianceOverview?.dueReviews || 0 }}</div>
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.due_reviews') }}</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-green-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-green">{{ Math.round(complianceRate) }}%</div>
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.compliance_rate') }}</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-purple-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-purple">{{ latestMaturityScore }}</div>
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.maturity_score') }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Governance Health -->
            <q-card flat bordered class="q-mb-md">
                <q-card-section>
                    <div class="text-h6 q-mb-sm">{{ $t('governance.dashboard.health') }}</div>
                    <div class="row items-center q-gutter-md">
                        <q-chip :color="healthColor" text-color="white" :label="healthLabel" size="lg" />
                        <div class="text-caption text-grey-7">
                            {{ $t('governance.dashboard.health_description') }}
                        </div>
                    </div>
                    <div class="row q-col-gutter-md q-mt-md">
                        <div class="col-6 col-md-3">
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.compliance') }}</div>
                            <div class="text-body1 text-weight-bold">{{ governanceHealth?.complianceRate || 0 }}%</div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.coverage') }}</div>
                            <div class="text-body1 text-weight-bold">{{ governanceHealth?.policyCoverage || 0 }}%</div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.maturity') }}</div>
                            <div class="text-body1 text-weight-bold">{{ governanceHealth?.maturityScore || 0 }}</div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="text-caption text-grey-7">{{ $t('governance.dashboard.issues') }}</div>
                            <div class="text-body1 text-weight-bold">{{ governanceHealth?.issuesCount || 0 }}</div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Recent Activities -->
            <q-card flat bordered>
                <q-card-section>
                    <div class="row items-center justify-between q-mb-md">
                        <div class="text-h6">{{ $t('governance.dashboard.recent_activities') }}</div>
                    </div>

                    <div v-if="recentActivities.length === 0" class="text-center q-py-md text-grey-7">
                        {{ $t('governance.dashboard.no_activities') }}
                    </div>

                    <q-list v-else separator>
                        <q-item v-for="activity in recentActivities" :key="activity.uuid">
                            <q-item-section avatar>
                                <q-icon :name="getActivityIcon(activity.action)"
                                    :color="getActivityColor(activity.action)" size="22px" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ getActivityLabel(activity.action) }}</q-item-label>
                                <q-item-label caption>
                                    {{ formatTimeAgo(activity.createdAt) }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="grey-5" :label="activity.targetType || 'general'" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </template>

        <!-- Create Policy Dialog -->
        <q-dialog v-model="showCreatePolicyDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <PolicyForm :loading="submitting" :error="error" @submit="handleCreatePolicy"
                    @cancel="showCreatePolicyDialog = false" />
            </div>
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useGovernance } from 'src/composables/useGovernance'
import { PageHeader } from 'src/components/.common'
import { PolicyForm } from 'src/components/governance'
import { formatTimeAgo } from 'src/utils/date.utils'
import type { ActivityAction } from 'src/models/entities/governance/governance.entity'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const { t } = useI18n()
const {
    metrics,
    complianceOverview,
    governanceHealth,
    recentActivities,
    complianceRate,
    latestMaturityScore,
    loadAllData,
    createPolicy,
    refreshData,
    error,
} = useGovernance()

// ============================================
// State
// ============================================
const loading = ref(true)
const submitting = ref(false)
const showCreatePolicyDialog = ref(false)

// ============================================
// Computed
// ============================================
const healthLabel = computed(() => {
    const health = governanceHealth.value?.overallHealth || 'healthy'
    const labels: Record<string, string> = {
        healthy: t('governance.health.healthy'),
        warning: t('governance.health.warning'),
        critical: t('governance.health.critical'),
    }
    return labels[health] || health
})

const healthColor = computed(() => {
    const health = governanceHealth.value?.overallHealth || 'healthy'
    const colors: Record<string, string> = {
        healthy: 'positive',
        warning: 'orange',
        critical: 'negative',
    }
    return colors[health] || 'grey'
})

// ============================================
// Methods
// ============================================
async function handleCreatePolicy(data: any): Promise<void> {
    submitting.value = true
    try {
        await createPolicy(data)
        showCreatePolicyDialog.value = false
        $q.notify({
            type: 'positive',
            message: t('governance.notifications.policy_created'),
            position: 'top',
        })
        await refreshData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || t('governance.notifications.create_failed'),
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

function getActivityIcon(action: ActivityAction): string {
    const icons: Record<string, string> = {
        POLICY_CREATED: 'add_circle',
        POLICY_UPDATED: 'edit',
        POLICY_ACTIVATED: 'check_circle',
        POLICY_DEACTIVATED: 'pause_circle',
        ASSESSMENT_CREATED: 'trending_up',
        ASSESSMENT_UPDATED: 'edit',
        MATURITY_LEVEL_CHANGED: 'upgrade',
        COMPLIANCE_CHECK: 'gavel',
        AUDIT_COMPLETED: 'verified',
    }
    return icons[action] || 'notifications'
}

function getActivityColor(action: ActivityAction): string {
    const colors: Record<string, string> = {
        POLICY_CREATED: 'green',
        POLICY_UPDATED: 'blue',
        POLICY_ACTIVATED: 'positive',
        POLICY_DEACTIVATED: 'orange',
        ASSESSMENT_CREATED: 'purple',
        ASSESSMENT_UPDATED: 'info',
        MATURITY_LEVEL_CHANGED: 'deep-purple',
        COMPLIANCE_CHECK: 'teal',
        AUDIT_COMPLETED: 'green',
    }
    return colors[action] || 'grey'
}

function getActivityLabel(action: ActivityAction): string {
    const labels: Record<string, string> = {
        POLICY_CREATED: t('governance.activities.policy_created'),
        POLICY_UPDATED: t('governance.activities.policy_updated'),
        POLICY_ACTIVATED: t('governance.activities.policy_activated'),
        POLICY_DEACTIVATED: t('governance.activities.policy_deactivated'),
        ASSESSMENT_CREATED: t('governance.activities.assessment_created'),
        ASSESSMENT_UPDATED: t('governance.activities.assessment_updated'),
        MATURITY_LEVEL_CHANGED: t('governance.activities.maturity_changed'),
        COMPLIANCE_CHECK: t('governance.activities.compliance_check'),
        AUDIT_COMPLETED: t('governance.activities.audit_completed'),
    }
    return labels[action] || action
}

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
    loading.value = true
    try {
        await loadAllData()
    } catch (err) {
        console.error('Failed to load governance data:', err)
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
.text-h4 {
    font-size: 1.75rem;

    @media (max-width: 400px) {
        font-size: 1.25rem;
    }
}

.text-h6 {
    font-size: 1.125rem;

    @media (max-width: 400px) {
        font-size: 1rem;
    }
}
</style>