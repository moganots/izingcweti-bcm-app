<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Approval Actions</div>

      <!-- Current State Info -->
      <div class="row items-center q-mb-lg">
        <q-icon :name="stateIcon" :color="stateColor" size="32px" class="q-mr-md" />
        <div>
          <div class="text-body1 text-weight-medium">
            Current State: {{ formatState(workflow.workflow_state) }}
          </div>
          <div class="text-caption text-grey-7">
            <span v-if="workflow.assigned_to">Assigned to: {{ workflow.assignee_name || workflow.assigned_to }}</span>
            <span v-else>Unassigned</span>
          </div>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- State-Specific Actions -->
      <div class="q-gutter-md">
        <!-- ========================================== -->
        <!-- DRAFT Actions -->
        <!-- ========================================== -->
        <template v-if="workflow.workflow_state === 'Draft'">
          <q-banner class="bg-grey-1 rounded-borders q-mb-md">
            <template v-slot:avatar><q-icon name="info" color="grey" /></template>
            This workflow is in draft. Submit it for review when ready.
          </q-banner>

          <q-btn color="primary" icon="send" label="Submit for Review" class="full-width" size="lg" unelevated
            @click="showSubmitDialog = true" />
          <q-btn outline color="grey" icon="edit" label="Edit Workflow" class="full-width q-mt-sm"
            @click="$emit('edit')" />
        </template>

        <!-- ========================================== -->
        <!-- SUBMITTED / IN REVIEW Actions -->
        <!-- ========================================== -->
        <template v-if="workflow.workflow_state === 'Submitted' || workflow.workflow_state === 'InReview'">
          <q-banner class="bg-blue-1 rounded-borders q-mb-md">
            <template v-slot:avatar><q-icon name="info" color="blue" /></template>
            This workflow requires your approval. Review and take action.
          </q-banner>

          <!-- Approve Button -->
          <q-btn color="green" icon="check_circle" label="Approve" class="full-width" size="lg" unelevated
            @click="showApproveDialog = true" />

          <!-- Reject Button -->
          <q-btn color="red" icon="cancel" label="Reject" class="full-width q-mt-sm" outline
            @click="showRejectDialog = true" />

          <!-- Escalate Button -->
          <q-btn color="orange" icon="arrow_upward" label="Escalate" class="full-width q-mt-sm" outline
            @click="showEscalateDialog = true" />

          <!-- Reassign Button -->
          <q-btn color="purple" icon="person_swap" label="Reassign" class="full-width q-mt-sm" outline
            @click="showReassignDialog = true" />

          <!-- Request Info Button -->
          <q-btn color="info" icon="help_outline" label="Request More Information" class="full-width q-mt-sm" flat
            @click="showRequestInfoDialog = true" />
        </template>

        <!-- ========================================== -->
        <!-- APPROVED Actions -->
        <!-- ========================================== -->
        <template v-if="workflow.workflow_state === 'Approved'">
          <q-banner class="bg-green-1 rounded-borders q-mb-md">
            <template v-slot:avatar><q-icon name="check_circle" color="green" /></template>
            This workflow has been approved. Mark it as completed when done.
          </q-banner>

          <q-btn color="green" icon="done_all" label="Mark as Completed" class="full-width" size="lg" unelevated
            @click="showCompleteDialog = true" />
        </template>

        <!-- ========================================== -->
        <!-- REJECTED Actions -->
        <!-- ========================================== -->
        <template v-if="workflow.workflow_state === 'Rejected'">
          <q-banner class="bg-red-1 rounded-borders q-mb-md">
            <template v-slot:avatar><q-icon name="error" color="red" /></template>
            <div>This workflow was rejected.</div>
            <div v-if="workflow.rejection_reason" class="text-weight-medium q-mt-xs">
              Reason: {{ workflow.rejection_reason }}
            </div>
          </q-banner>

          <q-btn color="primary" icon="refresh" label="Revise and Resubmit" class="full-width" size="lg" unelevated
            @click="$emit('edit')" />
        </template>

        <!-- ========================================== -->
        <!-- COMPLETED Actions -->
        <!-- ========================================== -->
        <template v-if="workflow.workflow_state === 'Completed'">
          <q-banner class="bg-green-1 rounded-borders q-mb-md">
            <template v-slot:avatar><q-icon name="done_all" color="green" /></template>
            This workflow has been completed on {{ formatDate(workflow.completed_at) }}.
          </q-banner>

          <q-btn color="brown" icon="archive" label="Archive Workflow" class="full-width" outline
            @click="$emit('archive')" />
        </template>

        <!-- ========================================== -->
        <!-- Common Actions -->
        <!-- ========================================== -->
        <q-separator class="q-my-md" />

        <q-btn color="grey" icon="chat" label="Add Comment" class="full-width" flat @click="showCommentDialog = true" />

        <q-btn v-if="canCancel" color="negative" icon="block" label="Cancel Workflow" class="full-width q-mt-sm" flat
          @click="showCancelDialog = true" />
      </div>
    </q-card-section>

    <!-- ========================================== -->
    <!-- Submit Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showSubmitDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Submit for Review</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="submitComment" label="Comments (optional)" outlined dense type="textarea" rows="3"
            placeholder="Add any notes for the reviewer..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="primary" label="Submit" :loading="submitting" @click="handleSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Approve Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-green">Approve Workflow</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="approveComment" label="Comments *" outlined dense type="textarea" rows="3"
            :rules="[requiredRule]" placeholder="Add your approval comments..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="green" label="Approve" :loading="submitting" @click="handleApprove" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Reject Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-red">Reject Workflow</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="rejectReason" label="Rejection Reason *" outlined dense type="textarea" rows="3"
            :rules="[requiredRule]" placeholder="Explain why this workflow is being rejected..." />
          <q-input v-model="rejectComment" label="Additional Comments (optional)" outlined dense type="textarea"
            rows="2" class="q-mt-md" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="red" label="Reject" :loading="submitting" @click="handleReject" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Escalate Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showEscalateDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-orange">Escalate Workflow</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="escalationLevel" :options="escalationLevelOptions" label="Escalation Level *" outlined
            dense :rules="[requiredRule]" emit-value map-options />
          <q-input v-model="escalationReason" label="Reason for Escalation *" outlined dense type="textarea" rows="2"
            :rules="[requiredRule]" class="q-mt-md" placeholder="Explain why this needs escalation..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="orange" label="Escalate" :loading="submitting" @click="handleEscalate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Reassign Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showReassignDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-purple">Reassign Workflow</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="reassignTo" :options="userOptions" label="Reassign To *" outlined dense
            :rules="[requiredRule]" emit-value map-options />
          <q-input v-model="reassignReason" label="Reason (optional)" outlined dense type="textarea" rows="2"
            class="q-mt-md" placeholder="Why are you reassigning?" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="purple" label="Reassign" :loading="submitting" @click="handleReassign" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Request Info Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showRequestInfoDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-info">Request Information</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="requestInfoMessage" label="What information is needed? *" outlined dense type="textarea"
            rows="3" :rules="[requiredRule]" placeholder="Describe the information you need..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="info" label="Request Info" :loading="submitting" @click="handleRequestInfo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Complete Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showCompleteDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-green">Complete Workflow</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="completeComment" label="Completion Notes (optional)" outlined dense type="textarea" rows="3"
            placeholder="Add any completion notes..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="green" label="Complete" :loading="submitting" @click="handleComplete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Cancel Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-negative">Cancel Workflow</div>
        </q-card-section>
        <q-card-section>
          <p class="text-body1">
            Are you sure you want to cancel this workflow? This action cannot be undone.
          </p>
          <q-input v-model="cancelReason" label="Reason for Cancellation (optional)" outlined dense type="textarea"
            rows="2" placeholder="Explain why you're cancelling..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Keep" color="grey" v-close-popup />
          <q-btn color="negative" label="Cancel Workflow" :loading="submitting" @click="handleCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================== -->
    <!-- Comment Dialog -->
    <!-- ========================================== -->
    <q-dialog v-model="showCommentDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Add Comment</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="commentText" label="Comment *" outlined dense type="textarea" rows="3"
            :rules="[requiredRule]" placeholder="Add your comment..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="primary" label="Add Comment" :loading="submitting" @click="handleComment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatDate } from '../../utils/date.utils'

