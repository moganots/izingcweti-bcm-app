<template>
  <q-page padding>
    <PageHeader
      title="Workflows"
      subtitle="Manage approval workflows and tasks"
      show-refresh
      @refresh="loadWorkflows"
    >
      <template #actions>
        <q-btn
        dense round
          color="primary"
          icon="account_tree"
          @click="openCreateDialog"
        />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <WorkflowStatsCards :workflows="workflows" class="q-mb-lg" />

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <SearchBar
              v-model="filters.search"
              placeholder="Search workflows..."
              @search="loadWorkflows"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.workflow_type"
              :options="typeOptions"
              outlined
              dense
              label="Type"
              clearable
              @update:model-value="loadWorkflows"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.workflow_state"
              :options="stateOptions"
              outlined
              dense
              label="State"
              clearable
              @update:model-value="loadWorkflows"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn-toggle
              v-model="viewMode"
              :options="viewModeOptions"
              flat
              dense
              toggle-color="primary"
              @update:model-value="loadWorkflows"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading workflows..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="workflows.length === 0"
      icon="account_tree"
      title="No Workflows Found"
      description="Create your first workflow to get started."
      :action="{ label: 'Create Workflow', handler: openCreateDialog }"
    />

    <!-- Workflow Cards -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="workflow in workflows" :key="workflow.uuid" class="col-12 col-md-6 col-lg-4">
        <WorkflowCard
          :workflow="workflow"
          :show-actions="true"
          @click="$router.push(`/workflows/${workflow.uuid}`)"
          @submit="handleSubmit(workflow)"
          @approve="handleApprove(workflow)"
          @reject="handleReject(workflow)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        color="primary"
        @update:model-value="loadWorkflows"
      />
    </div>

    <!-- Create Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section><div class="text-h6">Create Workflow</div></q-card-section>
        <q-card-section>
          <WorkflowForm
            :submitting="saving"
            :user-options="userOptions"
            @submit="handleCreateWorkflow"
            @cancel="showCreateDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section><div class="text-h6 text-green">Approve Workflow</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="confirmApprove" class="q-gutter-md">
            <q-input
              v-model="approveComment"
              label="Comments *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
              placeholder="Add your approval comments..."
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="green"
                  label="Approve"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section><div class="text-h6 text-red">Reject Workflow</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="confirmReject" class="q-gutter-md">
            <q-input
              v-model="rejectReason"
              label="Rejection Reason *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
              placeholder="Explain why..."
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="red"
                  label="Reject"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useWorkflowStore } from '../../stores/workflow/workflow.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import WorkflowCard from '../../components/workflow/WorkflowCard.vue'
import WorkflowStatsCards from '../../components/workflow/WorkflowStatsCards.vue'
import WorkflowForm from '../../components/workflow/WorkflowForm.vue'

const $q = useQuasar()
const workflowStore = useWorkflowStore()

// State
const workflows = computed(() => workflowStore.workflows)
const isLoading = computed(() => workflowStore.isLoading)
const totalPages = computed(() => workflowStore.totalPages)
const currentPage = ref(1)
const saving = ref(false)
const showCreateDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const approvingWorkflow = ref<any>(null)
const rejectingWorkflow = ref<any>(null)
const approveComment = ref('')
const rejectReason = ref('')
const viewMode = ref('all')

// Filters
const filters = reactive({
  search: '',
  workflow_type: null,
  workflow_state: null,
})

// Options
const typeOptions = [
  'PolicyApproval',
  'RiskAssessment',
  'BIAReview',
  'BCPApproval',
  'StrategyApproval',
  'TestReview',
  'IncidentManagement',
  'ImprovementTracking',
  'TrainingAttestation',
  'ComplianceReview',
]
const stateOptions = [
  'Draft',
  'Submitted',
  'InReview',
  'Approved',
  'Rejected',
  'Completed',
  'Archived',
  'Cancelled',
  'Expired',
  'AwaitingInput',
]
const viewModeOptions = [
  { label: 'All', value: 'all' },
  { label: 'My', value: 'my' },
  { label: 'Pending', value: 'pending' },
]
const userOptions = [{ label: 'Demo User', value: 'user-1' }]
const requiredRule = (val: string) => !!val || 'Required'

// Lifecycle
onMounted(() => loadWorkflows())

// Methods
async function loadWorkflows(): Promise<void> {
  await workflowStore.loadWorkflows({
    search: filters.search,
    workflow_type: filters.workflow_type,
    workflow_state: filters.workflow_state,
    my_workflows: viewMode.value === 'my',
    pending_approvals: viewMode.value === 'pending',
    page: currentPage.value,
  } as any)
}

function openCreateDialog(): void {
  showCreateDialog.value = true
}

async function handleCreateWorkflow(data: any): Promise<void> {
  saving.value = true
  try {
    await workflowStore.createWorkflow(data)
    $q.notify({ type: 'positive', message: 'Workflow created' })
    showCreateDialog.value = false
    await loadWorkflows()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to create' })
  } finally {
    saving.value = false
  }
}

async function handleSubmit(workflow: any): Promise<void> {
  try {
    await workflowStore.submitWorkflow(workflow.uuid)
    $q.notify({ type: 'positive', message: 'Workflow submitted' })
    await loadWorkflows()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to submit' })
  }
}

function handleApprove(workflow: any): void {
  approvingWorkflow.value = workflow
  approveComment.value = ''
  showApproveDialog.value = true
}

async function confirmApprove(): Promise<void> {
  if (!approvingWorkflow.value || !approveComment.value) return
  saving.value = true
  try {
    await workflowStore.approveWorkflow(approvingWorkflow.value.uuid, {
      comments: approveComment.value,
    })
    $q.notify({ type: 'positive', message: 'Workflow approved' })
    showApproveDialog.value = false
    approvingWorkflow.value = null
    await loadWorkflows()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to approve' })
  } finally {
    saving.value = false
  }
}

function handleReject(workflow: any): void {
  rejectingWorkflow.value = workflow
  rejectReason.value = ''
  showRejectDialog.value = true
}

async function confirmReject(): Promise<void> {
  if (!rejectingWorkflow.value || !rejectReason.value) return
  saving.value = true
  try {
    await workflowStore.rejectWorkflow(rejectingWorkflow.value.uuid, {
      rejection_reason: rejectReason.value,
    })
    $q.notify({ type: 'positive', message: 'Workflow rejected' })
    showRejectDialog.value = false
    rejectingWorkflow.value = null
    await loadWorkflows()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to reject' })
  } finally {
    saving.value = false
  }
}
</script>
