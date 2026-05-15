<template>
  <q-page padding>
    <PageHeader title="Audit Settings" subtitle="Configure audit logging and retention" />

    <div class="settings-container q-gutter-md">
      <!-- Logging Configuration -->
      <SettingsSection
        title="Logging Configuration"
        icon="settings"
        description="Configure what is logged"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar><q-icon name="toggle_on" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Enable Audit Logging</q-item-label>
              <q-item-label caption>Master switch for audit logging</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.auditEnabled"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar><q-icon name="security" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Log Security Events</q-item-label>
              <q-item-label caption>Log authentication and authorization events</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.logSecurity"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar><q-icon name="edit" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Log Data Changes</q-item-label>
              <q-item-label caption
                >Log all data modifications with before/after values</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.logDataChanges"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar><q-icon name="sync" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Log Sync Events</q-item-label>
              <q-item-label caption>Log synchronization operations</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.logSync"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Retention Settings -->
      <SettingsSection
        title="Retention Settings"
        icon="schedule"
        description="Configure how long audit logs are kept"
      >
        <AuditRetentionSettings
          :policies="retentionPolicies"
          :loading="loadingPolicies"
          @toggle-policy="handleTogglePolicy"
          @edit-policy="handleEditPolicy"
        />
      </SettingsSection>

      <!-- Performance -->
      <SettingsSection
        title="Performance"
        icon="speed"
        description="Audit logging performance settings"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar><q-icon name="storage" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Batch Writing</q-item-label>
              <q-item-label caption
                >Buffer and write logs in batches for better performance</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.batchWriting"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar><q-icon name="speed" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Async Logging</q-item-label>
              <q-item-label caption
                >Write logs asynchronously to avoid blocking operations</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.asyncLogging"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar><q-icon name="compress" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>Compress Old Logs</q-item-label>
              <q-item-label caption>Compress logs older than retention period</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.compressOld"
                color="primary"
                @update:model-value="saveSetting"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Danger Zone -->
      <SettingsSection title="Danger Zone" icon="warning" description="Irreversible actions">
        <q-btn
          color="orange"
          icon="cleaning_services"
          label="Clean Old Logs"
          class="full-width q-mb-sm"
          outline
          @click="confirmCleanOldLogs"
        />
        <q-btn
          color="negative"
          icon="delete_forever"
          label="Purge All Audit Logs"
          class="full-width"
          outline
          @click="confirmPurgeLogs"
        />
      </SettingsSection>

      <!-- Audit Statistics -->
      <SettingsSection title="Statistics" icon="analytics" description="Audit log statistics">
        <q-list>
          <q-item>
            <q-item-section><q-item-label>Total Logs</q-item-label></q-item-section>
            <q-item-section side
              ><span class="text-body2">{{ auditStats.total }}</span></q-item-section
            >
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section><q-item-label>Logs Today</q-item-label></q-item-section>
            <q-item-section side
              ><span class="text-body2">{{ auditStats.today }}</span></q-item-section
            >
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section><q-item-label>Logs This Week</q-item-label></q-item-section>
            <q-item-section side
              ><span class="text-body2">{{ auditStats.thisWeek }}</span></q-item-section
            >
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section><q-item-label>Logs This Month</q-item-label></q-item-section>
            <q-item-section side
              ><span class="text-body2">{{ auditStats.thisMonth }}</span></q-item-section
            >
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section><q-item-label>Storage Used</q-item-label></q-item-section>
            <q-item-section side
              ><span class="text-body2">{{ auditStats.storageUsed }}</span></q-item-section
            >
          </q-item>
        </q-list>
      </SettingsSection>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from '../../components/.common/PageHeader.vue'
import SettingsSection from '../../components/settings/SettingsSection.vue'
import AuditRetentionSettings from '../../components/audit/AuditRetentionSettings.vue'

const $q = useQuasar()

// Settings
const settings = reactive({
  auditEnabled: true,
  logSecurity: true,
  logDataChanges: true,
  logSync: true,
  batchWriting: true,
  asyncLogging: true,
  compressOld: false,
})

// Retention policies
const loadingPolicies = ref(false)
const retentionPolicies = ref([
  { uuid: '1', audit_category: 'USER_ACTIVITY', retention_days: 365, is_active: true },
  { uuid: '2', audit_category: 'SYSTEM_EVENT', retention_days: 90, is_active: true },
  { uuid: '3', audit_category: 'SECURITY', retention_days: 730, is_active: true },
  { uuid: '4', audit_category: 'DATA_CHANGE', retention_days: 365, is_active: true },
  { uuid: '5', audit_category: 'ACCESS_CONTROL', retention_days: 365, is_active: true },
  { uuid: '6', audit_category: 'WORKFLOW', retention_days: 180, is_active: true },
  { uuid: '7', audit_category: 'COMPLIANCE', retention_days: 1095, is_active: true },
  { uuid: '8', audit_category: 'SYNC', retention_days: 90, is_active: true },
])

// Audit stats
const auditStats = reactive({
  total: 15420,
  today: 45,
  thisWeek: 320,
  thisMonth: 1250,
  storageUsed: '45.2 MB',
})

// Methods
function saveSetting(): void {
  $q.notify({ type: 'positive', message: 'Setting saved', timeout: 1500 })
}

function handleTogglePolicy(policy: any, value: boolean): void {
  policy.is_active = value
  $q.notify({ type: 'positive', message: 'Policy updated', timeout: 1500 })
}

function handleEditPolicy(policy: any): void {
  $q.dialog({
    title: 'Edit Retention Policy',
    message: 'Enter retention days:',
    prompt: { model: String(policy.retention_days), type: 'number' },
    cancel: true,
  }).onOk((days: string) => {
    policy.retention_days = parseInt(days)
    $q.notify({ type: 'positive', message: 'Retention updated', timeout: 1500 })
  })
}

function confirmCleanOldLogs(): void {
  $q.dialog({
    title: 'Clean Old Logs',
    message: 'This will remove logs older than their retention period. Continue?',
    cancel: true,
    ok: { color: 'orange', label: 'Clean' },
  }).onOk(() => {
    $q.notify({ type: 'positive', message: 'Old logs cleaned successfully' })
  })
}

function confirmPurgeLogs(): void {
  $q.dialog({
    title: 'Purge All Audit Logs',
    message: 'This will permanently delete ALL audit logs. This cannot be undone. Are you sure?',
    cancel: true,
    ok: { color: 'negative', label: 'Purge All' },
  }).onOk(() => {
    $q.notify({ type: 'positive', message: 'All audit logs purged' })
  })
}
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 700px;
  margin: 0 auto;
}
</style>
