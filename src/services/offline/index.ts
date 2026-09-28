/**
 * Offline Services Barrel
 * ---------------------------------------------------------------------
 * Everything needed for offline-first CRUD.
 *
 * Exports:
 *   - `OfflineCrudService`      → local-first CRUD façade
 *   - `getOfflineCrudService`   → singleton factory (takes a NetworkMonitor)
 *
 * The offline queue itself lives in the `sync` module (it is tightly
 * coupled to `SyncEngine`); we re-export it here for convenience so
 * consumers can `import { offlineQueue } from '@/services/offline'`.
 */

// ============================================
// Offline CRUD
// ============================================
export {
  OfflineCrudService,
  getOfflineCrudService,
} from "./OfflineCrudService";

// ============================================
// Offline Queue (re-exported from sync)
// ============================================
export { OfflineQueue, offlineQueue } from "./OfflineQueue";