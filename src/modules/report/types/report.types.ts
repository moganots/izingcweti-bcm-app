import { BaseEntity } from '../../../core/base/base.entity'
import { ReportType, ReportFormat, ReportStatus, ReportFrequency } from '../enums/report.enum'

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
