// ============================================
// Auth Token Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'
import { AuthTokenType, AuthTokenStatus } from '../auth'

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

export interface CreateAuthTokenRequest {
  user_id: string
  token_type: AuthTokenType
  expires_in_days?: number
  ip_address?: string
  user_agent?: string
}

export interface RevokeTokenRequest {
  reason?: string
}

export interface TokenCleanupResult {
  revoked: number
  expired: number
  total_cleaned: number
}
