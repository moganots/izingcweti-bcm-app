import { BusinessUnit, Department } from '../models/entities'

export interface CreateOrganisationRequest {
    name: string
    industry_type: string
    bcm_policy_version?: string | null
    maturity_score?: number | null
}

export interface UpdateOrganisationRequest {
    name?: string
    industry_type?: string
    bcm_policy_version?: string | null
    maturity_score?: number | null
}

export interface OrganisationQueryParams {
    page?: number
    limit?: number
    search?: string
    industry_type?: string
    min_maturity_score?: number
    max_maturity_score?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}

export interface CreateBusinessUnitRequest {
    name: string
    criticality_score: string
    organisation_id: string
    head_user_id?: string | null
}

export interface UpdateBusinessUnitRequest {
    name?: string
    criticality_score?: string
    head_user_id?: string | null
}

export interface BusinessUnitQueryParams {
    page?: number
    limit?: number
    organisation_id?: string
    criticality_score?: string
    search?: string
}

export interface CreateDepartmentRequest {
    name: string
    business_id: string
    recovery_time_objective?: string | null
    recovery_point_objective?: string | null
}

export interface UpdateDepartmentRequest {
    name?: string
    recovery_time_objective?: string | null
    recovery_point_objective?: string | null
}

export interface DepartmentQueryParams {
    page?: number
    limit?: number
    business_id?: string
    search?: string
}

export interface CreateDocumentRequest {
    title: string
    description?: string | null
    document_type: string
    access_level: string
    file: File
    tags?: string[]
    metadata?: Record<string, unknown>
    expires_at?: string | null
}

export interface UpdateDocumentRequest {
    title?: string
    description?: string | null
    document_type?: string
    access_level?: string
    status?: string
    tags?: string[]
    metadata?: Record<string, unknown>
    expires_at?: string | null
}

export interface DocumentQueryParams {
    page?: number
    limit?: number
    organisation_id?: string
    document_type?: string
    status?: string
    search?: string
    tags?: string[]
}

export interface OrganisationStats {
    total_organisations: number
    total_business_units: number
    total_departments: number
    total_documents: number
    average_maturity_score: number
    by_industry: Record<string, number>
    recent_activity: Array<{
        type: string
        name: string
        timestamp: string
    }>
}

export interface OrganisationDashboard {
    stats: OrganisationStats
    recent_documents: Document[]
    critical_business_units: BusinessUnit[]
    departments_without_bia: Department[]
    upcoming_reviews: Array<{
        id: string
        title: string
        due_date: string
        type: string
    }>
}

export interface BulkImportResult {
    created: number
    updated: number
    failed: number
    errors: string[]
    imported_items: Array<{
        type: string
        id: string
        name: string
        status: 'success' | 'failed'
        error?: string
    }>
}

export interface ExportOptions {
    format?: 'csv' | 'json' | 'pdf'
    include_business_units?: boolean
    include_departments?: boolean
    include_documents?: boolean
    date_from?: string
    date_to?: string
}
