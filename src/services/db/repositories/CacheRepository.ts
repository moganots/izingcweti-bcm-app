import type { Table } from 'dexie'

/**
 * Cache Repository
 * Manages cached data with TTL-based expiration
 */
export class CacheRepository {
  private table: Table<
    { key: string; value: any; expiresAt?: number; tags?: string; createdAt: number },
    string
  >

  constructor(
    table: Table<
      { key: string; value: any; expiresAt?: number; tags?: string; createdAt: number },
      string
    >
  ) {
    this.table = table
  }

  /**
   * Get cached value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = await this.table.get(key)

    if (!entry) return null

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      await this.table.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number, tags?: string): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined

    await this.table.put({
      key,
      value,
      expiresAt,
      tags,
      createdAt: Date.now(),
    } as any)
  }

  /**
   * Delete cached value by key
   */
  async delete(key: string): Promise<void> {
    await this.table.delete(key)
  }

  /**
   * Check if key exists and is not expired
   */
  async exists(key: string): Promise<boolean> {
    const entry = await this.table.get(key)
    if (!entry) return false

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      await this.table.delete(key)
      return false
    }

    return true
  }

  /**
   * Get cached value or compute and cache it
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  /**
   * Find entries by tags
   */
  async findByTags(tags: string): Promise<any[]> {
    return this.table.filter((entry) => entry.tags?.includes(tags)!).toArray()
  }

  /**
   * Delete entries by tags
   */
  async deleteByTags(tags: string): Promise<number> {
    const entries = await this.findByTags(tags)
    const keys = entries.map((e) => e.key)
    await this.table.bulkDelete(keys)
    return keys.length
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<number> {
    const now = Date.now()
    const expired = await this.table
      .filter((entry) => entry.expiresAt !== undefined && entry.expiresAt < now)
      .toArray()

    const keys = expired.map((e) => e.key)
    await this.table.bulkDelete(keys)
    return keys.length
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ total: number; expired: number; active: number }> {
    const all = await this.table.toArray()
    const now = Date.now()

    const expired = all.filter((e) => e.expiresAt !== undefined && e.expiresAt < now).length
    const active = all.length - expired

    return {
      total: all.length,
      expired,
      active,
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.table.clear()
  }
}
