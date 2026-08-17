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
 * Auth Token Type Enum
 */
export enum AuthTokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET = 'RESET',
  VERIFY = 'VERIFY',
}

/**
 * Auth Token Status Enum
 */
export enum AuthTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

/**
 * User Entity - Aligned with Backend
 * All fields match the backend User entity
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
 * Login Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Auth Tokens
 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  requires_mfa?: boolean;
  mfa_token?: string;
}

/**
 * Registration Data
 */
export interface RegistrationData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  organisation_id?: string;
  department_id?: string;
  phone_number?: string;
  role?: UserRole;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password?: string;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Auth Token DTO
 */
export interface AuthToken {
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
 * Session Info
 */
export interface SessionInfo {
  token_id: string;
  device_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string | Date;
  last_used_at?: string | Date | null;
  expires_at: string | Date;
  is_current?: boolean;
}

/**
 * Auth State
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}