// ============================================
// User Module - Enums
// ============================================

export enum UserRole {
  SYSTEM_ADMINISTRATOR = 'System Administrator',
  BCM_MANAGER = 'BCM Manager',
  RISK_OWNER = 'Risk Owner',
  PROCESS_OWNER = 'Process Owner',
  BCM_COORDINATOR = 'BCM Coordinator',
  IT_RECOVERY_OWNER = 'IT/Recovery Owner',
  APPROVER = 'Approver',
  AUDITOR = 'Auditor',
  SUPER_ADMIN = 'Super Admin',
}

// ============================================
// User Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'
import { UserPreferences } from '../settings'

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  in_app: boolean
  workflow_updates: boolean
  incident_alerts: boolean
  risk_alerts: boolean
  compliance_reminders: boolean
  training_notifications: boolean
  system_notifications: boolean
}

export interface User extends BaseEntity {
  email: string
  organisation_id: string
  first_name?: string
  last_name?: string
  role: UserRole
  is_active: boolean
  last_login_at?: string
  last_password_change_at?: string
  training_completed_at?: string
  email_verified_at?: string
  preferences?: UserPreferences
}

// Request Types
export interface CreateUserRequest {
  email: string
  password: string
  organisation_id: string
  role: UserRole
  first_name?: string
  last_name?: string
}

export interface UpdateUserRequest {
  email?: string
  role?: UserRole
  is_active?: boolean
  first_name?: string
  last_name?: string
  training_completed_at?: string
}
