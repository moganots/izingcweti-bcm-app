<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Compliance Overview</div>
                <q-btn flat round dense icon="refresh" size="sm" @click="$emit('refresh')">
                    <q-tooltip>Refresh Stats</q-tooltip>
                </q-btn>
            </div>

            <!-- Stats Grid -->
            <div class="row q-col-gutter-sm">
                <div class="col-6" v-for="stat in stats" :key="stat.label">
                    <q-card flat bordered :class="'bg-' + stat.color + '-1'">
                        <q-card-section class="text-center q-py-sm">
                            <q-icon :name="stat.icon" :color="stat.color" size="20px" class="q-mb-xs" />
                            <div class="text-h6" :class="'text-' + stat.color">{{ stat.value }}</div>
                            <div class="text-caption text-grey-7">{{ stat.label }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Compliance Rate -->
            <div class="q-mt-md">
                <div class="row items-center justify-between q-mb-sm">
                    <span class="text-body2">Overall Compliance Rate</span>
                    <span class="text-caption text-grey-7">{{ complianceRate }}%</span>
                </div>
                <q-linear-progress :value="complianceRate / 100" :color="complianceRateColor" size="20px" rounded />
            </div>

            <!-- Status Breakdown -->
            <div class="q-mt-md">
                <div class="text-body2 q-mb-sm">Status Breakdown</div>
                <div class="row q-gutter-xs">
                    <div class="col" v-for="(count, status) in statusBreakdown" :key="status">
                        <q-badge :color="getStatusColor(status)" :label="getStatusLabel(status)"
                            class="full-width text-center q-py-sm">
                            <div class="text-h6">{{ count }}</div>
                        </q-badge>
                    </div>
                </div>
            </div>

            <!-- Standard Breakdown -->
            <div class="q-mt-md">
                <div class="text-body2 q-mb-sm">By Standard</div>
                <div v-for="(item, standard) in standardBreakdown" :key="standard" class="q-mb-xs">
                    <div class="row items-center justify-between">
                        <span class="text-caption">{{ formatStandardLabel(standard) }}</span>
                        <span class="text-caption text-grey-7">{{ item.compliant }}/{{ item.total }}</span>
                    </div>
                    <q-linear-progress :value="item.rate" :color="getStandardColor(standard)" size="8px" rounded />
                </div>
            </div>

            <div class="text-caption text-grey-7 text-center q-mt-sm">
                Last updated: {{ lastUpdatedText }}
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'

const props = withDefaults(
    defineProps<{
        stats?: {
            total: number
            compliant: number
            partiallyCompliant: number
            nonCompliant: number
            notAssessed: number
            complianceRate: number
            overdueAudits: number
            upcomingAudits: number
            byStandard: Record<string, { total: number; compliant: number; rate: number }>
            byStatus: Record<string, number>
        }
        lastUpdated?: string | null
    }>(),
    {
        stats: () => ({
            total: 0,
            compliant: 0,
            partiallyCompliant: 0,
            nonCompliant: 0,
            notAssessed: 0,
            complianceRate: 0,
            overdueAudits: 0,
            upcomingAudits: 0,
            byStandard: {},
            byStatus: {},
        }),
        lastUpdated: null,
    }
)

defineEmits<{ refresh: [] }>()

const stats = computed(() => [
    { label: 'Total', value: props.stats.total, icon: 'verified_user', color: 'primary' },
    { label: 'Compliant', value: props.stats.compliant, icon: 'check_circle', color: 'green' },
    { label: 'Partially', value: props.stats.partiallyCompliant, icon: 'warning', color: 'orange' },
    { label: 'Non-Compliant', value: props.stats.nonCompliant, icon: 'error', color: 'red' },
])

const complianceRate = computed(() => props.stats.complianceRate || 0)

const complianceRateColor = computed(() => {
    const rate = complianceRate.value
    if (rate >= 80) return 'green'
    if (rate >= 60) return 'orange'
    return 'red'
})

const statusBreakdown = computed(() => props.stats.byStatus || {})

const standardBreakdown = computed(() => props.stats.byStandard || {})

const lastUpdatedText = computed(() => {
    if (!props.lastUpdated) return 'Never'
    return formatTimeAgo(props.lastUpdated)
})

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        COMPLIANT: 'green',
        PARTIALLY_COMPLIANT: 'orange',
        NON_COMPLIANT: 'red',
        NOT_ASSESSED: 'grey',
    }
    return colors[status] || 'grey'
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        COMPLIANT: 'Compliant',
        PARTIALLY_COMPLIANT: 'Partially',
        NON_COMPLIANT: 'Non-Compliant',
        NOT_ASSESSED: 'Not Assessed',
    }
    return labels[status] || status
}

function formatStandardLabel(standard: string): string {
    const labels: Record<string, string> = {
        ISO22301: 'ISO 22301',
        NIST800_34: 'NIST 800-34',
        FFIEC: 'FFIEC',
        COBIT2019: 'COBIT 2019',
        SOC2: 'SOC 2',
        GDPR: 'GDPR',
        HIPAA: 'HIPAA',
        PCI_DSS: 'PCI DSS',
    }
    return labels[standard] || standard
}

function getStandardColor(standard: string): string {
    const colors: Record<string, string> = {
        ISO22301: 'blue',
        NIST800_34: 'green',
        FFIEC: 'orange',
        COBIT2019: 'purple',
        SOC2: 'teal',
        GDPR: 'indigo',
        HIPAA: 'red',
        PCI_DSS: 'yellow',
    }
    return colors[standard] || 'grey'
}
</script>