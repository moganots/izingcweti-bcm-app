<template>
    <q-page padding>
        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-grey-7 q-mt-md">Loading policy...</div>
        </div>

        <div v-else-if="!policy" class="text-center q-py-xl">
            <q-icon name="policy" size="64px" color="grey-4" class="q-mb-sm" />
            <div class="text-h6 text-grey-7">Policy not found</div>
            <div class="text-caption text-grey-6">The policy you're looking for doesn't exist</div>
            <q-btn color="primary" label="Back to Policies" class="q-mt-md" :to="{ name: 'GovernancePolicies' }" />
        </div>

        <template v-else>
            <!-- Page Header -->
            <div class="row items-center justify-between q-mb-md">
                <div>
                    <q-btn flat dense icon="arrow_back" label="Back to Policies" :to="{ name: 'GovernancePolicies' }"
                        class="q-mb-sm" />
                    <div class="text-h4">{{ policy.name }}</div>
                    <div class="text-subtitle2 text-grey-7">Version {{ policy.policyVersion }}</div>
                </div>
                <div class="row q-gutter-sm">
                    <q-btn color="primary" icon="edit" label="Edit" unelevated @click="handleEdit" />
                    <q-btn v-if="policy.status === PolicyStatus.DRAFT" color="positive" icon="check_circle" label="Activate"
                        unelevated @click="handleActivate" />
                    <q-btn v-if="policy.status === PolicyStatus.ACTIVE" color="orange" icon="pause_circle" label="Deactivate"
                        unelevated @click="handleDeactivate" />
                    <q-btn color="negative" icon="delete" label="Delete" outline @click="handleDelete" />
                </div>
            </div>

            <!-- Policy Details -->
            <PolicyDetails :policy="policy" @edit="handleEdit" @activate="handleActivate" @deactivate="handleDeactivate"
                @delete="handleDelete" />
        </template>

        <!-- Edit Policy Dialog -->
        <q-dialog v-model="showEditDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <PolicyForm v-if="policy" :policy="policy" :loading="submitting" :error="error"
                    :owner-options="userOptions" @submit="handleUpdate" @cancel="showEditDialog = false" />
            </div>
        </q-dialog>

        <!-- Confirmation Dialog -->
        <q-dialog v-model="showConfirmDialog" persistent>
            <ConfirmDialog v-model="showConfirmDialog" :title="confirmTitle" :message="confirmMessage"
                :type="confirmType" :confirm-label="confirmLabel" :loading="submitting" @confirm="handleConfirm"
                @cancel="showConfirmDialog = false" />
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGovernance } from 'src/composables/useGovernance'
import { PolicyDetails, PolicyForm } from 'src/components/governance'
import { ConfirmDialog } from 'src/components/.common'
import { PolicyStatus } from 'src/models/entities/governance/governance.entity'

// ============================================
// Composables
// ============================================
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const {
    selectedPolicy: policy,
    loadPolicyById,
    updatePolicy,
    deletePolicy,
    activatePolicy,
    deactivatePolicy,
    error,
} = useGovernance()

// ============================================
// State
// ============================================
const loading = ref(true)
const submitting = ref(false)
const showEditDialog = ref(false)
const showConfirmDialog = ref(false)

const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

const userOptions = ref<Array<{ label: string; value: string }>>([
    { label: 'John Doe', value: 'user-1' },
    { label: 'Jane Smith', value: 'user-2' },
    { label: 'Bob Johnson', value: 'user-3' },
])

// ============================================
// Methods
// ============================================
async function loadPolicy(): Promise<void> {
    const uuid = route.params.uuid as string
    if (!uuid) {
        loading.value = false
        return
    }

    loading.value = true
    try {
        await loadPolicyById(uuid)
    } catch (err) {
        console.error('Failed to load policy:', err)
        $q.notify({
            type: 'negative',
            message: 'Failed to load policy',
            position: 'top',
        })
    } finally {
        loading.value = false
    }
}

function handleEdit(): void {
    showEditDialog.value = true
}

function handleActivate(): void {
    if (!policy.value) return
    confirmTitle.value = 'Activate Policy'
    confirmMessage.value = `Are you sure you want to activate "${policy.value.name}"?`
    confirmType.value = 'info'
    confirmLabel.value = 'Activate'
    pendingAction = async () => {
        if (!policy.value) return
        await performActivate(policy.value.uuid)
    }
    showConfirmDialog.value = true
}

function handleDeactivate(): void {
    if (!policy.value) return
    confirmTitle.value = 'Deactivate Policy'
    confirmMessage.value = `Are you sure you want to deactivate "${policy.value.name}"?`
    confirmType.value = 'warning'
    confirmLabel.value = 'Deactivate'
    pendingAction = async () => {
        if (!policy.value) return
        await performDeactivate(policy.value.uuid)
    }
    showConfirmDialog.value = true
}

function handleDelete(): void {
    if (!policy.value) return
    confirmTitle.value = 'Delete Policy'
    confirmMessage.value = `Are you sure you want to delete "${policy.value.name}"? This action cannot be undone.`
    confirmType.value = 'delete'
    confirmLabel.value = 'Delete'
    pendingAction = async () => {
        if (!policy.value) return
        await performDelete(policy.value.uuid)
    }
    showConfirmDialog.value = true
}

async function handleUpdate(data: any): Promise<void> {
    if (!policy.value) return

    submitting.value = true
    try {
        await updatePolicy(policy.value.uuid, data)
        showEditDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Policy updated successfully',
            position: 'top',
        })
        await loadPolicy()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to update policy',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

async function performActivate(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await activatePolicy(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Policy activated successfully',
            position: 'top',
        })
        await loadPolicy()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to activate policy',
            position: 'top',
        })
    } finally {
        submitting.value = false
        pendingAction = null
    }
}

async function performDeactivate(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await deactivatePolicy(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Policy deactivated successfully',
            position: 'top',
        })
        await loadPolicy()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to deactivate policy',
            position: 'top',
        })
    } finally {
        submitting.value = false
        pendingAction = null
    }
}

async function performDelete(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await deletePolicy(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Policy deleted successfully',
            position: 'top',
        })
        router.push({ name: 'GovernancePolicies' })
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to delete policy',
            position: 'top',
        })
    } finally {
        submitting.value = false
        pendingAction = null
    }
}

async function handleConfirm(): Promise<void> {
    if (pendingAction) {
        await pendingAction()
    }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
    loadPolicy()
})
</script>

<style lang="scss" scoped>
.text-h4 {
    font-size: 1.75rem;

    @media (max-width: 400px) {
        font-size: 1.25rem;
    }
}
</style>