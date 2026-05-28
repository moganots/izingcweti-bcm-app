export interface BulkOperationRequest {
  ids: string[]
  operation: string
  parameters?: Record<string, any>
}

export interface BulkOperationResult {
  total: number
  successful: number
  failed: number
  errors: BulkOperationError[]
}

export interface BulkOperationError {
  id: string
  error: string
  code?: string
}

export interface BulkDeleteRequest {
  ids: string[]
  soft_delete?: boolean
}

export interface BulkRestoreRequest {
  ids: string[]
}

export interface BulkArchiveRequest {
  ids: string[]
  archive: boolean
}

export interface BulkStatusUpdateRequest {
  ids: string[]
  status: string
  notes?: string
}

export interface BulkAssignRequest {
  ids: string[]
  assigned_to: string
}

export interface BulkExportRequest {
  ids?: string[]
  entity_type: string
  format: 'csv' | 'json' | 'pdf'
  fields?: string[]
  filters?: Record<string, any>
}
