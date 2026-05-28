import { BaseEntity } from './base.entity'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: ApiError[]
  timestamp?: string
  statusCode?: number
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
  nextToken?: string
}

export interface ApiError {
  field?: string
  message: string
  code?: string
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  startDate?: string
  endDate?: string
}

export interface PaginationParams extends QueryParams {}

export type UUID = string
export type ISO8601 = string
export type Email = string
export type URL = string
