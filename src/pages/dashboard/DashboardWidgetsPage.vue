<template>
  <q-page padding>
    <PageHeader
      title="Dashboard Widgets"
      subtitle="Customize your dashboard view"
      show-refresh
      :refreshing="refreshing"
      @refresh="refreshWidgets"
    />

    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Active Widgets</div>
        <q-list separator>
          <q-item v-for="widget in widgets" :key="widget.id">
            <q-item-section avatar>
              <q-icon
                :name="widget.icon"
                :color="widget.enabled ? 'primary' : 'grey'"
                size="24px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ widget.title }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ widget.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="widget.enabled"
                color="primary"
                @update:model-value="(val) => toggleWidget(widget.id, val)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Reset to Defaults" @click="resetWidgets" />
        <q-btn flat color="positive" label="Save Layout" @click="saveLayout" />
      </q-card-actions>
    </q-card>

    <div class="row q-col-gutter-md">
      <template v-for="widget in enabledWidgets" :key="widget.id">
        <div :class="widget.size === 'full' ? 'col-12' : 'col-12 col-md-6'">
          <component :is="widget.component" v-bind="getWidgetProps(widget)" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDashboardStore } from 'src/stores/dashboard/dashboard.store'
import PageHeader from 'src/components/.common/PageHeader.vue'
import KpiOverview from 'src/components/dashboard/KpiOverview.vue'
import RiskHeatMap from 'src/components/dashboard/RiskHeatMap.vue'
import ComplianceChart from 'src/components/dashboard/ComplianceChart.vue'
import IncidentTrendChart from 'src/components/dashboard/IncidentTrendChart.vue'
import MaturityGauge from 'src/components/dashboard/MaturityGauge.vue'
import PendingWorkflowsWidget from 'src/components/dashboard/PendingWorkflowsWidget.vue'
import RecentActivityList from 'src/components/dashboard/RecentActivityList.vue'

interface Widget {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
  size: 'half' | 'full'
  component: any
  props?: Record<string, any>
}

const $q = useQuasar()
const dashboardStore = useDashboardStore()
const refreshing = ref(false)

const defaultWidgets: Widget[] = [
  {
    id: 'kpis',
    title: 'KPI Overview',
    description: 'Key performance indicators at a glance',
    icon: 'dashboard',
    enabled: true,
    size: 'full',
    component: KpiOverview,
    props: { kpis: [] },
  },
  {
    id: 'risk-heatmap',
    title: 'Risk Heat Map',
    description: 'Visual representation of risk distribution',
    icon: 'grid_view',
    enabled: true,
    size: 'half',
    component: RiskHeatMap,
    props: { risks: [] },
  },
  {
    id: 'compliance',
    title: 'Compliance Status',
    description: 'Compliance standards overview',
    icon: 'verified',
    enabled: true,
    size: 'half',
    component: ComplianceChart,
    props: { data: [] },
  },
  {
    id: 'incident-trends',
    title: 'Incident Trends',
    description: 'Incident frequency and severity trends',
    icon: 'trending_up',
    enabled: true,
    size: 'half',
    component: IncidentTrendChart,
    props: { data: [] },
  },
  {
    id: 'maturity',
    title: 'BCM Maturity',
    description: 'Maturity level assessment',
    icon: 'stars',
    enabled: true,
    size: 'half',
    component: MaturityGauge,
  },
  {
    id: 'pending-workflows',
    title: 'Pending Workflows',
    description: 'Workflows awaiting action',
    icon: 'account_tree',
    enabled: true,
    size: 'half',
    component: PendingWorkflowsWidget,
    props: { workflows: [] },
  },
  {
    id: 'recent-incidents',
    title: 'Recent Incidents',
    description: 'Latest reported incidents',
    icon: 'report',
    enabled: true,
    size: 'half',
    component: RecentActivityList,
    props: { title: 'Recent Incidents', type: 'incident', items: [] },
  },
]

const widgets = ref<Widget[]>([...defaultWidgets])
const enabledWidgets = computed(() => widgets.value.filter((w) => w.enabled))

function getWidgetProps(widget: Widget): Record<string, any> {
  const baseProps: Record<string, any> = { loading: dashboardStore.isLoading }

  switch (widget.id) {
    case 'kpis':
      return { ...baseProps, kpis: [] }
    case 'risk-heatmap':
      return { ...baseProps, risks: [] }
    case 'compliance':
      return { ...baseProps, data: dashboardStore.complianceOverview }
    case 'incident-trends':
      return { ...baseProps, incidents: dashboardStore.riskTrends }
    case 'maturity':
      return { ...baseProps, score: dashboardStore.kpis.maturityScore }
    case 'pending-workflows':
      return { ...baseProps, workflows: dashboardStore.pendingWorkflows }
    case 'recent-incidents':
      return {
        ...baseProps,
        title: 'Recent Incidents',
        type: 'incident',
        items: dashboardStore.recentIncidents,
        viewAllRoute: '/incidents',
      }
    default:
      return baseProps
  }
}

function loadLayout(): void {
  try {
    const saved = localStorage.getItem('dashboard_widgets')
    if (saved) {
      const parsed = JSON.parse(saved)
      widgets.value = defaultWidgets.map((widget) => ({
        ...widget,
        enabled: parsed[widget.id] !== undefined ? parsed[widget.id] : widget.enabled,
      }))
    }
  } catch (e) {
    console.error('Failed to load widget layout:', e)
  }
}

function saveLayout(): void {
  try {
    const layout: Record<string, boolean> = {}
    widgets.value.forEach((widget) => {
      layout[widget.id] = widget.enabled
    })
    localStorage.setItem('dashboard_widgets', JSON.stringify(layout))
    $q.notify({ type: 'positive', message: 'Layout saved successfully', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Failed to save layout', position: 'top' })
  }
}

function toggleWidget(id: string, enabled: boolean): void {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.enabled = enabled
    $q.notify({
      type: 'info',
      message: `${enabled ? 'Added' : 'Removed'} ${widget.title} widget`,
      position: 'top',
      timeout: 1500,
    })
  }
}

function resetWidgets(): void {
  widgets.value = defaultWidgets.map((w) => ({ ...w }))
  $q.notify({ type: 'info', message: 'Widget layout reset to defaults', position: 'top' })
}

async function refreshWidgets(): Promise<void> {
  refreshing.value = true
  try {
    await dashboardStore.refresh()
    $q.notify({ type: 'positive', message: 'Widgets refreshed', position: 'top' })
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadLayout()
})
</script>