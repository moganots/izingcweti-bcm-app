<template>
    <q-card flat bordered class="risk-detail">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    Risk Details
                    <q-badge v-if="risk" :color="getStatusColor(risk.status)" class="q-ml-sm">
                        {{ formatStatus(risk.status) }}
                    </q-badge>
                </div>
                <div class="q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit', risk)" />
                    <q-btn flat round size="sm" icon="close" @click="$emit('close')" />
                </div>
            </div>

            <div v-if="!risk" class="text-center q-py-md text-grey-7">
                Select a risk to view details
            </div>

            <div v-else>
                <!-- Title & Category -->
                <div class="q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">{{ risk.title }}</div>
                    <p v-if="risk.description" class="text-body2 q-mt-sm text-grey-7">
                        {{ risk.description }}
                    </p>
                    <q-badge :color="getCategoryColor(risk.riskCategory || risk.risk_category)" class="q-mt-xs">
                        {{ formatCategory(risk.riskCategory || risk.risk_category) }}
                    </q-badge>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Risk Scores -->
                <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-6">
                        <RiskScoreGauge :score="risk.inherentRiskScore || risk.inherent_risk_score || 0" :max-score="10"
                            label="Inherent Risk" size="120px" />
                    </div>
                    <div class="col-6">
                        <RiskScoreGauge :score="risk.residualRiskScore || risk.residual_risk_score || 0" :max-score="10"
                            label="Residual Risk" size="120px" />
                    </div>
                </div>

                <!-- Likelihood & Impact -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Likelihood</div>
                        <div class="text-body1 text-weight-medium">
                            {{ formatPercentage((risk.inherentLikelihood || risk.inherent_likelihood || 0) * 100) }}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Impact</div>
                        <div class="text-body1 text-weight-medium">
                            {{ risk.impactSeverity || risk.impact_severity || 'N/A' }}
                        </div>
                    </div>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Treatment -->
                <div v-if="risk.treatmentStrategy || risk.treatment_strategy" class="q-mb-md">
                    <div class="text-caption text-grey-6">Treatment Strategy</div>
                    <div class="text-body2">
                        {{ formatTreatment(risk.treatmentStrategy || risk.treatment_strategy) }}
                    </div>
                    <div v-if="risk.treatmentPlan || risk.treatment_plan" class="text-body2 q-mt-xs">
                        {{ risk.treatmentPlan || risk.treatment_plan }}
                    </div>
                </div>

                <!-- Assignee & Dates -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Assigned To</div>
                        <div class="text-body2">{{ risk.assignedTo || risk.assigned_to || 'Unassigned' }}</div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Review Date</div>
                        <div class="text-body2">{{ formatDate(risk.reviewDate || risk.review_date) || 'N/A' }}</div>
                    </div>
                </div>

                <!-- Mitigation Controls -->
                <div v-if="hasControls" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Mitigation Controls</div>
                    <q-list bordered dense>
                        <q-item v-for="control in getControls(risk)" :key="control.controlId || control.control_id">
                            <q-item-section avatar>
                                <q-icon name="shield" color="info" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ control.controlName || control.control_name }}</q-item-label>
                                <q-item-label caption>
                                    Effectiveness: {{ formatPercentage((control.effectiveness || 0) * 100) }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="green" label="Active" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Action History -->
                <div v-if="risk.actionHistory || risk.action_history" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Action History</div>
                    <q-timeline dense>
                        <q-timeline-entry v-for="(action, index) in getActionHistory(risk)" :key="index"
                            :icon="getActionIcon(action.action)" :color="getActionColor(action.action)"
                            :title="action.action" :subtitle="formatDate(action.performedAt || action.performed_at)">
                            <div v-if="action.notes" class="text-caption text-grey-7">
                                {{ action.notes }}
                            </div>
                            <div class="text-caption text-grey-7">
                                By: {{ action.performedBy || action.performed_by }}
                            </div>
                        </q-timeline-entry>
                    </q-timeline>
                </div>

                <!-- Actions -->
                <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-4">
                        <q-btn color="primary" icon="refresh" label="Reassess" class="full-width" outline
                            @click="$emit('reassess', risk)" />
                    </div>
                    <div class="col-4">
                        <q-btn color="info" icon="shield" label="Controls" class="full-width" outline
                            @click="$emit('add-controls', risk)" />
                    </div>
                    <div class="col-4">
                        <q-btn color="negative" icon="delete" label="Delete" class="full-width" outline
                            @click="$emit('delete', risk)" />
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'
import { formatPercentage } from '../../utils/formatters'
import RiskScoreGauge from './RiskScoreGauge.vue'

const props = defineProps<{
    risk?: any
}>()

defineEmits<{
    close: []
    edit: [risk: any]
    reassess: [risk: any]
    'add-controls': [risk: any]
    delete: [risk: any]
}>()

const hasControls = computed(() => {
    const controls = props.risk?.mitigatingControls || props.risk?.mitigating_controls
    return controls && controls.length > 0
})

function formatCategory(category: string): string {
    const labels: Record<string, string> = {
        FINANCIAL: 'Financial',
        OPERATIONAL: 'Operational',
        COMPLIANCE: 'Compliance',
        REPUTATIONAL: 'Reputational',
        STRATEGIC: 'Strategic',
        CYBERSECURITY: 'Cybersecurity',
        NATURAL_DISASTER: 'Natural Disaster',
        TECHNOLOGY_FAILURE: 'Technology Failure',
        HUMAN_ERROR: 'Human Error',
        THIRD_PARTY: 'Third Party',
    }
    return labels[category] || category
}

function formatStatus(status: string): string {
    const labels: Record<string, string> = {
        IDENTIFIED: 'Identified',
        ASSESSING: 'Assessing',
        APPROVED: 'Approved',
        TREATING: 'Treating',
        MONITORING: 'Monitoring',
        CLOSED: 'Closed',
        REJECTED: 'Rejected',
    }
    return labels[status] || status
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        IDENTIFIED: 'grey',
        ASSESSING: 'blue',
        APPROVED: 'green',
        TREATING: 'orange',
        MONITORING: 'primary',
        CLOSED: 'grey-7',
        REJECTED: 'red',
    }
    return colors[status] || 'grey'
}

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        FINANCIAL: 'blue',
        OPERATIONAL: 'orange',
        COMPLIANCE: 'purple',
        REPUTATIONAL: 'red',
        STRATEGIC: 'teal',
        CYBERSECURITY: 'deep-orange',
        NATURAL_DISASTER: 'brown',
        TECHNOLOGY_FAILURE: 'grey',
        HUMAN_ERROR: 'pink',
        THIRD_PARTY: 'indigo',
    }
    return colors[category] || 'grey'
}

function formatTreatment(treatment: string): string {
    const labels: Record<string, string> = {
        AVOID: 'Avoid',
        MITIGATE: 'Mitigate',
        TRANSFER: 'Transfer',
        ACCEPT: 'Accept',
        EXPLOIT: 'Exploit',
    }
    return labels[treatment] || treatment
}

function getControls(risk: any): any[] {
    return risk.mitigatingControls || risk.mitigating_controls || []
}

function getActionHistory(risk: any): any[] {
    return risk.actionHistory || risk.action_history || []
}

function getActionIcon(action: string): string {
    const icons: Record<string, string> = {
        CREATE: 'add_circle',
        UPDATE: 'edit',
        ASSESS: 'assessment',
        APPROVE: 'check_circle',
        REJECT: 'cancel',
        CLOSE: 'check',
        REASSESS: 'refresh',
    }
    return icons[action] || 'circle'
}

function getActionColor(action: string): string {
    const colors: Record<string, string> = {
        CREATE: 'green',
        UPDATE: 'blue',
        ASSESS: 'orange',
        APPROVE: 'green',
        REJECT: 'red',
        CLOSE: 'grey',
        REASSESS: 'purple',
    }
    return colors[action] || 'grey'
}
</script>