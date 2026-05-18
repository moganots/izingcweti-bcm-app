import type { ApiResponse, PaginationParams } from './common.types'

/**
 * API Type Definitions
 * Types for all API service communications
 */

// ============================================
// HTTP Types
// ============================================

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * HTTP Headers
 */
export interface HttpHeaders {
  'Content-Type'?: string
  Authorization?: string
  'X-Organisation-Id'?: string
  'X-Request-Id'?: string
  Accept?: string
  [key: string]: string | undefined
}

/**
 * HTTP Request Config
 */
export interface HttpRequestConfig {
  method: HttpMethod
  url: string
  headers?: HttpHeaders
  params?: Record<string, any>
  data?: any
  timeout?: number
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer'
  onUploadProgress?: (progress: number) => void
  onDownloadProgress?: (progress: number) => void
  signal?: AbortSignal
}

/**
 * HTTP Response
 */
export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: HttpRequestConfig
}

/**
 * HTTP Error
 */
export interface HttpError {
  message: string
  status: number
  statusText: string
  data?: any
  config?: HttpRequestConfig
  code?: string
}

// ============================================
// API Service Types
// ============================================

/**
 * API Service interface
 */
export interface ApiServiceInterface {
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>
  post<T>(url: string, data?: any): Promise<ApiResponse<T>>
  put<T>(url: string, data?: any): Promise<ApiResponse<T>>
  patch<T>(url: string, data?: any): Promise<ApiResponse<T>>
  delete<T>(url: string): Promise<ApiResponse<T>>
  upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>>
  download(url: string, filename?: string): Promise<void>
}

/**
 * API Endpoint configuration
 */
export interface ApiEndpoint {
  path: string
  method: HttpMethod
  requiresAuth?: boolean
  requiresOrganisation?: boolean
  rateLimit?: number
  cache?: boolean
  retry?: number
}

// ============================================
// Auth API Types
// ============================================

export namespace AuthAPI {
  export interface LoginRequest {
    email: string
    password: string
    remember_me?: boolean
  }

  export interface LoginResponse {
    success: boolean
    data: {
      access_token: string
      refresh_token: string
      expires_in: number
      token_type: string
      user: any
    }
  }

  export interface RegisterRequest {
    email: string
    password: string
    firstName?: string
    lastName?: string
    organisation_id?: string
  }

  export interface RefreshTokenRequest {
    refresh_token: string
  }

  export interface RefreshTokenResponse {
    access_token: string
    expires_in: number
  }

  export interface ChangePasswordRequest {
    current_password: string
    new_password: string
  }

  export interface ForgotPasswordRequest {
    email: string
  }

  export interface ResetPasswordRequest {
    token: string
    new_password: string
  }
}

// ============================================
// User API Types
// ============================================

export namespace UserAPI {
  export interface GetUsersParams extends PaginationParams {
    role?: string
    organisation_id?: string
    is_active?: boolean
  }

  export interface CreateUserRequest {
    email: string
    password: string
    organisation_id: string
    role: string
  }

  export interface UpdateUserRequest {
    email?: string
    role?: string
    is_active?: boolean
    training_completed_at?: string
  }
}

// ============================================
// BCM API Types
// ============================================

export namespace BCMAPI {
  export interface GetBCPsParams extends PaginationParams {
    plan_status?: string
    function_id?: string
    organisation_id?: string
  }

  export interface CreateBCPRequest {
    function_id: string
    review_due_date: string
    emergency_contact_list: Record<string, any>
    plan_document_url?: string
  }

  export interface CreateBIARequest {
    function_id: string
    assessed_date: string
    financial_impact_per_day: number
    operational_impact: string
    regulatory_impact: string
    reputational_impact: string
  }

  export interface CreateRecoveryStrategyRequest {
    business_continuity_plan_id: string
    recovery_strategy_type: string
    resource_requirements: Record<string, any>
    estimated_recovery_cost: number
  }

  export interface CreateExerciseTestRequest {
    business_continuity_plan_id: string
    exercise_test_type: string
    date: string
    participants: string[]
  }

  export interface RecordTestResultRequest {
    passed: boolean
    lessons_learned: string
    corrective_actions: string
  }
}

// ============================================
// Risk API Types
// ============================================

export namespace RiskAPI {
  export interface GetRisksParams extends PaginationParams {
    risk_category?: string
    impact_severity?: string
    organisation_id?: string
  }

