import { QueryParams } from './common.types'

/**
 * Document-specific query parameters
 */
export interface GetDocumentsParams extends QueryParams {
  q?: string // Search query
  document_type?: string
  status?: string
  organisation_id?: string
  uploaded_by?: string
  tags?: string
  access_level?: string
  file_type?: string
  uploaded_after?: string
  uploaded_before?: string
}
