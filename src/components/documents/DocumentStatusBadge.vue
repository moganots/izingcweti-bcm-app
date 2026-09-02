<template>
  <q-badge :color="color" :label="label" class="q-px-sm q-py-xs">
    <q-icon v-if="showIcon" :name="icon" size="14px" class="q-mr-xs" />
    {{ label }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: string
    showIcon?: boolean
  }>(),
  {
    showIcon: true,
  }
)

const configs: Record<string, { color: string; icon: string; label: string }> = {
  DRAFT: { color: 'grey', icon: 'edit', label: 'Draft' },
  PUBLISHED: { color: 'green', icon: 'publish', label: 'Published' },
  ARCHIVED: { color: 'grey-7', icon: 'archive', label: 'Archived' },
  UNDER_REVIEW: { color: 'blue', icon: 'visibility', label: 'Under Review' },
  APPROVED: { color: 'green', icon: 'check_circle', label: 'Approved' },
  REJECTED: { color: 'red', icon: 'cancel', label: 'Rejected' },
  EXPIRED: { color: 'orange', icon: 'timer_off', label: 'Expired' },
  PENDING_APPROVAL: { color: 'yellow', icon: 'hourglass_top', label: 'Pending Approval' },
  UNDER_REVISION: { color: 'purple', icon: 'refresh', label: 'Under Revision' },
  SUPERSEDED: { color: 'grey', icon: 'history', label: 'Superseded' },
}

const config = computed(
  () => configs[props.status] || { color: 'grey', icon: 'help', label: props.status }
)

const color = computed(() => config.value.color)
const icon = computed(() => config.value.icon)
const label = computed(() => config.value.label)
</script>