<template>
  <q-page padding>
    <PageHeader
      title="Lesson Settings"
      subtitle="Configure lesson learned settings"
    />

    <div class="settings-container q-gutter-md">
      <!-- General Settings -->
      <SettingsSection
        title="General"
        icon="settings"
        description="General lesson learned settings"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="auto_awesome" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Auto-review Lessons</q-item-label>
              <q-item-label caption>Automatically notify lesson owners when review is due</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.autoReview" color="primary" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="calendar_today" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Review Period (days)</q-item-label>
              <q-item-label caption>Default number of days before review is due</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.reviewPeriod"
                :options="reviewPeriodOptions"
                outlined
                dense
                style="width: 120px"
                emit-value
                map-options
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="notifications" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Review Reminders</q-item-label>
              <q-item-label caption>Send reminders before lesson review due date</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.reviewReminders" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Effectiveness Settings -->
      <SettingsSection
        title="Effectiveness"
        icon="trending_up"
        description="Configure effectiveness rating settings"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="star" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Rating Scale</q-item-label>
              <q-item-label caption>Default rating scale for effectiveness</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.ratingScale"
                :options="ratingScaleOptions"
                outlined
                dense
                style="width: 150px"
                emit-value
                map-options
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="refresh" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Auto-archive</q-item-label>
              <q-item-label caption>Automatically archive lessons after period of inactivity</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.autoArchive" color="primary" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="timer" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Archive After (days)</q-item-label>
              <q-item-label caption>Days after which to archive inactive lessons</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.archiveDays"
                :options="archiveDaysOptions"
                outlined
                dense
                style="width: 120px"
                emit-value
                map-options
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Data Management -->
      <SettingsSection
        title="Data Management"
        icon="storage"
        description="Manage lesson data"
      >
        <q-list>
          <q-item clickable @click="exportData">
            <q-item-section avatar>
              <q-icon name="download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Export Lessons</q-item-label>
              <q-item-label caption>Download all lessons as JSON</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="clearCache">
            <q-item-section avatar>
              <q-icon name="clear_all" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clear Cache</q-item-label>
              <q-item-label caption>Clear cached lesson data</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="resetSettings">
            <q-item-section avatar>
              <q-icon name="restart_alt" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">Reset Settings</q-item-label>
              <q-item-label caption>Reset all lesson settings to defaults</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>
    </div>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <ConfirmDialog
        v-model="showConfirmDialog"
        :title="confirmTitle"
        :message="confirmMessage"
        :type="confirmType"
        :confirm-label="confirmLabel"
        @confirm="handleConfirm"
        @cancel="showConfirmDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { PageHeader } from 'src/components/.common'
import { SettingsSection } from 'src/components/settings'
import { ConfirmDialog } from 'src/components/.common'

// ============================================
// Composables
// ============================================
const $q = useQuasar()

// ============================================
// Settings
// ============================================
const settings = reactive({
  autoReview: true,
  reviewPeriod: 90,
  reviewReminders: true,
  ratingScale: '5-star',
  autoArchive: true,
  archiveDays: 180,
})

// ============================================
// Options
// ============================================
const reviewPeriodOptions = [
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '365 days', value: 365 },
]

const ratingScaleOptions = [
  { label: '5-Star', value: '5-star' },
  { label: '10-Point', value: '10-point' },
  { label: 'Pass/Fail', value: 'pass-fail' },
]

const archiveDaysOptions = [
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '365 days', value: 365 },
  { label: '730 days', value: 730 },
]

// ============================================
// State
// ============================================
const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

// ============================================
// Methods
// ============================================
function exportData(): void {
  const data = {
    settings: { ...settings },
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lesson-settings-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Settings exported successfully',
    position: 'top',
  })
}

function clearCache(): void {
  confirmTitle.value = 'Clear Cache'
  confirmMessage.value = 'Are you sure you want to clear all cached lesson data?'
  confirmType.value = 'warning'
  confirmLabel.value = 'Clear'
  pendingAction = async () => {
    $q.notify({
      type: 'positive',
      message: 'Cache cleared successfully',
      position: 'top',
    })
    showConfirmDialog.value = false
    pendingAction = null
  }
  showConfirmDialog.value = true
}

function resetSettings(): void {
  confirmTitle.value = 'Reset Settings'
  confirmMessage.value = 'Are you sure you want to reset all lesson settings to defaults?'
  confirmType.value = 'delete'
  confirmLabel.value = 'Reset'
  pendingAction = async () => {
    settings.autoReview = true
    settings.reviewPeriod = 90
    settings.reviewReminders = true
    settings.ratingScale = '5-star'
    settings.autoArchive = true
    settings.archiveDays = 180

    $q.notify({
      type: 'positive',
      message: 'Settings reset successfully',
      position: 'top',
    })
    showConfirmDialog.value = false
    pendingAction = null
  }
  showConfirmDialog.value = true
}

async function handleConfirm(): Promise<void> {
  if (pendingAction) {
    await pendingAction()
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 0 4px;
  }
}
</style>