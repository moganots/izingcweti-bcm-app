<!-- src/pages/dashboard/DashboardPage.vue -->
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
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card
          flat
          bordered
          class="kpi-card bg-primary text-white cursor-pointer"
          @click="$router.push('/bcm/bcp')"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-white-70">Active BCPs</div>
                <div class="text-h3 q-mt-sm">{{ kpis.activeBCPs }}</div>
              </div>
              <q-icon name="description" size="40px" class="text-white-30" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card
          flat
          bordered
          class="kpi-card bg-negative text-white cursor-pointer"
          @click="$router.push('/incidents')"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-white-70">Active Incidents</div>
                <div class="text-h3 q-mt-sm">{{ kpis.activeIncidents }}</div>
              </div>
              <q-icon name="report" size="40px" class="text-white-30" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card
          flat
          bordered
          class="kpi-card bg-warning text-white cursor-pointer"
          @click="$router.push('/risks')"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-white-70">High Risks</div>
                <div class="text-h3 q-mt-sm">{{ kpis.highRisks }}</div>
              </div>
              <q-icon name="warning" size="40px" class="text-white-30" />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card
          flat
          bordered
          class="kpi-card bg-green text-white cursor-pointer"
          @click="$router.push('/workflows')"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-white-70">Pending Approvals</div>
                <div class="text-h3 q-mt-sm">{{ kpis.pendingApprovals }}</div>
              </div>
              <q-icon name="account_tree" size="40px" class="text-white-30" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Compliance & Maturity -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Compliance Status</div>
            <div class="row q-col-gutter-sm">
              <div class="col-4" v-for="item in complianceData" :key="item.label">
                <div class="text-center">
                  <q-circular-progress
                    :value="item.percentage"
                    size="80px"
                    :color="item.color"
                    track-color="grey-3"
                    show-value
                    font-size="16px"
                  >
                    {{ item.percentage }}%
                  </q-circular-progress>
                  <div class="text-caption q-mt-sm">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">BCM Maturity</div>
            <div class="text-center">
              <div class="text-h2 text-primary q-mb-sm">{{ maturityLevel }}/5</div>
              <q-linear-progress
                :value="maturityLevel / 5"
                color="primary"
                size="20px"
                rounded
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">
                Level {{ maturityLevel }} - {{ maturityLabel }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Incidents -->
    <q-card class="q-mb-lg" flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Recent Incidents</div>
          <q-btn flat color="primary" label="View All" @click="$router.push('/incidents')" />
        </div>
        <div v-if="recentIncidents.length === 0" class="text-center q-py-md text-grey-7">
          No recent incidents
        </div>
        <q-list v-else separator>
          <q-item
            v-for="incident in recentIncidents"
            :key="incident.uuid"
            clickable
            v-ripple
            @click="$router.push(`/incidents/${incident.uuid}`)"
          >
            <q-item-section avatar>
              <q-icon
                :name="getIncidentIcon(incident.incident_severity)"
                :color="getSeverityColor(incident.incident_severity)"
                size="24px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ incident.root_cause }}</q-item-label>
              <q-item-label caption>{{ formatDate(incident.declared_at) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="getSeverityColor(incident.incident_severity)"
                :label="incident.incident_severity"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Upcoming Exercise Tests -->
    <q-card class="q-mb-lg" flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Upcoming Tests</div>
          <q-btn
            flat
            color="primary"
            label="View All"
            @click="$router.push('/bcm/exercise-tests')"
          />
        </div>
        <div v-if="upcomingTests.length === 0" class="text-center q-py-md text-grey-7">
          No upcoming tests scheduled
        </div>
        <q-list v-else separator>
          <q-item v-for="test in upcomingTests" :key="test.uuid" clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="playlist_add_check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >{{ test.exercise_test_type }} -
                {{ test.business_continuity_plan?.critical_function?.name }}</q-item-label
              >
              <q-item-label caption>{{ formatDate(test.date) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :label="daysUntil(test.date) + ' days'" color="orange" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Pending Workflows -->
    <q-card flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Pending Workflows</div>
          <q-btn flat color="primary" label="View All" @click="$router.push('/workflows')" />
        </div>
        <div v-if="pendingWorkflows.length === 0" class="text-center q-py-md text-grey-7">
          No pending workflows
        </div>
        <q-list v-else separator>
          <q-item
            v-for="workflow in pendingWorkflows"
            :key="workflow.uuid"
            clickable
            v-ripple
            @click="$router.push(`/workflows/${workflow.uuid}`)"
          >
            <q-item-section avatar>
              <q-icon name="account_tree" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ workflow.title }}</q-item-label>
              <q-item-label caption
                >{{ workflow.workflow_state }} | Due:
                {{ formatDate(workflow.due_date) }}</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="getPriorityColor(workflow.priority)"
                :label="'P' + workflow.priority"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import { DashboardService } from '../../services/api/DashboardService'
import { formatDate } from '../../utils/formatters'

const authStore = useAuthStore()
const isRefreshing = ref(false)

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'User')
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

const kpis = reactive({
  activeBCPs: 0,
  activeIncidents: 0,
  highRisks: 0,
  pendingApprovals: 0,
})

const complianceData = ref([
  { label: 'ISO 22301', percentage: 75, color: 'green' },
  { label: 'NIST', percentage: 60, color: 'orange' },
  { label: 'FFIEC', percentage: 90, color: 'blue' },
])

const maturityLevel = ref(3)
const maturityLabel = computed(() => {
  const labels = ['Initial', 'Repeatable', 'Defined', 'Managed', 'Optimizing']
  return labels[maturityLevel.value - 1] || 'Unknown'
})

const recentIncidents = ref<any[]>([])
const upcomingTests = ref<any[]>([])
const pendingWorkflows = ref<any[]>([])

onMounted(() => loadDashboard())

async function loadDashboard(): Promise<void> {
  try {
    const [kpiData, incidents, tests, workflows] = await Promise.all([
      DashboardService.getKPIs(),
      DashboardService.getRecentIncidents(),
      DashboardService.getUpcomingTests(),
      DashboardService.getPendingWorkflows(),
    ])

    Object.assign(kpis, kpiData.data)
    recentIncidents.value = incidents.data || []
    upcomingTests.value = tests.data || []
    pendingWorkflows.value = workflows.data || []
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

async function refreshDashboard(): Promise<void> {
  isRefreshing.value = true
  await loadDashboard()
  isRefreshing.value = false
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'green',
    Informational: 'blue',
  }
  return colors[severity] || 'grey'
}

function getIncidentIcon(severity: string): string {
  const icons: Record<string, string> = {
    Critical: 'error',
    High: 'warning',
    Medium: 'info',
    Low: 'notifications',
    Informational: 'info',
  }
  return icons[severity] || 'help'
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'blue',
    5: 'grey',
  }
  return colors[priority] || 'grey'
}

function daysUntil(date: string): number {
  if (!date) return 0
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
</script>

<style lang="scss" scoped>
.kpi-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
  }
}

.text-white-30 {
  opacity: 0.3;
}

.text-white-70 {
  opacity: 0.7;
}
</style>
