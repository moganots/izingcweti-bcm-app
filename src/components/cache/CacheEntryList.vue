<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          Cache Entries
          <q-badge v-if="entries.length > 0" color="primary" class="q-ml-sm">{{
            entries.length
          }}</q-badge>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            v-if="entries.length > 0"
            flat
            color="negative"
            icon="delete_sweep"
            label="Clear All"
            @click="$emit('clear-all')"
          />
        </div>
      </div>

      <!-- Search -->
      <q-input
        v-model="search"
        outlined
        dense
        placeholder="Search cache entries..."
        clearable
        class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <!-- Empty -->
      <div v-else-if="filteredEntries.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="storage" size="40px" color="grey-4" class="q-mb-sm" />
        <div>{{ search ? 'No matching entries' : 'No cache entries' }}</div>
      </div>

      <!-- Entry List -->
      <q-list v-else separator>
        <q-item v-for="entry in filteredEntries" :key="entry.key">
          <q-item-section avatar>
            <q-icon
              :name="isExpired(entry) ? 'timer_off' : 'check_circle'"
              :color="isExpired(entry) ? 'orange' : 'green'"
              size="20px"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ entry.key }}</q-item-label>
            <q-item-label caption>
              Size: {{ formatFileSize(entry.size_bytes) }}
              <span v-if="entry.tags" class="q-ml-sm">Tags: {{ entry.tags }}</span>
            </q-item-label>
            <q-item-label caption>
              Hits: {{ entry.hit_count }} |
              <span v-if="entry.expires_at">Expires: {{ formatTimeAgo(entry.expires_at) }}</span>
              <span v-else>No expiry</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge
              :color="isExpired(entry) ? 'orange' : 'green'"
              :label="isExpired(entry) ? 'Expired' : 'Active'"
            />
          </q-item-section>

          <q-item-section side>
            <q-btn flat round size="sm" icon="more_vert">
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="$emit('view', entry)">
                    <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                    <q-item-section>View Data</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="$emit('refresh', entry)">
                    <q-item-section avatar><q-icon name="refresh" /></q-item-section>
                    <q-item-section>Refresh TTL</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="$emit('delete', entry)">
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative">Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center q-mt-md">
        <q-btn
          outline
          color="primary"
          label="Load More"
          :loading="loadingMore"
          @click="$emit('load-more')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    entries?: any[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
  }>(),
  {
    entries: () => [],
    loading: false,
    loadingMore: false,
    hasMore: false,
  }
)

defineEmits<{
  view: [entry: any]
  refresh: [entry: any]
  delete: [entry: any]
  'clear-all': []
  'load-more': []
}>()

const search = ref('')

const filteredEntries = computed(() => {
  if (!search.value) return props.entries
  const query = search.value.toLowerCase()
  return props.entries.filter(
    (e: any) => e.key?.toLowerCase().includes(query) || e.tags?.toLowerCase().includes(query)
  )
})

function isExpired(entry: any): boolean {
  if (!entry.expires_at) return false
  return new Date(entry.expires_at) < new Date()
}
</script>
