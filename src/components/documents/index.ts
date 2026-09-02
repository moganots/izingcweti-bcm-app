// ============================================================
//  Document Components - Barrel Export
//  All document management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as DocumentList } from './DocumentList.vue'
export { default as DocumentCard } from './DocumentCard.vue'
export { default as DocumentPreview } from './DocumentPreview.vue'

// ----- Forms & Uploads -----
export { default as DocumentForm } from './DocumentForm.vue'
export { default as DocumentUpload } from './DocumentUpload.vue'
export { default as DocumentUploader } from './DocumentUploader.vue'

// ----- Approval & Workflow -----
export { default as DocumentApproval } from './DocumentApproval.vue'
export { default as DocumentApprovalActions } from './DocumentApprovalActions.vue'

// ----- Version Management -----
export { default as DocumentVersionHistory } from './DocumentVersionHistory.vue'

// ----- Status & Badges -----
export { default as DocumentStatusBadge } from './DocumentStatusBadge.vue'

// ----- Analytics & Statistics -----
export { default as DocumentStatsWidget } from './DocumentStatsWidget.vue'
export { default as DocumentStatsOverview } from './DocumentStatsOverview.vue'

// ----- Templates -----
export { default as DocumentTemplateList } from './DocumentTemplateList.vue'

// ----- Utilities -----
export { default as DocumentSearch } from './DocumentSearch.vue'
export { default as DocumentTagManager } from './DocumentTagManager.vue'

// ============================================================
//  Composables
//  Export shared document composable
// ============================================================

export { useDocument } from './../../composables/useDocument'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for document components
//  Aligned with document.entity.ts
// ============================================================

export type {
  // Core Document Entity
  Document,
  DocumentVersion,
  DocumentTemplate,
  DocumentStats,
  ReviewHistoryEntry,
  
  // Request/Response DTOs
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ApproveDocumentRequest,
  RejectDocumentRequest,
  DocumentVersionRequest,
  DocumentSearchParams,
  DocumentQueryParams,
  DocumentBulkOperationRequest,
  DocumentBulkOperationResult,
  GenerateDocumentFromTemplateRequest,
  DocumentVerificationResult,
  DocumentUploadProgress,
} from './../../models/entities/document/document.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for documents
//  Aligned with document.entity.ts
// ============================================================

export {
  DocumentType,
  DocumentStatus,
  AccessLevel,
} from './../../models/entities/document/document.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import DocumentList from './DocumentList.vue'
import DocumentCard from './DocumentCard.vue'
import DocumentPreview from './DocumentPreview.vue'
import DocumentForm from './DocumentForm.vue'
import DocumentUpload from './DocumentUpload.vue'
import DocumentUploader from './DocumentUploader.vue'
import DocumentApproval from './DocumentApproval.vue'
import DocumentApprovalActions from './DocumentApprovalActions.vue'
import DocumentVersionHistory from './DocumentVersionHistory.vue'
import DocumentStatusBadge from './DocumentStatusBadge.vue'
import DocumentStatsWidget from './DocumentStatsWidget.vue'
import DocumentStatsOverview from './DocumentStatsOverview.vue'
import DocumentTemplateList from './DocumentTemplateList.vue'
import DocumentSearch from './DocumentSearch.vue'
import DocumentTagManager from './DocumentTagManager.vue'

export default {
  install(app: App) {
    app.component('DocumentList', DocumentList)
    app.component('DocumentCard', DocumentCard)
    app.component('DocumentPreview', DocumentPreview)
    app.component('DocumentForm', DocumentForm)
    app.component('DocumentUpload', DocumentUpload)
    app.component('DocumentUploader', DocumentUploader)
    app.component('DocumentApproval', DocumentApproval)
    app.component('DocumentApprovalActions', DocumentApprovalActions)
    app.component('DocumentVersionHistory', DocumentVersionHistory)
    app.component('DocumentStatusBadge', DocumentStatusBadge)
    app.component('DocumentStatsWidget', DocumentStatsWidget)
    app.component('DocumentStatsOverview', DocumentStatsOverview)
    app.component('DocumentTemplateList', DocumentTemplateList)
    app.component('DocumentSearch', DocumentSearch)
    app.component('DocumentTagManager', DocumentTagManager)
  },
} as Plugin