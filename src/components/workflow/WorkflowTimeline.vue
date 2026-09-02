<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="timeline" size="sm" class="q-mr-sm" />Workflow Timeline
      </div>

      <div v-if="!workflow" class="text-center q-py-md text-grey-7">No workflow selected</div>
      <div v-else-if="!hasHistory" class="text-center q-py-md text-grey-7">
        No history available
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry v-for="(entry, index) in timelineEntries" :key="index" :icon="entry.icon" :color="entry.color"
          :title="entry.title" :subtitle="entry.subtitle" :side="index % 2 === 0 ? 'left' : 'right'">
          <div v-if="entry.description" class="text-body2">{{ entry.description }}</div>
          <div v-if="entry.user" class="text-caption text-grey-7">By: {{ entry.user }}</div>
          <q-badge v-if="entry.badge" :color="entry.badgeColor" :label="entry.badge" class="q-mt-sm" />
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime } from '../../utils/date.utils'

const props = defineProps<{ workflow?: any }>()

const hasHistory = computed(() => props.workflow?.comments?.length > 0)

const timelineEntries = computed(() => {
  if (!props.workflow) return []
  const entries: any[] = []

  // Created
  entries.push({
    icon: 'add_circle',
    color: 'primary',
    title: 'Workflow Created',
    subtitle: formatDateTime(props.workflow.created_at),
    user: props.workflow.initiator_name,
  })

  // Submitted
  if (props.workflow.workflow_state !== 'Draft') {
    entries.push({
      icon: 'send',
      color: 'blue',
      title: 'Submitted for Review',
      subtitle: formatDateTime(props.workflow.updated_at),
    })
  }

  // Comments
  if (props.workflow.comments) {
    props.workflow.comments.forEach((c: any) => {
      const actionConfig: Record<string, { icon: string; color: string; title: string }> = {
        SUBMIT: { icon: 'send', color: 'blue', title: 'Submitted' },
        APPROVE: { icon: 'check_circle', color: 'green', title: 'Approved' },
        REJECT: { icon: 'cancel', color: 'red', title: 'Rejected' },
        ESCALATE: { icon: 'arrow_upward', color: 'deep-orange', title: 'Escalated' },
        REASSIGN: { icon: 'person_swap', color: 'purple', title: 'Reassigned' },
        COMMENT: { icon: 'chat', color: 'grey', title: 'Comment Added' },
      }
      const config = actionConfig[c.action] || { icon: 'circle', color: 'grey', title: c.action }
      entries.push({
        ...config,
        subtitle: formatDateTime(c.timestamp),
        description: c.comment,
        user: c.user_name,
        badge: c.rejection_reason ? 'Rejected' : undefined,
        badgeColor: 'red',
      })
    })
  }

  // Completed
  if (props.workflow.completed_at) {
    entries.push({
      icon: 'done_all',
      color: 'green',
      title: 'Workflow Completed',
      subtitle: formatDateTime(props.workflow.completed_at),
    })
  }

  return entries
})
</script>
