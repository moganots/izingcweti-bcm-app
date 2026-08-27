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
  // ============================================
  // Authentication
  // ============================================

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Backend expects camelCase in DTO
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await this.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
      user: User;
    }>(API_ENDPOINTS.AUTH.LOGIN, payload);

    const data = this.extractData(response);

    // Store tokens
    this.setAuthToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);

    // Return camelCase response
    return {
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600,
        tokenType: data.tokenType || 'Bearer',
      },
      user: data.user,
      requiresMfa: false,
      mfaToken: '',
    };
  }

  async register(data: RegistrationData): Promise<User> {
    // Backend expects camelCase in DTO
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      organisationId: data.organisationId,
      departmentId: data.departmentId,
      phoneNumber: data.phoneNumber,
      role: data.role,
    };
    // Remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    const response = await this.post<User>(API_ENDPOINTS.AUTH.REGISTER, payload);
    return this.extractData(response);
  }

  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.PROFILE);
    return this.extractData(response);
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      this.clearAuthTokens();
    }
  }

  async logoutAllDevices(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT_ALL);
    } finally {
      this.clearAuthTokens();
    }
  }

  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await this.post<{
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
      }>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken: refreshToken,
      });

      const data = this.extractData(response);

      if (!data || !data.accessToken) {
        throw new Error('Invalid refresh response');
      }

      this.setAuthToken(data.accessToken);
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn || 3600,
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthTokens();
      return null;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get(API_ENDPOINTS.AUTH.VALIDATE);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Password Management
  // ============================================

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    await this.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const payload = {
      token: data.token,
      newPassword: data.newPassword,
    };
    await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  }

  // ============================================
  // Session Management
  // ============================================

  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.get<SessionInfo[]>(API_ENDPOINTS.AUTH.SESSIONS);
    return this.extractData(response);
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.AUTH.SESSION(sessionId));
  }

  // ============================================
  // Token Management
  // ============================================

  async getUserTokens(userId: string): Promise<AuthToken[]> {
    const response = await this.get<AuthToken[]>(
      API_ENDPOINTS.AUTH_TOKENS.BY_USER_ID(userId)
    );
    return this.extractData(response);
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE(tokenId));
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE_ALL_BY_USER(userId));
  }

  async cleanupExpiredTokens(): Promise<{
    revoked: number;
    expired: number;
    totalCleaned: number;
  }> {
    const response = await this.post<{
      revoked: number;
      expired: number;
      totalCleaned: number;
    }>(API_ENDPOINTS.AUTH.CLEANUP);
    const data = this.extractData(response);
    return {
      revoked: data.revoked,
      expired: data.expired,
      totalCleaned: data.totalCleaned,
    };
  }

  // ============================================
  // Profile & User Management
  // ============================================

  async updateProfile(data: Partial<User>): Promise<User> {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      preferences: data.preferences,
      avatarUrl: data.avatarUrl,
      metadata: data.metadata,
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    const response = await this.patch<User>(API_ENDPOINTS.USERS.PROFILE, payload);
    return this.extractData(response);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role,
      isActive: data.isActive,
      preferences: data.preferences,
      departmentId: data.departmentId,
      avatarUrl: data.avatarUrl,
      metadata: data.metadata,
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    const response = await this.patch<User>(
      API_ENDPOINTS.USERS.UPDATE(userId),
      payload
    );
    return this.extractData(response);
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(userId));
    return this.extractData(response);
  }
}

export const authService = new AuthService();