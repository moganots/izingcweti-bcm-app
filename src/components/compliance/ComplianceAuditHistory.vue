<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Audit History</div>
                <q-btn color="primary" icon="add" label="Schedule Audit" unelevated @click="$emit('schedule')" />
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center q-pa-md">
                <q-spinner-dots size="30px" color="primary" />
            </div>

            <!-- Empty -->
            <div v-else-if="!audits || audits.length === 0" class="text-center q-py-md text-grey-7">
                <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
                <div>No audit history available</div>
            </div>

            <!-- List -->
            <q-list v-else separator>
                <q-item v-for="audit in audits" :key="audit.id">
                    <q-item-section avatar>
                        <q-icon :name="getAuditIcon(audit.status)" :color="getAuditColor(audit.status)" size="24px" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label class="text-weight-medium">{{ audit.title }}</q-item-label>
                        <q-item-label caption>
                            {{ formatDate(audit.date) }}
                            <span v-if="audit.auditor" class="q-ml-sm">| Auditor: {{ audit.auditor }}</span>
                        </q-item-label>
                        <q-item-label caption v-if="audit.description">
                            {{ audit.description }}
                        </q-item-label>
                        <q-item-label caption v-if="audit.findings" class="text-red-8">
                            Findings: {{ audit.findings }}
                        </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <q-badge :color="getAuditBadgeColor(audit.status)" :label="audit.status"
                            class="q-px-sm q-py-xs" />
                    </q-item-section>

                    <q-item-section side>
                        <q-btn flat round size="sm" icon="more_vert">
                            <q-menu>
                                <q-list dense>
                                    <q-item clickable v-close-popup @click="$emit('view', audit)">
                                        <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                                        <q-item-section>View Details</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="$emit('edit', audit)">
                                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                        <q-item-section>Edit</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="$emit('delete', audit)">
                                        <q-item-section avatar><q-icon name="delete"
                                                color="negative" /></q-item-section>
                                        <q-item-section class="text-negative">Delete</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Load More -->
            <div v-if="hasMore" class="text-center q-mt-md">
                <q-btn outline color="primary" label="Load More" :loading="loadingMore" @click="$emit('load-more')" />
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{
    audits?: any[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
}>()

defineEmits<{
    schedule: []
    view: [audit: any]
    edit: [audit: any]
    delete: [audit: any]
    'load-more': []
}>()

function getAuditIcon(status: string): string {
    const icons: Record<string, string> = {
        COMPLETED: 'check_circle',
        IN_PROGRESS: 'hourglass_top',
        SCHEDULED: 'event',
        FAILED: 'error',
    }
    return icons[status] || 'circle'
}

function getAuditColor(status: string): string {
    const colors: Record<string, string> = {
        COMPLETED: 'green',
        IN_PROGRESS: 'orange',
        SCHEDULED: 'blue',
        FAILED: 'red',
    }
    return colors[status] || 'grey'
}

function getAuditBadgeColor(status: string): string {
    const colors: Record<string, string> = {
        COMPLETED: 'positive',
        IN_PROGRESS: 'warning',
        SCHEDULED: 'info',
        FAILED: 'negative',
    }
    return colors[status] || 'grey'
}
</script>