  export interface CreateRiskRequest {
    organisation_id: string
    risk_category: string
    likelihood: number
    impact_severity: string
    inherent_risk_score: number
    residual_risk_score: number
    mitigation_control_ids?: string[]
  }

  export interface ReassessRiskRequest {
    likelihood: number
    impact_severity: string
    inherent_risk_score: number
    residual_risk_score: number
  }
}

// ============================================
// Incident API Types
// ============================================

export namespace IncidentAPI {
  export interface GetIncidentsParams extends PaginationParams {
    incident_severity?: string
    organisation_id?: string
    status?: 'active' | 'closed'
  }

  export interface CreateIncidentRequest {
    organisation_id: string
    incident_severity: string
    root_cause: string
    business_continuity_plan_id_activated: string
    recovery_actual_time?: string
  }

  export interface CloseIncidentRequest {
    closed_at: string
  }
}

// ============================================
// Workflow API Types
// ============================================

export namespace WorkflowAPI {
  export interface CreateWorkflowRequest {
    workflow_type: string
    title: string
    description?: string
    priority?: number
    assigned_to?: string
    entity_id?: string
    entity_type?: string
    due_date?: string
  }

  export interface ApproveWorkflowRequest {
    comments: string
  }

  export interface RejectWorkflowRequest {
    rejection_reason: string
    comments?: string
  }

  export interface EscalateWorkflowRequest {
    escalation_level: number
    reason: string
  }

  export interface AddCommentRequest {
    comment: string
  }
}

// ============================================
// Document API Types
// ============================================

export namespace DocumentAPI {
  export interface GetDocumentsParams extends PaginationParams {
    document_type?: string
    status?: string
    organisation_id?: string
    uploaded_by?: string
    tags?: string
    access_level?: string
    file_type?: string
    uploaded_after?: string
    uploaded_before?: string
  }

  export interface UploadDocumentRequest {
    title: string
    description?: string
    document_type: string
    access_level?: string
    organisation_id: string
    tags?: string[]
  }

  export interface ApproveDocumentRequest {
    comments?: string
  }

  export interface RejectDocumentRequest {
    rejection_reason: string
    comments?: string
  }
}

// ============================================
// Notification API Types
// ============================================

export namespace NotificationAPI {
  export interface GetNotificationsParams extends PaginationParams {
    status?: string
    unread_only?: boolean
    notification_type?: string
  }

  export interface UpdatePreferencesRequest {
    notification_type: string
    email_enabled?: boolean
    sms_enabled?: boolean
    push_enabled?: boolean
    in_app_enabled?: boolean
  }
}

// ============================================
// Sync API Types
// ============================================

export namespace SyncAPI {
  export interface PushChangesRequest {
    changes: any[]
    lastSyncToken?: string
  }

  export interface PullChangesRequest {
    since?: string
    entityTypes?: string[]
    limit?: number
  }

  export interface PullChangesResponse {
    changes: any[]
    syncToken: string
    serverTimestamp: string
  }

  export interface ResolveConflictRequest {
    resolution: any
    strategy?: string
  }
}

// ============================================
// Dashboard API Types
// ============================================

export namespace DashboardAPI {
  export interface KPIsResponse {
    activeBCPs: number
    activeIncidents: number
    highRisks: number
    pendingApprovals: number
    complianceRate: number
    maturityScore: number
  }

  export interface ComplianceOverviewResponse {
    standard: string
    compliant: number
    partially: number
    nonCompliant: number
    total: number
  }

  export interface RiskTrendResponse {
    period: string
    highRisks: number
    mediumRisks: number
    lowRisks: number
  }
}

// ============================================
// Audit API Types
// ============================================

export namespace AuditAPI {
  export interface GetAuditLogsParams extends PaginationParams {
    user_id?: string
    organisation_id?: string
    action?: string
    audit_category?: string
    severity?: string
    entity_type?: string
    entity_id?: string
    start_date?: string
    end_date?: string
    search?: string
  }

  export interface ExportAuditRequest {
    audit_category?: string
    start_date?: string
    end_date?: string
    format?: 'csv' | 'json'
  }
}

// ============================================
// Cache API Types
// ============================================

export namespace CacheAPI {
  export interface SetCacheRequest {
    key: string
    value: any
    ttl?: number
    tags?: string
  }

  export interface GetCacheParams {
    key: string
  }
}

// ============================================
// Error Codes
// ============================================

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}
