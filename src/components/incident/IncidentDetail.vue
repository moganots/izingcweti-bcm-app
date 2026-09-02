<template>
    <q-card flat bordered class="incident-detail">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    Incident Details
                    <q-badge v-if="incident" :color="isClosed ? 'green' : 'orange'" class="q-ml-sm">
                        {{ isClosed ? 'Closed' : 'Active' }}
                    </q-badge>
                </div>
                <div class="q-gutter-sm">
                    <q-btn v-if="!isClosed" flat color="primary" icon="edit" label="Edit"
                        @click="$emit('edit', incident)" />
                    <q-btn flat round size="sm" icon="close" @click="$emit('close', incident)">
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </div>
            </div>

            <div v-if="!incident" class="text-center q-py-md text-grey-7">
                Select an incident to view details
            </div>

            <div v-else>
                <!-- Header -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Severity</div>
                        <IncidentSeverityBadge :severity="incident.incidentSeverity || incident.incident_severity" />
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Status</div>
                        <IncidentStatusBadge :incident="incident" />
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Escalation Level</div>
                        <q-badge :color="getEscalationColor(incident.escalationLevel || incident.escalation_level)">
                            {{ formatEscalationLevel(incident.escalationLevel || incident.escalation_level) }}
                        </q-badge>
                    </div>
                </div>

                <!-- Title & Root Cause -->
                <div class="q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">
                        {{ incident.incidentTitle || incident.incident_title || incident.root_cause }}
                    </div>
                    <p class="text-body2 q-mt-sm">
                        <strong>Root Cause:</strong> {{ incident.rootCause || incident.root_cause }}
                    </p>
                </div>

                <q-separator class="q-mb-md" />

                <!-- BCP & Recovery -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Activated BCP</div>
                        <div class="text-body2">
                            {{ incident.businessContinuityPlan?.criticalFunction?.name ||
                                incident.business_continuity_plan?.critical_function?.name ||
                                'N/A' }}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Recovery Time</div>
                        <div class="text-body2">{{ incident.recoveryActualTime || incident.recovery_actual_time || 'N/A'
                        }}</div>
                    </div>
                </div>

                <!-- Dates -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Declared At</div>
                        <div class="text-body2">{{ formatDate(incident.declaredAt || incident.declared_at) }}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Closed At</div>
                        <div class="text-body2">{{ formatDate(incident.closedAt || incident.closed_at) || 'Not closed'
                        }}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Resolution Time</div>
                        <div class="text-body2">{{ getResolutionTime(incident) }}</div>
                    </div>
                </div>

                <!-- Resolution Notes -->
                <div v-if="incident.resolutionNotes || incident.resolution_notes" class="q-mb-md">
                    <div class="text-caption text-grey-6">Resolution Notes</div>
                    <p class="text-body2">{{ incident.resolutionNotes || incident.resolution_notes }}</p>
                </div>

                <!-- Escalation History -->
                <div v-if="incident.escalationHistory || incident.escalation_history" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Escalation History</div>
                    <q-list bordered dense>
                        <q-item v-for="(entry, index) in getEscalationHistory(incident)" :key="index">
                            <q-item-section avatar>
                                <q-icon name="arrow_upward" color="orange" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ formatEscalationLevel(entry.toLevel || entry.to_level)
                                }}</q-item-label>
                                <q-item-label caption>
                                    {{ formatDate(entry.escalatedAt || entry.escalated_at) }} by {{ entry.escalatedBy ||
                                        entry.escalated_by }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="orange" label="Escalated" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Actions -->
                <div v-if="!isClosed" class="row q-col-gutter-md q-mt-md">
                    <div class="col-4">
                        <q-btn color="primary" icon="edit" label="Update" class="full-width" outline
                            @click="$emit('update', incident)" />
                    </div>
                    <div class="col-4">
                        <q-btn color="orange" icon="arrow_upward" label="Escalate" class="full-width" outline
                            @click="$emit('escalate', incident)" />
                    </div>
                    <div class="col-4">
                        <q-btn color="green" icon="check" label="Close" class="full-width" unelevated
                            @click="$emit('close', incident)" />
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'
import IncidentSeverityBadge from './IncidentSeverityBadge.vue'
import IncidentStatusBadge from './IncidentStatusBadge.vue'
import {
    getEscalationLevelLabel,
    getEscalationLevelColor,
} from './../../models/entities/incident/incident.entity'

const props = defineProps<{
    incident?: any
}>()

defineEmits<{
    close: [incident: any]
    edit: [incident: any]
    update: [incident: any]
    escalate: [incident: any]
}>()

const isClosed = computed(() => {
    return !!(props.incident?.closedAt || props.incident?.closed_at)
})

function formatEscalationLevel(level: string): string {
    return getEscalationLevelLabel(level)
}

function getEscalationColor(level: string): string {
    return getEscalationLevelColor(level)
}

function getEscalationHistory(incident: any): any[] {
    return incident.escalationHistory || incident.escalation_history || []
}

function getResolutionTime(incident: any): string {
    if (!incident) return 'N/A'
    const declared = incident.declaredAt || incident.declared_at
    const closed = incident.closedAt || incident.closed_at
    if (!declared || !closed) return 'N/A'

    const start = new Date(declared)
    const end = new Date(closed)
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}
</script>