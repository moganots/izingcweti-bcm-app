// ============================================
// Report Module - Enums
// ============================================

export enum ReportType {
  WORKFLOW = 'WORKFLOW',
  RISK = 'RISK',
  COMPLIANCE = 'COMPLIANCE',
  INCIDENT = 'INCIDENT',
  AUDIT = 'AUDIT',
  PERFORMANCE = 'PERFORMANCE',
  USER = 'USER',
  DOCUMENT = 'DOCUMENT',
  EXERCISE = 'EXERCISE',
  FINANCIAL = 'FINANCIAL',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
  EXCEL = 'EXCEL',
  HTML = 'HTML',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ReportFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

// ============================================
// Report Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

export interface Report extends BaseEntity {
  name: string
  description?: string
  report_type: ReportType
  format: ReportFormat
  status: ReportStatus
  parameters?: Record<string, any>
  filters?: Record<string, any>
  columns?: string[]
  sorting?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  frequency?: ReportFrequency
  scheduled_at?: string
  last_run_at?: string
  completed_at?: string
  file_url?: string
  file_size?: number
  row_count: number
  error_message?: string
  organisation_id: string
  metadata?: Record<string, any>
  is_public: boolean
  recipients?: ReportRecipient[]
  retention_days: number
  expires_at?: string
}

export interface ReportRecipient {
  email: string
  name?: string
}

export interface ReportDataSource {
  id: string
  name: string
  type: 'DATABASE' | 'API' | 'FILE' | 'CUSTOM'
  connection_config: Record<string, any>
  is_active: boolean
}

export interface ReportQuery {
  report_id: string
  query: string
  parameters: Record<string, any>
  data_source_id: string
  compiled_at?: string
}

export interface ReportVisualization {
  id: string
  report_id: string
  type: 'TABLE' | 'CHART' | 'KPI' | 'MAP' | 'CUSTOM'
  title: string
  config: Record<string, any>
  data_mapping: Record<string, string>
  position: { x: number; y: number; w: number; h: number }
}

export interface ReportDashboard extends BaseEntity {
  name: string
  description?: string
  organisation_id: string
  visualizations: ReportVisualization[]
  layout: string
  is_public: boolean
  shared_with: string[]
  created_by: string
  refresh_interval_minutes?: number
}

export interface ReportSubscription {
  id: string
  report_id: string
  user_id: string
  frequency: ReportFrequency
  format: ReportFormat
  recipients: string[]
  is_active: boolean
  last_sent_at?: string
  next_send_at?: string
  filters?: Record<string, any>
}

export interface ReportGenerationJob {
  id: string
  report_id: string
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  priority: number
  queued_at: string
  started_at?: string
  completed_at?: string
  error_message?: string
  output_url?: string
  output_size_bytes?: number
  parameters: Record<string, any>
}

export interface ReportComparison {
  name: string
  period1: { start: string; end: string }
  period2: { start: string; end: string }
  metrics: Record<string, ComparisonMetric>
  visualization_data: any
}

export interface ComparisonMetric {
  period1_value: number
  period2_value: number
  absolute_change: number
  percentage_change: number
  trend: 'UP' | 'DOWN' | 'STABLE'
}

// Request Types
export interface CreateReportRequest {
  name: string
  description?: string
  report_type: ReportType
  format?: ReportFormat
  parameters?: Record<string, any>
  filters?: Record<string, any>
  columns?: string[]
  sorting?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  frequency?: ReportFrequency
  scheduled_at?: string
  organisation_id: string
  is_public?: boolean
  recipients?: ReportRecipient[]
  retention_days?: number
}

export interface GenerateReportRequest {
  report_id: string
  parameters?: Record<string, any>
  format?: ReportFormat
}
