<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">
                Attestations
                <q-badge v-if="pendingCount > 0" color="orange" class="q-ml-sm">{{ pendingCount }}</q-badge>
            </div>

            <div v-if="loading" class="text-center q-py-lg">
                <q-spinner-dots size="40px" color="primary" />
            </div>

            <div v-else-if="attestations.length === 0" class="text-center q-py-lg text-grey-7">
                <q-icon name="assignment" size="48px" color="grey-4" class="q-mb-sm" />
                <div>No attestations</div>
            </div>

            <q-list v-else separator>
                <q-item v-for="attestation in attestations" :key="attestation.uuid">
                    <q-item-section avatar>
                        <q-icon :name="getStatusIcon(attestation.status)" :color="getStatusColor(attestation.status)"
                            size="22px" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ attestation.document?.title || 'Untitled' }}</q-item-label>
                        <q-item-label caption>
                            Due: {{ formatDate(attestation.dueDate) }}
                            <span v-if="attestation.acknowledgedAt" class="q-ml-sm">
                                • Acknowledged: {{ formatTimeAgo(attestation.acknowledgedAt) }}
                            </span>
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-badge :color="getStatusColor(attestation.status)"
                            :label="getStatusLabel(attestation.status)" />
                    </q-item-section>
                    <q-item-section side v-if="attestation.status === AttestationStatus.PENDING">
                        <q-btn flat color="primary" icon="check" label="Acknowledge" size="sm" :loading="acknowledging"
                            @click="$emit('acknowledge', attestation)" />
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserAttestation } from 'src/models/entities/training/training.entity'
import {
    getAttestationStatusLabel,
    getAttestationStatusColor,
    AttestationStatus
} from 'src/models/entities/training/training.entity'
import { formatDate, formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
const props = withDefaults(
    defineProps<{
        attestations: UserAttestation[]
        loading?: boolean
        acknowledging?: boolean
    }>(),
    {
        attestations: () => [],
        loading: false,
        acknowledging: false,
    }
)

// ============================================
// Emits
// ============================================
defineEmits<{
    acknowledge: [attestation: UserAttestation]
}>()

// ============================================
// Computed
// ============================================
const pendingCount = computed(() =>
    props.attestations.filter(a => a.status === AttestationStatus.PENDING).length
)

// ============================================
// Methods
// ============================================
function getStatusLabel(status: AttestationStatus): string {
    return getAttestationStatusLabel(status)
}

function getStatusColor(status: AttestationStatus): string {
    return getAttestationStatusColor(status)
}

function getStatusIcon(status: AttestationStatus): string {
    const icons: Record<string, string> = {
        PENDING: 'pending',
        ACKNOWLEDGED: 'check_circle',
        EXPIRED: 'schedule',
        OVERDUE: 'warning',
    }
    return icons[status] || 'help'
}
</script>