import type { User, UserRole } from '../models/entities/user/user.entity'

/**
 * Authentication Type Definitions
 */

// ============================================
// Auth State Types
// ============================================

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Decoded JWT token
 */
export interface DecodedToken {
  user_id: string
  role: UserRole
  mode: 'access' | 'refresh'
  email?: string
  organisation_id?: string
  exp: number
  iat: number
  sub: string
}

// ============================================
// Login Types
// ============================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
  device_info?: DeviceInfo
}

/**
 * Device information for login
 */
export interface DeviceInfo {
  device_id?: string
  device_name?: string
  platform?: string
  os_version?: string
  app_version?: string
}

/**
 * Login response
 */
export interface LoginResponse {
  tokens: AuthTokens
  user: User
  requires_mfa?: boolean
  mfa_token?: string
}

/**
 * MFA verification
 */
export interface MFAVerification {
  mfa_token: string
  code: string
  method: 'totp' | 'sms' | 'email'
}

// ============================================
// Registration Types
// ============================================

/**
 * Registration data
 */
export interface RegistrationData {
  email: string
  password: string
  confirm_password: string
  first_name?: string
  last_name?: string
  organisation_id?: string
  accept_terms?: boolean
}

// ============================================
// Password Types
// ============================================

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_new_password?: string
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string
  new_password: string
  confirm_password: string
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  valid: boolean
  message?: string
  strength: PasswordStrength
}

export interface PasswordStrength {
  score: number // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong'
  feedback: string[]
}

// ============================================
// Profile Types
// ============================================

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  preferences?: UserPreferences
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationPreferences
  dashboard_layout?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  in_app: boolean
  workflow_updates: boolean
  incident_alerts: boolean
  risk_alerts: boolean
  compliance_reminders: boolean
  training_notifications: boolean
  system_notifications: boolean
}

// ============================================
// Permission Types
// ============================================

/**
 * User permission
 */
export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'export'
  scope?: 'own' | 'organisation' | 'all'
}

/**
 * Role permissions map
 */
export type RolePermissions = Record<string, Permission[]>

// ============================================
// Session Types
// ============================================

/**
 * Session info
 */
export interface SessionInfo {
  session_id: string
  device: string
  ip_address: string
  location?: string
  last_active: string
  is_current: boolean
}

/**
 * Active sessions
 */
export interface ActiveSessions {
  current: SessionInfo
  others: SessionInfo[]
}
