// ============================================
// Tenant Module - Enums
// ============================================

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum TenantTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AwsRegion {
  US_EAST_1 = 'us-east-1',
  US_WEST_2 = 'us-west-2',
  EU_WEST_1 = 'eu-west-1',
  EU_CENTRAL_1 = 'eu-central-1',
  AP_SOUTHEAST_1 = 'ap-southeast-1',
  AP_NORTHEAST_1 = 'ap-northeast-1',
}

export enum TenantFeature {
  CUSTOM_DOMAIN = 'CUSTOM_DOMAIN',
  SSO = 'SSO',
  API_ACCESS = 'API_ACCESS',
  ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
  WHITE_LABEL = 'WHITE_LABEL',
  MULTI_REGION = 'MULTI_REGION',
  CUSTOM_ROLES = 'CUSTOM_ROLES',
  AUDIT_LOGS = 'AUDIT_LOGS',
}

export enum TenantAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SUSPENDED = 'SUSPENDED',
  ACTIVATED = 'ACTIVATED',
  DELETED = 'DELETED',
  TIER_CHANGED = 'TIER_CHANGED',
  FEATURE_TOGGLED = 'FEATURE_TOGGLED',
  AWS_RESOURCES_PROVISIONED = 'AWS_RESOURCES_PROVISIONED',
  AWS_RESOURCES_DEPROVISIONED = 'AWS_RESOURCES_DEPROVISIONED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  QUOTA_CHANGED = 'QUOTA_CHANGED',
  CONFIG_CHANGED = 'CONFIG_CHANGED',
}

// ============================================
// Tenant Module - Types
// ============================================

import type { BaseEntity } from './../../../core/base/base.entity';
import type { Organisation } from './../organisation/organisation.entity'

export interface AwsResources {
  cognito_user_pool_id?: string
  cognito_app_client_id?: string
  s3_bucket_name?: string
  dynamodb_table_prefix?: string
  iam_role_arn?: string
  kms_key_arn?: string
  cloudwatch_log_group?: string
  parameter_store_path?: string
  secret_manager_secret_id?: string
  rds_instance_identifier?: string
  elasticache_cluster_id?: string
  sqs_queue_url?: string
  sns_topic_arn?: string
}

export interface TenantResourceQuotas {
  max_users: number
  max_storage_gb: number
  max_api_calls_per_day: number
  max_workflows_per_month: number
  max_documents: number
  retention_days: number
  backup_retention_days: number
}

export interface TenantPasswordPolicy {
  min_length: number
  require_numbers: boolean
  require_special_chars: boolean
  require_uppercase: boolean
  expiry_days: number
}

export interface TenantMaintenanceWindow {
  day: string
  start_hour: number
  duration_hours: number
}

export interface TenantConfig {
  timezone: string
  date_format: string
  language: string
  session_timeout_minutes: number
  mfa_required: boolean
  password_policy: TenantPasswordPolicy
  backup_schedule: string
  maintenance_window: TenantMaintenanceWindow
}

export interface Tenant extends BaseEntity {
  name: string
  domain_prefix: string
  custom_domain?: string
  email: string
  status: TenantStatus
  tier: TenantTier
  primary_region: AwsRegion
  aws_account_id?: string
  aws_resources?: AwsResources
  resource_quotas?: TenantResourceQuotas
  config?: TenantConfig
  features?: TenantFeature[]
  billing_email?: string
  subscription_id?: string
  subscription_end_date?: string
  data_isolation_enabled: boolean
  encryption_enabled: boolean
  encryption_key_arn?: string
  last_backup_at?: string
  tags?: Record<string, string>
  organisations?: Organisation[]
}

export interface TenantAuditLog extends BaseEntity {
  tenant_id: string
  action: TenantAuditAction
  performed_by: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface TenantResourceUsage {
  active_users: number
  storage_used_gb: number
  api_calls_today: number
  workflows_this_month: number
  documents_count: number
}

export interface TenantMetrics {
  tenant_id: string
  name: string
  status: TenantStatus
  tier: TenantTier
  created_at: string
  resource_usage: TenantResourceUsage
  resource_quotas: TenantResourceQuotas
  features: TenantFeature[]
  aws_resources_provisioned: boolean
}

export interface TenantBackup {
  id: string
  tenant_id: string
  backup_type: 'FULL' | 'INCREMENTAL'
  backup_size_bytes: number
  backup_url: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RESTORING'
  started_at: string
  completed_at?: string
  created_by: string
  metadata?: Record<string, any>
}

export interface TenantBillingInfo {
  tenant_id: string
  subscription_tier: string
  billing_cycle: 'MONTHLY' | 'ANNUAL'
  current_period_start: string
  current_period_end: string
  amount: number
  currency: string
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL'
  payment_method?: string
  invoices: TenantInvoice[]
}

export interface TenantInvoice {
  id: string
  invoice_number: string
  amount: number
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'REFUNDED'
  issued_at: string
  paid_at?: string
  due_date: string
  items: InvoiceItem[]
  pdf_url?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

// Request Types
export interface CreateTenantRequest {
  name: string
  domain_prefix: string
  email: string
  tier?: TenantTier
  primary_region?: AwsRegion
  billing_email?: string
}

export interface UpdateTenantRequest {
  name?: string
  custom_domain?: string
  status?: TenantStatus
  tier?: TenantTier
  billing_email?: string
  config?: Partial<TenantConfig>
  features?: TenantFeature[]
}

export interface TenantRestoreRequest {
  tenant_id: string
  backup_id: string
  restore_target: 'SAME' | 'NEW'
  new_tenant_name?: string
  restore_data: {
    organisations?: boolean
    users?: boolean
    bcm_data?: boolean
    documents?: boolean
  }
}

export interface TenantRestoreResult {
  success: boolean
  new_tenant_id?: string
  restored_items: {
    organisations: number
    users: number
    bcm_data: number
    documents: number
  }
  errors: string[]
  restore_time_seconds: number
}
