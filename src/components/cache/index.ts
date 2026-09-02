// ============================================================
//  Cache Components - Barrel Export
//  All cache management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as CacheManager } from './CacheManager.vue'
export { default as CacheManagementPanel } from './CacheManagementPanel.vue'
export { default as CacheStatsWidget } from './CacheStatsWidget.vue'
export { default as CacheHealthIndicator } from './CacheHealthIndicator.vue'

// ----- Entry Management -----
export { default as CacheEntryList } from './CacheEntryList.vue'
export { default as CacheEntryDetail } from './CacheEntryDetail.vue'

// ----- Settings -----
export { default as CacheSettings } from './CacheSettings.vue'
export { default as CacheStatusBadge } from './CacheStatusBadge.vue'

// ============================================================
//  Composables
//  Export shared cache composables
// ============================================================

export { useCache } from './../../composables/useCache'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for cache components
// ============================================================

export type {
  CacheEntry,
  CacheStats,
  CacheEntryMetadata,
  CreateCacheRequest,
  UpdateCacheRequest,
  BulkCacheRequest,
  BulkCacheResponse,
  CacheQueryParams,
  CacheCleanupResult,
  CacheHealthStatus,
} from './../../types/cache.types'

// ============================================================
//  Constants Exports
//  Export shared constants for cache
// ============================================================

export {
  CacheEvictionPolicy,
  CacheCompressionAlgorithm,
  CacheStatus,
} from './../../types/cache.types'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import CacheManager from './CacheManager.vue'
import CacheManagementPanel from './CacheManagementPanel.vue'
import CacheStatsWidget from './CacheStatsWidget.vue'
import CacheHealthIndicator from './CacheHealthIndicator.vue'
import CacheEntryList from './CacheEntryList.vue'
import CacheEntryDetail from './CacheEntryDetail.vue'
import CacheSettings from './CacheSettings.vue'
import CacheStatusBadge from './CacheStatusBadge.vue'

export default {
  install(app: App) {
    app.component('CacheManager', CacheManager)
    app.component('CacheManagementPanel', CacheManagementPanel)
    app.component('CacheStatsWidget', CacheStatsWidget)
    app.component('CacheHealthIndicator', CacheHealthIndicator)
    app.component('CacheEntryList', CacheEntryList)
    app.component('CacheEntryDetail', CacheEntryDetail)
    app.component('CacheSettings', CacheSettings)
    app.component('CacheStatusBadge', CacheStatusBadge)
  },
} as Plugin