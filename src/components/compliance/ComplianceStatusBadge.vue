<template>
  <q-badge :color="color" :label="label" class="q-px-sm q-py-xs">
    <q-icon :name="icon" size="14px" class="q-mr-xs" />
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
  Compliant: { color: 'green', icon: 'check_circle', label: 'Compliant' },
  Partially: { color: 'orange', icon: 'warning', label: 'Partially Compliant' },
  NonCompliant: { color: 'red', icon: 'error', label: 'Non-Compliant' },
}

const config = computed(
  () => configs[props.status] || { color: 'grey', icon: 'help', label: props.status }
)
const color = computed(() => config.value.color)
const icon = computed(() => config.value.icon)
const label = computed(() => config.value.label)
</script>
