import { SyncStatus } from '../../modules/sync/enums/sync.enum'

export interface BaseEntity {
  uuid: string
  created_by: string
  created_at: string
  updated_by?: string
  updated_at?: string
  version: number
  deleted_by?: string
  deleted_at?: string
  sync_status: SyncStatus
}

export abstract class BaseEntityImpl implements BaseEntity {
  uuid: string
  created_by: string
  created_at: string
  updated_by?: string
  updated_at?: string
  version: number
  deleted_by?: string
  deleted_at?: string
  sync_status: SyncStatus

  constructor(data: Partial<BaseEntityImpl>) {
    this.uuid = data.uuid || crypto.randomUUID()
    this.created_by = data.created_by || ''
    this.created_at = data.created_at || new Date().toISOString()
    this.version = data.version || 1
    this.sync_status = data.sync_status || SyncStatus.PENDING
    this.updated_by = data.updated_by
    this.updated_at = data.updated_at
    this.deleted_by = data.deleted_by
    this.deleted_at = data.deleted_at
  }

  toJSON(): Record<string, unknown> {
    return {
      uuid: this.uuid,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_by: this.updated_by,
      updated_at: this.updated_at,
      version: this.version,
      deleted_by: this.deleted_by,
      deleted_at: this.deleted_at,
      sync_status: this.sync_status,
    }
  }
}
