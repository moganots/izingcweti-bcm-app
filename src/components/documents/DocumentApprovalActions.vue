<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Approval Actions</div>

      <!-- Current Status -->
      <div class="row items-center q-mb-lg">
        <StatusBadge :status="document.status" type="document" size="lg" />
        <span class="text-caption text-grey-7 q-ml-md">
          {{ getStatusDescription(document.status) }}
        </span>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Actions based on status -->
      <div class="q-gutter-md">
        <!-- Draft Actions -->
        <template v-if="document.status === 'DRAFT'">
          <q-banner class="bg-grey-1 rounded-borders q-mb-md">
            This document is in draft. Submit it for review when ready.
          </q-banner>
          <q-btn
            color="primary"
            icon="send"
            label="Submit for Review"
            class="full-width"
            size="lg"
            unelevated
            @click="$emit('submit-review')"
          />
        </template>

        <!-- Under Review Actions -->
        <template v-if="document.status === 'UNDER_REVIEW'">
          <q-banner class="bg-blue-1 rounded-borders q-mb-md">
            This document is under review. Approve or reject it.
          </q-banner>
          <q-btn
            color="green"
            icon="check_circle"
            label="Approve"
            class="full-width"
            size="lg"
            unelevated
            @click="showApproveDialog = true"
          />
          <q-btn
            color="red"
            icon="cancel"
            label="Reject"
            class="full-width q-mt-sm"
            outline
            @click="showRejectDialog = true"
          />
        </template>

        <!-- Approved Actions -->
        <template v-if="document.status === 'APPROVED'">
          <q-banner class="bg-green-1 rounded-borders q-mb-md">
            This document has been approved.
          </q-banner>
          <q-btn
            color="primary"
            icon="publish"
            label="Publish"
            class="full-width"
            size="lg"
            unelevated
            @click="$emit('publish')"
          />
        </template>

        <!-- Published Actions -->
        <template v-if="document.status === 'PUBLISHED'">
          <q-banner class="bg-green-1 rounded-borders q-mb-md">
            This document is published and available.
          </q-banner>
          <q-btn
            color="orange"
            icon="archive"
            label="Archive"
            class="full-width"
            outline
            @click="$emit('archive')"
          />
        </template>

        <!-- Rejected Actions -->
        <template v-if="document.status === 'REJECTED'">
          <q-banner class="bg-red-1 rounded-borders q-mb-md">
            <div>This document was rejected.</div>
            <div v-if="document.rejection_reason" class="text-weight-medium q-mt-xs">
              Reason: {{ document.rejection_reason }}
            </div>
          </q-banner>
          <q-btn
            color="primary"
            icon="refresh"
            label="Revise and Resubmit"
            class="full-width"
            size="lg"
            unelevated
            @click="$emit('edit')"
          />
        </template>
      </div>
    </q-card-section>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-green">Approve Document</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="approveComment"
            label="Comments (optional)"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="Add approval comments..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="green" label="Approve" @click="handleApprove" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6 text-red">Reject Document</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="rejectReason"
            label="Rejection Reason *"
            outlined
            dense
            type="textarea"
            rows="2"
            :rules="[requiredRule]"
            placeholder="Explain why this document is rejected..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="red" label="Reject" @click="handleReject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBadge from '../.common/StatusBadge.vue'

defineProps<{ document: any }>()
const emit = defineEmits<{
  'submit-review': []
  approve: [comments: string]
  reject: [reason: string]
  publish: []
  archive: []
  edit: []
}>()

const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const approveComment = ref('')
const rejectReason = ref('')

const requiredRule = (val: string) => !!val || 'Required'

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    DRAFT: 'Document is being edited',
    UNDER_REVIEW: 'Awaiting approval',
    APPROVED: 'Document has been approved',
    PUBLISHED: 'Document is publicly available',
    REJECTED: 'Document was rejected',
    ARCHIVED: 'Document is archived',
    EXPIRED: 'Document has expired',
  }
  return descriptions[status] || ''
}

function handleApprove(): void {
  emit('approve', approveComment.value)
  showApproveDialog.value = false
  approveComment.value = ''
}

function handleReject(): void {
  if (!rejectReason.value) return
  emit('reject', rejectReason.value)
  showRejectDialog.value = false
  rejectReason.value = ''
}
</script>
