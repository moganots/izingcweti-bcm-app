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
// ENTITY (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * User Entity - Aligned with Backend DTO (camelCase)
 */
export interface User {
  uuid: string;
  organisationId: string;
  departmentId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: UserRole | string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | Date | null;
  lastPasswordChangeAt?: string | Date | null;
  trainingCompletedAt?: string | Date | null;
  emailVerifiedAt?: string | Date | null;
  termsAcceptedAt?: string | Date | null;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  resetToken?: string;
  resetTokenExpiresAt?: string | Date | null;
  failedLoginAttempts?: number;
  lockedAt?: string | Date | null;
  lockedUntil?: string | Date | null;
  lockReason?: string;
  createdBy: string;
  createdAt: string | Date;
  updatedBy: string;
  updatedAt: string | Date;
  version: number;
  syncStatus?: string;
  deletedBy?: string | null;
  deletedAt?: string | null;
  // Relationships
  organisation?: {
    uuid: string;
    name: string;
  };
  department?: {
    uuid: string;
    name: string;
  };
  // Computed
  fullName?: string;
  hasCompletedTraining?: boolean;
  isAccountLocked?: boolean;
}

/**
 * Auth Token Entity - Aligned with Backend DTO (camelCase)
 */
export interface AuthTokenEntity {
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
 * Session Info - Aligned with Backend DTO (camelCase)
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

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

/**
 * Login Credentials (camelCase)
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Auth Tokens (camelCase)
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Login Response (camelCase)
 */
export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  requiresMfa?: boolean;
  mfaToken?: string;
}

/**
 * Registration Data (camelCase)
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
 * Change Password Request (camelCase)
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Forgot Password Request (camelCase)
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request (camelCase)
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth Token (camelCase)
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
 * Auth State (camelCase)
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

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
  avatarUrl?: string;
  metadata?: Record<string, any>;
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
  departmentIds?: string[];
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
  hasMore?: boolean;
}

/**
 * User Statistics (camelCase)
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  verifiedUsers: number;
  trainingCompleted: number;
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