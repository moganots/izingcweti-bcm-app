<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Notification Preferences</div>
      <div class="text-caption text-grey-7 q-mb-lg">
        Choose how you want to receive notifications for each type.
      </div>

      <q-list separator>
        <q-item v-for="pref in preferences" :key="pref.type">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ pref.label }}</q-item-label>
            <q-item-label caption>{{ pref.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-toggle
                v-model="pref.in_app"
                color="primary"
                size="sm"
                :true-value="true"
                :false-value="false"
                @update:model-value="updatePreference(pref)"
              >
                <q-tooltip>In-App</q-tooltip>
              </q-toggle>
              <q-toggle
                v-if="showEmail"
                v-model="pref.email"
                color="primary"
                size="sm"
                @update:model-value="updatePreference(pref)"
              >
                <q-tooltip>Email</q-tooltip>
              </q-toggle>
              <q-toggle
                v-if="showPush"
                v-model="pref.push"
                color="primary"
                size="sm"
                @update:model-value="updatePreference(pref)"
              >
                <q-tooltip>Push</q-tooltip>
              </q-toggle>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    preferences?: Array<{
      type: string
      label: string
      description: string
      in_app: boolean
      email: boolean
      push: boolean
    }>
    showEmail?: boolean
    showPush?: boolean
  }>(),
  {
    preferences: () => [],
    showEmail: true,
    showPush: true,
  }
)

const emit = defineEmits<{
  'update-preference': [pref: { type: string; in_app: boolean; email: boolean; push: boolean }]
}>()

function updatePreference(pref: any): void {
  emit('update-preference', {
    type: pref.type,
    in_app: pref.in_app,
    email: pref.email,
    push: pref.push,
  })
}
</script>
