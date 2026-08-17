import { QueryParams } from "src/shared/types/common.types";

/**
 * Document-specific query parameters
 */
export interface GetDocumentsParams extends QueryParams {
  q?: string;
  query?: string;
  document_type?: string;
  status?: string;
  organisation_id?: string;
  uploaded_by?: string;
  tags?: string | string[];
  access_level?: string;
  file_type?: string;
  uploaded_after?: string;
  uploaded_before?: string;
  pending_approval?: boolean;
}

/**
 * Approve Document Request
 */
export interface ApproveDocumentRequest {
  comments?: string;
}

/**
 * Reject Document Request
 */
export interface RejectDocumentRequest {
  rejection_reason: string;
  comments?: string;
}