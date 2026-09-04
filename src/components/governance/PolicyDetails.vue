<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div>
                    <div class="text-h5">{{ policy?.name }}</div>
                    <div class="text-subtitle2 text-grey-7">Version {{ policy?.policyVersion }}</div>
                </div>
                <div class="row q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit')" />
                    <q-btn v-if="policy?.status === 'DRAFT'" flat color="positive" icon="check_circle" label="Activate"
                        @click="$emit('activate')" />
                    <q-btn v-if="policy?.status === 'ACTIVE'" flat color="orange" icon="pause_circle" label="Deactivate"
                        @click="$emit('deactivate')" />
                    <q-btn flat color="negative" icon="delete" label="Delete" @click="$emit('delete')" />
                </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Status Badge -->
            <div class="row q-gutter-sm q-mb-md">
                <q-badge :color="getStatusColor(policy?.status || PolicyStatus.DRAFT)"
                    :label="getStatusLabel(policy?.status || PolicyStatus.DRAFT)" size="lg" class="q-px-md q-py-sm" />
                <q-badge v-if="policy?.category" color="grey-5" text-color="dark"
                    :label="getCategoryLabel(policy.category)" size="lg" class="q-px-md q-py-sm" />
            </div>

            <!-- Details Grid -->
            <q-list separator class="q-mb-md">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="description" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Description</q-item-label>
                        <q-item-label>{{ policy?.description || 'No description provided' }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="event" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Effective Date</q-item-label>
                        <q-item-label>
                            {{ policy?.effectiveDate ? formatDate(policy.effectiveDate) : 'Not set' }}
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="event_available" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Next Review Date</q-item-label>
                        <q-item-label>
                            {{ policy?.nextReviewDate ? formatDate(policy.nextReviewDate) : 'Not set' }}
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="person" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Owner</q-item-label>
                        <q-item-label>{{ policy?.ownerId || 'Unassigned' }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="sync" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Last Updated</q-item-label>
                        <q-item-label>{{ formatTimeAgo(policy?.updatedAt) }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="history" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Created</q-item-label>
                        <q-item-label>{{ formatTimeAgo(policy?.createdAt) }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Tags -->
            <div v-if="policy?.tags?.length" class="q-mt-md">
                <div class="text-caption text-grey-7 q-mb-sm">Tags</div>
                <div class="q-gutter-xs">
                    <q-badge v-for="tag in policy.tags" :key="tag" color="grey-5" text-color="dark" :label="tag" />
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import type { GovernancePolicy, PolicyCategory } from 'src/models/entities/governance/governance.entity'
import {
    getPolicyStatusLabel,
    getPolicyStatusColor,
    getPolicyCategoryLabel,
    PolicyStatus,
} from 'src/models/entities/governance/governance.entity'
import { formatDate, formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
defineProps<{
    policy: GovernancePolicy | null
}>()

// ============================================
// Emits
// ============================================
defineEmits<{
    edit: []
    activate: []
    deactivate: []
    delete: []
}>()

// ============================================
// Methods
// ============================================
function getStatusLabel(status: PolicyStatus): string {
    return getPolicyStatusLabel(status)
}

function getStatusColor(status: PolicyStatus): string {
    return getPolicyStatusColor(status)
}

function getCategoryLabel(category: PolicyCategory): string {
    return getPolicyCategoryLabel(category)
}
</script>