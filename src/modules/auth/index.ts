// ============================================
// Auth Module - Enums
// ============================================

export enum AuthTokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET = 'RESET',
}

export enum AuthTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

// ============================================
// Auth Module - Types
// ============================================

import { User } from '../user'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
  device_info?: DeviceInfo
}

export interface DeviceInfo {
  device_id?: string
  device_name?: string
  platform?: string
  os_version?: string
  app_version?: string
}

export interface LoginResponse {
  tokens: AuthTokens
  user: User
  requires_mfa?: boolean
  mfa_token?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_new_password?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
  confirm_password: string
}

export interface SessionInfo {
  session_id: string
  device: string
  ip_address: string
  location?: string
  last_active: string
  is_current: boolean
}
