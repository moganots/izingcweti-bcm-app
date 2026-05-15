<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Execution Log</div>

      <!-- Stats Summary -->
      <div class="row q-col-gutter-sm q-mb-md" v-if="logs.length > 0">
        <div class="col-4">
          <q-card flat bordered class="bg-grey-1"
            ><q-card-section class="text-center q-pa-sm">
              <div class="text-h6">{{ logs.length }}</div>
              <div class="text-caption text-grey-7">Total</div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-4">
          <q-card flat bordered class="bg-green-1"
            ><q-card-section class="text-center q-pa-sm">
              <div class="text-h6 text-green">{{ successCount }}</div>
              <div class="text-caption text-grey-7">Success</div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-4">
          <q-card flat bordered class="bg-red-1"
            ><q-card-section class="text-center q-pa-sm">
              <div class="text-h6 text-red">{{ failCount }}</div>
              <div class="text-caption text-grey-7">Failed</div>
            </q-card-section></q-card
          >
        </div>
      </div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="logs.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No execution logs</div>
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="log in logs"
          :key="log.uuid"
          :icon="log.success ? 'check_circle' : 'error'"
          :color="log.success ? 'green' : 'red'"
          :title="log.success ? 'Execution Successful' : 'Execution Failed'"
          :subtitle="formatDateTime(log.executed_at)"
        >
          <div class="text-caption">
            <strong>Entity:</strong> {{ log.entity_type }} #{{ log.entity_id?.substring(0, 8) }}
          </div>
          <div class="text-caption"><strong>Time:</strong> {{ log.execution_time_ms }}ms</div>
          <div v-if="log.error_message" class="text-caption text-negative q-mt-xs">
            {{ log.error_message }}
          </div>
          <q-badge
            :color="log.success ? 'green' : 'red'"
            :label="log.success ? 'Success' : 'Failed'"
            class="q-mt-sm"
          />
        </q-timeline-entry>
      </q-timeline>

      <div v-if="hasMore" class="text-center q-mt-md">
        <q-btn
          outline
          color="primary"
          label="Load More"
          :loading="loadingMore"
          @click="$emit('load-more')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime } from '../../utils/date.utils'

const props = withDefaults(
  defineProps<{ logs?: any[]; loading?: boolean; loadingMore?: boolean; hasMore?: boolean }>(),
  {
    logs: () => [],
    loading: false,
    loadingMore: false,
    hasMore: false,
  }
)
defineEmits<{ 'load-more': [] }>()

const successCount = computed(() => props.logs.filter((l: any) => l.success).length)
const failCount = computed(() => props.logs.filter((l: any) => !l.success).length)
</script>
