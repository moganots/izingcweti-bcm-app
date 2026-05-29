import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  type AuthTokens,
  type LoginCredentials,
  type LoginResponse,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type AuthToken,
  type SessionInfo,
} from './../../../modules'

export class AuthService extends BaseService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<{
      access_token: string
      refresh_token: string
      expires_in: number
      user: any
      requires_mfa?: boolean
      mfa_token?: string
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    const data = this.extractData(response)

    this.setAuthToken(data.access_token)
    this.setRefreshToken(data.refresh_token)

    return {
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: 'Bearer',
      },
      user: data.user,
      requires_mfa: data.requires_mfa ?? false,
      mfa_token: data.mfa_token!,
    }
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT)
    } finally {
      this.clearAuthTokens()
    }
  }

  async logoutAllDevices(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT_ALL)
    } finally {
      this.clearAuthTokens()
    }
  }

  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return null

      const response = await this.post<{
        access_token: string
        refresh_token: string
        expires_in: number
      }>(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken })

      const data = this.extractData(response)

      this.setAuthToken(data.access_token)
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token)
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_in: data.expires_in,
        token_type: 'Bearer',
      }
    } catch {
      this.clearAuthTokens()
      return null
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get(API_ENDPOINTS.AUTH.VALIDATE)
      return true
    } catch {
      return false
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
  }

  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.get<SessionInfo[]>(API_ENDPOINTS.AUTH.SESSIONS)
    return this.extractData(response)
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.AUTH.SESSION(sessionId))
  }

  async revokeOtherSessions(): Promise<void> {
    await this.post('/auth/sessions/revoke-others')
  }

  async getUserTokens(userId: string): Promise<AuthToken[]> {
    const response = await this.get<AuthToken[]>(API_ENDPOINTS.AUTH_TOKENS.BY_USER(userId))
    return this.extractData(response)
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE(tokenId))
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE_ALL(userId))
  }

  async cleanupExpiredTokens(): Promise<{
    revoked: number
    expired: number
    total_cleaned: number
  }> {
    const response = await this.post<{ revoked: number; expired: number; total_cleaned: number }>(
      API_ENDPOINTS.AUTH.CLEANUP
    )
    return this.extractData(response)
  }

  async verifyResetToken(token: string): Promise<{ email: string }> {
    const response = await this.get<{ email: string }>(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN(token))
    return this.extractData(response)
  }
}

export const authService = new AuthService()
