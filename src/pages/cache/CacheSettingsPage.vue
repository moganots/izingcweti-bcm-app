<template>
  <q-page padding>
    <PageHeader title="Cache Settings" subtitle="Configure cache behavior and storage" />

    <div class="q-gutter-md">
      <!-- Cache Configuration -->
      <CacheSettings
        :enabled="settings.enabled"
        :default-t-t-l="settings.defaultTTL"
        :max-size="settings.maxSize"
        :eviction-policy="settings.evictionPolicy"
        :compression="settings.compression"
        @update:enabled="updateSetting('enabled', $event)"
        @update:ttl="updateSetting('defaultTTL', $event)"
        @update:max-size="updateSetting('maxSize', $event)"
        @update:eviction-policy="updateSetting('evictionPolicy', $event)"
        @update:compression="updateSetting('compression', $event)"
        @clear-expired="handleClearExpired"
        @clear-all="confirmClearAll"
      />

      <!-- Storage Usage -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Storage Usage</div>

          <div class="q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-body2">Total Storage</span>
              <span class="text-caption text-grey-7"
                >{{ formatFileSize(storageUsed) }} / {{ formatFileSize(storageQuota) }}</span
              >
            </div>
            <q-linear-progress
              :value="storagePercentage / 100"
              :color="storageColor"
              size="20px"
              rounded
            />
          </div>

          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>Cache Size</q-item-label>
                <q-item-label caption>Space used by cached data</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ formatFileSize(cacheSize) }}</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Other Data</q-item-label>
                <q-item-label caption>Space used by application data</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ formatFileSize(otherDataSize) }}</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Available</q-item-label>
                <q-item-label caption>Free space remaining</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2 text-green">{{ formatFileSize(availableSpace) }}</span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Cache Performance -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Performance</div>

          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>Cache Hit Ratio</q-item-label>
                <q-item-label caption>Percentage of requests served from cache</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="hitRatioColor" :label="hitRatio + '%'" class="q-px-md" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Total Cache Hits</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ totalHits.toLocaleString() }}</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Total Cache Misses</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ totalMisses.toLocaleString() }}</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Average Response Time (cached)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ avgCachedTime }}ms</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Average Response Time (uncached)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="text-body2">{{ avgUncachedTime }}ms</span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Reset -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md text-negative">Danger Zone</div>
          <q-btn
            color="negative"
            icon="delete_forever"
            label="Reset All Cache Settings"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { formatFileSize } from '../../utils/formatters'
import PageHeader from '../../components/.common/PageHeader.vue'
import CacheSettings from '../../components/cache/CacheSettings.vue'
import { StorageUtils } from '../../utils/storage.utils'

const $q = useQuasar()

// Settings
const settings = reactive({
  enabled: true,
  defaultTTL: 3600,
  maxSize: 50,
  evictionPolicy: 'lru',
  compression: true,
})

// Storage stats
const storageUsed = ref(0)
const storageQuota = ref(100 * 1024 * 1024) // 100MB
const cacheSize = ref(0)
const otherDataSize = ref(0)
const availableSpace = ref(0)

// Performance stats
const hitRatio = ref(85)
const totalHits = ref(1250)
const totalMisses = ref(220)
const avgCachedTime = ref(12)
const avgUncachedTime = ref(245)

// Computed
const storagePercentage = computed(() => {
  if (storageQuota.value === 0) return 0
  return Math.round((storageUsed.value / storageQuota.value) * 100)
})

const storageColor = computed(() => {
  if (storagePercentage.value > 90) return 'red'
  if (storagePercentage.value > 70) return 'orange'
  if (storagePercentage.value > 50) return 'yellow'
  return 'green'
})

const hitRatioColor = computed(() => {
  if (hitRatio.value >= 80) return 'green'
  if (hitRatio.value >= 50) return 'orange'
  return 'red'
})

// Lifecycle
onMounted(() => loadStorageStats())

async function loadStorageStats(): Promise<void> {
  try {
    // Load settings from storage
    const saved = await StorageUtils.getSettings()
    if (saved) {
      settings.enabled = saved.cacheEnabled ?? true
    }

    // Calculate storage usage
    const keys = Object.keys(localStorage)
    let totalSize = 0
    let cacheOnly = 0

    keys.forEach((key) => {
      const value = localStorage.getItem(key) || ''
      const size = new Blob([value]).size
      totalSize += size
      if (key.startsWith('cache_')) {
        cacheOnly += size
      }
    })

    storageUsed.value = totalSize
    cacheSize.value = cacheOnly
    otherDataSize.value = totalSize - cacheOnly
    availableSpace.value = storageQuota.value - totalSize

    // Estimate storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      if (estimate.quota) {
        storageQuota.value = estimate.quota
        availableSpace.value = estimate.quota - (estimate.usage || totalSize)
      }
    }
  } catch (error) {
    console.error('Failed to load storage stats:', error)
  }
}

function updateSetting(key: string, value: any): void {
  ;(settings as any)[key] = value
  // Save to storage
  StorageUtils.saveSettings({ cacheEnabled: settings.enabled } as any).catch(console.error)
  $q.notify({ type: 'positive', message: 'Setting updated', timeout: 1500 })
}

async function handleClearExpired(): Promise<void> {
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
        /* skip */
      }
    }
    $q.notify({ type: 'positive', message: `Cleaned ${cleaned} expired entries` })
    await loadStorageStats()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to clean expired entries' })
  }
}

function confirmClearAll(): void {
  $q.dialog({
    title: 'Clear All Cache',
    message: 'This will remove all cached data. Continue?',
    cancel: true,
    ok: { color: 'negative', label: 'Clear All' },
  }).onOk(async () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'))
    keys.forEach((k) => localStorage.removeItem(k))
    $q.notify({ type: 'positive', message: `Cleared ${keys.length} entries` })
    await loadStorageStats()
  })
}

function confirmReset(): void {
  $q.dialog({
    title: 'Reset Cache Settings',
    message: 'This will reset all cache settings to defaults. Continue?',
    cancel: true,
    ok: { color: 'negative', label: 'Reset' },
  }).onOk(() => {
    settings.enabled = true
    settings.defaultTTL = 3600
    settings.maxSize = 50
    settings.evictionPolicy = 'lru'
    settings.compression = true
    $q.notify({ type: 'positive', message: 'Settings reset to defaults' })
  })
}
</script>
