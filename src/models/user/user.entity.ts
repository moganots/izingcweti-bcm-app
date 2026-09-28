import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, Department } from "../organisation/organisation.entity";
import type { Certification, UserAttestation, UserCourseProgress } from "../training/training.entity";
import type { Workflow } from "../workflow/workflow.entity";
import type { AuditLog } from "../audit/audit.entity";

// ============================================
// User Module - Enums (Aligned with Backend)
// ============================================

export enum UserRole {
  SYSTEM_ADMINISTRATOR = "System Administrator",
  SUPER_ADMIN = "Super Admin",
  GENERAL = "General",
  BCM_MANAGER = "BCM Manager",
  RISK_OWNER = "Risk Owner",
  PROCESS_OWNER = "Process Owner",
  BCM_COORDINATOR = "BCM Coordinator",
  IT_RECOVERY_OWNER = "IT/Recovery Owner",
  APPROVER = "Approver",
  AUDITOR = "Auditor",
}

export enum UserRelationshipReportingType {
  DIRECT = "Direct",
  DOTTED = "Dotted",
  MATRIX = "Matrix",
}

export enum AuthTokenType {
  ACCESS = "Access",
  REFRESH = "Refresh",
  FORGOT = "Forgot",
  RESET = "Reset",
}

export enum AuthTokenStatus {
  ACTIVE = "Active",
  REVOKED = "Revoked",
  EXPIRED = "Expired",
}

// ============================================
// User Entity - Aligned with Backend
// Backend: src/modules/user/models/entities/user.entity.ts
// ============================================

export interface User extends BaseEntity {
  organisationId: string;
  departmentId?: string;
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  lastPasswordChangeAt?: Date;
  trainingCompletedAt?: Date;
  emailVerifiedAt?: Date;
  termsAcceptedAt?: Date;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  failedLoginAttempts: number;
  lockedAt?: Date;
  lockedUntil?: Date;
  lockReason?: string;
  managerId?: string;
  managedSince?: Date;
  relationshipReportingType: UserRelationshipReportingType;

  // Relationships
  organisation?: Organisation;
  department?: Department;
  manager?: User;
  directReports?: User[];
  authTokens?: AuthToken[];
  auditLogs?: AuditLog[];
  certifications?: Certification[];
  courseProgress?: UserCourseProgress[];
  attestations?: UserAttestation[];
  initiatedWorkflows?: Workflow[];
  assignedWorkflows?: Workflow[];
}

export interface AuthToken extends BaseEntity {
  organisationId: string;
  userId: string;
  token: string;
  tokenType: AuthTokenType;
  status: AuthTokenStatus;
  expiresAt: Date;
  revokedAt?: Date;
  lastUsedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  isActiveSession: boolean;
  sessionMetadata?: Record<string, any>;
}

// ============================================
// User Helper Functions (Computed Properties)
// ============================================

export const UserHelpers = {
  fullName: (user: User): string => {
    return (
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    );
  },

  hasCompletedTraining: (user: User): boolean => {
    return !!user.trainingCompletedAt;
  },

  isAccountLocked: (user: User): boolean => {
    if (!user.lockedUntil) return false;
    return new Date() < user.lockedUntil;
  },

  getLockRemainingTime: (user: User): number | null => {
    if (!user.lockedUntil) return null;
    const now = new Date();
    if (now >= user.lockedUntil) return 0;
    return user.lockedUntil.getTime() - now.getTime();
  },
};

// ============================================
// User Request/Response Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organisationId?: string;
  departmentId?: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  organisationId: string;
  departmentId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  preferences?: Record<string, any>;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: Record<string, any>;
  departmentId?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface UserQueryParams {
  organisationId?: string;
  departmentId?: string;
  departmentIds?: string[];
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  startDate?: Date;
  endDate?: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  verifiedUsers: number;
  trainingCompleted: number;
}

export interface LockAccountRequest {
  lockedUntil?: Date;
  reason?: string;
}

export interface BulkUserUpdateRequest {
  userIds: string[];
  isActive?: boolean;
  role?: UserRole;
  departmentId?: string;
}