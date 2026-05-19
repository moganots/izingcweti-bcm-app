<!-- src/pages/dashboard/DashboardPage.vue -->
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
    <KpiOverview :kpis="kpiData" :loading="loading" class="q-mb-md" />

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
        <RiskHeatMap :risks="recentRisks" :loading="loading" @cell-click="handleHeatMapClick" />
      </div>
      <div class="col-12 col-md-6">
        <ComplianceChart :data="complianceData" :loading="loading" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <IncidentTrendChart :data="incidentTrends" :loading="loading" @period-change="handlePeriodChange" />
      </div>
      <div class="col-12 col-md-6">
        <MaturityGauge :score="maturityScore" :loading="loading" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <RecentActivityList
          title="Recent Incidents"
          :items="recentIncidents"
          type="incident"
          :loading="loading"
          view-all-route="/incidents"
          @item-click="handleIncidentClick"
        />
      </div>
      <div class="col-12 col-md-6">
        <PendingWorkflowsWidget :workflows="pendingWorkflows" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'
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
import type { Workflow } from 'src/components/dashboard/PendingWorkflowsWidget.vue'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// State
const loading = ref(false)

// KPI Data
const kpiData = ref<KPI[]>([
  { label: 'Active BCPs', value: 28, icon: 'description', color: 'primary', format: 'number' },
  { label: 'Active Incidents', value: 3, icon: 'report', color: 'negative', format: 'number' },
  { label: 'High Risks', value: 7, icon: 'warning', color: 'warning', format: 'number' },
  { label: 'Pending Approvals', value: 5, icon: 'pending', color: 'info', format: 'number' },
  { label: 'Compliance Rate', value: 78, icon: 'verified', color: 'positive', format: 'percentage' },
  { label: 'Maturity Score', value: 3.2, icon: 'stars', color: 'info', format: 'number' },
])

// Risk Data
const recentRisks = ref<RiskData[]>([
  { impact_severity: 'High', likelihood: 0.8 },
  { impact_severity: 'Medium', likelihood: 0.6 },
  { impact_severity: 'Critical', likelihood: 0.4 },
  { impact_severity: 'Low', likelihood: 0.2 },
])

// Compliance Data
const complianceData = ref([
  { standard: 'ISO 22301', compliant: 12, total: 15 },
  { standard: 'NIST 800-34', compliant: 8, total: 10 },
  { standard: 'FFIEC', compliant: 6, total: 8 },
  { standard: 'COBIT 2019', compliant: 4, total: 6 },
])

// Incident Trends
const incidentTrends = ref<IncidentTrendData[]>([
  { period: 'week1', label: 'W1', critical: 1, high: 2, medium: 3, low: 5, total: 11 },
  { period: 'week2', label: 'W2', critical: 0, high: 1, medium: 4, low: 3, total: 8 },
  { period: 'week3', label: 'W3', critical: 2, high: 3, medium: 2, low: 4, total: 11 },
  { period: 'week4', label: 'W4', critical: 0, high: 2, medium: 1, low: 2, total: 5 },
])

// Recent Incidents
const recentIncidents = ref([
  { uuid: '1', root_cause: 'Power Outage', incident_severity: 'High', declared_at: '2026-05-18T10:00:00Z', closed_at: null },
  { uuid: '2', root_cause: 'Cyber Attack', incident_severity: 'Critical', declared_at: '2026-05-17T15:30:00Z', closed_at: null },
  { uuid: '3', root_cause: 'System Failure', incident_severity: 'Medium', declared_at: '2026-05-16T09:00:00Z', closed_at: '2026-05-16T14:00:00Z' },
])

// Pending Workflows
const pendingWorkflows = ref<Workflow[]>([
  { uuid: '1', title: 'BCP Approval Request', workflow_type: 'BCP Approval', workflow_state: 'InReview', priority: 1, due_date: '2026-05-25' },
  { uuid: '2', title: 'Risk Assessment Review', workflow_type: 'Risk Assessment', workflow_state: 'Submitted', priority: 2, due_date: '2026-05-28' },
  { uuid: '3', title: 'BIA Documentation', workflow_type: 'BIA Review', workflow_state: 'Draft', priority: 3, due_date: '2026-05-30' },
])

const maturityScore = ref(3.2)

// Methods
function openRiskDialog() {
  $q.dialog({
    title: 'Create New Risk',
    message: 'Risk creation dialog would open here',
    cancel: true,
    persistent: true,
  })
}

function openBCPDialog() {
  $q.dialog({
    title: 'Create BCP Plan',
    message: 'BCP plan creation dialog would open here',
    cancel: true,
    persistent: true,
  })
}

function openIncidentDialog() {
  $q.dialog({
    title: 'Report Incident',
    message: 'Incident reporting dialog would open here',
    cancel: true,
    persistent: true,
  })
}

function openReportDialog() {
  $q.dialog({
    title: 'Generate Report',
    message: 'Report generation dialog would open here',
    cancel: true,
    persistent: true,
  })
}

function handleHeatMapClick(cell: { impact: string; likelihood: number }) {
  console.log('Heat map cell clicked:', cell)
  $q.notify({
    message: `Filter risks: ${cell.impact} impact, ${cell.likelihood} likelihood`,
    type: 'info',
    position: 'top',
  })
}

function handlePeriodChange(period: string) {
  console.log('Period changed:', period)
  loadIncidentTrends(period)
}

function handleIncidentClick(incident: any) {
  router.push(`/incidents/${incident.uuid}`)
}

async function loadIncidentTrends(period: string) {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    // Update trends based on period
    console.log(`Loading trends for period: ${period}`)
  } finally {
    loading.value = false
  }
}

async function loadDashboardData() {
  loading.value = true
  try {
    // Load all dashboard data from API
    await Promise.all([
      // Add API calls here
      new Promise(resolve => setTimeout(resolve, 300)),
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>