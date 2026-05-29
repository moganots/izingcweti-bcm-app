import { BaseService } from '../../BaseService'
import {
  // Types
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
    }>('/auth/login', credentials)

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
      await this.post('/auth/logout')
    } finally {
      this.clearAuthTokens()
    }
  }

  async logoutAllDevices(): Promise<void> {
    try {
      await this.post('/auth/logout-all')
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
      }>('/auth/refresh', { refresh_token: refreshToken })

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
      await this.get('/auth/validate')
      return true
    } catch {
      return false
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.post('/auth/change-password', data)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.post('/auth/forgot-password', data)
  }

  async verifyResetToken(token: string): Promise<{ email: string }> {
    const response = await this.get<{ email: string }>(`/auth/verify-reset-token/${token}`)
    return this.extractData(response)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.post('/auth/reset-password', data)
  }

  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.get<SessionInfo[]>('/auth/sessions')
    return this.extractData(response)
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(`/auth/sessions/${sessionId}`)
  }

  async revokeOtherSessions(): Promise<void> {
    await this.post('/auth/sessions/revoke-others')
  }

  async getUserTokens(userId: string): Promise<AuthToken[]> {
    const response = await this.get<AuthToken[]>(`/auth/tokens/users/${userId}`)
    return this.extractData(response)
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.post(`/auth/tokens/${tokenId}/revoke`)
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.post(`/auth/tokens/users/${userId}/revoke-all`)
  }

  async cleanupExpiredTokens(): Promise<{
    revoked: number
    expired: number
    total_cleaned: number
  }> {
    const response = await this.post<{ revoked: number; expired: number; total_cleaned: number }>(
      '/auth/cleanup'
    )
    return this.extractData(response)
  }
}

export const authService = new AuthService()
