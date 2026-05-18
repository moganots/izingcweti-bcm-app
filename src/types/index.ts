// ============================================
// Core Types
// ============================================
export * from './common.types'
export * from './api.types'
export * from './auth.types'

// ============================================
// Domain Types
// ============================================
export * from './bcm.types'
export * from './sync.types'

// ============================================
// Module Types
// ============================================
export * from './db.types'
export * from './document.types'
export * from './dashboard.types'
export * from './settings.types'
export * from './router.types'

// ============================================
// Re-export Commonly Used Types (for convenience)
// ============================================

// Common Types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  PaginationParams,
  PaginationState,
  QueryParams,
  DateRange,
  SortOption,
  Toast,
  ToastAction,
  DialogOptions,
  MenuItem,
  BreadcrumbItem,
  TabConfig,
  FormField,
  SelectOption,
  ValidationRule,
  LoadingState,
  ErrorState,
  EmptyState,
  DeepPartial,
  RecursivePartial,
  Nullable,
  OmitMultiple,
  PickRequired,
  ValueOf,
  PartialRecord,
  NonNullableFields,
  AsyncStatus,
  Theme,
  Environment,
  RouteMeta,
  NavGroup,
  NavItem,
  FileInfo,
  UploadProgress,
  FileConstraints,
  ChartDataPoint,
  ChartSeries,
  ChartOptions,
  KeyboardHandler,
  ClickHandler,
  ChangeHandler,
  SubmitHandler,
  UUID,
  ISO8601,
  Timestamp,
  Email,
  URL,
  Phone,
  Currency,
  Percentage,
} from './common.types'

// API Types
export type {
  HttpMethod,
  HttpHeaders,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  ApiServiceInterface,
  ApiEndpoint,
} from './api.types'

export { ErrorCode } from './api.types'

// Auth Types
export type {
  AuthState,
  AuthTokens,
  DecodedToken,
  LoginCredentials,
  DeviceInfo,
  LoginResponse,
  MFAVerification,
  RegistrationData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordValidation,
  PasswordStrength,
  UpdateProfileRequest,
  UserPreferences as AuthUserPreferences,
  NotificationPreferences,
  Permission,
  RolePermissions,
  SessionInfo,
  ActiveSessions,
} from './auth.types'

// Organisation Types
export type {
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  OrganisationQueryParams,
  CreateBusinessUnitRequest,
  UpdateBusinessUnitRequest,
  BusinessUnitQueryParams,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQueryParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQueryParams,
  OrganisationStats,
  OrganisationDashboard,
  BulkImportResult,
  ExportOptions,
} from './organisation.types'

// BCM Types
export type {
  BCMState,
  BIAFilters,
  BIASummary,
  BCPFilters,
  BCPProgress,
  EmergencyContact,
  TestFilters,
  TestStatistics,
  TestResult,
  StrategyFilters,
  StrategyComparison,
  ComplianceFilters,
  ComplianceGap,
  MaturityAssessment,
  MaturityProgress as BcmMaturityProgress,
  MaturityDomain,
  LifecycleProgress,
  DashboardKPIs,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
  IncidentTrend,
  CriticalFunctionQueryParams,
  BIAQueryParams,
  BCPQueryParams,
  RecoveryStrategyQueryParams,
  ExerciseTestQueryParams,
  RiskQueryParams,
  ComplianceQueryParams,
  IncidentQueryParams,
  WorkflowQueryParams,
  NotificationQueryParams,
  AuditQueryParams,
  UserQueryParams,
  SyncQueryParams,
  RuleQueryParams,
  DashboardQueryParams,
} from './bcm.types'

export { BCMLifecyclePhase } from './bcm.types'

// Document Types
export type {
  GetDocumentsParams,
  ApproveDocumentRequest,
  RejectDocumentRequest,
} from './document.types'

// Dashboard Types
export type {
  DashboardData,
  DashboardKPIs as DashboardKPIsType,
  RiskTrend as DashboardRiskTrend,
} from './dashboard.types'

// Settings Types
export type {
  UpdateSettingsRequest,
  SettingsQueryParams,
  BulkUpdateSettingsRequest,
  SettingsExportOptions,
  SettingsImportResult,
  SettingsValidationResult,
  DefaultSettingsTemplate,
} from './settings.types'

// Sync Types
export type {
  SyncConfig,
  SyncOperation,
  SyncError,
  SyncQueue,
  SyncMetrics,
  ChangeSet,
  ChangeBatch,
  ConflictDetails,
  FieldDifference,
  ResolutionOptions,
  NetworkStatus as SyncNetworkStatus,
  ConnectionQuality,
  OfflineAction,
  OfflineQueueState,
  StorageUsage,
  SyncEvent,
  SyncEventHandler,
} from './sync.types'

export type { CreateRiskRequest, UpdateRiskRequest, ReassessRiskRequest } from './risk.types'

export {
  ConflictResolutionStrategy,
  ConnectionType,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_ICONS,
  CONNECTION_TYPE_COLORS,
  isMeteredConnection,
  isHighBandwidthConnection,
  getConnectionType,
  NetworkEventType,
  SyncEventType,
} from './sync.types'

// Database Types
export type {
  DatabaseConfig,
  TableDefinition,
  IndexDefinition,
  EncryptionConfig,
  QueryFilter,
  QueryOptions,
  QueryResult,
  BaseRepository,
  SyncableRepository,
  Migration,
  MigrationState,
  StorageStats,
  TableStats,
  DatabaseBackup,
  CacheEntry as DbCacheEntry,
  CacheConfig as DbCacheConfig,
  CacheStats as DbCacheStats,
  TransactionContext,
} from './db.types'

export type { QueryOperator, TransactionMode } from './db.types'

import { ApiError, ApiResponse, PaginatedResponse } from './common.types'
// Router Types (augmentation only)
import './router.types'

// ============================================
// Type Utilities
// ============================================

/**
 * Extract data from API response with proper typing
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || 'API request failed')
  }
  return response.data
}

/**
 * Extract paginated data with proper typing
 */
export function extractPaginatedData<T>(response: PaginatedResponse<T>): {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
} {
  return {
    data: response.data || [],
    total: response.total || 0,
    page: response.page || 1,
    limit: response.limit || 10,
    totalPages: response.totalPages || 1,
    hasMore: response.hasMore || false,
  }
}

/**
 * Create an error response object
 */
export function createErrorResponse(message: string, code?: string): ApiResponse<null> {
  return {
    success: false,
    data: null,
    message,
    errors: (code ? [{ field: undefined, message, code }] : undefined) as unknown as ApiError[],
  }
}

/**
 * Create a success response object
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  } as ApiResponse<T>
}

/**
 * Create a paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  }
}
