import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import type { User } from '../../../models/entities/user/user.entity'
import type {
  LoginCredentials,
  AuthTokens,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './../../../types'

/**
 * Raw API response format
 */
interface AuthResponse {
  status: string
  message: string
  accessToken: string
  refreshToken: string
  user: User
  requestId?: string
  timestamp?: string
}

/**
 * Authentication API Service
 */
export class AuthService extends BaseService {
  /**
   * Login with credentials
   * Handles the actual API response format
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    // Extract and transform the response data
    const authResponse = this.extractData(response)
    // Transform to expected format
    return {
      tokens: {
        access_token: authResponse?.accessToken,
        refresh_token: authResponse?.refreshToken,
        expires_in: 3600, // Default 1 hour if not provided
        token_type: 'Bearer',
      },
      user: authResponse?.user,
    }
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
    const response = await this.post<{ accessToken: string; refreshToken?: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refresh_token: refreshToken }
    )
    const data = this.extractData(response)

    return {
      access_token: data.accessToken,
      refresh_token: data.refreshToken || refreshToken,
      expires_in: 3600,
      token_type: 'Bearer',
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.LOGOUT)
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
    const response = await this.get<{ email: string }>(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN(token))
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
    const response = await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
    this.extractData(response)
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
    this.extractData(response)
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION)
  }
}

// Export singleton
export const authService = new AuthService()