const props = withDefaults(
  defineProps<{
    workflow: any
    submitting?: boolean
    userOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    submitting: false,
    userOptions: () => [],
  }
)

const emit = defineEmits<{
  submit: [data: { comments: string }]
  approve: [data: { comments: string }]
  reject: [data: { rejection_reason: string; comments?: string }]
  escalate: [data: { escalation_level: number; reason: string }]
  reassign: [data: { assigned_to: string; reason?: string }]
  'request-info': [data: { message: string }]
  complete: [data: { comments?: string }]
  cancel: [data: { reason?: string }]
  comment: [data: { comment: string }]
  edit: []
  archive: []
}>()

// Dialog visibility
const showSubmitDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showEscalateDialog = ref(false)
const showReassignDialog = ref(false)
const showRequestInfoDialog = ref(false)
const showCompleteDialog = ref(false)
const showCancelDialog = ref(false)
const showCommentDialog = ref(false)

// Form values
const submitComment = ref('')
const approveComment = ref('')
const rejectReason = ref('')
const rejectComment = ref('')
const escalationLevel = ref(1)
const escalationReason = ref('')
const reassignTo = ref('')
const reassignReason = ref('')
const requestInfoMessage = ref('')
const completeComment = ref('')
const cancelReason = ref('')
const commentText = ref('')

