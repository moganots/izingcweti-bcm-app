import type { BaseEntity } from "../../core/base/base.entity";

// ============================================
// Cache Module - Enums (Aligned with Backend)
// ============================================

export enum CacheEvictionPolicy {
  LRU = "lru",
  LFU = "lfu",
  FIFO = "fifo",
  TTL = "ttl",
}

export enum CacheCompressionAlgorithm {
  NONE = "none",
  GZIP = "gzip",
  LZ4 = "lz4",
}

// ============================================
// Cache Entity - Aligned with Backend
// Backend: src/modules/cache/models/entities/cache.entity.ts
// ============================================

export interface Cache extends BaseEntity {
  key: string;
  value: any;
  expiresAt?: Date;
  tags?: string;
  hitCount: number;
  lastAccessedAt?: Date;
  sizeBytes: number;
  isCompressed: boolean;
  compressionAlgorithm?: string;
}

/**
 * Cache helper functions (business methods)
 */
export const CacheHelpers = {
  isExpired: (cache: Cache): boolean => {
    if (!cache.expiresAt) return false;
    return new Date() > cache.expiresAt;
  },

  isActive: (cache: Cache): boolean => {
    return !CacheHelpers.isExpired(cache);
  },

  getRemainingTtl: (cache: Cache): number | null => {
    if (!cache.expiresAt) return null;
    const now = new Date();
    if (now >= cache.expiresAt) return 0;
    return Math.floor((cache.expiresAt.getTime() - now.getTime()) / 1000);
  },
};

// ============================================
// Cache Entry Metadata
// ============================================

export interface CacheEntryMetadata {
  key: string;
  sizeBytes: number;
  expiresAt?: Date;
  tags?: string;
  hitCount: number;
  lastAccessedAt?: Date;
}

export interface CacheCleanupResult {
  cleaned: number;
  freedBytes: number;
}

export interface BulkCacheResponse {
  entries: Cache[];
  missedKeys: string[];
}