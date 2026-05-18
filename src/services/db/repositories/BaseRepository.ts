import type { Table, Collection } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import type { QueryFilter, QueryOptions } from './../../../types/db.types'

/**
 * Base Repository
 * Provides common CRUD operations for all entity repositories
 *
 * Note: Dexie's Table.where() returns a WhereClause, not a Collection.
 * We need to call specific methods on WhereClause to get a Collection:
 * - where(filter).equals(value) -> Collection
 * - where(filter).anyOf(values) -> Collection
 * - where(filter).between(lower, upper) -> Collection
 * - where(filter).startsWith(prefix) -> Collection
 *
 * For single field equality, use Table.where({ field: value }) which returns a Collection directly.
 */
export abstract class BaseRepository<T extends { uuid: string }> {
  protected table: Table<T, string>
  protected tableName: string

  constructor(table: Table<T, string>, tableName: string) {
    this.table = table
    this.tableName = tableName
  }

  // ============================================
  // Read Operations
  // ============================================

  /**
   * Find all records with optional filters and pagination
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    let collection: Collection<T, string> = this.table.toCollection()

    // Apply filters
    if (options?.filters && options.filters.length > 0) {
      collection = this.applyFilters(collection, options.filters)
    }

    const results = await collection.toArray()

    // Apply sorting (manual since Dexie Collection doesn't support dynamic sortBy)
    let data = results
    if (options?.sortBy) {
      const sortKey = options.sortBy
      const sortOrder = options.sortOrder || 'asc'
      data.sort((a, b) => {
        const aVal = (a as any)[sortKey]
        const bVal = (b as any)[sortKey]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return sortOrder === 'asc' ? -1 : 1
        if (bVal == null) return sortOrder === 'asc' ? 1 : -1
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply offset and limit
    if (options?.offset) {
      data = data.slice(options.offset)
    }
    if (options?.limit) {
      data = data.slice(0, options.limit)
    }

    return data
  }

  /**
   * Find record by UUID (primary key)
   */
  async findById(uuid: string): Promise<T | undefined> {
    return this.table.get(uuid)
  }

  /**
   * Find first matching record using filter object
   * Uses Dexie's shorthand where() with object for simple equality
   */
  async findOne(filter: Partial<T>): Promise<T | undefined> {
    // Table.where(filterObject) returns a Collection when filter is an object with simple equality
    const collection = this.table.where(this.extractIndexedFilter(filter))
    return collection.first()
  }

  /**
   * Find all matching records using filter object
   */
  async findMany(filter: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const collection = this.table.where(this.extractIndexedFilter(filter))
    const results = await collection.toArray()

    let data = results
    if (options?.offset) data = data.slice(options.offset)
    if (options?.limit) data = data.slice(0, options.limit)

    return data
  }

  // ============================================
  // Write Operations
  // ============================================

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString()
    const record = {
      uuid: uuidv4(),
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
      sync_status: 'PENDING',
    } as unknown as T

