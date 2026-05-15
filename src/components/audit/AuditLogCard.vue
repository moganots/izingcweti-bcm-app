<template>
  <q-card class="audit-card" flat bordered>
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <q-badge
            :color="getActionColor(log.action)"
            :label="log.action"
            class="q-px-sm q-py-xs"
          />
          <q-badge :color="getSeverityColor(log.severity)" :label="log.severity" outline />
          <q-badge
            :color="getCategoryColor(log.audit_category)"
            :label="formatCategory(log.audit_category)"
            outline
          />
        </div>
        <span class="text-caption text-grey-7">{{ formatTimeAgo(log.created_at) }}</span>
      </div>

      <!-- Description -->
      <div class="text-body2 q-mb-sm">{{ log.description }}</div>

      <!-- Meta -->
      <div class="row q-col-gutter-sm text-caption text-grey-7">
        <div class="col-6">
          <strong>Entity:</strong> {{ log.entity_type }} #{{ log.entity_id?.substring(0, 8) }}
        </div>
        <div class="col-6" v-if="log.user">
          <strong>User:</strong> {{ log.user?.email || log.user_id }}
        </div>
        <div class="col-6" v-if="log.ip_address"><strong>IP:</strong> {{ log.ip_address }}</div>
        <div class="col-6" v-if="log.execution_time_ms">
          <strong>Time:</strong> {{ log.execution_time_ms }}ms
        </div>
      </div>

      <!-- Changes (expandable) -->
      <q-expansion-item
        v-if="log.old_value || log.new_value"
        icon="compare_arrows"
        label="View Changes"
        dense
        class="q-mt-sm"
        header-class="text-caption text-primary"
      >
        <div class="row q-col-gutter-md">
          <div class="col-6" v-if="log.old_value">
            <div class="text-caption text-weight-bold text-red">Before</div>
            <pre class="change-data old-data">{{ formatJSON(log.old_value) }}</pre>
          </div>
          <div class="col-6" v-if="log.new_value">
            <div class="text-caption text-weight-bold text-green">After</div>
            <pre class="change-data new-data">{{ formatJSON(log.new_value) }}</pre>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '../../utils/date.utils'
import { formatJSON } from '../../utils/formatters'

defineProps<{ log: any }>()

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    APPROVE: 'green',
    REJECT: 'red',
    SYNC: 'orange',
    CONFLICT_RESOLVE: 'purple',
  }
  return colors[action] || 'grey'
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    INFO: 'blue',
    WARNING: 'orange',
    ERROR: 'red',
    CRITICAL: 'deep-orange',
  }
  return colors[severity] || 'grey'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    USER_ACTIVITY: 'blue',
    SYSTEM_EVENT: 'grey',
    SECURITY: 'red',
    DATA_CHANGE: 'green',
    ACCESS_CONTROL: 'orange',
    WORKFLOW: 'purple',
    COMPLIANCE: 'teal',
    SYNC: 'cyan',
    CONFIGURATION: 'brown',
  }
  return colors[category] || 'grey'
}

function formatCategory(category: string): string {
  return category?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || category
}
</script>

<style lang="scss" scoped>
.audit-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-1px);
  }
}
.change-data {
  font-size: 11px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 4px;
  margin: 4px 0 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.old-data {
  background: #ffebee;
}
.new-data {
  background: #e8f5e9;
}
</style>
