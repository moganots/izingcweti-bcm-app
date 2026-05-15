<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Cache Settings</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Enable Caching</q-item-label>
            <q-item-label caption>Store frequently accessed data locally</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="enabled"
              color="primary"
              @update:model-value="$emit('update:enabled', enabled)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Default TTL (seconds)</q-item-label>
            <q-item-label caption>How long cached data remains valid</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="defaultTTL"
              :options="ttlOptions"
              outlined
              dense
              style="width: 150px"
              @update:model-value="$emit('update:ttl', defaultTTL)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Max Cache Size</q-item-label>
            <q-item-label caption>Maximum storage for cached data</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="maxSize"
              :options="sizeOptions"
              outlined
              dense
              style="width: 130px"
              @update:model-value="$emit('update:max-size', maxSize)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Eviction Policy</q-item-label>
            <q-item-label caption>How old entries are removed when full</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="evictionPolicy"
              :options="evictionOptions"
              outlined
              dense
              style="width: 130px"
              @update:model-value="$emit('update:eviction-policy', evictionPolicy)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Compression</q-item-label>
            <q-item-label caption>Compress cached data to save space</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="compression"
              color="primary"
              @update:model-value="$emit('update:compression', compression)"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-6">
          <q-btn
            outline
            color="primary"
            icon="cleaning_services"
            label="Clear Expired"
            class="full-width"
            @click="$emit('clear-expired')"
          />
        </div>
        <div class="col-6">
          <q-btn
            outline
            color="negative"
            icon="delete_sweep"
            label="Clear All Cache"
            class="full-width"
            @click="$emit('clear-all')"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    enabled?: boolean
    defaultTTL?: number
    maxSize?: number
    evictionPolicy?: string
    compression?: boolean
  }>(),
  {
    enabled: true,
    defaultTTL: 3600,
    maxSize: 50,
    evictionPolicy: 'lru',
    compression: true,
  }
)

defineEmits<{
  'update:enabled': [value: boolean]
  'update:ttl': [value: number]
  'update:max-size': [value: number]
  'update:eviction-policy': [value: string]
  'update:compression': [value: boolean]
  'clear-expired': []
  'clear-all': []
}>()

const enabled = ref(props.enabled)
const defaultTTL = ref(props.defaultTTL)
const maxSize = ref(props.maxSize)
const evictionPolicy = ref(props.evictionPolicy)
const compression = ref(props.compression)

const ttlOptions = [
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '12 hours', value: 43200 },
  { label: '24 hours', value: 86400 },
]

const sizeOptions = [
  { label: '10 MB', value: 10 },
  { label: '25 MB', value: 25 },
  { label: '50 MB', value: 50 },
  { label: '100 MB', value: 100 },
  { label: '250 MB', value: 250 },
]

const evictionOptions = [
  { label: 'LRU (Least Recently Used)', value: 'lru' },
  { label: 'LFU (Least Frequently Used)', value: 'lfu' },
  { label: 'FIFO (First In First Out)', value: 'fifo' },
  { label: 'TTL (Time To Live)', value: 'ttl' },
]
</script>
