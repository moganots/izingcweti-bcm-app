<template>
  <q-fab
    v-model="expanded"
    :color="fabColor"
    icon="sync"
    direction="up"
    :class="{ 'rotate-animation': isSyncing }"
    vertical-actions-align="left"
  >
    <q-fab-action
      color="primary"
      icon="cloud_upload"
      label="Push"
      label-position="left"
      @click="$emit('push')"
    />
    <q-fab-action
      color="secondary"
      icon="cloud_download"
      label="Pull"
      label-position="left"
      @click="$emit('pull')"
    />
    <q-fab-action
      color="green"
      icon="sync"
      label="Full Sync"
      label-position="left"
      @click="$emit('full-sync')"
    />
  </q-fab>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    isSyncing?: boolean
    hasPendingChanges?: boolean
  }>(),
  {
    isSyncing: false,
    hasPendingChanges: false,
  }
)

defineEmits<{
  push: []
  pull: []
  'full-sync': []
}>()

const expanded = ref(false)

const fabColor = computed(() => {
  if (props.isSyncing) return 'orange'
  if (props.hasPendingChanges) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.rotate-animation :deep(.q-fab__icon) {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
