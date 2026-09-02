<template>
    <div class="cache-manager">
        <!-- Header -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
                <CacheManagementPanel :cache-enabled="cacheEnabled" :total-entries="totalEntries"
                    :active-entries="activeEntries" :hit-ratio="hitRatio" :total-size-bytes="totalSizeBytes"
                    @refresh="handleRefresh" @clean-expired="handleCleanExpired" />
            </div>
            <div class="col-12 col-md-6">
                <CacheStatsWidget :entries="totalEntries" :size="totalSizeBytes" :hits="totalHits" :misses="totalMisses"
                    :hit-ratio="hitRatio" :evictions="evictions" :expirations="expirations"
                    :average-ttl-seconds="averageTTLSeconds" :max-size-bytes="maxSizeBytes" :last-updated="lastUpdated"
                    @refresh="handleRefresh" />
            </div>
        </div>

        <!-- Settings -->
        <div class="q-mb-md">
            <CacheSettings :enabled="cacheEnabled" :default-ttl="defaultTTL" :max-size="maxSizeMB"
                :eviction-policy="evictionPolicy" :compression="compression" @update:enabled="handleUpdateEnabled"
                @update:ttl="handleUpdateTTL" @update:max-size="handleUpdateMaxSize"
                @update:eviction-policy="handleUpdateEvictionPolicy" @update:compression="handleUpdateCompression"
                @clear-expired="handleCleanExpired" @clear-all="handleClearAll" />
        </div>

        <!-- Cache Entry List -->
        <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-8">
                <CacheEntryList :entries="entriesArray" :loading="loading" :loading-more="loadingMore"
                    :has-more="hasMore" @view="handleViewEntry" @refresh="handleRefreshEntry"
                    @delete="handleDeleteEntry" @clear-all="handleClearAll" @load-more="handleLoadMore" />
            </div>
            <div class="col-12 col-lg-4">
                <CacheEntryDetail :entry="selectedEntry" @refresh="handleRefreshEntry" @delete="handleDeleteEntry" />
            </div>
        </div>

        <!-- Dialogs -->
        <q-dialog v-model="confirmDialog.visible" persistent>
            <q-card style="width: 400px">
                <q-card-section>
                    <div class="text-h6">{{ confirmDialog.title }}</div>
                </q-card-section>
                <q-card-section>
                    <p>{{ confirmDialog.message }}</p>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="grey" v-close-popup @click="confirmDialog.visible = false" />
                    <q-btn color="negative" :label="confirmDialog.confirmLabel" @click="handleConfirmAction" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import CacheManagementPanel from './CacheManagementPanel.vue'
import CacheStatsWidget from './CacheStatsWidget.vue'
import CacheSettings from './CacheSettings.vue'
import CacheEntryList from './CacheEntryList.vue'
import CacheEntryDetail from './CacheEntryDetail.vue'
import { useCache } from './../../composables/useCache'
import type { CacheEntry } from './../../models/entities/cache/cache.entity'

// Cache composable
const cache = useCache()

// State
const loading = ref(false)
const loadingMore = ref(false)
const entriesArray = ref<CacheEntry[]>([])
const selectedEntry = ref<CacheEntry | null>(null)
const hasMore = ref(false)
const lastUpdated = ref<string | null>(null)

// Cache stats
const totalEntries = ref(0)
const activeEntries = ref(0)
const totalSizeBytes = ref(0)
const totalHits = ref(0)
const totalMisses = ref(0)
const hitRatio = ref(0)
const evictions = ref(0)
const expirations = ref(0)
const averageTTLSeconds = ref(0)

// Settings
const cacheEnabled = ref(true)
const defaultTTL = ref(3600)
const maxSizeMB = ref(50)
const maxSizeBytes = computed(() => maxSizeMB.value * 1024 * 1024)
const evictionPolicy = ref('lru')
const compression = ref(true)

// Confirm dialog
const confirmDialog = reactive({
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    action: null as (() => void) | null,
})

