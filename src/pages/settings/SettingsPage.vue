<template>
  <div class="settings-page">
    <div class="text-h4 q-mb-md">Settings</div>

    <q-tabs v-model="activeTab" dense class="text-primary" align="left">
      <q-tab name="general" label="General" />
      <q-tab name="security" label="Security" />
      <q-tab name="sessions" label="Active Sessions" />
      <q-tab name="notifications" label="Notifications" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="activeTab" animated>
      <!-- General Settings -->
      <q-tab-panel name="general">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">General Preferences</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="settings.theme"
                  :options="themeOptions"
                  label="Theme"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="settings.language"
                  :options="languageOptions"
                  label="Language"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="settings.timezone"
                  :options="timezoneOptions"
                  label="Timezone"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="settings.dateFormat"
                  :options="dateFormatOptions"
                  label="Date Format"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Save" color="primary" @click="saveSettings" unelevated />
          </q-card-actions>
        </q-card>
      </q-tab-panel>

      <!-- Security Settings -->
      <q-tab-panel name="security">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Security Settings</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row">
              <div class="col-12 q-mb-md">
                <q-btn
                  outline
                  color="primary"
                  label="Change Password"
                  icon="lock"
                  @click="showChangePassword = true"
                />
              </div>
              <div class="col-12">
                <q-toggle
                  v-model="settings.twoFactorAuth"
                  label="Enable Two-Factor Authentication (2FA)"
                  class="q-mb-md"
                />
                <div v-if="settings.twoFactorAuth" class="q-ml-lg">
                  <q-btn outline label="Setup 2FA" color="primary" @click="setup2FA" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Active Sessions -->
      <q-tab-panel name="sessions">
        <SessionList :sessions="sessions" @revoke="revokeSession" />
      </q-tab-panel>

      <!-- Notification Settings -->
      <q-tab-panel name="notifications">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Notification Preferences</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle v-model="notificationPrefs.email" label="Email Notifications" />
                <q-toggle v-model="notificationPrefs.push" label="Push Notifications" />
                <q-toggle v-model="notificationPrefs.sms" label="SMS Notifications" />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle v-model="notificationPrefs.workflow_updates" label="Workflow Updates" />
                <q-toggle v-model="notificationPrefs.risk_alerts" label="Risk Alerts" />
                <q-toggle v-model="notificationPrefs.incident_alerts" label="Incident Alerts" />
                <q-toggle
                  v-model="notificationPrefs.compliance_reminders"
                  label="Compliance Reminders"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Save" color="primary" @click="saveNotifications" unelevated />
          </q-card-actions>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePassword">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Change Password</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <ChangePasswordForm @submit="handleChangePassword" @cancel="showChangePassword = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'
import { SessionList, ChangePasswordForm } from 'src/components/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const activeTab = ref('general')
const showChangePassword = ref(false)

const settings = reactive({
  theme: 'light',
  language: 'en',
  timezone: 'Africa/Johannesburg',
  dateFormat: 'yyyy-MM-DD',
  twoFactorAuth: false,
})

const notificationPrefs = reactive({
  email: true,
  push: true,
  sms: false,
  workflow_updates: true,
  risk_alerts: true,
  incident_alerts: true,
  compliance_reminders: true,
})

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Afrikaans', value: 'af' },
  { label: 'Zulu', value: 'zu' },
  { label: 'Xhosa', value: 'xh' },
]

const timezoneOptions = [
  { label: 'Africa/Johannesburg', value: 'Africa/Johannesburg' },
  { label: 'Africa/Cairo', value: 'Africa/Cairo' },
  { label: 'Africa/Lagos', value: 'Africa/Lagos' },
]

const dateFormatOptions = [
  { label: 'yyyy-MM-DD', value: 'yyyy-MM-DD' },
  { label: 'DD/MM/yyyy', value: 'DD/MM/yyyy' },
  { label: 'MM/DD/yyyy', value: 'MM/DD/yyyy' },
]

const sessions = ref([
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'Johannesburg, SA',
    lastActive: 'Just now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Cape Town, SA',
    lastActive: '2 days ago',
    isCurrent: false,
  },
])

function saveSettings() {
  $q.notify({
    type: 'positive',
    message: 'Settings saved successfully',
    position: 'top',
  })
}

function saveNotifications() {
  $q.notify({
    type: 'positive',
    message: 'Notification preferences saved',
    position: 'top',
  })
}

function setup2FA() {
  $q.notify({
    type: 'info',
    message: '2FA setup would open here',
    position: 'top',
  })
}

function revokeSession(sessionId: string) {
  sessions.value = sessions.value.filter((s) => s.id !== sessionId)
  $q.notify({
    type: 'positive',
    message: 'Session revoked successfully',
    position: 'top',
  })
}

async function handleChangePassword(data: { currentPassword: string; newPassword: string }) {
  try {
    await authStore.changePassword(data.currentPassword, data.newPassword)
    showChangePassword.value = false
    $q.notify({
      type: 'positive',
      message: 'Password changed successfully',
      position: 'top',
    })
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to change password',
      position: 'top',
    })
  }
}
</script>
