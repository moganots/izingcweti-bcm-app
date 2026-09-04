<template>
    <div class="policy-list">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
            <div>
                <div class="text-h6">Governance Policies</div>
                <div class="text-caption text-grey-7">
                    {{ total }} policies found
                </div>
            </div>
            <q-btn color="primary" icon="add" label="New Policy" unelevated @click="$emit('create')" />
        </div>

        <!-- Filters -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="filters.search" outlined dense placeholder="Search policies..." clearable
                    @update:model-value="applyFilters">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-6 col-md-3">
                <q-select v-model="filters.status" :options="statusOptions" outlined dense placeholder="Status"
                    clearable emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-6 col-md-3">
                <q-select v-model="filters.category" :options="categoryOptions" outlined dense placeholder="Category"
                    clearable emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-btn flat color="grey" label="Clear" class="full-width" @click="clearFilters" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="policies.length === 0" class="text-center q-py-lg">
            <q-icon name="policy" size="48px" color="grey-4" class="q-mb-sm" />
            <div class="text-h6 text-grey-7">No policies found</div>
            <div class="text-caption text-grey-6">Create your first governance policy</div>
        </div>

        <!-- Policy List -->
        <q-list v-else bordered separator>
            <q-item v-for="policy in policies" :key="policy.uuid" clickable @click="$emit('select', policy)"
                class="q-pa-md">
                <q-item-section>
                    <div class="row items-center q-gutter-sm">
                        <q-item-label class="text-weight-medium">
                            {{ policy.name }}
                        </q-item-label>
                        <q-badge :color="getStatusColor(policy.status)" :label="getStatusLabel(policy.status)" />
                    </div>
                    <q-item-label caption class="q-mt-xs">
                        {{ policy.category ? getCategoryLabel(policy.category) : 'Uncategorized' }}
                        <span class="q-mx-xs">•</span>
                        v{{ policy.policyVersion }}
                        <span class="q-mx-xs">•</span>
                        <span v-if="policy.effectiveDate">
                            Effective: {{ formatDate(policy.effectiveDate) }}
                        </span>
                        <span v-else>No effective date</span>
                    </q-item-label>
                    <div v-if="policy.tags?.length" class="q-mt-xs q-gutter-xs">
                        <q-badge v-for="tag in policy.tags" :key="tag" color="grey-5" text-color="dark" label="tag" />
                    </div>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat round dense icon="more_vert" @click.stop>
                        <q-menu>
                            <q-list dense>
                                <q-item clickable v-close-popup @click="$emit('edit', policy)">
                                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                    <q-item-section>Edit</q-item-section>
                                </q-item>
                                <q-item v-if="policy.status === 'DRAFT'" clickable v-close-popup
                                    @click="$emit('activate', policy)">
                                    <q-item-section avatar><q-icon name="check_circle" /></q-item-section>
                                    <q-item-section>Activate</q-item-section>
                                </q-item>
                                <q-item v-if="policy.status === 'ACTIVE'" clickable v-close-popup
                                    @click="$emit('deactivate', policy)">
                                    <q-item-section avatar><q-icon name="pause_circle" /></q-item-section>
                                    <q-item-section>Deactivate</q-item-section>
                                </q-item>
                                <q-separator />
                                <q-item clickable v-close-popup @click="$emit('delete', policy)">
                                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                                    <q-item-section class="text-negative">Delete</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>

        <!-- Pagination -->
        <div v-if="total! > limit!" class="row justify-center q-mt-md">
            <q-pagination v-model="filters.page" :max="totalPages" color="primary" @update:model-value="applyFilters" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { GovernancePolicy, PolicyStatus, PolicyCategory } from 'src/models/entities/governance/governance.entity'
import {
    getPolicyStatusLabel,
    getPolicyStatusColor,
    getPolicyCategoryLabel,
} from 'src/models/entities/governance/governance.entity'
import { formatDate } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
const props = defineProps<{
    policies: GovernancePolicy[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
    'create': []
    'select': [policy: GovernancePolicy]
    'edit': [policy: GovernancePolicy]
    'delete': [policy: GovernancePolicy]
    'activate': [policy: GovernancePolicy]
    'deactivate': [policy: GovernancePolicy]
    'filter': [filters: any]
}>()

// ============================================
// State
// ============================================
const filters = reactive({
    search: '',
    status: null as PolicyStatus | null,
    category: null as PolicyCategory | null,
    page: props.page || 1,
})

// ============================================
// Computed
// ============================================
const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Archived', value: 'ARCHIVED' },
    { label: 'Expired', value: 'EXPIRED' },
]

const categoryOptions = [
    { label: 'BCM', value: 'BCM' },
    { label: 'Risk Management', value: 'RISK_MANAGEMENT' },
    { label: 'Compliance', value: 'COMPLIANCE' },
    { label: 'IT Security', value: 'IT_SECURITY' },
    { label: 'HR', value: 'HR' },
    { label: 'Operations', value: 'OPERATIONS' },
    { label: 'Finance', value: 'FINANCE' },
]

const totalPages = computed(() => {
    const total = props.total || 0
    const limit = props.limit || 10
    return Math.ceil(total / limit)
})

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

function applyFilters(): void {
    emit('filter', { ...filters })
}

function clearFilters(): void {
    filters.search = ''
    filters.status = null
    filters.category = null
    filters.page = 1
    applyFilters()
}

// ============================================
// Watch
// ============================================
watch(
    () => props.page,
    (newPage) => {
        if (newPage) {
            filters.page = newPage
        }
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.policy-list {
    width: 100%;
}

.text-h6 {
    font-size: 1.125rem;

    @media (max-width: 400px) {
        font-size: 1rem;
    }
}
</style>