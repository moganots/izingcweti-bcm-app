// ============================================================
//  Incident Components - Barrel Export
//  All incident management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as IncidentList } from './IncidentList.vue'
export { default as IncidentDetail } from './IncidentDetail.vue'
export { default as IncidentCard } from './IncidentCard.vue'

// ----- Forms -----
export { default as IncidentForm } from './IncidentForm.vue'
export { default as IncidentReportForm } from './IncidentReportForm.vue'
export { default as IncidentResolutionForm } from './IncidentResolutionForm.vue'
export { default as IncidentUpdateForm } from './IncidentUpdateForm.vue'

// ----- Status & Badges -----
export { default as IncidentSeverityBadge } from './IncidentSeverityBadge.vue'
export { default as IncidentStatusBadge } from './IncidentStatusBadge.vue'

// ----- Workflow Components -----
export { default as IncidentEscalation } from './IncidentEscalation.vue'
export { default as IncidentAssignment } from './IncidentAssignment.vue'

// ----- Analytics -----
export { default as IncidentStatsWidget } from './IncidentStatsWidget.vue'
export { default as IncidentStatsCards } from './IncidentStatsCards.vue'

// ----- Timeline -----
export { default as IncidentTimeline } from './IncidentTimeline.vue'

// ============================================================
//  Composables
//  Export shared incident composable
// ============================================================

export { useIncident } from './../../composables/useIncident'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for incident components
//  Aligned with incident.entity.ts
// ============================================================

export type {
  // Core Incident Entity
  Incident,
  ImpactAnalysis,
  
  // History & Updates
  EscalationHistoryEntry,
  IncidentUpdate,
  
  // Stats
  IncidentStats,
  
  // Request/Response DTOs
  CreateIncidentRequest,
  UpdateIncidentRequest,
  CloseIncidentRequest,
  EscalateIncidentRequest,
  AssignIncidentRequest,
  AcknowledgeIncidentRequest,
  AddIncidentUpdateRequest,
  IncidentQueryParams,
} from './../../models/entities/incident/incident.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for incident
//  Aligned with incident.entity.ts
// ============================================================

export {
  IncidentSeverity,
  IncidentStatus,
  EscalationLevel,
  EscalationStatus,
  getIncidentSeverityLabel,
  getIncidentSeverityColor,
  getIncidentSeverityIcon,
  getIncidentStatusLabel,
  getIncidentStatusColor,
  getEscalationLevelLabel,
  getEscalationLevelColor,
  calculateResolutionTime,
} from './../../models/entities/incident/incident.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import IncidentList from './IncidentList.vue'
import IncidentDetail from './IncidentDetail.vue'
import IncidentCard from './IncidentCard.vue'
import IncidentForm from './IncidentForm.vue'
import IncidentReportForm from './IncidentReportForm.vue'
import IncidentResolutionForm from './IncidentResolutionForm.vue'
import IncidentUpdateForm from './IncidentUpdateForm.vue'
import IncidentSeverityBadge from './IncidentSeverityBadge.vue'
import IncidentStatusBadge from './IncidentStatusBadge.vue'
import IncidentEscalation from './IncidentEscalation.vue'
import IncidentAssignment from './IncidentAssignment.vue'
import IncidentStatsWidget from './IncidentStatsWidget.vue'
import IncidentStatsCards from './IncidentStatsCards.vue'
import IncidentTimeline from './IncidentTimeline.vue'

export default {
  install(app: App) {
    app.component('IncidentList', IncidentList)
    app.component('IncidentDetail', IncidentDetail)
    app.component('IncidentCard', IncidentCard)
    app.component('IncidentForm', IncidentForm)
    app.component('IncidentReportForm', IncidentReportForm)
    app.component('IncidentResolutionForm', IncidentResolutionForm)
    app.component('IncidentUpdateForm', IncidentUpdateForm)
    app.component('IncidentSeverityBadge', IncidentSeverityBadge)
    app.component('IncidentStatusBadge', IncidentStatusBadge)
    app.component('IncidentEscalation', IncidentEscalation)
    app.component('IncidentAssignment', IncidentAssignment)
    app.component('IncidentStatsWidget', IncidentStatsWidget)
    app.component('IncidentStatsCards', IncidentStatsCards)
    app.component('IncidentTimeline', IncidentTimeline)
  },
} as Plugin