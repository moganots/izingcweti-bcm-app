/**
 * User Role Enum - Aligned with Backend
 */
export enum UserRole {
  SYSTEM_ADMINISTRATOR = 'System Administrator',
  BCM_MANAGER = 'BCM Manager',
  RISK_OWNER = 'Risk Owner',
  PROCESS_OWNER = 'Process Owner',
  BCM_COORDINATOR = 'BCM Coordinator',
  IT_RECOVERY_OWNER = 'IT/Recovery Owner',
  APPROVER = 'Approver',
  AUDITOR = 'Auditor',
  SUPER_ADMIN = 'Super Admin',
}

/**
 * Auth Token Type Enum - Aligned with Backend
 */
export enum AuthTokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET = 'RESET',
  VERIFY = 'VERIFY',
}

/**
 * Auth Token Status Enum - Aligned with Backend
 */
export enum AuthTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

// ============================================
// ENTITY (snake_case - Matches Backend Database)
// ============================================

/**
 * User Entity - Matches Backend (snake_case for entity fields)
 */
export interface User {
  uuid: string;
  organisation_id: string;
  department_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone_number?: string;
  role: UserRole | string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: string | Date | null;
  last_password_change_at?: string | Date | null;
  training_completed_at?: string | Date | null;
  email_verified_at?: string | Date | null;
  terms_accepted_at?: string | Date | null;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  reset_token?: string;
  reset_token_expires_at?: string | Date | null;
  failed_login_attempts?: number;
  locked_at?: string | Date | null;
  locked_until?: string | Date | null;
  lock_reason?: string;
  created_by: string;
  created_at: string | Date;
  updated_by: string;
  updated_at: string | Date;
  version: number;
  sync_status?: string;
  deleted_by?: string | null;
  deleted_at?: string | null;
  // Relationships (optional for frontend)
  organisation?: {
    uuid: string;
    name: string;
  };
  department?: {
    uuid: string;
    name: string;
  };
}

/**
 * Auth Token Entity - Matches Backend (snake_case)
 */
export interface AuthTokenEntity {
  uuid: string;
  user_id: string;
  organisation_id: string;
  token: string;
  token_type: AuthTokenType;
  status: AuthTokenStatus;
  expires_at: string | Date;
  revoked_at?: string | Date | null;
  last_used_at?: string | Date | null;
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
  device_name?: string;
  is_active_session: boolean;
  session_metadata?: Record<string, any>;
  created_by: string;
  created_at: string | Date;
  updated_by: string;
  updated_at: string | Date;
}

/**
 * Session Info - Matches Backend (snake_case)
 */
export interface SessionInfoEntity {
  token_id: string;
  device_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string | Date;
  last_used_at?: string | Date | null;
  expires_at: string | Date;
  is_current?: boolean;
}

// ============================================
// DTOs (camelCase - For Frontend API Calls)
// ============================================

/**
 * Login Credentials (camelCase for DTO)
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Auth Tokens (camelCase for DTO)
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Login Response (camelCase for DTO)
 */
export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  requiresMfa?: boolean;
  mfaToken?: string;
}

/**
 * Registration Data (camelCase for DTO)
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organisationId?: string;
  departmentId?: string;
  phoneNumber?: string;
  role?: UserRole;
}

/**
 * Change Password Request (camelCase for DTO)
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Forgot Password Request (camelCase for DTO)
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request (camelCase for DTO)
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth Token DTO (camelCase for DTO)
 */
export interface AuthToken {
  uuid: string;
  userId: string;
  organisationId: string;
  token: string;
  tokenType: AuthTokenType;
  status: AuthTokenStatus;
  expiresAt: string | Date;
  revokedAt?: string | Date | null;
  lastUsedAt?: string | Date | null;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  isActiveSession: boolean;
  sessionMetadata?: Record<string, any>;
  createdBy: string;
  createdAt: string | Date;
  updatedBy: string;
  updatedAt: string | Date;
}

/**
 * Session Info (camelCase for DTO)
 */
export interface SessionInfo {
  tokenId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | Date;
  lastUsedAt?: string | Date | null;
  expiresAt: string | Date;
  isCurrent?: boolean;
}

/**
 * Auth State (camelCase for DTO)
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

/**
 * Create User Request (camelCase)
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  organisationId: string;
  departmentId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

/**
 * Update User Request (camelCase)
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: Record<string, any>;
  departmentId?: string;
}

/**
 * User Query Parameters (camelCase)
 */
export interface UserQueryParams {
  organisationId?: string;
  departmentId?: string;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string | Date;
  endDate?: string | Date;
}

/**
 * Paginated Response (camelCase)
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * User Statistics (camelCase)
 */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  trainingCompleted: number;
  trainingPending: number;
  byRole: Record<string, number>;
  byOrganisation: Record<string, number>;
}

/**
 * Create Auth Token Request (camelCase)
 */
export interface CreateAuthTokenRequest {
  userId: string;
  token: string;
  tokenType: AuthTokenType;
  expiresAt: string | Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  sessionMetadata?: Record<string, any>;
}

/**
 * Update Auth Token Request (camelCase)
 */
export interface UpdateAuthTokenRequest {
  status?: AuthTokenStatus;
  revokedAt?: string | Date;
  lastUsedAt?: string | Date;
  isActiveSession?: boolean;
}