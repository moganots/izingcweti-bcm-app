// ============================================================
//  Rules Components - Barrel Export
//  All rule management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as RuleList } from './RuleList.vue'
export { default as RuleDetail } from './RuleDetail.vue'
export { default as RuleCard } from './RuleCard.vue'

// ----- Builders & Forms -----
export { default as RuleBuilder } from './RuleBuilder.vue'
export { default as RuleConditionBuilder } from './RuleConditionBuilder.vue'
export { default as RuleScheduleForm } from './RuleScheduleForm.vue'
export { default as RuleDuplicateDialog } from './RuleDuplicateDialog.vue'

// ----- Testing -----
export { default as RuleTestPanel } from './RuleTestPanel.vue'

// ----- Analytics -----
export { default as RuleStatsOverview } from './RuleStatsOverview.vue'
// export { default as RuleExecutionLog } from './RuleExecutionLog.vue'

// ============================================================
//  Composables
//  Export shared rule composable
// ============================================================

export { useRule } from './../../composables/useRule'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for rule components
// ============================================================

export type {
  Rule,
  RuleCondition,
  RuleAction,
  RuleSchedule,
  RuleExecutionLog,
  RuleDto,
  CreateRuleDto,
  UpdateRuleDto,
  ExecuteRuleDto,
  RuleTestDto,
  RuleTestResultDto,
  RuleQueryDto,
  RuleExecutionLogDto,
  CreateRuleExecutionLogDto,
  ExecutionLogQueryDto,
  RuleStatsDto,
  RuleExecutionStatsDto,
  RuleExecutionSummaryDto,
  GlobalExecutionStatsDto,
} from '../../models/entities/rules/rule.entity.ts'

// ============================================================
//  Constants Exports
//  Export shared constants for rules
// ============================================================

export {
  RuleType,
  RuleTrigger,
  RuleStatus,
  RulePriority,
  LogicalOperator,
  ComparisonOperator,
  getRuleTypeLabel,
  getRuleTypeColor,
  getRuleStatusLabel,
  getRuleStatusColor,
  getRuleTriggerLabel,
  getRulePriorityLabel,
  getRulePriorityColor,
  getRuleActionTypeLabel,
} from '../../models/entities/rules/rule.entity.ts'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import RuleList from './RuleList.vue'
import RuleDetail from './RuleDetail.vue'
import RuleCard from './RuleCard.vue'
import RuleBuilder from './RuleBuilder.vue'
import RuleConditionBuilder from './RuleConditionBuilder.vue'
import RuleScheduleForm from './RuleScheduleForm.vue'
import RuleDuplicateDialog from './RuleDuplicateDialog.vue'
import RuleTestPanel from './RuleTestPanel.vue'
import RuleStatsOverview from './RuleStatsOverview.vue'
import RuleExecutionLog from './RuleExecutionLog.vue'

export default {
  install(app: App) {
    app.component('RuleList', RuleList)
    app.component('RuleDetail', RuleDetail)
    app.component('RuleCard', RuleCard)
    app.component('RuleBuilder', RuleBuilder)
    app.component('RuleConditionBuilder', RuleConditionBuilder)
    app.component('RuleScheduleForm', RuleScheduleForm)
    app.component('RuleDuplicateDialog', RuleDuplicateDialog)
    app.component('RuleTestPanel', RuleTestPanel)
    app.component('RuleStatsOverview', RuleStatsOverview)
    app.component('RuleExecutionLog', RuleExecutionLog)
  },
} as Plugin