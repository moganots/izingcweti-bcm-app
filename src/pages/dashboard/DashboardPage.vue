<template>
  <div class="dashboard-page q-pa-md">
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-lg" style="padding-bottom: 0.1em;">
      <div class="text-subtitle1 text-grey-7" style="font-size: 0.9em; font-weight: bold;">
        Here's what's happening with your BCM program today
      </div>
    </div>

    <!-- KPI Overview -->
    <KpiOverview :kpis="kpiList" :loading="dashboardStore.isLoading" class="q-mb-md" />

    <!-- Quick Actions -->
    <QuickActions :loading="dashboardStore.isLoading" class="q-mb-md" />

    <!-- Main Dashboard Content -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <RiskHeatMap
          :risks="sampleRisks"
          :loading="dashboardStore.isLoading"
          @cell-click="handleHeatMapClick"
        />
      </div>
      <div class="col-12 col-md-6">
        <ComplianceChart
          :data="dashboardStore.complianceOverview"
          :loading="dashboardStore.isLoading"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <IncidentTrendChart
          :incidents="incidentTrendData"
          :loading="dashboardStore.isLoading"
          @period-change="handlePeriodChange"
        />
      </div>
      <div class="col-12 col-md-6">
        <MaturityGauge
          :score="dashboardStore.kpis.maturityScore"
          :loading="dashboardStore.isLoading"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <RecentActivityList
          title="Recent Incidents"
          :items="recentIncidentItems"
          type="incident"
          :loading="dashboardStore.isLoading"
          view-all-route="/incidents"
          @item-click="handleIncidentClick"
        />
      </div>
      <div class="col-12 col-md-6">
        <PendingWorkflowsWidget
          :workflows="pendingWorkflowsItems"
          :loading="dashboardStore.isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDashboardStore } from 'src/stores/dashboard/dashboard.store'
import KpiOverview from 'src/components/dashboard/KpiOverview.vue'
import RiskHeatMap from 'src/components/dashboard/RiskHeatMap.vue'
import ComplianceChart from 'src/components/dashboard/ComplianceChart.vue'
import IncidentTrendChart from 'src/components/dashboard/IncidentTrendChart.vue'
import MaturityGauge from 'src/components/dashboard/MaturityGauge.vue'
import RecentActivityList from 'src/components/dashboard/RecentActivityList.vue'
import PendingWorkflowsWidget from 'src/components/dashboard/PendingWorkflowsWidget.vue'
import type { KPI } from 'src/components/dashboard/KpiOverview.vue'
import type { RiskData } from 'src/components/dashboard/RiskHeatMap.vue'
import type { SimpleWorkflow } from 'src/components/dashboard/PendingWorkflowsWidget.vue'
import type { ActivityItem } from 'src/components/dashboard/RecentActivityList.vue'
import QuickActions from 'src/components/dashboard/QuickActions.vue'

const router = useRouter()
const $q = useQuasar()
const dashboardStore = useDashboardStore()

// Transform store KPIs to component format
const kpiList = computed<KPI[]>(() => [
  {
    label: 'Active BCPs',
    value: dashboardStore.kpis.activeBCPs,
    icon: 'description',
    color: 'primary',
    format: 'number',
  },
  {
    label: 'Active Incidents',
    value: dashboardStore.kpis.activeIncidents,
    icon: 'report',
    color: 'negative',
    format: 'number',
  },
  {
    label: 'High Risks',
    value: dashboardStore.kpis.highRisks,
    icon: 'warning',
    color: 'warning',
    format: 'number',
  },
  {
    label: 'Pending Approvals',
    value: dashboardStore.kpis.pendingApprovals,
    icon: 'pending',
    color: 'info',
    format: 'number',
  },
  {
    label: 'Compliance Rate',
    value: dashboardStore.kpis.complianceRate,
    icon: 'verified',
    color: 'positive',
    format: 'percentage',
  },
  {
    label: 'Maturity Score',
    value: dashboardStore.kpis.maturityScore,
    icon: 'stars',
    color: 'info',
    format: 'number',
  },
])

// Sample risk data for heat map (until API is ready)
const sampleRisks = ref<RiskData[]>([
  { impactSeverity: 'Insignificant', likelihood: 0.2 },
  { impactSeverity: 'Low', likelihood: 0.4 },
  { impactSeverity: 'Medium', likelihood: 0.6 },
  { impactSeverity: 'High', likelihood: 0.8 },
  { impactSeverity: 'Critical', likelihood: 1.0 },
])

// Transform risk trends to incident trend format
const incidentTrendData = computed(() => {
  const trends = dashboardStore.riskTrends || []
  return trends.map((trend, index) => ({
    period: `period_${index}`,
    label: trend.label || trend.period || `Period ${index + 1}`,
    critical: trend.critical || 0,
    high: trend.high || 0,
    medium: trend.medium || 0,
    low: trend.low || 0,
    total: (trend.critical || 0) + (trend.high || 0) + (trend.medium || 0) + (trend.low || 0),
    avgResolutionTime:
      'avgResolutionTime' in trend && typeof trend.avgResolutionTime === 'number'
        ? trend.avgResolutionTime
        : 0,
  }))
})

// Transform recent incidents to ActivityItem format
const recentIncidentItems = computed<ActivityItem[]>(() => {
  const incidents = dashboardStore.recentIncidents || []
  return incidents.map((incident) => ({
    uuid: incident.uuid,
    rootCause: incident.rootCause,
    incidentSeverity: incident.incidentSeverity,
    declaredAt: incident.declaredAt,
    closedAt: incident.closedAt ?? null,
  }))
})

// Transform pending workflows to SimpleWorkflow format
const pendingWorkflowsItems = computed<SimpleWorkflow[]>(() => {
  const workflows = dashboardStore.pendingWorkflows || []
  return workflows.map((workflow) => ({
    uuid: workflow.uuid,
    title: workflow.title || 'Untitled Workflow',
    workflowType: workflow.workflowType || 'Unknown',
    workflowState: workflow.workflowState || 'Draft',
    priority: workflow.priority || 3,
    dueDate: workflow.dueDate || null,
  }))
})

function handleHeatMapClick(cell: { impact: string; likelihood: number }) {
  $q.notify({
    message: `Filter risks: ${cell.impact} impact, ${cell.likelihood} likelihood`,
    type: 'info',
    position: 'top',
  })
  router.push(`/risks?impact=${encodeURIComponent(cell.impact)}&likelihood=${cell.likelihood}`)
}

async function handlePeriodChange(period: string) {
  await dashboardStore.loadRiskTrends(period)
}

function handleIncidentClick(item: ActivityItem) {
  if (item.uuid) {
    router.push(`/incidents/${item.uuid}`)
  } else {
    $q.notify({
      message: 'Incident details not available',
      type: 'warning',
      position: 'top',
    })
  }
}

onMounted(() => {
  dashboardStore.loadDashboard()
})
</script>