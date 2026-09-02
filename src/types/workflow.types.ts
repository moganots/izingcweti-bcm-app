// ============================================
// Helper Functions
// ============================================

export function getWorkflowStateLabel(state: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    AWAITING_INPUT: 'Awaiting Input',
    PARALLEL_REVIEW: 'Parallel Review',
    ESCALATED: 'Escalated',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    PENDING_APPROVAL: 'Pending Approval',
  }
  return labels[state] || state
}

export function getWorkflowStateColor(state: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'grey',
    SUBMITTED: 'blue',
    IN_REVIEW: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    COMPLETED: 'green',
    ARCHIVED: 'brown',
    CANCELLED: 'grey',
    EXPIRED: 'red',
    AWAITING_INPUT: 'yellow',
    PARALLEL_REVIEW: 'purple',
    ESCALATED: 'deep-orange',
    IN_PROGRESS: 'info',
    PENDING: 'warning',
    UNDER_REVIEW: 'orange',
    PENDING_APPROVAL: 'yellow',
  }
  return colors[state] || 'grey'
}

export function getWorkflowTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    POLICY_APPROVAL: 'Policy Approval',
    RISK_ASSESSMENT: 'Risk Assessment',
    BIA_REVIEW: 'BIA Review',
    BCP_APPROVAL: 'BCP Approval',
    STRATEGY_APPROVAL: 'Strategy Approval',
    TEST_REVIEW: 'Test Review',
    INCIDENT_MANAGEMENT: 'Incident Management',
    IMPROVEMENT_TRACKING: 'Improvement Tracking',
    TRAINING_ATTESTATION: 'Training Attestation',
    COMPLIANCE_REVIEW: 'Compliance Review',
    INCIDENT_RESPONSE: 'Incident Response',
    DOCUMENT_REVIEW: 'Document Review',
    COMPLIANCE_AUDIT: 'Compliance Audit',
  }
  return labels[type] || type
}

export function getWorkflowTypeColor(type: string): string {
  const colors: Record<string, string> = {
    POLICY_APPROVAL: 'blue',
    RISK_ASSESSMENT: 'orange',
    BIA_REVIEW: 'purple',
    BCP_APPROVAL: 'green',
    STRATEGY_APPROVAL: 'teal',
    TEST_REVIEW: 'info',
    INCIDENT_MANAGEMENT: 'red',
    IMPROVEMENT_TRACKING: 'cyan',
    TRAINING_ATTESTATION: 'pink',
    COMPLIANCE_REVIEW: 'brown',
    INCIDENT_RESPONSE: 'deep-orange',
    DOCUMENT_REVIEW: 'indigo',
    COMPLIANCE_AUDIT: 'grey',
  }
  return colors[type] || 'grey'
}

export function getWorkflowPriorityLabel(priority: string | number): string {
  const labels: Record<string, string> = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    BACKGROUND: 'Background',
    '1': 'Critical',
    '2': 'High',
    '3': 'Medium',
    '4': 'Low',
    '5': 'Background',
  }
  return labels[String(priority)] || String(priority)
}

export function getWorkflowPriorityColor(priority: string | number): string {
  const colors: Record<string, string> = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'yellow',
    LOW: 'blue',
    BACKGROUND: 'grey',
    '1': 'red',
    '2': 'orange',
    '3': 'yellow',
    '4': 'blue',
    '5': 'grey',
  }
  return colors[String(priority)] || 'grey'
}

export function getWorkflowApprovalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SKIPPED: 'Skipped',
  }
  return labels[status] || status
}

export function getWorkflowApprovalStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'grey',
    APPROVED: 'green',
    REJECTED: 'red',
    SKIPPED: 'orange',
  }
  return colors[status] || 'grey'
}