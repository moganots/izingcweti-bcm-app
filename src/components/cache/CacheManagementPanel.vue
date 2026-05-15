<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Cache Management</div>
        <CacheStatusBadge
          :enabled="cacheEnabled || false"
          :entry-count="totalEntries || 0"
          :size-bytes="totalSizeBytes || 0"
        />
      </div>

      <!-- Quick Stats Row -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-3">
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6">{{ totalEntries }}</div>
              <div class="text-caption text-grey-7">Entries</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-3">
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6">{{ activeEntries }}</div>
              <div class="text-caption text-grey-7">Active</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-3">
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6">{{ hitRatio }}%</div>
              <div class="text-caption text-grey-7">Hit Rate</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-3">
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6">{{ formatFileSize(totalSizeBytes) }}</div>
              <div class="text-caption text-grey-7">Size</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Actions -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-btn
            color="primary"
            icon="refresh"
            label="Refresh Stats"
            class="full-width"
            outline
            @click="$emit('refresh')"
          />
        </div>
        <div class="col-6">
          <q-btn
            color="orange"
            icon="cleaning_services"
            label="Clean Expired"
            class="full-width"
            outline
            @click="$emit('clean-expired')"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatFileSize } from '../../utils/formatters'
import CacheStatusBadge from './CacheStatusBadge.vue'

defineProps<{
  cacheEnabled?: boolean
  totalEntries?: number
  activeEntries?: number
  hitRatio?: number
  totalSizeBytes?: number
}>()

defineEmits<{
  refresh: []
  'clean-expired': []
}>()
</script>
