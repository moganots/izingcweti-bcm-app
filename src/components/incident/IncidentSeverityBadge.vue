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
    severity: string
    showIcon?: boolean
  }>(),
  {
    showIcon: true,
  }
)

const config: Record<string, { color: string; icon: string; label: string }> = {
  Critical: { color: 'red', icon: 'error', label: 'Critical' },
  High: { color: 'orange', icon: 'warning', label: 'High' },
  Medium: { color: 'yellow', icon: 'info', label: 'Medium' },
  Low: { color: 'green', icon: 'notifications', label: 'Low' },
  Informational: { color: 'blue', icon: 'info', label: 'Informational' },
}

const color = computed(() => config[props.severity]?.color || 'grey')
const icon = computed(() => config[props.severity]?.icon || 'help')
const label = computed(() => config[props.severity]?.label || props.severity)
</script>
