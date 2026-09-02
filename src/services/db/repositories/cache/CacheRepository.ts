import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { CacheEntry, CacheQueryParams, CacheStats } from './../../../../models/entities'

/**
 * Cache Repository
 * Manages cache entries in IndexedDB with TTL support
 * Field names aligned with cache.entity.ts (camelCase)
 */
export class CacheRepository extends BaseRepository<CacheEntry> {
  constructor(table: Table<CacheEntry, string>) {
    super(table, 'cache')
  }

  /**
   * Get cache entry by key
   * Automatically checks expiration and updates hit count
   */
  async get(key: string): Promise<CacheEntry | undefined> {
    const entry = await this.findById(key)

    if (!entry) {
      return undefined
    }

    // Check if expired
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      await this.delete(key)
      return undefined
    }

    // Update hit count and last accessed time
    await this.update(key, {
      hitCount: (entry.hitCount || 0) + 1,
      lastAccessedAt: new Date().toISOString(),
    } as Partial<CacheEntry>)

    return entry
  }

  /**
   * Set cache entry with optional TTL
   */
  async set(
    key: string,
    value: any,
    ttl?: number,
    tags?: string,
    compress: boolean = false
  ): Promise<CacheEntry> {
    const now = new Date().toISOString()
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000).toISOString() : null

    const serializedValue = JSON.stringify(value)
    const sizeBytes = new Blob([serializedValue]).size

    const existing = await this.findById(key)

    if (existing) {
      const updated = await this.update(key, {
        value: serializedValue,
        expiresAt: expiresAt,
        tags: tags || existing.tags,
        sizeBytes: sizeBytes,
        isCompressed: compress,
        compressionAlgorithm: compress ? 'gzip' : null,
        updatedAt: now,
        updatedBy: 'system',
      } as Partial<CacheEntry>)
      return updated!
    }

    return this.create({
      key,
      value: serializedValue,
      expiresAt: expiresAt,
      tags: tags || null,
      hitCount: 0,
      lastAccessedAt: null,
      sizeBytes: sizeBytes,
      isCompressed: compress,
      compressionAlgorithm: compress ? 'gzip' : null,
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: now,
      updatedAt: now,
      version: 1,
      syncStatus: 'SYNCED',
    } as Partial<CacheEntry>)
  }

  /**
   * Get value from cache (returns parsed value, not the entry)
   */
  async getValue<T = any>(key: string): Promise<T | undefined> {
    const entry = await this.get(key)
    if (!entry) return undefined

    try {
      return JSON.parse(entry.value) as T
    } catch {
      return entry.value as T
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = await this.get(key)
    return !!entry
  }

  /**
   * Delete cache entry
   */
  override async delete(key: string): Promise<void> {
    await this.table.delete(key)
  }

  /**
   * Delete multiple cache entries
   */
  override async deleteMany(keys: string[]): Promise<void> {
    await this.table.bulkDelete(keys)
  }

  /**
   * Clear all expired entries
   */
  async clearExpired(): Promise<number> {
    const all = await this.findAll()
    const now = new Date()
    const expired = all.filter((entry) => entry.expiresAt && new Date(entry.expiresAt) < now)

    if (expired.length > 0) {
      await this.deleteMany(expired.map((e) => e.key))
    }

    return expired.length
  }

  /**
   * Clear entries by tags
   */
  async clearByTags(tags: string | string[]): Promise<number> {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    const all = await this.findAll()
    const toDelete = all.filter((entry) => {
      if (!entry.tags) return false
      const entryTags = entry.tags.split(',')
      return tagArray.some((tag) => entryTags.includes(tag))
    })

    if (toDelete.length > 0) {
      await this.deleteMany(toDelete.map((e) => e.key))
    }

    return toDelete.length
  }

  /**
   * Clear entries by pattern (key prefix match)
   */
  async clearByPattern(pattern: string): Promise<number> {
    const all = await this.findAll()
    const toDelete = all.filter((entry) => entry.key.includes(pattern))

    if (toDelete.length > 0) {
      await this.deleteMany(toDelete.map((e) => e.key))
    }

    return toDelete.length
  }

  /**
   * Get all keys matching pattern
   */
  async getKeys(pattern?: string): Promise<string[]> {
    let entries = await this.findAll()

    if (pattern) {
      entries = entries.filter((entry) => entry.key.includes(pattern))
    }

    return entries.map((e) => e.key)
  }

  /**
   * Get cache statistics
   * Returns stats matching CacheStats interface from cache.entity.ts
   */
  async getStats(): Promise<CacheStats> {
    const all = await this.findAll()
    const now = new Date()
    
    const activeEntries = all.filter(
      (entry) => !entry.expiresAt || new Date(entry.expiresAt) >= now
    )
    const expiredEntries = all.filter(
      (entry) => entry.expiresAt && new Date(entry.expiresAt) < now
    )
    const totalHits = all.reduce((sum, entry) => sum + (entry.hitCount || 0), 0)
    const totalSize = all.reduce((sum, entry) => sum + (entry.sizeBytes || 0), 0)

    // Calculate hit ratio
    const totalRequests = totalHits + all.length
    const hitRatio = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0

    return {
      totalEntries: all.length,
      totalSizeBytes: totalSize,
      activeEntries: activeEntries.length,
      expiredEntries: expiredEntries.length,
      totalHits: totalHits,
      cacheHitRatio: Math.round(hitRatio * 100) / 100,
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    await this.table.clear()
  }

  /**
   * Get entries by query parameters
   */
  async query(params: CacheQueryParams): Promise<CacheEntry[]> {
    let entries = await this.findAll()

    if (params.tags) {
      const tagArray = params.tags.split(',')
      entries = entries.filter((entry) => {
        if (!entry.tags) return false
        const entryTags = entry.tags.split(',')
        return tagArray.some((tag) => entryTags.includes(tag))
      })
    }

    if (params.pattern) {
      entries = entries.filter((entry) => entry.key.includes(params.pattern!))
    }

    if (params.offset) {
      entries = entries.slice(params.offset)
    }

    if (params.limit) {
      entries = entries.slice(0, params.limit)
    }

    return entries
  }

  /**
   * Get or set cache (atomic operation)
   */
  async remember<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
    tags?: string
  ): Promise<T> {
    const existing = await this.getValue<T>(key)
    if (existing !== undefined) {
      return existing
    }

    const value = await factory()
    await this.set(key, value, ttl, tags)
    return value
  }

  /**
   * Increment a numeric cache value
   */
  async increment(key: string, delta: number = 1, ttl?: number): Promise<number> {
    const existing = await this.getValue<number>(key)
    const newValue = (existing || 0) + delta
    await this.set(key, newValue, ttl)
    return newValue
  }

  /**
   * Decrement a numeric cache value
   */
  async decrement(key: string, delta: number = 1, ttl?: number): Promise<number> {
    const existing = await this.getValue<number>(key)
    const newValue = (existing || 0) - delta
    await this.set(key, newValue, ttl)
    return newValue
  }

  /**
   * Get multiple cache values at once
   */
  async getMany<T = any>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    for (const key of keys) {
      const value = await this.getValue<T>(key)
      if (value !== undefined) {
        results.set(key, value)
      }
    }

    return results
  }

  /**
   * Set multiple cache entries at once
   */
  async setMany(
    entries: Array<{ key: string; value: any; ttl?: number; tags?: string; compress?: boolean }>
  ): Promise<void> {
    await Promise.all(
      entries.map((entry) => 
        this.set(entry.key, entry.value, entry.ttl, entry.tags, entry.compress)
      )
    )
  }

  /**
   * Get cache size in bytes
   */
  async getSize(): Promise<number> {
    const stats = await this.getStats()
    return stats.totalSizeBytes
  }

  /**
   * Check if cache needs cleanup
   */
  async needsCleanup(thresholdPercent: number = 80, maxSizeMB: number = 100): Promise<boolean> {
    const stats = await this.getStats()
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const usagePercent = stats.totalSizeBytes > 0 ? (stats.totalSizeBytes / maxSizeBytes) * 100 : 0
    return usagePercent >= thresholdPercent
  }

  /**
   * Get cache entries by tag (returns entries, not just values)
   */
  async getByTag(tag: string): Promise<CacheEntry[]> {
    const all = await this.findAll()
    return all.filter((entry) => {
      if (!entry.tags) return false
      const entryTags = entry.tags.split(',')
      return entryTags.includes(tag)
    })
  }

  /**
   * Get cache entries by multiple tags (AND logic)
   */
  async getByTagsAll(tags: string[]): Promise<CacheEntry[]> {
    const all = await this.findAll()
    return all.filter((entry) => {
      if (!entry.tags) return false
      const entryTags = entry.tags.split(',')
      return tags.every((tag) => entryTags.includes(tag))
    })
  }

  /**
   * Get cache entries by multiple tags (OR logic)
   */
  async getByTagsAny(tags: string[]): Promise<CacheEntry[]> {
    const all = await this.findAll()
    return all.filter((entry) => {
      if (!entry.tags) return false
      const entryTags = entry.tags.split(',')
      return tags.some((tag) => entryTags.includes(tag))
    })
  }

  /**
   * Update expiration time for a cache entry
   */
  async touch(key: string, ttl?: number): Promise<boolean> {
    const entry = await this.findById(key)
    if (!entry) return false

    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000).toISOString() : null
    await this.update(key, {
      expiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    } as Partial<CacheEntry>)
    return true
  }

  /**
   * Get cache entry metadata without modifying hit count
   */
  async getMetadata(key: string): Promise<{
    key: string
    sizeBytes: number
    expiresAt?: string | Date
    tags?: string
    hitCount: number
    lastAccessedAt?: string | Date
  } | null> {
    const entry = await this.findById(key)
    if (!entry) return null

    // Check if expired
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      await this.delete(key)
      return null
    }

    return {
      key: entry.key,
      sizeBytes: entry.sizeBytes,
      ...(entry.expiresAt != null ? { expiresAt: entry.expiresAt } : {}),
      ...(entry.tags ? { tags: entry.tags } : {}),
      hitCount: entry.hitCount,
      ...(entry.lastAccessedAt != null ? { lastAccessedAt: entry.lastAccessedAt } : {}),
    }
  }

  /**
   * Get cache hit ratio
   */
  async getHitRatio(): Promise<number> {
    const stats = await this.getStats()
    return stats.cacheHitRatio
  }

  /**
   * Get cache memory usage as percentage of max
   */
  async getMemoryUsagePercent(maxSizeMB: number = 100): Promise<number> {
    const size = await this.getSize()
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return maxSizeBytes > 0 ? (size / maxSizeBytes) * 100 : 0
  }

  /**
   * Find expired entries
   */
  async findExpired(): Promise<CacheEntry[]> {
    const all = await this.findAll()
    const now = new Date()
    return all.filter((entry) => entry.expiresAt && new Date(entry.expiresAt) < now)
  }

  /**
   * Find active entries (not expired)
   */
  async findActive(): Promise<CacheEntry[]> {
    const all = await this.findAll()
    const now = new Date()
    return all.filter((entry) => !entry.expiresAt || new Date(entry.expiresAt) >= now)
  }

  /**
   * Find entries by compression status
   */
  async findByCompression(compressed: boolean): Promise<CacheEntry[]> {
    return this.findMany({ isCompressed: compressed } as Partial<CacheEntry>)
  }

  /**
   * Get entries with hit count above threshold
   */
  async findFrequentEntries(minHits: number = 10): Promise<CacheEntry[]> {
    const all = await this.findAll()
    return all.filter((entry) => (entry.hitCount || 0) >= minHits)
  }

  /**
   * Get entries with hit count below threshold (candidates for eviction)
   */
  async findRareEntries(maxHits: number = 5): Promise<CacheEntry[]> {
    const all = await this.findAll()
    return all.filter((entry) => (entry.hitCount || 0) <= maxHits)
  }

  /**
   * Evict least recently used entries
   */
  async evictLRU(count: number): Promise<number> {
    const all = await this.findAll()
    const sorted = all.sort((a, b) => {
      const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0
      const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0
      return aTime - bTime
    })

    const toEvict = sorted.slice(0, Math.min(count, sorted.length))
    if (toEvict.length > 0) {
      await this.deleteMany(toEvict.map((e) => e.key))
    }
    return toEvict.length
  }

  /**
   * Evict least frequently used entries
   */
  async evictLFU(count: number): Promise<number> {
    const all = await this.findAll()
    const sorted = all.sort((a, b) => (a.hitCount || 0) - (b.hitCount || 0))

    const toEvict = sorted.slice(0, Math.min(count, sorted.length))
    if (toEvict.length > 0) {
      await this.deleteMany(toEvict.map((e) => e.key))
    }
    return toEvict.length
  }
}