const requiredRule = (val: any) => !!val || 'Required'

const escalationLevelOptions = [
  { label: 'Level 1 - Team Lead', value: 1 },
  { label: 'Level 2 - Department Manager', value: 2 },
  { label: 'Level 3 - BCM Manager', value: 3 },
  { label: 'Level 4 - Executive', value: 4 },
  { label: 'Level 5 - Board', value: 5 },
]

const canCancel = computed(() => {
  return (
    props.workflow &&
    !['Completed', 'Archived', 'Cancelled'].includes(props.workflow.workflow_state)
  )
})

const stateIcon = computed(() => {
  const icons: Record<string, string> = {
    Draft: 'edit',
    Submitted: 'send',
    InReview: 'visibility',
    Approved: 'check_circle',
    Rejected: 'cancel',
    Completed: 'done_all',
    Archived: 'archive',
    Cancelled: 'block',
    Expired: 'timer_off',
    AwaitingInput: 'help_outline',
  }
  return icons[props.workflow?.workflow_state] || 'circle'
})

const stateColor = computed(() => {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Submitted: 'blue',
    InReview: 'orange',
    Approved: 'green',
    Rejected: 'red',
    Completed: 'green',
    Archived: 'brown',
    Cancelled: 'grey',
    Expired: 'red',
    AwaitingInput: 'yellow',
  }
  return colors[props.workflow?.workflow_state] || 'grey'
})

function formatState(state: string): string {
  const labels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    InReview: 'In Review',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Completed: 'Completed',
    Archived: 'Archived',
    Cancelled: 'Cancelled',
    Expired: 'Expired',
    AwaitingInput: 'Awaiting Input',
    ParallelReview: 'Parallel Review',
  }
  return labels[state] || state
}

// Event handlers
function handleSubmit(): void {
  emit('submit', { comments: submitComment.value })
  showSubmitDialog.value = false
  submitComment.value = ''
}

function handleApprove(): void {
  if (!approveComment.value) return
  emit('approve', { comments: approveComment.value })
  showApproveDialog.value = false
  approveComment.value = ''
}

function handleReject(): void {
  if (!rejectReason.value) return
  emit('reject', { rejection_reason: rejectReason.value, comments: rejectComment.value })
  showRejectDialog.value = false
  rejectReason.value = ''
  rejectComment.value = ''
}

function handleEscalate(): void {
  if (!escalationReason.value) return
  emit('escalate', { escalation_level: escalationLevel.value, reason: escalationReason.value })
  showEscalateDialog.value = false
  escalationReason.value = ''
}

function handleReassign(): void {
  if (!reassignTo.value) return
  emit('reassign', { assigned_to: reassignTo.value, reason: reassignReason.value })
  showReassignDialog.value = false
  reassignTo.value = ''
  reassignReason.value = ''
}

function handleRequestInfo(): void {
  if (!requestInfoMessage.value) return
  emit('request-info', { message: requestInfoMessage.value })
  showRequestInfoDialog.value = false
  requestInfoMessage.value = ''
}

function handleComplete(): void {
  emit('complete', { comments: completeComment.value })
  showCompleteDialog.value = false
  completeComment.value = ''
}

function handleCancel(): void {
  emit('cancel', { reason: cancelReason.value })
  showCancelDialog.value = false
  cancelReason.value = ''
}

function handleComment(): void {
  if (!commentText.value) return
  emit('comment', { comment: commentText.value })
  showCommentDialog.value = false
  commentText.value = ''
}
</script>
