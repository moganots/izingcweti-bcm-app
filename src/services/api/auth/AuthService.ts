import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import type {
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  RegistrationData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthToken,
  SessionInfo,
  User,
} from './../../../models/entities/user/user.entity'

export class AuthService extends BaseService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
        if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const response = await this.post<{
      accessToken: string
      refreshToken: string
      expires_in: number
      token_type: string
      user: User
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    const data = this.extractData(response)

    this.setAuthToken(data.accessToken)
    this.setRefreshToken(data.refreshToken)

    return {
      tokens: {
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        expires_in: data.expires_in,
        token_type: data.token_type || 'Bearer',
      },
      user: data.user,
      requires_mfa: false,
      mfa_token: '',
    }
  }

  async register(data: RegistrationData): Promise<User> {
    const response = await this.post<User>(API_ENDPOINTS.AUTH.REGISTER, data)
    return this.extractData(response)
  }

  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.AUTH.PROFILE)
    return this.extractData(response)
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
        refresh_token?: string
        expires_in: number
      }>(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken })

      const data = this.extractData(response)

      // Validate response before updating tokens
      if (!data || !data.access_token) {
        throw new Error('Invalid refresh response')
      }

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
    } catch (error) {
      console.error('Token refresh failed:', error)
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

  async verifyResetToken(token: string): Promise<{ email: string }> {
    const response = await this.get<{ email: string }>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN(token)
    )
    return this.extractData(response)
  }

  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.get<SessionInfo[]>(API_ENDPOINTS.AUTH.SESSIONS)
    return this.extractData(response)
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.AUTH.SESSION(sessionId))
  }

  async revokeOtherSessions(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.REVOKE_OTHERS)
  }

  async getUserTokens(userId: string): Promise<AuthToken[]> {
    const response = await this.get<AuthToken[]>(
      API_ENDPOINTS.AUTH_TOKENS.BY_USER(userId)
    )
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
    const response = await this.post<{
      revoked: number
      expired: number
      total_cleaned: number
    }>(API_ENDPOINTS.AUTH.CLEANUP)
    return this.extractData(response)
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.AUTH.PROFILE, data)
    return this.extractData(response)
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.patch<User>(
      API_ENDPOINTS.USERS.UPDATE(userId),
      data
    )
    return this.extractData(response)
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.GET(userId))
    return this.extractData(response)
  }
}

export const authService = new AuthService()