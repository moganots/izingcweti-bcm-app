<template>
  <div class="dashboard-page q-pa-md">
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-lg">
      <div class="text-h4 text-weight-bold q-mt-sm">Welcome back, {{ authStore.fullName }}</div>
      <div class="text-subtitle1 text-grey-7">
        Here's what's happening with your BCM program today
      </div>
    </div>

    <!-- KPI Overview -->
    <KpiOverview :kpis="kpiList" :loading="dashboardStore.isLoading" class="q-mb-md" />

    <!-- Quick Actions -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-sm-3">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="New Risk"
                  class="full-width"
                  @click="openRiskDialog"
                />
              </div>
              <div class="col-6 col-sm-3">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="BCP Plan"
                  class="full-width"
                  @click="openBCPDialog"
                />
              </div>
              <div class="col-6 col-sm-3">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="Report Incident"
                  class="full-width"
                  @click="openIncidentDialog"
                />
              </div>
              <div class="col-6 col-sm-3">
                <q-btn
                  outline
                  color="primary"
                  icon="picture_as_pdf"
                  label="Generate Report"
                  class="full-width"
                  @click="openReportDialog"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
          :items="dashboardStore.recentIncidents"
          type="incident"
          :loading="dashboardStore.isLoading"
          view-all-route="/incidents"
          @item-click="handleIncidentClick"
        />
      </div>
      <div class="col-12 col-md-6">
        <PendingWorkflowsWidget
          :workflows="pendingWorkflowsData"
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
import { useAuthStore } from 'src/stores/auth/auth.store'
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
import type { IncidentTrendData } from 'src/components/dashboard/IncidentTrendChart.vue'
import type { Workflow } from 'src/models/entities'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
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
  { impact_severity: 'Insignificant', likelihood: 0.2 },
  { impact_severity: 'Low', likelihood: 0.4 },
  { impact_severity: 'Medium', likelihood: 0.6 },
  { impact_severity: 'High', likelihood: 0.8 },
  { impact_severity: 'Critical', likelihood: 1.0 },
])

// Transform risk trends to incident trend format
const incidentTrendData = computed<IncidentTrendData[]>(() => {
  const trends = dashboardStore.riskTrends || []
  return trends.map((trend, index) => ({
    period: `period_${index}`,
    label: trend.label || trend.period || `Period ${index + 1}`,
    critical: trend.critical || 0,
    high: trend.high || 0,
    medium: trend.medium || 0,
    low: trend.low || 0,
    total: (trend.critical || 0) + (trend.high || 0) + (trend.medium || 0) + (trend.low || 0),
  }))
})

// Transform pending workflows to match Workflow interface
const pendingWorkflowsData = computed<Workflow[]>(() => {
  const workflows = dashboardStore.pendingWorkflows || []
  return workflows.map((workflow: any) => ({
    uuid: workflow.uuid || `wf_${Date.now()}`,
    title: workflow.title || 'Untitled Workflow',
    workflow_type: workflow.workflow_type || 'Unknown',
    workflow_state: workflow.workflow_state || 'Draft',
    priority: workflow.priority || 3,
    due_date: workflow.due_date || null,
    initiated_by: workflow.initiated_by || '',
    escalation_level: workflow.escalation_level || 0,
    created_by: workflow.created_by || '',
    created_at: workflow.created_at || new Date().toISOString(),
    updated_by: workflow.updated_by || '',
    updated_at: workflow.updated_at || new Date().toISOString(),
    version: workflow.version || 1,
    sync_status: workflow.sync_status || 'SYNCED',
  }))
})

function openRiskDialog() {
  $q.dialog({
    title: 'Create New Risk',
    message: 'Risk creation dialog would open here',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    router.push('/risks/create')
  })
}

function openBCPDialog() {
  $q.dialog({
    title: 'Create BCP Plan',
    message: 'BCP plan creation dialog would open here',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    router.push('/bcp/create')
  })
}

function openIncidentDialog() {
  $q.dialog({
    title: 'Report Incident',
    message: 'Incident reporting dialog would open here',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    router.push('/incidents/report')
  })
}

function openReportDialog() {
  $q.dialog({
    title: 'Generate Report',
    message: 'Select report type:',
    options: {
      type: 'radio',
      model: 'risk',
      items: [
        { label: 'Risk Assessment Report', value: 'risk' },
        { label: 'Compliance Report', value: 'compliance' },
        { label: 'Incident Summary', value: 'incident' },
        { label: 'BCM Maturity Report', value: 'maturity' },
      ],
    },
    cancel: true,
    persistent: true,
  }).onOk(async (data: any) => {
    $q.notify({
      message: `Generating ${data} report...`,
      type: 'info',
      position: 'top',
    })
    // Navigate to report generation
    router.push(`/reports/generate?type=${data}`)
  })
}

function handleHeatMapClick(cell: { impact: string; likelihood: number }) {
  $q.notify({
    message: `Filter risks: ${cell.impact} impact, ${cell.likelihood} likelihood`,
    type: 'info',
    position: 'top',
  })
  // Navigate to risks page with filters
  router.push(`/risks?impact=${encodeURIComponent(cell.impact)}&likelihood=${cell.likelihood}`)
}

async function handlePeriodChange(period: string) {
  // Load risk trends for the selected period
  await dashboardStore.loadRiskTrends(period)
}

function handleIncidentClick(incident: any) {
  if (incident.uuid) {
    router.push(`/incidents/${incident.uuid}`)
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
