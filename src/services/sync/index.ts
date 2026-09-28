/**
 * Sync Services Barrel
 * ---------------------------------------------------------------------
 * Everything related to server synchronisation and connectivity.
 *
 * Export groups:
 *   - `SyncEngine`         → orchestrates push/pull/conflicts locally
 *   - `SyncService`        → raw HTTP client for `/sync/*` endpoints
 *   - `ConflictResolver`   → detects & applies conflict resolutions
 *   - `NetworkMonitor`     → connectivity + quality + lifecycle
 *
 * The `networkMonitor` and `offlineQueue` singletons are re-exported
 * for convenience — most apps only need to touch these + `SyncEngine`.
 */

// ============================================
// Sync Engine (offline-first orchestrator)
// ============================================
export {
  SyncEngine,
  type ProcessChangeResult,
  type SyncEngineStats,
  type FullSyncResult,
} from "./SyncEngine";

// ============================================
// Sync Service (HTTP client)
// ============================================
export {
  SyncService,
  syncService,
  type SyncProgress,
} from "./SyncService";

// ============================================
// Conflict Resolution
// ============================================
export {
  ConflictResolver,
  type ConflictResolution,
} from "./ConflictResolver";

// ============================================
// Network Monitoring
// ============================================
export {
  NetworkMonitor,
  networkMonitor,
  type ConnectionQuality,
  type NetworkStatusListener,
} from "./NetworkMonitor";