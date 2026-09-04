<!-- components/governance/ActivityTimeline.vue -->
<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Activity Timeline</div>
                <q-btn flat round dense icon="refresh" :loading="loading" @click="$emit('refresh')" />
            </div>

            <div v-if="loading" class="text-center q-py-lg">
                <q-spinner-dots size="40px" color="primary" />
            </div>

            <div v-else-if="activities.length === 0" class="text-center q-py-lg text-grey-7">
                <q-icon name="history" size="48px" color="grey-4" class="q-mb-sm" />
                <div>No activities recorded</div>
            </div>

            <q-timeline v-else color="primary" :layout="timelineLayout">
                <q-timeline-entry v-for="activity in displayedActivities" :key="activity.uuid"
                    :icon="getActivityIcon(activity.action)" :color="getActivityColor(activity.action)"
                    :title="formatTitle(activity)" :subtitle="formatTimeAgo(activity.createdAt)">
                    <div class="text-caption text-grey-7 q-mb-xs">
                        {{ formatDescription(activity) }}
                    </div>
                    <div v-if="activity.details" class="activity-details">
                        <pre v-if="typeof activity.details === 'object'" class="details-preview">
              {{ JSON.stringify(activity.details, null, 2) }}
            </pre>
                        <span v-else class="text-caption">{{ activity.details }}</span>
                    </div>
                </q-timeline-entry>
            </q-timeline>

            <!-- Load More -->
            <div v-if="hasMore" class="text-center q-mt-md">
                <q-btn flat color="primary" label="Load More" :loading="loadingMore" @click="$emit('load-more')" />
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GovernanceActivity, ActivityAction } from 'src/models/entities/governance/governance.entity'
import { formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
const props = withDefaults(
    defineProps<{
        activities: GovernanceActivity[]
        loading?: boolean
        loadingMore?: boolean
        hasMore?: boolean
        limit?: number
    }>(),
    {
        activities: () => [],
        loading: false,
        loadingMore: false,
        hasMore: false,
        limit: 10,
    }
)

// ============================================
// Emits
// ============================================
defineEmits<{
    refresh: []
    'load-more': []
}>()

// ============================================
// Computed
// ============================================
const displayedActivities = computed(() => {
    return props.activities.slice(0, props.limit)
})

const timelineLayout = computed(() => {
    return window.innerWidth < 600 ? 'dense' : 'comfortable'
})

// ============================================
// Methods
// ============================================
function getActivityIcon(action: ActivityAction): string {
    const icons: Record<string, string> = {
        POLICY_CREATED: 'add_circle',
        POLICY_UPDATED: 'edit',
        POLICY_ACTIVATED: 'check_circle',
        POLICY_DEACTIVATED: 'pause_circle',
        POLICY_ARCHIVED: 'archive',
        POLICY_REVIEWED: 'visibility',
        POLICY_APPROVED: 'thumb_up',
        POLICY_REJECTED: 'thumb_down',
        ASSESSMENT_CREATED: 'trending_up',
        ASSESSMENT_UPDATED: 'edit',
        ASSESSMENT_DELETED: 'delete',
        MATURITY_LEVEL_CHANGED: 'upgrade',
        COMPLIANCE_CHECK: 'gavel',
        AUDIT_COMPLETED: 'verified',
        REVIEW_COMPLETED: 'done_all',
        USER_LOGGED_IN: 'login',
        USER_LOGGED_OUT: 'logout',
        USER_CREATED: 'person_add',
        USER_UPDATED: 'person',
        USER_DELETED: 'person_remove',
        PERMISSION_CHANGED: 'security',
        SETTINGS_CHANGED: 'settings',
        SYSTEM_CONFIGURED: 'build',
        EXPORT_COMPLETED: 'download',
        REPORT_GENERATED: 'picture_as_pdf',
        IMPORT_COMPLETED: 'upload_file',
        WORKFLOW_TRIGGERED: 'account_tree',
        NOTIFICATION_SENT: 'notifications',
        SYNC_COMPLETED: 'sync',
        BACKUP_CREATED: 'backup',
        RESTORE_COMPLETED: 'restore',
    }
    return icons[action] || 'notifications'
}

function getActivityColor(action: ActivityAction): string {
    const colors: Record<string, string> = {
        POLICY_CREATED: 'green',
        POLICY_UPDATED: 'blue',
        POLICY_ACTIVATED: 'positive',
        POLICY_DEACTIVATED: 'orange',
        POLICY_ARCHIVED: 'grey',
        POLICY_REVIEWED: 'info',
        POLICY_APPROVED: 'positive',
        POLICY_REJECTED: 'negative',
        ASSESSMENT_CREATED: 'purple',
        ASSESSMENT_UPDATED: 'info',
        ASSESSMENT_DELETED: 'negative',
        MATURITY_LEVEL_CHANGED: 'deep-purple',
        COMPLIANCE_CHECK: 'teal',
        AUDIT_COMPLETED: 'green',
        REVIEW_COMPLETED: 'positive',
        USER_LOGGED_IN: 'blue',
        USER_LOGGED_OUT: 'grey',
        USER_CREATED: 'positive',
        USER_UPDATED: 'info',
        USER_DELETED: 'negative',
        PERMISSION_CHANGED: 'orange',
        SETTINGS_CHANGED: 'grey',
        SYSTEM_CONFIGURED: 'blue',
        EXPORT_COMPLETED: 'primary',
        REPORT_GENERATED: 'primary',
        IMPORT_COMPLETED: 'positive',
        WORKFLOW_TRIGGERED: 'purple',
        NOTIFICATION_SENT: 'info',
        SYNC_COMPLETED: 'positive',
        BACKUP_CREATED: 'grey',
        RESTORE_COMPLETED: 'positive',
    }
    return colors[action] || 'grey'
}

function formatTitle(activity: GovernanceActivity): string {
    const actionMap: Record<string, string> = {
        POLICY_CREATED: 'Policy Created',
        POLICY_UPDATED: 'Policy Updated',
        POLICY_ACTIVATED: 'Policy Activated',
        POLICY_DEACTIVATED: 'Policy Deactivated',
        ASSESSMENT_CREATED: 'Assessment Created',
        ASSESSMENT_UPDATED: 'Assessment Updated',
        MATURITY_LEVEL_CHANGED: 'Maturity Level Changed',
        COMPLIANCE_CHECK: 'Compliance Check',
        AUDIT_COMPLETED: 'Audit Completed',
        USER_LOGGED_IN: 'User Logged In',
        USER_LOGGED_OUT: 'User Logged Out',
        USER_CREATED: 'User Created',
        USER_UPDATED: 'User Updated',
        USER_DELETED: 'User Deleted',
        PERMISSION_CHANGED: 'Permission Changed',
        SETTINGS_CHANGED: 'Settings Changed',
        SYSTEM_CONFIGURED: 'System Configured',
        EXPORT_COMPLETED: 'Export Completed',
        REPORT_GENERATED: 'Report Generated',
        IMPORT_COMPLETED: 'Import Completed',
        WORKFLOW_TRIGGERED: 'Workflow Triggered',
        NOTIFICATION_SENT: 'Notification Sent',
        SYNC_COMPLETED: 'Sync Completed',
        BACKUP_CREATED: 'Backup Created',
        RESTORE_COMPLETED: 'Restore Completed',
    }
    return actionMap[activity.action] || activity.action
}

function formatDescription(activity: GovernanceActivity): string {
    const parts = []
    if (activity.targetType) {
        parts.push(`Target: ${activity.targetType}`)
        if (activity.targetId) {
            parts.push(`ID: ${activity.targetId.substring(0, 8)}`)
        }
    }
    return parts.join(' | ') || 'No additional details'
}
</script>

<style lang="scss" scoped>
.activity-details {
    margin-top: 4px;
}

.details-preview {
    font-size: 11px;
    background: var(--bg-page);
    padding: 8px;
    border-radius: 4px;
    max-height: 100px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
}

.q-timeline {
    :deep(.q-timeline__heading) {
        font-weight: 600;
        font-size: 0.9rem;
    }

    :deep(.q-timeline__entry) {
        @media (max-width: 600px) {
            .q-timeline__title {
                font-size: 0.9rem;
            }

            .q-timeline__subtitle {
                font-size: 0.75rem;
            }
        }
    }
}
</style>