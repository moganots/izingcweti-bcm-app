import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { CacheEntry, CacheQueryParams, CacheStats } from './../../../../models/entities'

/**
 * Cache Repository
 * Manages cache entries in IndexedDB with TTL support
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
    if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
      await this.delete(key)
      return undefined
    }

    // Update hit count and last accessed time
    await this.update(key, {
      hit_count: (entry.hit_count || 0) + 1,
      last_accessed_at: new Date().toISOString(),
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
        expires_at: expiresAt,
        tags: tags || existing.tags,
        size_bytes: sizeBytes,
        is_compressed: compress,
        updated_at: now,
      } as Partial<CacheEntry>)
      return updated!
    }

    return this.create({
      key,
      value: serializedValue,
      expires_at: expiresAt,
      tags: tags || null,
      hit_count: 0,
      last_accessed_at: null,
      size_bytes: sizeBytes,
      is_compressed: compress,
      compression_algorithm: compress ? 'gzip' : null,
      created_by: 'system',
      updated_by: 'system',
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
    const expired = all.filter((entry) => entry.expires_at && new Date(entry.expires_at) < now)

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
   */
  async getStats(): Promise<CacheStats> {
    const all = await this.findAll()
    const now = new Date()
    const activeEntries = all.filter(
      (entry) => !entry.expires_at || new Date(entry.expires_at) >= now
    )
    const expiredEntries = all.filter(
      (entry) => entry.expires_at && new Date(entry.expires_at) < now
    )
    const totalHits = all.reduce((sum, entry) => sum + (entry.hit_count || 0), 0)

    return {
      total_entries: all.length,
      total_size_bytes: all.reduce((sum, entry) => sum + (entry.size_bytes || 0), 0),
      active_entries: activeEntries.length,
      expired_entries: expiredEntries.length,
      total_hits: totalHits,
      cache_hit_ratio: all.length > 0 ? totalHits / (totalHits + all.length) : 0,
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
    entries: Array<{ key: string; value: any; ttl?: number; tags?: string }>
  ): Promise<void> {
    await Promise.all(
      entries.map((entry) => this.set(entry.key, entry.value, entry.ttl, entry.tags))
    )
  }

  /**
   * Get cache size in bytes
   */
  async getSize(): Promise<number> {
    const stats = await this.getStats()
    return stats.total_size_bytes
  }

  /**
   * Check if cache needs cleanup
   */
  async needsCleanup(thresholdPercent: number = 80): Promise<boolean> {
    const stats = await this.getStats()
    const maxSize = 100 * 1024 * 1024 // 100MB default limit
    const usagePercent = (stats.total_size_bytes / maxSize) * 100
    return usagePercent >= thresholdPercent
  }
}
