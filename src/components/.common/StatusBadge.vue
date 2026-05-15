<template>
  <q-badge :color="color" :label="label" :outline="outline" class="q-px-sm q-py-xs">
    <q-icon v-if="icon" :name="icon" size="14px" class="q-mr-xs" />
    {{ label }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: string
    type?: 'workflow' | 'incident' | 'document' | 'risk' | 'bcp' | 'default'
    outline?: boolean
  }>(),
  {
    type: 'default',
    outline: false,
  }
)

const statusConfigs: Record<
  string,
  Record<string, { color: string; icon: string; label: string }>
> = {
  workflow: {
    Draft: { color: 'grey', icon: 'edit', label: 'Draft' },
    Submitted: { color: 'blue', icon: 'send', label: 'Submitted' },
    InReview: { color: 'orange', icon: 'visibility', label: 'In Review' },
    Approved: { color: 'green', icon: 'check_circle', label: 'Approved' },
    Rejected: { color: 'red', icon: 'cancel', label: 'Rejected' },
    Completed: { color: 'green', icon: 'done_all', label: 'Completed' },
  },
  incident: {
    Critical: { color: 'red', icon: 'error', label: 'Critical' },
    High: { color: 'orange', icon: 'warning', label: 'High' },
    Medium: { color: 'yellow', icon: 'info', label: 'Medium' },
    Low: { color: 'green', icon: 'notifications', label: 'Low' },
  },
  document: {
    DRAFT: { color: 'grey', icon: 'edit', label: 'Draft' },
    UNDER_REVIEW: { color: 'blue', icon: 'visibility', label: 'Under Review' },
    APPROVED: { color: 'green', icon: 'check_circle', label: 'Approved' },
    REJECTED: { color: 'red', icon: 'cancel', label: 'Rejected' },
    PUBLISHED: { color: 'green', icon: 'publish', label: 'Published' },
    ARCHIVED: { color: 'orange', icon: 'archive', label: 'Archived' },
  },
  default: {},
}

const config = computed(
  () =>
    statusConfigs[props.type]?.[props.status] || { color: 'grey', icon: '', label: props.status }
)
const color = computed(() => config.value.color)
const icon = computed(() => config.value.icon)
const label = computed(() => config.value.label)
</script>