// Methods
async function handleRefresh(): Promise<void> {
    loading.value = true
    try {
        // Refresh cache stats
        const stats = await cache.getStats()
        if (stats) {
            totalEntries.value = stats.totalEntries || 0
            activeEntries.value = stats.activeEntries || 0
            totalSizeBytes.value = stats.totalSizeBytes || 0
            totalHits.value = stats.totalHits || 0
            hitRatio.value = stats.cacheHitRatio || 0
            lastUpdated.value = new Date().toISOString()
        }

        // Load entries
        const data = await cache.getEntries({ limit: 20 })
        entriesArray.value = data || []
        hasMore.value = (data?.length || 0) >= 20
    } catch (error) {
        console.error('Failed to refresh cache:', error)
    } finally {
        loading.value = false
    }
}

function handleCleanExpired(): void {
    confirmDialog.visible = true
    confirmDialog.title = 'Clean Expired Cache'
    confirmDialog.message = 'Are you sure you want to remove all expired cache entries?'
    confirmDialog.confirmLabel = 'Clean'
    confirmDialog.action = async () => {
        await cache.cleanExpired()
        await handleRefresh()
    }
}

function handleClearAll(): void {
    confirmDialog.visible = true
    confirmDialog.title = 'Clear All Cache'
    confirmDialog.message = 'Are you sure you want to delete all cache entries? This action cannot be undone.'
    confirmDialog.confirmLabel = 'Clear All'
    confirmDialog.action = async () => {
        await cache.clearAll()
        entriesArray.value = []
        selectedEntry.value = null
        await handleRefresh()
    }
}

function handleViewEntry(entry: CacheEntry): void {
    selectedEntry.value = entry
}

async function handleRefreshEntry(entry: CacheEntry): Promise<void> {
    const updated = await cache.refreshEntry(entry.key)
    if (updated) {
        const index = entriesArray.value.findIndex((e) => e.key === entry.key)
        if (index !== -1) {
            entriesArray.value[index] = updated
        }
        if (selectedEntry.value?.key === entry.key) {
            selectedEntry.value = updated
        }
    }
}

async function handleDeleteEntry(entry: CacheEntry): Promise<void> {
    confirmDialog.visible = true
    confirmDialog.title = 'Delete Cache Entry'
    confirmDialog.message = `Are you sure you want to delete the entry "${entry.key}"?`
    confirmDialog.confirmLabel = 'Delete'
    confirmDialog.action = async () => {
        await cache.deleteEntry(entry.key)
        entriesArray.value = entriesArray.value.filter((e) => e.key !== entry.key)
        if (selectedEntry.value?.key === entry.key) {
            selectedEntry.value = null
        }
        await handleRefresh()
    }
}

async function handleLoadMore(): Promise<void> {
    loadingMore.value = true
    try {
        const offset = entriesArray.value.length
        const data = await cache.getEntries({ offset, limit: 20 })
        if (data && data.length > 0) {
            entriesArray.value = [...entriesArray.value, ...data]
            hasMore.value = data.length >= 20
        } else {
            hasMore.value = false
        }
    } finally {
        loadingMore.value = false
    }
}

function handleUpdateEnabled(value: boolean): void {
    cacheEnabled.value = value
    cache.setEnabled(value)
}

function handleUpdateTTL(value: number): void {
    defaultTTL.value = value
    cache.setDefaultTTL(value)
}

function handleUpdateMaxSize(value: number): void {
    maxSizeMB.value = value
    cache.setMaxSize(value)
}

function handleUpdateEvictionPolicy(value: string): void {
    evictionPolicy.value = value
    cache.setEvictionPolicy(value)
}

function handleUpdateCompression(value: boolean): void {
    compression.value = value
    cache.setCompression(value)
}

function handleConfirmAction(): void {
    if (confirmDialog.action) {
        confirmDialog.action()
    }
    confirmDialog.visible = false
}

// Initialize
onMounted(() => {
    handleRefresh()
})
</script>

<style lang="scss" scoped>
.cache-manager {
    padding: 16px 0;
}
</style>