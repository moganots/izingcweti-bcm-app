<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading workflow..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!workflow" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Workflow Not Found</h5>
      <q-btn color="primary" label="Back to Workflows" @click="$router.push('/workflows')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back & Actions -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back"
          @click="$router.push('/workflows')"
        />
        <q-btn
          v-if="workflow.workflow_state === 'Draft'"
          color="primary"
          icon="edit"
          label="Edit"
          outline
          @click="openEditDialog"
        />
      </div>

      <!-- Header -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <StatusBadge :status="workflow.workflow_state" type="workflow" />
                <q-badge
                  :color="getPriorityColor(workflow.priority)"
                  :label="'Priority: ' + priorityLabel"
                  outline
                />
              </div>
              <h5 class="text-h5 q-mb-xs">{{ workflow.title }}</h5>
              <p v-if="workflow.description" class="text-grey-7 q-mb-none">
                {{ workflow.description }}
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Details Grid -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="category" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Type</div>
              <div class="text-body2 text-weight-medium">
                {{ formatType(workflow.workflow_type) }}
              </div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="person" size="30px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Initiator</div>
              <div class="text-body2">{{ workflow.initiator_name || workflow.initiated_by }}</div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="assignment_ind" size="30px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Assignee</div>
              <div class="text-body2">
                {{ workflow.assignee_name || workflow.assigned_to || 'Unassigned' }}
              </div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon
                name="event"
                size="30px"
                :color="isOverdue ? 'red' : 'grey'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Due Date</div>
              <div class="text-body2" :class="isOverdue ? 'text-negative text-weight-bold' : ''">
                {{ formatDate(workflow.due_date) || 'N/A' }}
              </div>
            </q-card-section></q-card
          >
        </div>
      </div>

      <!-- Timeline & Approval Chain -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-7">
          <WorkflowTimeline :workflow="workflow" />
        </div>
        <div class="col-12 col-md-5">
          <ApprovalChain :steps="workflow.approval_chain || []" />
        </div>
      </div>

      <!-- Approval Actions -->
      <div class="q-mb-lg">
        <ApprovalActions
          :workflow="workflow"
          :submitting="saving"
          :user-options="userOptions"
          @submit="handleSubmit"
          @approve="handleApprove"
          @reject="handleReject"
          @escalate="handleEscalate"
          @reassign="handleReassign"
          @complete="handleComplete"
          @archive="handleArchive"
          @cancel="handleCancel"
          @comment="handleAddComment"
          @edit="openEditDialog"
        />
      </div>

      <!-- Related Entity -->
      <q-card v-if="workflow.entity_type && workflow.entity_id" flat bordered>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Related {{ formatType(workflow.entity_type) }}</div>
          <q-btn
            flat
            color="primary"
            :label="'View ' + formatType(workflow.entity_type)"
            @click="viewRelatedEntity"
          />
        </q-card-section>
      </q-card>
    </template>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Workflow</div></q-card-section>
        <q-card-section>
          <WorkflowForm
            :editing="true"
            :initial-data="workflow"
            :submitting="saving"
            :user-options="userOptions"
            @submit="handleUpdate"
            @cancel="showEditDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useWorkflowStore } from '../../stores/workflow/workflow.store'
import { formatDate } from '../../utils/date.utils'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import StatusBadge from '../../components/.common/StatusBadge.vue'
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline.vue'
import ApprovalChain from '../../components/workflow/ApprovalChain.vue'
import ApprovalActions from '../../components/workflow/ApprovalActions.vue'
import WorkflowForm from '../../components/workflow/WorkflowForm.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const workflowStore = useWorkflowStore()

// State
const workflow = computed(() => workflowStore.selectedWorkflow)
const isLoading = ref(true)
const saving = ref(false)
const showEditDialog = ref(false)

// Options
const userOptions = [{ label: 'Demo User', value: 'user-1' }]

// Computed
const isOverdue = computed(() => {
  if (!workflow.value?.due_date) return false
  return new Date(workflow.value.due_date) < new Date() && !workflow.value.completed_at
})

const priorityLabel = computed(() => {
  const labels: Record<number, string> = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low',
    5: 'Background',
  }
  return labels[workflow!?.value!?.priority] || 'Unknown'
})

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await workflowStore.loadWorkflow(id)
    isLoading.value = false
  }
})

// Methods
function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'blue',
    5: 'grey',
  }
  return colors[priority] || 'grey'
}

function formatType(type: string): string {
  if (!type) return ''
  return type
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function openEditDialog(): void {
  showEditDialog.value = true
}

async function handleUpdate(data: any): Promise<void> {
  saving.value = true
  try {
    await workflowStore.updateWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow updated' })
    showEditDialog.value = false
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update' })
  } finally {
    saving.value = false
  }
}

async function handleSubmit(data: { comments: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.submitWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow submitted' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to submit' })
  } finally {
    saving.value = false
  }
}

async function handleApprove(data: { comments: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.approveWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow approved' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to approve' })
  } finally {
    saving.value = false
  }
}

async function handleReject(data: { rejection_reason: string; comments?: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.rejectWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow rejected' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to reject' })
  } finally {
    saving.value = false
  }
}

async function handleEscalate(data: { escalation_level: number; reason: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.escalateWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow escalated' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to escalate' })
  } finally {
    saving.value = false
  }
}

async function handleReassign(data: { assigned_to: string; reason?: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.reassignWorkflow(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Workflow reassigned' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to reassign' })
  } finally {
    saving.value = false
  }
}

async function handleComplete(data: { comments?: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.completeWorkflow(workflow!?.value!?.uuid)
    $q.notify({ type: 'positive', message: 'Workflow completed' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to complete' })
  } finally {
    saving.value = false
  }
}

async function handleArchive(): Promise<void> {
  saving.value = true
  try {
    await workflowStore.archiveWorkflow(workflow!?.value!?.uuid)
    $q.notify({ type: 'positive', message: 'Workflow archived' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to archive' })
  } finally {
    saving.value = false
  }
}

async function handleCancel(data: { reason?: string }): Promise<void> {
  saving.value = true
  try {
    await workflowStore.cancelWorkflow(workflow!?.value!?.uuid)
    $q.notify({ type: 'positive', message: 'Workflow cancelled' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to cancel' })
  } finally {
    saving.value = false
  }
}

async function handleAddComment(data: { comment: string }): Promise<void> {
  try {
    await workflowStore.addComment(workflow!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Comment added' })
    await workflowStore.loadWorkflow(workflow!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to add comment' })
  }
}

function viewRelatedEntity(): void {
  if (workflow.value?.entity_type && workflow.value?.entity_id) {
    const routes: Record<string, string> = {
      incident: '/incidents',
      risk: '/risks',
      bcp: '/bcm/bcp',
      document: '/documents',
    }
    const base = routes[workflow.value.entity_type]
    if (base) router.push(`${base}/${workflow.value.entity_id}`)
  }
}
</script>
