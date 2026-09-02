// ============================================================
//  Workflow Components - Barrel Export
//  All workflow management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as WorkflowList } from './WorkflowList.vue'
export { default as WorkflowDetail } from './WorkflowDetail.vue'
export { default as WorkflowCard } from './WorkflowCard.vue'

// ----- Forms -----
export { default as WorkflowForm } from './WorkflowForm.vue'
export { default as WorkflowCommentForm } from './WorkflowCommentForm.vue'

// ----- Approval Components -----
export { default as ApprovalChain } from './ApprovalChain.vue'
export { default as ApprovalActions } from './ApprovalActions.vue'

// ----- Actions -----
export { default as WorkflowActions } from './WorkflowActions.vue'

// ----- Analytics -----
export { default as WorkflowStatsCards } from './WorkflowStatsCards.vue'

// ----- Timeline -----
export { default as WorkflowTimeline } from './WorkflowTimeline.vue'

// ============================================================
//  Composables
//  Export shared workflow composable
// ============================================================

export { useWorkflow } from './../../composables/useWorkflow'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for workflow components
// ============================================================

export type {
  Workflow,
  WorkflowComment,
  ApprovalChainItem,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  SubmitWorkflowDto,
  ApproveWorkflowDto,
  RejectWorkflowDto,
  AddCommentDto,
  EscalateWorkflowDto,
  ReassignWorkflowDto,
  WorkflowQueryDto,
  WorkflowStatsDto,
  WorkflowAnalyticsDto,
  WorkflowResponseDto,
} from './../../models/entities/workflow/workflow.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for workflow
// ============================================================

export {
  WorkflowType,
  WorkflowState,
  WorkflowPriority,
  WorkflowApprovalStatus,
} from './../../models/entities/workflow/workflow.entity'

export {
  getWorkflowStateLabel,
  getWorkflowStateColor,
  getWorkflowTypeLabel,
  getWorkflowTypeColor,
  getWorkflowPriorityLabel,
  getWorkflowPriorityColor,
  getWorkflowApprovalStatusLabel,
  getWorkflowApprovalStatusColor,
} from './../../types/workflow.types.ts'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import WorkflowList from './WorkflowList.vue'
import WorkflowDetail from './WorkflowDetail.vue'
import WorkflowCard from './WorkflowCard.vue'
import WorkflowForm from './WorkflowForm.vue'
import WorkflowCommentForm from './WorkflowCommentForm.vue'
import ApprovalChain from './ApprovalChain.vue'
import ApprovalActions from './ApprovalActions.vue'
import WorkflowActions from './WorkflowActions.vue'
import WorkflowStatsCards from './WorkflowStatsCards.vue'
import WorkflowTimeline from './WorkflowTimeline.vue'

export default {
  install(app: App) {
    app.component('WorkflowList', WorkflowList)
    app.component('WorkflowDetail', WorkflowDetail)
    app.component('WorkflowCard', WorkflowCard)
    app.component('WorkflowForm', WorkflowForm)
    app.component('WorkflowCommentForm', WorkflowCommentForm)
    app.component('ApprovalChain', ApprovalChain)
    app.component('ApprovalActions', ApprovalActions)
    app.component('WorkflowActions', WorkflowActions)
    app.component('WorkflowStatsCards', WorkflowStatsCards)
    app.component('WorkflowTimeline', WorkflowTimeline)
  },
} as Plugin