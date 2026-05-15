<template>
  <q-page padding>
    <PageHeader
      title="Cache Management"
      subtitle="Monitor and manage application cache"
      show-refresh
      @refresh="loadStats"
    />

    <!-- Stats Overview -->
    <CacheStatsCard
      :total-entries="stats.totalEntries"
      :active-entries="stats.activeEntries"
      :expired-entries="stats.expiredEntries"
      :total-hits="stats.totalHits"
      :hit-ratio="stats.hitRatio"
      :total-size-bytes="stats.totalSizeBytes"
      :max-size-bytes="maxCacheSize"
      :last-updated="stats.lastUpdated"
      class="q-mb-md"
    />

    <!-- Quick Actions -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6">
        <q-btn
          color="primary"
          icon="refresh"
          label="Refresh Stats"
          class="full-width"
          outline
          @click="loadStats"
        />
      </div>
      <div class="col-6">
        <q-btn
          color="orange"
          icon="cleaning_services"
          label="Clean Expired"
          class="full-width"
          outline
          @click="cleanExpired"
        />
      </div>
      <div class="col-12">
        <q-btn
          color="negative"
          icon="delete_sweep"
          label="Clear All Cache"
          class="full-width q-mt-sm"
          outline
          @click="confirmClearAll"
        />
      </div>
    </div>

    <!-- Cache Entry Management -->
    <div class="row q-col-gutter-md">
      <!-- Entry List -->
      <div class="col-12 col-md-7">
        <CacheEntryList
          :entries="filteredEntries"
          :loading="loading"
          :loading-more="loadingMore"
          :has-more="hasMore"
          @view="selectEntry"
          @refresh="refreshEntry"
          @delete="deleteEntry"
          @clear-all="confirmClearAll"
          @load-more="loadMore"
        />
      </div>

      <!-- Entry Detail -->
      <div class="col-12 col-md-5">
        <CacheEntryDetail :entry="selectedEntry" @refresh="refreshEntry" @delete="deleteEntry" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCache } from '../../composables/useCache'
import { formatFileSize } from '../../utils/formatters'
import PageHeader from '../../components/.common/PageHeader.vue'
import CacheStatsCard from '../../components/cache/CacheStatsCard.vue'
import CacheEntryList from '../../components/cache/CacheEntryList.vue'
import CacheEntryDetail from '../../components/cache/CacheEntryDetail.vue'

const $q = useQuasar()
const cache = useCache()

// State
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const maxCacheSize = 50 * 1024 * 1024 // 50MB
const selectedEntry = ref<any>(null)
const entries = ref<any[]>([])
const searchQuery = ref('')

// Stats
const stats = reactive({
  totalEntries: 0,
  activeEntries: 0,
  expiredEntries: 0,
  totalHits: 0,
  hitRatio: 0,
  totalSizeBytes: 0,
  lastUpdated: null as string | null,
})

// Computed
const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value
  const query = searchQuery.value.toLowerCase()
  return entries.value.filter(
    (e: any) => e.key?.toLowerCase().includes(query) || e.tags?.toLowerCase().includes(query)
  )
})

// Lifecycle
onMounted(() => loadStats())

// Methods
async function loadStats(): Promise<void> {
  loading.value = true
  try {
    // Simulate loading stats - replace with actual API call
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'))
    const cacheEntries = keys
      .map((k) => {
        try {
          return JSON.parse(localStorage.getItem(k) || '{}')
        } catch {
          return null
        }
      })
      .filter(Boolean)

    stats.totalEntries = cacheEntries.length
    stats.activeEntries = cacheEntries.filter(
      (e: any) => !e.expiresAt || e.expiresAt > Date.now()
    ).length
    stats.expiredEntries = cacheEntries.filter(
      (e: any) => e.expiresAt && e.expiresAt <= Date.now()
    ).length
    stats.totalHits = cacheEntries.reduce((sum: number, e: any) => sum + (e.hitCount || 0), 0)
    stats.totalSizeBytes = cacheEntries.reduce((sum: number, e: any) => sum + (e.size || 0), 0)
    stats.hitRatio =
      stats.totalEntries > 0 ? Math.round((stats.activeEntries / stats.totalEntries) * 100) : 0
    stats.lastUpdated = new Date().toISOString()

    // Load entries for the list
    entries.value = cacheEntries
  } catch (error) {
    console.error('Failed to load cache stats:', error)
    $q.notify({ type: 'negative', message: 'Failed to load cache statistics' })
  } finally {
    loading.value = false
  }
}

function selectEntry(entry: any): void {
  selectedEntry.value = entry
}

async function refreshEntry(entry: any): Promise<void> {
  try {
    // Extend TTL by resetting timestamp
    const cacheKey = `cache_${entry.key}`
    const data = localStorage.getItem(cacheKey)
    if (data) {
      const parsed = JSON.parse(data)
      parsed.timestamp = Date.now()
      localStorage.setItem(cacheKey, JSON.stringify(parsed))
      $q.notify({ type: 'positive', message: 'Entry TTL refreshed' })
      await loadStats()
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to refresh entry' })
  }
}

function deleteEntry(entry: any): void {
  $q.dialog({
    title: 'Delete Cache Entry',
    message: `Are you sure you want to delete "${entry.key}"?`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      localStorage.removeItem(`cache_${entry.key}`)
      entries.value = entries.value.filter((e: any) => e.key !== entry.key)
      if (selectedEntry.value?.key === entry.key) {
        selectedEntry.value = null
      }
      $q.notify({ type: 'positive', message: 'Entry deleted' })
      await loadStats()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete entry' })
    }
  })
}

async function cleanExpired(): Promise<void> {
  loading.value = true
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'))
    let cleaned = 0

    for (const key of keys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.expiresAt && data.expiresAt <= Date.now()) {
          localStorage.removeItem(key)
          cleaned++
        }
      } catch {
        localStorage.removeItem(key)
        cleaned++
      }
    }

    $q.notify({
      type: 'positive',
      message: `Cleaned ${cleaned} expired entr${cleaned !== 1 ? 'ies' : 'y'}`,
    })
    await loadStats()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to clean expired entries' })
  } finally {
    loading.value = false
  }
}

function confirmClearAll(): void {
  $q.dialog({
    title: 'Clear All Cache',
    message: 'Are you sure you want to clear all cached data? This cannot be undone.',
    cancel: true,
    ok: { color: 'negative', label: 'Clear All' },
  }).onOk(async () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'))
      keys.forEach((k) => localStorage.removeItem(k))
      entries.value = []
      selectedEntry.value = null
      $q.notify({ type: 'positive', message: `Cleared ${keys.length} cache entries` })
      await loadStats()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to clear cache' })
    }
  })
}

function loadMore(): void {
  // Pagination logic if needed
  hasMore.value = false
}
</script>