    await this.table.put(record)
    return record
  }

  /**
   * Update an existing record
   * Fixed: Use Record<string, unknown> to avoid circular type inference
   */
  async update(uuid: string, data: Partial<T>): Promise<T | undefined> {
    const existing = await this.findById(uuid)
    if (!existing) return undefined

    const now = new Date().toISOString()

    // Build update data as plain object to avoid circular reference issues
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: now,
      version: ((existing as any).version || 0) + 1,
      sync_status: 'PENDING',
    }

    await this.table.update(uuid, updateData as any)

    // Return the updated record
    return this.findById(uuid)
  }

  /**
   * Upsert a record (insert or update)
   */
  async upsert(data: Partial<T> & { uuid?: string }): Promise<T> {
    const uuid = data.uuid || uuidv4()
    const existing = await this.findById(uuid)
    const now = new Date().toISOString()

    if (existing) {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: now,
        version: ((existing as any).version || 0) + 1,
        sync_status: 'PENDING',
      }
      await this.table.update(uuid, updateData as any)
      return (await this.findById(uuid))!
    } else {
      const record = {
        uuid,
        ...data,
        created_at: now,
        updated_at: now,
        version: 1,
        sync_status: 'PENDING',
      } as unknown as T
      await this.table.put(record)
      return record
    }
  }

  /**
   * Delete a record by UUID
   */
  async delete(uuid: string): Promise<void> {
    await this.table.delete(uuid)
  }

  /**
   * Delete multiple records
   */
  async deleteMany(uuids: string[]): Promise<void> {
    await this.table.bulkDelete(uuids)
  }

  /**
   * Soft delete a record (mark as deleted)
   */
  async softDelete(uuid: string, deletedBy: string): Promise<T | undefined> {
    const now = new Date().toISOString()
    return this.update(uuid, {
      deleted_at: now,
      deleted_by: deletedBy,
      sync_status: 'PENDING',
    } as unknown as Partial<T>)
  }

  // ============================================
  // Aggregate Operations
  // ============================================

  /**
   * Count records matching filter
   */
  async count(filter?: Partial<T>): Promise<number> {
    if (filter) {
      const collection = this.table.where(this.extractIndexedFilter(filter))
      return collection.count()
    }
    return this.table.count()
  }

  /**
   * Check if record exists
   */
  async exists(uuid: string): Promise<boolean> {
    const record = await this.table.get(uuid)
    return !!record
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Clear all records from table
   */
  async clear(): Promise<void> {
    await this.table.clear()
  }

  /**
   * Bulk insert records
   */
  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    const now = new Date().toISOString()
    const records = data.map((item) => ({
      uuid: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
      version: 1,
      sync_status: 'PENDING',
    })) as unknown as T[]

    await this.table.bulkPut(records)
    return records
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(updates: Array<{ uuid: string; data: Partial<T> }>): Promise<void> {
    const now = new Date().toISOString()
    const records = await Promise.all(
      updates.map(async ({ uuid, data }) => {
        const existing = await this.findById(uuid)
        return {
          ...existing,
          ...data,
          uuid,
          updated_at: now,
          version: ((existing as any)?.version || 0) + 1,
          sync_status: 'PENDING',
        } as unknown as T
      })
    )

    await this.table.bulkPut(records)
  }

  // ============================================
  // Sync Operations
  // ============================================

  /**
   * Get records that need syncing
   */
  async getPendingSyncs(): Promise<T[]> {
    return this.table.where(this.extractIndexedFilter({ sync_status: 'PENDING' } as any)).toArray()
  }

  /**
   * Mark record as synced
   */
  async markSynced(uuid: string): Promise<void> {
    await this.table.update(uuid, { sync_status: 'SYNCED' } as any)
  }

  /**
   * Mark multiple records as synced
   */
  async markManySynced(uuids: string[]): Promise<void> {
    for (const uuid of uuids) {
      await this.markSynced(uuid)
    }
  }

  /**
   * Get all primary keys
   */
  async getAllIds(): Promise<string[]> {
    const records = await this.table.toCollection().primaryKeys()
    return records as string[]
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Extract indexed fields from a filter object
   * Dexie's Table.where() with an object only works for indexed fields
   * with simple equality. For non-indexed or complex filters, use filter() on Collection.
   */
  private extractIndexedFilter(filter: Partial<T>): Record<string, any> {
    const entries = Object.entries(filter as Record<string, any>)

    if (entries.length === 0) {
      return {}
    }

    // Use at() for safer access, or destructure after explicit check
    const [key, value] = entries[0] as [string, any]

    // If value is undefined or null, return the key with null value
    // (this will match records where the field is null/undefined)
    if (value === undefined || value === null) {
      return { [key]: value }
    }

    return { [key]: value }
  }

  /**
   * Apply filters to a Dexie Collection
   * Uses Collection.filter() for complex filtering
   */
  private applyFilters(
    collection: Collection<T, string>,
    filters: QueryFilter[]
  ): Collection<T, string> {
    for (const filter of filters) {
      const { field, operator, value } = filter

      switch (operator) {
        case 'equals':
          collection = collection.filter((record) => (record as any)[field] === value)
          break
        case 'notEquals':
          collection = collection.filter((record) => (record as any)[field] !== value)
          break
        case 'greaterThan':
          collection = collection.filter((record) => (record as any)[field] > value)
          break
        case 'greaterThanOrEqual':
          collection = collection.filter((record) => (record as any)[field] >= value)
          break
        case 'lessThan':
          collection = collection.filter((record) => (record as any)[field] < value)
          break
        case 'lessThanOrEqual':
          collection = collection.filter((record) => (record as any)[field] <= value)
          break
        case 'contains':
          collection = collection.filter((record) =>
            String((record as any)[field] ?? '')
              .toLowerCase()
              .includes(String(value ?? '').toLowerCase())
          )
          break
        case 'startsWith':
          collection = collection.filter((record) =>
            String((record as any)[field] ?? '')
              .toLowerCase()
              .startsWith(String(value ?? '').toLowerCase())
          )
          break
        case 'endsWith':
          collection = collection.filter((record) =>
            String((record as any)[field] ?? '')
              .toLowerCase()
              .endsWith(String(value ?? '').toLowerCase())
          )
          break
        case 'in':
          collection = collection.filter(
            (record) => Array.isArray(value) && value.includes((record as any)[field])
          )
          break
        case 'notIn':
          collection = collection.filter(
            (record) => !Array.isArray(value) || !value.includes((record as any)[field])
          )
          break
        case 'between':
          collection = collection.filter(
            (record) =>
              Array.isArray(value) &&
              (record as any)[field] >= value[0] &&
              (record as any)[field] <= value[1]
          )
          break
        case 'exists':
          collection = collection.filter(
            (record) =>
              (record as any)[field] !== undefined &&
              (record as any)[field] !== null &&
              (record as any)[field] !== ''
          )
          break
        case 'notExists':
          collection = collection.filter(
            (record) =>
              (record as any)[field] === undefined ||
              (record as any)[field] === null ||
              (record as any)[field] === ''
          )
          break
        default:
          break
      }
    }

    return collection
  }
}

// Re-export the QueryFilter type for convenience
export type { QueryFilter, QueryOptions }
