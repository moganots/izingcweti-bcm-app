<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          Sync Conflicts
          <q-badge v-if="unresolvedCount > 0" color="red" class="q-ml-sm">{{
            unresolvedCount
          }}</q-badge>
        </div>
      </div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <div v-else-if="conflicts.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="check_circle" size="40px" color="green" class="q-mb-sm" />
        <div>No conflicts</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="conflict in conflicts" :key="conflict.uuid">
          <q-item-section avatar>
            <q-icon :name="conflict.resolved ? 'check_circle' : 'warning'" :color="conflict.resolved ? 'green' : 'red'"
              size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ conflict.entity_type }} #{{ conflict.entity_id?.substring(0, 8) }}</q-item-label>
            <q-item-label caption>{{ conflict.conflict_type }} |
              {{ formatTimeAgo(conflict.detected_at) }}</q-item-label>
            <q-item-label v-if="conflict.resolution_strategy" caption>
              Resolved: {{ conflict.resolution_strategy }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="conflict.resolved ? 'green' : 'red'"
              :label="conflict.resolved ? 'Resolved' : 'Unresolved'" />
          </q-item-section>
          <q-item-section side v-if="!conflict.resolved">
            <q-btn flat color="primary" icon="build" label="Resolve" size="sm" @click="$emit('resolve', conflict)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'

const props = withDefaults(
  defineProps<{
    conflicts?: any[]
    loading?: boolean
  }>(),
  {
    conflicts: () => [],
    loading: false,
  }
)

defineEmits<{ resolve: [conflict: any] }>()

const unresolvedCount = computed(() => props.conflicts.filter((c: any) => !c.resolved).length)
</script>
