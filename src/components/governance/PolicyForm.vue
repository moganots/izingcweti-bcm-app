<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">{{ isEditing ? 'Edit Policy' : 'Create Policy' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                <!-- Policy Name -->
                <q-input v-model="form.name" label="Policy Name *" outlined dense :rules="[requiredRule]" autofocus
                    :disable="loading" />

                <!-- Description -->
                <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="3"
                    :disable="loading" />

                <div class="row q-col-gutter-md">
                    <!-- Category -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.category" :options="categoryOptions" label="Category *" outlined dense
                            emit-value map-options :rules="[requiredRule]" :disable="loading" />
                    </div>

                    <!-- Status -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.status" :options="statusOptions" label="Status" outlined dense
                            emit-value map-options :disable="loading" />
                    </div>
                </div>

                <div class="row q-col-gutter-md">
                    <!-- Version -->
                    <div class="col-12 col-md-4">
                        <q-input v-model="form.policyVersion" label="Version" outlined dense placeholder="1.0"
                            :disable="loading" />
                    </div>

                    <!-- Effective Date -->
                    <div class="col-12 col-md-4">
                        <q-input v-model="form.effectiveDate" label="Effective Date" type="date" outlined dense
                            :disable="loading" />
                    </div>

                    <!-- Next Review Date -->
                    <div class="col-12 col-md-4">
                        <q-input v-model="form.nextReviewDate" label="Next Review Date" type="date" outlined dense
                            :disable="loading" />
                    </div>
                </div>

                <!-- Owner -->
                <q-select v-model="form.ownerId" :options="ownerOptions" label="Owner" outlined dense emit-value
                    map-options clearable :disable="loading" />

                <!-- Tags -->
                <q-select v-model="form.tags" :options="tagOptions" label="Tags" outlined dense multiple use-chips
                    use-input new-value-mode="add-unique" :disable="loading" />

                <!-- Error Display -->
                <q-banner v-if="error" class="bg-red-1 text-red-8 rounded-borders" rounded>
                    <template v-slot:avatar>
                        <q-icon name="error" color="red-8" />
                    </template>
                    {{ error }}
                </q-banner>

                <!-- Actions -->
                <div class="row q-col-gutter-md">
                    <div class="col-6">
                        <q-btn flat color="grey" :label="$t('common.cancel')" class="full-width" :disable="loading"
                            @click="$emit('cancel')" />
                    </div>
                    <div class="col-6">
                        <q-btn type="submit" color="primary"
                            :label="isEditing ? $t('common.update') : $t('common.create')" :loading="loading"
                            class="full-width" unelevated />
                    </div>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type {
    GovernancePolicy,
    PolicyStatus,
    PolicyCategory,
    CreatePolicyRequest,
    UpdatePolicyRequest,
} from 'src/models/entities/governance/governance.entity'
import {
    getPolicyStatusLabel,
    getPolicyCategoryLabel,
} from 'src/models/entities/governance/governance.entity'
import { formatISO } from 'src/utils/date.utils';

// ============================================
// Props
// ============================================
const props = defineProps<{
    policy?: GovernancePolicy
    loading?: boolean
    error?: string | null
    ownerOptions?: Array<{ label: string; value: string }>
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
    submit: [data: CreatePolicyRequest | UpdatePolicyRequest]
    cancel: []
}>()

// ============================================
// Composables
// ============================================

// ============================================
// State
// ============================================
const form = reactive({
    name: '',
    description: '',
    category: null as PolicyCategory | null,
    status: 'DRAFT' as PolicyStatus,
    policyVersion: '1.0',
    effectiveDate: null as string | null,
    nextReviewDate: null as string | null,
    ownerId: null as string | null,
    tags: [] as string[],
})

// ============================================
// Computed
// ============================================
const isEditing = computed(() => !!props.policy?.uuid)

const categoryOptions = [
    { label: 'BCM', value: 'BCM' },
    { label: 'Risk Management', value: 'RISK_MANAGEMENT' },
    { label: 'Compliance', value: 'COMPLIANCE' },
    { label: 'IT Security', value: 'IT_SECURITY' },
    { label: 'HR', value: 'HR' },
    { label: 'Operations', value: 'OPERATIONS' },
    { label: 'Finance', value: 'FINANCE' },
    { label: 'Data Privacy', value: 'DATA_PRIVACY' },
    { label: 'Incident Management', value: 'INCIDENT_MANAGEMENT' },
    { label: 'Crisis Communication', value: 'CRISIS_COMMUNICATION' },
    { label: 'Business Continuity', value: 'BUSINESS_CONTINUITY' },
    { label: 'Disaster Recovery', value: 'DISASTER_RECOVERY' },
    { label: 'Quality', value: 'QUALITY' },
    { label: 'Environmental', value: 'ENVIRONMENTAL' },
    { label: 'Health & Safety', value: 'HEALTH_SAFETY' },
    { label: 'Supply Chain', value: 'SUPPLY_CHAIN' },
    { label: 'Legal', value: 'LEGAL' },
    { label: 'Other', value: 'OTHER' },
].map(opt => ({
    ...opt,
    label: getPolicyCategoryLabel(opt.value as PolicyCategory),
}))

const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Archived', value: 'ARCHIVED' },
].map(opt => ({
    ...opt,
    label: getPolicyStatusLabel(opt.value as PolicyStatus),
}))

const tagOptions = [
    'BCM', 'Policy', 'Compliance', 'Risk', 'Security',
    'HR', 'Operations', 'Finance', 'Data Privacy',
    'Incident', 'Crisis', 'Business Continuity',
]

// ============================================
// Rules
// ============================================
const requiredRule = (val: any) => !!val || 'This field is required'

// ============================================
// Methods
// ============================================
function handleSubmit(): void {
    if (!form.name) return

    const submitData = {
        name: form.name,
        ...(form.description ? { description: form.description } : {}),
        ...(form.category ? { category: form.category } : {}),
        status: form.status,
        policyVersion: form.policyVersion || '1.0',
        ...(form.effectiveDate ? { effectiveDate: form.effectiveDate } : {}),
        ...(form.nextReviewDate ? { nextReviewDate: form.nextReviewDate } : {}),
        ...(form.ownerId ? { ownerId: form.ownerId } : {}),
        ...(form.tags.length > 0 ? { tags: form.tags } : {}),
        ...(isEditing.value ? {} : { organisationId: 'current-org' }),
    }

    if (isEditing.value) {
        emit('submit', submitData as UpdatePolicyRequest)
    } else {
        emit('submit', { ...submitData, organisationId: 'current-org' } as CreatePolicyRequest)
    }
}

// ============================================
// Watch for policy changes
// ============================================
watch(
    () => props.policy,
    (policy) => {
        if (policy) {
            form.name = policy.name || ''
            form.description = policy.description || ''
            form.category = policy.category || null
            form.status = policy.status || 'DRAFT'
            form.policyVersion = policy.policyVersion || '1.0'
            form.effectiveDate = formatISO(policy.effectiveDate)
            form.nextReviewDate = formatISO(policy.nextReviewDate)
            form.ownerId = policy.ownerId || null
            form.tags = policy.tags || []
        }
    },
    { immediate: true }
)
</script>