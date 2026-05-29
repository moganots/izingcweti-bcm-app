// ============================================
// API Response Types
// ============================================

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  environment?: string
  apiVersion?: string | null
  apiName?: string
  data?: T
  message?: string
  count?: number
  errors?: ApiError[]
  success?: boolean
  status?:
    | 'healthy'
    | 'unhealthy'
    | 'degraded'
    | 'ok'
    | 'not ok'
    | 'failed'
    | 'active'
    | 'inactive'
    | 'idle'
    | 'online'
    | 'offline'
    | 'live'
    | 'dead'
    | 'offline'
    | 'running'
    | 'stopped'
    | 'halted'
    | string
  statusCode?: number
  statusText?: string
  timestamp?: string | null
  uptime?: number | null
  memory?: {
    heapUsed: number
    heapTotal: number
    rss?: number
  }
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * API Error
 */
export interface ApiError {
  field?: string
  message: string
  code?: string
}

/**
 * API Request Options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
  showLoading?: boolean
  retry?: number
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

// ============================================
// Pagination Types
// ============================================

/**
 * Pagination Parameters
 */
export interface PaginationParams extends QueryParams {}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// ============================================
// Query & Filter Types
// ============================================

/**
 * Common query parameters
 */
export interface QueryParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  startDate?: string
  endDate?: string
}

/**
 * Date range filter
 */
export interface DateRange {
  start: string
  end: string
}

/**
 * Sort option
 */
export interface SortOption {
  label: string
  value: string
  icon?: string
}

// ============================================
// UI Types
// ============================================

/**
 * Toast notification
 */
export interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  position?: 'top' | 'bottom' | 'center'
  actions?: ToastAction[]
  dismissible?: boolean
}

export interface ToastAction {
  label: string
  handler: () => void
  color?: string
  flat?: boolean
}

/**
 * Dialog options
 */
export interface DialogOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'delete'
  confirmLabel?: string
  cancelLabel?: string
  showCancel?: boolean
  persistent?: boolean
  icon?: string
  width?: string
}

/**
 * Menu item
 */
export interface MenuItem {
  label: string
  icon?: string
  to?: string
  href?: string
  action?: () => void
  children?: MenuItem[]
  badge?: string | number
  badgeColor?: string
  disabled?: boolean
  divider?: boolean
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

/**
 * Tab configuration
 */
export interface TabConfig {
  name: string
  label: string
  icon?: string
  badge?: number
  badgeColor?: string
  component?: any
}

// ============================================
// Form Types
// ============================================

/**
 * Form field configuration
 */
export interface FormField {
  name: string
  label: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'date'
    | 'textarea'
    | 'toggle'
    | 'file'
  required?: boolean
  disabled?: boolean
  placeholder?: string
  hint?: string
  rules?: ((val: any) => boolean | string)[]
  options?: SelectOption[]
  defaultValue?: any
  colSize?: number
}

/**
 * Select option
 */
export interface SelectOption {
  label: string
  value: any
  icon?: string
  description?: string
  disabled?: boolean
}

/**
 * Form validation rule
 */
export type ValidationRule = (val: any) => boolean | string

// ============================================
// Status Types
// ============================================

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

/**
 * Error state
 */
export interface ErrorState {
  hasError: boolean
  message: string
  code?: string
  details?: any
}

/**
 * Empty state
 */
export interface EmptyState {
  icon?: string
  title?: string
  description?: string
  action?: {
    label: string
    handler: () => void
    icon?: string
    color?: string
  }
}

// ============================================
// Utility Types
// ============================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Nullable type
 */
export type Nullable<T> = T | null | undefined

/**
 * Recursive partial
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

/**
 * Omit multiple keys
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>

/**
 * Pick required
 */
export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Value of
 */
export type ValueOf<T> = T[keyof T]

/**
 * Record with optional keys
 */
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

/**
 * Non-nullable fields
 */
export type NonNullableFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>
}

/**
 * Async status
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Theme
 */
export type Theme = 'light' | 'dark' | 'system'

// ============================================
// Navigation Types
// ============================================

/**
 * Route meta
 */
export interface RouteMeta {
  requiresAuth?: boolean
  requiresGuest?: boolean
  title?: string
  icon?: string
  roles?: string[]
  permissions?: string[]
  layout?: string
  showInMenu?: boolean
  badge?: string | number
  order?: number
}

/**
 * Nav group
 */
export interface NavGroup {
  label: string
  icon?: string
  items: NavItem[]
  expanded?: boolean
  roles?: string[]
}

/**
 * Nav item
 */
export interface NavItem {
  name: string
  label: string
  icon?: string
  badge?: string | number
  badgeColor?: string
  disabled?: boolean
}

// ============================================
// File Types
// ============================================

/**
 * File info
 */
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  extension: string
  url?: string
  progress?: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * File constraints
 */
export interface FileConstraints {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
  maxFiles?: number
}

// ============================================
// Chart Types
// ============================================

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

/**
 * Chart series
 */
export interface ChartSeries {
  name: string
  data: number[]
  color?: string
}

/**
 * Chart options
 */
export interface ChartOptions {
  title?: string
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'heatmap'
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  animate?: boolean
}

// ============================================
// Event Types
// ============================================

/**
 * Keyboard event handler
 */
export type KeyboardHandler = (event: KeyboardEvent) => void

/**
 * Click event handler
 */
export type ClickHandler = (event: MouseEvent) => void

/**
 * Change event handler
 */
export type ChangeHandler<T = any> = (value: T) => void

/**
 * Submit event handler
 */
export type SubmitHandler<T = any> = (data: T) => void

// ============================================
// ID Types
// ============================================

export type UUID = string
export type ISO8601 = string
export type Timestamp = number
export type Email = string
export type URL = string
export type Phone = string
export type Currency = string
export type Percentage = number
