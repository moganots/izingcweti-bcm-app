<template>
  <q-badge :color="color" :label="label" class="q-px-sm q-py-xs">
    <q-icon :name="icon" size="14px" class="q-mr-xs" />
    {{ label }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ incident: any }>()

const isClosed = computed(() => !!props.incident?.closed_at)
const color = computed(() => (isClosed.value ? 'green' : 'orange'))
const icon = computed(() => (isClosed.value ? 'check_circle' : 'warning'))
const label = computed(() => (isClosed.value ? 'Closed' : 'Active'))
</script>
