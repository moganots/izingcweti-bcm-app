<template>
  <q-page padding>
    <PageHeader title="Notification Settings" subtitle="Configure how you receive notifications" />

    <div class="q-gutter-md">
      <!-- Channel Settings -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Notification Channels</div>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="notifications" color="primary" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Push Notifications</q-item-label>
                <q-item-label caption>Receive push notifications on your device</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="channels.push"
                  color="primary"
                  @update:model-value="saveChannelSetting('push', channels.push)"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section avatar>
                <q-icon name="email" color="info" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Email Notifications</q-item-label>
                <q-item-label caption>Receive notifications via email</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="channels.email"
                  color="primary"
                  @update:model-value="saveChannelSetting('email', channels.email)"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section avatar>
                <q-icon name="sms" color="secondary" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>SMS Notifications</q-item-label>
                <q-item-label caption>Receive notifications via SMS</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="channels.sms"
                  color="primary"
                  @update:model-value="saveChannelSetting('sms', channels.sms)"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section avatar>
                <q-icon name="phone_android" color="green" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>In-App Notifications</q-item-label>
                <q-item-label caption>Show notifications within the app</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="channels.in_app"
                  color="primary"
                  @update:model-value="saveChannelSetting('in_app', channels.in_app)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Notification Types -->
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Notification Types</div>
            <q-btn flat color="primary" label="Enable All" @click="enableAll" />
            <q-btn flat color="grey" label="Disable All" @click="disableAll" />
          </div>
          <q-list separator>
            <q-item v-for="pref in typePreferences" :key="pref.type">
              <q-item-section avatar>
                <q-icon :name="pref.icon" :color="pref.color" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ pref.label }}</q-item-label>
                <q-item-label caption>{{ pref.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="pref.enabled"
                  color="primary"
                  @update:model-value="saveTypeSetting(pref.type, pref.enabled)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Quiet Hours -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Quiet Hours</div>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>Enable Quiet Hours</q-item-label>
                <q-item-label caption>Mute notifications during specified hours</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="quietHours.enabled"
                  color="primary"
                  @update:model-value="saveQuietHours"
                />
              </q-item-section>
            </q-item>

            <template v-if="quietHours.enabled">
              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label>Start Time</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="quietHours.start"
                    outlined
                    dense
                    type="time"
                    style="width: 150px"
                    @update:model-value="saveQuietHours"
                  />
                </q-item-section>
              </q-item>

              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label>End Time</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="quietHours.end"
                    outlined
                    dense
                    type="time"
                    style="width: 150px"
                    @update:model-value="saveQuietHours"
                  />
                </q-item-section>
              </q-item>

              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label>Allow Critical Alerts</q-item-label>
                  <q-item-label caption
                    >Critical and emergency notifications will still come through</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="quietHours.allowCritical"
                    color="primary"
                    @update:model-value="saveQuietHours"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Reset -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md text-negative">Reset</div>
          <q-btn
            color="negative"
            icon="restart_alt"
            label="Reset All Notification Settings"
            class="full-width"
            outline
            @click="confirmReset"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from '../../components/.common/PageHeader.vue'

const $q = useQuasar()

// Channel settings
const channels = reactive({
  push: true,
  email: true,
  sms: false,
  in_app: true,
})

// Type preferences
const typePreferences = ref([
  {
    type: 'WORKFLOW',
    label: 'Workflow Updates',
    description: 'Approval requests and status changes',
    icon: 'account_tree',
    color: 'primary',
    enabled: true,
  },
  {
    type: 'INCIDENT',
    label: 'Incident Alerts',
    description: 'New incidents and status updates',
    icon: 'report',
    color: 'negative',
    enabled: true,
  },
  {
    type: 'RISK',
    label: 'Risk Alerts',
    description: 'Risk threshold breaches',
    icon: 'warning',
    color: 'warning',
    enabled: true,
  },
  {
    type: 'COMPLIANCE',
    label: 'Compliance Reminders',
    description: 'Audit due dates and status changes',
    icon: 'verified',
    color: 'green',
    enabled: true,
  },
  {
    type: 'BCP',
    label: 'BCP Updates',
    description: 'Plan status changes and review reminders',
    icon: 'description',
    color: 'info',
    enabled: true,
  },
  {
    type: 'DOCUMENT',
    label: 'Document Updates',
    description: 'Document approvals and status changes',
    icon: 'folder',
    color: 'secondary',
    enabled: true,
  },
  {
    type: 'TRAINING',
    label: 'Training',
    description: 'Training assignments and completions',
    icon: 'school',
    color: 'teal',
    enabled: true,
  },
  {
    type: 'SYNC',
    label: 'Sync Notifications',
    description: 'Sync status and conflicts',
    icon: 'sync',
    color: 'orange',
    enabled: true,
  },
  {
    type: 'SYSTEM',
    label: 'System Notifications',
    description: 'Maintenance and system updates',
    icon: 'settings',
    color: 'grey',
    enabled: true,
  },
])

// Quiet hours
const quietHours = reactive({
  enabled: false,
  start: '22:00',
  end: '07:00',
  allowCritical: true,
})

// Methods
function saveChannelSetting(channel: string, value: boolean): void {
  console.log(`Channel ${channel} set to ${value}`)
  $q.notify({ type: 'positive', message: 'Setting saved', timeout: 1500 })
}

function saveTypeSetting(type: string, value: boolean): void {
  console.log(`Type ${type} set to ${value}`)
  $q.notify({ type: 'positive', message: 'Setting saved', timeout: 1500 })
}

function saveQuietHours(): void {
  console.log('Quiet hours updated:', quietHours)
  $q.notify({ type: 'positive', message: 'Quiet hours saved', timeout: 1500 })
}

function enableAll(): void {
  typePreferences.value.forEach((p) => (p.enabled = true))
  $q.notify({ type: 'positive', message: 'All notifications enabled', timeout: 1500 })
}

function disableAll(): void {
  typePreferences.value.forEach((p) => (p.enabled = false))
  $q.notify({ type: 'positive', message: 'All notifications disabled', timeout: 1500 })
}

function confirmReset(): void {
  $q.dialog({
    title: 'Reset Notification Settings',
    message: 'This will reset all notification settings to defaults. Continue?',
    cancel: true,
    ok: { color: 'negative', label: 'Reset' },
  }).onOk(() => {
    channels.push = true
    channels.email = true
    channels.sms = false
    channels.in_app = true
    typePreferences.value.forEach((p) => (p.enabled = true))
    quietHours.enabled = false
    quietHours.start = '22:00'
    quietHours.end = '07:00'
    quietHours.allowCritical = true
    $q.notify({ type: 'positive', message: 'Settings reset to defaults' })
  })
}
</script>
