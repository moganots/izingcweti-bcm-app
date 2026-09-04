<!-- pages/governance/GovernancePoliciesPage.vue -->
<template>
  <q-page padding>
    <PageHeader
      title="Governance Policies"
      subtitle="Manage your governance policies"
      show-refresh
      @refresh="refreshData"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="New Policy"
          unelevated
          @click="showCreateDialog = true"
        />
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-grey-7 q-mt-md">Loading policies...</div>
    </div>

    <!-- Policy List -->
    <PolicyList
      v-else
      :policies="policies"
      :loading="loading"
      :total="total"
      :page="page"
      :limit="limit"
      @filter="handleFilter"
      @select="handleSelect"
      @edit="handleEdit"
      @delete="handleDelete"
      @activate="handleActivate"
      @deactivate="handleDeactivate"
      @create="showCreateDialog = true"
    />

    <!-- Create Policy Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <div style="width: 600px; max-width: 90vw">
        <PolicyForm
          :loading="submitting"
          :error="error"
          :owner-options="userOptions"
          @submit="handleCreate"
          @cancel="showCreateDialog = false"
        />
      </div>
    </q-dialog>

    <!-- Edit Policy Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <div style="width: 600px; max-width: 90vw">
        <PolicyForm
          v-if="selectedPolicy"
          :policy="selectedPolicy"
          :loading="submitting"
          :error="error"
          :owner-options="userOptions"
          @submit="handleUpdate"
          @cancel="showEditDialog = false"
        />
      </div>
    </q-dialog>

    <!-- View Policy Dialog -->
    <q-dialog v-model="showViewDialog" maximized>
      <q-card>
        <q-bar>
          <div class="text-h6">Policy Details</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="scroll" style="max-height: 80vh">
          <PolicyDetails
            v-if="selectedPolicy"
            :policy="selectedPolicy"
            @edit="handleEditFromView"
            @activate="handleActivateFromView"
            @deactivate="handleDeactivateFromView"
            @delete="handleDeleteFromView"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <ConfirmDialog
        :model-value="showConfirmDialog"
        :title="confirmTitle"
        :message="confirmMessage"
        :type="confirmType"
        :confirm-label="confirmLabel"
        :loading="submitting"
        @confirm="handleConfirm"
        @cancel="showConfirmDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGovernance } from 'src/composables/useGovernance'
import { PageHeader } from 'src/components/.common'
import { PolicyList, PolicyForm, PolicyDetails } from 'src/components/governance'
import { ConfirmDialog } from 'src/components/.common'
import type { GovernancePolicy, PolicyQueryParams } from 'src/models/entities/governance/governance.entity'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const {
  policies,
  selectedPolicy,
  policiesTotal,
  policiesPage,
  policiesLimit,
  error,
  loadPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  activatePolicy,
  deactivatePolicy,
  refreshData: refreshGovernanceData,
} = useGovernance()

// ============================================
// State
// ============================================
const loading = ref(true)
const submitting = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showConfirmDialog = ref(false)

const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

const filters = ref<PolicyQueryParams>({
  page: 1,
  limit: 10,
})

// ============================================
// Computed
// ============================================
const total = computed(() => policiesTotal.value)
const page = computed(() => policiesPage.value)
const limit = computed(() => policiesLimit.value)

const userOptions = ref<Array<{ label: string; value: string }>>([
  { label: 'John Doe', value: 'user-1' },
  { label: 'Jane Smith', value: 'user-2' },
  { label: 'Bob Johnson', value: 'user-3' },
])

// ============================================
// Methods
// ============================================
async function loadData(): Promise<void> {
  loading.value = true
  try {
    await loadPolicies(filters.value)
  } catch (err) {
    console.error('Failed to load policies:', err)
  } finally {
    loading.value = false
  }
}

function handleFilter(newFilters: any): void {
  filters.value = { ...filters.value, ...newFilters }
  loadData()
}

function handleSelect(policy: GovernancePolicy): void {
  selectedPolicy.value = policy
  showViewDialog.value = true
}

function handleEdit(policy: GovernancePolicy): void {
  selectedPolicy.value = policy
  showEditDialog.value = true
}

function handleEditFromView(): void {
  showViewDialog.value = false
  setTimeout(() => {
    if (selectedPolicy.value) {
      showEditDialog.value = true
    }
  }, 300)
}

async function handleCreate(data: any): Promise<void> {
  submitting.value = true
  try {
    await createPolicy(data)
    showCreateDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Policy created successfully',
      position: 'top',
    })
    await loadData()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to create policy',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

async function handleUpdate(data: any): Promise<void> {
  if (!selectedPolicy.value) return

  submitting.value = true
  try {
    await updatePolicy(selectedPolicy.value.uuid, data)
    showEditDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Policy updated successfully',
      position: 'top',
    })
    await loadData()
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

function handleDelete(policy: GovernancePolicy): void {
  confirmTitle.value = 'Delete Policy'
  confirmMessage.value = `Are you sure you want to delete "${policy.name}"? This action cannot be undone.`
  confirmType.value = 'delete'
  confirmLabel.value = 'Delete'
  pendingAction = async () => {
    await performDelete(policy.uuid)
  }
  showConfirmDialog.value = true
}

function handleDeleteFromView(): void {
  showViewDialog.value = false
  setTimeout(() => {
    if (selectedPolicy.value) {
      handleDelete(selectedPolicy.value)
    }
  }, 300)
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
    await loadData()
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

function handleActivate(policy: GovernancePolicy): void {
  confirmTitle.value = 'Activate Policy'
  confirmMessage.value = `Are you sure you want to activate "${policy.name}"?`
  confirmType.value = 'info'
  confirmLabel.value = 'Activate'
  pendingAction = async () => {
    await performActivate(policy.uuid)
  }
  showConfirmDialog.value = true
}

function handleActivateFromView(): void {
  showViewDialog.value = false
  setTimeout(() => {
    if (selectedPolicy.value) {
      handleActivate(selectedPolicy.value)
    }
  }, 300)
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
    await loadData()
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

function handleDeactivate(policy: GovernancePolicy): void {
  confirmTitle.value = 'Deactivate Policy'
  confirmMessage.value = `Are you sure you want to deactivate "${policy.name}"?`
  confirmType.value = 'warning'
  confirmLabel.value = 'Deactivate'
  pendingAction = async () => {
    await performDeactivate(policy.uuid)
  }
  showConfirmDialog.value = true
}

function handleDeactivateFromView(): void {
  showViewDialog.value = false
  setTimeout(() => {
    if (selectedPolicy.value) {
      handleDeactivate(selectedPolicy.value)
    }
  }, 300)
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
    await loadData()
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

async function handleConfirm(): Promise<void> {
  if (pendingAction) {
    await pendingAction()
  }
}

async function refreshData(): Promise<void> {
  await loadData()
  await refreshGovernanceData()
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadData()
})
</script>