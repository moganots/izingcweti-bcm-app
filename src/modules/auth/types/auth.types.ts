import { User } from '../../user/types/user.types'
import { BaseEntity } from '../../../core/base/base.entity'
import { AuthTokenStatus, AuthTokenType } from '../enums/auth.enum'

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

export interface AuthToken extends BaseEntity {
  user_id: string
  organisation_id?: string
  token: string
  token_type: AuthTokenType
  status: AuthTokenStatus
  expires_at: string
  revoked_at?: string
  ip_address?: string
  user_agent?: string
}

export interface SessionInfo {
  session_id: string
  device: string
  ip_address: string
  location?: string
  last_active: string
  is_current: boolean
}
