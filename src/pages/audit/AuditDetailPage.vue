<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading audit log..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!log" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Audit Log Not Found</h5>
      <q-btn color="primary" label="Back to Audit Logs" @click="$router.push('/audit')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back Button -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to Audit Logs"
        class="q-mb-md"
        @click="$router.push('/audit')"
      />

      <!-- Header Card -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="row items-center q-gutter-sm q-mb-sm">
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
              <h5 class="text-h5 q-mb-xs">Audit Log Entry</h5>
              <p class="text-grey-7 q-mb-none">
                {{ formatDateTime(log.created_at) }}
                <span v-if="log.user"> | User: {{ log.user?.email || log.user_id }}</span>
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Details -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Description -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-sm">Description</div>
              <p class="text-body1 q-mb-none">{{ log.description }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Entity Info -->
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="category" size="24px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Entity Type</div>
              <div class="text-body2 text-weight-medium">{{ log.entity_type }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="tag" size="24px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Entity ID</div>
              <div class="text-body2 text-weight-medium">
                {{ log.entity_id?.substring(0, 8) }}...
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3" v-if="log.user">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="person" size="24px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">User</div>
              <div class="text-body2 text-weight-medium">{{ log.user?.email || log.user_id }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3" v-if="log.organisation">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="business" size="24px" color="purple" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Organisation</div>
              <div class="text-body2 text-weight-medium">{{ log.organisation?.name }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Request Context -->
      <q-card v-if="hasRequestContext" class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Request Context</div>
          <div class="row q-col-gutter-md text-center">
            <div class="col-4" v-if="log.ip_address">
              <q-icon name="language" size="24px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">IP Address</div>
              <div class="text-body2">{{ log.ip_address }}</div>
            </div>
            <div class="col-4" v-if="log.request_method">
              <q-icon name="http" size="24px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Method</div>
              <div class="text-body2">{{ log.request_method }}</div>
            </div>
            <div class="col-4" v-if="log.request_path">
              <q-icon name="link" size="24px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Path</div>
              <div class="text-body2 text-caption">{{ log.request_path }}</div>
            </div>
            <div class="col-4" v-if="log.response_status">
              <q-icon
                name="check_circle"
                size="24px"
                :color="log.response_status < 400 ? 'green' : 'red'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Status</div>
              <div class="text-body2">{{ log.response_status }}</div>
            </div>
            <div class="col-4" v-if="log.execution_time_ms">
              <q-icon name="timer" size="24px" color="orange" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Execution Time</div>
              <div class="text-body2">{{ log.execution_time_ms }}ms</div>
            </div>
            <div class="col-4" v-if="log.session_id">
              <q-icon name="fingerprint" size="24px" color="grey" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Session</div>
              <div class="text-body2 text-caption">{{ log.session_id?.substring(0, 12) }}...</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Changes -->
      <q-card v-if="log.old_value || log.new_value" class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Changes</div>
          <div class="row q-col-gutter-md">
            <div class="col-6" v-if="log.old_value">
              <q-card flat bordered class="bg-red-1">
                <q-card-section>
                  <div class="text-subtitle2 text-red q-mb-sm">Before</div>
                  <pre class="change-data">{{ formatJSON(log.old_value) }}</pre>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6" v-if="log.new_value">
              <q-card flat bordered class="bg-green-1">
                <q-card-section>
                  <div class="text-subtitle2 text-green q-mb-sm">After</div>
                  <pre class="change-data">{{ formatJSON(log.new_value) }}</pre>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Metadata -->
      <q-card v-if="log.metadata" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Additional Metadata</div>
          <pre class="metadata-data">{{ formatJSON(log.metadata) }}</pre>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuditStore } from '../../stores/audit.store'
import { formatDateTime } from '../../utils/date.utils'
import { formatJSON } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'

const route = useRoute()
const auditStore = useAuditStore()

const log = computed(() => auditStore.selectedLog)
const isLoading = ref(true)

const hasRequestContext = computed(() => {
  if (!log.value) return false
  return !!(
    log.value.ip_address ||
    log.value.request_method ||
    log.value.request_path ||
    log.value.response_status ||
    log.value.execution_time_ms ||
    log.value.session_id
  )
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await auditStore.loadLog(id)
    isLoading.value = false
  }
})

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
    PERFORMANCE: 'indigo',
  }
  return colors[category] || 'grey'
}

function formatCategory(category: string): string {
  return category?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || category
}
</script>

<style lang="scss" scoped>
.change-data,
.metadata-data {
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 8px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f5f5f5;
}
</style>
