import { BaseEntity } from '../../../core/base/base.entity'
import { UserRole } from '../enums/user.enum'

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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationPreferences
  dashboard_layout?: string
}

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
