<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Actions</div>
      <div class="row q-col-gutter-md">
        <!-- Draft Actions -->
        <template v-if="workflow.workflow_state === 'Draft'">
          <div class="col-6">
            <q-btn color="primary" icon="send" label="Submit" class="full-width" unelevated @click="$emit('submit')" />
          </div>
          <div class="col-6">
            <q-btn color="grey" icon="edit" label="Edit" class="full-width" outline @click="$emit('edit')" />
          </div>
        </template>

        <!-- Submitted/InReview Actions -->
        <template v-if="workflow.workflow_state === 'Submitted' || workflow.workflow_state === 'InReview'">
          <div class="col-6">
            <q-btn color="green" icon="check_circle" label="Approve" class="full-width" unelevated
              @click="$emit('approve')" />
          </div>
          <div class="col-6">
            <q-btn color="red" icon="cancel" label="Reject" class="full-width" outline @click="$emit('reject')" />
          </div>
          <div class="col-6">
            <q-btn color="orange" icon="arrow_upward" label="Escalate" class="full-width" outline
              @click="$emit('escalate')" />
          </div>
          <div class="col-6">
            <q-btn color="purple" icon="person_swap" label="Reassign" class="full-width" outline
              @click="$emit('reassign')" />
          </div>
        </template>

        <!-- Approved Actions -->
        <template v-if="workflow.workflow_state === 'Approved'">
          <div class="col-6">
            <q-btn color="green" icon="done_all" label="Complete" class="full-width" unelevated
              @click="$emit('complete')" />
          </div>
        </template>

        <!-- Completed/Archived Actions -->
        <template v-if="workflow.workflow_state === 'Completed'">
          <div class="col-6">
            <q-btn color="brown" icon="archive" label="Archive" class="full-width" outline @click="$emit('archive')" />
          </div>
        </template>

        <!-- Common Actions -->
        <div class="col-12 q-mt-sm">
          <q-btn color="grey" icon="chat" label="Add Comment" class="full-width" flat @click="$emit('add-comment')" />
        </div>
        <div class="col-12" v-if="canCancel">
          <q-btn color="negative" icon="block" label="Cancel Workflow" class="full-width" flat
            @click="$emit('cancel')" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ workflow: any }>()
defineEmits<{
  submit: []
  edit: []
  approve: []
  reject: []
  escalate: []
  reassign: []
  complete: []
  archive: []
  cancel: []
  'add-comment': []
}>()

const canCancel = computed(
  () => !['Completed', 'Archived', 'Cancelled'].includes(props.workflow?.workflow_state)
)
</script>
