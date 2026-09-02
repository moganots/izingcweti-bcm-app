import { SyncStatus } from "src/shared/enums/system.enum"

export interface BaseEntity {
  uuid: string
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  version: number
  deletedBy?: string
  deletedAt?: string
  syncStatus: SyncStatus
}

export abstract class BaseEntityImpl implements BaseEntity {
  uuid: string
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  version: number
  deletedBy?: string
  deletedAt?: string
  syncStatus: SyncStatus

  constructor(data: Partial<BaseEntityImpl>) {
    this.uuid = data.uuid || crypto.randomUUID()
    this.createdBy = data.createdBy || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.version = data.version || 1
    this.syncStatus = data.syncStatus || SyncStatus.PENDING
    this.updatedBy = data.updatedBy!
    this.updatedAt = data.updatedAt!
    this.deletedBy = data.deletedBy!
    this.deletedAt = data.deletedAt!
  }

  toJSON(): Record<string, unknown> {
    return {
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt,
      version: this.version,
      deletedBy: this.deletedBy,
      deletedAt: this.deletedAt,
      syncStatus: this.syncStatus,
    }
  }
}
