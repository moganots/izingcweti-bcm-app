/**
 * Base Entity interface - Aligned with backend BaseEntity
 * Backend: src/types/db/base.entity.ts
 */
export interface BaseEntity {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  version: number;
  syncStatus?: string;
}