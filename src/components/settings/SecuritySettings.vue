<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Security</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Biometric Authentication</q-item-label>
            <q-item-label caption>Use fingerprint or face ID to unlock</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="biometricEnabled"
              color="primary"
              :disable="!biometricAvailable"
              @update:model-value="$emit('update:biometric', biometricEnabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('change-password')">
          <q-item-section avatar>
            <q-icon name="lock" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Change Password</q-item-label>
            <q-item-label caption>Update your account password</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Session Timeout</q-item-label>
            <q-item-label caption>Auto logout after inactivity</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="sessionTimeout"
              :options="timeoutOptions"
              outlined
              dense
              style="width: 140px"
              @update:model-value="$emit('update:session-timeout', sessionTimeout)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('view-sessions')">
          <q-item-section avatar>
            <q-icon name="devices" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Active Sessions</q-item-label>
            <q-item-label caption>Manage your active sessions</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge v-if="sessionCount > 1" color="primary" :label="String(sessionCount)" />
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    biometricEnabled?: boolean
    biometricAvailable?: boolean
    sessionTimeout?: number
    sessionCount?: number
  }>(),
  {
    biometricEnabled: false,
    biometricAvailable: false,
    sessionTimeout: 30,
    sessionCount: 1,
  }
)

defineEmits<{
  'update:biometric': [value: boolean]
  'update:session-timeout': [value: number]
  'change-password': []
  'view-sessions': []
}>()

const biometricEnabled = ref(props.biometricEnabled)
const sessionTimeout = ref(props.sessionTimeout)

const timeoutOptions = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: 'Never', value: 0 },
]
</script>
