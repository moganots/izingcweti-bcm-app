/**
 * Database Barrel
 * ---------------------------------------------------------------------
 * Single source of truth for the Dexie-backed offline database layer.
 *
 * Export groups:
 *   - `db`            → the singleton Dexie instance (use this everywhere)
 *   - `BCMDatabase`   → the class (for typing / testing)
 *   - `SyncStatus`    → runtime enum-like object used across the app
 *   - `SyncStatusType`→ TS type of the status union
 *   - `SyncRepository`→ typed shape returned by `db.getRepository(...)`
 *   - Migrations      → schema history (used by tooling / migrations UI)
 *
 * NOTE: Do NOT re-export entity types from here — they live under
 *       `../../models/entities`. This barrel is DB-only.
 */

// ============================================
// Database Instance & Class
// ============================================
export { db, BCMDatabase, SyncStatus } from "./Database";

// ============================================
// Database Types
// ============================================
export type {
  SyncStatusType,
  SyncRepository,
} from "./Database";

// ============================================
// Migrations
// ============================================
export { MIGRATIONS, MigrationHelpers } from "./migrations";
export type { DatabaseMigration } from "./migrations";