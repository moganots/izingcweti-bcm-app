<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Notification Preferences</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Push Notifications</q-item-label>
            <q-item-label caption>Receive push notifications on your device</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="pushEnabled"
              color="primary"
              @update:model-value="$emit('update:push', pushEnabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Email Notifications</q-item-label>
            <q-item-label caption>Receive notifications via email</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="emailEnabled"
              color="primary"
              @update:model-value="$emit('update:email', emailEnabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>SMS Notifications</q-item-label>
            <q-item-label caption>Receive notifications via SMS</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="smsEnabled"
              color="primary"
              @update:model-value="$emit('update:sms', smsEnabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>In-App Notifications</q-item-label>
            <q-item-label caption>Show notifications within the app</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="inAppEnabled"
              color="primary"
              @update:model-value="$emit('update:in-app', inAppEnabled)"
            />
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
    pushEnabled?: boolean
    emailEnabled?: boolean
    smsEnabled?: boolean
    inAppEnabled?: boolean
  }>(),
  {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
  }
)

defineEmits<{
  'update:push': [value: boolean]
  'update:email': [value: boolean]
  'update:sms': [value: boolean]
  'update:in-app': [value: boolean]
}>()

const pushEnabled = ref(props.pushEnabled)
const emailEnabled = ref(props.emailEnabled)
const smsEnabled = ref(props.smsEnabled)
const inAppEnabled = ref(props.inAppEnabled)
</script>
