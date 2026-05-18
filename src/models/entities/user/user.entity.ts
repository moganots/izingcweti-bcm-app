/**
 * User Role Enum
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
 * User Entity (FLAT version for IndexedDB)
 * Only contains primitive values and IDs - no nested entity relationships
 */
export interface User {
  uuid: string
  first_name: string
  last_name: string
  email: string
  password?: string
  organisation_id: string
  role: string
  is_active: boolean
  last_login?: string | null
  training_completed_at?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
  organisation?: {
    uuid: string
    name: string
  }
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

/**
 * Auth Tokens
 */
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Login Response
 */
export interface LoginResponse {
  tokens: AuthTokens
  user: User
}

/**
 * Auth State
 */
export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
