<template>
  <q-page padding>
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Welcome back, {{ userName }}</h4>
          <p class="text-grey-7 q-mb-none">{{ currentDate }} | {{ greeting }}</p>
        </div>
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          :loading="isRefreshing"
          @click="refreshDashboard"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <KpiOverview :kpis="kpiData as any [] || []" :loading="isLoading" class="q-mb-lg" />

    <!-- Risk Heat Map & Compliance -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <RiskHeatMap :risks="dashboardStore.riskTrends" />
      </div>
      <div class="col-12 col-md-6">
        <ComplianceChart :data="dashboardStore.complianceOverview" :loading="isLoading" />
      </div>
    </div>

    <!-- Recent Incidents -->
    <q-card class="q-mb-lg" flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Recent Incidents</div>
          <q-btn flat color="primary" label="View All" to="/incidents" />
        </div>
        <RecentActivityList
          title=""
          :items="dashboardStore.recentIncidents"
          type="incident"
          :loading="isLoading"
          empty-message="No recent incidents"
          @item-click="(item) => $router.push(`/incidents/${item.uuid}`)"
        />
      </q-card-section>
    </q-card>

    <!-- Upcoming Tests & Pending Workflows -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Upcoming Tests</div>
              <q-btn flat color="primary" label="View All" to="/bcm/exercise-tests" />
            </div>
            <RecentActivityList
              title=""
              :items="dashboardStore.upcomingTests"
              type="test"
              :loading="isLoading"
              empty-message="No upcoming tests"
              @item-click="(item) => $router.push(`/bcm/exercise-tests`)"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <PendingWorkflowsWidget :workflows="dashboardStore.pendingWorkflows" :loading="isLoading" />
      </div>
    </div>

    <!-- BCM Maturity -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <MaturityGauge :score="dashboardStore.kpis.maturityScore" />
      </div>
      <div class="col-12 col-md-6">
        <IncidentTrendChart
          :data="dashboardStore.riskTrends as any [] || []"
          :loading="isLoading"
          @period-change="handlePeriodChange"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useAuthStore } from '../../stores/auth.store'
import KpiOverview from '../../components/dashboard/KpiOverview.vue'
import RiskHeatMap from '../../components/dashboard/RiskHeatMap.vue'
import ComplianceChart from '../../components/dashboard/ComplianceChart.vue'
import RecentActivityList from '../../components/dashboard/RecentActivityList.vue'
import PendingWorkflowsWidget from '../../components/dashboard/PendingWorkflowsWidget.vue'
import MaturityGauge from '../../components/dashboard/MaturityGauge.vue'
import IncidentTrendChart from '../../components/dashboard/IncidentTrendChart.vue'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const isLoading = computed(() => dashboardStore.isLoading)
const isRefreshing = ref(false)

// User info
const userName = computed(() => {
  const email = authStore.userEmail
  return email ? email.split('@')[0]!?.replace(/[._]/g, ' ') : 'User'
})

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning ☀️'
  if (hour < 18) return 'Good Afternoon 🌤️'
  return 'Good Evening 🌙'
})

// KPI Data
const kpiData = computed(() => [
  {
    label: 'Active BCPs',
    value: dashboardStore.kpis.activeBCPs,
    icon: 'description',
    color: 'primary',
    action: '/bcm/bcp',
  },
  {
    label: 'Active Incidents',
    value: dashboardStore.kpis.activeIncidents,
    icon: 'report',
    color: 'negative',
    action: '/incidents',
  },
  {
    label: 'High Risks',
    value: dashboardStore.kpis.highRisks,
    icon: 'warning',
    color: 'warning',
    action: '/risks',
  },
  {
    label: 'Pending Approvals',
    value: dashboardStore.kpis.pendingApprovals,
    icon: 'account_tree',
    color: 'info',
    action: '/workflows',
  },
  {
    label: 'Compliance Rate',
    value: dashboardStore.kpis.complianceRate,
    icon: 'verified',
    color: 'green',
    format: 'percentage',
  },
  {
    label: 'Maturity Score',
    value: dashboardStore.kpis.maturityScore,
    icon: 'trending_up',
    color: 'purple',
    format: 'number',
  },
])

// Lifecycle
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await dashboardStore.loadDashboard()
  // Auto-refresh every 5 minutes
  refreshInterval = setInterval(() => {
    dashboardStore.refresh().catch(console.error)
  }, 300000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// Methods
async function refreshDashboard(): Promise<void> {
  isRefreshing.value = true
  try {
    await dashboardStore.refresh()
  } finally {
    isRefreshing.value = false
  }
}

function handlePeriodChange(period: string): void {
  console.log('Period changed:', period)
}
</script>

<style lang="scss" scoped>
.welcome-section {
  .text-h5 {
    margin: 0;
  }
}
</style>
