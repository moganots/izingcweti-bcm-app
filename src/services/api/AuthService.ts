import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { User } from '../../models/entities/user.entity'
import type {
  LoginCredentials,
  AuthTokens,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../types/auth.types'

/**
 * Authentication API Service
 */
export class AuthService extends BaseService {
  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return this.extractData(response)
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    organisation_id?: string
  }): Promise<User> {
    const response = await this.post<User>(API_ENDPOINTS.AUTH.REGISTER, data)
    return this.extractData(response)
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    })
    return this.extractData(response)
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.LOGOUT || '/auth/logout')
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.AUTH.PROFILE)
    return this.extractData(response)
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.put<User>(API_ENDPOINTS.AUTH.PROFILE, data)
    return this.extractData(response)
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
    this.extractData(response)
  }

  /**
   * Forgot password - request reset link
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
    this.extractData(response)
  }

  /**
   * Verify password reset token validity
   */
  async verifyResetToken(token: string): Promise<{ email: string }> {
    const response = await this.get<{ email: string }>(`/auth/verify-reset-token/${token}`)
    return this.extractData(response)
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string
    new_password: string
    confirm_password: string
  }): Promise<void> {
    const response = await this.post('/auth/reset-password', data)
    this.extractData(response)
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await this.post('/auth/verify-email', { token })
    this.extractData(response)
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await this.post('/auth/resend-verification')
  }
}

// Export singleton
export const authService = new AuthService()
