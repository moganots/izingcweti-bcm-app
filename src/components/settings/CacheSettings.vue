<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Cache & Storage</div>

      <!-- Storage Usage -->
      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-body2">Storage Used</span>
          <span class="text-caption text-grey-7">{{ storageUsed }} / {{ storageTotal }}</span>
        </div>
        <q-linear-progress
          :value="storagePercentage / 100"
          :color="storageColor"
          size="15px"
          rounded
        />
      </div>

      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Enable Caching</q-item-label>
            <q-item-label caption>Store data locally for offline access</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="cacheEnabled"
              color="primary"
              @update:model-value="$emit('update:cache-enabled', cacheEnabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Cache Duration</q-item-label>
            <q-item-label caption>How long to keep cached data</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="cacheDuration"
              :options="durationOptions"
              outlined
              dense
              style="width: 130px"
              @update:model-value="$emit('update:cache-duration', cacheDuration)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Offline Mode</q-item-label>
            <q-item-label caption>Enable full offline functionality</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="offlineMode"
              color="primary"
              @update:model-value="$emit('update:offline-mode', offlineMode)"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-6">
          <q-btn
            outline
            color="primary"
            icon="cleaning_services"
            label="Clear Cache"
            class="full-width"
            @click="$emit('clear-cache')"
          />
        </div>
        <div class="col-6">
          <q-btn
            outline
            color="negative"
            icon="delete_forever"
            label="Clear All Data"
            class="full-width"
            @click="$emit('clear-all-data')"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    cacheEnabled?: boolean
    cacheDuration?: number
    offlineMode?: boolean
    storageUsed?: string
    storageTotal?: string
    storagePercentage?: number
  }>(),
  {
    cacheEnabled: true,
    cacheDuration: 3600,
    offlineMode: true,
    storageUsed: '0 MB',
    storageTotal: '50 MB',
    storagePercentage: 0,
  }
)

defineEmits<{
  'update:cache-enabled': [value: boolean]
  'update:cache-duration': [value: number]
  'update:offline-mode': [value: boolean]
  'clear-cache': []
  'clear-all-data': []
}>()

const cacheEnabled = ref(props.cacheEnabled)
const cacheDuration = ref(props.cacheDuration)
const offlineMode = ref(props.offlineMode)

const durationOptions = [
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '12 hours', value: 43200 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 },
]

const storageColor = computed(() => {
  if (props.storagePercentage > 90) return 'red'
  if (props.storagePercentage > 70) return 'orange'
  if (props.storagePercentage > 50) return 'yellow'
  return 'green'
})
</script>
