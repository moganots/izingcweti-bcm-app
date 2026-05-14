// Common types
export * from './common.types'

// API types
export * from './api.types'

// Auth types
export * from './auth.types'

// BCM types
export * from './bcm.types'

// Sync types
export * from './sync.types'

// Database types
export * from './db.types'

// Document types
export * from './document.types'

// Re-export commonly used types
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
  DialogOptions,
  MenuItem,
  FormField,
  SelectOption,
  LoadingState,
  ErrorState,
  EmptyState,
  DeepPartial,
  Nullable,
  AsyncStatus,
  Theme,
  Environment,
} from './common.types'

export type {
  HttpMethod,
  HttpHeaders,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  ApiServiceInterface,
  ErrorCode,
} from './api.types'

export type {
  AuthState,
  AuthTokens,
  DecodedToken,
  LoginCredentials,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  PasswordValidation,
  UserPreferences,
  Permission,
} from './auth.types'

export type {
  BCMState,
  BIAFilters,
  BIASummary,
  BCPFilters,
  BCPProgress,
  TestFilters,
  TestStatistics,
  DashboardData,
  DashboardKPIs,
  RiskTrend,
  MaturityAssessment,
  LifecycleProgress,
} from './bcm.types'

export type {
  SyncConfig,
  SyncOperation,
  SyncError,
  SyncMetrics,
  ChangeSet,
  ChangeBatch,
  ConflictDetails,
  FieldDifference,
  ResolutionOptions,
  NetworkStatus,
  OfflineAction,
  OfflineQueueState,
  SyncEvent,
  SyncEventType,
  SyncEventHandler,
} from './sync.types'

export type {
  DatabaseConfig,
  TableDefinition,
  IndexDefinition,
  QueryFilter,
  QueryOptions,
  QueryResult,
  BaseRepository,
  SyncableRepository,
  Migration,
  StorageStats,
  CacheEntry,
  CacheConfig,
  CacheStats,
  TransactionContext,
} from './db.types'
